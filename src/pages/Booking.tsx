import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar as CalendarIcon,
  Loader2,
  Loader,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { courtApi, pricingApi, bookingApi } from "@/lib/api";
import { Court, Pricing, TimeSlot } from "@/types/booking.types";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [slotError, setSlotError] = useState<string>("");

  // Loading states
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // API data states
  const [courts, setCourts] = useState<Court[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoadingCourts(true);
        const response = await courtApi.getAll();
        if (response.success && response.data) {
          const activeCourts = response.data.filter(
            (court: Court) => court.status === "active",
          );
          setCourts(activeCourts);
          if (activeCourts.length > 0) {
            setSelectedCourt(activeCourts[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch courts:", error);
      } finally {
        setLoadingCourts(false);
      }
    };

    fetchCourts();
  }, []);

  // Fetch pricing on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        // Try to fetch all pricing rules (should be public endpoint)
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing`,
        );
        const data = await response.json();

        if (response.ok && data.success && data.data) {
          setPricing(data.data);
        } else {
          console.error("Failed to fetch pricing:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, []);

  // Generate time slots when court, date, or pricing changes
  useEffect(() => {
    if (selectedCourt && pricing.length > 0) {
      generateTimeSlots();
      fetchBookedSlots();
    }
  }, [selectedCourt, selectedDate, pricing]);

  // Fetch booked slots for selected court and date
  const fetchBookedSlots = async () => {
    // Don't fetch if court hasn't been selected yet or is empty
    if (!selectedCourt || selectedCourt === "" || !selectedDate) {
      return;
    }

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
      // These slots use the selected date's pricing
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
        isWeekend: [5, 6].includes(dayOfWeek),
        nextDay: true,
        isPast: isPastHour,
      });
    }

    setTimeSlots(slots);
  };

  const toggleSlot = (time: string) => {
    setSlotError(""); // Clear any previous errors

    // Find the slot to check if it's available or past
    const slot = timeSlots.find((s) => s.time === time);

    // Check if slot is past hour (not available)
    if (slot && !slot.available) {
      setSlotError("Cannot book past time slots");
      setTimeout(() => setSlotError(""), 4000);
      return;
    }

    // Check if slot is already booked
    if (bookedSlots.has(time)) {
      setSlotError(
        "This time slot is already booked. Please select another slot.",
      );
      setTimeout(() => setSlotError(""), 4000);
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
        setSlotError(
          "You can only unselect from the ends. Remove slots in order from either end.",
        );
        setTimeout(() => setSlotError(""), 4000);
        return;
      }

      setSelectedSlots(selectedSlots.filter((t) => t !== time));
      return;
    }

    // If this is the first slot, allow it
    if (selectedSlots.length === 0) {
      setSelectedSlots([time]);
      return;
    }

    // Check if the new slot is consecutive with existing selections
    const currentSlotIndex = timeSlots.findIndex((s) => s.time === time);
    const selectedIndices = selectedSlots
      .map((t) => timeSlots.findIndex((s) => s.time === t))
      .sort((a, b) => a - b);

    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);

    // Allow adding only if it's adjacent to the current selection
    const isAdjacent =
      currentSlotIndex === minIndex - 1 || currentSlotIndex === maxIndex + 1;

    if (!isAdjacent) {
      setSlotError(
        "Please select consecutive time slots only. You can only add slots at the start or end of your current selection.",
      );
      setTimeout(() => setSlotError(""), 4000); // Clear error after 4 seconds
      return;
    }

    // Check if there are any booked slots between the selected range
    const rangeStart = Math.min(minIndex, currentSlotIndex);
    const rangeEnd = Math.max(maxIndex, currentSlotIndex);
    const allSlotTimes = timeSlots.map((s) => s.time);
    const hasBookedInRange = allSlotTimes
      .slice(rangeStart, rangeEnd + 1)
      .some((slotTime) => bookedSlots.has(slotTime));

    if (hasBookedInRange) {
      setSlotError(
        "Cannot select slots with booked slots in between. Please select a different range.",
      );
      setTimeout(() => setSlotError(""), 4000);
      return;
    }

    // Check if adding this slot would create a gap
    const newIndices = [...selectedIndices, currentSlotIndex].sort(
      (a, b) => a - b,
    );
    for (let i = 0; i < newIndices.length - 1; i++) {
      if (newIndices[i + 1] - newIndices[i] !== 1) {
        setSlotError(
          "Please select consecutive time slots only. Gaps are not allowed.",
        );
        setTimeout(() => setSlotError(""), 4000);
        return;
      }
    }

    // If all checks pass, add the slot
    setSelectedSlots([...selectedSlots, time]);
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slotTime) => {
      const slot = timeSlots.find((s) => s.time === slotTime);
      return total + (slot?.price || 0);
    }, 0);
  };

  const goToPreviousDay = () => {
    const previousDay = subDays(selectedDate, 1);
    // Don't allow going to past dates
    if (previousDay >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(previousDay);
      setCalendarMonth(previousDay);
      setSelectedSlots([]); // Clear selected slots when changing date
      setSlotError(""); // Clear any errors
    }
  };

  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
    setCalendarMonth(nextDay);
    setSelectedSlots([]); // Clear selected slots when changing date
    setSlotError(""); // Clear any errors
  };

  const handleCourtChange = (courtId: string) => {
    // If user has selected slots and is changing court, warn them
    if (selectedSlots.length > 0 && courtId !== selectedCourt) {
      toast({
        title: "Court Changed",
        description: `Your previously selected time slots have been cleared. Please select slots for ${
          courts.find((c) => c.id === courtId)?.name || "the new court"
        }.`,
        variant: "default",
      });
      setSelectedSlots([]);
      setSlotError("");
    }
    setSelectedCourt(courtId);
  };

  const priceCategories =
    pricing.length > 0
      ? [
          {
            label: "Weekday Day",
            color: "bg-secondary/20 border-secondary",
            price: `${pricing.find((p) => p.category === "weekday-day")?.pricePerHour || 0} SAR/hr`,
          },
          {
            label: "Weekday Night",
            color: "bg-primary/20 border-primary",
            price: `${pricing.find((p) => p.category === "weekday-night")?.pricePerHour || 0} SAR/hr`,
          },
          {
            label: "Weekend Day",
            color: "bg-accent/20 border-accent",
            price: `${pricing.find((p) => p.category === "weekend-day")?.pricePerHour || 0} SAR/hr`,
          },
          {
            label: "Weekend Night",
            color: "bg-warning/20 border-warning",
            price: `${pricing.find((p) => p.category === "weekend-night")?.pricePerHour || 0} SAR/hr`,
          },
        ]
      : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-2">
            Book Your Court
          </h1>
          <p className="text-background/80">
            Select your preferred date, time, and court
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Date Picker */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-4 lg:sticky lg:top-20">
              <h3 className="font-semibold text-foreground mb-4">
                Select Date
              </h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarMonth(date);
                      setSelectedSlots([]); // Clear slots when date changes
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="rounded-md border mt-2 pointer-events-auto booking-calendar"
                  modifiers={{
                    today: new Date(),
                  }}
                  // modifiersClassNames={{
                  //   today:
                  //     "bg-green-200 text-orange-600 dark:bg-green-900/20 dark:text-orange-400 font-semibold",
                  //   selected:
                  //     "!bg-transparent rounded-2 !text-orange-600 dark:!text-orange-400 font-bold ",
                  // }}
                />
              </div>
              {/* Court Selector */}
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Select Court
                </h3>
                {loadingCourts ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : courts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No courts available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {courts.map((court) => (
                      <button
                        key={court.id}
                        onClick={() => handleCourtChange(court.id)}
                        className={`w-full p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                          selectedCourt === court.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {court.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Legend */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    Price Legend
                  </h3>
                  <Link
                    to="/courts#pricing"
                    className="text-xs text-primary hover:underline"
                  >
                    View Full Pricing
                  </Link>
                </div>
                {loadingPricing ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {priceCategories.map((cat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-4 h-4 rounded border flex-shrink-0 ${cat.color}`}
                          ></div>
                          <span className=" text-xs sm:text-sm text-muted-foreground truncate">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                          {cat.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Area - Time Grid */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      selectedDate <= new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {courts.find((c) => c.id === selectedCourt)?.name ||
                        "Select a court"}
                    </p>
                  </div>
                  <button
                    onClick={goToNextDay}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="p-4">
                {courts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm font-medium">
                      No courts available
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Please check back later or contact support
                    </p>
                  </div>
                ) : loadingPricing ||
                  pricing.length === 0 ||
                  !selectedCourt ||
                  timeSlots.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading availability...
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot, index) => {
                      const isBooked = bookedSlots.has(slot.time);
                      const isSelected = selectedSlots.includes(slot.time);
                      const isPastOrBooked = !slot.available || isBooked;
                      const isAvailable = slot.available && !isBooked;

                      return (
                        <button
                          key={index}
                          onClick={() => isAvailable && toggleSlot(slot.time)}
                          disabled={isPastOrBooked}
                          className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                            isPastOrBooked
                              ? "bg-destructive/10 border-destructive/30 text-destructive cursor-not-allowed opacity-60"
                              : isSelected
                                ? "bg-primary border-primary text-primary-foreground shadow-md"
                                : isAvailable
                                  ? slot.category === "night"
                                    ? "bg-primary/10 border-primary/30 hover:bg-primary/20 text-foreground"
                                    : "bg-secondary/10 border-secondary/30 hover:bg-secondary/20 text-foreground"
                                  : "bg-muted border-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          <div>{slot.display}</div>
                          {isPastOrBooked ? (
                            <div className="text-xs mt-1">
                              {!slot.available ? "Past" : "Booked"}
                            </div>
                          ) : isAvailable ? (
                            <div className="text-xs mt-1 opacity-70">
                              {slot.price} SAR
                            </div>
                          ) : (
                            <div className="text-xs mt-1">Unavailable</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Error message */}
                {slotError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{slotError}</p>
                  </div>
                )}

                {/* Overnight slots notice */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Slots from 12 AM to 4 AM are overnight slots and extend into
                    the next day. Price transitions occur at 7 PM.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">
                Booking Summary
              </h3>

              {selectedSlots.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Court</span>
                      <span className="font-medium text-foreground">
                        {courts.find((c) => c.id === selectedCourt)?.name ||
                          "Court"}
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
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Selected Slots:
                    </h4>
                    <div className="space-y-1">
                      {selectedSlots.sort().map((slotTime) => {
                        const slot = timeSlots.find((s) => s.time === slotTime);
                        return (
                          <div
                            key={slotTime}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {slot?.display}
                            </span>
                            <span className="text-foreground">
                              {slot?.price} SAR
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {calculateTotal()} SAR
                      </span>
                    </div>
                    <Link
                      to="/booking/details"
                      state={{
                        court:
                          courts.find((c) => c.id === selectedCourt)?.name ||
                          "Court",
                        date: selectedDate,
                        slots: selectedSlots,
                        total: calculateTotal(),
                      }}
                    >
                      <Button
                        variant="hero"
                        className="w-full text-background"
                        size="lg"
                      >
                        Continue to Details
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Select time slots from the calendar to start your booking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
