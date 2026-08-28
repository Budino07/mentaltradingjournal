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
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...options].sort((a, b) => {
        // Keep already-selected traders pinned at the top of the list.
        const sa = selected.includes(a.user_id) ? 0 : 1;
        const sb = selected.includes(b.user_id) ? 0 : 1;
        if (sa !== sb) return sa - sb;
        return (a.email || a.full_name || "").localeCompare(b.email || b.full_name || "");
      }),
    [options, selected]
  );

  const label = (o: TraderOption) => o.email || o.full_name || o.user_id;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    // Clear the query so the next trader can be searched immediately.
    setQuery("");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-between gap-2 min-w-52">
            {selected.length === 0
              ? "All traders"
              : `${selected.length} trader${selected.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search by email or name, then click to add…"
            />
            <CommandList>
              <CommandEmpty>No trader found.</CommandEmpty>
              <CommandGroup heading="Tick a trader to select / deselect">
                {sorted.map((o) => {
                  const isSelected = selected.includes(o.user_id);
                  return (
                    <CommandItem
                      key={o.user_id}
                      value={`${o.email ?? ""} ${o.full_name ?? ""} ${o.user_id}`}
                      onSelect={() => toggle(o.user_id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "justify-between cursor-pointer gap-2",
                        isSelected && "bg-primary/10 text-primary"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/40"
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="truncate flex-1">{label(o)}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <div className="flex items-center justify-between border-t p-2">
              <span className="text-xs text-muted-foreground">
                {selected.length === 0
                  ? "All traders above the threshold"
                  : `${selected.length} selected for analysis`}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-sm p-0"
                    onClick={() => toggle(id)}
                    aria-label={`Remove ${o ? label(o) : "trader"}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
