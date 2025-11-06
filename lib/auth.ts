import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';

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
  // Lucia placeholder (to be implemented)
  return { userId: undefined } as any;
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
  // Lucia placeholder (to be implemented)
  return null;
}


