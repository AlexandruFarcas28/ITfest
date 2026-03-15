import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredUser = {
  id: string;
  nume: string;
  email: string;
};

type StoredSession = {
  token: string;
  user: StoredUser;
};

const listeners = new Set<() => void>();

export function isJwtToken(token: string | null | undefined) {
  if (!token) return false;
  return token.split('.').length === 3;
}

export async function saveSession(session: StoredSession) {
  await AsyncStorage.setItem('token', session.token);
  await AsyncStorage.setItem('user', JSON.stringify(session.user));
}

export async function clearSession() {
  await Promise.all([AsyncStorage.removeItem('token'), AsyncStorage.removeItem('user')]);
}

export async function invalidateSession() {
  await clearSession();
  listeners.forEach((listener) => listener());
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const [token, storedUser] = await Promise.all([
    AsyncStorage.getItem('token'),
    AsyncStorage.getItem('user'),
  ]);

  if (!token || !storedUser || !isJwtToken(token)) {
    await clearSession();
    return null;
  }

  try {
    const user = JSON.parse(storedUser) as StoredUser;
    if (!user?.id || !user?.email) {
      await clearSession();
      return null;
    }

    return { token, user };
  } catch {
    await clearSession();
    return null;
  }
}

export function subscribeToSessionInvalidation(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
