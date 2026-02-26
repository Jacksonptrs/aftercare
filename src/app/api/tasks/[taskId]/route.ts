import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { taskId } = await params
  const { status, estate_id } = await request.json()
  const { data: member } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const update = { status }
  if (status === 'done') update.completed_at = new Date().toISOString()
  if (status === 'todo') update.completed_at = null
  const { data, error } = await supabase.from('tasks').update(update).eq('id', taskId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}