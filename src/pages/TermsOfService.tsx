const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Terms of Service
          </h1>
          <p className="text-background/80 text-lg max-w-2xl mx-auto">
            Last Updated: January 24, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-xl border p-8 space-y-8">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Jeddah Cricket Nets ("we," "our," or "us"). These
                Terms of Service ("Terms") govern your access to and use of our
                cricket court booking services, website, and facilities located
                in Jeddah, Saudi Arabia. By accessing or using our services, you
                agree to be bound by these Terms.
              </p>
            </div>

            {/* Booking and Reservations */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Booking and Reservations
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    2.1 Booking Process:
                  </strong>{" "}
                  All bookings must be made through our online platform or
                  authorized channels. You must provide accurate and complete
                  information during the booking process.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    2.2 Court Availability:
                  </strong>{" "}
                  Court availability is subject to change. We reserve the right
                  to modify or cancel bookings due to unforeseen circumstances,
                  maintenance, or operational requirements.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    2.3 Operating Hours:
                  </strong>{" "}
                  Our facilities operate from 9:00 AM to 4:00 AM (next day),
                  daily. Bookings must be made within these hours.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    2.4 Booking Confirmation:
                  </strong>{" "}
                  A booking is confirmed only upon successful payment and
                  receipt of a confirmation email or booking reference number.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. Payment Terms
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    3.1 Payment Methods:
                  </strong>{" "}
                  We accept payments via Apple Pay, Mada, Visa, and Mastercard.
                  All payments are processed securely through our payment
                  gateway.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    3.2 Payment Options:
                  </strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Full Payment (100%):
                    </strong>{" "}
                    Pay the entire amount online and receive a 2% discount on
                    the total booking amount.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Partial Payment (50%):
                    </strong>{" "}
                    Pay 50% of the booking amount online, with the remaining 50%
                    due at the venue before play begins.
                  </li>
                </ul>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    3.3 Transaction Fees:
                  </strong>{" "}
                  Payment processing fees charged by payment providers (Apple
                  Pay, Mada, Visa/Mastercard) will be borne by the customer and
                  added to the total amount.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">3.4 Pricing:</strong> All
                  prices are listed in Saudi Riyals (SAR). Pricing varies based
                  on day of the week and time of day (daytime/nighttime rates).
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">3.5 Promo Codes:</strong>{" "}
                  Promotional codes are subject to specific terms and
                  conditions, including expiry dates and usage limits. Promo
                  codes cannot be combined unless otherwise stated.
                </p>
              </div>
            </div>

            {/* Cancellation and Refunds */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Cancellation and Refund Policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Please refer to our{" "}
                  <a
                    href="/refund-policy"
                    className="text-primary hover:underline"
                  >
                    Refund and Cancellation Policy
                  </a>{" "}
                  for detailed information about cancellations and refunds.
                </p>
              </div>
            </div>

            {/* Facility Usage Rules */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Facility Usage Rules
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    5.1 Code of Conduct:
                  </strong>{" "}
                  All users must maintain respectful behavior and follow
                  facility rules. Disruptive, abusive, or dangerous behavior
                  will result in immediate removal without refund.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.2 Safety:</strong> Users
                  must follow all safety guidelines and use protective equipment
                  as required. We are not responsible for injuries sustained
                  during play.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.3 Equipment:</strong>{" "}
                  Customers are responsible for their own equipment. Equipment
                  rental, if available, is subject to additional charges and
                  terms.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.4 Cleanliness:</strong>{" "}
                  Users must keep the facilities clean and dispose of waste
                  properly. Damage to facilities may result in additional
                  charges.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.5 Punctuality:</strong>{" "}
                  Arrive on time for your booking. Late arrivals will not
                  receive time extensions, and the booking will end at the
                  scheduled time.
                </p>
              </div>
            </div>

            {/* Liability and Disclaimers */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Liability and Disclaimers
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    6.1 Assumption of Risk:
                  </strong>{" "}
                  Cricket is a physical sport that carries inherent risks. By
                  using our facilities, you acknowledge and accept these risks.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    6.2 Limitation of Liability:
                  </strong>{" "}
                  We are not liable for any injuries, accidents, loss, or damage
                  to personal property occurring on our premises, except in
                  cases of gross negligence or willful misconduct.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">6.3 Insurance:</strong> We
                  recommend that all users maintain appropriate personal
                  insurance coverage.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    6.4 Force Majeure:
                  </strong>{" "}
                  We are not responsible for failures to perform due to
                  circumstances beyond our reasonable control, including but not
                  limited to natural disasters, government actions, or technical
                  failures.
                </p>
              </div>
            </div>

            {/* User Account and Data */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. User Account and Personal Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    7.1 Account Accuracy:
                  </strong>{" "}
                  You are responsible for maintaining accurate account
                  information and protecting your account credentials.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">7.2 Privacy:</strong> Your
                  personal information is handled in accordance with our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    7.3 Communication:
                  </strong>{" "}
                  By creating a booking, you consent to receive booking
                  confirmations, updates, and promotional communications via
                  email, SMS, or phone.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Intellectual Property
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  All content on our website, including text, graphics, logos,
                  images, and software, is the property of Jeddah Cricket Nets
                  and is protected by intellectual property laws. Unauthorized
                  use is prohibited.
                </p>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                9. Modifications to Terms
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time.
                  Changes will be effective upon posting to our website.
                  Continued use of our services after changes constitutes
                  acceptance of the modified Terms.
                </p>
              </div>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                10. Governing Law and Jurisdiction
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  These Terms are governed by the laws of the Kingdom of Saudi
                  Arabia. Any disputes arising from these Terms or use of our
                  services shall be subject to the exclusive jurisdiction of the
                  courts of Jeddah, Saudi Arabia.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                11. Contact Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  For questions about these Terms, please contact us at:
                </p>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p>
                    <strong className="text-foreground">Email:</strong>{" "}
                    contact@jeddahcricketnets.com
                  </p>
                  <p>
                    <strong className="text-foreground">Phone:</strong> +966 56
                    681 9266 | +966 56 451 7456
                  </p>
                  <p>
                    <strong className="text-foreground">Address:</strong>{" "}
                    H8F3+X9Q Ash Shorooq, Jeddah, Saudi Arabia
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-sm text-foreground">
                <strong>
                  By using our services, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
