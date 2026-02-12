import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer, PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email.trim().toLowerCase());
      toast.success('Reset link sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset link.');
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
            <p className="text-primary uppercase font-semibold tracking-wider">Account Recovery</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Forgot your password?</h1>
            <p className="text-gray-600 mt-4">Enter your email and we’ll send you a reset link to create a new password.</p>
            <div className="mt-6 text-sm text-gray-600"></div>
          </div>

          <div className="bg-white shadow-2xl rounded-xl p-10 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-sm text-gray-600 mb-6">We’ll email you instructions.</p>

            <form className="grid gap-4" onSubmit={handleSubmit}>
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
                <p className="text-xs text-gray-500">Use the email you registered with.</p>
              </div>

              <button
                className="bg-primary text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/login" className="text-primary font-semibold">
                Back to Login
              </Link>
              <Link to="/signup" className="text-gray-600 hover:text-primary transition">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


