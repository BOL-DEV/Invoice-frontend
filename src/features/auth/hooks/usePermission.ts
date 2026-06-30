import { useAuth } from '../context/AuthContext';
import { Role } from '../../../types/api';

export type PermissionKey =
  | 'invoice:create'
  | 'invoice:list-all'
  | 'invoice:edit-finalized'
  | 'invoice:delete'
  | 'invoice:print-finalized'
  | 'users:manage'
  | 'business:manage'
  | 'activity:view'
  | 'dashboard:view';

const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  ADMIN: [
    'invoice:create',
    'invoice:list-all',
    'invoice:edit-finalized',
    'invoice:delete',
    'invoice:print-finalized',
    'users:manage',
    'business:manage',
    'activity:view',
    'dashboard:view',
  ],
  APPRENTICE: [
    'invoice:create',
  ],
};

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;
    
    // ADMIN role bypasses all client checks
    if (user.role === 'ADMIN') return true;

    const allowedPermissions = ROLE_PERMISSIONS[user.role] || [];
    return allowedPermissions.includes(permission);
  };

  return {
    hasPermission,
    role: user?.role || null,
    isAdmin: user?.role === 'ADMIN',
  };
};
