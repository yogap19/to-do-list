'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase'; // Import Firebase Firestore

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Ambil data dari Firestore saat komponen dimuat
  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    };

    fetchTasks();
  }, []);

  // Tambah tugas ke Firestore
  const addTask = async (): Promise<void> => {
    const { value: newTask } = await Swal.fire({
      title: 'Tambahkan tugas baru',
      input: 'text',
      inputPlaceholder: 'Masukkan tugas...',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
    });

    if (newTask && newTask.trim() !== '') {
      const docRef = await addDoc(collection(db, 'tasks'), {
        text: newTask,
        completed: false,
      });

      setTasks([...tasks, { id: docRef.id, text: newTask, completed: false }]);

      Swal.fire({
        title: 'Berhasil!',
        text: 'Tugas berhasil ditambahkan',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    }
  };

  // Toggle status tugas (selesai / belum selesai)
  const toggleTask = (id: string): void => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Hapus tugas dari Firestore
  const deleteTask = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl text-emerald-500 font-bold mb-4">To-Do List</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={addTask}
          className="bg-slate-500 text-white px-4 py-2 rounded"
        >
          Tambah Tugas
        </button>
      </div>
      <ul>
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center p-2 border-b"
            >
              <span
                onClick={() => toggleTask(task.id)}
                className={`cursor-pointer transition transition-500 ${
                  task.completed
                    ? 'line-through text-emerald-500 font-semibold'
                    : 'font-semibold text-slate-700'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Hapus
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
