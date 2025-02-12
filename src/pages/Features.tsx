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
  Timer
} from "lucide-react";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
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
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Centered Title - Added extra top padding */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 pt-12">
          Everything In One Location
        </h1>

        {/* First Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-8">
          {/* Left Column - Text Content */}
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
              <FeatureItem icon={LineChart} text="In-depth profitability tracking and charts" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          {/* Right Column - Dashboard Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Second Section (Flipped) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          {/* Left Column - Dashboard Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12 order-2 lg:order-1">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Analytics Preview"
              className="w-full h-auto"
            />
          </div>

          {/* Right Column - Text Content */}
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
              <FeatureItem icon={ChartBar} text="Generate customized performance reports" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Third Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          {/* Left Column - Text Content */}
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
              <FeatureItem icon={LineChart} text="Add chart annotations and technical analysis" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          {/* Right Column - Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Notes Preview"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Fourth Section (Flipped) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          {/* Left Column - Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl lg:-mt-12 order-2 lg:order-1">
            <img 
              src="/lovable-uploads/e9c68a6a-c499-475b-9518-7ba15509fc57.png"
              alt="Goals Preview"
              className="w-full h-auto"
            />
          </div>

          {/* Right Column - Text Content */}
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
              <FeatureItem icon={TrendingUp} text="Monitor long-term growth and progress" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Fifth Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
          {/* Left Column - Text Content */}
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
              <FeatureItem icon={NotebookPen} text="Write down all the notes you need without fear of writing too much, it's all for you!" />
            </div>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>

          {/* Right Column - Image */}
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
