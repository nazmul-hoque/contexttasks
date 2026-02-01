import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Define the Task interface matching our app
export interface Task {
    id: string;
    title: string;
    context: string;
    duration: number;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'TODO' | 'DONE';
    createdAt: number;
    user_id?: string; // Optional for local tasks
}

interface TaskState {
    tasks: Task[];

    // Actions
    fetchTasks: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],

            fetchTasks: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return; // Keep local tasks if not logged in

                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching tasks:', error.message);
                    // Check if table missing
                    if (error.code === '42P01') {
                        console.error('Missing Table: Please run the SQL migration to create the "tasks" table.');
                    }
                    return;
                }

                // Map DB snake_case to app camelCase
                const mappedTasks: Task[] = data.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    context: t.context, // Assuming DB column is 'context' (or context_id if joined, but keeping simple)
                    duration: t.duration,
                    priority: t.priority,
                    status: t.status,
                    createdAt: new Date(t.created_at).getTime(),
                    user_id: t.user_id
                }));

                set({ tasks: mappedTasks });
            },

            addTask: async (task) => {
                const newTask: Task = {
                    ...task,
                    id: crypto.randomUUID(),
                    createdAt: Date.now(),
                    status: 'TODO',
                    priority: task.priority || 'MEDIUM',
                };

                // Optimistic Update
                set((state) => ({ tasks: [newTask, ...state.tasks] }));

                // Supabase Push
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    console.log('Attempting to sync task to Supabase:', newTask.id);
                    const { error } = await supabase.from('tasks').insert({
                        id: newTask.id,
                        user_id: session.user.id,
                        title: newTask.title,
                        context: newTask.context,
                        duration: newTask.duration,
                        priority: newTask.priority,
                        status: newTask.status,
                        created_at: new Date(newTask.createdAt).toISOString()
                    });

                    if (error) {
                        console.error('SUPABASE INSERT ERROR:', error.message, error.details, error.hint);
                    } else {
                        console.log('Task successfully synced to DB');
                    }
                } else {
                    console.warn('Task saved LOCALLY only (No active session detected during addTask)');
                }
            },

            updateTask: async (id, updates) => {
                // Optimistic Update
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));

                // Supabase Push
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Map updates to snake_case if necessary (e.g. createdAt -> created_at)
                    // For now, keys mostly match or aren't updated often except status/title
                    const dbUpdates = { ...updates };
                    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
                    if (error) console.error('Error updating task in Supabase:', error);
                }
            },

            toggleTask: async (id) => {
                const task = get().tasks.find(t => t.id === id);
                if (!task) return;

                const newStatus = task.status === 'TODO' ? 'DONE' : 'TODO';

                // Optimistic Update
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, status: newStatus } : t
                    ),
                }));

                // Supabase Push
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
                    if (error) console.error('Error toggling task in Supabase:', error);
                }
            },

            deleteTask: async (id) => {
                // Optimistic Update
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));

                // Supabase Push
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { error } = await supabase.from('tasks').delete().eq('id', id);
                    if (error) console.error('Error deleting task in Supabase:', error);
                }
            },
        }),
        {
            name: 'task-storage',
            // Only persist if NOT logged in? 
            // Actually, persisting is fine as a cache.
            // But we should be careful about duplicate IDs if we sync.
            // For MVP, we trust Supabase as single source if logged in.
        }
    )
);
