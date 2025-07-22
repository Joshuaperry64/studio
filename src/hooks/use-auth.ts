'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface UserPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

export function useAuth() {
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<UserPayload>(token);
        setUser(decodedToken);
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUser(null);
      }
    }
  }, []);

  return { user };
}
