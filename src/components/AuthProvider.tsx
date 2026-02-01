'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useContextStore } from '@/store/useContextStore';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setIsLoaded, user, isLoaded } = useUserStore();
    const { fetchTasks } = useTaskStore();
    const { actions: { fetchUserLocations } } = useContextStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsLoaded(true);
            if (session) {
                fetchTasks();
                fetchUserLocations();
            }
        });

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session) {
                fetchTasks();
                fetchUserLocations();
            }
        });

        return () => subscription.unsubscribe();
    }, [setUser, setIsLoaded, fetchTasks, fetchUserLocations]);

    // Redirect to Home if already logged in (e.g. after successful auth)
    useEffect(() => {
        if (user && pathname === '/login') {
            router.push('/');
        }
    }, [user, pathname, router]);

    // Protected Route Logic (Disabled for Guest Mode)
    // useEffect(() => {
    //     const isPublic = pathname === '/login';
    //     const { isLoaded, user } = useUserStore.getState();

    //     if (isLoaded && !user && !isPublic) {
    //         router.push('/login');
    //     }
    // }, [user, pathname, isLoaded, router]);

    return <>{children}</>;
}
