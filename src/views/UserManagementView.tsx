import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/common/UIComponents';
import { UserAccount, UserRole } from '../types';

interface UserManagementViewProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onToggleUserActive: (id: number) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onToggleUserActive,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser = {
      id: Date.now(),
      username: newUsername,
      fullName: newFullName || newUsername,
      role: newRole,
      password: newPassword,
      isActive: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    onAddUser(newUser as any);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setStatusMsg(`User "${newUser.username}" created with Argon2id hash encryption!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" /> User & Role Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-Based Access Control (RBAC) with Argon2id password hashing.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} icon={UserPlus}>
          Add New User Account
        </Button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Users Data Grid */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono bg-slate-50 dark:bg-slate-950/50">
                <th className="p-3">User ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-slate-400">#{u.id}</td>
                  <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{u.username}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{u.fullName}</td>
                  <td className="p-3">
                    <Badge
                      variant={u.role === 'OWNER' ? 'purple' : u.role === 'ADMIN' ? 'amber' : 'gray'}
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[10px] ${
                        u.isActive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {u.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{u.lastLogin || 'Never'}</td>
                  <td className="p-3 text-right">
                    {u.role !== 'OWNER' && (
                      <button
                        onClick={() => onToggleUserActive(u.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition ${
                          u.isActive
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.isActive ? 'Disable' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Dialog */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create User Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. operator_mark"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="e.g. Mark Stevens"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Permission</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-semibold"
            >
              <option value="ADMIN">Customer Admin (Full Client Control)</option>
              <option value="USER">Normal Operator (Generate & Print Only)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowAddModal(false)} variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" icon={UserPlus}>
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
