import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface UserPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

interface UserState {
  user: UserPayload | null;
  login: () => void;
  logout: () => void;
  initialize: () => void;
}

const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwtDecode<UserPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  login: () => {
    const token = Cookies.get('auth_token');
    if (token) {
      set({ user: decodeToken(token) });
    }
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null });
  },
  initialize: () => {
    const token = Cookies.get('auth_token');
    if (token) {
      const user = decodeToken(token);
      // Check if token is expired
      if (user && user.exp * 1000 > Date.now()) {
        set({ user });
      } else {
        Cookies.remove('auth_token');
        set({ user: null });
      }
    }
  },
}));

// Initialize the store on app load
useUserStore.getState().initialize();
