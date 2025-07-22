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
                const response = await fetch('/api/user/me');
                if (response.ok) {
                    const fullUser = await response.json();
                     set({ user: { ...decodedUser, avatar: fullUser.avatarDataUri } });
                } else {
                     set({ user: decodedUser });
                }
            } catch (e) {
                set({ user: decodedUser }); // fallback to decoded token if fetch fails
            }
        } else {
            Cookies.remove('auth_token');
            set({ user: null });
        }
    } else {
         set({ user: null });
    }
}


export const useUserStore = create<UserState>((set) => ({
  user: null,
  login: async () => {
    await fetchAndSetUser(set);
  },
  logout: () => {
    Cookies.remove('auth_token');
    set({ user: null });
  },
  initialize: () => {
    fetchAndSetUser(set);
  },
  updateAvatar: (avatarDataUri: string) => {
    set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarDataUri } : null,
    }));
  }
}));

// Initialize the store on app load
useUserStore.getState().initialize();
