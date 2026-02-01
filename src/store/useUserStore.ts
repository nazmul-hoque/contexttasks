import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoaded: boolean;
    setIsLoaded: (loaded: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoaded: false, // To prevent redirect loop before check is done
    setUser: (user) => set({ user }),
    setIsLoaded: (loaded) => set({ isLoaded: loaded }),
}));
