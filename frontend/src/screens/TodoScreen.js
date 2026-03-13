import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodos, addTodo, updateTodo, deleteTodo } from '../api/api';

export default function TodoScreen({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [text, setText]   = useState('');

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const res = await getTodos();
      setTodos(res.data);
    } catch {
      Alert.alert('Eroare', 'Nu s-au putut încărca task-urile');
    }
  };

  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      const res = await addTodo(text.trim());
      setTodos([res.data, ...todos]);
      setText('');
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut adăuga');
    }
  };

  const handleToggle = async (todo) => {
    try {
      const res = await updateTodo(todo._id, !todo.completed);
      setTodos(todos.map(t => t._id === todo._id ? res.data : t));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
    } catch {}
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Task-urile mele</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Ieșire</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Task nou..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity style={styles.todoLeft} onPress={() => handleToggle(item)}>
              <Text style={styles.checkbox}>{item.completed ? '✅' : '⬜'}</Text>
              <Text style={[styles.todoText, item.completed && styles.done]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Niciun task încă. Adaugă primul! 🚀</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0f0f0f', padding: 20, paddingTop: 60 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:      { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  logout:     { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  inputRow:   { flexDirection: 'row', marginBottom: 20, gap: 10 },
  input:      { flex: 1, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 12,
                padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#333' },
  addBtn:     { backgroundColor: '#6C63FF', borderRadius: 12, width: 50,
                alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  todoItem:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, marginBottom: 10 },
  todoLeft:   { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox:   { fontSize: 20, marginRight: 12 },
  todoText:   { color: '#fff', fontSize: 15, flex: 1 },
  done:       { textDecorationLine: 'line-through', color: '#666' },
  deleteBtn:  { fontSize: 20 },
  empty:      { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
});