import { useEffect, useState } from 'react';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { AdminTable } from '../../../components/AdminTable';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

const roleOptions = ['learner', 'instructor', 'admin'];

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'learner', isActive: true });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const deleteUser = async (id: string) => {
    setSaving(id);
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success('User deleted.');
    } catch (err: any) {
      const message = err?.message || 'Failed to delete user.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving('');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await api.admin.createUser(formData);
      setUsers([...users, (newUser as any).data.user]);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'learner' });
      toast.success('User created.');
    } catch (err: any) {
      const message = err?.message || 'Failed to create user.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      name: String(user.name || ''),
      email: String(user.email || ''),
      role: String(user.role || 'learner'),
      isActive: Boolean(user.isActive ?? true)
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = String(selectedUser?._id || selectedUser?.id || '');
    if (!id) return;

    setUpdating(true);
    try {
      const res = await api.admin.updateUser(id, editFormData);
      setUsers((prev) => prev.map((user) => (String(user._id || user.id) === id ? (res as any).data.user : user)));
      setShowEditModal(false);
      toast.success('User updated.');
    } catch (err: any) {
      const message = err?.message || 'Failed to update user.';
      setError(message);
      toast.error(message);
    } finally {
      setUpdating(false);
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
          { label: 'Reports', to: '/admin/report-requests' }
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
            { label: 'Report Requests', to: '/admin/report-requests' },
          ]}
        />

        <div>
    
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/admin/users</p>
              <h1 className="text-3xl font-extrabold">Users</h1>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all">Create User</button>
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
                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewUser(row)}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditUser(row)}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      Edit
                    </button>
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="grid gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="User name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-md font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="grid gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Status</label>
                <select
                  value={editFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'active' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt[0].toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-primary text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-md font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">User Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                <p className="text-lg">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <p className="text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                <p className="text-lg capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">ID</label>
                <p className="text-sm text-gray-600 break-all">{selectedUser._id || selectedUser.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


