import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Lock, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi, bookingApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Payment = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const bookingData = location.state || {
    finalTotal: 323,
    amountNow: 323,
    paymentOption: "full",
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Validate required booking data
      if (
        !bookingData.courtId ||
        !bookingData.date ||
        !bookingData.slots ||
        !bookingData.slots.length
      ) {
        throw new Error("Booking information is incomplete");
      }

      if (!bookingData.customerName || !bookingData.customerPhone) {
        throw new Error("Customer information is required");
      }

      // RE-VALIDATE AVAILABILITY - Critical race condition prevention
      // This catches if admin or another client booked the same slots
      const formattedDate = format(new Date(bookingData.date), "yyyy-MM-dd");
      const timeSlots = bookingData.slots.map((slot: string) => {
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
        courtIds: [bookingData.courtId],
      });

      // Check if any of the selected slots are now unavailable
      const courtData = availabilityCheck.data?.[bookingData.courtId];
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
            description: `The following time slots are no longer available: ${unavailableSlots.join(", ")}. Someone else may have booked them. Please go back and select different slots.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Handle free booking (100% discount) or amount too small for gateway
      if (
        bookingData.amountNow <= 0 ||
        bookingData.finalTotal <= 0 ||
        bookingData.amountNow < 1
      ) {
        // Sort slots and calculate start/end time
        const sortedSlots = [...bookingData.slots].sort((a, b) => {
          const [aHour] = a.split(":").map(Number);
          const [bHour] = b.split(":").map(Number);
          const getOrder = (h: number) => (h >= 0 && h <= 3 ? h + 24 : h);
          return getOrder(aHour) - getOrder(bHour);
        });

        const startTime = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        const [lastHour, lastMin] = lastSlot.split(":").map(Number);
        const endHour = (lastHour + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:${lastMin.toString().padStart(2, "0")}`;

        // Create booking directly without payment
        try {
          const bookingResponse = await adminApi.bookings.create({
            courtId: bookingData.courtId,
            bookingDate: bookingData.date,
            startTime,
            endTime,
            customerPhone: bookingData.customerPhone,
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail || undefined,
            promoCode: bookingData.promoCode || undefined,
            paymentStatus: "paid", // Mark as paid since amount is 0
            amountPaid: 0,
          });

          if (bookingResponse.success) {
            // Redirect to confirmation with booking ID
            window.location.href = `/booking/confirmation?bookingId=${bookingResponse.data._id}`;
          } else {
            throw new Error("Failed to create booking");
          }
          return;
        } catch (bookingError: unknown) {
          const err = bookingError as Error & {
            response?: { data?: { message?: string } };
          };
          // Handle specific error for slot unavailability
          if (
            err.message?.includes("not available") ||
            err.message?.includes("conflict") ||
            err.response?.data?.message?.includes("not available")
          ) {
            toast({
              title: "Slots No Longer Available",
              description:
                "These time slots were just booked by someone else. Please go back and select different time slots.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Booking Failed",
              description:
                err.message || "Failed to create booking. Please try again.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }
      }

      // Create payment request and get Moyasar checkout URL
      const response = await adminApi.payment.createRequest({
        amount: bookingData.amountNow,
        currency: "SAR",
        description: `Court Booking - ${bookingData.court || "Cricket Court"}`,
        metadata: {
          // Store complete booking data in metadata for confirmation page
          courtId: bookingData.courtId,
          court: bookingData.court,
          date: bookingData.date,
          slots: JSON.stringify(bookingData.slots),
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          customerEmail: bookingData.customerEmail || "",
          paymentOption: bookingData.paymentOption,
          finalTotal: bookingData.finalTotal,
          amountNow: bookingData.amountNow,
          promoCode: bookingData.promoCode || "",
        },
      });

      if (response.success && response.data?.url) {
        // Store booking data in sessionStorage as backup
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));

        // Redirect to Moyasar's hosted payment page
        window.location.href = response.data.url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description:
          err.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-2">
            Secure Payment
          </h1>
          <p className="text-background/80">
            Complete your booking with a secure payment
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link to="/booking/details" state={bookingData}>
            <Button variant="ghost" className="mb-6" disabled={isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </Link>

          {/* Amount to Pay */}
          <div className="bg-card rounded-xl border p-6 mb-6 text-center">
            <p className="text-muted-foreground mb-2">
              {bookingData.amountNow < 1 ? "Total Amount" : "Amount to Pay"}
            </p>
            <p className="text-4xl font-bold text-primary">
              {bookingData.amountNow < 1
                ? "0"
                : bookingData.amountNow?.toFixed(2) || "323.00"}{" "}
              SAR
            </p>
            {bookingData.paymentOption === "partial" &&
              bookingData.amountNow > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Remaining{" "}
                  {(bookingData.finalTotal - bookingData.amountNow).toFixed(2)}{" "}
                  SAR to be paid at venue
                </p>
              )}
            {bookingData.amountNow < 1 && (
              <p className="text-sm text-success mt-2">
                🎉 100% Discount Applied - No Payment Required
              </p>
            )}
          </div>

          {/* Payment Info - Only show if amount >= 1 SAR */}
          {bookingData.amountNow >= 1 ? (
            <>
              <div className="bg-card rounded-xl border p-6 mb-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Payment Method
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  You will be redirected to Moyasar's secure payment page to
                  complete your payment. Accepted payment methods:
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg border text-center">
                    <span className="text-2xl mb-2 block">💳</span>
                    <p className="text-xs font-medium">mada</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <span className="text-2xl mb-2 block">💳</span>
                    <p className="text-xs font-medium">Visa</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <span className="text-2xl mb-2 block">💳</span>
                    <p className="text-xs font-medium">Mastercard</p>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  variant="hero"
                  size="lg"
                  className="w-full text-background"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>Continue to Payment</>
                  )}
                </Button>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">PCI Compliant</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your payment is processed securely by Moyasar. We do not store
                your card details.
              </p>
            </>
          ) : (
            <>
              {/* Free Booking - No Payment Required */}
              <div className="bg-card rounded-xl border p-6 mb-6">
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  variant="hero"
                  size="lg"
                  className="w-full text-background"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming Booking...
                    </>
                  ) : (
                    <>Confirm Booking</>
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Your booking will be confirmed instantly. A confirmation email
                will be sent to you.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
