import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, MapPin, QrCode, MessageSquare, ArrowRight } from "lucide-react";

const Confirmation = () => {
  const bookingDetails = {
    bookingId: "BK-2024-001847",
    court: "Court 3",
    date: "Saturday, January 18, 2024",
    time: "7:00 PM - 10:00 PM",
    duration: "3 hours",
    totalPaid: "323 SAR",
    paymentMethod: "Visa •••• 4567",
  };

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
              <h2 className="font-semibold text-primary-foreground">Booking Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium text-foreground">{bookingDetails.court}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{bookingDetails.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{bookingDetails.time} ({bookingDetails.duration})</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-xl font-bold text-success">{bookingDetails.totalPaid}</span>
                </div>
                <p className="text-sm text-muted-foreground text-right">{bookingDetails.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-card rounded-xl border p-6 mb-6 text-center">
            <h3 className="font-semibold text-foreground mb-4">Check-in QR Code</h3>
            <div className="w-48 h-48 bg-muted rounded-xl mx-auto flex items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Show this QR code at the reception for quick check-in
            </p>
          </div>

          {/* SMS Notification */}
          <div className="bg-secondary/10 rounded-xl p-4 mb-6 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">SMS Confirmation Sent</p>
              <p className="text-sm text-muted-foreground">
                A confirmation message has been sent to your registered phone number with all booking details.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/booking" className="flex-1">
              <Button variant="hero" size="lg" className="w-full">
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
