import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Copy, Trash2, RefreshCw } from "lucide-react";
import Loader from "@/components/layout/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import {
  PROMO_CODES_URL,
  UPDATE_PROMO_CODE_URL,
  DELETE_PROMO_CODE_URL,
} from "@/constants/constants";

// Types
interface PromoCode {
  _id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxTotalUses: number;
  usedByCustomers: string[];
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PromoFormData {
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: string;
  maxTotalUses: string;
  expiry: string;
}

const AdminPromos = () => {
  const { toast } = useToast();

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PromoFormData>({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxTotalUses: "",
    expiry: "7",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPromoId, setDeletingPromoId] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const fetchPromos = async () => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      const response = await fetch(`${API_URL}${PROMO_CODES_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPromos(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch promo codes");
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPromo = async () => {
    setIsSubmitting(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      if (
        !createForm.code ||
        !createForm.discountValue ||
        !createForm.maxTotalUses
      ) {
        throw new Error("Please fill in all required fields");
      }

      const payload = {
        code: createForm.code.toUpperCase(),
        discountType: createForm.discountType,
        discountValue: parseFloat(createForm.discountValue),
        maxTotalUses: parseInt(createForm.maxTotalUses),
        expiry: parseInt(createForm.expiry),
      };

      const response = await fetch(`${API_URL}${PROMO_CODES_URL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: data.message || "Promo code created successfully",
        });

        resetCreateForm();
        setIsCreateModalOpen(false);

        await fetchPromos();
      } else {
        throw new Error(data.message || "Failed to create promo code");
      }
    } catch (error: any) {
      console.error("Error creating promo code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePromoStatus = async (promoId: string) => {
    const promo = promos.find((p) => p._id === promoId);
    if (!promo) return;

    const newStatus = !promo.isActive;
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    setPromos((prev) =>
      prev.map((p) => (p._id === promoId ? { ...p, isActive: newStatus } : p))
    );
    setLoadingStatus(promoId);

    try {
      const response = await fetch(`${API_URL}/promo-codes/${promoId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      toast({
        title: "Success",
        description: `Promo code ${newStatus ? "activated" : "deactivated"}`,
      });
    } catch (error: any) {
      setPromos((prev) =>
        prev.map((p) =>
          p._id === promoId ? { ...p, isActive: promo.isActive } : p
        )
      );

      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoadingStatus(null);
    }
  };

  const deletePromo = async () => {
    if (!deletingPromoId) return;

    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      const response = await fetch(
        `${API_URL}${DELETE_PROMO_CODE_URL(deletingPromoId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete promo code");
      }

      setPromos((prev) =>
        prev.filter((promo) => promo._id !== deletingPromoId)
      );

      toast({
        title: "Promo Code Deleted",
        description: "Promo code has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingPromoId(null);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      maxTotalUses: "",
      expiry: "7",
    });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm({ ...createForm, code });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `"${code}" copied to clipboard`,
    });
  };

  const formatDiscount = (promo: PromoCode) => {
    return promo.discountType === "percentage"
      ? `${promo.discountValue}%`
      : `${promo.discountValue} SAR`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (dateString: string) => new Date(dateString) < new Date();

  const getStatus = (promo: PromoCode) => {
    if (isExpired(promo.expiresAt)) return "expired";
    return promo.isActive ? "active" : "inactive";
  };

  const totalUses = promos.reduce(
    (acc, p) => acc + (p.usedByCustomers?.length || 0),
    0
  );
  const activePromos = promos.filter(
    (p) => p.isActive && !isExpired(p.expiresAt)
  ).length;

  useEffect(() => {
    fetchPromos();
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b p-4 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Promo Codes</h1>
            <p className="text-muted-foreground text-sm">
              Create and manage promotional discount codes
            </p>
          </div>

          {/* Create Promo Button */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Create New Promo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Promo Code</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createPromo();
                }}
                className="space-y-4 pt-4"
              >
                {/* Promo Code */}
                <div>
                  <Label htmlFor="createCode">
                    Promo Code <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="createCode"
                      placeholder="Enter code or generate"
                      value={createForm.code}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateCode}
                      disabled={isSubmitting}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="createDiscountType">Discount Type</Label>
                    <Select
                      value={createForm.discountType}
                      onValueChange={(value: "fixed" | "percentage") =>
                        setCreateForm({ ...createForm, discountType: value })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="createDiscountType" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">
                          Fixed Amount (SAR)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="createDiscountValue">
                      Discount Value <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="createDiscountValue"
                      type="number"
                      placeholder="10"
                      className="mt-1"
                      value={createForm.discountValue}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          discountValue: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Usage Limit & Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="createMaxUses">
                      Usage Limit <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="createMaxUses"
                      type="number"
                      placeholder="100"
                      className="mt-1"
                      value={createForm.maxTotalUses}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          maxTotalUses: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total uses allowed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="createExpiry">Expiry (Days)</Label>
                    <Select
                      value={createForm.expiry}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, expiry: value })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="createExpiry" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Promo"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetCreateForm();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Promo Code</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this promo code? This action
                cannot be undone.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={deletePromo}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
            <div className="bg-card rounded-xl border p-4 lg:p-6">
              <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                Active Promos
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-foreground">
                {activePromos}
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4 lg:p-6">
              <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                Total Uses
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-foreground">
                {totalUses}
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4 lg:p-6">
              <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                Total Promos
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-foreground">
                {promos.length}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-12">
              <Loader size="lg" text="Loading promo codes..." />
            </div>
          ) : promos.length === 0 ? (
            /* Empty State */
            <div className="bg-card rounded-xl border p-12 text-center">
              <p className="text-muted-foreground mb-4">No promo codes yet</p>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Promo
              </Button>
            </div>
          ) : (
            <>
              {/* Promos Table */}
              <div className="bg-card rounded-xl border overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[180px]">
                          Code
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[140px]">
                          Discount
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[180px]">
                          Usage
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[120px]">
                          Expiry
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[130px]">
                          Status
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap w-[100px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {promos.map((promo) => {
                        const status = getStatus(promo);
                        const usagePercentage = Math.min(
                          ((promo.usedByCustomers?.length || 0) /
                            promo.maxTotalUses) *
                            100,
                          100
                        );

                        return (
                          <tr
                            key={promo._id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs lg:text-sm text-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                                  {promo.code}
                                </span>
                                <button
                                  onClick={() => copyCode(promo.code)}
                                  className="p-1 hover:bg-muted rounded flex-shrink-0"
                                >
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-sm text-foreground whitespace-nowrap">
                                {formatDiscount(promo)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1 whitespace-nowrap">
                                ({promo.discountType})
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 lg:w-24 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${usagePercentage}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                                  {promo.usedByCustomers?.length || 0}/
                                  {promo.maxTotalUses}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(promo.expiresAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={promo.isActive}
                                  onCheckedChange={() =>
                                    togglePromoStatus(promo._id)
                                  }
                                  disabled={
                                    status === "expired" ||
                                    loadingStatus === promo._id
                                  }
                                />
                                <span
                                  className={`text-xs lg:text-sm whitespace-nowrap ${
                                    status === "active"
                                      ? "text-success"
                                      : status === "expired"
                                      ? "text-muted-foreground"
                                      : "text-destructive"
                                  }`}
                                >
                                  {status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => {
                                    setDeletingPromoId(promo._id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-secondary/10 rounded-xl p-4">
                <p className="text-xs lg:text-sm text-muted-foreground">
                  <strong>Note:</strong> Each promo code can be used multiple
                  times up to the usage limit. Promo codes expire automatically
                  based on the expiry duration set during creation.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPromos;
