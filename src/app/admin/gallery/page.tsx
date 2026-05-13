import { adminDb } from '@/lib/supabase/admin'
import { GalleryAdmin } from '@/components/admin/GalleryAdmin'

async function getImages() {
  const { data } = await adminDb()
    .from('gallery_images')
    .select('id, url, alt, sort_order, is_active')
    .order('sort_order')
  return data ?? []
}

export default async function AdminGalleryPage() {
  const images = await getImages().catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-cream">Gallery</h1>
        <p className="text-xs text-brand-gold/40">{images.length} image{images.length !== 1 ? 's' : ''}</p>
      </div>
      <GalleryAdmin initialImages={images} />
    </div>
  )
}
