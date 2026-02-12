import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Footer, PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing token. Use the link from your email.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      toast.success('Password updated successfully! Redirecting to login...');

      window.setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password. Try again.');
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
            <p className="text-primary uppercase font-semibold tracking-wider">Set New Password</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Create a new password</h1>
            <p className="text-gray-600 mt-4">Choose a strong password with at least 8 characters.</p>
          </div>

          <div className="bg-white shadow-2xl rounded-xl p-10 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-2">Update Password</h2>
            <p className="text-sm text-gray-600 mb-6">Enter and confirm your new password.</p>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500">Minimum 8 characters.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type your new password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="p-4 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save New Password'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/login" className="text-primary font-semibold">
                Back to Login
              </Link>
              <Link to="/forgot-password" className="text-gray-600 hover:text-primary transition">
                Resend reset link
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



