'use client';

import { useContextStore } from '@/store/useContextStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MapPin, Home, Building2, Coffee, Dumbbell, Infinity } from 'lucide-react';

interface ContextBadgeProps {
    onClick?: () => void;
    viewMode?: 'auto' | 'all' | string;
}

export function ContextBadge({ onClick, viewMode = 'auto' }: ContextBadgeProps) {
    const { detectedContext, currentLocation } = useContextStore();

    // Helper to get icon
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case '🏠': return <Home className="w-4 h-4" />;
            case '🏢': return <Building2 className="w-4 h-4" />;
            case '☕': return <Coffee className="w-4 h-4" />;
            case '💪': return <Dumbbell className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    // Determine what to show
    let label = 'Locating...';
    let icon = <MapPin className="w-4 h-4" />;

    // Status check: do we have GPS lock?
    const hasGPS = !!currentLocation;

    if (viewMode === 'all') {
        label = 'All Tasks';
        icon = <Infinity className="w-4 h-4" />;
    } else if (viewMode === 'auto') {
        label = detectedContext ? detectedContext.name : (hasGPS ? 'Errand / Away' : 'Locating...');
        icon = detectedContext ? getIcon(detectedContext.icon) : <MapPin className="w-4 h-4" />;
    } else {
        // Specific override
        label = viewMode;
        // Try to find icon from somewhere? Or just use marker
        // We know standard ones, but for now generic. 
        // Ideally we'd look up the icon from userLocations in store, but we can't easily hook cleanly without passing store or lookup.
        // Let's keep it simple: if it's a known name usage, it works, else marker.
        // Or we can try to guess icon based on name if standard, or just show text.
        icon = <MapPin className="w-4 h-4" />;
    }

    // If auto and no GPS, strict locating state
    const isLocating = viewMode === 'auto' && !hasGPS;

    return (
        <button onClick={onClick} className="active:scale-95 transition-transform">
            <motion.div
                layout
                className={cn(
                    "flex items-center gap-2 pr-4 pl-1 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-colors",
                    (viewMode !== 'auto' || detectedContext)
                        ? "bg-accent/10 text-accent-foreground border-accent/20"
                        : "bg-white/5 text-muted-foreground",
                    viewMode !== 'auto' ? "border-primary/50 bg-primary/10 text-primary" : ""
                )}
            >
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    (viewMode !== 'auto' || detectedContext) ? "bg-accent/20" : "bg-white/10",
                    viewMode !== 'auto' ? "bg-primary/20 text-primary" : ""
                )}>
                    {isLocating ? <span className="animate-pulse w-3 h-3 block rounded-full bg-white/20" /> : icon}
                </div>

                <span className="text-sm font-bold leading-tight whitespace-nowrap min-w-[60px] text-left">
                    {label}
                </span>
            </motion.div>
        </button>
    );
}
