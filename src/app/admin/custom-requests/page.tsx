import { adminDb } from '@/lib/supabase/admin'
import { CustomRequestsClient } from '@/components/admin/CustomRequestsClient'

async function getRequests() {
  const { data } = await adminDb()
    .from('contact_messages')
    .select('id, name, email, phone, subject, message, metadata, is_read, created_at')
    .eq('subject', 'custom-order')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminCustomRequestsPage() {
  const requests = await getRequests().catch(() => [])
  const unread = requests.filter((r) => !r.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-brand-cream">Custom Orders</h1>
        {unread > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold">
            {unread} new
          </span>
        )}
      </div>
      <CustomRequestsClient requests={requests} />
    </div>
  )
}
