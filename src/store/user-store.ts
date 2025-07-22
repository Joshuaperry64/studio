
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
  login: () => Promise<void>;
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

const fetchAndSetUser = async (set: (state: Partial<UserState>) => void) => {
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
}


export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isInitialized: false,
  login: async () => {
    set({ isInitialized: false });
    await fetchAndSetUser(set);
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null });
  },
  initialize: () => {
    // Only initialize if not already done
    if (!get().isInitialized) {
        fetchAndSetUser(set);
    }
  },
  updateAvatar: (avatarDataUri: string) => {
    set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarDataUri } : null,
    }));
  }
}));

// Initialize the store on app load
useUserStore.getState().initialize();
