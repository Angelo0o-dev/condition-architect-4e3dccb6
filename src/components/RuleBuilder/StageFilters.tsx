import { Plus, Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterRow } from "./FilterRow";
import type { Filter } from "./types";

interface StageFiltersProps {
  filters: Filter[];
  availableLists: Array<{ id: string; name: string }>;
  onAddFilter: () => void;
  onUpdateFilter: (index: number, updates: Partial<Filter>) => void;
  onRemoveFilter: (index: number) => void;
}

export function StageFilters({
  filters,
  availableLists,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
}: StageFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Stage Filters (Row Filters)</Label>
        </div>
        <Button onClick={onAddFilter} size="sm" variant="outline" className="gap-2 h-8">
          <Plus className="h-3 w-3" />
          Add Filter
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Applied before grouping/conditions — use for transaction_type, channel, country, list membership.
      </p>

      {filters.length > 0 && (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              availableLists={availableLists}
              onUpdate={(updates) => onUpdateFilter(index, updates)}
              onRemove={() => onRemoveFilter(index)}
            />
          ))}
        </div>
      )}

      {filters.length === 0 && (
        <div className="text-xs text-muted-foreground/70 italic py-2">
          No stage filters defined. All transactions will be considered.
        </div>
      )}
    </div>
  );
}
