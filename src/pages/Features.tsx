
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart2, 
  BookOpen, 
  Calendar, 
  LineChart,
  NotebookPen,
  CheckCircle2,
  Target,
  TrendingUp,
  Medal,
  ChartBar,
  History,
  Timer,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Features = () => {
  const { user, signOut, updateUsername } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");

  const handleUpdateUsername = async () => {
    try {
      await updateUsername(username);
      setIsEditing(false);
      toast("Username updated successfully");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update username");
    }
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;

  return (
    <div className="min-h-screen bg-[#000B18]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000B18]/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            Mental
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
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
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 pt-12">
          Everything In One Location
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-8">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Pre-Session Check In
            </h2>
            <p className="text-lg text-muted-foreground">
              Start your trading day on the right foot by checking off pre-trading activities that promote focus
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon={BarChart2} text="Write down how you feel at this moment, what's going on in your life, and what you want to achieve today." />
              <FeatureItem icon={NotebookPen} text="Detailed notes & comments for trade analysis" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12">
            <img 
              src="/lovable-uploads/b70a5c45-5d2d-4a9c-a885-3841b19ed6c2.png"
              alt="Pre-Session Check In Interface"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12 order-2 lg:order-1">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Analytics Preview"
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Post-Session Review
            </h2>
            <p className="text-lg text-muted-foreground">
              Look back on your trading day and reflect on how it went
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon={Target} text="Which trading rules did you follow? Which did you break?" />
              <FeatureItem icon={TrendingUp} text="Compile observations of the market through screenshots, analyze how these will help your next trading day" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Psychology Metrics
            </h2>
            <p className="text-lg text-muted-foreground">
              Gain insight into your hidden behavioral patterns like never before, powered by AI
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon={NotebookPen} text="Identify exactly how you are holding yourself back in extreme detail through our Behavioral Slippage tool" />
              <FeatureItem icon={BookOpen} text="Discover your personalized route to breaking out of old habit patterns through our Emotional Recovery Time tool" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Notes Preview"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Cutting Edge Trading Analytics
            </h2>
            <p className="text-lg text-muted-foreground">
              Visualize all your trading data in beautiful charts
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon={Target} text="Utilize state of the art metrics like Maximum Adverse Excursion to level up your strategy" />
              <FeatureItem icon={Medal} text="Find out if the trades you're taking are even worth it through our P&L Distribution tool" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12 order-2 lg:order-1">
            <img 
              src="/lovable-uploads/871474ba-41ef-4e5d-ad53-f98502fd473b.png"
              alt="Analytics Charts"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Backtesting Journal
            </h2>
            <p className="text-lg text-muted-foreground">
              Gain valuable insights from your trading history. Identify patterns, learn from mistakes, and continuously improve your trading strategy
            </p>
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon={BookOpen} text="Test out new strategies with simple but effective tools" />
              <FeatureItem icon={LineChart} text="Refine existing strategies with unlimited trade entries" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Insights Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-3 bg-accent/10 rounded-lg p-4 hover:bg-accent/20 transition-colors">
    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
    <span className="text-base font-medium">{text}</span>
  </div>
);

export default Features;
