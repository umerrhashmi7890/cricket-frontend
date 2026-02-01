export interface Court {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  features?: string[];
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pricing {
  _id: string;
  days: "sun-wed" | "thu" | "fri" | "sat";
  timeSlot: "day" | "night";
  category: "weekday-day" | "weekday-night" | "weekend-day" | "weekend-night";
  pricePerHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  price: number;
  category: "day" | "night";
  isWeekend: boolean;
  nextDay?: boolean;
}

export interface BookingData {
  court: string;
  date: Date;
  slots: string[];
  total: number;
}

export interface Booking {
  id: string;
  _id?: string;
  court: string | Court; // Can be ObjectId string or populated Court object
  customer?: string | Customer; // Can be ObjectId string or populated Customer object
  bookingDate: string | Date;
  startTime: string;
  endTime: string;
  durationHours: number;

  // Pricing
  totalPrice: number;
  pricingBreakdown?: Array<{
    hour: string;
    rate: number;
    days: string;
    category: string;
    timeSlot: string;
  }>;
  promoCode?: string;
  discountAmount: number;
  finalPrice: number;

  // Payment
  paymentStatus: "pending" | "partial" | "paid" | "refunded";
  amountPaid: number;
  paymentMethod?: string;
  paymentReference?: string;
  paymentId?: string; // Moyasar payment ID

  // Status
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no-show"
    | "blocked";

  // Metadata
  notes?: string;
  createdBy: "customer" | "admin";
  createdAt: string | Date;
  updatedAt: string | Date;
}

// For backward compatibility and convenience
interface CourtRef {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
}

export interface BookingCreateData {
  courtId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  paymentType: "full" | "advance";
  promoCode?: string;
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxTotalUses?: number;
  usedByCustomers: string[];
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeCreateData {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxTotalUses?: number;
}
