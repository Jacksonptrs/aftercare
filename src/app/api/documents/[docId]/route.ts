import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { docId } = await params
  const { data: doc } = await supabase.from('documents').select('*').eq('id', docId).single()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data } = await supabase.storage.from('estate-documents').createSignedUrl(doc.file_path, 60)
  return NextResponse.json({ url: data.signedUrl })
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { docId } = await params
  const { estate_id } = await request.json()
  const { data: member } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()
  if (!member || (member.role !== 'owner' && member.role !== 'executor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data: doc } = await supabase.from('documents').select('file_path').eq('id', docId).single()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await supabase.storage.from('estate-documents').remove([doc.file_path])
  await supabase.from('documents').delete().eq('id', docId)
  return NextResponse.json({ success: true })
}