
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordResetFormProps {
  password: string;
  confirmPassword: string;
  loading: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordResetForm = ({
  password,
  confirmPassword,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: PasswordResetFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={onPasswordChange}
          required
          minLength={6}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          required
          minLength={6}
        />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
        ) : (
          "Set New Password"
        )}
      </Button>
    </form>
  );
};
