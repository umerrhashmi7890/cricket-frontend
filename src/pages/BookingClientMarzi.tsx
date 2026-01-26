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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [duration, setDuration] = useState<number>(1); // Duration in hours

  // Loading states
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingAvailableCourts, setLoadingAvailableCourts] = useState(false);

  // API data states
  const [allCourts, setAllCourts] = useState<Court[]>([]);
  const [availableCourts, setAvailableCourts] = useState<Court[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch courts on mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await courtApi.getAll();
        if (response.success && response.data) {
          const activeCourts = response.data.filter(
            (court: Court) => court.status === "active",
          );
          setAllCourts(activeCourts);
        }
      } catch (error) {
        console.error("Failed to fetch courts:", error);
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
    if (pricing.length > 0) {
      generateTimeSlots();
    }
  }, [selectedDate, pricing]);

  // Fetch availability for all courts when date or courts change
  useEffect(() => {
    if (selectedTimeSlot && selectedDate) {
      fetchAvailableCourts();
    } else {
      setAvailableCourts([]);
      setSelectedCourt("");
    }
  }, [selectedTimeSlot, selectedDate, duration]);

  // Fetch booked slots for selected court and date
  const fetchAvailableCourts = async () => {
    if (!selectedTimeSlot || !selectedDate || allCourts.length === 0) {
      return;
    }

    try {
      setLoadingAvailableCourts(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const available: Court[] = [];

      // Parse the selected time slot
      const [startHour] = selectedTimeSlot.split(":").map(Number);

      // Calculate end time based on duration
      let endHour = startHour + duration;
      if (endHour > 24) {
        endHour = endHour - 24;
      }

      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      // Check each court for availability
      for (const court of allCourts) {
        try {
          const response = await bookingApi.checkAvailability({
            courtId: court.id,
            bookingDate: formattedDate,
            startTime: selectedTimeSlot,
            endTime,
          });

          if (response.data?.available) {
            available.push(court);
          }
        } catch (error) {
          console.error(
            `Failed to check availability for ${court.name}:`,
            error,
          );
        }
      }

      setAvailableCourts(available);

      // Auto-select first available court if current selection is not available
      if (
        available.length > 0 &&
        !available.find((c) => c.id === selectedCourt)
      ) {
        setSelectedCourt(available[0].id);
      } else if (available.length === 0) {
        setSelectedCourt("");
      }
    } catch (error) {
      console.error("Failed to fetch available courts:", error);
      toast({
        title: "Error",
        description: "Failed to load available courts",
        variant: "destructive",
      });
    } finally {
      setLoadingAvailableCourts(false);
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
    const dayOfWeek = selectedDate.getDay();

    // Check if selected date is today
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    const currentHour = today.getHours();

    // 9 AM to 11 PM
    for (let hour = 9; hour < 24; hour++) {
      const isNight = hour >= 19;
      const price = getPriceForSlot(selectedDate, hour);
      const isPastHour = isToday && hour <= currentHour;

      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        display: `${hour > 12 ? hour - 12 : hour}:00 ${
          hour >= 12 ? "PM" : "AM"
        }`,
        available: !isPastHour,
        price,
        category: isNight ? "night" : "day",
        isWeekend: [5, 6].includes(dayOfWeek),
        isPast: isPastHour,
      });
    }

    // 12 AM to 4 AM (next day)
    for (let hour = 0; hour < 4; hour++) {
      const price = getPriceForSlot(selectedDate, hour);
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

  const calculateTotal = () => {
    if (!selectedTimeSlot || !pricing.length) return 0;

    const [startHour] = selectedTimeSlot.split(":").map(Number);
    let total = 0;

    for (let i = 0; i < duration; i++) {
      const hour = (startHour + i) % 24;
      total += getPriceForSlot(selectedDate, hour);
    }

    return total;
  };

  const goToPreviousDay = () => {
    const previousDay = subDays(selectedDate, 1);
    if (previousDay >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(previousDay);
      setCalendarMonth(previousDay);
      setSelectedTimeSlot("");
      setSelectedCourt("");
    }
  };

  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
    setCalendarMonth(nextDay);
    setSelectedTimeSlot("");
    setSelectedCourt("");
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
          {/* Left Panel - Date & Time Picker */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-4 lg:sticky lg:top-20">
              <h3 className="font-semibold text-foreground mb-4">
                Select Date & Time
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
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="rounded-md border mt-2 pointer-events-auto booking-calendar"
                  modifiers={{
                    today: new Date(),
                  }}
                />
              </div>

              {/* Time Slot Selector */}
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Select Start Time
                </h3>
                {loadingPricing || timeSlots.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          !slot.available
                            ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                            : selectedTimeSlot === slot.time
                              ? "bg-primary text-primary-foreground"
                              : slot.category === "night"
                                ? "bg-primary/10 text-foreground hover:bg-primary/20"
                                : "bg-secondary/10 text-foreground hover:bg-secondary/20"
                        }`}
                      >
                        <div>{slot.display}</div>
                        <div className="text-[10px] mt-0.5 opacity-70">
                          {slot.price} SAR/hr
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration Selector */}
              {selectedTimeSlot && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Duration
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          duration === hours
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Info */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    Pricing Info
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
                          <span className="text-xs text-muted-foreground truncate">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground whitespace-nowrap">
                          {cat.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Area - Available Courts */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border min-h-[600px]">
              {/* Header */}
              <div className="p-4 border-b">
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
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    {selectedTimeSlot && (
                      <p className="text-sm text-muted-foreground">
                        {timeSlots.find((s) => s.time === selectedTimeSlot)
                          ?.display || selectedTimeSlot}{" "}
                        • {duration} hour{duration > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={goToNextDay}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Available Courts Display */}
              <div className="p-6">
                {!selectedTimeSlot ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select Date & Time
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      Choose a date and time slot from the left panel to see
                      available courts
                    </p>
                  </div>
                ) : loadingAvailableCourts ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="w-10 h-10 animate-spin text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">
                      Finding available courts...
                    </span>
                  </div>
                ) : availableCourts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                      <Info className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Courts Available
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                      All courts are booked for this time slot. Try selecting a
                      different time or date.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTimeSlot("")}
                    >
                      Choose Different Time
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="font-semibold text-foreground">
                        Available Courts ({availableCourts.length})
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select a court to continue with your booking
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableCourts.map((court) => (
                        <button
                          key={court.id}
                          onClick={() => setSelectedCourt(court.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedCourt === court.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          {court.imageUrl && (
                            <img
                              src={court.imageUrl}
                              alt={court.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h4 className="font-semibold text-foreground mb-1">
                            {court.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {court.description}
                          </p>
                          {court.features &&
                            Array.isArray(court.features) &&
                            court.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {court.features
                                  .slice(0, 3)
                                  .map((feature, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-secondary/20 text-secondary-foreground rounded"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                {court.features.length > 3 && (
                                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                                    +{court.features.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">
                              {calculateTotal()} SAR total
                            </span>
                            {selectedCourt === court.id && (
                              <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">
                Booking Summary
              </h3>

              {selectedCourt && selectedTimeSlot ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Court</span>
                      <span className="font-medium text-foreground">
                        {availableCourts.find((c) => c.id === selectedCourt)
                          ?.name || "Court"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {format(selectedDate, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Time</span>
                      <span className="font-medium text-foreground">
                        {timeSlots.find((s) => s.time === selectedTimeSlot)
                          ?.display || selectedTimeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">
                        {duration} hour{duration > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Time Breakdown:
                    </h4>
                    <div className="space-y-1">
                      {Array.from({ length: duration }).map((_, i) => {
                        const [startHour] = selectedTimeSlot
                          .split(":")
                          .map(Number);
                        const hour = (startHour + i) % 24;
                        const nextHour = (hour + 1) % 24;
                        const price = getPriceForSlot(selectedDate, hour);

                        return (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}
                              :00 -{" "}
                              {nextHour > 12
                                ? nextHour - 12
                                : nextHour === 0
                                  ? 12
                                  : nextHour}
                              :00 {hour >= 12 ? "PM" : "AM"}
                            </span>
                            <span className="text-foreground">{price} SAR</span>
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
                        courtId: selectedCourt,
                        court:
                          availableCourts.find((c) => c.id === selectedCourt)
                            ?.name || "Court",
                        date: selectedDate,
                        startTime: selectedTimeSlot,
                        duration: duration,
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
                  <p className="text-muted-foreground text-sm mb-2">
                    {!selectedTimeSlot
                      ? "Select a date and time slot to see available courts"
                      : "Select a court to continue"}
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
