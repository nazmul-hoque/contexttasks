'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');
    const [isSignUp, setIsSignUp] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);

        try {
            if (authMethod === 'magic') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        data: { full_name: name }
                    }
                });
                if (error) throw error;
                setSent(true);
                toast.success('Magic link sent!');
            } else {
                // Password Auth
                if (isSignUp) {
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: { data: { full_name: name } }
                    });
                    if (error) throw error;
                    toast.success('Account created! Please check your email to confirm.');
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                    if (error) throw error;
                    // Auto-redirect happens via AuthProvider state change
                    toast.success('Welcome back!');
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background text-foreground">
            {/* Decor */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-card border border-white/5 p-8 rounded-3xl shadow-xl backdrop-blur-sm z-10"
            >
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">Sign in to sync your tasks & contexts.</p>
                </div>

                {/* Auth Method Toggle */}
                {!sent && (
                    <div className="flex p-1 bg-secondary/50 rounded-xl mb-6">
                        <button
                            onClick={() => setAuthMethod('magic')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'magic' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Magic Link
                        </button>
                        <button
                            onClick={() => setAuthMethod('password')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'password' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Password
                        </button>
                    </div>
                )}

                {sent ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="font-medium text-lg">Check your email</h3>
                        <p className="text-muted-foreground text-sm">
                            We sent a magic link to <strong className="text-foreground">{email}</strong>.
                            <br />Click it to sign in.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="text-primary text-sm hover:underline mt-4 block mx-auto"
                        >
                            Try a different email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {/* Name Field (Magic Link OR Sign Up) */}
                            {(authMethod === 'magic' || isSignUp) && (
                                <motion.div
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all"
                                    />
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            {authMethod === 'password' && (
                                <motion.div
                                    key="password-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label htmlFor="password" className="text-xs uppercase font-bold text-muted-foreground tracking-wider ml-1">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all"
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                authMethod === 'magic' ? 'Send Magic Link' : (isSignUp ? 'Create Account' : 'Sign In')
                            )}
                        </button>

                        {authMethod === 'password' && (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </motion.div>
        </main>
    );
}
