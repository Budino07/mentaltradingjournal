import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface TraderOption {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

interface Props {
  options: TraderOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

/** Multi-select of specific traders (by email/name) used to scope the leaderboard + firm book. */
export function TraderSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...options].sort((a, b) =>
        (a.email || a.full_name || "").localeCompare(b.email || b.full_name || "")
      ),
    [options]
  );

  const label = (o: TraderOption) => o.email || o.full_name || o.user_id;

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-between gap-2 min-w-52">
            {selected.length === 0 ? "All traders" : `${selected.length} trader${selected.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search by email or name…" />
            <CommandList>
              <CommandEmpty>No trader found.</CommandEmpty>
              <CommandGroup>
                {sorted.map((o) => (
                  <CommandItem
                    key={o.user_id}
                    value={`${o.email ?? ""} ${o.full_name ?? ""}`}
                    onSelect={() => toggle(o.user_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(o.user_id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{label(o)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <>
          <div className="flex items-center gap-1 flex-wrap max-w-xl">
            {selected.slice(0, 4).map((id) => {
              const o = options.find((x) => x.user_id === id);
              return (
                <Badge key={id} variant="secondary" className="gap-1 text-[11px]">
                  <span className="truncate max-w-40">{o ? label(o) : id}</span>
                  <button type="button" onClick={() => toggle(id)} aria-label="Remove trader">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selected.length > 4 && (
              <Badge variant="secondary" className="text-[11px]">+{selected.length - 4} more</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>Clear</Button>
        </>
      )}
    </div>
  );
}
