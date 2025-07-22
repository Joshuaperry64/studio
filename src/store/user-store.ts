
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

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isInitialized: false,
  login: (token) => {
    // This function can be called on login or when the token is refreshed (e.g., after profile update)
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
  initialize: () => {
    // This function handles the initial load of the application,
    // checking if a valid cookie already exists.
    if (get().isInitialized) return;

    const token = Cookies.get('auth_token');
    if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
            set({ user: decodedUser, isInitialized: true });
        } else {
            // Token is expired or invalid, so remove it.
            Cookies.remove('auth_token');
            set({ user: null, isInitialized: true });
        }
    } else {
         // No token, we are logged out and initialized.
         set({ user: null, isInitialized: true });
    }
  },
}));
