'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const partner1Name = formData.get('partner1Name') as string
    const partner2Name = formData.get('partner2Name') as string
    const weddingDate = formData.get('weddingDate') as string

    const supabase = await createClient()

    // Generate couple slug
    const generateSlug = (name1: string, name2: string) => {
        const slug = `${name1.toLowerCase().replace(/\s+/g, '-')}-${name2.toLowerCase().replace(/\s+/g, '-')}-${new Date().getFullYear()}`
        return slug.replace(/[^a-z0-9-]/g, '')
    }

    try {
        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            return { error: authError.message }
        }

        if (authData.user) {
            // Wait a moment for the session to be established
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Create couple record
            const coupleSlug = generateSlug(partner1Name, partner2Name)
            const { error: coupleError } = await supabase
                .from('couples')
                .insert({
                    user_id: authData.user.id,
                    couple_slug: coupleSlug,
                    partner1_name: partner1Name,
                    partner2_name: partner2Name,
                    wedding_date: weddingDate || null,
                })

            if (coupleError) {
                return { error: 'Failed to create couple profile: ' + coupleError.message }
            }

            return { success: 'Account created successfully! Please check your email to verify your account.' }
        }
    } catch (err) {
        return { error: 'An unexpected error occurred' }
    }
}