import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Filter } from "./types";

interface FilterRowProps {
  filter: Filter;
  availableLists: Array<{ id: string; name: string }>;
  onUpdate: (updates: Partial<Filter>) => void;
  onRemove: () => void;
}

const filterFields = [
  { value: "transaction_type", label: "Transaction Type" },
  { value: "amount", label: "Amount" },
  { value: "country", label: "Country" },
  { value: "channel", label: "Channel" },
  { value: "counterparty_name", label: "Counterparty Name" },
  { value: "counterparty_type", label: "Counterparty Type" },
  { value: "merchant_category", label: "Merchant Category" },
  { value: "currency", label: "Currency" },
  { value: "account_type", label: "Account Type" },
];

const filterOperators = [
  { value: "=", label: "Equals (=)" },
  { value: "!=", label: "Not equals (≠)" },
  { value: ">", label: "Greater than (>)" },
  { value: "<", label: "Less than (<)" },
  { value: ">=", label: "Greater or equal (≥)" },
  { value: "<=", label: "Less or equal (≤)" },
  { value: "in", label: "In list" },
  { value: "notIn", label: "Not in list" },
  { value: "contains", label: "Contains" },
];

export function FilterRow({ filter, availableLists, onUpdate, onRemove }: FilterRowProps) {
  const showListSelector = filter.op === "in" || filter.op === "notIn";
  const showValueInput = !showListSelector;

  return (
    <div className="flex gap-2 items-start p-3 bg-muted/50 rounded-md border border-border/50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Field */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Field</Label>
          <Select
            value={filter.field}
            onValueChange={(value) => onUpdate({ field: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {filterFields.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Operator</Label>
          <Select
            value={filter.op}
            onValueChange={(value) => onUpdate({ op: value as Filter["op"], listId: null, value: null })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {filterOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value or List */}
        {showListSelector ? (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">List</Label>
            <Select
              value={filter.listId || ""}
              onValueChange={(value) => onUpdate({ listId: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {availableLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : showValueInput ? (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Value</Label>
            <Input
              className="h-9"
              placeholder="e.g., deposit"
              value={filter.value?.toString() ?? ""}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          </div>
        ) : null}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive mt-5 h-9 w-9"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
