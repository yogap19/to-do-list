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
import { db } from '../lib/firebase';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline: string; // Format: "YYYY-MM-DDTHH:mm"
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>(
    {}
  );

  // Fetch tasks from Firestore
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

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      tasks.forEach((task) => {
        const timeLeft = calculateTimeRemaining(task.deadline);
        newTimeRemaining[task.id] = timeLeft;
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Function to calculate time remaining
  const calculateTimeRemaining = (deadline: string): string => {
    const deadlineTime = new Date(deadline).getTime();
    const now = new Date().getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) return 'Waktu habis!';

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${hours}j ${minutes}m ${seconds}d`;
  };

  // Add Task with Deadline
  const addTask = async (): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambahkan tugas baru',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nama tugas">' +
        '<input id="swal-input2" type="datetime-local" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement)?.value,
          (document.getElementById('swal-input2') as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const newTask: Omit<Task, 'id'> = {
        text: formValues[0],
        completed: false,
        deadline: formValues[1],
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);

      Swal.fire({
        title: 'Berhasil!',
        text: 'Tugas berhasil ditambahkan',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    }
  };

  // Toggle Task Completion
  const toggleTask = (id: string): void => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete Task from Firestore
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
              className={`flex flex-col justify-between p-2 border-b rounded-lg ${
                calculateTimeRemaining(task.deadline) === 'Waktu habis!'
                  ? task.completed
                    ? 'bg-emerald-200'
                    : 'bg-red-200'
                  : calculateTimeRemaining(task.deadline).includes('0j')
                  ? 'bg-yellow-200'
                  : 'bg-green-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  onClick={() => toggleTask(task.id)}
                  className={`cursor-pointer transition transition-500 ${
                    task.completed
                      ? ' text-slate-700 font-semibold'
                      : 'font-semibold text-slate-700'
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white p-1 rounded bg-red-600 hover:bg-red-800"
                >
                  Hapus
                </button>
              </div>
              <p className="text-sm text-gray-700">
                Deadline: {new Date(task.deadline).toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-700">
                ⏳ {timeRemaining[task.id] || 'Menghitung...'}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
