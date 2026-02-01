import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useContextStore, type UserLocation } from '@/store/useContextStore';

const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 Hours

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const { tasks } = useTaskStore();

    // Track last notification time for each context ID to prevent spam
    // In a real app, persist this to localStorage
    const [lastNotified, setLastNotified] = useState<Record<string, number>>({});

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const sendArrivalNotification = (context: UserLocation) => {
        if (permission !== 'granted') return;

        // CHECK APP SETTINGS
        if (!useContextStore.getState().notificationsEnabled) {
            console.log('[Notifications] Muted by user setting');
            return;
        }

        const now = Date.now();
        const lastTime = lastNotified[context.id] || 0;

        // 1. Check Cooldown
        if (now - lastTime < COOLDOWN_MS) {
            console.log(`[Notifications] Suppressed for ${context.name} (Cooldown active)`);
            return;
        }

        // 2. Check for relevant tasks
        const relevantTasks = tasks.filter(t =>
            t.status === 'TODO' && t.context === context.name
        );

        if (relevantTasks.length === 0) {
            console.log(`[Notifications] Suppressed for ${context.name} (No tasks)`);
            return;
        }

        // 3. Send Notification
        const title = `Arrived at ${context.name} ${context.icon}`;
        const body = `You have ${relevantTasks.length} pending tasks here. first up: "${relevantTasks[0].title}"`;

        new Notification(title, {
            body,
            icon: '/icon-192x192.png', // Ensure this exists or use a placeholder
            tag: context.id // tags replace old notifications from same context
        });

        // 4. Update Cooldown
        setLastNotified(prev => ({
            ...prev,
            [context.id]: now
        }));
    };

    return {
        permission,
        requestPermission,
        sendArrivalNotification
    };
}
