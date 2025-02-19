
import { Button } from "@/components/ui/button";

interface AuthLinksProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  isResetPassword: boolean;
  onSignUpToggle: () => void;
  onForgotPassword: () => void;
  onBackToSignIn: () => void;
}

export const AuthLinks = ({
  isSignUp,
  isForgotPassword,
  isResetPassword,
  onSignUpToggle,
  onForgotPassword,
  onBackToSignIn,
}: AuthLinksProps) => {
  return (
    <div className="space-y-2 text-center">
      {!isResetPassword && !isForgotPassword && (
        <Button variant="link" onClick={onSignUpToggle} className="text-sm">
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      )}
      {!isSignUp && !isForgotPassword && !isResetPassword && (
        <Button
          variant="link"
          onClick={onForgotPassword}
          className="text-sm block mx-auto"
        >
          Forgot your password?
        </Button>
      )}
      {(isForgotPassword || isResetPassword) && (
        <Button variant="link" onClick={onBackToSignIn} className="text-sm">
          Back to Sign In
        </Button>
      )}
    </div>
  );
};
