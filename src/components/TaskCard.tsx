'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Circle, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '@/store/useTaskStore';
import { cn } from '@/lib/utils';

import { memo } from 'react';

// ... imports

interface TaskCardProps {
    task: Task;
    onComplete: (id: string) => void;
    onEdit: (task: Task) => void;
}

export const TaskCard = memo(function TaskCard({ task, onComplete, onEdit }: TaskCardProps) {
    // ... same implementation ...
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 100], [1, 0]);
    const backgroundOpacity = useTransform(x, [0, 100], [0, 1]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            onComplete(task.id);
        }
    };

    return (
        <div className="relative group">
            {/* Background Layer (Success/Complete) */}
            <motion.div
                style={{ opacity: backgroundOpacity }}
                className="absolute inset-0 bg-accent/20 rounded-2xl flex items-center justify-start pl-6"
            >
                <CheckCircle2 className="w-6 h-6 text-accent" />
            </motion.div>

            {/* Foreground Layer (Card) */}
            <motion.div
                style={{ x, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }} // Snap back if not dragging far enough
                onDragEnd={handleDragEnd}
                onClick={() => onEdit(task)}
                whileTap={{ scale: 0.98 }}
                className="relative p-4 rounded-2xl bg-card border border-white/5 shadow-sm flex items-center gap-4 cursor-pointer transition-all touch-pan-y"
            >
                <button
                    type="button"
                    onClick={() => onComplete(task.id)} // Fallback tap
                    className="shrink-0"
                >
                    <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <div className="flex gap-2 mt-1 items-center">
                        {/* Context Tag */}
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-medium",
                            task.context === 'Home' ? "bg-blue-500/10 text-blue-400" :
                                task.context === 'Work' ? "bg-purple-500/10 text-purple-400" :
                                    "bg-white/5 text-muted-foreground"
                        )}>
                            @{task.context}
                        </span>

                        {/* Duration Tag */}
                        <span className="text-[10px] text-muted-foreground border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.duration}m
                        </span>

                        {/* Priority Tag (New) */}
                        {task.priority === 'HIGH' && (
                            <span className="text-[10px] text-red-400 font-bold ml-auto">
                                !!!
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
});
