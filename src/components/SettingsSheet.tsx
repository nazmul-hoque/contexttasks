'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { useContextStore } from '@/store/useContextStore';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getDistance } from 'geolib';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';

interface SettingsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
    const { currentLocation, actions, notificationsEnabled, userLocations } = useContextStore();
    const { user } = useUserStore();
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, [isOpen]);

    const handleSaveLocation = (name: string, icon: string) => {
        if (currentLocation) {
            // Check if this location name already exists to alert the user of update
            const existing = userLocations.find(l => l.name === name);

            actions.addUserLocation({
                id: existing ? existing.id : crypto.randomUUID(), // Update existing ID if match
                name: name,
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                radius: 100,
                icon: icon
            });

            toast.success(existing ? `Updated location for ${name}!` : `Location saved as ${name}!`);
        } else {
            toast.error("Waiting for location...");
        }
    };

    // ... (Notifications logic remains same)

    const isCurrentLocationSavedAs = (name: string): boolean => {
        if (!currentLocation) return false;

        const savedLoc = userLocations.find(l => l.name === name);
        if (!savedLoc) return false;

        const dist = getDistance(
            { latitude: currentLocation.lat, longitude: currentLocation.lng },
            { latitude: savedLoc.lat, longitude: savedLoc.lng }
        );

        return dist < 100; // Consider "same place" if within 100m
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // AuthProvider will detect change and redirect to login
        onClose();
    };

    const toggleNotifications = async () => {
        // If permission not granted, request it first
        if (permissionStatus !== 'granted') {
            if (!('Notification' in window)) {
                toast.error("Notifications not supported");
                return;
            }
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission !== 'granted') {
                toast.error("Permission denied. Check settings.");
                return;
            }
        }

        // Toggle state
        const newState = !notificationsEnabled;
        actions.setNotificationsEnabled(newState);
        toast.success(newState ? "Notifications Resumed" : "Notifications Paused");

        if (newState) {
            new Notification("Context Tasks", { body: "Welcome back!" });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-50 border-t border-white/10 shadow-2xl pb-12"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                Settings
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 rounded-full active:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Location Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Location Intelligence</h3>
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Current Coords</span>
                                        <span className="font-mono text-xs opacity-70">
                                            {currentLocation
                                                ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                                                : 'Acquiring...'}
                                        </span>
                                    </div>

                                    {/* Location Presets */}
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3 items-start">
                                        <div className="bg-blue-500/20 p-1.5 rounded-full mt-0.5 shrink-0">
                                            <MapPin className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-blue-200">Set Current Location</p>
                                            <p className="text-[10px] text-blue-200/70 leading-relaxed">
                                                Tap a preset below to save your <span className="text-white font-medium">current coordinates</span> as that place.
                                                For example, if you are at the gym now, tap "Gym".
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { name: 'Home', icon: '🏠' },
                                            { name: 'Work', icon: '🏢' },
                                            { name: 'Gym', icon: '💪' },
                                            { name: 'Cafe', icon: '☕' },
                                            { name: 'Library', icon: '📚' },
                                            { name: 'School', icon: '🎓' },
                                            { name: 'Mosque', icon: '🕌' },
                                            { name: 'Other', icon: '📍' }
                                        ].map(place => {
                                            const isHere = isCurrentLocationSavedAs(place.name);
                                            return (
                                                <button
                                                    key={place.name}
                                                    onClick={() => handleSaveLocation(place.name, place.icon)}
                                                    disabled={!currentLocation || isHere}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${isHere
                                                        ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                                        : "bg-white/5 hover:bg-white/10 active:scale-95"
                                                        }`}
                                                >
                                                    {isHere ? <CheckCircle2 className="w-6 h-6 mb-1" /> : <span className="text-xl">{place.icon}</span>}
                                                    <span className="text-xs font-medium">{isHere ? 'Here' : place.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Notifications Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferences</h3>
                                <button
                                    onClick={toggleNotifications}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${permissionStatus === 'denied' ? 'bg-red-500/20 text-red-500' :
                                            notificationsEnabled ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-muted-foreground'
                                            }`}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Notifications</div>
                                            <div className="text-xs text-muted-foreground">
                                                {permissionStatus === 'denied' ? 'Permission Denied' :
                                                    notificationsEnabled ? 'Active (App)' : 'Paused'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${permissionStatus === 'denied' ? 'text-red-500' :
                                        notificationsEnabled ? 'text-green-500' : 'text-muted-foreground'
                                        }`}>
                                        {permissionStatus === 'denied' ? 'Blocked' : notificationsEnabled ? 'ON' : 'OFF'}
                                    </div>
                                </button>
                            </div>



                            {/* Sign Out / Sign In */}
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="w-full py-4 text-center text-red-400 font-semibold hover:text-red-300 transition-colors text-sm"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="block w-full py-4 text-center text-primary font-semibold hover:text-primary-foreground transition-colors text-sm"
                                >
                                    Sign In / Sync Data
                                </Link>
                            )}

                            {/* App Info */}
                            <div className="text-center pt-0 pb-4">
                                <p className="text-xs text-muted-foreground">Context Tasks v0.1.0-MVP</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
