const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Privacy Policy
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
                Jeddah Cricket Nets ("we," "our," or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your personal information
                when you use our website, booking system, and cricket court
                facilities. By using our services, you consent to the data
                practices described in this policy.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2.1 Personal Information You Provide
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    When you make a booking or use our services, we collect:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Full name</li>
                    <li>Phone number</li>
                    <li>Email address</li>
                    <li>
                      Booking details (date, time, court selection, duration)
                    </li>
                    <li>
                      Payment information (processed securely through our
                      payment gateway)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2.2 Automatically Collected Information
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    When you visit our website, we may automatically collect:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referral source</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2.3 Communication Data
                  </h3>
                  <p className="text-muted-foreground">
                    We collect information from your communications with us,
                    including emails, phone calls, and messages through our
                    contact forms.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Process Bookings:
                    </strong>{" "}
                    To confirm, manage, and fulfill your court reservations
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Payment Processing:
                    </strong>{" "}
                    To securely process payments through our payment gateway
                    partners
                  </li>
                  <li>
                    <strong className="text-foreground">Communication:</strong>{" "}
                    To send booking confirmations, reminders, updates, and
                    important information
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Customer Support:
                    </strong>{" "}
                    To respond to your inquiries and provide customer service
                  </li>
                  <li>
                    <strong className="text-foreground">Marketing:</strong> To
                    send promotional offers, newsletters, and updates (with your
                    consent)
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics:</strong> To
                    analyze usage patterns and improve our services
                  </li>
                  <li>
                    <strong className="text-foreground">Security:</strong> To
                    detect, prevent, and address security issues and fraudulent
                    activities
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Legal Compliance:
                    </strong>{" "}
                    To comply with applicable laws and regulations
                  </li>
                </ul>
              </div>
            </div>

            {/* Information Sharing */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. How We Share Your Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Payment Processors:
                    </strong>{" "}
                    We share payment information with secure payment gateway
                    providers (Apple Pay, Mada, Visa, Mastercard processors) to
                    complete transactions
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Service Providers:
                    </strong>{" "}
                    We may share information with third-party service providers
                    who assist us in operating our website and services
                    (hosting, analytics, email services)
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Legal Requirements:
                    </strong>{" "}
                    We may disclose information when required by law, court
                    order, or to protect our rights and safety
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Business Transfers:
                    </strong>{" "}
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred to the new owner
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Data Security
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    5.1 Security Measures:
                  </strong>{" "}
                  We implement appropriate technical and organizational security
                  measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    5.2 Payment Security:
                  </strong>{" "}
                  All payment transactions are processed through secure, PCI-DSS
                  compliant payment gateways. We do not store complete credit
                  card information on our servers.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.3 Encryption:</strong>{" "}
                  We use SSL/TLS encryption to protect data transmitted between
                  your browser and our servers.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5.4 Limitations:</strong>{" "}
                  While we strive to protect your personal information, no
                  method of transmission over the internet is 100% secure. We
                  cannot guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Data Retention
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this Privacy Policy,
                  unless a longer retention period is required by law.
                  Specifically:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    Booking and transaction records are retained for accounting
                    and tax purposes as required by Saudi Arabian law
                  </li>
                  <li>
                    Marketing communications data is retained until you withdraw
                    consent or request deletion
                  </li>
                  <li>
                    Website analytics data is typically retained for 12-24
                    months
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Your Privacy Rights
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong className="text-foreground">Access:</strong> Request
                    access to the personal information we hold about you
                  </li>
                  <li>
                    <strong className="text-foreground">Correction:</strong>{" "}
                    Request correction of inaccurate or incomplete personal
                    information
                  </li>
                  <li>
                    <strong className="text-foreground">Deletion:</strong>{" "}
                    Request deletion of your personal information, subject to
                    legal retention requirements
                  </li>
                  <li>
                    <strong className="text-foreground">Opt-Out:</strong>{" "}
                    Unsubscribe from marketing communications at any time by
                    clicking the unsubscribe link in emails or contacting us
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Data Portability:
                    </strong>{" "}
                    Request a copy of your personal information in a structured,
                    commonly used format
                  </li>
                </ul>
                <p className="leading-relaxed mt-3">
                  To exercise these rights, please contact us using the
                  information provided in Section 12.
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    8.1 What Are Cookies:
                  </strong>{" "}
                  Cookies are small text files stored on your device that help
                  us improve your experience on our website.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    8.2 Types of Cookies We Use:
                  </strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Essential Cookies:
                    </strong>{" "}
                    Required for the website to function properly
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Analytics Cookies:
                    </strong>{" "}
                    Help us understand how visitors use our website
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Functional Cookies:
                    </strong>{" "}
                    Remember your preferences and settings
                  </li>
                </ul>
                <p className="leading-relaxed">
                  <strong className="text-foreground">
                    8.3 Managing Cookies:
                  </strong>{" "}
                  You can control cookies through your browser settings.
                  However, disabling certain cookies may affect website
                  functionality.
                </p>
              </div>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                9. Third-Party Links
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Our website may contain links to third-party websites. We are
                  not responsible for the privacy practices of these external
                  sites. We encourage you to review their privacy policies
                  before providing any personal information.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                10. Children's Privacy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Our services are not directed to individuals under the age of
                  18. We do not knowingly collect personal information from
                  children. If you are a parent or guardian and believe your
                  child has provided us with personal information, please
                  contact us, and we will delete such information.
                </p>
              </div>
            </div>

            {/* Changes to Policy */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new Privacy
                  Policy on our website with an updated "Last Updated" date.
                  Continued use of our services after changes constitutes
                  acceptance of the updated policy.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                12. Contact Us
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
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

            {/* Consent */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-sm text-foreground">
                <strong>
                  By using our website and services, you acknowledge that you
                  have read and understood this Privacy Policy and consent to
                  the collection, use, and sharing of your personal information
                  as described herein.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
