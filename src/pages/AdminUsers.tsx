import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminTable } from '../components/AdminTable';

import { api } from '../utils/api';

const roleOptions = ['learner', 'instructor', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.admin.users();
        if (!mounted) return;
        setUsers(res.data.users || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load users.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateRole = async (id: string, role: string) => {
    setSaving(id);
    try {
      const res = await api.admin.updateRole(id, role);
      setUsers((prev) => prev.map((user) => (user._id === id ? res.data.user : user)));
    } catch (err: any) {
      setError(err?.message || 'Failed to update role.');
    } finally {
      setSaving('');
    }
  };

  const deleteUser = async (id: string) => {
    setSaving(id);
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user.');
    } finally {
      setSaving('');
    }
  };

  const rows = users.map((user) => ({
    ...user,
    _id: user._id || user.id,
    isActive: user.isActive ?? true
  }));

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin' },
          { label: 'Users', to: '/admin-users', className: 'text-primary font-semibold' },
          { label: 'Lessons', to: '/admin-lessons' },
          { label: 'Quizzes', to: '/admin-quizzes' },
          { label: 'Attempts', to: '/admin-quiz-attempts' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', active: true },
            { label: 'Manage Lessons', to: '/admin-lessons' },
            { label: 'Manage Quizzes', to: '/admin-quizzes' },
            { label: 'Quiz Attempts', to: '/admin-quiz-attempts' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/admin/users</p>
              <h1 className="text-3xl font-extrabold">Users</h1>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md font-semibold">Create User</button>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <AdminTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'isActive', label: 'Active' }
              ]}
              rows={rows}
              renderActions={(row) => {
                const id = String(row._id || row.id || '');
                const role = String(row.role || 'learner');
                return (
                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/admin/users/${id}`}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      View
                    </Link>
                    <select
                      className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                      value={role}
                      onChange={(event) => updateRole(id, event.target.value)}
                      disabled={saving === id}
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-red-600 font-semibold text-sm"
                      onClick={() => deleteUser(id)}
                      disabled={saving === id}
                    >
                      {saving === id ? 'Working...' : 'Delete'}
                    </button>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
