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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          pg_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pg_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pg_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          pg_id: string
          phone: string
          status: string
          student_id: string | null
          visit_date: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          pg_id: string
          phone: string
          status?: string
          student_id?: string | null
          visit_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          pg_id?: string
          phone?: string
          status?: string
          student_id?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
        ]
      }
      pgs: {
        Row: {
          address: string
          admin_note: string | null
          amenities: string[]
          area: string
          contact_phone: string | null
          created_at: string
          description: string | null
          distance_m: number
          entry_curfew: string | null
          featured: boolean
          food_included: boolean
          food_type: string | null
          gate: string | null
          gender: Database["public"]["Enums"]["gender_pref"]
          house_rules: string[]
          id: string
          landmark: string | null
          latitude: number | null
          longitude: number | null
          meal_timings: string | null
          min_rent: number
          name: string
          notice_period: string | null
          owner_id: string | null
          owner_name: string | null
          photos: string[]
          rating: number
          review_count: number
          security_deposit: number
          slug: string
          status: Database["public"]["Enums"]["pg_status"]
          tagline: string | null
          updated_at: string
          verified: boolean
          visiting_hours: string | null
          weekly_menu: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          admin_note?: string | null
          amenities?: string[]
          area: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          distance_m?: number
          entry_curfew?: string | null
          featured?: boolean
          food_included?: boolean
          food_type?: string | null
          gate?: string | null
          gender?: Database["public"]["Enums"]["gender_pref"]
          house_rules?: string[]
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          meal_timings?: string | null
          min_rent?: number
          name: string
          notice_period?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: string[]
          rating?: number
          review_count?: number
          security_deposit?: number
          slug: string
          status?: Database["public"]["Enums"]["pg_status"]
          tagline?: string | null
          updated_at?: string
          verified?: boolean
          visiting_hours?: string | null
          weekly_menu?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          admin_note?: string | null
          amenities?: string[]
          area?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          distance_m?: number
          entry_curfew?: string | null
          featured?: boolean
          food_included?: boolean
          food_type?: string | null
          gate?: string | null
          gender?: Database["public"]["Enums"]["gender_pref"]
          house_rules?: string[]
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          meal_timings?: string | null
          min_rent?: number
          name?: string
          notice_period?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: string[]
          rating?: number
          review_count?: number
          security_deposit?: number
          slug?: string
          status?: Database["public"]["Enums"]["pg_status"]
          tagline?: string | null
          updated_at?: string
          verified?: boolean
          visiting_hours?: string | null
          weekly_menu?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string
          id: string
          pg_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          pg_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          pg_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          ac: boolean
          attached_bath: boolean
          available: number
          created_at: string
          deposit: number
          id: string
          pg_id: string
          rent: number
          sharing: string
        }
        Insert: {
          ac?: boolean
          attached_bath?: boolean
          available?: number
          created_at?: string
          deposit?: number
          id?: string
          pg_id: string
          rent: number
          sharing: string
        }
        Update: {
          ac?: boolean
          attached_bath?: boolean
          available?: number
          created_at?: string
          deposit?: number
          id?: string
          pg_id?: string
          rent?: number
          sharing?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "student"
      gender_pref: "boys" | "girls" | "coed"
      pg_status: "draft" | "pending" | "active" | "inactive" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "owner", "student"],
      gender_pref: ["boys", "girls", "coed"],
      pg_status: ["draft", "pending", "active", "inactive", "rejected"],
    },
  },
} as const
