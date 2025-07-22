
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
    // The login process is handled by setting the cookie and then re-initializing.
    get().initialize();
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null, isInitialized: true }); // Mark as initialized after logout
  },
  initialize: async () => {
    const token = Cookies.get('auth_token');
    if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
            try {
                // Fetch the full user object to get the latest data, like avatar
                const response = await fetch('/api/user/me');
                if (response.ok) {
                    const fullUser = await response.json();
                     set({ user: { ...decodedUser, avatar: fullUser.avatarDataUri }, isInitialized: true });
                } else {
                    // If fetching fails, still set user from token but mark as initialized
                    set({ user: decodedUser, isInitialized: true });
                }
            } catch (e) {
                // Fallback to decoded token if the API call fails
                set({ user: decodedUser, isInitialized: true }); 
            }
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

// Initialize the store on app load by calling initialize in the main layout.
// This prevents race conditions and ensures a predictable loading sequence.
