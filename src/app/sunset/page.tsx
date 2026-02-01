'use client';

import { ContextBadge } from '@/components/ContextBadge';
import { useTaskStore } from '@/store/useTaskStore';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SunsetView() {
    const { tasks, toggleTask, deleteTask } = useTaskStore();

    // "Sunset" = Completed tasks + Low priority future backlog
    // For MVP, let's just show Completed tasks here to keep it simple as an "Archive"
    const completedTasks = tasks.filter(t => t.status === 'DONE');

    return (
        <main className="min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
            {/* Background Decor (Different Color for Sunset) */}
            <div className="absolute top-0 right-0 w-full h-[400px] bg-purple-500/10 blur-[120px] -z-10 rounded-full" />

            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Sunset View</h1>
                </div>
            </header>

            <section className="px-6">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-muted-foreground text-sm">Completed & Archived</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        {completedTasks.length} Done
                    </span>
                </div>

                <div className="space-y-4">
                    {completedTasks.length === 0 && (
                        <div className="text-center py-20 opacity-40">
                            <p>No completed tasks yet.</p>
                            <p className="text-sm">Get to work! 😉</p>
                        </div>
                    )}

                    {completedTasks.map(task => (
                        <motion.div
                            key={task.id}
                            layoutId={task.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }} // Dimmed because done
                            className="p-4 rounded-2xl bg-card/50 border border-white/5 flex items-center gap-4 group"
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className="p-1 text-green-500 hover:text-green-400"
                            >
                                <RefreshCcw className="w-5 h-5" />
                            </button>

                            <div className="flex-1 min-w-0 line-through decoration-white/20 text-muted-foreground">
                                <h3 className="font-medium truncate">{task.title}</h3>
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
