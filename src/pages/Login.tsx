
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  // Only redirect if user is logged in and NOT in reset password mode
  useEffect(() => {
    if (user && !isResetPassword) {
      navigate("/dashboard");
    }
  }, [user, navigate, isResetPassword]);

  // Check for recovery token in URL
  useEffect(() => {
    const checkForRecoveryToken = async () => {
      try {
        const fragments = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = fragments.get('access_token');
        const type = fragments.get('type');
        
        if (accessToken && type === 'recovery') {
          setIsResetPassword(true);
          toast({
            title: "Reset Password",
            description: "Please enter your new password below.",
          });
        }
      } catch (error) {
        console.error('Error checking recovery token:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to process password reset. Please try again.",
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
      
      // Clear passwords
      setPassword("");
      setConfirmPassword("");
      setIsResetPassword(false);
      
      // Clear the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Force logout to ensure security
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
        navigate("/dashboard");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isResetPassword && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          {!isForgotPassword && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={isResetPassword ? "New Password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {isResetPassword && (
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              )}
            </div>
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isResetPassword ? (
              "Set New Password"
            ) : isForgotPassword ? (
              "Send Reset Link"
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="space-y-2 text-center">
          {!isResetPassword && !isForgotPassword && (
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Button>
          )}
          {!isSignUp && !isForgotPassword && !isResetPassword && (
            <Button
              variant="link"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm block mx-auto"
            >
              Forgot your password?
            </Button>
          )}
          {(isForgotPassword || isResetPassword) && (
            <Button
              variant="link"
              onClick={() => {
                setIsForgotPassword(false);
                setIsResetPassword(false);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="text-sm"
            >
              Back to Sign In
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
