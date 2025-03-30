import { Home, BookOpen, BarChart2, Menu, User, BrainCircuit, FlaskConical, Notebook, LineChart, Settings, UserCog } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotificationBell } from "@/components/ui/notification-bell";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const { user, signOut, updateUsername } = useAuth();
  const [showMentorDialog, setShowMentorDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { icon: BookOpen, label: "Dashboard", path: "/dashboard" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
  ];

  const sidebarItems = [
    { title: "Journal Entry", icon: Home, url: "/journal-entry" },
    { title: "Dashboard", icon: BookOpen, url: "/dashboard" },
    { title: "Analytics", icon: BarChart2, url: "/analytics" },
    { title: "Backtesting", icon: FlaskConical, url: "/backtesting" },
    { title: "MFE & MAE Analysis", icon: LineChart, url: "/mfe-mae" },
    { title: "Notebook", icon: Notebook, url: "/notebook" },
    { title: "Settings", icon: Settings, url: "/settings" },
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

  // Close mobile sidebar when navigating to a new page
  const handleNavigation = () => {
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-[#9b87f5] to-[#FEC6A1] bg-clip-text text-transparent">Mental</span>
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

          {user && <NotificationBell />}

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
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            {user && (
              <div className="flex justify-end mt-2 mb-2">
                <NotificationBell />
              </div>
            )}
            
            <nav className="flex flex-col gap-4 mt-6">
              {/* App Navigation Items */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground px-2">Navigation</h4>
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.url}
                      variant="ghost"
                      asChild
                      className={cn(
                        "justify-start w-full",
                        location.pathname === item.url
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                      onClick={handleNavigation}
                    >
                      <Link to={item.url} className="flex items-center gap-2 px-2">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    className="justify-start w-full text-muted-foreground"
                    onClick={() => setShowMentorDialog(true)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    <span>Mentor Mode</span>
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-border/40 pt-4 mt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Account</h4>
                <ThemeToggle />
                {user ? (
                  <div className="space-y-2 mt-4">
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
                  <div className="space-y-2 mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/pricing">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restricted Access</DialogTitle>
            <DialogDescription>
              Access to this feature is restricted. Only members of Tenacity Group are authorized to use it.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
}
