import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer, PrimaryNav, TopBar } from '../components/LayoutPieces';
import { api } from '../utils/api';
import { clearAuth } from '../utils/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    clearAuth();

    try {
      await api.auth.register(name.trim(), email.trim().toLowerCase(), password);
      setMessage({ text: 'Account created. Redirecting...', type: 'success' });

      window.setTimeout(() => {
        navigate('/login'); // change this if you want a different landing page
      }, 500);
    } catch (err: any) {
      setMessage({
        text: err?.message || 'Signup failed. Please check your details.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-800">
      <TopBar />
      <PrimaryNav variant="public" />

      <section className="pt-32 pb-20 bg-[#f5f8ff]">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slideInLeft">
            <p className="text-primary uppercase font-semibold tracking-wider">Join EduLearn</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Create Your Learning Account</h1>
            <p className="text-gray-600 mt-4">Create an account to start using the platform.</p>
          </div>

          <div className="bg-white shadow-2xl rounded-xl p-10 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500">Must be unique and lowercase (e.g. name@example.com).</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500">Minimum 8 characters.</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-primary" />
                <span>I agree to the Terms and Privacy Policy</span>
              </div>

              <button
                className="bg-primary text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            {message ? (
              <p className={`text-sm mt-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
            ) : null}

            <p className="text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
