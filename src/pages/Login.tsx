
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
    if (user && !isResetPassword) {
      navigate(returnTo);
    }
  }, [user, navigate, isResetPassword, returnTo]);

  useEffect(() => {
    const checkForRecoveryToken = async () => {
      const fragments = new URLSearchParams(window.location.hash.substring(1));
      const type = fragments.get('type');

      if (type === 'recovery') {
        setIsResetPassword(true);
        toast({
          title: "Reset Password",
          description: "Please enter your new password below.",
        });
      }
    };

    checkForRecoveryToken();
  }, [toast]);

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to Mental</h1>
          <p className="text-muted-foreground">
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
