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
      memberships: {
        Row: {
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'shipper' | 'viewer'
          created_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'shipper' | 'viewer'
          created_at?: string
        }
        Update: {
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'shipper' | 'viewer'
          created_at?: string
        }
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
      membership_role: 'owner' | 'admin' | 'shipper' | 'viewer'
    }
    CompositeTypes: Record<string, never>
  }
}
