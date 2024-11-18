import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import axios from 'axios';
import { USER_BACKEND_URL } from '../config/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${USER_BACKEND_URL}/api/v1/user/signup`, {
        name: username,
        email: email,
        password: password
      }, {
        withCredentials: true
      });
      navigate('/SFU')
    } catch (error) {
      toast.error(`Error signing up: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-neue-helvetica relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="relative z-10">
        <Navbar />  
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    className="w-full bg-gray-700 text-white rounded-full py-2 px-4 pl-10"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    className="w-full bg-gray-700 text-white rounded-full py-2 px-4 pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    className="w-full bg-gray-700 text-white rounded-full py-2 px-4 pl-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Sign Up
              </button>
            </form>
            <p className="mt-4 text-center text-gray-400">
              Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
            </p>
          </div>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
