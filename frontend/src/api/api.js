import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.32.148.235:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register   = (data)            => api.post('/auth/register', data);
export const login      = (data)            => api.post('/auth/login', data);
export const getTodos   = ()                => api.get('/todos');
export const addTodo    = (title)           => api.post('/todos', { title });
export const updateTodo = (id, completed)   => api.put(`/todos/${id}`, { completed });
export const deleteTodo = (id)              => api.delete(`/todos/${id}`);