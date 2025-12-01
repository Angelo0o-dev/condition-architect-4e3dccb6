# AML Rule Engine Migration Guide

## New Features Added

This guide documents the advanced AML rule engine capabilities that have been added to the Dynamic Transaction Monitoring Rule Builder.

---

## 1. Enhanced Stage Model

### New Stage Properties

#### `groupBy` (string | null)
**Purpose**: Define the aggregation key for stage calculations.

**Available Options**:
- `account_id` - Group transactions by account
- `customer_id` - Group by customer
- `sender_id` - Group by sender
- `receiver_id` - Group by receiver
- `branch_id` - Group by branch
- `phone_number` - Group by phone number
- `merchant_id` - Group by merchant
- `teller_id` - Group by teller

**Example Use Cases**:
```json
// Per-account analysis
{
  "groupBy": "account_id",
  "stageNumber": 1,
  "conditions": [...]
}

// Per-customer monitoring
{
  "groupBy": "customer_id",
  "stageNumber": 2,
  "conditions": [...]
}
```

---

#### `outputName` (string | null)
**Purpose**: Name the output of a stage for reference in subsequent stages.

**Example**:
```json
{
  "stageNumber": 1,
  "outputName": "sum_incoming",
  "conditions": [
    {
      "aggregateFunction": "sum",
      "targetField": "amount"
    }
  ]
}
```

This allows Stage 2 to reference `stage1.sum_incoming` directly.

---

#### `outputMode` ("rows" | "aggregates" | "both")
**Purpose**: Define what data the stage outputs.

**Options**:
- `aggregates` (default) - Only output aggregate calculations
- `rows` - Output individual transaction rows
- `both` - Output both aggregates and rows

**Use Cases**:
- Use `aggregates` for count/sum operations
- Use `rows` when you need to pass specific transactions to next stage
- Use `both` when subsequent stages need both types

**Example**:
```json
{
  "stageNumber": 1,
  "outputMode": "rows",
  "conditions": [
    {
      "aggregateFunction": "none",
      "targetField": "transaction_type",
      "operator": "=",
      "threshold": "deposit"
    }
  ]
}
```

---

#### `correlationKeys` (string[])
**Purpose**: Define keys for row-to-row correlation between stages.

**Available Keys**:
- `account_id`
- `customer_id`
- `transaction_id`
- `phone_number`
- `email`

**Example - Pass-Through Pattern**:
```json
{
  "stageNumber": 2,
  "dependsOnStage": 1,
  "correlationKeys": ["account_id"],
  "timeRelation": "within",
  "timeWindowDays": 3,
  "conditions": [
    {
      "targetField": "transaction_type",
      "operator": "=",
      "threshold": "withdrawal"
    }
  ]
}
```

This means: "Find withdrawals that occur within 3 days of deposits from the same account."

---

#### `stageTimeWindowDays` (number | null)
**Purpose**: Apply a sliding time window to the entire stage before aggregation.

**Use Case**: Filter data to only include recent transactions.

**Example**:
```json
{
  "stageNumber": 1,
  "stageTimeWindowDays": 7,
  "groupBy": "account_id",
  "conditions": [
    {
      "aggregateFunction": "sum",
      "targetField": "amount",
      "operator": ">",
      "threshold": 50000
    }
  ]
}
```

This limits the analysis to the last 7 days of data.

---

#### `filters` (array)
**Purpose**: Apply stage-level filters before any aggregation occurs.

**Structure**:
```json
{
  "stageNumber": 1,
  "filters": [
    {
      "field": "transaction_type",
      "operator": "=",
      "value": "cash_deposit"
    },
    {
      "field": "branch_type",
      "operator": "=",
      "value": "border_branch"
    }
  ],
  "conditions": [...]
}
```

Stage filters apply to ALL conditions in that stage.

---

## 2. New Aggregate Functions

### `countDistinct`
Count the number of unique values for a field.

