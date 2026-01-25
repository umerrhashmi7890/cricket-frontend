import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Power, Upload, Trash2 } from "lucide-react";
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
  COURTS_URL,
  UPDATE_COURT_URL,
  DELETE_COURT_URL,
} from "@/constants/constants";

// Types
interface Court {
  id: string;
  name: string;
  description: string;
  image: string;
  status: string;
  features: string[];
}

interface CourtFormData {
  name: string;
  description: string;
  status: string;
  features: string[];
  image: File | null;
}

interface ApiCourt {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: string;
  features: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const AVAILABLE_FEATURES = [
  "LED Lights",
  "Air Conditioned",
  "Bowling Machine",
  "Video Analysis",
  "Spectator Area",
  "VIP Lounge",
  "Professional Nets",
  "Full Size",
  "Premium Turf",
];

const AdminCourts = () => {
  const { toast } = useToast();

  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CourtFormData>({
    name: "",
    description: "",
    status: "active",
    features: [],
    image: null,
  });
  const [createImagePreview, setCreateImagePreview] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState("");
  const [editForm, setEditForm] = useState<CourtFormData>({
    name: "",
    description: "",
    status: "active",
    features: [],
    image: null,
  });
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const fetchCourts = async () => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      const response = await fetch(`${API_URL}${COURTS_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await response.json()) as ApiResponse<ApiCourt[]>;

      if (response.ok && data.success) {
        const formattedCourts: Court[] = data.data.map((court: ApiCourt) => ({
          id: court.id,
          name: court.name,
          description: court.description,
          image: court.imageUrl || "",
          status: court.status,
          features: court.features || [],
        }));

        setCourts(formattedCourts);
      } else {
        throw new Error(data.message || "Failed to fetch courts");
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
      toast({
        title: "Error",
        description: "Failed to load courts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCourt = async () => {
    setIsSubmitting(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      if (!createForm.name || !createForm.description) {
        throw new Error("Please fill in all required fields");
      }
      if (!createForm.image) {
        throw new Error("Please upload a court image");
      }

      const formData = new FormData();
      formData.append("name", createForm.name);
      formData.append("description", createForm.description);
      formData.append("status", createForm.status);
      formData.append("features", JSON.stringify(createForm.features));
      formData.append("image", createForm.image);

      const response = await fetch(`${API_URL}${COURTS_URL}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = (await response.json()) as ApiResponse<ApiCourt>;

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: data.message || "Court created successfully",
        });

        resetCreateForm();
        setIsCreateModalOpen(false);

