const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import Cookies from "js-cookie";
import {
  Court,
  Pricing,
  Booking,
  BookingCreateData,
  PromoCode,
  PromoCodeCreateData,
} from "@/types/booking.types";

// Calendar-specific booking interface
interface CalendarBooking {
  id: string;
  bookingId: string;
  courtId: string;
  courtName: string;
  bookingDate: string;
  startHour: number;
  duration: number;
  customer: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "blocked";
  amount: string;
}

// Dashboard types
interface DashboardStats {
  bookings: { value: number; change: number; trend: "up" | "down" };
  revenue: {
    value: number;
    currency: string;
    change: number;
    trend: "up" | "down";
  };
  utilization: { value: number; change: number; trend: "up" | "down" };
  customers: { value: number; change: number; trend: "up" | "down" };
}

interface DashboardBooking {
  id: string;
  bookingId: string;
  customer: string;
  court: string;
  time: string;
  status: string;
  amount: string;
  paymentStatus?: string;
}

interface CourtUtilization {
  court: string;
  utilization: number;
  bookedHours: number;
  bookingsCount: number;
}

interface RevenueSummary {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalPaid: number;
    totalPending: number;
    averageBookingValue: number;
  };
  daily: Array<{
    _id: string;
    totalRevenue: number;
    bookingsCount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
}

interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id: string | null;
  ip: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string | null;
    message: string | null;
    transaction_url: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Generic API call function for admin routes (with authentication)
