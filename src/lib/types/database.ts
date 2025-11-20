export interface Database {
    public: {
        Tables: {
            couples: {
                Row: {
                    id: string
                    user_id: string
                    couple_slug: string
                    partner1_name: string
                    partner2_name: string
                    wedding_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    couple_slug: string
                    partner1_name: string
                    partner2_name: string
                    wedding_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    couple_slug?: string
                    partner1_name?: string
                    partner2_name?: string
                    wedding_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            guests: {
                Row: {
                    id: string
                    couple_id: string
                    name: string
                    phone: string
                    email: string | null
                    group_name: string | null
                    invite_status: 'pending' | 'sent' | 'viewed'
                    invite_sent_at: string | null
                    invite_viewed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    name: string
                    phone: string
                    email?: string | null
                    group_name?: string | null
                    invite_status?: 'pending' | 'sent' | 'viewed'
                    invite_sent_at?: string | null
                    invite_viewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    name?: string
                    phone?: string
                    email?: string | null
                    group_name?: string | null
                    invite_status?: 'pending' | 'sent' | 'viewed'
                    invite_sent_at?: string | null
                    invite_viewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            vendor_contacts: {
                Row: {
                    id: string
                    couple_id: string
                    name: string
                    phone: string
                    email: string | null
                    category: 'decorator' | 'event_coordinator' | 'hall_manager' | 'transport' | 'photographer' | 'caterer'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    name: string
                    phone: string
                    email?: string | null
                    category: 'decorator' | 'event_coordinator' | 'hall_manager' | 'transport' | 'photographer' | 'caterer'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    name?: string
                    phone?: string
                    email?: string | null
                    category?: 'decorator' | 'event_coordinator' | 'hall_manager' | 'transport' | 'photographer' | 'caterer'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            event_details: {
                Row: {
                    id: string
                    couple_id: string
                    couple_intro: string | null
                    events: any[]
                    venues: any[]
                    timeline: any[]
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    couple_intro?: string | null
                    events?: any[]
                    venues?: any[]
                    timeline?: any[]
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    couple_intro?: string | null
                    events?: any[]
                    venues?: any[]
                    timeline?: any[]
                    updated_at?: string
                }
            }
            photo_collections: {
                Row: {
                    id: string
                    couple_id: string
                    drive_folder_url: string
                    categories: any[]
                    highlight_photos: any[]
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    drive_folder_url: string
                    categories?: any[]
                    highlight_photos?: any[]
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    drive_folder_url?: string
                    categories?: any[]
                    highlight_photos?: any[]
                    updated_at?: string
                }
            }
            gift_settings: {
                Row: {
                    id: string
                    couple_id: string
                    upi_id: string | null
                    qr_code_url: string | null
                    custom_message: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    upi_id?: string | null
                    qr_code_url?: string | null
                    custom_message?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    upi_id?: string | null
                    qr_code_url?: string | null
                    custom_message?: string | null
                    updated_at?: string
                }
            }
            todo_tasks: {
                Row: {
                    id: string
                    couple_id: string
                    title: string
                    description: string | null
                    category: string
                    completed: boolean
                    due_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    title: string
                    description?: string | null
                    category: string
                    completed?: boolean
                    due_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    completed?: boolean
                    due_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Additional type definitions for application use
export type Couple = Database['public']['Tables']['couples']['Row']
export type Guest = Database['public']['Tables']['guests']['Row']
export type VendorContact = Database['public']['Tables']['vendor_contacts']['Row']
export type EventDetails = Database['public']['Tables']['event_details']['Row']
export type PhotoCollection = Database['public']['Tables']['photo_collections']['Row']
export type GiftSettings = Database['public']['Tables']['gift_settings']['Row']
export type TodoTask = Database['public']['Tables']['todo_tasks']['Row']

export type InsertCouple = Database['public']['Tables']['couples']['Insert']
export type InsertGuest = Database['public']['Tables']['guests']['Insert']
export type InsertVendorContact = Database['public']['Tables']['vendor_contacts']['Insert']
export type InsertEventDetails = Database['public']['Tables']['event_details']['Insert']
export type InsertPhotoCollection = Database['public']['Tables']['photo_collections']['Insert']
export type InsertGiftSettings = Database['public']['Tables']['gift_settings']['Insert']
export type InsertTodoTask = Database['public']['Tables']['todo_tasks']['Insert']

export type UpdateCouple = Database['public']['Tables']['couples']['Update']
export type UpdateGuest = Database['public']['Tables']['guests']['Update']
export type UpdateVendorContact = Database['public']['Tables']['vendor_contacts']['Update']
export type UpdateEventDetails = Database['public']['Tables']['event_details']['Update']
export type UpdatePhotoCollection = Database['public']['Tables']['photo_collections']['Update']
export type UpdateGiftSettings = Database['public']['Tables']['gift_settings']['Update']
export type UpdateTodoTask = Database['public']['Tables']['todo_tasks']['Update']