import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Shield, Smartphone } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const bookingData = location.state || {
    finalTotal: 323,
    amountNow: 323,
    paymentOption: "full",
  };

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const paymentMethods = [
    { id: "mada", name: "mada", icon: "💳", description: "Debit Cards" },
    {
      id: "card",
      name: "Visa / Mastercard",
      icon: "💳",
      description: "Credit/Debit Cards",
    },
    {
      id: "apple",
      name: "Apple Pay",
      icon: "🍎",
      description: "Quick & Secure",
    },
  ];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
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
          {/* Amount to Pay */}
          <div className="bg-card rounded-xl border p-6 mb-6 text-center">
            <p className="text-muted-foreground mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">
              {bookingData.amountNow?.toFixed(0) || 323} SAR
            </p>
            {bookingData.paymentOption === "partial" && (
              <p className="text-sm text-muted-foreground mt-2">
                Remaining{" "}
                {(bookingData.finalTotal - bookingData.amountNow).toFixed(0)}{" "}
                SAR to be paid at venue
              </p>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">
              Payment Method
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{method.icon}</span>
                  <p className="font-medium text-foreground text-sm">
                    {method.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Card Details Form */}
          {(selectedMethod === "card" || selectedMethod === "mada") && (
            <div className="bg-card rounded-xl border p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Card Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        number: formatCardNumber(e.target.value),
                      })
                    }
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="JOHN DOE"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        name: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          expiry: formatExpiry(e.target.value),
                        })
                      }
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Apple Pay */}
          {selectedMethod === "apple" && (
            <div className="bg-card rounded-xl border p-6 mb-6 text-center">
              <Smartphone className="w-12 h-12 text-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Click the button below to pay with Apple Pay
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Pay with Apple Pay
              </Button>
            </div>
          )}

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

          {/* Pay Button */}
          <Link to="/booking/confirmation">
            <Button variant="hero" size="xl" className="w-full text-background">
              Pay {bookingData.amountNow?.toFixed(0) || 323} SAR
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Your payment is processed securely. We do not store your card
            details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
