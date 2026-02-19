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
  const [pollingStatus, setPollingStatus] = useState<string>(
    "Verifying payment...",
  );

  useEffect(() => {
    const createBookingAfterPayment = async () => {
      try {
        // Get payment ID or booking ID from URL query params
        const params = new URLSearchParams(location.search);
        const paymentId = params.get("id");
        const bookingId = params.get("bookingId");
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

        // Handle direct booking (free/100% discount - no payment gateway)
        if (bookingId && !paymentId) {
          try {
            const bookingResponse = await bookingApi.getById(bookingId);

            if (bookingResponse.success && bookingResponse.data) {
              const booking = bookingResponse.data;

              // Get court name from populated court field
              const courtName =
                typeof booking.court === "string"
                  ? "Court"
                  : booking.court?.name || "Court";

              // Get customer data from populated customer field
              const customerData =
                typeof booking.customer === "object" && booking.customer
                  ? booking.customer
                  : { name: "Guest", phone: "", email: "" };

              // Determine payment method based on booking status
              let paymentMethod = "Card";
              let displayAmount = `${booking.amountPaid || 0} SAR`;

              if (
                booking.paymentStatus === "pending" &&
                booking.amountPaid === 0
              ) {
                // Pay at venue
                paymentMethod = "Pay at Venue";
                displayAmount = `${booking.finalPrice || 0} SAR (Due at Venue)`;
              } else if (
                booking.discountAmount > 0 &&
                booking.finalPrice === 0
              ) {
                // 100% discount via promo code
                paymentMethod = "Promo Code (100% Discount)";
                displayAmount = "0 SAR";
              }

              setBookingDetails({
                bookingId: booking._id || booking.id || bookingId,
                court: courtName,
                date: format(
                  new Date(booking.bookingDate),
                  "EEEE, MMMM d, yyyy",
                ),
                time: `${booking.startTime} - ${booking.endTime}`,
                slots: [],
                duration: `${booking.durationHours || 0}h`,
                totalPaid: displayAmount,
                paymentMethod: paymentMethod,
                customerName: customerData.name || "Guest",
                customerPhone: customerData.phone || "",
                customerEmail: customerData.email || "",
              });

              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("Error fetching booking:", err);
            setError("Booking not found");
            setLoading(false);
            return;
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
            // Booking doesn't exist yet - webhook is still processing
            console.log(
              "ℹ️ No existing booking found, waiting for webhook to create it...",
            );

            setPollingStatus("Payment confirmed! Creating your booking...");

            // Poll for booking creation (webhook should create it within a few seconds)
            let attempts = 0;
            const maxAttempts = 10; // Poll for up to 10 seconds

            while (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
              attempts++;

              // Update status message every 5 seconds
              if (attempts % 5 === 0) {
                setPollingStatus(
                  `Still processing... (${attempts}/${maxAttempts} seconds)`,
                );
              }

              try {
                const pollingResponse =
                  await bookingApi.getByPaymentId(paymentId);

                if (pollingResponse.success && pollingResponse.data) {
                  // Booking created by webhook!
                  const booking = pollingResponse.data;
                  const bookingId = booking._id || booking.id;

                  const courtName =
                    typeof booking.court === "string"
                      ? "Court"
                      : booking.court?.name || "Court";

                  const customerData =
                    typeof booking.customer === "object" && booking.customer
                      ? booking.customer
                      : null;

                  let duration = "N/A";
                  if (booking.durationHours) {
                    duration = `${booking.durationHours} hour${booking.durationHours > 1 ? "s" : ""}`;
                  }

                  setBookingDetails({
                    bookingId: bookingId || "N/A",
                    court: courtName,
                    date: format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy",
                    ),
                    time: `${booking.startTime} - ${booking.endTime}`,
                    slots: [],
                    duration: duration,
                    totalPaid: `${(booking.amountPaid || booking.finalPrice || 0).toFixed(2)} SAR`,
                    paymentMethod:
                      paymentResponse.data.source?.company || "Card",
                    customerName: customerData?.name || "N/A",
                    customerPhone: customerData?.phone || "N/A",
                    customerEmail: customerData?.email || "",
                  });

                  setLoading(false);
                  toast({
                    title: "Booking Confirmed!",
                    description: "Your court has been successfully reserved",
                    variant: "default",
                  });
                  return;
                }
              } catch (pollErr) {
                // Booking still not created, continue polling
                console.log(`⏳ Polling attempt ${attempts}/${maxAttempts}...`);
              }
            }

            // If we reach here, webhook didn't create booking in time
            // Show success message with pending status instead of error
            setBookingDetails({
              bookingId: "Processing...",
              court: bookingData?.court || "Court",
              date: bookingData?.date
                ? format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")
                : "N/A",
              time: "Confirming...",
              slots: bookingData?.slots || [],
              duration: `${bookingData?.slots?.length || 0}h`,
              totalPaid: `${(paymentResponse.data.amount / 100).toFixed(2)} SAR`,
              paymentMethod: paymentResponse.data.source?.company || "Card",
              customerName: bookingData?.customerName || "N/A",
              customerPhone: bookingData?.customerPhone || "N/A",
              customerEmail: bookingData?.customerEmail || "",
            });
            setPollingStatus("pending"); // Special status to show pending message
            setLoading(false);
            return;
          }

          // Payment is pending or failed (this code below should never be reached for paid status)
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
      } catch (err) {
        console.error("Booking confirmation error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load booking details";
        setError(errorMessage);
        toast({
          title: "Error",
          description:
            errorMessage ||
            "Failed to load booking. Please contact support with your payment ID.",
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
        <p className="text-muted-foreground text-lg mb-2">{pollingStatus}</p>
        <p className="text-sm text-muted-foreground/60">
          Please wait while we confirm your booking
        </p>
      </div>
    );
  }

  // Handle webhook pending (payment succeeded but booking not created yet)
  if (pollingStatus === "pending" && bookingDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <section className="bg-warning py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-warning-foreground/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-warning-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-warning-foreground mb-2">
              Payment Successful!
            </h1>
            <p className="text-warning-foreground/90 text-lg mb-2">
              Your booking is being processed
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Payment Confirmation */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground text-lg mb-2">
                    Payment Confirmed
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Your payment of{" "}
                    <span className="font-bold text-success">
                      {bookingDetails.totalPaid}
                    </span>{" "}
                    has been successfully processed.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your booking is currently being confirmed in our system
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You will receive a confirmation email with your booking
                    details shortly
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      If you don't receive an email within 4 hours
                    </span>
                    , please contact us with your payment details
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">
                Booking Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Court:</span>
                  <span className="font-medium text-foreground">
                    {bookingDetails.court}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium text-foreground">
                    {bookingDetails.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">
                    {bookingDetails.duration}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-success">
                    {bookingDetails.totalPaid}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-secondary/10 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions or don't receive your confirmation
                email within 4 hours, please contact us:
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <a
                    href="tel:+966540953439"
                    className="font-medium hover:text-primary"
                  >
                    +966 54 095 3439
                  </a>
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <a
                    href="mailto:info@jeddahcricketnets.com"
                    className="font-medium hover:text-primary"
                  >
                    info@jeddahcricketnets.com
                  </a>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
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
