import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAuth = create((set) => ({
  user: null,
  session: null,
  loading: true,

  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user, session, loading: false });
    
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user, session });
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user, session: data.session });
    return { user: data.user };
  },

  signup: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;

    // Attempt to upsert profile, but catch errors to prevent blocking sign up
    if (data.user?.id) {
      try {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          saved_certs: [],
          career_goal: null
        });
      } catch (err) {
        console.warn('Failed to create profile row:', err);
      }
    }

    set({ user: data.user, session: data.session });
    return { user: data.user, session: data.session };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  }
}));
