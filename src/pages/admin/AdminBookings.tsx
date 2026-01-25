import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Eye,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Loader,
  User,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type AdminBooking = {
  _id: string;
  customer: {
    _id?: string;
    name: string;
    phone: string;
    email?: string;
    id?: string;
  } | null;
  court: {
    _id?: string;
    name: string;
    description?: string;
    id?: string;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours?: number;
  totalPrice: number;
  finalPrice: number;
  pricingBreakdown?: Array<Record<string, unknown>>;
  discountAmount?: number;
  amountPaid?: number;
  status:
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "no-show"
    | "blocked";
  paymentStatus: "paid" | "partial" | "pending" | "refunded";
  isBlocked?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: "customer" | "admin";
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await adminApi.bookings.getAll();

        if (response.success && response.data) {
          const data = response.data as unknown;
          const dataObj = data as
            | { bookings?: AdminBooking[] }
            | AdminBooking[];
          const bookingsData = Array.isArray(dataObj)
            ? dataObj
            : dataObj.bookings || [];

          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("❌ Failed to fetch bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      setDeleting(bookingToDelete);

      // Call the cancel API endpoint instead of delete
      const response = await adminApi.bookings.updateStatus(
        bookingToDelete,
        "cancelled",
      );

      if (response.success) {
        // Update the booking status in the list
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingToDelete
              ? { ...b, status: "cancelled" as const }
              : b,
          ),
        );

        // Update selected booking if it's the one being cancelled
        if (selectedBooking?._id === bookingToDelete) {
          setSelectedBooking({
            ...selectedBooking,
            status: "cancelled" as const,
          });
        }

        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
        setIsDeleteDialogOpen(false);
        setBookingToDelete(null);
      }
    } catch (error) {
      console.error("❌ Failed to cancel booking:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingStatus(true);

      const response = await adminApi.bookings.updateStatus(
        bookingId,
        newStatus,
      );

      if (response.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, status: newStatus as AdminBooking["status"] }
              : b,
          ),
        );
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking({
            ...selectedBooking,
            status: newStatus as AdminBooking["status"],
          });
        }
        toast({
          title: "Success",
          description: "Booking status updated",
        });
      }
    } catch (error) {
      console.error("❌ Failed to update booking status:", error);

      // Reset the select to the original value
      if (selectedBooking) {
        // Force re-render of the select by temporarily clearing and restoring
        const original = selectedBooking.status;
        setSelectedBooking({
          ...selectedBooking,
          status: newStatus as AdminBooking["status"],
        });
        setTimeout(() => {
          setSelectedBooking({ ...selectedBooking, status: original });
        }, 0);
      }

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingStatus(true);
      const response = await adminApi.bookings.updatePayment(
        bookingId,
        newStatus,
      );
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  paymentStatus: newStatus as AdminBooking["paymentStatus"],
                }
              : b,
          ),
        );
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking({
            ...selectedBooking,
            paymentStatus: newStatus as AdminBooking["paymentStatus"],
          });
        }
        toast({
          title: "Success",
          description: "Payment status updated",
        });
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);

      // Reset the select to the original value
      if (selectedBooking) {
        const original = selectedBooking.paymentStatus;
        setSelectedBooking({
          ...selectedBooking,
          paymentStatus: newStatus as AdminBooking["paymentStatus"],
        });
        setTimeout(() => {
          setSelectedBooking({ ...selectedBooking, paymentStatus: original });
        }, 0);
      }

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours] = startTime.split(":").map(Number);
    const [endHours] = endTime.split(":").map(Number);
    let duration = endHours - startHours;
    if (duration < 0) duration += 24;
    return `${duration}h`;
  };

  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.customer?.name || "Blocked Slot";
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper to check if booking is blocked based on status
  const isBookingBlocked = (booking: AdminBooking) => {
    return booking.status === "blocked" || booking.isBlocked;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-background border-b p-4 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bookings Management
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage all court bookings
            </p>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" className="text-xs">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1">Export</span>
            </Button> */}
            <Link to="/admin/bookings/new">
              <Button variant="default" size="sm" className="text-xs">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">New Booking</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 lg:p-6 w-full">
        {/* Filters */}
        <div className="bg-card rounded-xl border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or booking ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-card w-full overflow-x-auto rounded-xl border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[900px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Booking ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Court
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Date & Time
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Payment
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Amount
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {booking._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isBookingBlocked(booking) ? (
                          <p className="font-medium text-sm text-warning truncate max-w-[150px]">
                            🔒 Blocked Slot
                          </p>
                        ) : (
                          <>
                            <p className="font-medium text-sm text-foreground truncate max-w-[150px]">
                              {booking.customer?.name || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {booking.customer?.phone || "N/A"}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {booking.court?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground whitespace-nowrap">
                          {formatDate(booking.bookingDate)}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                            booking.status === "confirmed"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : booking.status === "completed"
                                ? "bg-success/10 text-success"
                                : booking.status === "cancelled"
                                  ? "bg-destructive/10 text-destructive"
                                  : booking.status === "no-show"
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    : booking.status === "blocked"
                                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                      : "bg-warning/10 text-warning"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                            booking.paymentStatus === "paid"
                              ? "bg-success/10 text-success"
                              : booking.paymentStatus === "partial"
                                ? "bg-warning/10 text-warning"
                                : booking.paymentStatus === "refunded"
                                  ? "bg-secondary/10 text-secondary"
                                  : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground text-right whitespace-nowrap">
                        {booking.finalPrice} SAR
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {booking.status !== "cancelled" &&
                            booking.status !== "completed" && (
                              <button
                                onClick={() => {
                                  setBookingToDelete(booking._id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                disabled={deleting === booking._id}
                                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                {deleting === booking._id ? (
                                  <Loader className="w-4 h-4 text-destructive animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 text-destructive" />
                                )}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredBookings.length)} of{" "}
                  {filteredBookings.length} bookings
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {totalPages <= 5 ? (
                    // Show all pages if 5 or less
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          className={`min-w-[32px] ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ),
                    )
                  ) : (
                    // Smart pagination for more than 5 pages
                    <>
                      {currentPage > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[32px]"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      )}
                      {currentPage > 3 && (
                        <span className="px-1 text-muted-foreground">...</span>
                      )}

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page >= currentPage - 1 && page <= currentPage + 1,
                        )
                        .map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            className={`min-w-[32px] ${
                              currentPage === page
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}

                      {currentPage < totalPages - 2 && (
                        <span className="px-1 text-muted-foreground">...</span>
                      )}
                      {currentPage < totalPages - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[32px]"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this booking? The status will be
            changed to "cancelled".
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteBooking}
              disabled={!!deleting}
            >
              {deleting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setBookingToDelete(null);
              }}
              disabled={!!deleting}
            >
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-semibold text-lg">
                    #{selectedBooking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">
                    Created By
                  </p>
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                      selectedBooking.createdBy === "admin"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {selectedBooking.createdBy === "admin" ? (
                      <>
                        <User className="w-3 h-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3" />
                        Customer
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              {isBookingBlocked(selectedBooking) ? (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="font-semibold text-warning">
                        Blocked Time Slot
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This time slot is reserved
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">
                        {selectedBooking.customer?.name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Phone
                      </p>
                      <p className="font-medium">
                        {selectedBooking.customer?.phone || "N/A"}
                      </p>
                    </div>
                    {selectedBooking.customer?.email && (
                      <div className="bg-muted/30 rounded-lg p-3 sm:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="font-medium truncate">
                          {selectedBooking.customer.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Court</p>
                    <p className="font-medium">
                      {selectedBooking.court?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">
                      {formatTime(selectedBooking.startTime)} -{" "}
                      {formatTime(selectedBooking.endTime)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Duration
                    </p>
                    <p className="font-medium">
                      {calculateDuration(
                        selectedBooking.startTime,
                        selectedBooking.endTime,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Payment Details
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="font-semibold">
                      {selectedBooking.totalPrice} SAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Discount
                    </span>
                    <span
                      className={`font-semibold ${selectedBooking.discountAmount && selectedBooking.discountAmount > 0 ? "text-green-600" : ""}`}
                    >
                      -{selectedBooking.discountAmount || 0} SAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Final Amount</span>
                    <span className="font-bold text-lg text-success">
                      {selectedBooking.finalPrice} SAR
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Status Management
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Booking Status
                    </label>
                    <Select
                      value={selectedBooking.status}
                      onValueChange={(value) =>
                        handleUpdateBookingStatus(selectedBooking._id, value)
                      }
                      disabled={
                        updatingStatus ||
                        selectedBooking.status === "cancelled" ||
                        selectedBooking.status === "completed"
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    {(selectedBooking.status === "cancelled" ||
                      selectedBooking.status === "completed") && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Cannot update {selectedBooking.status} bookings
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Payment Status
                    </label>
                    <Select
                      value={selectedBooking.paymentStatus}
                      onValueChange={(value) =>
                        handleUpdatePaymentStatus(selectedBooking._id, value)
                      }
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Notes
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">
                      {selectedBooking.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedBooking.status !== "cancelled" &&
                selectedBooking.status !== "completed" && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        setBookingToDelete(selectedBooking._id);
                        setIsDeleteDialogOpen(true);
                      }}
                      disabled={updatingStatus}
                    >
                      Cancel This Booking
                    </Button>
                  </div>
                )}

              {selectedBooking.status === "cancelled" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-center text-destructive font-medium">
                    ❌ This booking has been cancelled
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
