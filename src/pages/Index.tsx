import { useState } from "react";
import { Plus, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StageCard, type Stage } from "@/components/RuleBuilder/StageCard";
import { type Condition } from "@/components/RuleBuilder/ConditionRow";
import { ListManager, type ListItem } from "@/components/RuleBuilder/ListManager";
import { toast } from "sonner";

const Index = () => {
  const [logicType, setLogicType] = useState<"AND" | "OR">("AND");
  const [lists, setLists] = useState<ListItem[]>([
    { id: "1", name: "PEP List A", type: "PEP", entries: ["John Doe", "Jane Smith"], count: 2 },
    { id: "2", name: "PEP List B", type: "PEP", entries: ["Robert Johnson"], count: 1 },
    { id: "3", name: "Hawala Parties", type: "Watchlist", entries: ["ABC Trading", "XYZ Corp"], count: 2 },
    { id: "4", name: "Sanctions List", type: "Sanctions", entries: ["Country A", "Country B", "Entity C"], count: 3 },
  ]);
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "1",
      stageNumber: 1,
      dependsOnStage: null,
      timeRelation: null,
      timeWindowDays: null,
      groupBy: null,
      outputName: null,
      outputMode: "aggregates",
      correlationKeys: [],
      filters: [],
      stageTimeWindowDays: null,
      conditions: [
        {
          id: "c1",
          aggregateFunction: "none",
          targetField: "",
          timeWindow: null,
          operator: "",
          threshold: "",
          selectedList: null,
          filters: null,
          transactionType: null,
          referenceStage: null,
          thresholdType: "literal",
          keywordFilters: [],
        },
      ],
    },
  ]);

  const addStage = () => {
    const newStage: Stage = {
      id: Date.now().toString(),
      stageNumber: stages.length + 1,
      dependsOnStage: null,
      timeRelation: null,
      timeWindowDays: null,
      groupBy: null,
      outputName: null,
      outputMode: "aggregates",
      correlationKeys: [],
      filters: [],
      stageTimeWindowDays: null,
      conditions: [
        {
          id: `c${Date.now()}`,
          aggregateFunction: "none",
          targetField: "",
          timeWindow: null,
          operator: "",
          threshold: "",
          selectedList: null,
          filters: null,
          transactionType: null,
          referenceStage: null,
          thresholdType: "literal",
          keywordFilters: [],
        },
      ],
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (id: string, updates: Partial<Stage>) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      const newStages = stages.filter((s) => s.id !== id);
      // Renumber stages
      const renumbered = newStages.map((s, idx) => ({
        ...s,
        stageNumber: idx + 1,
      }));
      setStages(renumbered);
    } else {
      toast.error("At least one stage is required");
    }
  };

  const addConditionToStage = (stageId: string) => {
    setStages(
      stages.map((stage) => {
        if (stage.id === stageId) {
          const newCondition: Condition = {
            id: Date.now().toString(),
            aggregateFunction: "none",
            targetField: "",
            timeWindow: null,
            operator: "",
            threshold: "",
            selectedList: null,
            filters: null,
            transactionType: null,
            referenceStage: null,
            thresholdType: "literal",
            keywordFilters: [],
          };
          return { ...stage, conditions: [...stage.conditions, newCondition] };
        }
        return stage;
      })
    );
  };

  const updateCondition = (stageId: string, conditionId: string, updates: Partial<Condition>) => {
    setStages(
      stages.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            conditions: stage.conditions.map((c) =>
              c.id === conditionId ? { ...c, ...updates } : c
            ),
          };
        }
        return stage;
      })
    );
  };

  const removeCondition = (stageId: string, conditionId: string) => {
    setStages(
      stages.map((stage) => {
        if (stage.id === stageId) {
          if (stage.conditions.length > 1) {
            return {
              ...stage,
              conditions: stage.conditions.filter((c) => c.id !== conditionId),
            };
          } else {
            toast.error("At least one condition is required per stage");
          }
        }
        return stage;
      })
    );
  };

  const getRuleObject = () => {
    return {
      logicType,
      stages: stages.map(({ id, ...stage }) => ({
        ...stage,
        conditions: stage.conditions.map(({ id, ...rest }) => rest),
      })),
    };
  };

  const handleSaveRule = () => {
    const rule = getRuleObject();
    console.log("Saving rule:", rule);
    toast.success("Rule saved successfully");
    // In a real app, this would send to backend
  };

  const handleRunRule = () => {
    const rule = getRuleObject();
    console.log("Running rule:", rule);
    toast.success("Rule execution started");
    // In a real app, this would trigger rule execution
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Dynamic Rule Builder</h1>
              <p className="text-lg text-muted-foreground">
                Create multi-stage rules with sequential logic for AML transaction monitoring
              </p>
            </div>

            {/* Logic Type Selector */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Rule Logic</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose how conditions should be evaluated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={logicType}
                  onValueChange={(value) => setLogicType(value as "AND" | "OR")}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AND" id="and" />
                    <Label htmlFor="and" className="cursor-pointer">
                      Match <strong>ALL</strong> conditions (AND)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OR" id="or" />
                    <Label htmlFor="or" className="cursor-pointer">
                      Match <strong>ANY</strong> condition (OR)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Stages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Rule Stages</h2>
                  <p className="text-sm text-muted-foreground">
                    Define sequential conditions with time dependencies and cross-stage comparisons
                  </p>
                </div>
                <Button onClick={addStage} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Stage
                </Button>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {stages.map((stage) => {
                    const availableStages = stages
                      .filter((s) => s.stageNumber < stage.stageNumber)
                      .map((s) => s.stageNumber);
                    const availableLists = lists.map((list) => ({ id: list.id, name: list.name }));
                    
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        availableStages={availableStages}
                        availableLists={availableLists}
                        onUpdate={updateStage}
                        onRemove={removeStage}
                        onAddCondition={addConditionToStage}
                        onUpdateCondition={updateCondition}
                        onRemoveCondition={removeCondition}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button onClick={handleSaveRule} size="lg" className="gap-2">
                <Save className="h-5 w-5" />
                Save Rule
              </Button>
              <Button onClick={handleRunRule} variant="secondary" size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Run Rule
              </Button>
            </div>

            {/* JSON Preview */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Rule Preview (JSON)</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Current rule configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{JSON.stringify(getRuleObject(), null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-96 border-l border-border bg-card p-6">
          <ListManager lists={lists} setLists={setLists} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
