import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserLocation = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius: number; // in meters
    icon: string; // e.g., '🏠'
    user_id?: string;
};

interface ContextState {
    currentLocation: { lat: number; lng: number } | null;
    detectedContext: UserLocation | null;
    manualOverride: boolean;
    notificationsEnabled: boolean;
    locationAccuracy: 'balanced' | 'precise';

    // User's saved places
    userLocations: UserLocation[];

    actions: {
        setCurrentLocation: (loc: { lat: number; lng: number }) => void;
        setDetectedContext: (context: UserLocation | null) => void;
        setManualMode: (override: boolean) => void;
        setNotificationsEnabled: (enabled: boolean) => void;
        setLocationAccuracy: (accuracy: 'balanced' | 'precise') => void;
        addUserLocation: (loc: UserLocation) => Promise<void>;
        fetchUserLocations: () => Promise<void>;
    };
}

export const useContextStore = create<ContextState>()(
    persist(
        (set, get) => ({
            currentLocation: null,
            detectedContext: null,
            manualOverride: false,
            notificationsEnabled: true, // Default to true
            locationAccuracy: 'balanced', // Default to balanced for faster performance
            // Default Mock (will be overwritten if logged in and fetched)
            userLocations: [
                { id: '1', name: 'Home', lat: 0, lng: 0, radius: 200, icon: '🏠' },
                { id: '2', name: 'Work', lat: 0, lng: 0, radius: 200, icon: '🏢' },
                { id: '3', name: 'Gym', lat: 0, lng: 0, radius: 100, icon: '💪' },
            ],
            actions: {
                setCurrentLocation: (loc) => set({ currentLocation: loc }),
                setDetectedContext: (context) => set({ detectedContext: context }),
                setManualMode: (override) => set({ manualOverride: override }),
                setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
                setLocationAccuracy: (accuracy) => set({ locationAccuracy: accuracy }),

                fetchUserLocations: async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;

                    const { data, error } = await supabase
                        .from('user_locations')
                        .select('*');

                    if (error) {
                        console.error('Error fetching locations:', error);
                        return;
                    }

                    // Map DB snake_case -> App CamelCase (if needed)
                    // Our model in Supabase: id, user_id, name, lat, lng, radius, icon
                    // Matches exactly except user_id
                    const mappedLocations: UserLocation[] = data.map((l: any) => ({
                        id: l.id,
                        name: l.name,
                        lat: l.lat,
                        lng: l.lng,
                        radius: l.radius,
                        icon: l.icon,
                        user_id: l.user_id
                    }));

                    if (mappedLocations.length > 0) {
                        set({ userLocations: mappedLocations });
                    }
                },

                addUserLocation: async (loc) => {
                    // Optimistic Update
                    set((state) => ({ userLocations: [...state.userLocations, loc] }));

                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const { error } = await supabase.from('user_locations').insert({
                            id: loc.id,
                            user_id: session.user.id,
                            name: loc.name,
                            lat: loc.lat,
                            lng: loc.lng,
                            radius: loc.radius,
                            icon: loc.icon
                        });
                        if (error) console.error('Error adding location:', error);
                    }
                },
            },
        }),
        {
            name: 'context-storage',
            partialize: (state) => ({
                userLocations: state.userLocations,
                notificationsEnabled: state.notificationsEnabled,
                locationAccuracy: state.locationAccuracy
            }),
        }
    )
);
