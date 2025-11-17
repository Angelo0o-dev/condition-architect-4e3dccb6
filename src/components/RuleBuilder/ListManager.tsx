import { useState } from "react";
import { Plus, Upload, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ListItem {
  id: string;
  name: string;
  type: string;
  count: number;
}

export function ListManager() {
  const [lists, setLists] = useState<ListItem[]>([
    { id: "1", name: "PEP List A", type: "PEP", count: 1250 },
    { id: "2", name: "PEP List B", type: "PEP", count: 870 },
    { id: "3", name: "Hawala Parties", type: "Watchlist", count: 340 },
    { id: "4", name: "Sanctions List", type: "Sanctions", count: 2100 },
  ]);

  const [newListName, setNewListName] = useState("");

  const handleAddList = () => {
    if (newListName.trim()) {
      setLists([
        ...lists,
        {
          id: Date.now().toString(),
          name: newListName,
          type: "Custom",
          count: 0,
        },
      ]);
      setNewListName("");
    }
  };

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <List className="h-5 w-5 text-primary" />
          List Manager
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage PEP lists, watchlists, and custom monitoring lists
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Upload CSV */}
        <div className="space-y-2">
          <Label htmlFor="csv-upload" className="text-sm font-medium">
            Upload CSV List
          </Label>
          <div className="flex gap-2">
            <Input id="csv-upload" type="file" accept=".csv" className="flex-1" />
            <Button variant="secondary" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Add New List */}
        <div className="space-y-2">
          <Label htmlFor="new-list" className="text-sm font-medium">
            Create New List
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-list"
              placeholder="Enter list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddList()}
            />
            <Button onClick={handleAddList} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Existing Lists */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Existing Lists</Label>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {lists.map((list) => (
                <Card key={list.id} className="p-4 border border-border bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-foreground">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {list.type} • {list.count.toLocaleString()} entries
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
