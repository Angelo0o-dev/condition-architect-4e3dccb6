import { X, Plus, Filter as FilterIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { FilterRow } from "./FilterRow";
import type { Condition, Filter } from "./types";

// Re-export for backward compatibility
export type { Condition } from "./types";

interface ConditionRowProps {
  condition: Condition;
  availableStages: number[];
  availableLists: Array<{ id: string; name: string }>;
  onUpdate: (id: string, updates: Partial<Condition>) => void;
  onRemove: (id: string) => void;
}

const aggregateFunctions = [
  { value: "none", label: "None" },
  { value: "avg", label: "Average" },
  { value: "sum", label: "Sum" },
  { value: "count", label: "Count" },
  { value: "max", label: "Max" },
  { value: "min", label: "Min" },
  { value: "mode", label: "Mode" },
  { value: "countDistinct", label: "Count Distinct" },
  { value: "countUnique", label: "Count Unique" },
  { value: "distinctValues", label: "Distinct Values" },
];

const targetFields = [
  { value: "amount", label: "Amount", type: "numeric" },
  { value: "transaction_count", label: "Transaction Count", type: "numeric" },
  { value: "transaction_type", label: "Transaction Type", type: "category" },
  { value: "counterparty_name", label: "Counterparty Name", type: "text" },
  { value: "country", label: "Country", type: "category" },
  { value: "merchant", label: "Merchant", type: "text" },
  { value: "merchant_category", label: "Merchant Category", type: "category" },
  { value: "customer_id", label: "Customer ID", type: "text" },
  { value: "account_id", label: "Account ID", type: "text" },
];

const transactionTypes = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "transfer", label: "Transfer" },
];

