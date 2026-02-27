'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password'
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className='min-h-screen bg-stone-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='text-4xl mb-3'>🕊️</div>
          <h1 className='text-2xl font-semibold text-stone-800'>Reset your password</h1>
          <p className='text-stone-500 mt-1'>Enter your email and we'll send you a link</p>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-stone-200 p-8'>
          {sent ? (
            <div className='text-center'>
              <div className='text-4xl mb-4'>📬</div>
              <p className='text-stone-700 font-medium'>Check your email!</p>
              <p className='text-stone-500 text-sm mt-2'>We sent a password reset link to {email}</p>
              <Link href='/auth/login' className='mt-6 block text-center text-stone-500 text-sm hover:text-stone-800'>Back to login</Link>
            </div>
          ) : (
            <div className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type='email' placeholder='jane@example.com' className='w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400' />
              </div>
              {error && <p className='text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2'>{error}</p>}
              <button onClick={handleSubmit} disabled={loading || !email} className='w-full bg-stone-800 text-white py-3 rounded-lg font-medium hover:bg-stone-700 transition-colors disabled:opacity-50'>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <Link href='/auth/login' className='block text-center text-stone-500 text-sm hover:text-stone-800'>Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}