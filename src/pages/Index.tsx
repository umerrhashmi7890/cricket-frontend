import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-cricket.jpg";
import court1 from "@/assets/court-1.jpg";
import Loader from "@/components/layout/Loader";
import { COURTS_URL } from "@/constants/constants";

interface Court {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: string;
  features: string[];
}

const Index = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setIsLoadingCourts(true);
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}${COURTS_URL}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const activeCourts = data.data
          .filter((court: any) => court.status === "active")
          .slice(0, 3);
        setCourts(activeCourts);
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
    } finally {
      setIsLoadingCourts(false);
    }
  };

  const steps = [
    {
      icon: Calendar,
      title: "Choose Date & Court",
      description:
        "Browse available time slots across our 5 professional courts",
    },
    {
      icon: Clock,
      title: "Select Your Time",
      description: "Pick your preferred hours with flexible booking options",
    },
    {
      icon: MapPin,
      title: "Play & Enjoy",
      description: "Show up and enjoy your game at our premium facility",
    },
  ];

  const features = [
    "5 Professional Courts",
    "LED Night Lighting",
    "Equipment Rental",
    "Changing Rooms",
    "Free Parking",
    "Refreshments Available",
  ];

  const testimonial = {
    quote:
      "Best cricket facility in the city! The courts are always well-maintained and the booking process is seamless. Highly recommended for serious players.",
    author: "Mohammed Al-Rashid",
    role: "Captain, Riyadh Cricket Club",
    rating: 5,
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cricket Court"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6 animate-fade-in">
              #1 Cricket Facilities in Wadi Marik, Jeddah
            </span>
            <h1
              className="text-4xl md:text-6xl font-bold text-background mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Book Your <span className="text-secondary">Cricket Court</span>{" "}
              Today
            </h1>
            <p
              className="text-lg text-background/80 mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Premium indoor and outdoor cricket courts available 9 AM to 4 AM.
              Professional facilities, competitive rates, and easy online
              booking.
            </p>
            <div
              className="flex flex-wrap gap-4 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to="/booking">
                <Button variant="hero" size="xl" className="text-background">
                  Book Your Court Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/courts">
                <Button
                  variant="outline"
                  size="xl"
                  className="bg-background/10 border-background/30 text-background hover:bg-background/20"
                >
                  View Our Courts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Booking Widget */}
      <section className="bg-card py-8 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Quick Booking
              </h2>
              <p className="text-muted-foreground">
                Select your preferences and book in minutes
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-muted rounded-lg px-4 py-3">
                <label className="text-xs text-muted-foreground block mb-1">
                  Date
                </label>
                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <label className="text-xs text-muted-foreground block mb-1">
                  Time
                </label>
                <span className="font-medium">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <label className="text-xs text-muted-foreground block mb-1">
                  Court
                </label>
                <span className="font-medium">Any Available</span>
              </div>
              <Link to="/booking">
                <Button variant="default" size="lg">
                  Check Availability
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Book your court in three simple steps and get ready to play
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl hero-gradient flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <step.icon className="w-10 h-10 text-background" />
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courts */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Our Premium Courts
              </h2>
              <p className="text-muted-foreground">
                Professional facilities for an exceptional cricket experience
              </p>
            </div>
            <Link to="/courts">
              <Button variant="outline">
                View All Courts
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoadingCourts ? (
            <div className="py-12">
              <Loader size="lg" text="Loading courts..." />
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No courts available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow group flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={court.imageUrl}
                      alt={court.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-1">
                      {court.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
                      {court.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Link to="/booking" className="mt-auto">
                      <Button variant="secondary" className="w-full">
                        Book This Court
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                World-Class <span className="text-gradient">Facilities</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our cricket courts are equipped with the latest technology and
                maintained to international standards. Whether you're practicing
                solo or playing with your team, we have everything you need.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/courts">
                  <Button variant="default" size="lg">
                    Explore Facilities
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={court1}
                  alt="Facility"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-2 bg-card p-6 rounded-xl shadow-lg">
                <div className="text-4xl font-bold text-gradient">
                  {courts.length || 5}
                </div>
                <div className="text-muted-foreground">Professional Courts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-warning text-warning" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-background mb-8 leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            <div>
              <div className="font-semibold text-background text-lg">
                {testimonial.author}
              </div>
              <div className="text-background/70">{testimonial.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Ready to Play?
          </h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            Book your court now and experience the best cricket facilities in
            the city. Available 9 AM to 4 AM, seven days a week.
          </p>
          <Link to="/booking">
            <Button variant="accent" size="xl">
              Book Your Court Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
