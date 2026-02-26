import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import InviteMember from './InviteMember'

export default async function MembersPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: estate } = await supabase.from('estates').select('*').eq('id', id).single()
  if (!estate) redirect('/dashboard')
  const { data: members, error: membersError } = await supabase.from('estate_members').select('*, profiles!estate_members_user_id_fkey(full_name)').eq('estate_id', id).order('invited_at', { ascending: true })
  console.log('members:', JSON.stringify(members))
  console.log('membersError:', JSON.stringify(membersError))
  const currentMember = members ? members.find(m => m.user_id === user.id) : null
  const canInvite = currentMember && (currentMember.role === 'owner' || currentMember.role === 'executor')
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
          <Link href={'/estate/' + id + '/tasks'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100'>Tasks</Link>
          <Link href={'/estate/' + id + '/documents'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100'>Documents</Link>
          <span className='px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium'>Members</span>
        </div>
        <div className='grid grid-cols-3 gap-6'>
          <div className='col-span-2'>
            <div className='bg-white border border-stone-200 rounded-xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-stone-100'>
                <h2 className='font-medium text-stone-800'>Family Members</h2>
              </div>
              <div className='divide-y divide-stone-100'>
                {members && members.map(member => (
                  <div key={member.id} className='flex items-center justify-between px-5 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium text-sm'>
                        {member.profiles ? member.profiles.full_name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-stone-800'>{member.profiles ? member.profiles.full_name : member.email}</p>
                        <p className='text-xs text-stone-400'>{member.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (member.role === 'owner' ? 'bg-stone-800 text-white' : member.role === 'executor' ? 'bg-blue-100 text-blue-700' : member.role === 'advisor' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600')}>
                        {member.role}
                      </span>
                      <span className={'text-xs px-2 py-1 rounded-full ' + (member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                        {member.status === 'active' ? 'Active' : 'Invited'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <InviteMember estateId={id} canInvite={canInvite} />
          </div>
        </div>
      </div>
    </main>
  )
}