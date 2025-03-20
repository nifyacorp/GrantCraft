import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

function Header({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-semibold flex items-center text-lg">
          <span className="mr-2">📝</span> GrantCraft
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link to="/grants" className="hover:text-primary/80 transition-colors">
                My Grants
              </Link>
            </li>
            {user ? (
              <li className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:text-primary/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user.firstName && user.lastName 
                      ? `${user.firstName[0]}${user.lastName[0]}`
                      : user.username[0].toUpperCase()}
                  </div>
                  <span>{user.firstName || user.username}</span>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                        <div>{user.firstName} {user.lastName}</div>
                        <div className="text-xs">{user.institution}</div>
                      </div>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/20"
                        onClick={onLogout}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link to="/auth">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;