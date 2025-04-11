import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">GrantCraft</span>
          </Link>
          
          {user && (
            <nav className="flex gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  router.pathname === '/dashboard' ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/chats"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  router.pathname.startsWith('/chats') ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                Chats
              </Link>
              <Link
                href="/tasks"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  router.pathname.startsWith('/tasks') ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/files"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  router.pathname.startsWith('/files') ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                Files
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.displayName || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 