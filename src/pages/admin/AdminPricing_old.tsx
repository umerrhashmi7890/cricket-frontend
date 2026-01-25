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
  const [newRuleDays, setNewRuleDays] = useState<"sun-wed" | "thu" | "fri" | "sat">("sun-wed");
  const [newRuleTimeSlot, setNewRuleTimeSlot] = useState<"day" | "night">("day");
  const [newRuleCategory, setNewRuleCategory] = useState<"weekday-day" | "weekday-night" | "weekend-day" | "weekend-night">("weekday-day");
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
  }, [toast]);

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
    // Validate price
    if (newRulePrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Check if rule already exists
    const ruleExists = pricingRules.some(
      (rule) =>
        rule.dayType === newRuleDayType && rule.timeSlot === newRuleTimeSlot,
    );

    if (ruleExists) {
      toast({
        title: "Rule Exists",
        description: "A pricing rule for this combination already exists",
        variant: "destructive",
      });
      return;
    }

    // Check if we already have 4 rules
    if (pricingRules.length >= 4) {
      toast({
        title: "Maximum Rules Reached",
        description:
          "You can only have 4 pricing rules (weekday/weekend × day/night)",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await adminApi.pricing.create({
        dayType: newRuleDayType,
        timeSlot: newRuleTimeSlot,
        pricePerHour: newRulePrice,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Pricing rule added successfully",
        });
        setAddDialogOpen(false);
        // Reset form
        setNewRuleDayType("weekday");
        setNewRuleTimeSlot("day");
        setNewRulePrice(90);
        fetchPricing();
      }
    } catch (error: any) {
      console.error("Failed to add pricing rule:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add pricing rule",
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
    } catch (error: any) {
      console.error("Failed to delete pricing rule:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete pricing rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAvailableRuleCombinations = () => {
    const allCombinations = [
      {
        dayType: "weekday" as const,
        timeSlot: "day" as const,
        label: "Weekday Day (Sun-Thu, 9 AM - 6 PM)",
      },
      {
        dayType: "weekday" as const,
        timeSlot: "night" as const,
        label: "Weekday Night (Sun-Thu, 6 PM - 9 AM)",
      },
      {
        dayType: "weekend" as const,
        timeSlot: "day" as const,
        label: "Weekend Day (Fri-Sat, 9 AM - 6 PM)",
      },
      {
        dayType: "weekend" as const,
        timeSlot: "night" as const,
        label: "Weekend Night (Fri-Sat, 6 PM - 9 AM)",
      },
    ];

    return allCombinations.filter(
      (combo) =>
        !pricingRules.some(
          (rule) =>
            rule.dayType === combo.dayType && rule.timeSlot === combo.timeSlot,
        ),
    );
  };

  const getRuleName = (dayType: string, timeSlot: string) => {
    if (dayType === "weekday" && timeSlot === "day") return "Weekday Day";
    if (dayType === "weekday" && timeSlot === "night") return "Weekday Night";
    if (dayType === "weekend" && timeSlot === "day") return "Weekend Day";
    if (dayType === "weekend" && timeSlot === "night") return "Weekend Night";
    return "";
  };

  const getRuleDays = (dayType: string) => {
    return dayType === "weekday" ? "Sun-Thu" : "Fri-Sat";
  };

  const getRuleTime = (timeSlot: string) => {
    return timeSlot === "day" ? "9 AM - 6 PM" : "6 PM - 9 AM";
  };

  const categoryColors: Record<string, string> = {
    "Weekday Day": "bg-secondary/20 text-secondary border-secondary",
    "Weekday Night": "bg-primary/20 text-primary border-primary",
    "Weekend Day": "bg-accent/20 text-accent border-accent",
    "Weekend Night": "bg-warning/20 text-warning border-warning",
  };

  const pricingRows = pricing
    ? [
        {
          id: 1,
          day: "Sun-Thu",
          time: "9 AM - 6 PM",
          category: "Weekday Day",
          price: pricing.weekdayDayRate,
        },
        {
          id: 2,
          day: "Sun-Thu",
          time: "6 PM - 9 AM",
          category: "Weekday Night",
          price: pricing.weekdayNightRate,
        },
        {
          id: 3,
          day: "Fri-Sat",
          time: "9 AM - 6 PM",
          category: "Weekend Day",
          price: pricing.weekendDayRate,
        },
        {
          id: 4,
          day: "Fri-Sat",
          time: "6 PM - 9 AM",
          category: "Weekend Night",
          price: pricing.weekendNightRate,
        },
      ]
    : [];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-background border-b p-4 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pricing Managementtt
            </h1>
            <p className="text-muted-foreground text-sm">
              View current hourly rates for different time slots and days
            </p>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            disabled={pricingRules.length >= 4}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Rule
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 w-full">
        {/* Price Legend */}
        <div className="bg-card rounded-xl border p-4 lg:p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4">
            Price Categories
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : pricing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                className={`p-4 rounded-lg border ${categoryColors["Weekday Day"]}`}
              >
                <p className="font-medium text-sm">Weekday Day</p>
                <p className="text-xs opacity-70 mt-1">
                  {pricing.weekdayDayRate} SAR/hr
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${categoryColors["Weekday Night"]}`}
              >
                <p className="font-medium text-sm">Weekday Night</p>
                <p className="text-xs opacity-70 mt-1">
                  {pricing.weekdayNightRate} SAR/hr
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${categoryColors["Weekend Day"]}`}
              >
                <p className="font-medium text-sm">Weekend Day</p>
                <p className="text-xs opacity-70 mt-1">
                  {pricing.weekendDayRate} SAR/hr
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${categoryColors["Weekend Night"]}`}
              >
                <p className="font-medium text-sm">Weekend Night</p>
                <p className="text-xs opacity-70 mt-1">
                  {pricing.weekendNightRate} SAR/hr
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Pricing Table */}
        <div className="bg-card rounded-xl border overflow-hidden mb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-foreground uppercase w-[120px]">
                      Day
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
                    <th className="text-center px-4 py-3 text-xs font-semibold text-foreground uppercase w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pricingRules
                    .sort((a, b) => {
                      // Sort by dayType first (weekday before weekend)
                      if (a.dayType !== b.dayType) {
                        return a.dayType === "weekday" ? -1 : 1;
                      }
                      // Then by timeSlot (day before night)
                      return a.timeSlot === "day" ? -1 : 1;
                    })
                    .map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground text-sm whitespace-nowrap">
                            {getRuleDays(rule.dayType)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {getRuleTime(rule.timeSlot)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                              categoryColors[
                                getRuleName(rule.dayType, rule.timeSlot)
                              ]
                            }`}
                          >
                            {getRuleName(rule.dayType, rule.timeSlot)}
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

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <h3 className="font-semibold text-foreground mb-3 text-sm lg:text-base">
              Online Payment Discount
            </h3>
            <div className="flex items-center gap-3">
              <Input type="number" defaultValue={2} className="w-16 text-sm" />
              <span className="text-muted-foreground text-xs lg:text-sm">
                % discount for 100% online payment
              </span>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 lg:p-6">
            <h3 className="font-semibold text-foreground mb-3 text-sm lg:text-base">
              Minimum Booking Duration
            </h3>
            <div className="flex items-center gap-3">
              <Input type="number" defaultValue={1} className="w-16 text-sm" />
              <span className="text-muted-foreground text-xs lg:text-sm">
                hour(s) minimum
              </span>
            </div>
          </div>
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
                `Update the price for ${getRuleName(editingRule.dayType, editingRule.timeSlot)} (${getRuleDays(editingRule.dayType)}, ${getRuleTime(editingRule.timeSlot)})`}
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
              Create a new pricing rule. You can only have 4 rules total
              (weekday/weekend × day/night).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {getAvailableRuleCombinations().length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                All pricing rule combinations already exist.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Day Type
                  </label>
                  <Select
                    value={newRuleDayType}
                    onValueChange={(value) =>
                      setNewRuleDayType(value as "weekday" | "weekend")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday">Weekday (Sun-Thu)</SelectItem>
                      <SelectItem value="weekend">Weekend (Fri-Sat)</SelectItem>
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
                      <SelectItem value="day">Day (9 AM - 6 PM)</SelectItem>
                      <SelectItem value="night">Night (6 PM - 9 AM)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    rule.dayType === newRuleDayType &&
                    rule.timeSlot === newRuleTimeSlot,
                ) && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive">
                      ⚠️ This combination already exists. Please choose a
                      different one.
                    </p>
                  </div>
                )}
              </>
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
                getAvailableRuleCombinations().length === 0 ||
                pricingRules.some(
                  (rule) =>
                    rule.dayType === newRuleDayType &&
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
                `Are you sure you want to delete the pricing rule for ${getRuleName(deletingRule.dayType, deletingRule.timeSlot)} (${getRuleDays(deletingRule.dayType)}, ${getRuleTime(deletingRule.timeSlot)})?`}
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
