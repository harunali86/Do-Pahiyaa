export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'dealer' | 'user'
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    is_verified: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'dealer' | 'user'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    is_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'dealer' | 'user'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    is_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            dealers: {
                Row: {
                    profile_id: string
                    business_name: string
                    gst_number: string | null
                    showroom_address: string | null
                    subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled'
                    credits_balance: number
                    verified_at: string | null
                }
                Insert: {
                    profile_id: string
                    business_name: string
                    gst_number?: string | null
                    showroom_address?: string | null
                    subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled'
                    credits_balance?: number
                    verified_at?: string | null
                }
                Update: {
                    profile_id?: string
                    business_name?: string
                    gst_number?: string | null
                    showroom_address?: string | null
                    subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled'
                    credits_balance?: number
                    verified_at?: string | null
                }
            }
            listings: {
                Row: {
                    id: string
                    seller_id: string
                    title: string
                    make: string
                    model: string
                    year: number
                    price: number
                    kms_driven: number
                    city: string
                    description: string | null
                    specs: Json
                    images: string[]
                    status: 'draft' | 'published' | 'sold' | 'archived' | 'rejected'
                    is_company_listing: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    seller_id: string
                    title: string
                    make: string
                    model: string
                    year: number
                    price: number
                    kms_driven: number
                    city: string
                    description?: string | null
                    specs?: Json
                    images?: string[]
                    status?: 'draft' | 'published' | 'sold' | 'archived' | 'rejected'
                    is_company_listing?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    seller_id?: string
                    title?: string
                    make?: string
                    model?: string
                    year?: number
                    price?: number
                    kms_driven?: number
                    city?: string
                    description?: string | null
                    specs?: Json
                    images?: string[]
                    status?: 'draft' | 'published' | 'sold' | 'archived' | 'rejected'
                    is_company_listing?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    listing_id: string
                    buyer_id: string
                    message: string | null
                    status: 'new' | 'unlocked' | 'contacted' | 'converted' | 'closed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    listing_id: string
                    buyer_id: string
                    message?: string | null
                    status?: 'new' | 'unlocked' | 'contacted' | 'converted' | 'closed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    listing_id?: string
                    buyer_id?: string
                    message?: string | null
                    status?: 'new' | 'unlocked' | 'contacted' | 'converted' | 'closed'
                    created_at?: string
                }
            }
            unlock_events: {
                Row: {
                    id: string
                    lead_id: string
                    dealer_id: string
                    amount_paid: number
                    unlocked_at: string
                }
                Insert: {
                    id?: string
                    lead_id: string
                    dealer_id: string
                    amount_paid: number
                    unlocked_at?: string
                }
                Update: {
                    id?: string
                    lead_id?: string
                    dealer_id?: string
                    amount_paid?: number
                    unlocked_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    dealer_id: string
                    razorpay_sub_id: string
                    plan_id: string
                    start_date: string
                    end_date: string
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    dealer_id: string
                    razorpay_sub_id: string
                    plan_id: string
                    start_date: string
                    end_date: string
                    status: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    dealer_id?: string
                    razorpay_sub_id?: string
                    plan_id?: string
                    start_date?: string
                    end_date?: string
                    status?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'dealer' | 'user'
            listing_status: 'draft' | 'published' | 'sold' | 'archived' | 'rejected'
            lead_status: 'new' | 'unlocked' | 'contacted' | 'converted' | 'closed'
        }
    }
}
