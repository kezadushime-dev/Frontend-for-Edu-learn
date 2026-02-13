import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../../../core/layout/LayoutPieces';
import { api } from '../../../shared/utils/api';
import { getUser, setUser, type AuthUser } from '../utils/auth.storage';

const dashboardPathByRole: Record<string, string> = {
  admin: '/dashboard-admin',
  instructor: '/dashboard-manager',
  learner: '/dashboard-learner'
};

export default function ProfileSettingsPage() {
  const [user, setLocalUser] = useState<AuthUser | null>(() => getUser());
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    api.auth
      .me()
      .then((freshUser) => {
        if (!active) return;
        const typedUser = freshUser as AuthUser;
        setLocalUser(typedUser);
        setName(typedUser.name || '');
        setEmail(typedUser.email || '');
      })
      .catch(() => {
        // Fallback to cached user when request fails.
      });

    return () => {
      active = false;
    };
  }, []);

  const backTo = useMemo(() => {
    const role = user?.role || '';
    return dashboardPathByRole[role] || '/home';
  }, [user?.role]);

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage(null);

    try {
      const response = await api.auth.updateMe({ name: name.trim(), email: email.trim() });
      const updatedUser = (response as any)?.data?.user || (response as any)?.user || response;

      if (updatedUser && typeof updatedUser === 'object') {
        const mergedUser = { ...(user || {}), ...(updatedUser as AuthUser) };
        setUser(mergedUser);
        setLocalUser(mergedUser);
      }

      setMessage({ type: 'success', text: 'Profile settings updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update profile settings.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      setSavingPassword(false);
      return;
    }

    try {
      await api.auth.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
      <TopBar />

      <section className="pb-14 pt-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Account</p>
                <h1 className="mt-1 text-3xl font-black text-slate-800">Profile Settings</h1>
                <p className="mt-2 text-sm text-slate-600">Update your account details and password.</p>
              </div>
              <Link to={backTo} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                Back to Dashboard
              </Link>
            </div>

            {message ? (
              <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {message.text}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleProfileSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Profile Details</h2>
                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'N/A'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                      disabled
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>

              <form onSubmit={handlePasswordSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
