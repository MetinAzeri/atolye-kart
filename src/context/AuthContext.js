import React from "react";
import { supabase } from "../supabaseClient.js";

const { createContext, useContext, useState, useEffect, useMemo } = React;

const AuthContext = createContext(null);

function toUser(session) {
  if (!session || !session.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.user_metadata?.username ?? session.user.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toUser(session));
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signup(email, password, username) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const value = useMemo(
    () => ({ user, login, signup, logout, loading }),
    [user, loading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
