export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      hospital_profiles: {
        Row: {
          address: string
          blood_bank_types: string[] | null
          created_at: string
          description: string | null
          icu_beds_available: number | null
          icu_beds_total: number | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: string
          oxygen_cylinders_available: number | null
          oxygen_cylinders_total: number | null
          pharmacy_open: boolean | null
          phone: string
          specialties: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          blood_bank_types?: string[] | null
          created_at?: string
          description?: string | null
          icu_beds_available?: number | null
          icu_beds_total?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours: string
          oxygen_cylinders_available?: number | null
          oxygen_cylinders_total?: number | null
          pharmacy_open?: boolean | null
          phone: string
          specialties?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          blood_bank_types?: string[] | null
          created_at?: string
          description?: string | null
          icu_beds_available?: number | null
          icu_beds_total?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: string
          oxygen_cylinders_available?: number | null
          oxygen_cylinders_total?: number | null
          pharmacy_open?: boolean | null
          phone?: string
          specialties?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intake_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          schedule_id: string
          status: Database["public"]["Enums"]["intake_status_enum"]
          taken_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          schedule_id: string
          status?: Database["public"]["Enums"]["intake_status_enum"]
          taken_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          schedule_id?: string
          status?: Database["public"]["Enums"]["intake_status_enum"]
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "medicine_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_schedules: {
        Row: {
          created_at: string
          dosage: string
          id: string
          instruction: Database["public"]["Enums"]["food_instruction_enum"]
          medicine_name: string
          patient_id: string
          time_slot: Database["public"]["Enums"]["time_slot_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          id?: string
          instruction: Database["public"]["Enums"]["food_instruction_enum"]
          medicine_name: string
          patient_id: string
          time_slot: Database["public"]["Enums"]["time_slot_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          id?: string
          instruction?: Database["public"]["Enums"]["food_instruction_enum"]
          medicine_name?: string
          patient_id?: string
          time_slot?: Database["public"]["Enums"]["time_slot_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string
          dosage: string
          duration_days: number
          food_instruction:
            | Database["public"]["Enums"]["food_instruction_enum"]
            | null
          frequency: string
          id: string
          medicine_name: string
          patient_id: string
          period: string | null
          quantity_remaining: number
          time: string | null
          timings: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          duration_days: number
          food_instruction?:
            | Database["public"]["Enums"]["food_instruction_enum"]
            | null
          frequency: string
          id?: string
          medicine_name: string
          patient_id: string
          period?: string | null
          quantity_remaining: number
          time?: string | null
          timings: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          duration_days?: number
          food_instruction?:
            | Database["public"]["Enums"]["food_instruction_enum"]
            | null
          frequency?: string
          id?: string
          medicine_name?: string
          patient_id?: string
          period?: string | null
          quantity_remaining?: number
          time?: string | null
          timings?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          age: number
          avatar_url: string | null
          blood_group: string | null
          clinic_address: string
          clinic_contact_number: string
          created_at: string
          doctor_name: string
          email: string
          email_notifications_enabled: boolean | null
          full_name: string
          hospital_clinic_name: string
          id: string
          last_consultation_date: string
          last_email_sent_date: string | null
          next_follow_up_date: string
          phone_number: string
          primary_health_condition: string
          push_notifications_enabled: boolean | null
          specialty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          avatar_url?: string | null
          blood_group?: string | null
          clinic_address: string
          clinic_contact_number: string
          created_at?: string
          doctor_name: string
          email: string
          email_notifications_enabled?: boolean | null
          full_name: string
          hospital_clinic_name: string
          id?: string
          last_consultation_date: string
          last_email_sent_date?: string | null
          next_follow_up_date: string
          phone_number: string
          primary_health_condition: string
          push_notifications_enabled?: boolean | null
          specialty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          avatar_url?: string | null
          blood_group?: string | null
          clinic_address?: string
          clinic_contact_number?: string
          created_at?: string
          doctor_name?: string
          email?: string
          email_notifications_enabled?: boolean | null
          full_name?: string
          hospital_clinic_name?: string
          id?: string
          last_consultation_date?: string
          last_email_sent_date?: string | null
          next_follow_up_date?: string
          phone_number?: string
          primary_health_condition?: string
          push_notifications_enabled?: boolean | null
          specialty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "hospital"
      food_instruction_enum: "before_food" | "after_food"
      intake_status_enum: "taken" | "missed"
      time_slot_enum: "morning" | "afternoon" | "evening" | "night"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "doctor", "hospital"],
      food_instruction_enum: ["before_food", "after_food"],
      intake_status_enum: ["taken", "missed"],
      time_slot_enum: ["morning", "afternoon", "evening", "night"],
    },
  },
} as const
