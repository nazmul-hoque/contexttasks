import { useEffect } from 'react';
import { useContextStore } from '@/store/useContextStore';
import { getDistance } from 'geolib';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export function useGeolocationContext() {
    const { actions, userLocations, manualOverride, detectedContext } = useContextStore();
    const { setCurrentLocation, setDetectedContext } = actions;
    const { sendArrivalNotification } = useNotifications();

    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser.');
            return;
        }

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });

                // If user manually set context, don't overwrite it
                if (manualOverride) return;

                // Check against saved locations
                let foundContext = null;
                for (const loc of userLocations) {
                    if (loc.lat === 0 && loc.lng === 0) continue;

                    const dist = getDistance(
                        { latitude, longitude },
                        { latitude: loc.lat, longitude: loc.lng }
                    );

                    if (dist <= loc.radius) {
                        foundContext = loc;
                        break;
                    }
                }

                // Get latest state without triggering re-render/effect-restart
                const currentDetected = useContextStore.getState().detectedContext;

                // Trigger Notification if context CHANGED and isn't null
                if (foundContext && foundContext.id !== currentDetected?.id) {
                    sendArrivalNotification(foundContext);
                }

                setDetectedContext(foundContext);
            },
            (error) => {
                // ... (error handling remains same)
                let errorMessage = 'Unknown location error';
                switch (error.code) {
                    case 1: // PERMISSION_DENIED
                        errorMessage = 'Location permission denied. Please enable it in browser settings.';
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage = 'Location unavailable. Trying again...';
                        break;
                    case 3: // TIMEOUT
                        errorMessage = 'Location request timed out.';
                        break;
                }

                if (error.code === 1 || error.code === 3) {
                    console.warn('Geolocation:', errorMessage);
                } else {
                    console.error('Geolocation Error:', errorMessage, error);
                }

                if (error.code === 1) {
                    toast.error(errorMessage, {
                        description: "Context features will be limited."
                    });
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 5000,
            }
        );

        return () => navigator.geolocation.clearWatch(watcher);
        // Removed detectedContext from deps to prevent restart loop
    }, [userLocations, manualOverride, setCurrentLocation, setDetectedContext, sendArrivalNotification]);
}
