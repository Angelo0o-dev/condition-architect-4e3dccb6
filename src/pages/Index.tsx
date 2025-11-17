import { useState } from "react";
import { Plus, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConditionRow, type Condition } from "@/components/RuleBuilder/ConditionRow";
import { ListManager } from "@/components/RuleBuilder/ListManager";
import { toast } from "sonner";

const Index = () => {
  const [logicType, setLogicType] = useState<"AND" | "OR">("AND");
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "1",
      aggregateFunction: "none",
      targetField: "",
      timeWindow: null,
      operator: "",
      threshold: "",
      selectedList: null,
      filters: null,
    },
  ]);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      aggregateFunction: "none",
      targetField: "",
      timeWindow: null,
      operator: "",
      threshold: "",
      selectedList: null,
      filters: null,
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c) => c.id !== id));
    } else {
      toast.error("At least one condition is required");
    }
  };

  const getRuleObject = () => {
    return {
      logicType,
      conditions: conditions.map(({ id, ...rest }) => rest),
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
                Configure conditions, lists, thresholds, and parameters for transaction monitoring
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

            {/* Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Conditions</h2>
                  <p className="text-sm text-muted-foreground">
                    Define the criteria for monitoring transactions
                  </p>
                </div>
                <Button onClick={addCondition} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Condition
                </Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {conditions.map((condition) => (
                    <ConditionRow
                      key={condition.id}
                      condition={condition}
                      onUpdate={updateCondition}
                      onRemove={removeCondition}
                    />
                  ))}
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
          <ListManager />
        </aside>
      </div>
    </div>
  );
};

export default Index;
