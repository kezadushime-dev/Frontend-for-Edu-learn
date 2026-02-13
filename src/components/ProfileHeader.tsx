import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../shared/utils/api';
import { clearAuth, getToken, getUser, type AuthUser } from '../features/auth/utils/auth.storage';
import { useToast } from '../shared/hooks/useToast';

type EditForm = {
  name: string;
  email: string;
  image: string;
};

const dashboardByRole: Record<string, string> = {
  admin: '/dashboard-admin',
  instructor: '/dashboard-manager',
  learner: '/dashboard-learner'
};

export default function ProfileHeader() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<EditForm>({
    name: getUser()?.name || '',
    email: getUser()?.email || '',
    image: getUser()?.image || ''
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.auth
      .me()
      .then((freshUser) => {
        if (!active) return;
        setUser(freshUser as AuthUser | null);
      })
      .catch(() => {
        // Keep cached profile if refresh fails.
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      image: user?.image || ''
    });
  }, [user?.email, user?.image, user?.name]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      const first = parts[0]?.[0] || '';
      const second = parts[1]?.[0] || '';
      return (first + second).toUpperCase() || 'U';
    }
    const emailInitial = user?.email?.trim()?.[0];
    return emailInitial ? emailInitial.toUpperCase() : 'U';
  }, [user?.name, user?.email]);

  if (!token) return null;

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Logout still proceeds locally even when backend logout fails.
    } finally {
      clearAuth();
      setIsOpen(false);
      setIsEditing(false);
      toast.success('Logged out.');
      navigate('/login', { replace: true });
    }
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        image: form.image.trim() || undefined
      };
      const updated = await api.auth.updateMe(payload);
      setUser((updated as AuthUser | null) || user);
      setIsEditing(false);
      toast.success('Profile updated.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Delete your account permanently? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await api.auth.deleteAccount();
      toast.success('Account deleted.');
      navigate('/signup', { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete account.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const roleRoute = dashboardByRole[user?.role || 'learner'] || '/dashboard-learner';

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/90 px-2 py-1.5 hover:border-primary transition"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || 'Profile'}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
        )}
        <div className="hidden sm:block text-left text-sm leading-tight">
          <p className="max-w-32 truncate font-semibold text-gray-900">{user?.name || 'Signed In'}</p>
          <p className="max-w-32 truncate text-gray-500">{user?.email || ''}</p>
        </div>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] rounded-xl border border-gray-200 bg-white shadow-2xl p-4 z-50">
          <div className="pb-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900">{user?.name || 'Learner'}</p>
            <p className="text-sm text-gray-500">{user?.email || ''}</p>
            <button
              onClick={() => navigate(roleRoute)}
              className="mt-2 text-xs text-primary font-semibold hover:underline"
            >
              Go to dashboard
            </button>
          </div>

          <div className="pt-3 space-y-3">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="w-full text-left text-sm border border-gray-200 rounded-lg px-3 py-2 hover:border-primary transition"
            >
              {isEditing ? 'Close Profile Editor' : 'Edit Profile'}
            </button>

            {isEditing ? (
              <form className="space-y-2" onSubmit={handleSaveProfile}>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  value={form.image}
                  onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                  placeholder="Profile image URL (optional)"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : null}

            <button
              onClick={handleLogout}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:border-primary transition"
            >
              Logout
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
