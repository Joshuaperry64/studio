
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface UserPayload {
  userId: string; // Can be a string (firestore ID) or a special string ('creator-joshua')
  username: string;
  role: 'admin' | 'user';
  avatar?: string;
  iat: number;
  exp: number;
}

interface UserState {
  user: UserPayload | null;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwtDecode<UserPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const initialize = (): UserPayload | null => {
  if (typeof window === 'undefined') return null;
  const token = Cookies.get('auth_token');
  if (token) {
    const decodedUser = decodeToken(token);
    if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
      return decodedUser;
    } else {
      Cookies.remove('auth_token');
      return null;
    }
  }
  return null;
}

export const useUserStore = create<UserState>((set) => ({
  user: initialize(),
  isInitialized: true,
  login: (token) => {
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      set({ user: decodedUser, isInitialized: true });
    } else {
      set({ user: null, isInitialized: true });
    }
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null, isInitialized: true });
  },
}));
