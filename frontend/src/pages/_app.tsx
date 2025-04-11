import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import useAuthStore from '@/store/authStore';
import { Toaster } from '@/components/ui/toaster';

// Initialize Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

// Auth-protected routes
const authRoutes = ['/dashboard', '/chats', '/files', '/tasks', '/profile'];

function MyApp({ Component, pageProps }: AppProps) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    // Handle route protection for authenticated routes
    const handleRouteChange = (url: string) => {
      const needsAuth = authRoutes.some(route => url.startsWith(route));
      
      if (needsAuth && !user && !loading) {
        router.push({
          pathname: '/signin',
          query: { returnUrl: url }
        });
      }
    };
    
    // Initial check
    const path = router.pathname;
    const needsAuth = authRoutes.some(route => path.startsWith(route));
    
    if (needsAuth && !user && !loading) {
      router.push({
        pathname: '/signin',
        query: { returnUrl: path }
      });
    }
    
    // Add route change event handler
    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [user, loading, router]);
  
  return (
    <main className={`${inter.variable} font-sans`}>
      <Component {...pageProps} />
      <Toaster />
    </main>
  );
}

export default MyApp; 