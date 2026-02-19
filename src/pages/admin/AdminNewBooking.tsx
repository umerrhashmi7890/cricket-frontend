import { useState, useEffect, useRef, useCallback } from "react";
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
  const customerInfoRef = useRef<HTMLDivElement>(null);
  const courtSelectionRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);

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

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

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
  const [courtAvailability, setCourtAvailability] = useState<
    Record<string, number>
  >({});

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoadingCourts(true);
        const response = await adminApi.courts.getAll();
        if (response.success && response.data) {
          // Filter out archived courts
          const activeCourts = response.data.filter(
            (court) => court.status !== "archived",
          );
          setCourts(activeCourts);
          if (activeCourts.length > 0) {
            setSelectedCourt(activeCourts[0].id);
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

  // Fetch availability for all courts using batch endpoint
  const fetchAllCourtsAvailability = useCallback(async () => {
    if (!selectedDate || courts.length === 0) {
      return;
    }

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Check if selected date is today
      const today = new Date();
      const isToday =
        selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear();

      const currentHour = today.getHours();

      // Build time slots array
      const timeSlots: Array<{ startTime: string; endTime: string }> = [];

      // 9 AM to 11 PM
      for (let hour = 9; hour < 24; hour++) {
        const isPastHour = isToday && hour <= currentHour;
        if (!isPastHour) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          let endHour = hour + 1;
          if (endHour >= 24) endHour = endHour - 24;
          const endTime = `${endHour.toString().padStart(2, "0")}:00`;
          timeSlots.push({ startTime, endTime });
        }
      }

      // 12 AM to 4 AM (next day)
      for (let hour = 0; hour < 4; hour++) {
        const isPastHour = false;
        if (!isPastHour) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          const endHour = hour + 1;
          const endTime = `${endHour.toString().padStart(2, "0")}:00`;
          timeSlots.push({ startTime, endTime });
        }
      }

      // Single batch API call for all courts
      const courtIds = courts.map((court) => court.id);
      const response = await bookingApi.checkBatchAvailability({
        bookingDate: formattedDate,
        timeSlots,
        courtIds,
      });

      // Calculate available slot count for each court
      const availability: Record<string, number> = {};

      if (response.data) {
        Object.entries(response.data).forEach(([courtId, slots]) => {
          let availableCount = 0;
          Object.values(slots).forEach((slot) => {
            if (slot.available) {
              availableCount++;
            }
          });
          availability[courtId] = availableCount;
        });
      }

      setCourtAvailability(availability);
    } catch (error) {
      console.error("Failed to fetch court availability:", error);
    }
  }, [courts, selectedDate]);

  // Fetch availability for all courts when date or courts change
  useEffect(() => {
    if (courts.length > 0 && selectedDate) {
      fetchAllCourtsAvailability();
    }
  }, [courts, selectedDate, fetchAllCourtsAvailability]);

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

  // Fetch booked slots for selected court and date using batch endpoint
  const fetchBookedSlots = async () => {
    // Don't fetch if court hasn't been selected yet or is empty
    if (!selectedCourt || selectedCourt === "" || !selectedDate) {
      return;
    }

    try {
      setLoadingSlots(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Build time slots array
      const timeSlots: Array<{ startTime: string; endTime: string }> = [];

      // 9 AM to 11 PM
      for (let hour = 9; hour < 24; hour++) {
        const startTime = `${hour.toString().padStart(2, "0")}:00`;
        let endHour = hour + 1;
        if (endHour >= 24) endHour = endHour - 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:00`;
        timeSlots.push({ startTime, endTime });
      }

      // 12 AM to 4 AM (next day)
      for (let hour = 0; hour < 4; hour++) {
        const startTime = `${hour.toString().padStart(2, "0")}:00`;
        const endHour = hour + 1;
        const endTime = `${endHour.toString().padStart(2, "0")}:00`;
        timeSlots.push({ startTime, endTime });
      }

      // Single batch API call instead of 19+ individual calls
      const response = await bookingApi.checkBatchAvailability({
        bookingDate: formattedDate,
        timeSlots,
        courtIds: [selectedCourt],
      });

      // Extract booked slots from batch response
      const booked = new Set<string>();
      const courtData = response.data?.[selectedCourt];

      if (courtData) {
        Object.entries(courtData).forEach(([timeSlotKey, slotData]) => {
          if (!slotData.available) {
            booked.add(slotData.startTime);
          }
        });
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

      // For early morning slots (00:00-04:00):
      // If current time is 00:00-04:00 (early morning) and selected date is TODAY,
      // these slots are for TONIGHT (haven't happened yet), so all available.
      // Example: It's Thursday 00:10 AM, viewing Thursday → 12AM-4AM slots are for Thursday NIGHT → all available
      // Only mark as past if we're viewing YESTERDAY's page
      const isCurrentlyEarlyMorning =
        isToday && currentHour >= 0 && currentHour < 4;
      const isPastHour = false; // Early morning slots on today's page are always for tonight

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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    const baseTotal = calculateTotal();
    if (baseTotal === 0) {
      setPromoError("Please select time slots first");
      return;
    }

    try {
      setApplyingPromo(true);
      setPromoError("");

      // Validate promo code without phone number check (admin can reuse)
      const response = await adminApi.promoCodes.validate({
        code: promoCode.trim().toUpperCase(),
        bookingAmount: baseTotal,
      });

      if (response.data?.valid) {
        setPromoApplied(true);
        setPromoDiscount(response.data.discount || 0);
        toast({
          title: "Promo Code Applied",
          description: `Discount of ${response.data.discount} SAR applied!`,
        });
      } else {
        setPromoError(response.data?.message || "Invalid promo code");
        setPromoApplied(false);
        setPromoDiscount(0);
      }
    } catch (error) {
      setPromoError(error.message || "Failed to validate promo code");
      setPromoApplied(false);
      setPromoDiscount(0);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError("");
  };

  const validateForm = (): boolean => {
    // Step 1: Check if court is selected
    if (!selectedCourt) {
      toast({
        title: "Select a Court",
        description: "Please select a court to continue",
        variant: "destructive",
      });
      // Scroll to court selection
      courtSelectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }

    // Step 2: Check if slots are selected
    if (selectedSlots.length === 0) {
      toast({
        title: "Select Time Slots",
        description: "Please select at least one time slot",
        variant: "destructive",
      });
      // Scroll to time slots section
      timeSlotsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }

    // Step 3: If not blocked, customer info is required
    if (!isBlocked) {
      if (!customerName.trim()) {
        toast({
          title: "Customer Name Required",
          description: "Please enter the customer's name",
          variant: "destructive",
        });
        // Scroll to customer info section
        customerInfoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return false;
      }

      if (!customerPhone.trim()) {
        toast({
          title: "Customer Phone Required",
          description: "Please enter the customer's phone number",
          variant: "destructive",
        });
        // Scroll to customer info section
        customerInfoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
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

      // Format date once for reuse
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // RE-VALIDATE AVAILABILITY - Critical race condition prevention
      // This catches if client or another admin booked the same slots
      const timeSlots = selectedSlots.map((slot) => {
        const [hour, minute] = slot.split(":").map(Number);
        const endHour = (hour + 1) % 24;
        return {
          startTime: slot,
          endTime: `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        };
      });

      const availabilityCheck = await bookingApi.checkBatchAvailability({
        bookingDate: formattedDate,
        timeSlots,
        courtIds: [selectedCourt],
      });

      // Check if any of the selected slots are now unavailable
      const courtData = availabilityCheck.data?.[selectedCourt];
      if (courtData) {
        const unavailableSlots: string[] = [];
        Object.entries(courtData).forEach(([key, slotData]) => {
          if (!slotData.available) {
            unavailableSlots.push(slotData.startTime);
          }
        });

        if (unavailableSlots.length > 0) {
          toast({
            title: "Slots No Longer Available",
            description: `The following time slots were just booked: ${unavailableSlots.join(", ")}. Please refresh and select different slots.`,
            variant: "destructive",
          });
          setSubmitting(false);
          // Refresh the booked slots
          await fetchBookedSlots();
          return;
        }
      }

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
        promoCode:
          promoApplied && promoCode
            ? promoCode.trim().toUpperCase()
            : undefined,
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
            <div
              ref={customerInfoRef}
              className="bg-card rounded-xl border p-6"
            >
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
                    type="text"
                    placeholder="customer@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Promo Code Section */}
          {!isBlocked && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-semibold text-foreground mb-4">
                Promo Code (Optional)
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      disabled={promoApplied || applyingPromo}
                      className="uppercase"
                    />
                  </div>
                  {!promoApplied ? (
                    <Button
                      onClick={handleApplyPromo}
                      disabled={
                        !promoCode.trim() ||
                        applyingPromo ||
                        selectedSlots.length === 0
                      }
                    >
                      {applyingPromo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleRemovePromo}>
                      Remove
                    </Button>
                  )}
                </div>

                {promoError && (
                  <p className="text-sm text-destructive">{promoError}</p>
                )}

                {promoApplied && (
                  <div className="flex items-center gap-2 text-success text-sm">
                    <Check className="w-4 h-4" />
                    <span>
                      Promo code applied successfully! Discount: {promoDiscount}{" "}
                      SAR
                    </span>
                  </div>
                )}
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
              <div ref={courtSelectionRef}>
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
                      {courts.map((court) => {
                        const availableSlots =
                          courtAvailability[court.id] ?? null;
                        const isFullyBooked = availableSlots === 0;

                        return (
                          <SelectItem
                            key={court.id}
                            value={court.id}
                            disabled={isFullyBooked}
                          >
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span>{court.name}</span>
                              {availableSlots !== null && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    isFullyBooked
                                      ? "bg-destructive/20 text-destructive"
                                      : availableSlots < 5
                                        ? "bg-warning/20 text-warning"
                                        : "bg-primary/20 text-primary"
                                  }`}
                                >
                                  {isFullyBooked
                                    ? "Full"
                                    : `${availableSlots} slots`}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
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

            <div ref={timeSlotsRef} className="mt-6">
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {calculateTotal()} SAR
                    </span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Promo Discount</span>
                      <span className="font-medium text-success">
                        -{promoDiscount} SAR
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-foreground">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.max(0, calculateTotal() - promoDiscount)} SAR
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full text-background"
              size="lg"
              disabled={submitting}
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
