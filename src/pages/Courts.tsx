import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Lightbulb,
  Wifi,
  Car,
  ShowerHead,
  Coffee,
  ArrowRight,
} from "lucide-react";
import Loader from "@/components/layout/Loader";
import Cookies from "js-cookie";
import { COURTS_URL, PRICING_URL } from "@/constants/constants";

interface Court {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: string;
  features: string[];
}

interface PricingData {
  id: string;
  days: "sun-wed" | "thu" | "fri" | "sat";
  timeSlot: "day" | "night";
  category: "weekday-day" | "weekday-night" | "weekend-day" | "weekend-night";
  pricePerHour: number;
  isActive: boolean;
}

const Courts = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [pricing, setPricing] = useState<PricingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingLoading, setIsPricingLoading] = useState(true);

  useEffect(() => {
    fetchCourts();
    fetchPricing();
  }, []);

  // Scroll to hash section if present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  const fetchCourts = async () => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}${COURTS_URL}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const activeCourts = data.data.filter(
          (court: Court) => court.status === "active",
        );
        setCourts(activeCourts);
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPricing = async () => {
    setIsPricingLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("admin_token");

    try {
      const response = await fetch(`${API_URL}${PRICING_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPricing(data.data);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setIsPricingLoading(false);
    }
  };

  const getPrice = (
    days: "sun-wed" | "thu" | "fri" | "sat",
    timeSlot: "day" | "night",
  ) => {
    const priceData = pricing.find(
      (p) => p.days === days && p.timeSlot === timeSlot && p.isActive,
    );
    return priceData?.pricePerHour || 0;
  };

  const getTimeRange = (timeSlot: "day" | "night") => {
    return timeSlot === "day" ? "9 AM - 6 PM" : "7 PM - 4 AM";
  };

  const getCategoryLabel = (day: string, timeSlot: "day" | "night") => {
    if (day === "Sunday–Wednesday" && timeSlot === "day") return "Weekday Day";
    if (day === "Sunday–Wednesday" && timeSlot === "night")
      return "Weekday Night";
    if (day === "Thursday" && timeSlot === "day") return "Weekday Day";
    if (day === "Thursday" && timeSlot === "night") return "Weekend Night";
    if (day === "Friday" && timeSlot === "day") return "Weekend Day";
    if (day === "Friday" && timeSlot === "night") return "Weekend Night";
    if (day === "Saturday" && timeSlot === "day") return "Weekend Day";
    if (day === "Saturday" && timeSlot === "night") return "Weekday Night";
    return "";
  };

  const getPricingForDay = (day: string, timeSlot: "day" | "night"): number => {
    // Map display day to backend days structure
    let days: "sun-wed" | "thu" | "fri" | "sat";

    if (day === "Sunday–Wednesday") {
      days = "sun-wed";
    } else if (day === "Thursday") {
      days = "thu";
    } else if (day === "Friday") {
      days = "fri";
    } else {
      days = "sat";
    }

    return getPrice(days, timeSlot);
  };

  const getCategoryColor = (day: string, timeSlot: "day" | "night") => {
    const category = getCategoryLabel(day, timeSlot);
    if (category === "Weekday Day") return "bg-secondary/20 text-secondary";
    if (category === "Weekday Night") return "bg-primary/20 text-primary";
    if (category === "Weekend Day") return "bg-accent/20 text-accent";
    return "bg-warning/20 text-warning";
  };

  const pricingRows = [
    { day: "Sunday–Wednesday", timeSlot: "day" as const },
    { day: "Sunday–Wednesday", timeSlot: "night" as const },
    { day: "Thursday", timeSlot: "day" as const },
    { day: "Thursday", timeSlot: "night" as const },
    { day: "Friday", timeSlot: "day" as const },
    { day: "Friday", timeSlot: "night" as const },
    { day: "Saturday", timeSlot: "day" as const },
    { day: "Saturday", timeSlot: "night" as const },
  ];

  const amenities = [
    {
      icon: Lightbulb,
      title: "LED Night Lighting",
      description: "Professional-grade LED lighting for evening play",
    },
    {
      icon: ShowerHead,
      title: "Changing Rooms",
      description: "Clean, spacious changing facilities with lockers",
    },
    {
      icon: Car,
      title: "Free Parking",
      description: "Ample parking space for all visitors",
    },
    {
      icon: Coffee,
      title: "Refreshments",
      description: "Café with snacks and beverages on-site",
    },
    {
      icon: Wifi,
      title: "Free WiFi",
      description: "High-speed internet throughout the facility",
    },
    {
      icon: Sun,
      title: "Climate Control",
      description: "Air-conditioned indoor courts for comfort",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-background mb-4">
            Our Courts & Facilities
          </h1>
          <p className="text-background/80 text-lg max-w-2xl mx-auto">
            Professional cricket courts equipped with the latest technology and
            maintained to international standards.
          </p>
        </div>
      </section>

      {/* Courts Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="py-12">
              <Loader size="xl" text="Loading courts..." />
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No courts available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden ">
                    <img
                      src={court.imageUrl}
                      alt={court.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-success/90 text-success-foreground">
                      Available
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {court.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {court.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6 flex-1 content-start">
                      {court.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Link to="/booking">
                      <Button variant="default" className="w-full">
                        Book This Court
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Facility Amenities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a comfortable and professional cricket
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <amenity.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {amenity.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section id="pricing" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Pricing Overview
              </h2>
              <p className="text-muted-foreground">
                Transparent pricing with different rates based on time and day
              </p>
            </div>

            {isPricingLoading ? (
              <div className="py-12">
                <Loader size="lg" text="Loading pricing..." />
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-card rounded-xl border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                          Day
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                          Time
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                          Category
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">
                          Price (SAR/hr)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pricingRows.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-foreground">
                            {row.day}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {getTimeRange(row.timeSlot)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded font-medium ${getCategoryColor(
                                row.day,
                                row.timeSlot,
                              )}`}
                            >
                              {getCategoryLabel(row.day, row.timeSlot)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">
                            {getPricingForDay(row.day, row.timeSlot)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {pricingRows.map((row, index) => (
                    <div key={index} className="bg-card rounded-xl border p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {row.day}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTimeRange(row.timeSlot)}
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-foreground">
                          {getPricingForDay(row.day, row.timeSlot)} SAR
                        </span>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded font-medium ${getCategoryColor(
                          row.day,
                          row.timeSlot,
                        )}`}
                      >
                        {getCategoryLabel(row.day, row.timeSlot)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="text-center mt-8">
              <Link to="/booking">
                <Button className="text-background" variant="hero" size="lg">
                  Book Now & See Full Availability
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courts;
