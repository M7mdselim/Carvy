
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "admin" | "owner" | "user";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  userRole: UserRole;
  ownerId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, shouldRedirect?: boolean, role?: UserRole) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
        setIsOwner(false);
        setUserRole("user");
        setOwnerId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: isAdminData, error: adminError } = await supabase.rpc('grant_admin_access');
      if (adminError) throw adminError;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, owner_id')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      setIsAdmin(!!isAdminData);
      setIsOwner(!!profile?.owner_id);
      setOwnerId(profile?.owner_id || null);
      
      if (isAdminData) {
        setUserRole("admin");
      } else if (profile?.owner_id) {
        setUserRole("owner");
      } else {
        setUserRole("user");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
      setIsOwner(false);
      setUserRole("user");
      setOwnerId(null);
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, shouldRedirect: boolean = true, role: UserRole = "user") => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: role,
          }
        }
      });
      
      if (error) throw error;
      
      if (shouldRedirect) {
        toast({
          title: "Account Created",
          description: "Please check your email to confirm your account",
        });
        navigate("/login");
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isOwner,
        userRole,
        ownerId,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
