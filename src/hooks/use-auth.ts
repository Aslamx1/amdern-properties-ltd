import { useEffect, useState } from "react";
import { supabase, type MockUser } from "@/integrations/supabase/client";

export type AuthSession = {
  user: MockUser;
  access_token: string;
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
        if (!cancelled) {
          setSession(next as AuthSession | null);
          setLoading(false);
        }
      });

      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setSession(data.session as AuthSession | null);
        setLoading(false);
      }

      return () => {
        cancelled = true;
        sub.subscription.unsubscribe();
      };
    }

    void init();
  }, []);

  const user: MockUser | null = session?.user ?? null;

  return { session, user, loading, signOut: () => supabase.auth.signOut() };
}
