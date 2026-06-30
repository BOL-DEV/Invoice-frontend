'use client';

import React from 'react';
import { usePermission, PermissionKey } from '../hooks/usePermission';

interface CanProps {
  permission: PermissionKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ permission, fallback = null, children }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
