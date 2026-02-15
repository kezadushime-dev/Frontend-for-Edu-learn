import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '../../../core/layout/LayoutPieces';
import { api } from '../../../shared/utils/api';
import { getUser, setUser, type AuthUser } from '../utils/auth.storage';

const dashboardPathByRole: Record<string, string> = {
  admin: '/dashboard-admin',
  instructor: '/dashboard-manager',
  learner: '/dashboard-learner'
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [user, setLocalUser] = useState<AuthUser | null>(() => getUser());
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(user?.image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editing, setEditing] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingProfile(true);

    api.auth
      .me()
      .then((freshUser) => {
        if (!active) return;
        const typedUser = freshUser as AuthUser;
        setLocalUser(typedUser);
        setName(typedUser.name || '');
        setEmail(typedUser.email || '');
        setImage(typedUser.image || '');
      })
      .catch(() => {
        // Fallback to cached user when request fails.
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    const fromName = (user?.name || '').trim();
    if (fromName) {
      const words = fromName.split(' ').filter(Boolean);
      const first = words[0]?.[0] || '';
      const second = words[1]?.[0] || '';
      return (first + second).toUpperCase() || 'U';
    }
    const fromEmail = (user?.email || '').trim();
    return fromEmail ? fromEmail[0].toUpperCase() : 'U';
  }, [user?.name, user?.email]);

  const backTo = useMemo(() => {
    const role = user?.role || '';
    return dashboardPathByRole[role] || '/home';
  }, [user?.role]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      event.target.value = '';
      return;
    }

    try {
      setProcessingAction(true);
      const encodedImage = await readFileAsDataUrl(file);
      setImage(encodedImage);
      setMessage({ type: 'success', text: 'Profile image selected. Save profile to apply it.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to process image.' });
    } finally {
      setProcessingAction(false);
      event.target.value = '';
    }
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage(null);

    try {
      const payload = { name: name.trim(), email: email.trim(), image };
      const updatedUser = (await api.auth.updateMe(payload)) as AuthUser | null;
      const mergedUser = { ...(user || {}), ...(updatedUser || payload) } as AuthUser;
      setUser(mergedUser);
      setLocalUser(mergedUser);
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

  const handleLogout = async () => {
    setProcessingAction(true);
    setMessage(null);
    try {
      await api.auth.logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to log out.' });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently? This action cannot be undone.');
    if (!confirmed) return;

    setProcessingAction(true);
    setMessage(null);
    try {
      await api.auth.deleteAccount();
      navigate('/signup', { replace: true });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to delete account.' });
    } finally {
      setProcessingAction(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    setMessage(null);
  };

  const cancelEditing = () => {
    setEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setImage(user?.image || '');
    setMessage(null);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
        <TopBar />
        <section className="grid min-h-[calc(100vh-40px)] place-items-center pt-16">
          <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">EDU LEARN</p>
            <h2 className="mt-2 text-2xl font-black text-slate-800">Loading Profile</h2>
            <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-3 text-sm text-slate-500">Please wait while we prepare your settings.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
      <TopBar />

      <section className="pb-14 pt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Account</p>
                <h1 className="mt-1 text-3xl font-black text-slate-800">Profile Settings</h1>
                <p className="mt-2 text-sm text-slate-600">Manage profile details, image, password, and account actions.</p>
              </div>
              <Link to={backTo} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                Back to Dashboard
              </Link>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {image ? (
                  <img src={image} alt={user?.name || 'Profile'} className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{initials}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-800">{user?.name || 'Profile User'}</p>
                  <p className="truncate text-sm text-slate-500">{user?.email || 'No email available'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={editing ? cancelEditing : startEditing}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      editing
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {editing ? 'Cancel Edit' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={processingAction}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={processingAction}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>

            {message ? (
              <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {message.text}
              </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <form onSubmit={handleProfileSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Profile Details</h2>
                <p className="mt-1 text-xs text-slate-500">Keep your account information up to date.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={!editing || processingAction}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'N/A'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={!editing || savingProfile || processingAction}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                  {editing ? (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
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
                  disabled={savingPassword || processingAction}
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
