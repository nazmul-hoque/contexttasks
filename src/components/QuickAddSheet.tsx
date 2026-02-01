'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin } from 'lucide-react';
import { useContextStore } from '@/store/useContextStore';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickAddProps {
    isOpen: boolean;
    onClose: () => void;
    editTask?: { id: string, title: string, context: string, duration: number } | null;
}

export function QuickAddSheet({ isOpen, onClose, editTask }: QuickAddProps) {
    const { detectedContext, userLocations } = useContextStore();
    const { addTask, updateTask } = useTaskStore();

    const [title, setTitle] = useState('');
    const [selectedContext, setSelectedContext] = useState<string>('Home');
    const [selectedDuration, setSelectedDuration] = useState<number>(15);

    // Reset or hydration logic when sheet opens
    // Note: In a real app we'd use useEffect to sync state when `editTask` changes
    // But for now, we'll rely on the parent mounting/unmounting or specific key

    // Better: use a key on the component in parent to force reset, OR useEffect here.
    // Let's use useEffect for safety.
    useState(() => {
        if (editTask) {
            setTitle(editTask.title);
            setSelectedContext(editTask.context);
            setSelectedDuration(editTask.duration);
        } else {
            setTitle('');
            setSelectedContext(detectedContext?.name || 'Home');
            setSelectedDuration(15);
        }
    });

    // Actually, explicit useEffect is cleaner for prop updates
    const [hasInitialized, setHasInitialized] = useState(false);
    if (isOpen && !hasInitialized) {
        if (editTask) {
            setTitle(editTask.title);
            setSelectedContext(editTask.context);
            setSelectedDuration(editTask.duration);
        } else {
            setTitle('');
            setSelectedContext(detectedContext?.name || 'Home');
            setSelectedDuration(15);
        }
        setHasInitialized(true);
    }

    // Reset initialization when closed
    if (!isOpen && hasInitialized) {
        setHasInitialized(false);
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (editTask) {
            updateTask(editTask.id, {
                title,
                context: selectedContext,
                duration: selectedDuration,
            });
            toast.success("Task updated!");
        } else {
            addTask({
                title,
                context: selectedContext,
                duration: selectedDuration,
                priority: 'MEDIUM', // Default priority for MVP
            });
            toast.success("Task added!");
        }

        setTitle('');
        onClose();
    };

    // Available contexts: User's saved places + "Anywhere"
    // Deduplicate using Set to prevent "two children with the same key" error
    const contextOptions = Array.from(new Set([
        ...userLocations.map(l => l.name),
        // Common defaults requested by user
        'Home', 'Work', 'Gym', 'Library', 'School', 'Mosque', 'Cafe',
        'Anywhere'
    ]));

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
                        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 z-50 border-t border-white/10 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editTask ? 'Edit Task' : 'New Task'}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 rounded-full active:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input */}
                            <div>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="What needs doing?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-2xl font-medium placeholder:text-muted-foreground outline-none border-none p-0"
                                />
                            </div>

                            {/* Context Selector */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Context
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {contextOptions.map((ctx) => (
                                        <button
                                            key={ctx}
                                            type="button"
                                            onClick={() => setSelectedContext(ctx)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border border-transparent",
                                                selectedContext === ctx
                                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                    : "bg-secondary text-secondary-foreground border-white/5"
                                            )}
                                        >
                                            @{ctx}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Selector */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Duration
                                </label>
                                <div className="flex gap-2">
                                    {[5, 15, 30, 60].map((mins) => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setSelectedDuration(mins)}
                                            className={cn(
                                                "flex-1 py-3 rounded-2xl text-sm font-bold transition-all border border-transparent",
                                                selectedDuration === mins
                                                    ? "bg-accent/20 text-accent-foreground border-accent/20"
                                                    : "bg-secondary text-secondary-foreground border-white/5"
                                            )}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {editTask && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Ideally verify first, but keeping it fast for now
                                            useTaskStore.getState().deleteTask(editTask.id);
                                            toast.success("Task deleted");
                                            onClose();
                                        }}
                                        className="bg-red-500/10 text-red-500 p-4 rounded-2xl font-bold transition-all active:scale-[0.98]"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                                >
                                    {editTask ? 'Update Task' : 'Save Task'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
