
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
    // This function is now primarily called *after* a successful login API call.
    // Its job is to sync the Zustand state with the newly set cookie.
    const token = Cookies.get('auth_token');
    if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
            set({ user: decodedUser, isInitialized: true });
        } else {
             // If decoding fails, ensure we're in a logged-out state.
             set({ user: null, isInitialized: true });
        }
    } else {
         // If for some reason the cookie isn't there, we are logged out.
         set({ user: null, isInitialized: true });
    }
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null });
  },
  initialize: () => {
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
  updateAvatar: (avatarDataUri: string) => {
    set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarDataUri } : null,
    }));
  }
}));
