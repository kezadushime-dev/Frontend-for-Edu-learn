import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer, PrimaryNav, TopBar } from '../components/LayoutPieces';
import { api } from '../utils/api';
import { clearAuth } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
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
      const user = await api.auth.login(email.trim().toLowerCase(), password);
      setMessage({ text: 'Login successful. Redirecting...', type: 'success' });
      const role = user.role || 'learner';
      const redirect =
        role === 'admin' ? '/dashboard-admin' : role === 'instructor' ? '/dashboard-instructor' : '/dashboard-learner';
      window.setTimeout(() => {
        navigate(redirect);
      }, 500);
    } catch (err: any) {
      setMessage({
        text: err?.message || 'Login failed. Please check your credentials.',
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
            <p className="text-primary uppercase font-semibold tracking-wider">Welcome</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Login to Continue Learning</h1>
            <p className="text-gray-600 mt-4">Access lessons, track progress, and complete quizzes with your account.</p>
          </div>

          <div className="bg-white shadow-2xl rounded-xl p-10 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-2">Login</h2>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-primary font-semibold">
                  Forgot password?
                </Link>
              </div>

              <button
                className="bg-primary text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            {message ? (
              <p className={`text-sm mt-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
            ) : null}

            <p className="text-sm text-gray-600 mt-6">
              No account?{' '}
              <Link to="/signup" className="text-primary font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
