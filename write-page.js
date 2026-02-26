const fs = require('fs');
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const code = `import { redirect } from 'next/navigation'

export default async function EstateOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    const { data: estate } = await supabase.from('estates').select('*').eq('id', id).single()
    if (!estate) redirect('/dashboard')
    const { data: tasks } = await supabase.from('tasks').select('*, categories(name, icon)').eq('estate_id', id).order('created_at', { ascending: true })
    const { data: members } = await supabase.from('estate_members').select('*, profiles(full_name)').eq('estate_id', id).eq('status', 'active')
    const totalTasks = tasks?.length ?? 0
    const doneTasks = tasks?.filter(t => t.status === 'done').length ?? 0
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const tasksByCategory: Record<string, any[]> = {}
    tasks?.forEach(task => {
        const catName = task.categories?.name ?? 'General'
        if (!tasksByCategory[catName]) tasksByCategory[catName] = []
        tasksByCategory[catName].push(task)
    })
    return (
        <main className='min-h-screen bg-stone-50'>
            <header className='bg-white border-b border-stone-200 px-6 py-4'>
                <div className='max-w-5xl mx-auto flex items-center gap-4'>
                    <Link href='/dashboard' className='text-stone-400 hover:text-stone-600 text-sm'>← Dashboard</Link>
                    <div className='flex items-center gap-2'>
                        <span className='text-xl'>🕊️</span>
                        <span className='text-lg font-semibold text-stone-800'>AfterCare</span>
                    </div>
                </div>
            </header>
            <div className='max-w-5xl mx-auto px-6 py-10'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-semibold text-stone-800'>{estate.deceased_name}</h1>
                    <p className='text-stone-500 mt-1'>{estate.name}</p>
                </div>
                <div className='bg-white border border-stone-200 rounded-xl p-6 mb-6'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-sm font-medium text-stone-700'>Overall Progress</span>
                        <span className='text-sm text-stone-500'>{doneTasks} of {totalTasks} tasks complete</span>
                    </div>
                    <div className='w-full bg-stone-100 rounded-full h-3'>
                        <div className='bg-stone-800 h-3 rounded-full transition-all' style={{ width: progress + '%' }} />
                    </div>
                    <p className='text-right text-sm text-stone-500 mt-2'>{progress}%</p>
                </div>
                <div className='flex gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit'>
                    <span className='px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium'>Overview</span>
                    <Link href={'/estate/' + id + '/tasks'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors'>Tasks</Link>
                    <Link href={'/estate/' + id + '/documents'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors'>Documents</Link>
                    <Link href={'/estate/' + id + '/members'} className='px-4 py-2 rounded-lg text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors'>Members</Link>
                </div>
                <div className='grid grid-cols-3 gap-6'>
                    <div className='col-span-2 space-y-4'>
                        {Object.entries(tasksByCategory).map(([category, catTasks]) => {
                            const catDone = catTasks.filter(t => t.status === 'done').length
                            return (
                                <div key={category} className='bg-white border border-stone-200 rounded-xl p-5'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div className='flex items-center gap-2'>
                                            <span>{catTasks[0]?.categories?.icon ?? '📋'}</span>
                                            <span className='font-medium text-stone-800'>{category}</span>
                                        </div>
                                        <span className='text-sm text-stone-400'>{catDone}/{catTasks.length}</span>
                                    </div>
                                    <div className='space-y-2'>
                                        {catTasks.slice(0, 3).map(task => (
                                            <div key={task.id} className='flex items-center gap-3'>
                                                <div className={'w-4 h-4 rounded-full border-2 flex-shrink-0 ' + (task.status === 'done' ? 'bg-stone-800 border-stone-800' : 'border-stone-300')} />
                                                <span className={'text-sm ' + (task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-700')}>{task.title}</span>
                                            </div>
                                        ))}
                                        {catTasks.length > 3 && (
                                            <Link href={'/estate/' + id + '/tasks'} className='text-xs text-stone-400 hover:text-stone-600 ml-7'>+{catTasks.length - 3} more tasks</Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='space-y-4'>
                        <div className='bg-white border border-stone-200 rounded-xl p-5'>
                            <h3 className='font-medium text-stone-800 mb-3'>Family Members</h3>
                            <div className='space-y-3'>
                                {members?.map(member => (
                                    <div key={member.id} className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-sm font-medium text-stone-700'>{member.profiles?.full_name ?? member.email}</p>
                                            <p className='text-xs text-stone-400 capitalize'>{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href={'/estate/' + id + '/members'} className='mt-4 block text-center text-sm text-stone-500 border border-stone-200 rounded-lg py-2 hover:bg-stone-50 transition-colors'>+ Invite member</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}`;

fs.writeFileSync('src/app/estate/[id]/overview/page.tsx', code);
console.log('Done! Size: ' + fs.statSync('src/app/estate/[id]/overview/page.tsx').size);