// Filter interface - used for both stage-level rowFilters and condition-level filters
export interface Filter {
  id: string;
  field: string;
  op: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "notIn" | "contains";
  value: string | number | (string | number)[] | null;
  listId?: string | null;
  negate?: boolean;
}

// Condition interface
export interface Condition {
  id: string;
  aggregateFunction: "none" | "sum" | "avg" | "count" | "max" | "min" | "countDistinct" | "countUnique" | "distinctValues" | "mode";
  targetField: string | null;
  timeWindow: number | null;
  operator: ">" | ">=" | "<" | "<=" | "=" | "!=" | "in" | "notIn" | "contains" | "not_contains" | "% of" | "";
  threshold: string | number;
  thresholdType: "literal" | "percentage" | "reference";
  selectedList?: string | null;
  filters?: Filter[] | null; // Condition-level filters (applied when evaluating this condition)
  transactionType?: string | null;
  referenceStage?: {
    stageNumber: number;
    metric: "sum" | "avg" | "count" | "max" | "min";
  } | null;
}

// Stage interface
export interface Stage {
  id: string;
  stageNumber: number;
  dependsOnStage: number | null;
  timeRelation: "after" | "before" | "within" | null;
  timeWindowDays: number | null;
  conditions: Condition[];
  groupBy: string | string[] | null;
  outputName: string | null;
  outputMode: "rows" | "aggregates" | "both" | null;
  correlationKeys: string[];
  rowFilters: Filter[]; // Stage-level row filters (applied first, before grouping)
  stageTimeWindowDays: number | null;
  metadata?: Record<string, any>;
}

// List item for list management
export interface ListItem {
  id: string;
  name: string;
  type: string;
  entries: string[];
  count: number;
}
