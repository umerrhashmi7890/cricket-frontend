import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Loader2, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type PricingData = {
  weekdayDayRate: number;
  weekdayNightRate: number;
  weekendDayRate: number;
  weekendNightRate: number;
};

type PricingRule = {
  id: string;
  days: "sun-wed" | "thu" | "fri" | "sat";
  timeSlot: "day" | "night";
  category: "weekday-day" | "weekday-night" | "weekend-day" | "weekend-night";
  pricePerHour: number;
};

const AdminPricing = () => {
  const { toast } = useToast();
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<PricingRule | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newRuleDays, setNewRuleDays] = useState<
    "sun-wed" | "thu" | "fri" | "sat"
  >("sun-wed");
  const [newRuleTimeSlot, setNewRuleTimeSlot] = useState<"day" | "night">(
    "day",
  );
  const [newRuleCategory, setNewRuleCategory] = useState<
    "weekday-day" | "weekday-night" | "weekend-day" | "weekend-night"
  >("weekday-day");
  const [newRulePrice, setNewRulePrice] = useState<number>(90);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const [currentResponse, rulesResponse] = await Promise.all([
        adminApi.pricing.getCurrent(),
        adminApi.pricing.getAll(),
      ]);

      if (currentResponse.success && currentResponse.data) {
        setPricing(currentResponse.data as unknown as PricingData);
      }

      if (rulesResponse.success && rulesResponse.data) {
        setPricingRules(rulesResponse.data as unknown as PricingRule[]);
      }
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleEditClick = (rule: PricingRule) => {
    setEditingRule(rule);
    setNewPrice(rule.pricePerHour);
    setEditDialogOpen(true);
  };

  const handleSavePrice = async () => {
    if (!editingRule || newPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await adminApi.pricing.update(editingRule.id, {
        pricePerHour: newPrice,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Price updated successfully",
        });
        setEditDialogOpen(false);
        fetchPricing();
      }
    } catch (error) {
      console.error("Failed to update price:", error);
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = async () => {
    if (newRulePrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const ruleExists = pricingRules.some(
      (rule) => rule.days === newRuleDays && rule.timeSlot === newRuleTimeSlot,
    );

    if (ruleExists) {
      toast({
        title: "Rule Exists",
        description: "A pricing rule for this combination already exists",
        variant: "destructive",
      });
      return;
    }

    if (pricingRules.length >= 8) {
      toast({
        title: "Maximum Rules Reached",
        description: "You can only have 8 pricing rules",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await adminApi.pricing.create({
        days: newRuleDays,
        timeSlot: newRuleTimeSlot,
        category: newRuleCategory,
        pricePerHour: newRulePrice,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Pricing rule added successfully",
        });
        setAddDialogOpen(false);
        setNewRuleDays("sun-wed");
        setNewRuleTimeSlot("day");
        setNewRuleCategory("weekday-day");
        setNewRulePrice(90);
        fetchPricing();
      }
    } catch (error: unknown) {
      console.error("Failed to add pricing rule:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add pricing rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (rule: PricingRule) => {
    setDeletingRule(rule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRule = async () => {
    if (!deletingRule) return;

    try {
      setSaving(true);
      const response = await adminApi.pricing.delete(deletingRule.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Pricing rule deleted successfully",
        });
        setDeleteDialogOpen(false);
        setDeletingRule(null);
        fetchPricing();
      }
    } catch (error: unknown) {
      console.error("Failed to delete pricing rule:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete pricing rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getDaysLabel = (days: string) => {
    if (days === "sun-wed") return "Sun-Wed";
    if (days === "thu") return "Thursday";
    if (days === "fri") return "Friday";
    return "Saturday";
  };

  const getTimeLabel = (timeSlot: string) => {
    return timeSlot === "day" ? "9 AM - 7 PM" : "7 PM - 4 AM";
  };

  const getCategoryLabel = (category: string) => {
    if (category === "weekday-day") return "Weekday Day";
    if (category === "weekday-night") return "Weekday Night";
    if (category === "weekend-day") return "Weekend Day";
    return "Weekend Night";
  };

  const categoryColors: Record<string, string> = {
    "weekday-day": "bg-blue-500/20 text-blue-700 border-blue-500",
    "weekday-night": "bg-indigo-500/20 text-indigo-700 border-indigo-500",
    "weekend-day": "bg-green-500/20 text-green-700 border-green-500",
    "weekend-night": "bg-purple-500/20 text-purple-700 border-purple-500",
  };

  // Auto-update category based on days and timeSlot selection
  useEffect(() => {
    if (newRuleDays === "sun-wed" && newRuleTimeSlot === "day") {
      setNewRuleCategory("weekday-day");
    } else if (newRuleDays === "sun-wed" && newRuleTimeSlot === "night") {
      setNewRuleCategory("weekday-night");
    } else if (newRuleDays === "thu" && newRuleTimeSlot === "day") {
      setNewRuleCategory("weekday-day");
    } else if (newRuleDays === "thu" && newRuleTimeSlot === "night") {
      setNewRuleCategory("weekend-night");
    } else if (newRuleDays === "fri" && newRuleTimeSlot === "day") {
      setNewRuleCategory("weekend-day");
    } else if (newRuleDays === "fri" && newRuleTimeSlot === "night") {
      setNewRuleCategory("weekend-night");
    } else if (newRuleDays === "sat" && newRuleTimeSlot === "day") {
      setNewRuleCategory("weekend-day");
    } else {
      setNewRuleCategory("weekday-night");
    }
  }, [newRuleDays, newRuleTimeSlot]);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b p-4 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pricing Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage hourly rates for different days and time slots (8 rules
              total)
            </p>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            disabled={pricingRules.length >= 8}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Rule ({pricingRules.length}/8)
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 w-full">
        {/* Pricing Table */}
        <div className="bg-card rounded-xl border overflow-hidden mb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase w-[150px]">
                      Days
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase w-[150px]">
                      Time Slot
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase w-[180px]">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-foreground uppercase w-[180px]">
                      Price (SAR/hr)
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-foreground uppercase w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pricingRules
                    .sort((a, b) => {
                      const daysOrder = ["sun-wed", "thu", "fri", "sat"];
                      const daysCompare =
                        daysOrder.indexOf(a.days) - daysOrder.indexOf(b.days);
                      if (daysCompare !== 0) return daysCompare;
                      return a.timeSlot === "day" ? -1 : 1;
                    })
                    .map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground text-sm whitespace-nowrap">
                            {getDaysLabel(rule.days)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {getTimeLabel(rule.timeSlot)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                              categoryColors[rule.category]
                            }`}
                          >
                            {getCategoryLabel(rule.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium text-foreground text-sm">
                              {rule.pricePerHour}
                            </span>
                            <span className="text-muted-foreground text-sm whitespace-nowrap">
                              SAR/hr
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(rule)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(rule)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-secondary/10 rounded-xl p-4">
          <p className="text-xs lg:text-sm text-muted-foreground">
            <strong>Note:</strong> Price changes will take effect immediately
            for new bookings. Existing bookings will retain their original
            pricing. Overnight slots (12 AM - 4 AM) follow the pricing of the
            previous calendar day.
          </p>
        </div>
      </div>

      {/* Edit Price Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
            <DialogDescription>
              {editingRule &&
                `Update the price for ${getDaysLabel(editingRule.days)} ${getTimeLabel(editingRule.timeSlot)} - ${getCategoryLabel(editingRule.category)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Price per Hour (SAR)
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="w-full"
              placeholder="Enter price"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSavePrice} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Pricing Rule Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pricing Rule</DialogTitle>
            <DialogDescription>
              Create a new pricing rule. Maximum 8 rules allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Days
              </label>
              <Select
                value={newRuleDays}
                onValueChange={(value) =>
                  setNewRuleDays(value as "sun-wed" | "thu" | "fri" | "sat")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sun-wed">Sunday - Wednesday</SelectItem>
                  <SelectItem value="thu">Thursday</SelectItem>
                  <SelectItem value="fri">Friday</SelectItem>
                  <SelectItem value="sat">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time Slot
              </label>
              <Select
                value={newRuleTimeSlot}
                onValueChange={(value) =>
                  setNewRuleTimeSlot(value as "day" | "night")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day (9 AM - 7 PM)</SelectItem>
                  <SelectItem value="night">Night (7 PM - 4 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category (Auto-assigned)
              </label>
              <div
                className={`px-3 py-2 rounded-md border ${categoryColors[newRuleCategory]}`}
              >
                {getCategoryLabel(newRuleCategory)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Price per Hour (SAR)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={newRulePrice}
                onChange={(e) => setNewRulePrice(Number(e.target.value))}
                className="w-full"
                placeholder="Enter price"
              />
            </div>

            {pricingRules.some(
              (rule) =>
                rule.days === newRuleDays && rule.timeSlot === newRuleTimeSlot,
            ) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  ⚠️ This combination already exists. Please choose a different
                  one.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleAddRule}
              disabled={
                saving ||
                pricingRules.some(
                  (rule) =>
                    rule.days === newRuleDays &&
                    rule.timeSlot === newRuleTimeSlot,
                )
              }
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pricing Rule</DialogTitle>
            <DialogDescription>
              {deletingRule &&
                `Are you sure you want to delete the pricing rule for ${getDaysLabel(deletingRule.days)} ${getTimeLabel(deletingRule.timeSlot)}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The pricing rule will be
                permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingRule(null);
              }}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRule}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPricing;
