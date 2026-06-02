import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Login({ setUser }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.user);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-3 bg-gray-700 rounded text-white" />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition">Login</button>
        </form>
        <p className="mt-4 text-center text-gray-400">Don't have an account? <Link to="/register" className="text-blue-400">Register</Link></p>
      </div>
    </div>
  );
}
