import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConditionRow, type Condition } from "./ConditionRow";
import { Separator } from "@/components/ui/separator";

export interface Stage {
  id: string;
  stageNumber: number;
  dependsOnStage: number | null;
  timeRelation: "after" | "before" | "within" | null;
  timeWindowDays: number | null;
  conditions: Condition[];
}

interface StageCardProps {
  stage: Stage;
  availableStages: number[];
  onUpdate: (id: string, updates: Partial<Stage>) => void;
  onRemove: (id: string) => void;
  onAddCondition: (stageId: string) => void;
  onUpdateCondition: (stageId: string, conditionId: string, updates: Partial<Condition>) => void;
  onRemoveCondition: (stageId: string, conditionId: string) => void;
}

export function StageCard({
  stage,
  availableStages,
  onUpdate,
  onRemove,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: StageCardProps) {
  const showTimeRelation = stage.dependsOnStage !== null;

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

        {/* Stage Dependency Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Conditions */}
        <div className="space-y-4">
          {stage.conditions.map((condition) => (
            <ConditionRow
              key={condition.id}
              condition={condition}
              availableStages={availableStages}
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
