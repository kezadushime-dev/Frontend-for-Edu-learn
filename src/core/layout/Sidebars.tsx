import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../shared/utils/api';
import { getToken, getUser, setUser, type AuthUser } from '../../features/auth/utils/auth.storage';

type SidebarLink = {
  label: string;
  to?: string;
  active?: boolean;
};

type SidebarProps = {
  title: string;
  links: SidebarLink[];
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

export function Sidebar({ title, links }: SidebarProps) {
  const navigate = useNavigate();
  const token = getToken();
  const [user, setLocalUser] = useState<AuthUser | null>(() => getUser());
  const [loadingProfile, setLoadingProfile] = useState(Boolean(token));
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(user?.image || '');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setImage(user?.image || '');
  }, [user?.name, user?.email, user?.image]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoadingProfile(true);

    api.auth
      .me()
      .then((freshUser) => {
        if (!active) return;
        const typed = (freshUser || null) as AuthUser | null;
        if (typed) {
          setUser(typed);
          setLocalUser(typed);
        }
      })
      .catch(() => {
        // Keep cached profile when refresh fails.
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

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

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      event.target.value = '';
      return;
    }

    try {
      setProcessing(true);
      const encodedImage = await readFileAsDataUrl(file);
      setImage(encodedImage);
      setMessage({ type: 'success', text: 'Image selected. Save profile to apply it.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to process image.' });
    } finally {
      setProcessing(false);
      event.target.value = '';
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = { name: name.trim(), email: email.trim(), image };

    try {
      const updated = (await api.auth.updateMe(payload)) as AuthUser | null;
      const nextUser = updated && typeof updated === 'object'
        ? ({ ...(user || {}), ...updated } as AuthUser)
        : ({ ...(user || {}), ...payload } as AuthUser);

      setUser(nextUser);
      setLocalUser(nextUser);
      setMessage({ type: 'success', text: 'Profile updated.' });
      setEditOpen(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setProcessing(true);
    setMessage(null);
    try {
      await api.auth.logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to log out.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently? This cannot be undone.');
    if (!confirmed) return;

    setProcessing(true);
    setMessage(null);
    try {
      await api.auth.deleteAccount();
      navigate('/signup', { replace: true });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to delete account.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.5)] lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">{title}</p>
      <nav className="mt-3 grid gap-1.5 text-sm">
        {links.map((link) => {
          const baseClass = 'flex items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-colors';
          const className = link.active
            ? `${baseClass} bg-blue-600 text-white shadow-sm`
            : `${baseClass} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

          if (!link.to) {
            return (
              <span key={link.label} className={className}>
                <span>{link.label}</span>
                {link.active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
              </span>
            );
          }

          return (
            <Link key={link.label} to={link.to} className={className}>
              <span>{link.label}</span>
              {link.active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
            </Link>
          );
        })}
      </nav>

      {token ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {loadingProfile ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">EDU LEARN</p>
              <div className="mx-auto mt-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="mt-2 text-xs text-slate-500">Loading profile...</p>
            </div>
          ) : null}

          {!loadingProfile ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-100"
              >
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'Profile'} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{initials}</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">{user?.name || 'Profile'}</span>
                  <span className="block truncate text-xs text-slate-500">{user?.email || 'No email available'}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">{menuOpen ? 'Hide' : 'Open'}</span>
              </button>

              {menuOpen ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen((previous) => !previous)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={processing}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={processing}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                    >
                      Log Out
                    </button>
                  </div>

                  {editOpen ? (
                    <form onSubmit={handleSaveProfile} className="mt-3 grid gap-2.5">
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Name
                        <input
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Email
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        Profile Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
                        />
                      </label>

                      {image ? (
                        <img src={image} alt="Preview" className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
                      ) : null}

                      <button
                        type="submit"
                        disabled={saving || processing}
                        className="mt-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </form>
                  ) : null}

                  {message ? (
                    <p className={`mt-3 rounded-lg px-2.5 py-2 text-xs font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {message.text}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
