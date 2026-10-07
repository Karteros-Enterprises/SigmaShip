export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type MembershipRole = 'owner' | 'admin' | 'shipper' | 'viewer'
type ShipmentStatus =
  | 'draft'
  | 'rated'
  | 'purchased'
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled'

export interface Database {
  public: {
    Tables: {
      memberships: {
        Row: {
          organization_id: string
          user_id: string
          role: MembershipRole
          created_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role?: MembershipRole
          created_at?: string
        }
        Update: {
          organization_id?: string
          user_id?: string
          role?: MembershipRole
          created_at?: string
        }
        Relationships: []
      }
      rate_quotes: {
        Row: {
          id: string
          organization_id: string
          shipment_id: string | null
          provider: string
          service_code: string
          service_name: string
          carrier_cost: number
          customer_price: number
          markup_amount: number
          currency: string
          transit_days: number | null
          estimated_delivery: string | null
          expires_at: string
          raw_rate: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          shipment_id?: string | null
          provider: string
          service_code: string
          service_name: string
          carrier_cost: number
          customer_price: number
          markup_amount?: number
          currency?: string
          transit_days?: number | null
          estimated_delivery?: string | null
          expires_at: string
          raw_rate?: Json | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      shipments: {
        Row: {
          id: string
          organization_id: string
          status: ShipmentStatus
          sender_address: Json
          recipient_address: Json
          currency: string
          carrier: string | null
          service: string | null
          tracking_number: string | null
          tracking_url: string | null
          label_url: string | null
          carrier_cost: number | null
          customer_charge: number | null
          markup_amount: number | null
          byoa_fee: number | null
          tax_amount: number | null
          processor_fee: number | null
          final_revenue: number | null
          gross_margin: number | null
          idempotency_key: string | null
          purchased_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          cancellation_reason: string | null
          void_reference: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          status?: ShipmentStatus
          sender_address: Json
          recipient_address: Json
          currency?: string
          carrier?: string | null
          service?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          label_url?: string | null
          carrier_cost?: number | null
          customer_charge?: number | null
          markup_amount?: number | null
          byoa_fee?: number | null
          tax_amount?: number | null
          processor_fee?: number | null
          final_revenue?: number | null
          gross_margin?: number | null
          idempotency_key?: string | null
          purchased_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['shipments']['Insert']>
        Relationships: []
      }
      shipment_packages: {
        Row: {
          id: string
          shipment_id: string
          weight: number
          weight_unit: 'lb' | 'kg'
          length: number
          width: number
          height: number
          dimension_unit: 'in' | 'cm'
        }
        Insert: {
          id?: string
          shipment_id: string
          weight: number
          weight_unit: 'lb' | 'kg'
          length: number
          width: number
          height: number
          dimension_unit: 'in' | 'cm'
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_organization: {
        Args: {
          organization_name: string
          organization_slug: string
        }
        Returns: string
      }
    }
    Enums: {
      membership_role: MembershipRole
      shipment_status: ShipmentStatus
    }
    CompositeTypes: Record<string, never>
  }
}