**Example**:
```json
{
  "aggregateFunction": "countDistinct",
  "targetField": "receiver_id",
  "operator": ">",
  "threshold": 5
}
```
Meaning: "Count distinct recipients > 5"

---

### `countUnique`
Alias for `countDistinct` - counts unique occurrences.

**Example**:
```json
{
  "aggregateFunction": "countUnique",
  "targetField": "third_party_depositor",
  "operator": ">=",
  "threshold": 3
}
```
Meaning: "3 or more unique third-party depositors"

---

### `distinctValues`
Returns the actual distinct values (not just the count).

**Example**:
```json
{
  "aggregateFunction": "distinctValues",
  "targetField": "country",
  "operator": "contains",
  "threshold": "high_risk_list"
}
```
Meaning: "Distinct countries involved intersect with high-risk list"

---

## 3. Complete AML Pattern Examples

### Pattern 1: Rapid Deposit-Withdrawal (Pass-Through)

```json
{
  "logicType": "AND",
  "stages": [
    {
      "stageNumber": 1,
      "groupBy": "account_id",
      "outputName": "deposits",
      "outputMode": "rows",
      "stageTimeWindowDays": 30,
      "conditions": [
        {
          "aggregateFunction": "sum",
          "targetField": "amount",
          "operator": ">",
          "threshold": 50000,
          "filters": [
            {
              "field": "transaction_type",
              "operator": "=",
              "value": "deposit"
            }
          ]
        }
      ]
    },
    {
      "stageNumber": 2,
      "dependsOnStage": 1,
      "correlationKeys": ["account_id"],
      "timeRelation": "within",
      "timeWindowDays": 3,
      "groupBy": "account_id",
      "outputName": "withdrawals",
      "conditions": [
        {
          "aggregateFunction": "sum",
          "targetField": "amount",
          "thresholdType": "percentage",
          "threshold": 90,
          "operator": ">=",
          "filters": [
            {
              "field": "transaction_type",
              "operator": "=",
              "value": "withdrawal"
            }
          ]
        }
      ]
    }
  ]
}
```

**What this detects**: Accounts that deposit >50K and then withdraw ≥90% of it within 3 days.

---

### Pattern 2: Multiple Recipients (Structuring)

```json
{
  "logicType": "AND",
  "stages": [
    {
      "stageNumber": 1,
      "groupBy": "sender_id",
      "outputName": "unique_recipients",
      "outputMode": "aggregates",
      "stageTimeWindowDays": 7,
      "conditions": [
        {
          "aggregateFunction": "countDistinct",
          "targetField": "receiver_id",
          "operator": ">",
          "threshold": 10
        },
        {
          "aggregateFunction": "sum",
          "targetField": "amount",
          "operator": ">",
          "threshold": 100000
        }
      ]
    }
  ]
}
```

**What this detects**: A sender transferring >100K to more than 10 unique recipients in 7 days.

---

### Pattern 3: Cross-Stage Comparison (Unusual Activity)

```json
{
  "logicType": "AND",
  "stages": [
    {
      "stageNumber": 1,
      "groupBy": "account_id",
      "outputName": "baseline_activity",
      "outputMode": "aggregates",
      "stageTimeWindowDays": 90,
      "conditions": [
        {
          "aggregateFunction": "avg",
          "targetField": "amount",
          "operator": ">",
          "threshold": 0
        }
      ]
    },
    {
      "stageNumber": 2,
      "dependsOnStage": 1,
      "groupBy": "account_id",
      "outputName": "recent_activity",
      "stageTimeWindowDays": 7,
      "conditions": [
        {
          "aggregateFunction": "sum",
          "targetField": "amount",
          "thresholdType": "reference",
          "referenceStage": {
            "stageNumber": 1,
            "metric": "avg"
          },
          "operator": ">",
          "threshold": 500
        }
      ]
    }
  ]
}
```