const operators = [
  { value: ">", label: "Greater than (>)" },
  { value: "<", label: "Less than (<)" },
  { value: ">=", label: "Greater than or equal (≥)" },
  { value: "<=", label: "Less than or equal (≤)" },
  { value: "=", label: "Equal to (=)" },
  { value: "!=", label: "Not equal to (!=)" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not contains" },
  { value: "% of", label: "Percentage of (%)" },
];

export function ConditionRow({ condition, availableStages, availableLists, onUpdate, onRemove }: ConditionRowProps) {
  const selectedField = targetFields.find((f) => f.value === condition.targetField);
  const showTimeWindow = condition.aggregateFunction !== "none";
  const showTransactionType = condition.targetField === "transaction_type";
  const isNumericField = selectedField?.type === "numeric";
  const showThresholdTypeSelector = isNumericField;

  // Condition-level filters handlers
  const handleAddConditionFilter = () => {
    const newFilter: Filter = {
      id: Date.now().toString(),
      field: "",
      op: "=",
      value: null,
    };
    const currentFilters = condition.filters || [];
    onUpdate(condition.id, { filters: [...currentFilters, newFilter] });
  };

  const handleUpdateConditionFilter = (index: number, updates: Partial<Filter>) => {
    const currentFilters = condition.filters || [];
    const newFilters = [...currentFilters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onUpdate(condition.id, { filters: newFilters });
  };

  const handleRemoveConditionFilter = (index: number) => {
    const currentFilters = condition.filters || [];
    const newFilters = currentFilters.filter((_, i) => i !== index);
    onUpdate(condition.id, { filters: newFilters.length > 0 ? newFilters : null });
  };

  const conditionFilters = condition.filters || [];

  return (
    <Card className="p-6 relative border-border bg-card shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(condition.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aggregate Function */}
        <div className="space-y-2">
          <Label htmlFor={`aggregate-${condition.id}`}>Aggregate Function</Label>
          <Select
            value={condition.aggregateFunction}
            onValueChange={(value) =>
              onUpdate(condition.id, {
                aggregateFunction: value as Condition["aggregateFunction"],
                timeWindow: value === "none" ? null : condition.timeWindow,
              })
            }
          >
            <SelectTrigger id={`aggregate-${condition.id}`}>
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {aggregateFunctions.map((func) => (
                <SelectItem key={func.value} value={func.value}>
                  {func.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Window - Conditional */}
        {showTimeWindow && (
          <div className="space-y-2">
            <Label htmlFor={`time-${condition.id}`}>Time Window (Days)</Label>
            <Input
              id={`time-${condition.id}`}
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={condition.timeWindow ?? ""}
              onChange={(e) =>
                onUpdate(condition.id, {
                  timeWindow: parseInt(e.target.value) || null,
                })
              }
            />
          </div>
        )}

        {/* Target Field */}
        <div className="space-y-2">
          <Label htmlFor={`target-${condition.id}`}>Target Field</Label>
          <Select
            value={condition.targetField ?? ""}
            onValueChange={(value) =>
              onUpdate(condition.id, {
                targetField: value,
                threshold: "",
                selectedList: null,
              })
            }
          >
            <SelectTrigger id={`target-${condition.id}`}>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {targetFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator */}
        <div className="space-y-2">
          <Label htmlFor={`operator-${condition.id}`}>Operator</Label>
          <Select
            value={condition.operator}
            onValueChange={(value) => onUpdate(condition.id, { operator: value as Condition["operator"] })}
          >
            <SelectTrigger id={`operator-${condition.id}`}>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction Type - Conditional */}
        {showTransactionType && (
          <div className="space-y-2">
            <Label htmlFor={`txn-type-${condition.id}`}>Transaction Type</Label>
            <Select
              value={condition.transactionType ?? ""}
              onValueChange={(value) => onUpdate(condition.id, { transactionType: value })}
            >
              <SelectTrigger id={`txn-type-${condition.id}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Threshold Type Selector */}
        {showThresholdTypeSelector && (
          <div className="space-y-2">
            <Label htmlFor={`threshold-type-${condition.id}`}>Threshold Type</Label>
            <Select
              value={condition.thresholdType ?? "literal"}
              onValueChange={(value) =>
                onUpdate(condition.id, {
                  thresholdType: value as "literal" | "percentage" | "reference",
                  threshold: "",
                  referenceStage: value === "reference" ? condition.referenceStage : null,
                })
              }
            >
              <SelectTrigger id={`threshold-type-${condition.id}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="literal">Literal Value</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="reference">Reference Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Threshold Input - Dynamic */}
        {condition.thresholdType !== "reference" && (
          <div className="space-y-2">
            <Label htmlFor={`threshold-${condition.id}`}>
              {condition.thresholdType === "percentage" ? "Percentage (%)" : "Threshold"}
            </Label>
            <Input
              id={`threshold-${condition.id}`}
              type={isNumericField ? "number" : "text"}
              placeholder={
                condition.thresholdType === "percentage"
                  ? "e.g., 50"
                  : isNumericField
                  ? "e.g., 500000"
                  : "e.g., keyword"
              }
              value={condition.threshold}
              onChange={(e) =>
                onUpdate(condition.id, {
                  threshold: isNumericField ? parseFloat(e.target.value) || "" : e.target.value,
                })
              }
            />
          </div>
        )}

        {/* Cross-Stage Reference */}
        {condition.thresholdType === "reference" && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`ref-stage-${condition.id}`}>Reference Stage</Label>
              <Select
                value={condition.referenceStage?.stageNumber.toString() ?? ""}
                onValueChange={(value) =>
                  onUpdate(condition.id, {
                    referenceStage: {
                      stageNumber: parseInt(value),
                      metric: condition.referenceStage?.metric ?? "sum",
                    },
                  })
                }
              >
                <SelectTrigger id={`ref-stage-${condition.id}`}>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {availableStages.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Stage {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`ref-metric-${condition.id}`}>Metric</Label>
              <Select
                value={condition.referenceStage?.metric ?? "sum"}
                onValueChange={(value) =>
                  onUpdate(condition.id, {
                    referenceStage: condition.referenceStage
                      ? { ...condition.referenceStage, metric: value as any }
                      : null,
                  })
                }
              >
                <SelectTrigger id={`ref-metric-${condition.id}`}>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="sum">SUM</SelectItem>
                  <SelectItem value="avg">AVG</SelectItem>
                  <SelectItem value="count">COUNT</SelectItem>
                  <SelectItem value="max">MAX</SelectItem>
                  <SelectItem value="min">MIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Condition-Level Filters Section */}
      <Collapsible className="mt-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between gap-2 text-muted-foreground hover:text-foreground">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span>Condition Filters ({conditionFilters.length})</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Applies only to this metric — use when a particular condition needs extra narrowing.
          </p>
          
          {conditionFilters.length > 0 && (
            <div className="space-y-2">
              {conditionFilters.map((filter, index) => (
                <FilterRow
                  key={filter.id}
                  filter={filter}
                  availableLists={availableLists}
                  onUpdate={(updates) => handleUpdateConditionFilter(index, updates)}
                  onRemove={() => handleRemoveConditionFilter(index)}
                />
              ))}
            </div>
          )}

          <Button onClick={handleAddConditionFilter} size="sm" variant="outline" className="gap-2">
            <Plus className="h-3 w-3" />
            Add Condition Filter
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
