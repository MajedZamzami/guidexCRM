export type HealthStatus = "active" | "at_risk" | "cold";
export type ProfileRole = "admin" | "member";
export type CommitteeRole = "decision_maker" | "budget_holder" | "champion" | "blocker" | "other";
export type InteractionType = "call" | "email" | "meeting" | "whatsapp" | "note" | "other";

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
          opportunity_score: number | null;
          contact_method: string | null;
          last_activity_at: string | null;
          next_action_due: string | null;
          next_action_title: string | null;
          door_opener_id: string | null;
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
          opportunity_score?: number | null;
          contact_method?: string | null;
          last_activity_at?: string | null;
          next_action_due?: string | null;
          next_action_title?: string | null;
          door_opener_id?: string | null;
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
          opportunity_score?: number | null;
          contact_method?: string | null;
          last_activity_at?: string | null;
          next_action_due?: string | null;
          next_action_title?: string | null;
          door_opener_id?: string | null;
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
          {
            foreignKeyName: "companies_door_opener_id_fkey";
            columns: ["door_opener_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          title: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          is_primary: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          is_primary?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          is_primary?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      buying_committee_roles: {
        Row: {
          id: string;
          company_id: string;
          contact_id: string;
          role: CommitteeRole;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          contact_id: string;
          role: CommitteeRole;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          contact_id?: string;
          role?: CommitteeRole;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buying_committee_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buying_committee_roles_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      interactions: {
        Row: {
          id: string;
          company_id: string;
          contact_id: string | null;
          type: InteractionType;
          notes: string | null;
          occurred_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          contact_id?: string | null;
          type: InteractionType;
          notes?: string | null;
          occurred_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          contact_id?: string | null;
          type?: InteractionType;
          notes?: string | null;
          occurred_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      company_team_members: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          member_name: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id?: string | null;
          member_name?: string | null;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string | null;
          member_name?: string | null;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_team_members_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_ups: {
        Row: {
          id: string;
          company_id: string;
          due_date: string;
          note: string | null;
          is_done: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          due_date: string;
          note?: string | null;
          is_done?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          due_date?: string;
          note?: string | null;
          is_done?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_ups_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          storage_path: string;
          size: number | null;
          content_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          storage_path: string;
          size?: number | null;
          content_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          storage_path?: string;
          size?: number | null;
          content_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
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
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type BuyingCommitteeRole = Database["public"]["Tables"]["buying_committee_roles"]["Row"];
export type Interaction = Database["public"]["Tables"]["interactions"]["Row"];
export type CompanyTeamMember = Database["public"]["Tables"]["company_team_members"]["Row"];
export type FollowUp = Database["public"]["Tables"]["follow_ups"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CompanyFile = Database["public"]["Tables"]["files"]["Row"];
