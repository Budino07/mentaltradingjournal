
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/login/LoginForm";
import { PasswordResetForm } from "@/components/login/PasswordResetForm";
import { ForgotPasswordForm } from "@/components/login/ForgotPasswordForm";
import { AuthLinks } from "@/components/login/AuthLinks";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  useEffect(() => {
    const checkForAuthToken = async () => {
      // Check URL hash for errors
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorDescription || "An error occurred during authentication",
        });
        // Clear the hash
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Check for email confirmation vs password reset
      const queryParams = new URLSearchParams(window.location.search);
      const type = queryParams.get('type');

      console.log("Auth check:", { 
        type,
        hash: window.location.hash,
        search: window.location.search 
      });

      // Handle email confirmation
      if (type === 'signup' || hashParams.get('type') === 'signup') {
        toast({
          title: "Email confirmed",
          description: "Your email has been confirmed. You can now sign in.",
        });
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Handle password reset
      if (type === 'recovery' || hashParams.get('type') === 'recovery') {
        setIsResetPassword(true);
        toast({
          title: "Reset Password",
          description: "Please enter your new password below.",
        });
      }
    };

    checkForAuthToken();
  }, [toast]);

  useEffect(() => {
    if (user && !isResetPassword) {
      navigate(returnTo);
    }
  }, [user, navigate, isResetPassword, returnTo]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "Please sign in with your new password.",
      });
      
      setPassword("");
      setConfirmPassword("");
      setIsResetPassword(false);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while resetting your password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetPassword) {
        return handleResetPassword(e);
      }

      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        toast({
          title: "Password reset email sent",
          description: "Please check your email to reset your password.",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        });
      } else {
        await signIn(email, password);
        navigate(returnTo);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0A1F] p-4 overflow-x-hidden">
      {/* Glow Effects */}
      <div className="fixed top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="fixed bottom-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
      <div className="fixed top-1/3 right-1/3 w-80 h-80 bg-accent/20 rounded-full blur-[90px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-5 sm:space-y-6 backdrop-blur-xl bg-[#1A1A2E]/80 border border-white/10 shadow-[0_0_25px_rgba(110,89,165,0.3)] z-10 animate-scale-in">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Welcome to Mental</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isResetPassword
              ? "Create a new password"
              : isForgotPassword
              ? "Reset your password"
              : isSignUp
              ? "Create an account"
              : "Sign in to your account"}
          </p>
        </div>

        {isResetPassword ? (
          <PasswordResetForm
            password={password}
            confirmPassword={confirmPassword}
            loading={loading}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
            onSubmit={handleSubmit}
          />
        ) : isForgotPassword ? (
          <ForgotPasswordForm
            email={email}
            loading={loading}
            onEmailChange={(e) => setEmail(e.target.value)}
            onSubmit={handleSubmit}
          />
        ) : (
          <LoginForm
            email={email}
            password={password}
            isSignUp={isSignUp}
            loading={loading}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
          />
        )}

        <AuthLinks
          isSignUp={isSignUp}
          isForgotPassword={isForgotPassword}
          isResetPassword={isResetPassword}
          onSignUpToggle={() => setIsSignUp(!isSignUp)}
          onForgotPassword={() => setIsForgotPassword(true)}
          onBackToSignIn={() => {
            setIsForgotPassword(false);
            setIsResetPassword(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      </Card>
    </div>
  );
};

export default Login;
