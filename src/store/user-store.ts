
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface UserPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
  avatar?: string;
  iat: number;
  exp: number;
}

interface UserState {
  user: UserPayload | null;
  isInitialized: boolean;
  login: () => void;
  logout: () => void;
  initialize: () => void;
  updateAvatar: (avatarDataUri: string) => void;
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
  login: () => {
    // This function is called after a successful login API call.
    // We can now assume the cookie is set. We just need to update the state.
    const token = Cookies.get('auth_token');
    if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
            set({ user: decodedUser, isInitialized: true });
        }
    }
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null, isInitialized: true }); // Mark as initialized after logout
  },
  initialize: () => {
    // This function is for initializing the state on app load / page refresh.
    if (get().isInitialized) return; // Prevent re-initialization

    const token = Cookies.get('auth_token');
    if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
            set({ user: decodedUser, isInitialized: true });
        } else {
            // Token is expired or invalid
            Cookies.remove('auth_token');
            set({ user: null, isInitialized: true });
        }
    } else {
        // No token found
         set({ user: null, isInitialized: true });
    }
  },
  updateAvatar: (avatarDataUri: string) => {
    set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarDataUri } : null,
    }));
  }
}));
