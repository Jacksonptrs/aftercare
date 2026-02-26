const fs = require('fs');

const docRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { NextResponse, NextRequest } from 'next/server'",
  "",
  "export async function GET(request: NextRequest, { params }: { params: Promise<{ docId: string }> }) {",
  "  const supabase = await createClient()",
  "  const { data: { user } } = await supabase.auth.getUser()",
  "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
  "  const { docId } = await params",
  "  const { data: doc } = await supabase.from('documents').select('*').eq('id', docId).single()",
  "  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })",
  "  const { data } = await supabase.storage.from('estate-documents').createSignedUrl(doc.file_path, 60)",
  "  return NextResponse.json({ url: data?.signedUrl })",
  "}",
  "",
  "export async function DELETE(request: NextRequest, { params }: { params: Promise<{ docId: string }> }) {",
  "  const supabase = await createClient()",
  "  const { data: { user } } = await supabase.auth.getUser()",
  "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
  "  const { docId } = await params",
  "  const { estate_id } = await request.json()",
  "  const { data: member } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()",
  "  if (!member || (member.role !== 'owner' && member.role !== 'executor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })",
  "  const { data: doc } = await supabase.from('documents').select('file_path').eq('id', docId).single()",
  "  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })",
  "  await supabase.storage.from('estate-documents').remove([doc.file_path])",
  "  await supabase.from('documents').delete().eq('id', docId)",
  "  return NextResponse.json({ success: true })",
  "}"
].join('\n');

const uploadRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { NextResponse, NextRequest } from 'next/server'",
  "",
  "export async function POST(request: NextRequest) {",
  "  const supabase = await createClient()",
  "  const { data: { user } } = await supabase.auth.getUser()",
  "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
  "  const formData = await request.formData()",
  "  const file = formData.get('file') as File",
  "  const estate_id = formData.get('estate_id') as string",
  "  const category_id = formData.get('category_id') as string || null",
  "  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })",
  "  const bytes = await file.arrayBuffer()",
  "  const buffer = Buffer.from(bytes)",
  "  const ext = file.name.split('.').pop()",
  "  const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext",
  "  const filePath = estate_id + '/' + fileName",
  "  const { error: uploadError } = await supabase.storage.from('estate-documents').upload(filePath, buffer, { contentType: file.type })",
  "  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })",
  "  const { data: doc, error: dbError } = await supabase.from('documents').insert({",
  "    estate_id,",
  "    category_id: category_id || null,",
  "    name: file.name,",
  "    file_path: filePath,",
  "    file_type: file.type,",
  "    file_size: file.size,",
  "    uploaded_by: user.id",
  "  }).select('*, profiles(full_name)').single()",
  "  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })",
  "  return NextResponse.json(doc)",
  "}"
].join('\n');

const membersRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { createClient as createAdminClient } from '@supabase/supabase-js'",
  "import { NextResponse, NextRequest } from 'next/server'",
  "",
  "export async function POST(request: NextRequest) {",
  "  const supabase = await createClient()",
  "  const { data: { user } } = await supabase.auth.getUser()",
  "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
  "  const { estate_id, email, role } = await request.json()",
  "  const { data: currentMember } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()",
  "  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'executor')) {",
  "    return NextResponse.json({ error: 'Only owners and executors can invite members' }, { status: 403 })",
  "  }",
  "  const { data: existing } = await supabase.from('estate_members').select('id').eq('estate_id', estate_id).eq('email', email).single()",
  "  if (existing) return NextResponse.json({ error: 'This person has already been invited' }, { status: 400 })",
  "  const { error: insertError } = await supabase.from('estate_members').insert({",
  "    estate_id,",
  "    email,",
  "    role,",
  "    invited_by: user.id,",
  "    status: 'invited'",
  "  })",
  "  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })",
  "  const adminClient = createAdminClient(",
  "    process.env.NEXT_PUBLIC_SUPABASE_URL!,",
  "    process.env.SUPABASE_SERVICE_ROLE_KEY!",
  "  )",
  "  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {",
  "    redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/accept-invite'",
  "  })",
  "  if (inviteError && !inviteError.message.includes('already registered')) {",
  "    return NextResponse.json({ error: inviteError.message }, { status: 500 })",
  "  }",
  "  return NextResponse.json({ success: true })",
  "}"
].join('\n');

const tasksRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { NextResponse, NextRequest } from 'next/server'",
  "",
  "export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {",
  "  const supabase = await createClient()",
  "  const { data: { user } } = await supabase.auth.getUser()",
  "  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
  "  const { taskId } = await params",
  "  const { status, estate_id } = await request.json()",
  "  const { data: member } = await supabase.from('estate_members').select('role').eq('estate_id', estate_id).eq('user_id', user.id).eq('status', 'active').single()",
  "  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })",
  "  const update: Record<string, unknown> = { status }",
  "  if (status === 'done') update.completed_at = new Date().toISOString()",
  "  if (status === 'todo') update.completed_at = null",
  "  const { data, error } = await supabase.from('tasks').update(update).eq('id', taskId).select().single()",
  "  if (error) return NextResponse.json({ error: error.message }, { status: 500 })",
  "  return NextResponse.json(data)",
  "}"
].join('\n');

fs.writeFileSync('src/app/api/documents/[docId]/route.ts', docRoute);
fs.writeFileSync('src/app/api/documents/route.ts', uploadRoute);
fs.writeFileSync('src/app/api/members/route.ts', membersRoute);
fs.writeFileSync('src/app/api/tasks/[taskId]/route.ts', tasksRoute);
console.log('All done!');
console.log('docRoute: ' + fs.statSync('src/app/api/documents/[docId]/route.ts').size);
console.log('uploadRoute: ' + fs.statSync('src/app/api/documents/route.ts').size);
console.log('membersRoute: ' + fs.statSync('src/app/api/members/route.ts').size);
console.log('tasksRoute: ' + fs.statSync('src/app/api/tasks/[taskId]/route.ts').size);
