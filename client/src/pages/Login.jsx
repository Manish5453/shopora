import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    try {
      const { data } = await API.post(endpoint, formData);
      
      // Save User Data & JWT Token in LocalStorage
      localStorage.setItem('userInfo', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      }));

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
      
      window.location.reload(); // Refresh to update navbar state
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          {isRegister ? <UserPlus className="h-7 w-7 text-emerald-600" /> : <LogIn className="h-7 w-7 text-emerald-600" />}
          <h1 className="text-2xl font-bold">{isRegister ? 'Create Account' : 'Account Login'}</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
                className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
              className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
              className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg cursor-pointer">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-emerald-600 font-semibold underline cursor-pointer"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}