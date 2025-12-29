/**
 * Role Hierarchy System
 * Superadmin > Admin > Teacher > Student
 */

export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student' | 'user';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 5,
  admin: 4,
  teacher: 3,
  student: 2,
  user: 1,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
    'superadmin:access',
    'admin:create',
    'teacher:create',
    'student:create',
    'admin:access',
    'teacher:access',
    'users:manage',
    'users:create',
    'users:delete',
    'roles:manage',
    'content:create',
    'content:publish',
    'content:moderate',
    'analytics:view',
    'finance:view',
    'notifications:manage',
    'schemas:manage',
    'videos:manage',
  ],
  admin: [
    'admin:access',
    'teacher:create',
    'teacher:access',
    'users:manage',
    'users:create',
    'content:moderate',
    'analytics:view',
    'finance:view',
    'notifications:manage',
    'videos:manage',
  ],
  teacher: [
    'teacher:access',
    'content:create',
    'content:publish',
    'blog:write',
  ],
  student: [
    'blog:write',
    'quiz:practice',
  ],
  user: [],
};

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  // Can only manage roles lower in hierarchy
  return managerLevel > targetLevel;
}

/**
 * Get all roles that a manager can create/manage
 */
export function getManageableRoles(managerRole: UserRole): UserRole[] {
  const managerLevel = ROLE_HIERARCHY[managerRole] || 0;

  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < managerLevel)
    .map(([role]) => role as UserRole);
}

/**
 * Check if user has permission based on role
 */
export function roleHasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

