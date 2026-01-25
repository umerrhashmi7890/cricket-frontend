const RefundPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Refund & Cancellation Policy
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
                1. Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Jeddah Cricket Nets, we understand that plans can change.
                This Refund and Cancellation Policy outlines the terms and
                conditions for canceling bookings and requesting refunds. Please
                read this policy carefully before making a booking.
              </p>
            </div>

            {/* Cancellation Time Frames */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Cancellation Time Frames
              </h2>
              <div className="space-y-4">
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2.1 Cancellations Within 24 Hours of Booking Time
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    If you cancel your booking at least 24 hours before your
                    scheduled court time, the following refund terms apply:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">
                        Full Payment (100%) Bookings:
                      </strong>{" "}
                      You will receive a 50% refund of the total booking amount,
                      minus applicable refund processing fees and a 10 SAR
                      cancellation penalty.
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Partial Payment (50%) Bookings:
                      </strong>{" "}
                      No refund will be provided for the 50% deposit paid
                      online. The remaining 50% will not be charged.
                    </li>
                  </ul>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2.2 Cancellations Less Than 24 Hours Before Booking Time
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    If you cancel your booking less than 24 hours before your
                    scheduled court time:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">No refund</strong>{" "}
                      will be provided for any payment made (full or partial).
                    </li>
                    <li>
                      The full booking amount is forfeited as a cancellation
                      fee.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* No-Show Policy */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. No-Show Policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">3.1 Definition:</strong> A
                  "no-show" occurs when you fail to arrive for your booking
                  within 15 minutes of the scheduled start time without prior
                  cancellation.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">3.2 No Refund:</strong>{" "}
                  No-shows are not eligible for any refund. The full booking
                  amount (whether paid in full or partial) will be forfeited.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    3.3 Partial Payment Balance:
                  </strong>{" "}
                  For partial payment bookings, if you no-show, the remaining
                  50% balance is still due and payable upon request.
                </p>
              </div>
            </div>

            {/* Refund Processing */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Refund Processing
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    4.1 Processing Fees and Penalty:
                  </strong>{" "}
                  All refunds are subject to payment gateway processing fees
                  charged by the payment provider (Apple Pay, Mada, Visa,
                  Mastercard) plus a 10 SAR cancellation penalty. These fees
                  will be deducted from your refund amount.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    4.2 Refund Method:
                  </strong>{" "}
                  Refunds will be processed to the original payment method used
                  for the booking.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    4.3 Processing Time:
                  </strong>{" "}
                  Refunds typically take 5-10 business days to appear in your
                  account, depending on your bank or payment provider.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    4.4 Refund Confirmation:
                  </strong>{" "}
                  You will receive an email confirmation once your refund has
                  been processed.
                </p>
              </div>
            </div>

            {/* How to Cancel */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. How to Cancel Your Booking
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  To cancel your booking, please contact us through one of the
                  following methods:
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
                    <strong className="text-foreground">In Person:</strong>{" "}
                    Visit our facility at H8F3+X9Q Ash Shorooq, Jeddah
                  </p>
                </div>
                <p className="leading-relaxed mt-4">
                  Please provide your booking reference number and contact
                  information when requesting a cancellation.
                </p>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Booking Modifications
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">6.1 Rescheduling:</strong>{" "}
                  If you wish to reschedule your booking rather than cancel,
                  please contact us at least 24 hours in advance. Rescheduling
                  is subject to court availability.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    6.2 One-Time Rescheduling:
                  </strong>{" "}
                  Each booking may be rescheduled once without penalty, provided
                  the request is made at least 24 hours in advance.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    6.3 Price Adjustments:
                  </strong>{" "}
                  If your rescheduled time slot has different pricing (e.g.,
                  switching from weekday to weekend), you may be required to pay
                  the difference or receive a credit for future bookings.
                </p>
              </div>
            </div>

            {/* Weather and Force Majeure */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Weather and Force Majeure
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    7.1 Outdoor Courts:
                  </strong>{" "}
                  For outdoor court bookings, in case of severe weather
                  conditions that make play unsafe or impossible, we will offer:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Full refund of your booking amount, or</li>
                  <li>Rescheduling to an alternative time slot</li>
                </ul>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    7.2 Facility Closure:
                  </strong>{" "}
                  In the event of facility closure due to unforeseen
                  circumstances (maintenance emergencies, government orders,
                  etc.), customers will be entitled to a full refund or
                  rescheduling option.
                </p>
              </div>
            </div>

            {/* Promo Code Refunds */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Promo Code and Discount Refunds
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">8.1 Promo Codes:</strong>{" "}
                  If you used a promo code for your booking, the refund will be
                  calculated based on the discounted amount you actually paid.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    8.2 Online Payment Discount:
                  </strong>{" "}
                  The 2% online payment discount is applied to the final amount
                  and will be reflected in any eligible refund calculations.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    8.3 Expired Promo Codes:
                  </strong>{" "}
                  Promo codes cannot be reapplied to rescheduled bookings if the
                  original promo code has expired.
                </p>
              </div>
            </div>

            {/* Exceptions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                9. Exceptions and Special Circumstances
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We understand that emergencies happen. In exceptional
                  circumstances (medical emergencies, family emergencies, etc.),
                  we may consider refund requests on a case-by-case basis.
                  Please contact us with documentation to support your request.
                </p>
              </div>
            </div>

            {/* Policy Changes */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                10. Policy Modifications
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Jeddah Cricket Nets reserves the right to modify this Refund
                  and Cancellation Policy at any time. Changes will be effective
                  immediately upon posting to our website. Your cancellation and
                  refund will be governed by the policy in effect at the time of
                  your booking.
                </p>
              </div>
            </div>

            {/* Summary Table */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                11. Quick Reference Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border p-3 text-left text-sm font-semibold text-foreground">
                        Cancellation Time
                      </th>
                      <th className="border border-border p-3 text-left text-sm font-semibold text-foreground">
                        Full Payment (100%)
                      </th>
                      <th className="border border-border p-3 text-left text-sm font-semibold text-foreground">
                        Partial Payment (50%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-muted-foreground">
                    <tr>
                      <td className="border border-border p-3">
                        24+ hours before
                      </td>
                      <td className="border border-border p-3 text-success">
                        50% refund minus processing fees and 10 SAR penalty
                      </td>
                      <td className="border border-border p-3 text-destructive">
                        No refund on deposit
                      </td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border border-border p-3">
                        Less than 24 hours
                      </td>
                      <td className="border border-border p-3 text-destructive">
                        No refund
                      </td>
                      <td className="border border-border p-3 text-destructive">
                        No refund
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">No-show</td>
                      <td className="border border-border p-3 text-destructive">
                        No refund
                      </td>
                      <td className="border border-border p-3 text-destructive">
                        No refund + balance due
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Questions About Cancellations or Refunds?
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions about our Refund and Cancellation
                Policy, please don't hesitate to contact us:
              </p>
              <div className="space-y-1 text-sm text-foreground">
                <p>📧 contact@jeddahcricketnets.com</p>
                <p>📞 +966 56 681 9266 | +966 56 451 7456</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;
