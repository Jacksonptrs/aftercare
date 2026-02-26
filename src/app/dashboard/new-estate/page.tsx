import Link from 'next/link'
import { createEstate } from './actions'

export default function NewEstatePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-600 transition-colors">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕊️</span>
            <span className="text-lg font-semibold text-stone-800">AfterCare</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800">Create a new estate</h1>
          <p className="text-stone-500 mt-1">
            We'll set up a checklist of tasks and a document library to help you get started.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-8">
          <form action={createEstate} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Full name of the deceased
              </label>
              <input
                name="deceased_name"
                type="text"
                required
                placeholder="e.g. John Smith"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Estate name
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. The Estate of John Smith"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <p className="text-stone-400 text-xs mt-1">This is the official name used for legal and financial purposes</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date of birth
                </label>
                <input
                  name="deceased_dob"
                  type="date"
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date of passing <span className="text-red-400">*</span>
                </label>
                <input
                  name="deceased_dod"
                  type="date"
                  required
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-800 text-white py-3 rounded-lg font-medium hover:bg-stone-700 transition-colors"
            >
              Create estate
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}