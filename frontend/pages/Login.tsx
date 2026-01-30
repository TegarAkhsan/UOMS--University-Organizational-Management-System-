
import React, { useState } from 'react';
import { AUTH_USERS, STAFF_MAPPING } from '../data/mockData';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import client from '../src/api/client';

export const Login = ({ onLogin, onBack }: { onLogin: (user: any) => void, onBack?: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        const response = await client.post('/login', { email, password });
        const { access_token, user } = response.data;
        const token = access_token; // Map backend's access_token to our local variable

        localStorage.setItem('auth_token', token);
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        onLogin(user);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } else {
      // Mock Sign Up
      alert('Registration successful! Please contact administrator for role assignment. Logging in as Staff for demo.');
      onLogin({ email, role: 'Staff', status: 'staff', name: 'New User' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 relative">
      {onBack && (
        <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </button>
      )}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl font-bold text-blue-600">U</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UOMS</h1>
          <p className="text-blue-100">University Organization Management System</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
              <ArrowRight size={20} className="ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-600 font-bold ml-1 hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Use staff[name]@himaforticunesa.com to login as staff.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
