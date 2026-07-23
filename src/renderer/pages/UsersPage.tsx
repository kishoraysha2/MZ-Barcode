import React, { useEffect, useState } from 'react';
import { UserManagementView } from '../../views/UserManagementView';
import { electronBridge } from '../../preload/bridge';
import { UserAccount } from '../../types';
import { UserAccountInfo } from '../../shared/types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await electronBridge.getUsers();
      if (res.success && res.data) {
        const formatted: UserAccount[] = res.data.map((u: UserAccountInfo) => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin || 'Never',
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error('Failed fetching users from SQLite:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (newUser: { username: string; fullName: string; password?: string; role: string }) => {
    const roleIdMap: Record<string, number> = { OWNER: 1, ADMIN: 2, USER: 3, VIEWER: 4 };
    const roleId = roleIdMap[newUser.role] || 3;

    await electronBridge.createUser({
      username: newUser.username,
      fullName: newUser.fullName,
      password: newUser.password || 'UserPass123!',
      roleId,
    });
    await fetchUsers();
  };

  const handleToggleActive = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    await electronBridge.updateUserStatus({
      userId: id,
      isActive: !target.isActive,
    });
    await fetchUsers();
  };

  return (
    <UserManagementView
      users={users}
      onAddUser={handleAddUser}
      onToggleUserActive={handleToggleActive}
    />
  );
};
