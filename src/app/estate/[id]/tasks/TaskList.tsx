'use client'

import { useState } from 'react'

export default function TaskList({ tasks, members, estateId, currentUserId }) {
  const [taskList, setTaskList] = useState(tasks)
  const [loading, setLoading] = useState(null)
  const [filter, setFilter] = useState('all')

  const total = taskList.length
  const done = taskList.filter(t => t.status === 'done').length

  const filtered = filter === 'all' ? taskList : filter === 'done' ? taskList.filter(t => t.status === 'done') : taskList.filter(t => t.status !== 'done')
  const filteredByCategory = {}
  filtered.forEach(task => {
    const cat = task.categories ? task.categories.name : 'General'
    if (!filteredByCategory[cat]) filteredByCategory[cat] = { icon: task.categories ? task.categories.icon : '📋', tasks: [] }
    filteredByCategory[cat].tasks.push(task)
  })

  async function toggleTask(task) {
    setLoading(task.id)
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const res = await fetch('/api/tasks/' + task.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, estate_id: estateId })
    })
    if (res.ok) {
      setTaskList(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    }
    setLoading(null)
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <p className='text-stone-500 text-sm'>{done} of {total} tasks complete</p>
        <div className='flex gap-2'>
          {['all', 'todo', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={'px-3 py-1.5 rounded-lg text-sm font-medium ' + (filter === f ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50')}>
              {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}
            </button>
          ))}
        </div>
      </div>
      <div className='space-y-6'>
        {Object.entries(filteredByCategory).map(([category, { icon, tasks: catTasks }]) => (
          <div key={category} className='bg-white border border-stone-200 rounded-xl overflow-hidden'>
            <div className='flex items-center justify-between px-5 py-4 border-b border-stone-100'>
              <div className='flex items-center gap-2'>
                <span>{icon}</span>
                <span className='font-medium text-stone-800'>{category}</span>
              </div>
              <span className='text-sm text-stone-400'>{catTasks.filter(t => t.status === 'done').length}/{catTasks.length}</span>
            </div>
            <div className='divide-y divide-stone-100'>
              {catTasks.map(task => (
                <div key={task.id} className='flex items-center gap-4 px-5 py-4 hover:bg-stone-50'>
                  <button onClick={() => toggleTask(task)} disabled={loading === task.id} className='flex-shrink-0'>
                    <div className={'w-5 h-5 rounded-full border-2 flex items-center justify-center ' + (task.status === 'done' ? 'bg-stone-800 border-stone-800' : 'border-stone-300 hover:border-stone-500')}>
                      {task.status === 'done' && <span className='text-white text-xs'>✓</span>}
                    </div>
                  </button>
                  <div className='flex-1'>
                    <p className={'text-sm font-medium ' + (task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800')}>{task.title}</p>
                  </div>
                  <span className={'text-xs px-2 py-1 rounded-full ' + (task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-stone-100 text-stone-500')}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}