'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEstate(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in' }

  const deceased_name = formData.get('deceased_name') as string
  const name = formData.get('name') as string
  const deceased_dob = formData.get('deceased_dob') as string || null
  const deceased_dod = formData.get('deceased_dod') as string

  const { data: estate, error } = await supabase
    .from('estates')
    .insert({
      name,
      deceased_name,
      deceased_dob: deceased_dob || null,
      deceased_dod,
      created_by: user.id
    })
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/estate/${estate.id}/overview`)
}

