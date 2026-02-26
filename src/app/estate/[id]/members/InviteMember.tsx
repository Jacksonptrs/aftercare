'use client'

import { useState } from 'react'

export default function InviteMember({ estateId, canInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('family')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  if (!canInvite) {
    return (
      <div className='bg-white border border-stone-200 rounded-xl p-5'>
        <p className='text-sm text-stone-500'>Only the owner or executor can invite new members.</p>
      </div>
    )
  }

  async function handleInvite() {
    setLoading(true)
    setError(null)
    setSuccess(false)
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estate_id: estateId, email, role })
    })
    if (res.ok) {
      setSuccess(true)
      setEmail('')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className='bg-white border border-stone-200 rounded-xl p-5'>
      <h3 className='font-medium text-stone-800 mb-4'>Invite a Member</h3>
      <div className='space-y-3'>
        <div>
          <label className='block text-xs font-medium text-stone-600 mb-1'>Email address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type='email' placeholder='jane@example.com' className='w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400' />
        </div>
        <div>
          <label className='block text-xs font-medium text-stone-600 mb-1'>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className='w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400'>
            <option value='family'>Family</option>
            <option value='executor'>Executor</option>
            <option value='advisor'>Advisor</option>
          </select>
        </div>
        {error && <p className='text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2'>{error}</p>}
        {success && <p className='text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2'>Invitation sent!</p>}
        <button onClick={handleInvite} disabled={loading || !email} className='w-full bg-stone-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50'>
          {loading ? 'Sending...' : 'Send Invite'}
        </button>
      </div>
    </div>
  )
}