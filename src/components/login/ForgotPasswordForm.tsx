
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ForgotPasswordForm = ({
  email,
  loading,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
          required
        />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
};
