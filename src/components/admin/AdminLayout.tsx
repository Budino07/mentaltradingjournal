import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { DateRange, Segment } from "@/hooks/useAdminAnalytics";
import { defaultRange } from "@/hooks/useAdminAnalytics";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [segment, setSegment] = useState<Segment>("all");

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar range={range} setRange={setRange} segment={segment} setSegment={setSegment} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet context={{ range, segment }} />
        </main>
      </div>
    </div>
  );
}
