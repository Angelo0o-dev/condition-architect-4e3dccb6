import { Plus, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConditionRow } from "./ConditionRow";
import { StageFilters } from "./StageFilters";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Stage, Condition, Filter } from "./types";

// Re-export types for backward compatibility
export type { Stage, Condition, Filter } from "./types";

interface StageCardProps {
  stage: Stage;
  availableStages: number[];
  availableLists: Array<{ id: string; name: string }>;
  onUpdate: (id: string, updates: Partial<Stage>) => void;
  onRemove: (id: string) => void;
  onAddCondition: (stageId: string) => void;
  onUpdateCondition: (stageId: string, conditionId: string, updates: Partial<Condition>) => void;
  onRemoveCondition: (stageId: string, conditionId: string) => void;
}

export function StageCard({
  stage,
  availableStages,
  availableLists,
  onUpdate,
  onRemove,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: StageCardProps) {
  const showTimeRelation = stage.dependsOnStage !== null;

  const groupByOptions = [
    { value: "account_id", label: "Account ID" },
    { value: "customer_id", label: "Customer ID" },
    { value: "sender_id", label: "Sender ID" },
    { value: "receiver_id", label: "Receiver ID" },
    { value: "branch_id", label: "Branch ID" },
    { value: "phone_number", label: "Phone Number" },
    { value: "merchant_id", label: "Merchant ID" },
    { value: "teller_id", label: "Teller ID" },
  ];

  const correlationKeyOptions = [
    { value: "account_id", label: "Account ID" },
    { value: "customer_id", label: "Customer ID" },
    { value: "transaction_id", label: "Transaction ID" },
    { value: "phone_number", label: "Phone Number" },
    { value: "email", label: "Email" },
  ];

  const addCorrelationKey = (key: string) => {
    if (!stage.correlationKeys.includes(key)) {
      onUpdate(stage.id, {
        correlationKeys: [...stage.correlationKeys, key],
      });
    }
  };

  const removeCorrelationKey = (key: string) => {
    onUpdate(stage.id, {
      correlationKeys: stage.correlationKeys.filter((k) => k !== key),
    });
  };

  // Stage-level row filters handlers
  const handleAddRowFilter = () => {
    const newFilter: Filter = {
      id: Date.now().toString(),
      field: "",
      op: "=",
      value: null,
    };
    onUpdate(stage.id, {
      rowFilters: [...stage.rowFilters, newFilter],
    });
  };

  const handleUpdateRowFilter = (index: number, updates: Partial<Filter>) => {
    const newFilters = [...stage.rowFilters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onUpdate(stage.id, { rowFilters: newFilters });
  };

  const handleRemoveRowFilter = (index: number) => {
    const newFilters = stage.rowFilters.filter((_, i) => i !== index);
    onUpdate(stage.id, { rowFilters: newFilters });
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            Stage {stage.stageNumber}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(stage.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Advanced Stage Configuration */}
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GroupBy */}
            <div className="space-y-2">
              <Label htmlFor={`groupby-${stage.id}`}>Group By</Label>
              <Select
                value={typeof stage.groupBy === "string" ? stage.groupBy : stage.groupBy?.[0] ?? "none"}
                onValueChange={(value) =>
                  onUpdate(stage.id, {
                    groupBy: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger id={`groupby-${stage.id}`}>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="none">None</SelectItem>
                  {groupByOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Output Name */}
            <div className="space-y-2">
              <Label htmlFor={`output-name-${stage.id}`}>Output Name</Label>
              <Input
                id={`output-name-${stage.id}`}
                placeholder="e.g., sum_incoming, unique_recipients"
                value={stage.outputName ?? ""}
                onChange={(e) =>
                  onUpdate(stage.id, {
                    outputName: e.target.value || null,
                  })
                }
              />
            </div>

            {/* Output Mode */}
            <div className="space-y-2">
              <Label htmlFor={`output-mode-${stage.id}`}>Output Mode</Label>
              <Select
                value={stage.outputMode ?? "aggregates"}
                onValueChange={(value) =>
                  onUpdate(stage.id, {
                    outputMode: value as "rows" | "aggregates" | "both",
                  })
                }
              >
                <SelectTrigger id={`output-mode-${stage.id}`}>
                  <SelectValue placeholder="Aggregates" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="aggregates">Aggregates</SelectItem>
                  <SelectItem value="rows">Rows</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stage Time Window */}
            <div className="space-y-2">
              <Label htmlFor={`stage-timewindow-${stage.id}`}>Stage Time Window (Days)</Label>
              <Input
                id={`stage-timewindow-${stage.id}`}
                type="number"
                min="1"
                placeholder="e.g., 7"
                value={stage.stageTimeWindowDays ?? ""}
                onChange={(e) =>
                  onUpdate(stage.id, {
                    stageTimeWindowDays: parseInt(e.target.value) || null,
                  })
                }
              />
            </div>
          </div>

          {/* Correlation Keys */}
          <div className="space-y-2">
            <Label>Correlation Keys</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {stage.correlationKeys.map((key) => (
                <Badge key={key} variant="secondary" className="gap-1">
                  {key}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeCorrelationKey(key)}
                  />
                </Badge>
              ))}
            </div>
            <Select onValueChange={addCorrelationKey}>
              <SelectTrigger>
                <SelectValue placeholder="Add correlation key" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {correlationKeyOptions
                  .filter((opt) => !stage.correlationKeys.includes(opt.value))
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Stage Dependency Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`depends-${stage.id}`}>Depends On Stage</Label>
            <Select
              value={stage.dependsOnStage?.toString() ?? "none"}
              onValueChange={(value) =>
                onUpdate(stage.id, {
                  dependsOnStage: value === "none" ? null : parseInt(value),
                  timeRelation: value === "none" ? null : stage.timeRelation,
                  timeWindowDays: value === "none" ? null : stage.timeWindowDays,
                })
              }
            >
              <SelectTrigger id={`depends-${stage.id}`}>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="none">None</SelectItem>
                {availableStages.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    Stage {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showTimeRelation && (
            <>
              <div className="space-y-2">
                <Label htmlFor={`relation-${stage.id}`}>Time Relation</Label>
                <Select
                  value={stage.timeRelation ?? "within"}
                  onValueChange={(value) =>
                    onUpdate(stage.id, {
                      timeRelation: value as "after" | "before" | "within",
                    })
                  }
                >
                  <SelectTrigger id={`relation-${stage.id}`}>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="within">Occurs within</SelectItem>
                    <SelectItem value="after">Occurs after</SelectItem>
                    <SelectItem value="before">Occurs before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`timewindow-${stage.id}`}>Time Window (Days)</Label>
                <Input
                  id={`timewindow-${stage.id}`}
                  type="number"
                  min="1"
                  placeholder="e.g., 3"
                  value={stage.timeWindowDays ?? ""}
                  onChange={(e) =>
                    onUpdate(stage.id, {
                      timeWindowDays: parseInt(e.target.value) || null,
                    })
                  }
                />
              </div>
            </>
          )}
        </div>

        <Separator className="my-4" />

        {/* Stage-Level Row Filters */}
        <StageFilters
          filters={stage.rowFilters}
          availableLists={availableLists}
          onAddFilter={handleAddRowFilter}
          onUpdateFilter={handleUpdateRowFilter}
          onRemoveFilter={handleRemoveRowFilter}
        />
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Conditions */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Conditions</Label>
          {stage.conditions.map((condition) => (
            <ConditionRow
              key={condition.id}
              condition={condition}
              availableStages={availableStages}
              availableLists={availableLists}
              onUpdate={(id, updates) => onUpdateCondition(stage.id, id, updates)}
              onRemove={(id) => onRemoveCondition(stage.id, id)}
            />
          ))}
        </div>

        <Separator />

        {/* Add Condition Button */}
        <Button
          variant="outline"
          onClick={() => onAddCondition(stage.id)}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Condition to Stage {stage.stageNumber}
        </Button>
      </CardContent>
    </Card>
  );
}
