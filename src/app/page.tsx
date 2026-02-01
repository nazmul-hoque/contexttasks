'use client';

import Link from 'next/link';

import { ContextBadge } from '@/components/ContextBadge';
import { useGeolocationContext } from '@/hooks/useGeolocation';
import { useContextStore } from '@/store/useContextStore';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { QuickAddSheet } from '@/components/QuickAddSheet';
import { TaskCard } from '@/components/TaskCard';
import { sortTasksByRelevance } from '@/lib/intelligence';
import { useNotifications } from '@/hooks/useNotifications';
import { Plus, Settings } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { SettingsSheet } from '@/components/SettingsSheet';
import { ContextSelectorSheet } from '@/components/ContextSelectorSheet';

export default function Home() {
  // Activate the hook
  useGeolocationContext();

  const { user } = useUserStore();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  const [sheetState, setSheetState] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Helper to close
  const closeSheet = () => setSheetState({ open: false, task: null });

  const { detectedContext, userLocations } = useContextStore();
  const { tasks, toggleTask } = useTaskStore();

  // 'auto' means use detectedContext, 'all' means show everything, else specific context name
  const [viewMode, setViewMode] = useState<'auto' | 'all' | string>('auto');
  const [contextSheetOpen, setContextSheetOpen] = useState(false);

  // Derive the effective context name for filtering
  const effectiveContextName = viewMode === 'auto' ? detectedContext?.name : viewMode;

  const filteredTasks = useMemo(() => {
    return sortTasksByRelevance(tasks, detectedContext)
      .filter(t => t.status === 'TODO')
      .filter(t => {
        // 1. View All Logic
        if (viewMode === 'all') return true;

        // 2. Specific Context Logic
        if (viewMode !== 'auto') {
          return t.context === viewMode || t.context === 'Anywhere';
        }

        // 3. Auto Logic (Original)
        if (!detectedContext) return true;
        if (t.context === 'Anywhere') return true;
        return t.context === detectedContext.name;
      });
  }, [tasks, detectedContext, viewMode]);

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-primary/20 blur-[120px] -z-10 rounded-full dark:opacity-40" />

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'Good Morning';
              if (hour < 18) return 'Good Afternoon';
              return 'Good Evening';
            })()}{userName ? `, ${userName}` : ''}
          </h1>
          <div className="flex items-center gap-3">
            {/* ... */}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-all text-muted-foreground hover:text-foreground hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>

          <ContextBadge
            viewMode={viewMode}
            onClick={() => setContextSheetOpen(true)}
          />
        </div>
      </header>

      {/* Task List */}
      <section className="px-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold opacity-90">
            {viewMode === 'auto'
              ? (detectedContext ? `For ${detectedContext.name}` : 'Scanning...')
              : viewMode === 'all' ? 'All Tasks' : `For ${viewMode}`}
          </h2>
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">
            {filteredTasks.length} Active
          </span>
        </div>

        {/* List Content */}
        <div className="space-y-3 pb-24">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={toggleTask}
                onEdit={(t) => setSheetState({ open: true, task: t })}
              />
            ))}

            {/* Reset Empty State if needed, based on filter */}
          </AnimatePresence>

          {/* Empty State Helper */}
          {tasks.filter(t => t.status === 'TODO').length > 0 &&
            filteredTasks.length === 0 && (
              <div className="text-center py-12 opacity-40">
                <p>No tasks specifically for this context.</p>
                <div className="mt-4">
                  <button onClick={() => setViewMode('all')} className="text-sm text-primary hover:underline">
                    View all tasks
                  </button>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setSheetState({ open: true, task: null })}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <QuickAddSheet
        isOpen={sheetState.open}
        onClose={closeSheet}
        editTask={sheetState.task}
      />

      <SettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <ContextSelectorSheet
        isOpen={contextSheetOpen}
        onClose={() => setContextSheetOpen(false)}
        currentMode={viewMode}
        onSelectMode={setViewMode}
      />
    </main>
  );
}


