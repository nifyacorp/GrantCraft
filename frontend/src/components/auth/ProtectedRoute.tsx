import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace({
        pathname: '/signin',
        query: { returnUrl: router.asPath },
      });
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : null;
};

export default ProtectedRoute; 