import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Users,
  RotateCcw,
  ChevronLeft,
  Megaphone,
  Filter,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { title: "Overview", icon: LayoutDashboard, url: "/admin" },
  { title: "Acquisition", icon: Megaphone, url: "/admin/acquisition" },
  { title: "Growth", icon: TrendingUp, url: "/admin/growth" },
  { title: "Engagement", icon: Activity, url: "/admin/engagement" },
  { title: "Retention", icon: RotateCcw, url: "/admin/retention" },
  { title: "Signup & activation", icon: Filter, url: "/admin/funnel" },
  { title: "Monetization", icon: DollarSign, url: "/admin/monetization" },
  { title: "Users", icon: Users, url: "/admin/users" },
  { title: "Takeaways", icon: Lightbulb, url: "/admin/takeaways" },
];

export function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="h-14 flex items-center justify-between px-3 border-b">
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">Admin Console</span>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active && "bg-primary/10 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
