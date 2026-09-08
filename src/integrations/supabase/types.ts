export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          account_type: string;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          account_type?: string;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          account_type?: string;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      regions: {
        Row: {
          created_at: string;
          id: string;
          letter: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          letter?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          letter?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      areas: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          region_id: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          region_id?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          region_id?: string | null;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["region_id"];
            referencedRelation: string;
            referencedColumns: ["id"];
          },
        ];
      };
      agents: {
        Row: {
          about: string | null;
          area_id: string | null;
          created_at: string;
          email: string | null;
          id: string;
          kind: string;
          listings_count: number;
          name: string;
          phone: string;
          profile_id: string | null;
          verified: boolean;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          about?: string | null;
          area_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          kind?: string;
          listings_count?: number;
          name: string;
          phone: string;
          profile_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          about?: string | null;
          area_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          kind?: string;
          listings_count?: number;
          name?: string;
          phone?: string;
          profile_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["area_id"];
            referencedRelation: string;
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          agent_id: string;
          badge: string | null;
          beds: number;
          baths: number;
          toilets: number;
          category: string;
          created_at: string;
          description: string | null;
          district: string;
          features: string[];
          furnished: boolean;
          id: string;
          images: string[];
          area_id: string | null;
          listing_type: string;
          moderation_notes: string | null;
          moderation_status: string;
          moderated_at: string | null;
          moderated_by: string | null;
          period: string | null;
          price: number;
          ranking_tier: string;
          ref: string;
          region: string;
          serviced: boolean;
          shared: boolean;
          size_sqm: number;
          slug: string;
          status: string;
          title: string;
          type: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          agent_id: string;
          badge?: string | null;
          beds?: number;
          baths?: number;
          toilets?: number;
          category: string;
          created_at?: string;
          description?: string | null;
          district: string;
          features?: string[];
          furnished?: boolean;
          id?: string;
          images?: string[];
          area_id?: string | null;
          listing_type: string;
          moderation_notes?: string | null;
          moderation_status?: string;
          moderated_at?: string | null;
          moderated_by?: string | null;
          period?: string | null;
          price: number;
          ranking_tier?: string;
          ref: string;
          region: string;
          serviced?: boolean;
          shared?: boolean;
          size_sqm?: number;
          slug: string;
          status?: string;
          title: string;
          type: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          agent_id?: string;
          badge?: string | null;
          beds?: number;
          baths?: number;
          toilets?: number;
          category?: string;
          created_at?: string;
          description?: string | null;
          district?: string;
          features?: string[];
          furnished?: boolean;
          id?: string;
          images?: string[];
          area_id?: string | null;
          listing_type?: string;
          moderation_notes?: string | null;
          moderation_status?: string;
          moderated_at?: string | null;
          moderated_by?: string | null;
          period?: string | null;
          price?: number;
          ranking_tier?: string;
          ref?: string;
          region?: string;
          serviced?: boolean;
          shared?: boolean;
          size_sqm?: number;
          slug?: string;
          status?: string;
          title?: string;
          type?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["agent_id"];
            referencedRelation: string;
            referencedColumns: ["id"];
          },
        ];
      };
      saved_properties: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          listing_id: string;
          message: string | null;
          name: string;
          phone: string;
          status: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          listing_id: string;
          message?: string | null;
          name: string;
          phone: string;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          listing_id?: string;
          message?: string | null;
          name?: string;
          phone?: string;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admins: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          permissions: string[];
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          permissions?: string[];
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          permissions?: string[];
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["user_id"];
            referencedRelation: string;
            referencedColumns: ["id"];
          },
        ];
      };
      admin_roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          permissions: string[];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          permissions?: string[];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          permissions?: string[];
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          action: string;
          admin_id: string | null;
          created_at: string;
          id: string;
          ip_address: string | null;
          new_values: Json | null;
          old_values: Json | null;
          resource_id: string | null;
          resource_type: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          admin_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          read: boolean;
          related_agent_id: string | null;
          related_listing_id: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean;
          related_agent_id?: string | null;
          related_listing_id?: string | null;
          title: string;
          type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean;
          related_agent_id?: string | null;
          related_listing_id?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          read: boolean;
          read_at: string | null;
          related_agent_id: string | null;
          related_listing_id: string | null;
          recipient_id: string;
          sender_id: string;
          subject: string | null;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          read_at?: string | null;
          related_agent_id?: string | null;
          related_listing_id?: string | null;
          recipient_id: string;
          sender_id: string;
          subject?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          read_at?: string | null;
          related_agent_id?: string | null;
          related_listing_id?: string | null;
          recipient_id?: string;
          sender_id?: string;
          subject?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
