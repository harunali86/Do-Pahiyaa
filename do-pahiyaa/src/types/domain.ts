export type UserRole = "user" | "dealer" | "admin" | "super_admin";

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
  | "contacted"
  | "converted"
  | "closed"
  | "cancelled";

export type PaymentType =
  | "lead_unlock"
  | "subscription"
  | "auction_fee";

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

