import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Lock, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
            <p className="text-muted-foreground mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">
              {bookingData.amountNow?.toFixed(2) || "323.00"} SAR
            </p>
            {bookingData.paymentOption === "partial" && (
              <p className="text-sm text-muted-foreground mt-2">
                Remaining{" "}
                {(bookingData.finalTotal - bookingData.amountNow).toFixed(2)}{" "}
                SAR to be paid at venue
              </p>
            )}
          </div>

          {/* Payment Info */}
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
            Your payment is processed securely by Moyasar. We do not store your
            card details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
