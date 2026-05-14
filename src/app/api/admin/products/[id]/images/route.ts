import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

// POST /api/admin/products/[id]/images
// Accepts multipart/form-data with a `file` field + optional `altText`
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const productId = params.id

  // Parse multipart form
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const altText = (formData.get('altText') as string | null) ?? ''

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP and AVIF images are allowed' },
      { status: 400 }
    )
  }

  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
  }

  // Determine current max sort_order for this product
  const { data: existing } = await adminDb()
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder =
    existing?.[0]?.sort_order != null ? (existing[0].sort_order as number) + 1 : 0

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${productId}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await adminDb()
    .storage.from('product-images')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('[images] storage upload error', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Insert product_images row
  const { data: row, error: dbError } = await adminDb()
    .from('product_images')
    .insert({
      product_id: productId,
      storage_path: storagePath,
      alt_text: altText || null,
      sort_order: nextSortOrder,
    })
    .select('id, storage_path, alt_text, sort_order')
    .single()

  if (dbError || !row) {
    console.error('[images] db insert error', dbError)
    return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`

  return NextResponse.json(
    { id: row.id, url: publicUrl, storagePath, sortOrder: nextSortOrder },
    { status: 201 }
  )
}

// DELETE /api/admin/products/[id]/images?imageId=xxx
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const imageId = new URL(request.url).searchParams.get('imageId')
  if (!imageId) {
    return NextResponse.json({ error: 'imageId is required' }, { status: 400 })
  }

  // Get the storage path first
  const { data: img, error: fetchErr } = await adminDb()
    .from('product_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('product_id', params.id)
    .maybeSingle()

  if (fetchErr || !img) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Remove from storage
  await adminDb()
    .storage.from('product-images')
    .remove([img.storage_path as string])

  // Remove DB row
  await adminDb().from('product_images').delete().eq('id', imageId)

  return NextResponse.json({ success: true })
}
