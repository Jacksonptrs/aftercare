import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { estate_id, email, role } = await request.json()
  const { data: currentMember } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'executor')) {
    return NextResponse.json({ error: 'Only owners and executors can invite members' }, { status: 403 })
  }
  const { data: existing } = await supabase.from('estate_members').select('id').eq('estate_id', estate_id).eq('email', email).single()
  if (existing) return NextResponse.json({ error: 'This person has already been invited' }, { status: 400 })
  const { error: insertError } = await supabase.from('estate_members').insert({
    estate_id,
    email,
    role,
    invited_by: user.id,
    status: 'invited'
  })
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/accept-invite'
  })
  if (inviteError && !inviteError.message.includes('already registered')) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}