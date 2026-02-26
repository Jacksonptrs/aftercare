import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  const estate_id = formData.get('estate_id')
  const category_id = formData.get('category_id') || null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
  const filePath = estate_id + '/' + fileName
  const { error: uploadError } = await supabase.storage.from('estate-documents').upload(filePath, buffer, { contentType: file.type })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
  const { data: doc, error: dbError } = await supabase.from('documents').insert({
    estate_id,
    category_id: category_id || null,
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: user.id
  }).select('*, profiles(full_name)').single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(doc)
}