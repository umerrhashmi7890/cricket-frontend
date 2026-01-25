import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  CheckCircle,
  Percent,
  Loader2,
  X,
  Info,
  Loader,
} from "lucide-react";
import { format } from "date-fns";
import { promoCodeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const BookingDetails = () => {
  const location = useLocation();
  const bookingData = location.state || {
    court: 1,
    date: new Date(),
    slots: ["19:00", "20:00", "21:00"],
    total: 330,
  };

  const { toast } = useToast();
  const [paymentOption, setPaymentOption] = useState("full");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoData, setPromoData] = useState<{
    discount: number;
    finalAmount: number;
    message?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const baseTotal = bookingData.total || 330;
  const discount = paymentOption === "full" ? baseTotal * 0.02 : 0;
  const promoDiscount = promoApplied && promoData ? promoData.discount : 0;
  const finalTotal = baseTotal - discount - promoDiscount;
  const amountNow = paymentOption === "full" ? finalTotal : finalTotal * 0.5;

  // Check if phone is valid (Saudi format)
  const isPhoneValid =
    formData.phone.trim() &&
    /^(\+966|05)[0-9]{8,9}$/.test(formData.phone.replace(/\s/g, ""));

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number first
    if (!isPhoneValid) {
      toast({
        title: "Phone Required",
        description: "Please enter a valid phone number to apply promo codes",
        variant: "destructive",
      });
      return;
    }

    setPromoLoading(true);
    try {
      const response = await promoCodeApi.validate({
        code: promoCode,
        customerPhone: formData.phone,
        bookingAmount: baseTotal - discount, // Apply promo after payment discount
      });

      if (response.data?.valid) {
        setPromoApplied(true);
        setPromoData({
          discount: response.data.discount,
          finalAmount: response.data.finalAmount,
          message: response.data.message,
        });
        toast({
          title: "Success!",
          description:
            response.data.message ||
            `Promo code applied! You saved ${response.data.discount} SAR`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: response.data?.message || "This promo code is not valid",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to validate promo code",
        variant: "destructive",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoData(null);
    setPromoCode("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+966|05)[0-9]{8,9}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid Saudi phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-2">
            Booking Details
          </h1>
          <p className="text-background/80">
            Complete your information to confirm the booking
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Booking Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Court</p>
                      <p className="font-medium text-foreground">
                        {bookingData.court}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(bookingData.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">
                        7:00 PM - 10:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">3 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Your Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+966 5X XXX XXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Payment Option
                </h2>
                <RadioGroup
                  value={paymentOption}
                  onValueChange={setPaymentOption}
                  className="space-y-3"
                >
                  <label
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentOption === "full"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="full" id="full" />
                      <div>
                        <p className="font-medium text-foreground">
                          Pay 100% Online
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Get 2% discount on total amount
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-medium">
                        Save {(baseTotal * 0.02).toFixed(0)} SAR
                      </span>
                    </div>
                  </label>
                  <label
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentOption === "partial"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="partial" id="partial" />
                      <div>
                        <p className="font-medium text-foreground">
                          Pay 50% Now, 50% at Venue
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pay remaining amount when you arrive
                        </p>
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Promo Code */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Promo Code
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter promo code"
                      className="pl-10"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      disabled={promoApplied || promoLoading}
                    />
                  </div>
                  {promoApplied ? (
                    <Button
                      variant="outline"
                      onClick={handleRemovePromo}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant={promoApplied ? "success" : "outline"}
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                    >
                      {promoLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  )}
                </div>
                {promoApplied && promoData && (
                  <p className="text-sm text-success mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {promoData.message ||
                      `You saved ${promoDiscount.toFixed(0)} SAR`}
                  </p>
                )}
                {!isPhoneValid && !promoApplied && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Enter your phone number above to apply promo codes
                  </p>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border p-6 sticky top-20">
                <h3 className="font-semibold text-foreground mb-4">
                  Price Breakdown
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      7 PM - 8 PM (Night)
                    </span>
                    <span className="text-foreground">110 SAR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      8 PM - 9 PM (Night)
                    </span>
                    <span className="text-foreground">110 SAR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      9 PM - 10 PM (Night)
                    </span>
                    <span className="text-foreground">110 SAR</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{baseTotal} SAR</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Online Payment Discount (2%)</span>
                      <span>-{discount.toFixed(0)} SAR</span>
                    </div>
                  )}
                  {promoApplied && promoData && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Promo Code ({promoCode})</span>
                      <span>-{promoDiscount.toFixed(0)} SAR</span>
                    </div>
                  )}
                </div>

                <div className="border-t mt-3 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {finalTotal.toFixed(0)} SAR
                    </span>
                  </div>
                  {paymentOption === "partial" && (
                    <div className="text-sm text-muted-foreground text-right">
                      Pay now: {amountNow.toFixed(0)} SAR
                    </div>
                  )}
                </div>

                <Link
                  to="/booking/payment"
                  state={{
                    ...bookingData,
                    ...formData,
                    paymentOption,
                    finalTotal,
                    amountNow,
                  }}
                  onClick={handleContinue}
                >
                  <Button
                    variant="hero"
                    className="w-full mt-6 text-background"
                    size="lg"
                  >
                    Continue to Payment
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By continuing, you agree to our{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/refund-policy"
                    className="text-primary hover:underline"
                  >
                    Cancellation Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