**What this detects**: Recent 7-day activity that is >500% of the 90-day average.

---

## 4. Migration from Old Format

### Old Format (Basic)
```json
{
  "stageNumber": 1,
  "dependsOnStage": null,
  "timeRelation": null,
  "timeWindowDays": null,
  "conditions": [...]
}
```

### New Format (Enhanced)
```json
{
  "stageNumber": 1,
  "dependsOnStage": null,
  "timeRelation": null,
  "timeWindowDays": null,
  "groupBy": "account_id",              // NEW
  "outputName": "stage1_results",       // NEW
  "outputMode": "aggregates",           // NEW
  "correlationKeys": [],                // NEW
  "filters": [],                        // NEW
  "stageTimeWindowDays": null,          // NEW
  "conditions": [...]
}
```

### Backward Compatibility
- All new fields have default values
- Existing rules will continue to work
- New fields default to:
  - `groupBy`: `null`
  - `outputName`: `null`
  - `outputMode`: `"aggregates"`
  - `correlationKeys`: `[]`
  - `filters`: `[]`
  - `stageTimeWindowDays`: `null`

---

## 5. Complete Pattern Coverage

✅ **Temporal Window Patterns**
- Sliding windows: `stageTimeWindowDays`
- Tumbling windows: stage boundaries + `timeRelation`

✅ **Aggregate Thresholds**
- All standard aggregates: SUM, AVG, COUNT, MAX, MIN
- Advanced: COUNT_DISTINCT, COUNT_UNIQUE, DISTINCT_VALUES
- Cross-stage references: `thresholdType: "reference"`

✅ **Cross-Entity Correlation**
- `dependsOnStage` + `correlationKeys`
- Time relations: within/after/before
- Pass-through detection

✅ **List-Driven Checks**
- PEP lists, watchlists, sanctions
- Via `selectedList` in conditions

✅ **Unique/Distinct Counting**
- `countDistinct` / `countUnique`
- Multiple recipients, depositors, policies, etc.

---

## 6. UI Changes

### StageCard Enhancements
1. **Group By dropdown** - Select aggregation key
2. **Output Name input** - Name stage results
3. **Output Mode dropdown** - Choose output type
4. **Correlation Keys multi-select** - Add/remove correlation keys (shown as badges)
5. **Stage Time Window input** - Set sliding window for entire stage
6. **Stage Filters section** - (UI to be enhanced in future updates)

### ConditionRow Enhancements
1. **New aggregate functions** in dropdown:
   - Count Distinct
   - Count Unique
   - Distinct Values

---

## 7. Implementation Checklist

When building rules with the new features:

- [ ] Define `groupBy` for per-entity analysis
- [ ] Name stage outputs with `outputName` for cross-stage references
- [ ] Set appropriate `outputMode` based on next stage needs
- [ ] Add `correlationKeys` when correlating rows between stages
- [ ] Use `stageTimeWindowDays` for sliding windows
- [ ] Apply `filters` at stage level for common conditions
- [ ] Use `countDistinct`/`countUnique` for cardinality checks
- [ ] Reference previous stages using `thresholdType: "reference"`

---

## 8. Best Practices

1. **Use groupBy consistently** - Same groupBy in dependent stages ensures correlation
2. **Name your outputs** - Makes JSON readable and debugging easier
3. **Choose right outputMode** - Use "rows" only when necessary (memory intensive)
4. **Correlation keys match data** - Ensure keys exist in your dataset
5. **Stage windows before aggregation** - Filter data early with `stageTimeWindowDays`
6. **Stage filters for reusability** - Common conditions belong in stage filters

---

## Need Help?

- Review the JSON Preview in the UI to see your rule structure
- Check browser console for validation errors
- Use the Save/Run buttons to test your rules
- Refer to the pattern examples above for guidance

---

**Version**: 2.0  
**Last Updated**: 2025-12-01  
**Breaking Changes**: None - Fully backward compatible
