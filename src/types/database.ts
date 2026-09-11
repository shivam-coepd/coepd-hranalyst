export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_generation_runs: {
        Row: {
          completed_at: string | null;
          entity_id: string;
          entity_type: string;
          error_message: string | null;
          id: string;
          input_snapshot: Json | null;
          input_tokens: number | null;
          model: string | null;
          operation: string;
          output_snapshot: Json | null;
          output_tokens: number | null;
          prompt_version: string | null;
          provider: string;
          requested_by: string | null;
          response_id: string | null;
          started_at: string;
          status: string;
          total_tokens: number | null;
        };
        Insert: {
          completed_at?: string | null;
          entity_id: string;
          entity_type: string;
          error_message?: string | null;
          id?: string;
          input_snapshot?: Json | null;
          input_tokens?: number | null;
          model?: string | null;
          operation: string;
          output_snapshot?: Json | null;
          output_tokens?: number | null;
          prompt_version?: string | null;
          provider?: string;
          requested_by?: string | null;
          response_id?: string | null;
          started_at?: string;
          status: string;
          total_tokens?: number | null;
        };
        Update: {
          completed_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          error_message?: string | null;
          id?: string;
          input_snapshot?: Json | null;
          input_tokens?: number | null;
          model?: string | null;
          operation?: string;
          output_snapshot?: Json | null;
          output_tokens?: number | null;
          prompt_version?: string | null;
          provider?: string;
          requested_by?: string | null;
          response_id?: string | null;
          started_at?: string;
          status?: string;
          total_tokens?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generation_runs_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_cv_history: {
        Row: {
          application_id: string;
          changed_at: string;
          changed_by: string;
          id: string;
          new_cv_id: string;
          old_cv_id: string | null;
          reason: string | null;
        };
        Insert: {
          application_id: string;
          changed_at?: string;
          changed_by: string;
          id?: string;
          new_cv_id: string;
          old_cv_id?: string | null;
          reason?: string | null;
        };
        Update: {
          application_id?: string;
          changed_at?: string;
          changed_by?: string;
          id?: string;
          new_cv_id?: string;
          old_cv_id?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_cv_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_cv_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_cv_history_new_cv_id_fkey";
            columns: ["new_cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_cv_history_old_cv_id_fkey";
            columns: ["old_cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
        ];
      };
      application_processing_jobs: {
        Row: {
          application_id: string;
          attempts: number;
          completed_at: string | null;
          created_at: string;
          id: string;
          last_error: string | null;
          max_attempts: number;
          operation: string;
          scheduled_at: string;
          started_at: string | null;
          status: string;
        };
        Insert: {
          application_id: string;
          attempts?: number;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          max_attempts?: number;
          operation: string;
          scheduled_at?: string;
          started_at?: string | null;
          status?: string;
        };
        Update: {
          application_id?: string;
          attempts?: number;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          max_attempts?: number;
          operation?: string;
          scheduled_at?: string;
          started_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_processing_jobs_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_requirement_matches: {
        Row: {
          application_score_id: string;
          confidence: number | null;
          created_at: string;
          evidence: string | null;
          id: string;
          match_method: string | null;
          matched: boolean;
          matched_cv_term: string | null;
          normalized_requirement: string | null;
          requirement_name: string;
          requirement_type: string;
        };
        Insert: {
          application_score_id: string;
          confidence?: number | null;
          created_at?: string;
          evidence?: string | null;
          id?: string;
          match_method?: string | null;
          matched: boolean;
          matched_cv_term?: string | null;
          normalized_requirement?: string | null;
          requirement_name: string;
          requirement_type: string;
        };
        Update: {
          application_score_id?: string;
          confidence?: number | null;
          created_at?: string;
          evidence?: string | null;
          id?: string;
          match_method?: string | null;
          matched?: boolean;
          matched_cv_term?: string | null;
          normalized_requirement?: string | null;
          requirement_name?: string;
          requirement_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_requirement_matches_application_score_id_fkey";
            columns: ["application_score_id"];
            isOneToOne: false;
            referencedRelation: "application_scores";
            referencedColumns: ["id"];
          },
        ];
      };
      application_score_overrides: {
        Row: {
          application_id: string;
          application_score_id: string;
          created_at: string;
          id: string;
          new_match_score: number | null;
          new_match_value: boolean | null;
          old_match_score: number | null;
          old_match_value: boolean | null;
          overridden_by: string;
          reason: string;
          requirement_match_id: string | null;
        };
        Insert: {
          application_id: string;
          application_score_id: string;
          created_at?: string;
          id?: string;
          new_match_score?: number | null;
          new_match_value?: boolean | null;
          old_match_score?: number | null;
          old_match_value?: boolean | null;
          overridden_by: string;
          reason: string;
          requirement_match_id?: string | null;
        };
        Update: {
          application_id?: string;
          application_score_id?: string;
          created_at?: string;
          id?: string;
          new_match_score?: number | null;
          new_match_value?: boolean | null;
          old_match_score?: number | null;
          old_match_value?: boolean | null;
          overridden_by?: string;
          reason?: string;
          requirement_match_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_score_overrides_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_score_overrides_application_score_id_fkey";
            columns: ["application_score_id"];
            isOneToOne: false;
            referencedRelation: "application_scores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_score_overrides_overridden_by_fkey";
            columns: ["overridden_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_score_overrides_requirement_match_id_fkey";
            columns: ["requirement_match_id"];
            isOneToOne: false;
            referencedRelation: "application_requirement_matches";
            referencedColumns: ["id"];
          },
        ];
      };
      application_scores: {
        Row: {
          application_id: string;
          ats_contact_score: number;
          ats_experience_score: number;
          ats_formatting_score: number;
          ats_length_score: number;
          ats_score: number;
          ats_skills_score: number;
          checklist_id: string;
          created_at: string;
          cv_id: string;
          good_to_have_coverage: number;
          good_to_have_matched: number;
          good_to_have_score: number;
          good_to_have_total: number;
          id: string;
          match_score: number;
          must_have_coverage: number;
          must_have_matched: number;
          must_have_score: number;
          must_have_total: number;
          parser_version: string;
          score_explanation: Json | null;
          scoring_engine_version: string;
          status: string;
          tools_coverage: number;
          tools_matched: number;
          tools_score: number;
          tools_total: number;
        };
        Insert: {
          application_id: string;
          ats_contact_score: number;
          ats_experience_score: number;
          ats_formatting_score: number;
          ats_length_score: number;
          ats_score: number;
          ats_skills_score: number;
          checklist_id: string;
          created_at?: string;
          cv_id: string;
          good_to_have_coverage: number;
          good_to_have_matched?: number;
          good_to_have_score: number;
          good_to_have_total?: number;
          id?: string;
          match_score: number;
          must_have_coverage: number;
          must_have_matched?: number;
          must_have_score: number;
          must_have_total?: number;
          parser_version: string;
          score_explanation?: Json | null;
          scoring_engine_version: string;
          status?: string;
          tools_coverage: number;
          tools_matched?: number;
          tools_score: number;
          tools_total?: number;
        };
        Update: {
          application_id?: string;
          ats_contact_score?: number;
          ats_experience_score?: number;
          ats_formatting_score?: number;
          ats_length_score?: number;
          ats_score?: number;
          ats_skills_score?: number;
          checklist_id?: string;
          created_at?: string;
          cv_id?: string;
          good_to_have_coverage?: number;
          good_to_have_matched?: number;
          good_to_have_score?: number;
          good_to_have_total?: number;
          id?: string;
          match_score?: number;
          must_have_coverage?: number;
          must_have_matched?: number;
          must_have_score?: number;
          must_have_total?: number;
          parser_version?: string;
          score_explanation?: Json | null;
          scoring_engine_version?: string;
          status?: string;
          tools_coverage?: number;
          tools_matched?: number;
          tools_score?: number;
          tools_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "application_scores_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_scores_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["checklist_id"];
          },
          {
            foreignKeyName: "application_scores_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_scores_cv_id_fkey";
            columns: ["cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
        ];
      };
      application_status_history: {
        Row: {
          application_id: string;
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          application_id: string;
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          application_id?: string;
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_update_requests: {
        Row: {
          application_id: string;
          completed_at: string | null;
          id: string;
          message: string;
          request_type: string;
          requested_at: string;
          requested_by: string;
          status: string;
        };
        Insert: {
          application_id: string;
          completed_at?: string | null;
          id?: string;
          message: string;
          request_type?: string;
          requested_at?: string;
          requested_by: string;
          status?: string;
        };
        Update: {
          application_id?: string;
          completed_at?: string | null;
          id?: string;
          message?: string;
          request_type?: string;
          requested_at?: string;
          requested_by?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_update_requests_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_update_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_verifications: {
        Row: {
          application_id: string;
          application_score_id: string | null;
          created_at: string;
          cv_verified: boolean;
          domain_verified: boolean;
          experience_verified: boolean;
          final_ats_score: number | null;
          final_match_score: number | null;
          id: string;
          must_have_verified: boolean;
          notes: string | null;
          original_ats_score: number | null;
          original_match_score: number | null;
          reason_code: string | null;
          rejection_reason: string | null;
          update_request: string | null;
          verification_status: string;
          verified_at: string;
          verified_by: string;
        };
        Insert: {
          application_id: string;
          application_score_id?: string | null;
          created_at?: string;
          cv_verified?: boolean;
          domain_verified?: boolean;
          experience_verified?: boolean;
          final_ats_score?: number | null;
          final_match_score?: number | null;
          id?: string;
          must_have_verified?: boolean;
          notes?: string | null;
          original_ats_score?: number | null;
          original_match_score?: number | null;
          reason_code?: string | null;
          rejection_reason?: string | null;
          update_request?: string | null;
          verification_status: string;
          verified_at?: string;
          verified_by: string;
        };
        Update: {
          application_id?: string;
          application_score_id?: string | null;
          created_at?: string;
          cv_verified?: boolean;
          domain_verified?: boolean;
          experience_verified?: boolean;
          final_ats_score?: number | null;
          final_match_score?: number | null;
          id?: string;
          must_have_verified?: boolean;
          notes?: string | null;
          original_ats_score?: number | null;
          original_match_score?: number | null;
          reason_code?: string | null;
          rejection_reason?: string | null;
          update_request?: string | null;
          verification_status?: string;
          verified_at?: string;
          verified_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_verifications_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_verifications_application_score_id_fkey";
            columns: ["application_score_id"];
            isOneToOne: false;
            referencedRelation: "application_scores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_verifications_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          applied_at: string;
          ats_score: number | null;
          checklist_id: string;
          created_at: string;
          cv_id: string;
          id: string;
          job_id: string;
          match_score: number | null;
          offer_received_at: string | null;
          placed_at: string | null;
          rejection_reason: string | null;
          score_status: string;
          selected_at: string | null;
          shortlisted_at: string | null;
          status: string;
          student_id: string;
          submitted_at: string | null;
          updated_at: string;
          verification_due_at: string | null;
          verification_pending_at: string | null;
          verified_at: string | null;
          withdrawal_reason: string | null;
          withdrawn_at: string | null;
        };
        Insert: {
          applied_at?: string;
          ats_score?: number | null;
          checklist_id: string;
          created_at?: string;
          cv_id: string;
          id?: string;
          job_id: string;
          match_score?: number | null;
          offer_received_at?: string | null;
          placed_at?: string | null;
          rejection_reason?: string | null;
          score_status?: string;
          selected_at?: string | null;
          shortlisted_at?: string | null;
          status?: string;
          student_id: string;
          submitted_at?: string | null;
          updated_at?: string;
          verification_due_at?: string | null;
          verification_pending_at?: string | null;
          verified_at?: string | null;
          withdrawal_reason?: string | null;
          withdrawn_at?: string | null;
        };
        Update: {
          applied_at?: string;
          ats_score?: number | null;
          checklist_id?: string;
          created_at?: string;
          cv_id?: string;
          id?: string;
          job_id?: string;
          match_score?: number | null;
          offer_received_at?: string | null;
          placed_at?: string | null;
          rejection_reason?: string | null;
          score_status?: string;
          selected_at?: string | null;
          shortlisted_at?: string | null;
          status?: string;
          student_id?: string;
          submitted_at?: string | null;
          updated_at?: string;
          verification_due_at?: string | null;
          verification_pending_at?: string | null;
          verified_at?: string | null;
          withdrawal_reason?: string | null;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["checklist_id"];
          },
          {
            foreignKeyName: "applications_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_cv_id_fkey";
            columns: ["cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: number;
          ip_address: unknown;
          metadata: Json | null;
          new_data: Json | null;
          old_data: Json | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          ip_address?: unknown;
          metadata?: Json | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          ip_address?: unknown;
          metadata?: Json | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_issues: {
        Row: {
          application_id: string | null;
          checklist_id: string;
          created_at: string;
          id: string;
          issue: string;
          reported_by: string;
          resolved_at: string | null;
          severity: string | null;
          status: string;
        };
        Insert: {
          application_id?: string | null;
          checklist_id: string;
          created_at?: string;
          id?: string;
          issue: string;
          reported_by: string;
          resolved_at?: string | null;
          severity?: string | null;
          status?: string;
        };
        Update: {
          application_id?: string | null;
          checklist_id?: string;
          created_at?: string;
          id?: string;
          issue?: string;
          reported_by?: string;
          resolved_at?: string | null;
          severity?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_issues_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_issues_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["checklist_id"];
          },
          {
            foreignKeyName: "checklist_issues_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_issues_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_candidate_decision_history: {
        Row: {
          changed_at: string;
          changed_by: string;
          id: number;
          new_decision: string;
          old_decision: string | null;
          reason: string | null;
          reason_code: string | null;
          submission_candidate_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by: string;
          id?: never;
          new_decision: string;
          old_decision?: string | null;
          reason?: string | null;
          reason_code?: string | null;
          submission_candidate_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string;
          id?: never;
          new_decision?: string;
          old_decision?: string | null;
          reason?: string | null;
          reason_code?: string | null;
          submission_candidate_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_candidate_decision_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_candidate_decision_history_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      client_candidate_decisions: {
        Row: {
          application_id: string;
          company_id: string;
          created_at: string;
          decided_at: string;
          decided_by: string;
          decision: string;
          decision_version: number;
          id: string;
          is_current: boolean;
          reason: string | null;
          reason_code: string | null;
          submission_candidate_id: string;
        };
        Insert: {
          application_id: string;
          company_id: string;
          created_at?: string;
          decided_at?: string;
          decided_by: string;
          decision: string;
          decision_version?: number;
          id?: string;
          is_current?: boolean;
          reason?: string | null;
          reason_code?: string | null;
          submission_candidate_id: string;
        };
        Update: {
          application_id?: string;
          company_id?: string;
          created_at?: string;
          decided_at?: string;
          decided_by?: string;
          decision?: string;
          decision_version?: number;
          id?: string;
          is_current?: boolean;
          reason?: string | null;
          reason_code?: string | null;
          submission_candidate_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_candidate_decisions_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_candidate_decisions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_candidate_decisions_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_candidate_decisions_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      client_hr_profiles: {
        Row: {
          company_id: string;
          created_at: string;
          department: string | null;
          designation: string | null;
          employee_code: string | null;
          id: string;
          is_active: boolean;
          is_primary_contact: boolean;
          linkedin_url: string | null;
          updated_at: string;
          user_id: string;
          work_email: string | null;
          work_phone: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          employee_code?: string | null;
          id?: string;
          is_active?: boolean;
          is_primary_contact?: boolean;
          linkedin_url?: string | null;
          updated_at?: string;
          user_id: string;
          work_email?: string | null;
          work_phone?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          employee_code?: string | null;
          id?: string;
          is_active?: boolean;
          is_primary_contact?: boolean;
          linkedin_url?: string | null;
          updated_at?: string;
          user_id?: string;
          work_email?: string | null;
          work_phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_hr_profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_hr_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          company_code: string | null;
          company_domain: string | null;
          company_name: string;
          company_size: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          gst_number: string | null;
          id: string;
          industry: string | null;
          is_active: boolean;
          legal_name: string | null;
          linkedin_url: string | null;
          logo_url: string | null;
          notes: string | null;
          postal_code: string | null;
          primary_email: string | null;
          primary_phone: string | null;
          registration_number: string | null;
          rejection_reason: string | null;
          state: string | null;
          updated_at: string;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
          website_url: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          company_code?: string | null;
          company_domain?: string | null;
          company_name: string;
          company_size?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          gst_number?: string | null;
          id?: string;
          industry?: string | null;
          is_active?: boolean;
          legal_name?: string | null;
          linkedin_url?: string | null;
          logo_url?: string | null;
          notes?: string | null;
          postal_code?: string | null;
          primary_email?: string | null;
          primary_phone?: string | null;
          registration_number?: string | null;
          rejection_reason?: string | null;
          state?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          company_code?: string | null;
          company_domain?: string | null;
          company_name?: string;
          company_size?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          gst_number?: string | null;
          id?: string;
          industry?: string | null;
          is_active?: boolean;
          legal_name?: string | null;
          linkedin_url?: string | null;
          logo_url?: string | null;
          notes?: string | null;
          postal_code?: string | null;
          primary_email?: string | null;
          primary_phone?: string | null;
          registration_number?: string | null;
          rejection_reason?: string | null;
          state?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          company_id: string;
          id: number;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          company_id: string;
          id?: never;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          company_id?: string;
          id?: never;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_status_history_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      cv_parsed_profiles: {
        Row: {
          certifications: Json;
          created_at: string;
          current_company: string | null;
          current_designation: string | null;
          cv_id: string;
          domains: Json;
          education: Json;
          email: string | null;
          experience: Json;
          extraction_confidence: number | null;
          extraction_version: string | null;
          full_name: string | null;
          id: string;
          linkedin_url: string | null;
          location: string | null;
          methodologies: Json;
          parser_version: string;
          phone: string | null;
          professional_summary: string | null;
          projects: Json;
          raw_extraction: Json | null;
          skills: Json;
          tools: Json;
          total_experience_months: number | null;
          updated_at: string;
        };
        Insert: {
          certifications?: Json;
          created_at?: string;
          current_company?: string | null;
          current_designation?: string | null;
          cv_id: string;
          domains?: Json;
          education?: Json;
          email?: string | null;
          experience?: Json;
          extraction_confidence?: number | null;
          extraction_version?: string | null;
          full_name?: string | null;
          id?: string;
          linkedin_url?: string | null;
          location?: string | null;
          methodologies?: Json;
          parser_version: string;
          phone?: string | null;
          professional_summary?: string | null;
          projects?: Json;
          raw_extraction?: Json | null;
          skills?: Json;
          tools?: Json;
          total_experience_months?: number | null;
          updated_at?: string;
        };
        Update: {
          certifications?: Json;
          created_at?: string;
          current_company?: string | null;
          current_designation?: string | null;
          cv_id?: string;
          domains?: Json;
          education?: Json;
          email?: string | null;
          experience?: Json;
          extraction_confidence?: number | null;
          extraction_version?: string | null;
          full_name?: string | null;
          id?: string;
          linkedin_url?: string | null;
          location?: string | null;
          methodologies?: Json;
          parser_version?: string;
          phone?: string | null;
          professional_summary?: string | null;
          projects?: Json;
          raw_extraction?: Json | null;
          skills?: Json;
          tools?: Json;
          total_experience_months?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cv_parsed_profiles_cv_id_fkey";
            columns: ["cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_feedback_revisions: {
        Row: {
          feedback_id: string;
          id: string;
          new_comments: string | null;
          new_decision: string | null;
          new_rating: number | null;
          new_reason_code: string | null;
          previous_comments: string | null;
          previous_decision: string | null;
          previous_rating: number | null;
          previous_reason_code: string | null;
          reason: string;
          revised_at: string;
          revised_by: string;
          revision_number: number;
        };
        Insert: {
          feedback_id: string;
          id?: string;
          new_comments?: string | null;
          new_decision?: string | null;
          new_rating?: number | null;
          new_reason_code?: string | null;
          previous_comments?: string | null;
          previous_decision?: string | null;
          previous_rating?: number | null;
          previous_reason_code?: string | null;
          reason: string;
          revised_at?: string;
          revised_by: string;
          revision_number: number;
        };
        Update: {
          feedback_id?: string;
          id?: string;
          new_comments?: string | null;
          new_decision?: string | null;
          new_rating?: number | null;
          new_reason_code?: string | null;
          previous_comments?: string | null;
          previous_decision?: string | null;
          previous_rating?: number | null;
          previous_reason_code?: string | null;
          reason?: string;
          revised_at?: string;
          revised_by?: string;
          revision_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interview_feedback_revisions_feedback_id_fkey";
            columns: ["feedback_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["feedback_id"];
          },
          {
            foreignKeyName: "interview_feedback_revisions_feedback_id_fkey";
            columns: ["feedback_id"];
            isOneToOne: false;
            referencedRelation: "interview_feedbacks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedback_revisions_revised_by_fkey";
            columns: ["revised_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_feedbacks: {
        Row: {
          application_id: string;
          client_visible_to_student: boolean;
          comments: string | null;
          company_id: string;
          created_at: string;
          decision: string;
          feedback_code: string | null;
          feedback_due_at: string | null;
          feedback_status: string;
          id: string;
          interview_id: string;
          rating: number | null;
          reason_code: string | null;
          revised_at: string | null;
          revised_by: string | null;
          submission_candidate_id: string;
          submitted_at: string;
          submitted_by: string;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          client_visible_to_student?: boolean;
          comments?: string | null;
          company_id: string;
          created_at?: string;
          decision: string;
          feedback_code?: string | null;
          feedback_due_at?: string | null;
          feedback_status?: string;
          id?: string;
          interview_id: string;
          rating?: number | null;
          reason_code?: string | null;
          revised_at?: string | null;
          revised_by?: string | null;
          submission_candidate_id: string;
          submitted_at?: string;
          submitted_by: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          client_visible_to_student?: boolean;
          comments?: string | null;
          company_id?: string;
          created_at?: string;
          decision?: string;
          feedback_code?: string | null;
          feedback_due_at?: string | null;
          feedback_status?: string;
          id?: string;
          interview_id?: string;
          rating?: number | null;
          reason_code?: string | null;
          revised_at?: string | null;
          revised_by?: string | null;
          submission_candidate_id?: string;
          submitted_at?: string;
          submitted_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_feedbacks_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedbacks_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedbacks_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["interview_id"];
          },
          {
            foreignKeyName: "interview_feedbacks_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedbacks_revised_by_fkey";
            columns: ["revised_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedbacks_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_feedbacks_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_participants: {
        Row: {
          attendance_status: string | null;
          created_at: string;
          external_email: string | null;
          external_name: string | null;
          id: string;
          interview_id: string;
          participant_type: string;
          user_id: string | null;
        };
        Insert: {
          attendance_status?: string | null;
          created_at?: string;
          external_email?: string | null;
          external_name?: string | null;
          id?: string;
          interview_id: string;
          participant_type: string;
          user_id?: string | null;
        };
        Update: {
          attendance_status?: string | null;
          created_at?: string;
          external_email?: string | null;
          external_name?: string | null;
          id?: string;
          interview_id?: string;
          participant_type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interview_participants_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["interview_id"];
          },
          {
            foreignKeyName: "interview_participants_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_reschedules: {
        Row: {
          id: string;
          interview_id: string;
          new_location: string | null;
          new_meeting_link: string | null;
          new_mode: string | null;
          new_scheduled_at: string;
          new_timezone: string | null;
          old_location: string | null;
          old_meeting_link: string | null;
          old_mode: string | null;
          old_scheduled_at: string;
          old_timezone: string | null;
          reason: string;
          rescheduled_at: string;
          rescheduled_by: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          new_location?: string | null;
          new_meeting_link?: string | null;
          new_mode?: string | null;
          new_scheduled_at: string;
          new_timezone?: string | null;
          old_location?: string | null;
          old_meeting_link?: string | null;
          old_mode?: string | null;
          old_scheduled_at: string;
          old_timezone?: string | null;
          reason: string;
          rescheduled_at?: string;
          rescheduled_by: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          new_location?: string | null;
          new_meeting_link?: string | null;
          new_mode?: string | null;
          new_scheduled_at?: string;
          new_timezone?: string | null;
          old_location?: string | null;
          old_meeting_link?: string | null;
          old_mode?: string | null;
          old_scheduled_at?: string;
          old_timezone?: string | null;
          reason?: string;
          rescheduled_at?: string;
          rescheduled_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_reschedules_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["interview_id"];
          },
          {
            foreignKeyName: "interview_reschedules_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_reschedules_rescheduled_by_fkey";
            columns: ["rescheduled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          interview_id: string;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          interview_id: string;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          interview_id?: string;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interview_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_status_history_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["interview_id"];
          },
          {
            foreignKeyName: "interview_status_history_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
        ];
      };
      interviews: {
        Row: {
          application_id: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          client_hr_user_id: string;
          company_id: string;
          completed_at: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          duration_minutes: number;
          external_calendar_event_id: string | null;
          external_calendar_provider: string | null;
          id: string;
          instructions: string | null;
          interview_code: string | null;
          interview_type: string;
          job_id: string;
          location: string | null;
          meeting_link: string | null;
          meeting_provider: string | null;
          mode: string;
          round_name: string;
          round_number: number;
          scheduled_at: string;
          scheduled_at_created: string;
          scheduled_by: string;
          started_at: string | null;
          status: string;
          submission_candidate_id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_hr_user_id: string;
          company_id: string;
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes?: number;
          external_calendar_event_id?: string | null;
          external_calendar_provider?: string | null;
          id?: string;
          instructions?: string | null;
          interview_code?: string | null;
          interview_type?: string;
          job_id: string;
          location?: string | null;
          meeting_link?: string | null;
          meeting_provider?: string | null;
          mode: string;
          round_name: string;
          round_number?: number;
          scheduled_at: string;
          scheduled_at_created?: string;
          scheduled_by: string;
          started_at?: string | null;
          status?: string;
          submission_candidate_id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_hr_user_id?: string;
          company_id?: string;
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes?: number;
          external_calendar_event_id?: string | null;
          external_calendar_provider?: string | null;
          id?: string;
          instructions?: string | null;
          interview_code?: string | null;
          interview_type?: string;
          job_id?: string;
          location?: string | null;
          meeting_link?: string | null;
          meeting_provider?: string | null;
          mode?: string;
          round_name?: string;
          round_number?: number;
          scheduled_at?: string;
          scheduled_at_created?: string;
          scheduled_by?: string;
          started_at?: string | null;
          status?: string;
          submission_candidate_id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_client_hr_user_id_fkey";
            columns: ["client_hr_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "interviews_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_scheduled_by_fkey";
            columns: ["scheduled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      job_checklists: {
        Row: {
          ai_model: string | null;
          ai_response_id: string | null;
          approved_at: string | null;
          approved_by: string | null;
          checklist_summary: string | null;
          created_at: string;
          created_by: string;
          domain: string | null;
          exp_required: string | null;
          generated_at: string | null;
          generated_by: string | null;
          good_to_have: Json;
          id: string;
          job_id: string;
          must_have: Json;
          prompt_version: string | null;
          source: string;
          status: string;
          tools: Json;
          top_3_skills: Json;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          ai_model?: string | null;
          ai_response_id?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          checklist_summary?: string | null;
          created_at?: string;
          created_by: string;
          domain?: string | null;
          exp_required?: string | null;
          generated_at?: string | null;
          generated_by?: string | null;
          good_to_have?: Json;
          id?: string;
          job_id: string;
          must_have?: Json;
          prompt_version?: string | null;
          source?: string;
          status?: string;
          tools?: Json;
          top_3_skills?: Json;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          ai_model?: string | null;
          ai_response_id?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          checklist_summary?: string | null;
          created_at?: string;
          created_by?: string;
          domain?: string | null;
          exp_required?: string | null;
          generated_at?: string | null;
          generated_by?: string | null;
          good_to_have?: Json;
          id?: string;
          job_id?: string;
          must_have?: Json;
          prompt_version?: string | null;
          source?: string;
          status?: string;
          tools?: Json;
          top_3_skills?: Json;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "job_checklists_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_checklists_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_checklists_generated_by_fkey";
            columns: ["generated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_checklists_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "job_checklists_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_checklists_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_publications: {
        Row: {
          broadcast_email: boolean;
          broadcast_telegram: boolean;
          broadcast_whatsapp: boolean;
          checklist_id: string;
          id: string;
          job_id: string;
          poster_payload: Json;
          publication_version: number;
          published_at: string;
          published_by: string;
        };
        Insert: {
          broadcast_email?: boolean;
          broadcast_telegram?: boolean;
          broadcast_whatsapp?: boolean;
          checklist_id: string;
          id?: string;
          job_id: string;
          poster_payload: Json;
          publication_version?: number;
          published_at?: string;
          published_by: string;
        };
        Update: {
          broadcast_email?: boolean;
          broadcast_telegram?: boolean;
          broadcast_whatsapp?: boolean;
          checklist_id?: string;
          id?: string;
          job_id?: string;
          poster_payload?: Json;
          publication_version?: number;
          published_at?: string;
          published_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_publications_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["checklist_id"];
          },
          {
            foreignKeyName: "job_publications_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_publications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "job_publications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_publications_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          job_id: string;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          job_id: string;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          job_id?: string;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_status_history_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "job_status_history_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          application_deadline: string | null;
          assigned_placement_hr: string | null;
          checklist_due_at: string | null;
          closed_at: string | null;
          closed_by: string | null;
          closure_reason: string | null;
          company_id: string;
          country: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          deleted_by: string | null;
          employment_type: string | null;
          experience_max_months: number | null;
          experience_min_months: number | null;
          id: string;
          jd_text: string;
          job_code: string | null;
          job_title: string;
          location: string | null;
          location_type: string;
          notes: string | null;
          openings: number;
          primary_client_hr_user_id: string | null;
          published_at: string | null;
          published_by: string | null;
          role_type: string;
          salary_currency: string | null;
          salary_max: number | null;
          salary_min: number | null;
          status: string;
          updated_at: string;
          workplace_type: string | null;
        };
        Insert: {
          application_deadline?: string | null;
          assigned_placement_hr?: string | null;
          checklist_due_at?: string | null;
          closed_at?: string | null;
          closed_by?: string | null;
          closure_reason?: string | null;
          company_id: string;
          country?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          employment_type?: string | null;
          experience_max_months?: number | null;
          experience_min_months?: number | null;
          id?: string;
          jd_text: string;
          job_code?: string | null;
          job_title: string;
          location?: string | null;
          location_type: string;
          notes?: string | null;
          openings?: number;
          primary_client_hr_user_id?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          role_type: string;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: string;
          updated_at?: string;
          workplace_type?: string | null;
        };
        Update: {
          application_deadline?: string | null;
          assigned_placement_hr?: string | null;
          checklist_due_at?: string | null;
          closed_at?: string | null;
          closed_by?: string | null;
          closure_reason?: string | null;
          company_id?: string;
          country?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          employment_type?: string | null;
          experience_max_months?: number | null;
          experience_min_months?: number | null;
          id?: string;
          jd_text?: string;
          job_code?: string | null;
          job_title?: string;
          location?: string | null;
          location_type?: string;
          notes?: string | null;
          openings?: number;
          primary_client_hr_user_id?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          role_type?: string;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: string;
          updated_at?: string;
          workplace_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_placement_hr_fkey";
            columns: ["assigned_placement_hr"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_closed_by_fkey";
            columns: ["closed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_primary_client_hr_user_id_fkey";
            columns: ["primary_client_hr_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_attendance: {
        Row: {
          attendance_status: string;
          created_at: string;
          id: string;
          joined_at: string | null;
          left_at: string | null;
          mock_interview_id: string;
          notes: string | null;
          participant_role: string;
          participant_user_id: string;
          recorded_by: string | null;
        };
        Insert: {
          attendance_status: string;
          created_at?: string;
          id?: string;
          joined_at?: string | null;
          left_at?: string | null;
          mock_interview_id: string;
          notes?: string | null;
          participant_role: string;
          participant_user_id: string;
          recorded_by?: string | null;
        };
        Update: {
          attendance_status?: string;
          created_at?: string;
          id?: string;
          joined_at?: string | null;
          left_at?: string | null;
          mock_interview_id?: string;
          notes?: string | null;
          participant_role?: string;
          participant_user_id?: string;
          recorded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_attendance_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: false;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_attendance_participant_user_id_fkey";
            columns: ["participant_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_attendance_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_availability_slots: {
        Row: {
          booked_count: number;
          capacity: number;
          created_at: string;
          created_by: string;
          ends_at: string;
          evaluator_user_id: string;
          id: string;
          location: string | null;
          meeting_provider: string | null;
          mode: string;
          starts_at: string;
          status: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          booked_count?: number;
          capacity?: number;
          created_at?: string;
          created_by: string;
          ends_at: string;
          evaluator_user_id: string;
          id?: string;
          location?: string | null;
          meeting_provider?: string | null;
          mode: string;
          starts_at: string;
          status?: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          booked_count?: number;
          capacity?: number;
          created_at?: string;
          created_by?: string;
          ends_at?: string;
          evaluator_user_id?: string;
          id?: string;
          location?: string | null;
          meeting_provider?: string | null;
          mode?: string;
          starts_at?: string;
          status?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_availability_slots_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_availability_slots_evaluator_user_id_fkey";
            columns: ["evaluator_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_interviews: {
        Row: {
          application_id: string;
          attempt_number: number;
          booking_source: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          completed_at: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          duration_minutes: number;
          evaluator_user_id: string | null;
          id: string;
          is_official: boolean;
          job_id: string;
          location: string | null;
          meeting_link: string | null;
          meeting_provider: string | null;
          mock_code: string | null;
          mode: string;
          scheduled_at: string;
          scheduled_by: string;
          started_at: string | null;
          status: string;
          student_id: string;
          submission_candidate_id: string | null;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          attempt_number?: number;
          booking_source?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes?: number;
          evaluator_user_id?: string | null;
          id?: string;
          is_official?: boolean;
          job_id: string;
          location?: string | null;
          meeting_link?: string | null;
          meeting_provider?: string | null;
          mock_code?: string | null;
          mode: string;
          scheduled_at: string;
          scheduled_by: string;
          started_at?: string | null;
          status?: string;
          student_id: string;
          submission_candidate_id?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          attempt_number?: number;
          booking_source?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes?: number;
          evaluator_user_id?: string | null;
          id?: string;
          is_official?: boolean;
          job_id?: string;
          location?: string | null;
          meeting_link?: string | null;
          meeting_provider?: string | null;
          mock_code?: string | null;
          mode?: string;
          scheduled_at?: string;
          scheduled_by?: string;
          started_at?: string | null;
          status?: string;
          student_id?: string;
          submission_candidate_id?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_interviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_evaluator_user_id_fkey";
            columns: ["evaluator_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "mock_interviews_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_scheduled_by_fkey";
            columns: ["scheduled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_interviews_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_participants: {
        Row: {
          created_at: string;
          id: string;
          mock_interview_id: string;
          participant_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          mock_interview_id: string;
          participant_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          mock_interview_id?: string;
          participant_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_participants_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: false;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_reschedules: {
        Row: {
          approved_by: string | null;
          created_at: string;
          id: string;
          mock_interview_id: string;
          new_scheduled_at: string;
          old_scheduled_at: string;
          reason: string;
          requested_by: string;
        };
        Insert: {
          approved_by?: string | null;
          created_at?: string;
          id?: string;
          mock_interview_id: string;
          new_scheduled_at: string;
          old_scheduled_at: string;
          reason: string;
          requested_by: string;
        };
        Update: {
          approved_by?: string | null;
          created_at?: string;
          id?: string;
          mock_interview_id?: string;
          new_scheduled_at?: string;
          old_scheduled_at?: string;
          reason?: string;
          requested_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_reschedules_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_reschedules_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: false;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_reschedules_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_scorecard_items: {
        Row: {
          category: string;
          comment: string | null;
          created_at: string;
          criterion_code: string;
          criterion_label: string;
          id: string;
          max_score: number;
          score: number;
          scorecard_id: string;
        };
        Insert: {
          category: string;
          comment?: string | null;
          created_at?: string;
          criterion_code: string;
          criterion_label: string;
          id?: string;
          max_score?: number;
          score: number;
          scorecard_id: string;
        };
        Update: {
          category?: string;
          comment?: string | null;
          created_at?: string;
          criterion_code?: string;
          criterion_label?: string;
          id?: string;
          max_score?: number;
          score?: number;
          scorecard_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecard_items_scorecard_id_fkey";
            columns: ["scorecard_id"];
            isOneToOne: false;
            referencedRelation: "mock_scorecards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_scorecard_items_scorecard_id_fkey";
            columns: ["scorecard_id"];
            isOneToOne: false;
            referencedRelation: "student_mock_scorecards";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_scorecard_revisions: {
        Row: {
          id: string;
          previous_data: Json;
          reason: string;
          revised_at: string;
          revised_by: string;
          revision_number: number;
          scorecard_id: string;
        };
        Insert: {
          id?: string;
          previous_data: Json;
          reason: string;
          revised_at?: string;
          revised_by: string;
          revision_number: number;
          scorecard_id: string;
        };
        Update: {
          id?: string;
          previous_data?: Json;
          reason?: string;
          revised_at?: string;
          revised_by?: string;
          revision_number?: number;
          scorecard_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecard_revisions_revised_by_fkey";
            columns: ["revised_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_scorecard_revisions_scorecard_id_fkey";
            columns: ["scorecard_id"];
            isOneToOne: false;
            referencedRelation: "mock_scorecards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_scorecard_revisions_scorecard_id_fkey";
            columns: ["scorecard_id"];
            isOneToOne: false;
            referencedRelation: "student_mock_scorecards";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_scorecard_template_items: {
        Row: {
          category: string;
          created_at: string;
          criterion_code: string;
          criterion_label: string;
          description: string | null;
          id: string;
          is_required: boolean;
          sort_order: number;
          template_id: string;
          weight: number;
        };
        Insert: {
          category: string;
          created_at?: string;
          criterion_code: string;
          criterion_label: string;
          description?: string | null;
          id?: string;
          is_required?: boolean;
          sort_order?: number;
          template_id: string;
          weight: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          criterion_code?: string;
          criterion_label?: string;
          description?: string | null;
          id?: string;
          is_required?: boolean;
          sort_order?: number;
          template_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecard_template_items_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "mock_scorecard_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_scorecard_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          domain: string | null;
          id: string;
          is_active: boolean;
          name: string;
          role_type: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          domain?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          role_type: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          domain?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          role_type?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecard_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_scorecards: {
        Row: {
          application_id: string;
          communication_score: number;
          domain_score: number;
          evaluated_by: string;
          evaluator_notes: string | null;
          id: string;
          improvement_areas: string | null;
          mock_interview_id: string;
          overall_score: number;
          recommendation: string | null;
          scoring_version: string;
          status: string;
          strengths: string | null;
          student_visible_notes: string | null;
          submitted_at: string;
          technical_score: number;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          communication_score: number;
          domain_score: number;
          evaluated_by: string;
          evaluator_notes?: string | null;
          id?: string;
          improvement_areas?: string | null;
          mock_interview_id: string;
          overall_score: number;
          recommendation?: string | null;
          scoring_version?: string;
          status?: string;
          strengths?: string | null;
          student_visible_notes?: string | null;
          submitted_at?: string;
          technical_score: number;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          communication_score?: number;
          domain_score?: number;
          evaluated_by?: string;
          evaluator_notes?: string | null;
          id?: string;
          improvement_areas?: string | null;
          mock_interview_id?: string;
          overall_score?: number;
          recommendation?: string | null;
          scoring_version?: string;
          status?: string;
          strengths?: string | null;
          student_visible_notes?: string | null;
          submitted_at?: string;
          technical_score?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecards_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_scorecards_evaluated_by_fkey";
            columns: ["evaluated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_scorecards_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: true;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          mock_interview_id: string;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          mock_interview_id: string;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          mock_interview_id?: string;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_status_history_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: false;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_delivery_logs: {
        Row: {
          channel: string;
          delivered_at: string;
          error_message: string | null;
          event_type: string;
          id: string;
          metadata: Json;
          outbox_id: string;
          provider: string | null;
          provider_message_id: string | null;
          recipient_address: string | null;
          recipient_user_id: string | null;
          status: string;
        };
        Insert: {
          channel: string;
          delivered_at?: string;
          error_message?: string | null;
          event_type: string;
          id?: string;
          metadata?: Json;
          outbox_id: string;
          provider?: string | null;
          provider_message_id?: string | null;
          recipient_address?: string | null;
          recipient_user_id?: string | null;
          status: string;
        };
        Update: {
          channel?: string;
          delivered_at?: string;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          metadata?: Json;
          outbox_id?: string;
          provider?: string | null;
          provider_message_id?: string | null;
          recipient_address?: string | null;
          recipient_user_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_delivery_logs_outbox_id_fkey";
            columns: ["outbox_id"];
            isOneToOne: false;
            referencedRelation: "notification_outbox";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_delivery_logs_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_jobs: {
        Row: {
          attempts: number;
          channel: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          error_message: string | null;
          event_type: string;
          id: string;
          max_attempts: number;
          payload: Json;
          processed_at: string | null;
          scheduled_at: string;
          status: string;
        };
        Insert: {
          attempts?: number;
          channel: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          error_message?: string | null;
          event_type: string;
          id?: string;
          max_attempts?: number;
          payload: Json;
          processed_at?: string | null;
          scheduled_at?: string;
          status?: string;
        };
        Update: {
          attempts?: number;
          channel?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          max_attempts?: number;
          payload?: Json;
          processed_at?: string | null;
          scheduled_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      notification_outbox: {
        Row: {
          attempts: number;
          channel: string;
          created_at: string;
          dedupe_key: string | null;
          entity_id: string | null;
          entity_type: string | null;
          error_message: string | null;
          event_type: string;
          failed_at: string | null;
          id: string;
          max_attempts: number;
          payload: Json;
          processing_started_at: string | null;
          recipient_email: string | null;
          recipient_user_id: string | null;
          scheduled_for: string;
          sent_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          channel: string;
          created_at?: string;
          dedupe_key?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          error_message?: string | null;
          event_type: string;
          failed_at?: string | null;
          id?: string;
          max_attempts?: number;
          payload?: Json;
          processing_started_at?: string | null;
          recipient_email?: string | null;
          recipient_user_id?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          channel?: string;
          created_at?: string;
          dedupe_key?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          error_message?: string | null;
          event_type?: string;
          failed_at?: string | null;
          id?: string;
          max_attempts?: number;
          payload?: Json;
          processing_started_at?: string | null;
          recipient_email?: string | null;
          recipient_user_id?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_outbox_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          action_url: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          event_type: string;
          id: string;
          is_read: boolean;
          message: string;
          read_at: string | null;
          severity: string;
          title: string;
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_type: string;
          id?: string;
          is_read?: boolean;
          message: string;
          read_at?: string | null;
          severity?: string;
          title: string;
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_type?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          read_at?: string | null;
          severity?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          new_status: string;
          offer_id: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status: string;
          offer_id: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status?: string;
          offer_id?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "offer_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offer_status_history_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      offers: {
        Row: {
          annual_ctc: number | null;
          application_id: string;
          bucket_name: string;
          company_id: string;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          deleted_by: string | null;
          department: string | null;
          designation: string;
          employment_type: string | null;
          file_hash: string | null;
          file_size: number;
          id: string;
          interview_feedback_id: string;
          job_id: string;
          joining_date: string | null;
          joining_location: string | null;
          mime_type: string;
          notes: string | null;
          notice_buyout_available: boolean | null;
          offer_code: string | null;
          offer_date: string | null;
          offer_valid_until: string | null;
          original_file_name: string;
          probation_period_months: number | null;
          sent_to_student_at: string | null;
          status: string;
          storage_path: string;
          student_decided_at: string | null;
          student_decision_reason: string | null;
          student_id: string;
          submission_candidate_id: string;
          updated_at: string;
          uploaded_at: string;
          uploaded_by: string;
          withdrawal_reason: string | null;
          withdrawn_at: string | null;
          withdrawn_by: string | null;
        };
        Insert: {
          annual_ctc?: number | null;
          application_id: string;
          bucket_name?: string;
          company_id: string;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          department?: string | null;
          designation: string;
          employment_type?: string | null;
          file_hash?: string | null;
          file_size: number;
          id?: string;
          interview_feedback_id: string;
          job_id: string;
          joining_date?: string | null;
          joining_location?: string | null;
          mime_type: string;
          notes?: string | null;
          notice_buyout_available?: boolean | null;
          offer_code?: string | null;
          offer_date?: string | null;
          offer_valid_until?: string | null;
          original_file_name: string;
          probation_period_months?: number | null;
          sent_to_student_at?: string | null;
          status?: string;
          storage_path: string;
          student_decided_at?: string | null;
          student_decision_reason?: string | null;
          student_id: string;
          submission_candidate_id: string;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by: string;
          withdrawal_reason?: string | null;
          withdrawn_at?: string | null;
          withdrawn_by?: string | null;
        };
        Update: {
          annual_ctc?: number | null;
          application_id?: string;
          bucket_name?: string;
          company_id?: string;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          department?: string | null;
          designation?: string;
          employment_type?: string | null;
          file_hash?: string | null;
          file_size?: number;
          id?: string;
          interview_feedback_id?: string;
          job_id?: string;
          joining_date?: string | null;
          joining_location?: string | null;
          mime_type?: string;
          notes?: string | null;
          notice_buyout_available?: boolean | null;
          offer_code?: string | null;
          offer_date?: string | null;
          offer_valid_until?: string | null;
          original_file_name?: string;
          probation_period_months?: number | null;
          sent_to_student_at?: string | null;
          status?: string;
          storage_path?: string;
          student_decided_at?: string | null;
          student_decision_reason?: string | null;
          student_id?: string;
          submission_candidate_id?: string;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by?: string;
          withdrawal_reason?: string | null;
          withdrawn_at?: string | null;
          withdrawn_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "offers_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_interview_feedback_id_fkey";
            columns: ["interview_feedback_id"];
            isOneToOne: false;
            referencedRelation: "analytics_feedback_sla";
            referencedColumns: ["feedback_id"];
          },
          {
            foreignKeyName: "offers_interview_feedback_id_fkey";
            columns: ["interview_feedback_id"];
            isOneToOne: false;
            referencedRelation: "interview_feedbacks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "offers_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_withdrawn_by_fkey";
            columns: ["withdrawn_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      operational_alerts: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          alert_type: string;
          assigned_to: string | null;
          created_at: string;
          description: string | null;
          due_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          severity: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          alert_type: string;
          assigned_to?: string | null;
          created_at?: string;
          description?: string | null;
          due_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          alert_type?: string;
          assigned_to?: string | null;
          created_at?: string;
          description?: string | null;
          due_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operational_alerts_acknowledged_by_fkey";
            columns: ["acknowledged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operational_alerts_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operational_alerts_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          module: string;
        };
        Insert: {
          action: string;
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          module: string;
        };
        Update: {
          action?: string;
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          module?: string;
        };
        Relationships: [];
      };
      placement_hr_profiles: {
        Row: {
          created_at: string;
          department: string | null;
          designation: string | null;
          employee_code: string | null;
          id: string;
          is_active: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          employee_code?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          department?: string | null;
          designation?: string | null;
          employee_code?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "placement_hr_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      placement_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          placement_id: string;
          reason: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          placement_id: string;
          reason?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          placement_id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "placement_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placement_status_history_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "placements";
            referencedColumns: ["id"];
          },
        ];
      };
      placements: {
        Row: {
          annual_ctc: number | null;
          application_id: string;
          closed_at: string | null;
          closed_by: string | null;
          closure_reason: string | null;
          company_id: string;
          created_at: string;
          currency: string;
          id: string;
          job_id: string;
          joined_at: string | null;
          joining_date: string | null;
          joining_location: string | null;
          notes: string | null;
          offer_id: string;
          placed_at: string;
          placed_by: string;
          placed_department: string | null;
          placed_designation: string;
          placement_code: string | null;
          placement_status: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          annual_ctc?: number | null;
          application_id: string;
          closed_at?: string | null;
          closed_by?: string | null;
          closure_reason?: string | null;
          company_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          job_id: string;
          joined_at?: string | null;
          joining_date?: string | null;
          joining_location?: string | null;
          notes?: string | null;
          offer_id: string;
          placed_at?: string;
          placed_by: string;
          placed_department?: string | null;
          placed_designation: string;
          placement_code?: string | null;
          placement_status?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          annual_ctc?: number | null;
          application_id?: string;
          closed_at?: string | null;
          closed_by?: string | null;
          closure_reason?: string | null;
          company_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          job_id?: string;
          joined_at?: string | null;
          joining_date?: string | null;
          joining_location?: string | null;
          notes?: string | null;
          offer_id?: string;
          placed_at?: string;
          placed_by?: string;
          placed_department?: string | null;
          placed_designation?: string;
          placement_code?: string | null;
          placement_status?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "placements_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_closed_by_fkey";
            columns: ["closed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "placements_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: true;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_placed_by_fkey";
            columns: ["placed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placements_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: string;
          approved_at: string | null;
          approved_by: string | null;
          avatar_url: string | null;
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          last_login_at: string | null;
          last_name: string | null;
          phone: string | null;
          rejection_reason: string | null;
          updated_at: string;
        };
        Insert: {
          account_status?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: string;
          last_login_at?: string | null;
          last_name?: string | null;
          phone?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          account_status?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          last_name?: string | null;
          phone?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          created_at: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          is_system_role: boolean;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_name: string;
          id?: string;
          is_system_role?: boolean;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_name?: string;
          id?: string;
          is_system_role?: boolean;
          name?: string;
        };
        Relationships: [];
      };
      scoring_runs: {
        Row: {
          application_id: string;
          checklist_id: string;
          completed_at: string | null;
          created_at: string;
          cv_id: string;
          error_code: string | null;
          error_message: string | null;
          id: string;
          parser_version: string | null;
          processing_job_id: string | null;
          scoring_engine_version: string;
          started_at: string;
          status: string;
        };
        Insert: {
          application_id: string;
          checklist_id: string;
          completed_at?: string | null;
          created_at?: string;
          cv_id: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          parser_version?: string | null;
          processing_job_id?: string | null;
          scoring_engine_version: string;
          started_at?: string;
          status: string;
        };
        Update: {
          application_id?: string;
          checklist_id?: string;
          completed_at?: string | null;
          created_at?: string;
          cv_id?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          parser_version?: string | null;
          processing_job_id?: string | null;
          scoring_engine_version?: string;
          started_at?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scoring_runs_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scoring_runs_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["checklist_id"];
          },
          {
            foreignKeyName: "scoring_runs_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "job_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scoring_runs_cv_id_fkey";
            columns: ["cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scoring_runs_processing_job_id_fkey";
            columns: ["processing_job_id"];
            isOneToOne: false;
            referencedRelation: "application_processing_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      skill_aliases: {
        Row: {
          alias: string;
          canonical_name: string;
          category: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
        };
        Insert: {
          alias: string;
          canonical_name: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
        };
        Update: {
          alias?: string;
          canonical_name?: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      student_cvs: {
        Row: {
          bucket: string;
          deleted_at: string | null;
          deleted_by: string | null;
          file_extension: string;
          file_hash: string | null;
          file_size: number;
          id: string;
          is_primary: boolean;
          mime_type: string;
          original_file_name: string;
          parse_error: string | null;
          parsed_text: string | null;
          parser_version: string | null;
          parsing_status: string;
          storage_path: string;
          student_id: string;
          updated_at: string;
          uploaded_at: string;
          uploaded_by: string;
        };
        Insert: {
          bucket?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          file_extension: string;
          file_hash?: string | null;
          file_size: number;
          id?: string;
          is_primary?: boolean;
          mime_type: string;
          original_file_name: string;
          parse_error?: string | null;
          parsed_text?: string | null;
          parser_version?: string | null;
          parsing_status?: string;
          storage_path: string;
          student_id: string;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by: string;
        };
        Update: {
          bucket?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          file_extension?: string;
          file_hash?: string | null;
          file_size?: number;
          id?: string;
          is_primary?: boolean;
          mime_type?: string;
          original_file_name?: string;
          parse_error?: string | null;
          parsed_text?: string | null;
          parser_version?: string | null;
          parsing_status?: string;
          storage_path?: string;
          student_id?: string;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_cvs_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_cvs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_cvs_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_profiles: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          current_company: string | null;
          current_ctc: number | null;
          current_designation: string | null;
          current_employment_status: string | null;
          enrollment_id: string;
          expected_ctc: number | null;
          first_name: string | null;
          github_url: string | null;
          graduation_year: number | null;
          headline: string | null;
          highest_qualification: string | null;
          id: string;
          last_name: string | null;
          linkedin_url: string | null;
          notice_period_days: number | null;
          phone: string | null;
          portfolio_url: string | null;
          preferred_location_type: string | null;
          preferred_locations: Json | null;
          preferred_role: string | null;
          profile_completion: number | null;
          profile_status: string;
          specialization: string | null;
          state: string | null;
          summary: string | null;
          total_experience_months: number;
          updated_at: string;
          user_id: string;
          verification_source: string | null;
          verification_status: string;
          verified_at: string | null;
          willing_to_relocate: boolean | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          current_company?: string | null;
          current_ctc?: number | null;
          current_designation?: string | null;
          current_employment_status?: string | null;
          enrollment_id: string;
          expected_ctc?: number | null;
          first_name?: string | null;
          github_url?: string | null;
          graduation_year?: number | null;
          headline?: string | null;
          highest_qualification?: string | null;
          id?: string;
          last_name?: string | null;
          linkedin_url?: string | null;
          notice_period_days?: number | null;
          phone?: string | null;
          portfolio_url?: string | null;
          preferred_location_type?: string | null;
          preferred_locations?: Json | null;
          preferred_role?: string | null;
          profile_completion?: number | null;
          profile_status?: string;
          specialization?: string | null;
          state?: string | null;
          summary?: string | null;
          total_experience_months?: number;
          updated_at?: string;
          user_id: string;
          verification_source?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          willing_to_relocate?: boolean | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          current_company?: string | null;
          current_ctc?: number | null;
          current_designation?: string | null;
          current_employment_status?: string | null;
          enrollment_id?: string;
          expected_ctc?: number | null;
          first_name?: string | null;
          github_url?: string | null;
          graduation_year?: number | null;
          headline?: string | null;
          highest_qualification?: string | null;
          id?: string;
          last_name?: string | null;
          linkedin_url?: string | null;
          notice_period_days?: number | null;
          phone?: string | null;
          portfolio_url?: string | null;
          preferred_location_type?: string | null;
          preferred_locations?: Json | null;
          preferred_role?: string | null;
          profile_completion?: number | null;
          profile_status?: string;
          specialization?: string | null;
          state?: string | null;
          summary?: string | null;
          total_experience_months?: number;
          updated_at?: string;
          user_id?: string;
          verification_source?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          willing_to_relocate?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_skills: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          normalized_skill_name: string | null;
          proficiency: string | null;
          skill_name: string;
          source: string;
          student_id: string;
          updated_at: string;
          verified: boolean;
          years_experience: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          normalized_skill_name?: string | null;
          proficiency?: string | null;
          skill_name: string;
          source?: string;
          student_id: string;
          updated_at?: string;
          verified?: boolean;
          years_experience?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          normalized_skill_name?: string | null;
          proficiency?: string | null;
          skill_name?: string;
          source?: string;
          student_id?: string;
          updated_at?: string;
          verified?: boolean;
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_skills_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_candidate_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          reason: string | null;
          submission_candidate_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
          submission_candidate_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
          submission_candidate_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_candidate_status_histor_submission_candidate_id_fkey";
            columns: ["submission_candidate_id"];
            isOneToOne: false;
            referencedRelation: "submission_candidates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidate_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_candidates: {
        Row: {
          application_id: string;
          application_score_id: string | null;
          candidate_snapshot: Json;
          client_decision_at: string | null;
          created_at: string;
          current_mock_score: number | null;
          cv_id: string;
          id: string;
          status: string;
          student_id: string;
          submission_id: string;
          submitted_ats_score: number | null;
          submitted_match_score: number;
          submitted_mock_score: number | null;
          viewed_at: string | null;
        };
        Insert: {
          application_id: string;
          application_score_id?: string | null;
          candidate_snapshot: Json;
          client_decision_at?: string | null;
          created_at?: string;
          current_mock_score?: number | null;
          cv_id: string;
          id?: string;
          status?: string;
          student_id: string;
          submission_id: string;
          submitted_ats_score?: number | null;
          submitted_match_score: number;
          submitted_mock_score?: number | null;
          viewed_at?: string | null;
        };
        Update: {
          application_id?: string;
          application_score_id?: string | null;
          candidate_snapshot?: Json;
          client_decision_at?: string | null;
          created_at?: string;
          current_mock_score?: number | null;
          cv_id?: string;
          id?: string;
          status?: string;
          student_id?: string;
          submission_id?: string;
          submitted_ats_score?: number | null;
          submitted_match_score?: number;
          submitted_mock_score?: number | null;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submission_candidates_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidates_application_score_id_fkey";
            columns: ["application_score_id"];
            isOneToOne: false;
            referencedRelation: "application_scores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidates_cv_id_fkey";
            columns: ["cv_id"];
            isOneToOne: false;
            referencedRelation: "student_cvs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidates_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidates_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "analytics_submission_sla";
            referencedColumns: ["submission_id"];
          },
          {
            foreignKeyName: "submission_candidates_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "client_submission_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_candidates_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_recipients: {
        Row: {
          client_hr_user_id: string;
          created_at: string;
          id: string;
          notified_at: string | null;
          recipient_type: string;
          submission_id: string;
          viewed_at: string | null;
        };
        Insert: {
          client_hr_user_id: string;
          created_at?: string;
          id?: string;
          notified_at?: string | null;
          recipient_type?: string;
          submission_id: string;
          viewed_at?: string | null;
        };
        Update: {
          client_hr_user_id?: string;
          created_at?: string;
          id?: string;
          notified_at?: string | null;
          recipient_type?: string;
          submission_id?: string;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submission_recipients_client_hr_user_id_fkey";
            columns: ["client_hr_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_recipients_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "analytics_submission_sla";
            referencedColumns: ["submission_id"];
          },
          {
            foreignKeyName: "submission_recipients_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "client_submission_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_recipients_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          metadata: Json | null;
          new_status: string;
          old_status: string | null;
          reason: string | null;
          submission_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
          submission_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          metadata?: Json | null;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
          submission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_status_history_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "analytics_submission_sla";
            referencedColumns: ["submission_id"];
          },
          {
            foreignKeyName: "submission_status_history_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "client_submission_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_status_history_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          cancellation_reason: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          job_id: string;
          notes: string | null;
          reviewed_at: string | null;
          status: string;
          submission_code: string | null;
          submission_type: string;
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          cancellation_reason?: string | null;
          company_id: string;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          job_id: string;
          notes?: string | null;
          reviewed_at?: string | null;
          status?: string;
          submission_code?: string | null;
          submission_type?: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          cancellation_reason?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          job_id?: string;
          notes?: string | null;
          reviewed_at?: string | null;
          status?: string;
          submission_code?: string | null;
          submission_type?: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          role_id: string;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          role_id: string;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          new_status: string;
          old_status: string | null;
          reason: string | null;
          user_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
          user_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_status_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_assignments: {
        Row: {
          application_id: string;
          assigned_by: string | null;
          assigned_to: string;
          assignment_type: string;
          claimed_at: string;
          completed_at: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          status: string;
        };
        Insert: {
          application_id: string;
          assigned_by?: string | null;
          assigned_to: string;
          assignment_type?: string;
          claimed_at?: string;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          status?: string;
        };
        Update: {
          application_id?: string;
          assigned_by?: string | null;
          assigned_to?: string;
          assignment_type?: string;
          claimed_at?: string;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_assignments_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_assignments_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_comments: {
        Row: {
          application_id: string;
          comment: string;
          comment_type: string;
          created_at: string;
          created_by: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          comment: string;
          comment_type?: string;
          created_at?: string;
          created_by: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          comment?: string;
          comment_type?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_comments_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_comments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      analytics_feedback_sla: {
        Row: {
          application_id: string | null;
          company_id: string | null;
          completed_at: string | null;
          elapsed_hours: number | null;
          feedback_due_at: string | null;
          feedback_id: string | null;
          interview_id: string | null;
          sla_status: string | null;
          submitted_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interviews_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_placement_summary: {
        Row: {
          average_ctc_inr: number | null;
          closed: number | null;
          highest_ctc_inr: number | null;
          joined: number | null;
          placed_pending_joining: number | null;
          total_ctc_inr: number | null;
          total_placements: number | null;
        };
        Relationships: [];
      };
      analytics_submission_sla: {
        Row: {
          company_id: string | null;
          job_created_at: string | null;
          job_id: string | null;
          submission_id: string | null;
          submitted_at: string | null;
          turnaround_hours: number | null;
          within_24h: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      client_submission_summary: {
        Row: {
          candidate_count: number | null;
          company_id: string | null;
          id: string | null;
          job_id: string | null;
          new_candidate_count: number | null;
          status: string | null;
          submission_code: string | null;
          submitted_at: string | null;
          viewed_candidate_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_checklist_summary";
            referencedColumns: ["job_id"];
          },
          {
            foreignKeyName: "submissions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      job_checklist_summary: {
        Row: {
          approved_at: string | null;
          checklist_id: string | null;
          checklist_status: string | null;
          checklist_version: number | null;
          job_code: string | null;
          job_id: string | null;
          job_status: string | null;
          job_title: string | null;
        };
        Relationships: [];
      };
      student_mock_scorecards: {
        Row: {
          communication_score: number | null;
          domain_score: number | null;
          id: string | null;
          improvement_areas: string | null;
          mock_interview_id: string | null;
          overall_score: number | null;
          recommendation: string | null;
          strengths: string | null;
          student_visible_notes: string | null;
          submitted_at: string | null;
          technical_score: number | null;
        };
        Insert: {
          communication_score?: number | null;
          domain_score?: number | null;
          id?: string | null;
          improvement_areas?: string | null;
          mock_interview_id?: string | null;
          overall_score?: number | null;
          recommendation?: string | null;
          strengths?: string | null;
          student_visible_notes?: string | null;
          submitted_at?: string | null;
          technical_score?: number | null;
        };
        Update: {
          communication_score?: number | null;
          domain_score?: number | null;
          id?: string | null;
          improvement_areas?: string | null;
          mock_interview_id?: string | null;
          overall_score?: number | null;
          recommendation?: string | null;
          strengths?: string | null;
          student_visible_notes?: string | null;
          submitted_at?: string | null;
          technical_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_scorecards_mock_interview_id_fkey";
            columns: ["mock_interview_id"];
            isOneToOne: true;
            referencedRelation: "mock_interviews";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      approve_job_checklist: {
        Args: { p_checklist_id: string; p_user_id: string };
        Returns: undefined;
      };
      book_mock_slot: {
        Args: { p_application_id: string; p_slot_id: string };
        Returns: string;
      };
      cancel_client_interview: {
        Args: { p_interview_id: string; p_reason: string };
        Returns: undefined;
      };
      claim_application_processing_job: {
        Args: never;
        Returns: {
          application_id: string;
          attempts: number;
          completed_at: string | null;
          created_at: string;
          id: string;
          last_error: string | null;
          max_attempts: number;
          operation: string;
          scheduled_at: string;
          started_at: string | null;
          status: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "application_processing_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      claim_application_verification: {
        Args: { p_application_id: string; p_user_id: string };
        Returns: string;
      };
      client_decide_candidate: {
        Args: {
          p_decision: string;
          p_reason?: string;
          p_reason_code?: string;
          p_submission_candidate_id: string;
        };
        Returns: string;
      };
      close_placement: {
        Args: { p_placement_id: string; p_reason: string };
        Returns: undefined;
      };
      complete_application_scoring: {
        Args: {
          p_application_id: string;
          p_ats_score: number;
          p_changed_by: string;
          p_match_score: number;
          p_score_id: string;
        };
        Returns: undefined;
      };
      complete_client_interview: {
        Args: { p_interview_id: string };
        Returns: undefined;
      };
      complete_mock_interview: {
        Args: { p_mock_id: string; p_scorecard_id: string };
        Returns: undefined;
      };
      create_client_submission: {
        Args: {
          p_actor_id: string;
          p_application_ids: string[];
          p_job_id: string;
          p_notes?: string;
        };
        Returns: string;
      };
      get_client_company_analytics: { Args: never; Returns: Json };
      has_role: { Args: { requested_role: string }; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      mark_notification_failed: {
        Args: { p_error: string; p_outbox_id: string };
        Returns: undefined;
      };
      mark_notification_read: {
        Args: { p_notification_id: string };
        Returns: undefined;
      };
      mark_notification_sent: {
        Args: { p_outbox_id: string };
        Returns: undefined;
      };
      mark_placement_joined: {
        Args: { p_joined_at?: string; p_placement_id: string };
        Returns: undefined;
      };
      recover_stuck_notifications: { Args: never; Returns: number };
      register_offer: {
        Args: {
          p_annual_ctc: number;
          p_application_id: string;
          p_bucket_name: string;
          p_currency: string;
          p_department: string;
          p_designation: string;
          p_employment_type: string;
          p_feedback_id: string;
          p_file_hash: string;
          p_file_size: number;
          p_joining_date: string;
          p_joining_location: string;
          p_mime_type: string;
          p_notes: string;
          p_notice_buyout_available: boolean;
          p_offer_date: string;
          p_offer_valid_until: string;
          p_original_file_name: string;
          p_probation_period_months: number;
          p_storage_path: string;
        };
        Returns: string;
      };
      reschedule_client_interview: {
        Args: {
          p_interview_id: string;
          p_new_location: string;
          p_new_meeting_link: string;
          p_new_meeting_provider: string;
          p_new_mode: string;
          p_new_scheduled_at: string;
          p_new_timezone: string;
          p_reason: string;
        };
        Returns: undefined;
      };
      schedule_client_interview: {
        Args: {
          p_duration_minutes: number;
          p_instructions: string;
          p_interview_type: string;
          p_location: string;
          p_meeting_link: string;
          p_meeting_provider: string;
          p_mode: string;
          p_round_name: string;
          p_round_number: number;
          p_scheduled_at: string;
          p_submission_candidate_id: string;
          p_timezone: string;
        };
        Returns: string;
      };
      set_primary_student_cv: {
        Args: { p_cv_id: string; p_student_id: string };
        Returns: undefined;
      };
      student_decide_offer: {
        Args: { p_decision: string; p_offer_id: string; p_reason?: string };
        Returns: string;
      };
      submit_interview_feedback: {
        Args: {
          p_comments?: string;
          p_decision: string;
          p_interview_id: string;
          p_rating: number;
          p_reason_code?: string;
          p_visible_to_student?: boolean;
        };
        Returns: string;
      };
      verify_application: {
        Args: { p_actor_id: string; p_application_id: string; p_notes: string };
        Returns: undefined;
      };
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

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
