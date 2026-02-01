'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check, Infinity, Sparkles } from 'lucide-react';
import { useContextStore } from '@/store/useContextStore';

interface ContextSelectorSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: 'auto' | 'all' | string;
    onSelectMode: (mode: 'auto' | 'all' | string) => void;
}

export function ContextSelectorSheet({ isOpen, onClose, currentMode, onSelectMode }: ContextSelectorSheetProps) {
    const { userLocations } = useContextStore();

    const handleSelect = (mode: 'auto' | 'all' | string) => {
        onSelectMode(mode);
        onClose();
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
                                <MapPin className="w-5 h-5 text-primary" />
                                Switch Context
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 rounded-full active:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Override the auto-detected location to view tasks for a different context.
                            </p>

                            <div className="grid grid-cols-1 gap-2">
                                {/* Auto Option */}
                                <button
                                    onClick={() => handleSelect('auto')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentMode === 'auto'
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentMode === 'auto' ? 'bg-primary text-primary-foreground' : 'bg-white/10'
                                        }`}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-sm">Auto-Detect</div>
                                        <div className="text-xs opacity-70">Show tasks for where I am now</div>
                                    </div>
                                    {currentMode === 'auto' && <Check className="w-5 h-5" />}
                                </button>

                                {/* All Option */}
                                <button
                                    onClick={() => handleSelect('all')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentMode === 'all'
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentMode === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/10'
                                        }`}>
                                        <Infinity className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-sm">View All</div>
                                        <div className="text-xs opacity-70">Show all tasks regardless of location</div>
                                    </div>
                                    {currentMode === 'all' && <Check className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="h-px bg-white/10 my-2" />

                            <div className="grid grid-cols-2 gap-2">
                                {userLocations.map(loc => (
                                    <button
                                        key={loc.id}
                                        onClick={() => handleSelect(loc.name)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${currentMode === loc.name
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-xl">{loc.icon}</span>
                                        <span className="font-medium text-sm truncate">{loc.name}</span>
                                        {currentMode === loc.name && <Check className="w-4 h-4 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
