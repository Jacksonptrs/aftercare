'use client'

import { useState, useRef } from 'react'

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function DocumentList({ documents, categories, estateId, userId }) {
  const [docs, setDocs] = useState(documents)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const fileRef = useRef(null)

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('estate_id', estateId)
    formData.append('category_id', selectedCategory)
    const res = await fetch('/api/documents', { method: 'POST', body: formData })
    if (res.ok) {
      const newDoc = await res.json()
      setDocs(prev => [newDoc, ...prev])
    } else {
      const data = await res.json()
      setError(data.error || 'Upload failed')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDownload(doc) {
    const res = await fetch('/api/documents/' + doc.id)
    if (res.ok) {
      const { url } = await res.json()
      window.open(url, '_blank')
    }
  }

  async function handleDelete(doc) {
    if (!confirm('Delete this document?')) return
    const res = await fetch('/api/documents/' + doc.id, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estate_id: estateId }) })
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  function getFileIcon(type) {
    if (!type) return '📄'
    if (type.includes('pdf')) return '📕'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    return '📄'
  }

  return (
    <div>
      <div className='bg-white border border-stone-200 rounded-xl p-5 mb-6'>
        <h3 className='font-medium text-stone-800 mb-4'>Upload Document</h3>
        <div className='flex gap-3 items-end'>
          <div className='flex-1'>
            <label className='block text-xs font-medium text-stone-600 mb-1'>Category (optional)</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className='w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400'>
              <option value=''>No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <input ref={fileRef} type='file' onChange={handleUpload} className='hidden' id='file-upload' />
            <label htmlFor='file-upload' className={'cursor-pointer bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors ' + (uploading ? 'opacity-50 pointer-events-none' : '')}>
              {uploading ? 'Uploading...' : '+ Upload File'}
            </label>
          </div>
        </div>
        {error && <p className='text-red-600 text-xs mt-2'>{error}</p>}
      </div>
      {docs.length === 0 ? (
        <div className='bg-white border border-stone-200 rounded-xl p-12 text-center'>
          <div className='text-4xl mb-3'>📁</div>
          <p className='text-stone-500'>No documents uploaded yet</p>
        </div>
      ) : (
        <div className='bg-white border border-stone-200 rounded-xl overflow-hidden'>
          <div className='px-5 py-4 border-b border-stone-100'>
            <h3 className='font-medium text-stone-800'>{docs.length} Document{docs.length !== 1 ? 's' : ''}</h3>
          </div>
          <div className='divide-y divide-stone-100'>
            {docs.map(doc => (
              <div key={doc.id} className='flex items-center gap-4 px-5 py-4 hover:bg-stone-50'>
                <span className='text-2xl'>{getFileIcon(doc.file_type)}</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-stone-800 truncate'>{doc.name}</p>
                  <p className='text-xs text-stone-400'>{formatBytes(doc.file_size)} · {formatDate(doc.created_at)} · {doc.profiles ? doc.profiles.full_name : 'Unknown'}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <button onClick={() => handleDownload(doc)} className='text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50'>Download</button>
                  <button onClick={() => handleDelete(doc)} className='text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50'>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}