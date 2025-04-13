
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TimeFilter } from "@/hooks/useJournalFilters";

interface TimeFilterDropdownProps {
  timeFilter: TimeFilter;
  setTimeFilter: (value: TimeFilter) => void;
  label?: string;
}

export const TimeFilterDropdown = ({
  timeFilter,
  setTimeFilter,
  label = "Time Period"
}: TimeFilterDropdownProps) => {
  // Function to get a display name for each filter value
  const getFilterDisplayName = (filter: TimeFilter): string => {
    switch (filter) {
      case "this-month": return "This Month";
      case "last-month": return "Last Month";
      case "last-three-months": return "Last Three Months";
      case "last-year": return "Last Year";
      case "eternal": return "All-Time";
      case "custom": return "Custom Range";
      default: return "Select Period";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {label} {timeFilter && <span className="text-primary">{getFilterDisplayName(timeFilter)}</span>} 
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by Time</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTimeFilter("eternal")}>
          All-Time
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTimeFilter("this-month")}>
          This Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTimeFilter("last-month")}>
          Last Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTimeFilter("last-three-months")}>
          Last Three Months
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTimeFilter("last-year")}>
          Last Year
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
