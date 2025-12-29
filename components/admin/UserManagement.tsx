'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student' | 'user';
  createdAt: string;
  createdBy?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'superadmin' | 'admin' | 'teacher' | 'student' | 'user',
    password: '',
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as User['role'],
    password: '',
    isBanned: false
  });

  useEffect(() => {
    loadUsers();
    loadCurrentUserRole();
  }, []);

  const loadCurrentUserRole = async () => {
    try {
      const res = await fetch('/api/user/role');
      const data = await res.json();
      if (res.ok) {
        setCurrentUserRole(data.role || 'user');
      }
    } catch (error) {
      console.error('Failed to load current user role:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data?.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateForm(false);
        setFormData({ email: '', firstName: '', lastName: '', role: 'user', password: '' });
        loadUsers();
        alert('User created successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to create user: ${msg}`);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    setUpdatingUserId(targetUserId);
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        loadUsers();
        alert(`Role updated to ${newRole} successfully!`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUserId(editingUser.clerkId || editingUser.id);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok) {
        setEditingUser(null);
        loadUsers();
        alert('User updated successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      password: '', // Don't prepopulate password
      isBanned: (user as any).isBanned || false
    });
  };

  const handleDeleteUser = async (userId: string, userRole: string) => {
    if (!confirm(`Are you sure you want to delete this ${userRole}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadUsers();
        alert('User deleted successfully!');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-emerald-100 text-emerald-800';
      case 'student': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateAdmin = currentUserRole === 'superadmin';
  const canCreateTeacher = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canCreateStudent = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canCreateUser = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canDeleteUser = currentUserRole === 'superadmin';
  const canUpdateRole = (targetRole: string) => {
    if (currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'admin') return targetRole !== 'superadmin' && targetRole !== 'admin';
    return false;
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (roleFilter !== 'all') filtered = filtered.filter((u) => u.role === roleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(q) ||
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [users, roleFilter, searchQuery]);

  const userCounts = useMemo(() => ({
    all: users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
    user: users.filter(u => u.role === 'user').length,
  }), [users]);

  if (loading) return <div className="text-center py-12">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600 mt-1">
            {currentUserRole === 'superadmin' && 'Manage all platform roles and users'}
            {currentUserRole === 'admin' && 'Manage teachers, students, and users'}
            {currentUserRole !== 'superadmin' && currentUserRole !== 'admin' && 'Access restricted to view-only'}
          </p>
        </div>
        {(canCreateAdmin || canCreateTeacher || canCreateStudent || canCreateUser) && (
          <Button variant="inverse" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Create User'}
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader><CardTitle>Create New User</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                <Input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <Input type="email" placeholder="Email (required)" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                <select className="w-full rounded-lg border border-slate-300 p-2" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}>
                  {canCreateAdmin && <option value="admin">Admin</option>}
                  {canCreateTeacher && <option value="teacher">Teacher</option>}
                  <option value="student">Student</option>
                  <option value="user">User</option>
                </select>
              </div>
              <Input type="password" placeholder="Password (Optional)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              <Button type="submit" variant="inverse">Create User</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input className="flex-1" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div className="flex gap-1.5 flex-wrap">
              <Button variant={roleFilter === 'all' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('all')}>All ({userCounts.all})</Button>
              {currentUserRole === 'superadmin' && <Button variant={roleFilter === 'superadmin' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('superadmin')}>Superadmin ({userCounts.superadmin})</Button>}
              <Button variant={roleFilter === 'admin' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('admin')}>Admins ({userCounts.admin})</Button>
              <Button variant={roleFilter === 'teacher' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('teacher')}>Teachers ({userCounts.teacher})</Button>
              <Button variant={roleFilter === 'student' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('student')}>Students ({userCounts.student})</Button>
              <Button variant={roleFilter === 'user' ? 'inverse' : 'outline'} size="sm" onClick={() => setRoleFilter('user')}>Users ({userCounts.user})</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500 font-medium">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role / Actions</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">Edit</th>
                  {(canDeleteUser || currentUserRole === 'admin') && <th className="py-3 px-4 text-right">Delete</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      {canUpdateRole(user.role) ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="bg-white border rounded px-2 py-1 text-xs"
                            value={user.role}
                            onChange={e => handleUpdateRole(user.clerkId || user.id, e.target.value)}
                            disabled={updatingUserId === (user.clerkId || user.id)}
                          >
                            {currentUserRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
                            {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && <option value="admin">Admin</option>}
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="user">User</option>
                          </select>
                          {updatingUserId === (user.clerkId || user.id) && <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                      ) : (
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50" onClick={() => startEditing(user)}>
                        Edit
                      </Button>
                    </td>
                    {(canDeleteUser || (currentUserRole === 'admin' && canUpdateRole(user.role))) && (
                      <td className="py-3 px-4 text-right">
                        {user.role !== 'superadmin' && user.role !== currentUserRole && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(user.id, user.role)} disabled={deletingUserId === user.id}>
                            {deletingUserId === user.id ? '...' : 'Delete'}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit User Profile</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>✕</Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                    <Input placeholder="First Name" value={editFormData.firstName} onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                    <Input placeholder="Last Name" value={editFormData.lastName} onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                  <Input type="email" placeholder="Email" required value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                  <select className="w-full rounded-lg border border-slate-300 p-2 text-sm" value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value as any })}>
                    {canUpdateRole('superadmin') && <option value="superadmin">Superadmin</option>}
                    {canUpdateRole('admin') && <option value="admin">Admin</option>}
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-amber-600 uppercase flex items-center gap-1">
                      <span>🔑 Change Password</span>
                      <span className="normal-case font-normal text-slate-400 ml-auto">(Leave blank to keep current)</span>
                    </label>
                    <Input type="password" placeholder="New Password" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" variant="inverse" className="flex-1" disabled={updatingUserId === (editingUser.clerkId || editingUser.id)}>
                    {updatingUserId === (editingUser.clerkId || editingUser.id) ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
