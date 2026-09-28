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
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          priority: string
          publish_at: string
          target_batch_id: string | null
          target_department_id: string | null
          target_roles: Database["public"]["Enums"]["app_role"][] | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          publish_at?: string
          target_batch_id?: string | null
          target_department_id?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          publish_at?: string
          target_batch_id?: string | null
          target_department_id?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_target_batch_id_fkey"
            columns: ["target_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_marks: {
        Row: {
          id: string
          marked_at: string
          remarks: string | null
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          marked_at?: string
          remarks?: string | null
          session_id: string
          status?: string
          student_id: string
        }
        Update: {
          id?: string
          marked_at?: string
          remarks?: string | null
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          created_at: string
          id: string
          offering_id: string
          period: number | null
          session_date: string
          source: string
          taken_by: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          offering_id: string
          period?: number | null
          session_date: string
          source?: string
          taken_by?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          offering_id?: string
          period?: number | null
          session_date?: string
          source?: string
          taken_by?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      batches: {
        Row: {
          created_at: string
          current_semester: number
          end_year: number
          id: string
          name: string
          program_id: string
          start_year: number
        }
        Insert: {
          created_at?: string
          current_semester?: number
          end_year: number
          id?: string
          name: string
          program_id: string
          start_year: number
        }
        Update: {
          created_at?: string
          current_semester?: number
          end_year?: number
          id?: string
          name?: string
          program_id?: string
          start_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "batches_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      course_offerings: {
        Row: {
          academic_year: string
          batch_id: string | null
          capacity: number
          course_id: string
          created_at: string
          faculty_id: string | null
          id: string
          room: string | null
          section: string
          term: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          batch_id?: string | null
          capacity?: number
          course_id: string
          created_at?: string
          faculty_id?: string | null
          id?: string
          room?: string | null
          section?: string
          term?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          batch_id?: string | null
          capacity?: number
          course_id?: string
          created_at?: string
          faculty_id?: string | null
          id?: string
          room?: string | null
          section?: string
          term?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_offerings_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credits: number
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          program_id: string | null
          semester: number | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          program_id?: string | null
          semester?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          program_id?: string | null
          semester?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          established_year: number | null
          hod_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          established_year?: number | null
          hod_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          established_year?: number | null
          hod_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          enrolled_at: string
          id: string
          offering_id: string
          status: string
          student_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          offering_id: string
          status?: string
          student_id: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          offering_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_marks: {
        Row: {
          entered_at: string
          entered_by: string | null
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number | null
          remarks: string | null
          student_id: string
        }
        Insert: {
          entered_at?: string
          entered_by?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          remarks?: string | null
          student_id: string
        }
        Update: {
          entered_at?: string
          entered_by?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          remarks?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_marks_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_type: string
          id: string
          max_marks: number
          name: string
          offering_id: string
          updated_at: string
          weightage: number
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string
          id?: string
          max_marks?: number
          name: string
          offering_id: string
          updated_at?: string
          weightage?: number
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string
          id?: string
          max_marks?: number
          name?: string
          offering_id?: string
          updated_at?: string
          weightage?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_components: {
        Row: {
          amount: number
          id: string
          is_optional: boolean
          name: string
          structure_id: string
        }
        Insert: {
          amount?: number
          id?: string
          is_optional?: boolean
          name: string
          structure_id: string
        }
        Update: {
          amount?: number
          id?: string
          is_optional?: boolean
          name?: string
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_components_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          due_date: string | null
          id: string
          invoice_number: string
          issued_at: string
          status: string
          structure_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          status?: string
          structure_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          status?: string
          structure_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_invoices_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          id: string
          invoice_id: string
          method: string
          paid_at: string
          receipt_number: string
          recorded_by: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          id?: string
          invoice_id: string
          method?: string
          paid_at?: string
          receipt_number: string
          recorded_by?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          id?: string
          invoice_id?: string
          method?: string
          paid_at?: string
          receipt_number?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fee_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          batch_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          program_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          batch_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          program_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          batch_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          program_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          available_copies: number
          category: string | null
          cover_url: string | null
          created_at: string
          edition: string | null
          id: string
          isbn: string | null
          language: string | null
          publisher: string | null
          shelf_location: string | null
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author?: string | null
          available_copies?: number
          category?: string | null
          cover_url?: string | null
          created_at?: string
          edition?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          publisher?: string | null
          shelf_location?: string | null
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string | null
          available_copies?: number
          category?: string | null
          cover_url?: string | null
          created_at?: string
          edition?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          publisher?: string | null
          shelf_location?: string | null
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: []
      }
      library_loans: {
        Row: {
          book_id: string
          due_at: string
          fine_amount: number
          fine_paid: boolean
          id: string
          issued_at: string
          issued_by: string | null
          returned_at: string | null
          student_id: string
        }
        Insert: {
          book_id: string
          due_at: string
          fine_amount?: number
          fine_paid?: boolean
          id?: string
          issued_at?: string
          issued_by?: string | null
          returned_at?: string | null
          student_id: string
        }
        Update: {
          book_id?: string
          due_at?: string
          fine_amount?: number
          fine_paid?: boolean
          id?: string
          issued_at?: string
          issued_by?: string | null
          returned_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_applications: {
        Row: {
          applied_at: string
          drive_id: string
          id: string
          notes: string | null
          offer_letter_url: string | null
          offered_ctc: number | null
          status: string
          student_id: string
        }
        Insert: {
          applied_at?: string
          drive_id: string
          id?: string
          notes?: string | null
          offer_letter_url?: string | null
          offered_ctc?: number | null
          status?: string
          student_id: string
        }
        Update: {
          applied_at?: string
          drive_id?: string
          id?: string
          notes?: string | null
          offer_letter_url?: string | null
          offered_ctc?: number | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_applications_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "placement_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_companies: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      placement_drives: {
        Row: {
          company_id: string
          created_at: string
          ctc_lpa: number | null
          drive_date: string | null
          eligibility_cgpa: number | null
          eligible_branches: string[] | null
          id: string
          job_description: string | null
          job_title: string
          location: string | null
          registration_deadline: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          ctc_lpa?: number | null
          drive_date?: string | null
          eligibility_cgpa?: number | null
          eligible_branches?: string[] | null
          id?: string
          job_description?: string | null
          job_title: string
          location?: string | null
          registration_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          ctc_lpa?: number | null
          drive_date?: string | null
          eligibility_cgpa?: number | null
          eligible_branches?: string[] | null
          id?: string
          job_description?: string | null
          job_title?: string
          location?: string | null
          registration_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_drives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "placement_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          code: string
          created_at: string
          degree_type: string
          department_id: string
          duration_years: number
          id: string
          name: string
          total_semesters: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          degree_type: string
          department_id: string
          duration_years?: number
          id?: string
          name: string
          total_semesters?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          degree_type?: string
          department_id?: string
          duration_years?: number
          id?: string
          name?: string
          total_semesters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          admission_date: string
          attendance_pct: number | null
          batch_id: string | null
          blood_group: string | null
          category: string | null
          cgpa: number | null
          city: string | null
          created_at: string
          created_by: string | null
          current_semester: number | null
          date_of_birth: string | null
          department_id: string | null
          email: string
          enrollment_no: string
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relation: string | null
          id: string
          last_name: string
          nationality: string | null
          phone: string | null
          photo_url: string | null
          pincode: string | null
          program_id: string | null
          roll_no: string | null
          state: string | null
          status: Database["public"]["Enums"]["student_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          admission_date?: string
          attendance_pct?: number | null
          batch_id?: string | null
          blood_group?: string | null
          category?: string | null
          cgpa?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          current_semester?: number | null
          date_of_birth?: string | null
          department_id?: string | null
          email: string
          enrollment_no: string
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          last_name: string
          nationality?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          program_id?: string | null
          roll_no?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          admission_date?: string
          attendance_pct?: number | null
          batch_id?: string | null
          blood_group?: string | null
          category?: string | null
          cgpa?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          current_semester?: number | null
          date_of_birth?: string | null
          department_id?: string | null
          email?: string
          enrollment_no?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          last_name?: string
          nationality?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          program_id?: string | null
          roll_no?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          offering_id: string
          room: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          offering_id: string
          room?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          offering_id?: string
          room?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      current_user_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "principal"
        | "hod"
        | "faculty"
        | "student"
        | "parent"
        | "accountant"
        | "librarian"
        | "placement_officer"
      gender: "male" | "female" | "other"
      student_status:
        | "active"
        | "inactive"
        | "graduated"
        | "dropped"
        | "suspended"
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
      app_role: [
        "super_admin",
        "principal",
        "hod",
        "faculty",
        "student",
        "parent",
        "accountant",
        "librarian",
        "placement_officer",
      ],
      gender: ["male", "female", "other"],
      student_status: [
        "active",
        "inactive",
        "graduated",
        "dropped",
        "suspended",
      ],
    },
  },
} as const
