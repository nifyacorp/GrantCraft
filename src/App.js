import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GrantsPage from './pages/GrantsPage';
import AuthPage from './pages/AuthPage';
import authService from './lib/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Check authentication status on startup
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          setUser(authService.getCurrentUser());
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    // Short delay to ensure DOM is fully loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle authentication changes
  const handleAuthChange = (user) => {
    setUser(user);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // Protected route component
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) => 
        user ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-xl">Loading GrantCraft...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {user && <Header user={user} onLogout={handleLogout} />}
      
      <main className="flex-1">
        <Switch>
          <Route path="/auth" render={(props) => (
            user ? <Redirect to="/grants" /> : <AuthPage onAuthChange={handleAuthChange} {...props} />
          )} />
          <Route exact path="/" render={() => <Redirect to={user ? "/grants" : "/auth"} />} />
          <ProtectedRoute path="/grants" component={GrantsPage} />
          {/* Fallback route for any other path */}
          <Route render={() => <Redirect to="/" />} />
        </Switch>
      </main>
      
      {user && <Footer />}
    </div>
  );
}

export default App;