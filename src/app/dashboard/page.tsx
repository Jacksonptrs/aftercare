import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: estates } = await supabase
        .from('estates')
        .select(`
            id,
            name,
            deceased_name,
            deceased_dod,
            status,
            estate_members!inner(role)
        `)
        .eq('estate_members.user_id', user.id)
        .eq('estate_members.status', 'active')
        .order('created_at', { ascending: false })

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

    return (
        <main className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🕊️</span>
                        <span className="text-lg font-semibold text-stone-800">AfterCare</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-stone-500 text-sm">Hi, {firstName}</span>
                        <form action="/auth/signout" method="post">
                            <button className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Page title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-stone-800">Your Estates</h1>
                        <p className="text-stone-500 mt-1">Manage and track everything in one place</p>
                    </div>
                    <Link
                        href="/dashboard/new-estate"
                        className="bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
                    >
                        + New Estate
                    </Link>
                </div>

                {/* Estate list */}
                {estates && estates.length > 0 ? (
                    <div className="grid gap-4">
                        {estates.map((estate: any) => (
                            <Link
                                key={estate.id}
                                href={`/estate/${estate.id}/overview`}
                                className="bg-white border border-stone-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-medium text-stone-800">{estate.deceased_name}</h2>
                                        <p className="text-stone-500 text-sm mt-1">{estate.name}</p>
                                        {estate.deceased_dod && (
                                            <p className="text-stone-400 text-sm mt-1">
                                                Passed {new Date(estate.deceased_dod).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                            estate.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-stone-100 text-stone-500'
                                        }`}>
                                            {estate.status === 'active' ? 'Active' : 'Closed'}
                                        </span>
                                        <span className="text-stone-400 text-sm capitalize">
                                            {estate.estate_members[0]?.role}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // Empty state
                    <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                        <div className="text-5xl mb-4">🕊️</div>
                        <h2 className="text-xl font-medium text-stone-800 mb-2">No estates yet</h2>
                        <p className="text-stone-500 mb-6 max-w-sm mx-auto">
                            Create an estate to start organizing tasks, documents, and coordinating with family.
                        </p>
                        <Link
                            href="/dashboard/new-estate"
                            className="bg-stone-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
                        >
                            Create your first estate
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}

