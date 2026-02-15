export type UserRole = "buyer" | "seller" | "dealer" | "admin" | "super_admin";

export type UserStatus = "pending" | "active" | "blocked";

export type ListingStatus = "draft" | "published" | "sold" | "archived";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export type DealState =
  | "lead_created"
  | "lead_unlocked"
  | "token_paid"
  | "inspection"
  | "negotiated"
  | "agreed"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded";

export type PaymentType =
  | "lead_unlock"
  | "booking_token"
  | "subscription"
  | "auction_fee"
  | "commission";

export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export type AuctionStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "ended"
  | "settlement_pending"
  | "settled"
  | "cancelled";

