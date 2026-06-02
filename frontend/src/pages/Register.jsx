import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register({ setUser }) {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      const res = await api.post('/auth/login', { email: data.email, password: data.password });
      setUser(res.data.user);
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Join TaskFlow</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('name')} type="text" placeholder="Name" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 bg-gray-700 rounded text-white" />
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-3 bg-gray-700 rounded text-white" />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition">Register</button>
        </form>
        <p className="mt-4 text-center text-gray-400">Already have an account? <Link to="/login" className="text-blue-400">Login</Link></p>
      </div>
    </div>
  );
}
