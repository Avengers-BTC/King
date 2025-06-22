import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserInput } from "@/lib/actions/auth";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("[useAuth] Attempting login for:", email);
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("[useAuth] Login result:", result);

      if (result?.error) {
        toast.error(result.error);
        return false;
      }
      
      // After successful login, update session to get the latest user data
      console.log("[useAuth] Login successful, updating session");
      await update();
      
      toast.success("Welcome back!");
      
      // Force navigation based on user role
      if (session?.user?.role === "DJ") {
        console.log("[useAuth] Redirecting to DJ dashboard");
        if (typeof window !== 'undefined') {
          window.location.href = "/dj/dashboard";
        } else {
          router.push("/dj/dashboard");
        }
      } else {
        console.log("[useAuth] Redirecting to user dashboard");
        if (typeof window !== 'undefined') {
          window.location.href = "/dashboard";
        } else {
          router.push("/dashboard");
        }
      }
      return true;
    } catch (error) {
      toast.error("An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("An error occurred during Google sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserInput) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto login after successful registration
      const loginResult = await login(userData.email, userData.password);
      if (loginResult) {
        toast.success("Registration successful! Welcome to NightVibe!");
        router.push("/dashboard");
      }
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error logging out");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    status,
    isLoading,
    isAuthenticated: status === "authenticated",
    user: session?.user,
    login,
    register,
    logout,
    updateSession: update,
    signInWithGoogle,
  };
} 
