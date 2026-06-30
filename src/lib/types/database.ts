export type HealthStatus = "active" | "at_risk" | "cold";
export type ProfileRole = "admin" | "member";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Relationships: [];
      };
      pipeline_stages: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          linkedin_url: string | null;
          industry: string | null;
          country: string | null;
          city: string | null;
          employee_count: string | null;
          business_overview: string | null;
          stage_id: string | null;
          health_status: HealthStatus;
          deal_value: number | null;
          last_activity_at: string | null;
          next_action_due: string | null;
          next_action_title: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          linkedin_url?: string | null;
          industry?: string | null;
          country?: string | null;
          city?: string | null;
          employee_count?: string | null;
          business_overview?: string | null;
          stage_id?: string | null;
          health_status?: HealthStatus;
          deal_value?: number | null;
          last_activity_at?: string | null;
          next_action_due?: string | null;
          next_action_title?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          linkedin_url?: string | null;
          industry?: string | null;
          country?: string | null;
          city?: string | null;
          employee_count?: string | null;
          business_overview?: string | null;
          stage_id?: string | null;
          health_status?: HealthStatus;
          deal_value?: number | null;
          last_activity_at?: string | null;
          next_action_due?: string | null;
          next_action_title?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "pipeline_stages";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type PipelineStage = Database["public"]["Tables"]["pipeline_stages"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
