export interface Court {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
  updatedAt: string;
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
  courtId: string;
  customerId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
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