async function adminApiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const token = Cookies.get("admin_token");

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    console.log("Admin API Call Response:", response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Court APIs
export const courtApi = {
  getAll: () => apiCall<Court[]>("/courts"),
  getById: (id: string) => apiCall<Court>(`/courts/${id}`),
};

// Pricing APIs
export const pricingApi = {
  getAll: () => apiCall<Pricing[]>("/pricing"),
  getCurrent: () => apiCall<Pricing>("/pricing/current"),
};

// Booking APIs
export const bookingApi = {
  checkAvailability: (params: {
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }) =>
    apiCall<{ available: boolean; conflictingBookings?: Booking[] }>(
      "/bookings/check-availability",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    ),

  checkBatchAvailability: (params: {
    bookingDate: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
    courtIds?: string[];
  }) =>
    apiCall<{
      [courtId: string]: {
        [timeSlotKey: string]: {
          available: boolean;
          startTime: string;
          endTime: string;
        };
      };
    }>("/bookings/check-batch-availability", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  create: (data: {
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    customerPhone: string;
    customerName: string;
    customerEmail?: string;
    notes?: string;
    promoCode?: string;
    paymentId?: string;
    paymentStatus?: string;
    amountPaid?: number;
  }) =>
    apiCall<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getByPaymentId: (paymentId: string) =>
    apiCall<Booking>(`/bookings/by-payment/${paymentId}`),

  getById: (id: string) => apiCall<Booking>(`/bookings/${id}`),
};

// Promo Code APIs
export const promoCodeApi = {
  validate: (data: {
    code: string;
    customerPhone: string;
    bookingAmount: number;
  }) =>
    apiCall<{
      valid: boolean;
      discount: number;
      finalAmount: number;
      message?: string;
    }>("/promo-codes/validate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Admin APIs (authenticated)
export const adminApi = {
  // Courts
  courts: {
    getAll: () => adminApiCall<Court[]>("/courts"),
    getById: (id: string) => adminApiCall<Court>(`/courts/${id}`),
    create: (data: FormData) =>
      adminApiCall<Court>("/courts", {
        method: "POST",
        body: data,
        headers: {}, // FormData sets its own Content-Type
      }),
    update: (id: string, data: FormData) =>
      adminApiCall<Court>(`/courts/${id}`, {
        method: "PUT",
        body: data,
        headers: {}, // FormData sets its own Content-Type
      }),
    delete: (id: string) =>
      adminApiCall<{ message: string }>(`/courts/${id}`, {
        method: "DELETE",
      }),
  },

  // Bookings
  bookings: {
    // Public methods
    create: (data: {
      courtId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      customerPhone: string;
      customerName: string;
      customerEmail?: string;
      notes?: string;
      promoCode?: string;
      paymentId?: string;
      paymentStatus?: string;
      amountPaid?: number;
    }) =>
      apiCall<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Admin methods
    getAll: () => adminApiCall<Booking[]>("/bookings"),
    getById: (id: string) => adminApiCall<Booking>(`/bookings/${id}`),
    getCalendar: (params: { startDate: string; endDate: string }) =>
      adminApiCall<CalendarBooking[]>(
        `/bookings/calendar?startDate=${params.startDate}&endDate=${params.endDate}`,
      ),
    cancel: (id: string) =>
      adminApiCall<Booking>(`/bookings/${id}/cancel`, {
        method: "PATCH",
      }),

    updateStatus: (id: string, status: string) =>
      adminApiCall<Booking>(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    updatePayment: (id: string, paymentStatus: string) =>
      adminApiCall<Booking>(`/bookings/${id}/payment`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
      }),

    delete: (id: string) =>
      adminApiCall<{ message: string }>(`/bookings/${id}`, {
        method: "DELETE",
      }),

    createManual: (data: {
      courtId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      customerPhone?: string;
      customerName?: string;
      customerEmail?: string;
      notes?: string;
      isBlocked?: boolean;
    }) =>
      adminApiCall<Booking>("/bookings/manual", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Pricing
  pricing: {
    getAll: () => adminApiCall<Pricing[]>("/pricing"),
    getCurrent: () => adminApiCall<Pricing>("/pricing/current"),
    create: (
      data: Omit<Pricing, "_id" | "createdAt" | "updatedAt" | "isActive">,
    ) =>
      adminApiCall<Pricing>("/pricing", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Pricing>) =>
      adminApiCall<Pricing>(`/pricing/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      adminApiCall<{ message: string }>(`/pricing/${id}`, {
        method: "DELETE",
      }),
  },

  // Promo Codes
  promoCodes: {
    getAll: () => adminApiCall<PromoCode[]>("/promo-codes"),
    create: (data: PromoCodeCreateData) =>
      adminApiCall<PromoCode>("/promo-codes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PromoCodeCreateData>) =>
      adminApiCall<PromoCode>(`/promo-codes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      adminApiCall<{ message: string }>(`/promo-codes/${id}`, {
        method: "DELETE",
      }),
    toggleStatus: (id: string) =>
      adminApiCall<PromoCode>(`/promo-codes/${id}/toggle`, {
        method: "PATCH",
      }),
    validate: (data: { code: string; bookingAmount: number }) =>
      adminApiCall<{
        valid: boolean;
        message?: string;
        discount?: number;
        finalAmount?: number;
      }>("/promo-codes/validate-admin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Dashboard
  dashboard: {
    getStats: (date?: string) =>
      adminApiCall<DashboardStats>(
        `/dashboard/stats${date ? `?date=${date}` : ""}`,
      ),
    getBookings: (date?: string) =>
      adminApiCall<DashboardBooking[]>(
        `/dashboard/bookings${date ? `?date=${date}` : ""}`,
      ),
    getCourtUtilization: (date?: string) =>
      adminApiCall<CourtUtilization[]>(
        `/dashboard/court-utilization${date ? `?date=${date}` : ""}`,
      ),
    getRevenueSummary: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      return adminApiCall<RevenueSummary>(
        `/dashboard/revenue-summary${params.toString() ? `?${params.toString()}` : ""}`,
      );
    },
  },

  // Payment
  payment: {
    createRequest: (data: {
      amount: number;
      currency?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }) =>
      apiCall<{ id: string; url: string; status: string }>(
        "/payments/create-request",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    create: (data: {
      amount: number;
      currency?: string;
      description?: string;
      source: {
        type: string;
        name?: string;
        number?: string;
        cvc?: string;
        month?: string;
        year?: string;
        token?: string;
      };
      metadata?: Record<string, unknown>;
    }) =>
      apiCall<PaymentResponse>("/payments/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStatus: (paymentId: string) =>
      apiCall<PaymentResponse>(`/payments/${paymentId}`),
  },
};
