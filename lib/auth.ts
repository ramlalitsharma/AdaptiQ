import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';
import { luciaCurrentUser } from './lucia';

type AuthProvider = 'clerk' | 'lucia';

export interface SessionUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

function getProvider(): AuthProvider {
  const p = (process.env.AUTH_PROVIDER || 'clerk').toLowerCase();
  return p === 'lucia' ? 'lucia' : 'clerk';
}

export async function auth() {
  const provider = getProvider();
  if (provider === 'clerk') {
    return await clerkAuth();
  }
  const u = await luciaCurrentUser();
  return { userId: u?.id } as any;
}

export async function currentUser(): Promise<SessionUser | null> {
  const provider = getProvider();
  if (provider === 'clerk') {
    const u = await clerkCurrentUser();
    if (!u) return null;
    return {
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress,
      firstName: u.firstName || undefined,
      lastName: u.lastName || undefined,
    };
  }
  const u = await luciaCurrentUser();
  return u;
}

export async function isAdmin() {
  const user = await currentUser();
  if (!user?.email) return false;
  // Hardcoded admin for safety/fallback
  const admins = ['ramlalitsharma01@gmail.com'];
  // Also check if role is present in session if available in future
  return admins.includes(user.email);
}


