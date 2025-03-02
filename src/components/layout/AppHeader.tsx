
import { Home, BookOpen, BarChart2, Menu, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const { user, signOut, updateUsername } = useAuth();
  
  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { icon: BookOpen, label: "Dashboard", path: "/dashboard" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
  ];

  const handleUpdateUsername = async () => {
    try {
      await updateUsername(username);
      setIsEditing(false);
      toast("Username updated successfully");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update username");
    }
  };

  const handleManageSubscription = () => {
    window.open("https://billing.stripe.com/p/login/dR617i4AUaWldbibII", "_blank");
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;

  return (
    <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold">Mental</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              asChild
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <Link to={item.path} className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}

          <ThemeToggle />

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{userEmail}</span>
                  <span className="inline-block sm:hidden">{displayName}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter new username"
                        />
                        <Button onClick={handleUpdateUsername}>Save</Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setUsername(displayName);
                          setIsEditing(true);
                        }}
                      >
                        Edit Username
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/pricing">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[280px]">
            <nav className="flex flex-col gap-4 mt-6">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  asChild
                  className={cn(
                    "justify-start",
                    location.pathname === item.path
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
              <ThemeToggle />
              {user ? (
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter new username"
                      />
                      <Button onClick={handleUpdateUsername} className="w-full">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setUsername(displayName);
                        setIsEditing(true);
                      }}
                    >
                      Edit Username
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/pricing">Get Started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
