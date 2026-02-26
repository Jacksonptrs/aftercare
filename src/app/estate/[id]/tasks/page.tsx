import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TaskList from './TaskList'

export default async function TasksPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: estate } = await supabase.from('estates').select('*').eq('id', id).single()
  if (!estate) redirect('/dashboard')
  const { data: tasks } = await supabase.from('tasks').select('*, categories(name, icon)').eq('estate_id', id).order('created_at', { ascending: true })
  const { data: members } = await supabase.from('estate_members').select('user_id, profiles(full_name)').eq('estate_id', id).eq('status', 'active')
  return (
    <main className='min-h-screen bg-stone-50'>
      <header className='bg-white border-b border-stone-200 px-6 py-4'>
        <div className='max-w-5xl mx-auto flex items-center gap-4'>
          <Link href='/dashboard' className='text-stone-400 hover:text-stone-600 text-sm'>← Dashboard</Link>
          <span className='text-lg font-semibold text-stone-800'>🕊️ AfterCare</span>
        </div>
      </header>
      <div className='max-w-5xl mx-auto px-6 py-10'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-stone-800'>{estate.deceased_name}</h1>
          <p className='text-stone-500 mt-1'>{estate.name}</p>
        </div>
        <div className='flex gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit'>
          <Link href={'/estate/' + id + '/overview'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100'>Overview</Link>
          <span className='px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium'>Tasks</span>
          <Link href={'/estate/' + id + '/documents'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100'>Documents</Link>
          <Link href={'/estate/' + id + '/members'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100'>Members</Link>
        </div>
        <TaskList tasks={tasks || []} members={members || []} estateId={id} currentUserId={user.id} />
      </div>
    </main>
  )
}