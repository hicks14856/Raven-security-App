export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notify_by: string | null
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notify_by?: string | null
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notify_by?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          audio_recording_url: string | null
          created_at: string
          google_maps_link: string | null
          id: string
          location_lat: number
          location_lng: number
          status: string
          timestamp: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          audio_recording_url?: string | null
          created_at?: string
          google_maps_link?: string | null
          id?: string
          location_lat: number
          location_lng: number
          status?: string
          timestamp?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          audio_recording_url?: string | null
          created_at?: string
          google_maps_link?: string | null
          id?: string
          location_lat?: number
          location_lng?: number
          status?: string
          timestamp?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      emergency_recordings: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verification: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          phone_verified: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_alerts: {
        Row: {
          companions: string
          created_at: string
          id: string
          location: string
          notes: string | null
          scheduled_for: string
          status: string
          user_id: string
        }
        Insert: {
          companions: string
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          scheduled_for: string
          status?: string
          user_id: string
        }
        Update: {
          companions?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          scheduled_for?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      http_post: {
        Args: {
          url: string
          body: string
          headers: string[]
        }
        Returns: Json
      }
      send_email: {
        Args: {
          recipient_email: string
          subject: string
          body: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
