import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { adminApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarBooking {
  id: string;
  bookingId: string;
  court: number;
  courtName: string;
  bookingDate: string;
  startHour: number;
  duration: number;
  customer: string;
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no-show"
    | "blocked";
  paymentStatus?: "pending" | "partial" | "paid" | "refunded";
  amount: string;
}

interface Court {
  id: string;
  name: string;
}

const AdminCalendar = () => {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] =
    useState<CalendarBooking | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await adminApi.courts.getAll();
        setCourts(response.data || []);
      } catch (err) {
        console.error("Error fetching courts:", err);
        setError("Failed to load courts");
      }
    };
    fetchCourts();
  }, []);

  // Fetch bookings when date or view mode changes
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        let startDate: string;
        let endDate: string;

        if (viewMode === "day") {
          startDate = format(currentDate, "yyyy-MM-dd");
          endDate = startDate;
        } else {
          const weekStart = startOfWeek(currentDate);
          startDate = format(weekStart, "yyyy-MM-dd");
          endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");
        }

        const response = await adminApi.bookings.getCalendar({
          startDate,
          endDate,
        });

        setBookings(response.data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load bookings";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentDate, viewMode]);

  // Generate time slots from 9 AM to 4 AM
  const timeSlots: string[] = [];
  for (let hour = 9; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  for (let hour = 0; hour < 4; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const courtNames = courts.map((c) => c.name);

  const getBookingForSlot = (courtIndex: number, hour: number) => {
    const bookingDate = format(currentDate, "yyyy-MM-dd");
    return bookings.find(
      (b) =>
        b.court === courtIndex &&
        format(new Date(b.bookingDate), "yyyy-MM-dd") === bookingDate &&
        hour >= b.startHour &&
        hour < b.startHour + b.duration,
    );
  };

  const isBookingStart = (courtIndex: number, hour: number) => {
    const bookingDate = format(currentDate, "yyyy-MM-dd");
    return bookings.find(
      (b) =>
        b.court === courtIndex &&
        format(new Date(b.bookingDate), "yyyy-MM-dd") === bookingDate &&
        b.startHour === hour,
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate), i),
  );

  // Helper function to get color classes for booking status
  const getBookingStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 border border-success/30";
      case "pending":
        return "bg-warning/20 border border-warning/30";
      case "completed":
        return "bg-blue-200/30 border border-blue-300/30";
      case "cancelled":
        return "bg-red-200/30 border border-red-300/30";
      case "no-show":
        return "bg-gray-200/30 border border-gray-300/30";
      case "blocked":
        return "bg-red-200/30 border border-red-300/30";
      default:
        return "bg-secondary/20 border border-secondary/30";
    }
  };

  // Helper function to get color classes for week view booking status
  const getBookingStatusWeekColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-success/20";
      case "pending":
        return "bg-warning/20";
      case "completed":
        return "bg-blue-200/30";
      case "cancelled":
        return "bg-red-200/30";
      case "no-show":
        return "bg-gray-200/30";
      case "blocked":
        return "bg-red-200/30";
      default:
        return "bg-secondary/20";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage all court bookings
          </p>
        </div>
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "day"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "week"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-card rounded-xl border mb-6">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentDate(addDays(currentDate, viewMode === "day" ? -1 : -7))
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-semibold text-foreground text-lg">
              {viewMode === "day"
                ? format(currentDate, "EEEE, MMMM d, yyyy")
                : `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`}
            </h2>
          </div>
          <button
            onClick={() =>
              setCurrentDate(addDays(currentDate, viewMode === "day" ? 1 : 7))
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day View */}
      {viewMode === "day" && (
        <div className="bg-card rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading bookings...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase border-r">
                      Time
                    </th>
                    {courtNames.map((courtName, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase border-r last:border-r-0"
                      >
                        {courtName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => {
                    const hour = parseInt(time.split(":")[0]);
                    return (
                      <tr key={timeIndex} className="border-t">
                        <td className="px-4 py-2 text-sm text-muted-foreground border-r bg-muted/30">
                          {time}
                        </td>
                        {courtNames.map((_, courtIndex) => {
                          const booking = getBookingForSlot(courtIndex, hour);
                          const isStart = isBookingStart(courtIndex, hour);

                          if (booking && !isStart) {
                            return null;
                          }

                          return (
                            <td
                              key={courtIndex}
                              className="px-2 py-1 border-r last:border-r-0 h-12"
                              rowSpan={booking ? booking.duration : 1}
                            >
                              {booking ? (
                                <button
                                  onClick={() => setSelectedBooking(booking)}
                                  className={`w-full h-full rounded-lg p-2 text-left transition-all hover:shadow-md ${getBookingStatusColor(booking.status)}`}
                                >
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {booking.customer}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {booking.duration}h • {booking.amount}
                                  </p>
                                </button>
                              ) : (
                                <div className="w-full h-full rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="bg-card rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading bookings...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase border-r">
                      Court
                    </th>
                    {weekDays.map((day, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase border-r last:border-r-0"
                      >
                        <div>{format(day, "EEE")}</div>
                        <div className="text-lg font-bold text-foreground">
                          {format(day, "d")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courtNames.map((courtName, courtIndex) => (
                    <tr key={courtIndex} className="border-t">
                      <td className="px-4 py-4 text-sm font-medium text-foreground border-r bg-muted/30">
                        {courtName}
                      </td>
                      {weekDays.map((dayDate, dayIndex) => {
                        const dayStr = format(dayDate, "yyyy-MM-dd");
                        const dayBookings = bookings
                          .filter(
                            (b) =>
                              b.court === courtIndex &&
                              format(new Date(b.bookingDate), "yyyy-MM-dd") ===
                                dayStr,
                          )
                          .slice(0, 2);
                        return (
                          <td
                            key={dayIndex}
                            className="px-2 py-2 border-r last:border-r-0 align-top"
                          >
                            <div className="space-y-1 min-h-[60px]">
                              {dayBookings.map((booking, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelectedBooking(booking)}
                                  className={`w-full rounded p-1 text-left text-xs ${getBookingStatusWeekColor(booking.status)}`}
                                >
                                  <p className="font-medium truncate">
                                    {booking.customer}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Booking Status
        </h3>
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
            <span className="text-sm text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200/30 border border-blue-300/30" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200/30 border border-red-300/30" />
            <span className="text-sm text-muted-foreground">
              Cancelled/Blocked
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200/30 border border-gray-300/30" />
            <span className="text-sm text-muted-foreground">No-Show</span>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-medium">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getBookingStatusColor(selectedBooking.status)}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium">
                    Court {selectedBooking.court + 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedBooking.duration} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-success">
                    {selectedBooking.amount}
                  </p>
                </div>
                {selectedBooking.paymentStatus && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedBooking.paymentStatus === "paid"
                          ? "bg-success/20 border border-success/30"
                          : selectedBooking.paymentStatus === "pending"
                            ? "bg-warning/20 border border-warning/30"
                            : selectedBooking.paymentStatus === "partial"
                              ? "bg-blue-200/30 border border-blue-300/30"
                              : "bg-gray-200/30 border border-gray-300/30"
                      }`}
                    >
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendar;
