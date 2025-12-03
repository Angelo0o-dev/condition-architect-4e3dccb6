import { useState } from "react";
import { Plus, Upload, List, Eye, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ListItem } from "./types";

// Re-export for backward compatibility
export type { ListItem } from "./types";

interface ListManagerProps {
  lists: ListItem[];
  setLists: (lists: ListItem[]) => void;
}

export function ListManager({ lists, setLists }: ListManagerProps) {
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState<ListItem | null>(null);
  const [newEntry, setNewEntry] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddList = () => {
    if (newListName.trim()) {
      setLists([
        ...lists,
        {
          id: Date.now().toString(),
          name: newListName,
          type: "Custom",
          entries: [],
          count: 0,
        },
      ]);
      setNewListName("");
      toast.success("List created successfully");
    }
  };

  const handleDeleteList = (listId: string) => {
    setLists(lists.filter((list) => list.id !== listId));
    toast.success("List deleted");
  };

  const handleAddEntry = () => {
    if (selectedList && newEntry.trim()) {
      const updatedLists = lists.map((list) => {
        if (list.id === selectedList.id) {
          const newEntries = [...list.entries, newEntry.trim()];
          return {
            ...list,
            entries: newEntries,
            count: newEntries.length,
          };
        }
        return list;
      });
      setLists(updatedLists);
      setSelectedList({
        ...selectedList,
        entries: [...selectedList.entries, newEntry.trim()],
        count: selectedList.entries.length + 1,
      });
      setNewEntry("");
      toast.success("Entry added");
    }
  };

  const handleRemoveEntry = (entryToRemove: string) => {
    if (selectedList) {
      const updatedLists = lists.map((list) => {
        if (list.id === selectedList.id) {
          const newEntries = list.entries.filter((entry) => entry !== entryToRemove);
          return {
            ...list,
            entries: newEntries,
            count: newEntries.length,
          };
        }
        return list;
      });
      setLists(updatedLists);
      setSelectedList({
        ...selectedList,
        entries: selectedList.entries.filter((entry) => entry !== entryToRemove),
        count: selectedList.entries.length - 1,
      });
      toast.success("Entry removed");
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const entries = lines.map((line) => line.trim());

      if (entries.length > 0) {
        setLists([
          ...lists,
          {
            id: Date.now().toString(),
            name: file.name.replace(".csv", ""),
            type: "Uploaded",
            entries: entries,
            count: entries.length,
          },
        ]);
        toast.success(`Imported ${entries.length} entries from CSV`);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
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
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="flex-1"
              onChange={handleCSVUpload}
            />
            <Button variant="secondary" size="icon" onClick={() => document.getElementById("csv-upload")?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">CSV should have one entry per line</p>
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
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm text-foreground">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {list.type} • {list.count.toLocaleString()} entries
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={isDialogOpen && selectedList?.id === list.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedList(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                            onClick={() => {
                              setSelectedList(list);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{list.name}</DialogTitle>
                            <DialogDescription>
                              {list.type} • {list.count} entries
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Add Entry */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add new entry"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                              />
                              <Button onClick={handleAddEntry} size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Entries List */}
                            <ScrollArea className="h-[400px] border border-border rounded-md p-4">
                              <div className="space-y-2">
                                {selectedList?.entries.map((entry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 rounded-md bg-muted hover:bg-muted/70 transition-colors"
                                  >
                                    <span className="text-sm">{entry}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive/80"
                                      onClick={() => handleRemoveEntry(entry)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {selectedList?.entries.length === 0 && (
                                  <p className="text-sm text-muted-foreground text-center py-8">
                                    No entries yet. Add one above.
                                  </p>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteList(list.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