        await fetchCourts();
      } else {
        throw new Error(data.message || "Failed to create court");
      }
    } catch (error) {
      console.error("Error creating court:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create court",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCourt = async () => {
    setIsSubmitting(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      if (!editForm.name || !editForm.description) {
        throw new Error("Please fill in all required fields");
      }

      // If no new image, send as JSON
      if (!editForm.image) {
        const payload = {
          name: editForm.name,
          description: editForm.description,
          status: editForm.status,
          features: editForm.features,
        };

        const response = await fetch(
          `${API_URL}${UPDATE_COURT_URL(editingCourtId)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const data = (await response.json()) as ApiResponse<ApiCourt>;

        if (response.ok && data.success) {
          toast({
            title: "Success!",
            description: data.message || "Court updated successfully",
          });

          setIsEditModalOpen(false);
          resetEditForm();

          await new Promise((resolve) => setTimeout(resolve, 500));
          await fetchCourts();
        } else {
          throw new Error(data.message || "Failed to update court");
        }
      } else {
        // If there's an image, use FormData
        const formData = new FormData();
        formData.append("name", editForm.name);
        formData.append("description", editForm.description);
        formData.append("status", editForm.status);
        formData.append("features", JSON.stringify(editForm.features));
        formData.append("image", editForm.image);

        const response = await fetch(
          `${API_URL}${UPDATE_COURT_URL(editingCourtId)}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        const data = (await response.json()) as ApiResponse<ApiCourt>;

        if (response.ok && data.success) {
          setCourts((prev) =>
            prev.map((c) =>
              c.id === editingCourtId
                ? {
                    id: c.id,
                    name: data.data.name,
                    description: data.data.description,
                    status: data.data.status,
                    features: data.data.features,
                    image: `${data.data.imageUrl}?t=${Date.now()}`,
                  }
                : c,
            ),
          );
          toast({
            title: "Success!",
            description: data.message || "Court updated successfully",
          });

          setIsEditModalOpen(false);
          resetEditForm();
        } else {
          throw new Error(data.message || "Failed to update court");
        }
      }
    } catch (error) {
      console.error("Error updating court:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update court",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCourtStatus = async (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const newStatus = court.status === "active" ? "inactive" : "active";
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    // Optimistic UI update
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, status: newStatus } : c)),
    );
    setLoadingStatus(courtId);

    try {
      const response = await fetch(`${API_URL}${UPDATE_COURT_URL(courtId)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = (await response.json()) as ApiResponse<ApiCourt>;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      toast({
        title: "Success",
        description: `Court status changed to ${newStatus}`,
      });
    } catch (error) {
      // rollback UI
      setCourts((prev) =>
        prev.map((c) =>
          c.id === courtId ? { ...c, status: court.status } : c,
        ),
      );

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoadingStatus(null);
    }
  };

  const deleteCourt = async () => {
    if (!deletingCourtId) return;

    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      setIsDeleting(true); // ADD THIS LINE

      const response = await fetch(
        `${API_URL}${DELETE_COURT_URL(deletingCourtId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response.json()) as ApiResponse<null>;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete court");
      }

      setCourts((prev) => prev.filter((court) => court.id !== deletingCourtId));

      toast({
        title: "Court Deleted",
        description: "Court has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete court",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // ADD THIS LINE
      setIsDeleteModalOpen(false);
      setDeletingCourtId(null);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      description: "",
      status: "active",
      features: [],
      image: null,
    });
    setCreateImagePreview("");
  };

  const resetEditForm = () => {
    setEditForm({
      name: "",
      description: "",
      status: "active",
      features: [],
      image: null,
    });
    setEditImagePreview("");
    setEditingCourtId("");
  };

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateForm({ ...createForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setCreateImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCreateFeature = (feature: string) => {
    setCreateForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const toggleEditFeature = (feature: string) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const openEditModal = (court: Court) => {
    setEditingCourtId(court.id);
    setEditForm({
      name: court.name,
      description: court.description,
      status: court.status,
      features: [...court.features],
      image: null,
    });
    setEditImagePreview(court.image);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  return (
    <div className=" flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b p-4 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Court Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage all cricket courts and their configurations
            </p>
          </div>

          {/* Create Court Button */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Add New Court</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Court</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createCourt();
                }}
                className="space-y-4 pt-4"
              >
                {/* Court Name */}
                <div>
                  <Label htmlFor="createName">
                    Court Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="createName"
                    placeholder="e.g., Court 6 - Premium Lane"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="createDescription">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="createDescription"
                    placeholder="Brief description of the court"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="createStatus">Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, status: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="createStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="createImage">
                    Court Image <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2">
                    {createImagePreview ? (
                      <div className="relative">
                        <img
                          src={createImagePreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setCreateForm({ ...createForm, image: null });
                            setCreateImagePreview("");
                          }}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="createImage"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                        <input
                          id="createImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCreateImageChange}
                          disabled={isSubmitting}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Features</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <label
                        key={feature}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          createForm.features.includes(feature)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={createForm.features.includes(feature)}
                          onChange={() => toggleCreateFeature(feature)}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {createForm.features.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {createForm.features.length} feature(s) selected
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Court"}
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

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Court</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this court? This action cannot
                be undone.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={deleteCourt}
                  disabled={isDeleting}
                >
                  {isDeleting ? ( // ADD THIS CONDITIONAL
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting} // ADD THIS
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Court Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Court</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCourt();
            }}
            className="space-y-4 pt-4"
          >
            {/* Court Name */}
            <div>
              <Label htmlFor="editName">
                Court Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="editDescription">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editDescription"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="editImage">
                Court Image (Optional - leave blank to keep current)
              </Label>
              <div className="mt-2">
                {editImagePreview ? (
                  <div className="relative">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setEditForm({ ...editForm, image: null });
                        setEditImagePreview("");
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="editImage"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload new image
                    </span>
                    <input
                      id="editImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditImageChange}
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {AVAILABLE_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      editForm.features.includes(feature)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={editForm.features.includes(feature)}
                      onChange={() => toggleEditFeature(feature)}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {editForm.features.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {editForm.features.length} feature(s) selected
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Court"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetEditForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courts Grid */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-full py-12">
                <Loader size="xl" text="Loading courts..." />
              </div>
            ) : courts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No courts found</p>
              </div>
            ) : (
              courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  <div className="relative h-40">
                    {court.image && (
                      <img
                        key={court.id}
                        src={court.image}
                        alt={court.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                        court.status === "active"
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {court.status === "active" ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {court.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {court.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
                      {court.features.slice(0, 4).map((feature, idx) => (
                        <span
                          key={`${court.id}-${feature}-${idx}`}
                          className="px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                      {court.features.length > 4 && (
                        <span className="px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground">
                          +{court.features.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-3 border-t mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={court.status === "active"}
                            onCheckedChange={() => toggleCourtStatus(court.id)}
                            disabled={loadingStatus === court.id}
                          />
                          <span className="text-sm text-muted-foreground">
                            {court.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(court)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="ml-1">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingCourtId(court.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-1">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Power className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courts.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Courts</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Power className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courts.filter((c) => c.status === "inactive").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Inactive Courts
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Power className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Courts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourts;
