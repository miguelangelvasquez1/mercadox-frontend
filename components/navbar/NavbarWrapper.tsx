'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import NavbarPublic   from './NavbarPublic';
import NavbarConsumer from './NavbarConsumer';
import NavbarAdmin    from './NavbarAdmin';

export default function NavbarWrapper() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <NavbarPublic />;
  if (role === 'ADMIN')  return <NavbarAdmin />;
  return <NavbarConsumer />;         // CONSUMER o SELLER
}