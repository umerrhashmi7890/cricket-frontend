import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  ArrowRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { adminApi, bookingApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingConfirmation {
  bookingId: string;
  court: string;
  date: string;
  time: string;
  slots: string[];
  duration: string;
  totalPaid: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

const Confirmation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] =
    useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const createBookingAfterPayment = async () => {
      try {
        // Get payment ID from URL query params (Moyasar redirects with ?id=payment_id)
        const params = new URLSearchParams(location.search);
        const paymentId = params.get("id");
        const message = params.get("message");

        // Get booking data from location state or sessionStorage (fallback)
        let bookingData = location.state;
        if (!bookingData) {
          const stored = sessionStorage.getItem("pendingBooking");
          if (stored) {
            bookingData = JSON.parse(stored);
            sessionStorage.removeItem("pendingBooking"); // Clean up
          }
        }

        if (!paymentId) {
          setError("Payment information not found");
          setLoading(false);
          return;
        }

        // Check payment status with Moyasar
        const paymentResponse = await adminApi.payment.getStatus(paymentId);

        if (paymentResponse.data?.status === "paid") {
          // Payment confirmed - check if booking already exists (webhook may have created it)

          // Check for existing booking by paymentId
          try {
            const existingBookingResponse =
              await bookingApi.getByPaymentId(paymentId);

            if (
              existingBookingResponse.success &&
              existingBookingResponse.data
            ) {
              // Booking already exists - just display it (might be from webhook or previous page load)
              const existingBooking = existingBookingResponse.data;
              const bookingId = existingBooking._id || existingBooking.id;

              console.log(
                "✅ Booking already exists, displaying existing booking:",
                bookingId,
              );

              // Get court name from populated court field
              const courtName =
                typeof existingBooking.court === "string"
                  ? "Court"
                  : existingBooking.court?.name || "Court";

              // Get customer data from populated customer field
              const customerData =
                typeof existingBooking.customer === "object" &&
                existingBooking.customer
                  ? existingBooking.customer
                  : null;

              // Get booking data for display
              if (!bookingData?.courtId && paymentResponse.data?.metadata) {
                const metadata = paymentResponse.data.metadata;
                bookingData = {
                  court: metadata.court || courtName,
                  date: metadata.date,
                  slots:
                    typeof metadata.slots === "string"
                      ? JSON.parse(metadata.slots)
                      : [],
                };
              }

              // Always get slots from metadata if not in bookingData
              let displaySlots = bookingData?.slots || [];
              if (
                (!displaySlots || displaySlots.length === 0) &&
                paymentResponse.data?.metadata
              ) {
                const metadata = paymentResponse.data.metadata;
                displaySlots =
                  typeof metadata.slots === "string"
                    ? JSON.parse(metadata.slots)
                    : metadata.slots || [];
              }

              // Calculate duration from start/end time if slots not available
              let duration = "N/A";
              if (displaySlots && displaySlots.length > 0) {
                duration = `${displaySlots.length} hour${displaySlots.length > 1 ? "s" : ""}`;
              } else if (existingBooking.durationHours) {
                duration = `${existingBooking.durationHours} hour${existingBooking.durationHours > 1 ? "s" : ""}`;
              }

              setBookingDetails({
                bookingId: bookingId || "N/A",
                court: bookingData?.court || courtName,
                date: format(
                  new Date(existingBooking.bookingDate),
                  "EEEE, MMMM d, yyyy",
                ),
                time: `${existingBooking.startTime} - ${existingBooking.endTime}`,
                slots: displaySlots,
                duration: duration,
                totalPaid: `${(existingBooking.amountPaid || existingBooking.finalPrice || 0).toFixed(2)} SAR`,
                paymentMethod: paymentResponse.data.source?.company || "Card",
                customerName: customerData?.name || "N/A",
                customerPhone: customerData?.phone || "N/A",
                customerEmail: customerData?.email || "",
              });

              setLoading(false);
              return; // Don't create duplicate booking
            }
          } catch (err) {
            // Booking doesn't exist yet - proceed to create it
            console.log("ℹ️ No existing booking found, will create new one");
          }

          // Proceed with booking creation
        } else if (paymentResponse.data?.status === "pending") {
          // Payment is being processed - create booking as pending
          setError(
            "Payment is being processed. You will receive a confirmation email once the payment is approved. Your booking reference will be sent to your email.",
          );
          setLoading(false);
          return;
        } else {
          // Payment failed, cancelled, or rejected
          setError(
            `Payment ${paymentResponse.data?.status || "failed"}. ${message || ""}`,
          );
          setLoading(false);
          return;
        }

        // If no booking data in state or sessionStorage, try to get from payment metadata
        if (!bookingData?.courtId && paymentResponse.data?.metadata) {
          const metadata = paymentResponse.data.metadata;
          bookingData = {
            courtId: metadata.courtId,
            court: metadata.court,
            date: metadata.date,
            slots:
              typeof metadata.slots === "string"
                ? JSON.parse(metadata.slots)
                : [],
            customerName: metadata.customerName,
            customerPhone: metadata.customerPhone,
            customerEmail: metadata.customerEmail,
            name: metadata.customerName,
            phone: metadata.customerPhone,
            email: metadata.customerEmail,
            promoCode: metadata.promoCode,
            finalTotal: metadata.finalTotal,
            amountNow: metadata.amountNow,
          };
        }

        // Payment successful, create booking
        if (
          !bookingData?.courtId ||
          !bookingData?.date ||
          !bookingData?.slots
        ) {
          setError("Booking information incomplete");
          setLoading(false);
          return;
        }

        // Convert slots array to startTime and endTime
        const slots = bookingData.slots;

        // Sort slots based on booking flow order (9AM-11PM, then 12AM-4AM)
        // This handles midnight crossing: ['00:00', '23:00'] -> ['23:00', '00:00']
        const sortedSlots = [...slots].sort((a, b) => {
          const [aHour, aMin] = a.split(":").map(Number);
          const [bHour, bMin] = b.split(":").map(Number);

          // Operating hours: 9AM-11PM (9-23), then 12AM-4AM (0-3)
          // Map early morning (0-3) to values after 23:00 for sorting
          const getOrderValue = (hour: number) => {
            if (hour >= 0 && hour <= 3) {
              return hour + 24; // 00:00 becomes 24, 01:00 becomes 25, etc.
            }
            return hour; // 9-23 stay as is
          };

          const aOrder = getOrderValue(aHour) * 60 + aMin;
          const bOrder = getOrderValue(bHour) * 60 + bMin;
          return aOrder - bOrder;
        });

        const startTime = sortedSlots[0]; // First slot (e.g., "23:00")

        // Calculate end time: last slot + 1 hour
        // Each slot represents a 1-hour block, so if slots = ["23:00", "00:00"],
        // booking is 23:00-01:00 (2 hours)
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        const [lastHour, lastMinute] = lastSlot.split(":").map(Number);
        const endHour = (lastHour + 1) % 24; // Handle midnight boundary
        const endTime = `${endHour.toString().padStart(2, "0")}:${lastMinute.toString().padStart(2, "0")}`;

        console.log("Booking time calculation:", {
          originalSlots: slots,
          sortedSlots,
          startTime,
          endTime,
          duration: `${sortedSlots.length} hour(s)`,
        });

        const bookingPayload = {
          courtId: bookingData.courtId,
          bookingDate: bookingData.date,
          startTime: startTime,
          endTime: endTime,
          customerPhone: bookingData.customerPhone || bookingData.phone,
          customerName: bookingData.customerName || bookingData.name,
          customerEmail: bookingData.customerEmail || bookingData.email,
          notes: bookingData.notes || "",
          promoCode: bookingData.promoCode || undefined,
          paymentId: paymentId,
          paymentStatus: "paid",
          amountPaid: paymentResponse.data.amount / 100, // Convert halalas to SAR
        };

        const bookingResponse = await bookingApi.create(bookingPayload);

        if (bookingResponse.success && bookingResponse.data) {
          const newBookingId =
            bookingResponse.data._id || bookingResponse.data.id;

          setBookingDetails({
            bookingId: newBookingId || "N/A",
            court: bookingData.court,
            date: format(new Date(bookingData.date), "EEEE, MMMM d, yyyy"),
            time: `${startTime} - ${endTime}`,
            slots: slots,
            duration: `${slots.length} hour${slots.length > 1 ? "s" : ""}`,
            totalPaid: `${(paymentResponse.data.amount / 100).toFixed(2)} SAR`,
            paymentMethod: paymentResponse.data.source?.company || "Card",
            customerName: bookingData.customerName || bookingData.name,
            customerPhone: bookingData.customerPhone || bookingData.phone,
            customerEmail: bookingData.customerEmail || bookingData.email,
          });

          toast({
            title: "Booking Confirmed!",
            description: "Your court has been successfully reserved",
            variant: "default",
          });
        } else {
          setError("Failed to create booking");
        }
      } catch (err) {
        console.error("Booking creation error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create booking";
        setError(errorMessage);
        toast({
          title: "Booking Error",
          description:
            errorMessage || "Failed to create booking. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createBookingAfterPayment();
  }, [location, toast]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Processing your booking...</p>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <section className="bg-destructive py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive-foreground/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-destructive-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-destructive-foreground mb-2">
              Booking Failed
            </h1>
            <p className="text-destructive-foreground/80 mb-6">
              {error || "Something went wrong"}
            </p>
            <Button variant="secondary" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="bg-success py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-success-foreground/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-success-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-success-foreground/80">
            Your court has been successfully reserved
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Booking ID */}
          <div className="bg-card rounded-xl border p-6 mb-6 text-center">
            <p className="text-muted-foreground mb-2">Booking Reference</p>
            <p className="text-2xl font-mono font-bold text-foreground tracking-wider">
              {bookingDetails.bookingId}
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-card rounded-xl border overflow-hidden mb-6">
            <div className="hero-gradient p-4">
              <h2 className="font-semibold text-white">Booking Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium text-foreground">
                    {bookingDetails.court}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {bookingDetails.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">
                    {bookingDetails.time} ({bookingDetails.duration})
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-xl font-bold text-success">
                    {bookingDetails.totalPaid}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  {bookingDetails.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {/* SMS Notification */}
          <div className="bg-secondary/10 rounded-xl p-4 mb-6 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                SMS Confirmation Sent
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation message has been sent to your email with all
                booking details.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/booking" className="flex-1">
              <Button variant="hero" size="lg" className="w-full text-white">
                Book Another Court
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
