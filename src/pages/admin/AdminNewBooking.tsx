import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, ArrowLeft, Check, Loader2, Loader } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { adminApi, pricingApi, bookingApi } from "@/lib/api";
import { Court, Pricing, TimeSlot } from "@/types/booking.types";

const AdminNewBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [notes, setNotes] = useState("");

  // Customer form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Loading states
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [courts, setCourts] = useState<Court[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoadingCourts(true);
        const response = await adminApi.courts.getAll();
        if (response.success && response.data) {
          setCourts(response.data);
          if (response.data.length > 0) {
            setSelectedCourt(response.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch courts:", error);
        toast({
          title: "Error",
          description: "Failed to load courts",
          variant: "destructive",
        });
      } finally {
        setLoadingCourts(false);
      }
    };

    fetchCourts();
  }, [toast]);

  // Fetch pricing on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        const response = await adminApi.pricing.getAll();
        if (response.success && response.data) {
          setPricing(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
        toast({
          title: "Error",
          description: "Failed to load pricing",
          variant: "destructive",
        });
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [toast]);

  // Generate time slots when court, date, or pricing changes
  useEffect(() => {
    if (selectedCourt && pricing.length > 0) {
      generateTimeSlots();
      fetchBookedSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt, selectedDate, pricing]);

  // Clear selected slots when court changes
  useEffect(() => {
    if (selectedSlots.length > 0) {
      setSelectedSlots([]);
      toast({
        title: "Court Changed",
        description:
          "You can only book slots for one court at a time. Previous selections cleared.",
        variant: "default",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt]);

  // Fetch booked slots for selected court and date
  const fetchBookedSlots = async () => {
    if (!selectedCourt || !selectedDate) return;

    try {
      setLoadingSlots(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Get all time slots to check
      const slotsToCheck: string[] = [];

      // 9 AM to 11 PM
      for (let hour = 9; hour < 24; hour++) {
        slotsToCheck.push(`${hour.toString().padStart(2, "0")}:00`);
      }

      // 12 AM to 4 AM (next day)
      for (let hour = 0; hour < 4; hour++) {
        slotsToCheck.push(`${hour.toString().padStart(2, "0")}:00`);
      }

      // Check each slot for conflicts
      const booked = new Set<string>();

      for (const slot of slotsToCheck) {
        const [hour] = slot.split(":").map(Number);
        let endHour = hour + 1;

        // Handle midnight boundary (24:00 -> 00:00)
        if (endHour >= 24) {
          endHour = endHour - 24;
        }

        const endTime = `${endHour.toString().padStart(2, "0")}:00`;

        try {
          const response = await bookingApi.checkAvailability({
            courtId: selectedCourt,
            bookingDate: formattedDate,
            startTime: slot,
            endTime,
          });

          console.log("Availability response:", response);

          if (!response.data?.available) {
            booked.add(slot);
          }
        } catch (error) {
          console.error(`Failed to check availability for ${slot}:`, error);
        }
      }

      setBookedSlots(booked);
    } catch (error) {
      console.error("Failed to fetch booked slots:", error);
      toast({
        title: "Error",
        description: "Failed to load booked slots",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Helper function to get days category based on date
  const getDays = (date: Date): "sun-wed" | "thu" | "fri" | "sat" => {
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    if (dayOfWeek >= 0 && dayOfWeek <= 3) {
      return "sun-wed";
    } else if (dayOfWeek === 4) {
      return "thu";
    } else if (dayOfWeek === 5) {
      return "fri";
    } else {
      return "sat";
    }
  };

  // Helper function to get price for a specific time slot
  const getPriceForSlot = (date: Date, hour: number): number => {
    // Use the selected date's pricing for all slots shown on that day
    const days = getDays(date);
    const timeSlot = hour >= 9 && hour < 19 ? "day" : "night";

    // Find matching pricing rule
    const rule = pricing.find(
      (p) => p.days === days && p.timeSlot === timeSlot && p.isActive,
    );

    return rule?.pricePerHour || 0;
  };

  // Generate time slots from 9 AM to 4 AM (next day)
  const generateTimeSlots = () => {
    if (pricing.length === 0) return;

    const slots = [];
    const dayOfWeek = selectedDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    // Check if selected date is today
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    const currentHour = today.getHours();

    // 9 AM to 11 PM
    for (let hour = 9; hour < 24; hour++) {
      const isNight = hour >= 19; // 7 PM onwards
      const price = getPriceForSlot(selectedDate, hour);

      // Check if this hour has passed (only for today)
      const isPastHour = isToday && hour <= currentHour;

      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        display: `${hour > 12 ? hour - 12 : hour}:00 ${
          hour >= 12 ? "PM" : "AM"
        }`,
        available: !isPastHour, // Disable past hours on current day
        price,
        category: isNight ? "night" : "day",
        isWeekend: [5, 6].includes(dayOfWeek),
        isPast: isPastHour,
      });
    }

    // 12 AM to 4 AM (next day)
    for (let hour = 0; hour < 4; hour++) {
      // These slots use the selected date's pricing (they belong to this booking day)
      const price = getPriceForSlot(selectedDate, hour);

      // For next day slots (12 AM - 4 AM), they're only available if:
      // - It's NOT today, OR
      // - It's today AND current hour is >= 9 (meaning we're in the booking window)
      const isPastHour = isToday && currentHour < 9;

      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        display: `${hour === 0 ? 12 : hour}:00 AM`,
        available: !isPastHour,
        price,
        category: "night",
        isWeekend: [4, 5, 6].includes(dayOfWeek),
        nextDay: true,
        isPast: isPastHour,
      });
    }

    setTimeSlots(slots);
  };

  const toggleSlot = (time: string) => {
    // Find the slot to check if it's available
    const slot = timeSlots.find((s) => s.time === time);

    // Check if slot is past hour (not available)
    if (slot && !slot.available) {
      toast({
        title: "Slot Unavailable",
        description: "Cannot book past time slots",
        variant: "destructive",
      });
      return;
    }

    // Check if slot is already booked
    if (bookedSlots.has(time)) {
      toast({
        title: "Slot Unavailable",
        description: "This time slot is already booked",
        variant: "destructive",
      });
      return;
    }

    // If deselecting
    if (selectedSlots.includes(time)) {
      // Check if it's a middle slot (not at either end)
      const allSlotTimes = timeSlots.map((s) => s.time);
      const currentIndices = selectedSlots
        .map((t) => allSlotTimes.indexOf(t))
        .sort((a, b) => a - b);
      const timeIndex = allSlotTimes.indexOf(time);

      const minIndex = Math.min(...currentIndices);
      const maxIndex = Math.max(...currentIndices);

      // If trying to unselect a middle slot
      if (timeIndex !== minIndex && timeIndex !== maxIndex) {
        toast({
          title: "Cannot Unselect Middle Slot",
          description:
            "You can only unselect from the ends. Remove slots in order from either end.",
          variant: "destructive",
        });
        return;
      }

      setSelectedSlots(selectedSlots.filter((t) => t !== time));
      return;
    }

    // If first slot, allow selection
    if (selectedSlots.length === 0) {
      setSelectedSlots([time]);
      return;
    }

    // Check if the new slot is consecutive
    const allSlotTimes = timeSlots.map((s) => s.time);
    const currentIndices = selectedSlots
      .map((t) => allSlotTimes.indexOf(t))
      .sort((a, b) => a - b);
    const newIndex = allSlotTimes.indexOf(time);

    const minIndex = Math.min(...currentIndices);
    const maxIndex = Math.max(...currentIndices);

    // Only allow if the new slot is immediately before or after the current range
    if (newIndex === minIndex - 1 || newIndex === maxIndex + 1) {
      // Check if there are any booked slots between the selected range
      const rangeStart = Math.min(minIndex, newIndex);
      const rangeEnd = Math.max(maxIndex, newIndex);
      const hasBookedInRange = allSlotTimes
        .slice(rangeStart, rangeEnd + 1)
        .some((slotTime) => bookedSlots.has(slotTime));

      if (hasBookedInRange) {
        toast({
          title: "Invalid Selection",
          description: "Cannot select slots with booked slots in between",
          variant: "destructive",
        });
        return;
      }

      setSelectedSlots([...selectedSlots, time].sort());
    } else {
      toast({
        title: "Invalid Selection",
        description: "Please select consecutive time slots only",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slotTime) => {
      const slot = timeSlots.find((s) => s.time === slotTime);
      return total + (slot?.price || 0);
    }, 0);
  };

  const validateForm = (): boolean => {
    // Check if court is selected
    if (!selectedCourt) {
      toast({
        title: "Validation Error",
        description: "Please select a court",
        variant: "destructive",
      });
      return false;
    }

    // Check if slots are selected
    if (selectedSlots.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one time slot",
        variant: "destructive",
      });
      return false;
    }

    // If not blocked, customer info is required
    if (!isBlocked) {
      if (!customerName.trim()) {
        toast({
          title: "Validation Error",
          description: "Customer name is required",
          variant: "destructive",
        });
        return false;
      }

      if (!customerPhone.trim()) {
        toast({
          title: "Validation Error",
          description: "Customer phone is required",
          variant: "destructive",
        });
        return false;
      }

      // Validate Saudi phone format (mobile or landline)
      const phoneRegex = /^(05\d{8}|(\+966)(5|1[1-9])\d{7,8})$/;
      if (!phoneRegex.test(customerPhone.trim())) {
        toast({
          title: "Validation Error",
          description:
            "Please enter a valid Saudi phone number (05XXXXXXXX or +9661XXXXXXXX)",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Sort slots properly, accounting for overnight bookings
      // Separate day slots (9-23) and night slots (0-4)
      const daySlots = selectedSlots.filter((s) => {
        const hour = parseInt(s.split(":")[0]);
        return hour >= 9;
      });
      const nightSlots = selectedSlots.filter((s) => {
        const hour = parseInt(s.split(":")[0]);
        return hour < 9;
      });

      // Determine start and end times
      let startTime: string;
      let actualEndTime: string;

      if (daySlots.length > 0 && nightSlots.length > 0) {
        // Overnight booking - starts in evening, ends in early morning
        startTime = daySlots.sort()[0];
        const lastNightSlot = nightSlots.sort()[nightSlots.length - 1];
        const [endHour, endMinute] = lastNightSlot.split(":").map(Number);
        actualEndTime = `${((endHour + 1) % 24)
          .toString()
          .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      } else if (daySlots.length > 0) {
        // Day only booking
        const sortedDaySlots = daySlots.sort();
        startTime = sortedDaySlots[0];
        const [endHour, endMinute] = sortedDaySlots[sortedDaySlots.length - 1]
          .split(":")
          .map(Number);
        actualEndTime = `${((endHour + 1) % 24)
          .toString()
          .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      } else {
        // Night only booking (early morning slots only)
        const sortedNightSlots = nightSlots.sort();
        startTime = sortedNightSlots[0];
        const [endHour, endMinute] = sortedNightSlots[
          sortedNightSlots.length - 1
        ]
          .split(":")
          .map(Number);
        actualEndTime = `${((endHour + 1) % 24)
          .toString()
          .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      }

      // Format date as YYYY-MM-DD
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Prepare booking data
      const bookingData = {
        courtId: selectedCourt,
        bookingDate: formattedDate,
        startTime,
        endTime: actualEndTime,
        notes: notes.trim() || undefined,
        isBlocked,
        customerName: !isBlocked ? customerName.trim() : undefined,
        customerPhone: !isBlocked ? customerPhone.trim() : undefined,
        customerEmail:
          !isBlocked && customerEmail.trim() ? customerEmail.trim() : undefined,
      };

      const response = await adminApi.bookings.createManual(bookingData);

      if (response.success) {
        toast({
          title: "Success",
          description: isBlocked
            ? "Time slot blocked successfully"
            : "Booking created successfully",
        });

        // Navigate back to bookings list
        navigate("/admin/bookings");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    selectedCourt &&
    selectedSlots.length > 0 &&
    (isBlocked || (customerName.trim() && customerPhone.trim()));

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/bookings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create Manual Booking
          </h1>
          <p className="text-muted-foreground">
            Create a new booking or block a time slot
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          {!isBlocked && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-semibold text-foreground mb-4">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="05XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date & Time Selection */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-foreground mb-4">Date & Time</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedSlots([]); // Clear slots when date changes
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="rounded-md border mt-2 pointer-events-auto admin-booking-calendar"
                  modifiers={{
                    today: new Date(),
                  }}
                />
              </div>
              <div>
                <Label>Select Court</Label>
                {loadingCourts ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <Select
                    value={selectedCourt}
                    onValueChange={setSelectedCourt}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a court" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Block Time Slot</Label>
                    <Switch
                      checked={isBlocked}
                      onCheckedChange={setIsBlocked}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Block this time slot without creating a customer booking
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="mb-2 block">Select Time Slots</Label>
              {loadingPricing ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin" />
                </div>
              ) : loadingSlots ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading availability...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot, index) => {
                    const isBooked = bookedSlots.has(slot.time);
                    const isSelected = selectedSlots.includes(slot.time);
                    const isPastOrBooked = !slot.available || isBooked; // Check both past and booked

                    return (
                      <button
                        key={index}
                        onClick={() => toggleSlot(slot.time)}
                        disabled={isPastOrBooked} // Disable if past hour OR booked
                        className={`p-2 rounded-lg text-sm font-medium transition-all border ${
                          isPastOrBooked
                            ? "bg-destructive/10 border-destructive/30 text-destructive cursor-not-allowed opacity-60"
                            : isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-muted/50 border-muted hover:bg-muted text-foreground"
                        }`}
                      >
                        <div>{slot.display}</div>
                        {isPastOrBooked ? (
                          <div className="text-xs mt-1">
                            {!slot.available ? "Past" : "Booked"}
                          </div>
                        ) : (
                          !isBlocked && (
                            <div className="text-xs mt-1 opacity-70">
                              {slot.price} SAR
                            </div>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-foreground mb-4">Admin Notes</h2>
            <Textarea
              placeholder="Add any internal notes about this booking..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-20">
            <h3 className="font-semibold text-foreground mb-4">
              Booking Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium text-foreground">
                  {courts.find((c) => c.id === selectedCourt)?.name ||
                    "Not selected"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {format(selectedDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">
                  {selectedSlots.length} hour(s)
                </span>
              </div>
              {isBlocked && (
                <div className="flex items-center gap-2 text-warning text-sm">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Blocking time slot
                </div>
              )}
            </div>

            {!isBlocked && (
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {calculateTotal()} SAR
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full text-background"
              size="lg"
              disabled={!isFormValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-background" />
                  {isBlocked ? "Block Time Slot" : "Create Booking"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewBooking;
