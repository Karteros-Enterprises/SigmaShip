export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type MembershipRole = 'owner' | 'admin' | 'shipper' | 'accounting' | 'viewer'
type CarrierAccountOwner = CarrierAccountOwner
type IntegrationStatus = IntegrationStatus
type PlatformRole = 'owner' | 'admin' | 'operations' | 'accounting' | 'sales' | 'support'
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
      organizations: {
        Row: { id: string; name: string; slug: string; created_at: string; markup_percent: number; markup_fixed: number; accessorial_markup_percent: number; accessorial_markup_fixed: number }
        Insert: { id?: string; name: string; slug: string; created_at?: string; markup_percent?: number; markup_fixed?: number; accessorial_markup_percent?: number; accessorial_markup_fixed?: number }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
        Relationships: []
      }
      platform_users: {
        Row: { user_id: string; role: PlatformRole; active: boolean; created_at: string }
        Insert: { user_id: string; role: PlatformRole; active?: boolean; created_at?: string }
        Update: { role?: PlatformRole; active?: boolean }
        Relationships: []
      }
      carrier_accounts: {
        Row: { id: string; organization_id: string | null; provider: string; ownership: CarrierAccountOwner; display_name: string; external_account_id: string | null; status: IntegrationStatus; enabled: boolean; validated_at: string | null; last_error: string | null }
        Insert: { id?: string; organization_id?: string | null; provider: string; ownership: CarrierAccountOwner; display_name: string; external_account_id?: string | null; status?: IntegrationStatus; enabled?: boolean; validated_at?: string | null; last_error?: string | null }
        Update: Partial<Database['public']['Tables']['carrier_accounts']['Insert']>
        Relationships: []
      }
      audit_events: {
        Row: { id: number; organization_id: string; actor_user_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string }
        Insert: { organization_id: string; actor_user_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json; created_at?: string }
        Update: Record<string, never>
        Relationships: []
      }
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
      onboarding_states: {
        Row: {
          user_id: string
          organization_id: string | null
          completed: boolean
          current_step: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          organization_id?: string | null
          completed?: boolean
          current_step?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          organization_id?: string | null
          completed?: boolean
          current_step?: string
          completed_at?: string | null
          updated_at?: string
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
        Update: {
          shipment_id?: string | null
        }
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
      integration_status: IntegrationStatus
      carrier_account_owner: CarrierAccountOwner
      platform_role: 'owner' | 'admin' | 'operations' | 'accounting' | 'sales' | 'support'
      membership_role: MembershipRole
      shipment_status: ShipmentStatus
    }
    CompositeTypes: Record<string, never>
  }
}
