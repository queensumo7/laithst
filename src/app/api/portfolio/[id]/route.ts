import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.enum(['competition', 'private', 'reel']).optional(),
  image_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().optional(),
  alt_text: z.string().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    const { data: item, error } = await supabase
      .from('portfolio_items')
      .update(data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ item })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseAdminClient()

    // Get item first to delete from storage
    const { data: item } = await supabase
      .from('portfolio_items')
      .select('storage_path')
      .eq('id', params.id)
      .single()

    if (item?.storage_path) {
      await supabase.storage.from('portfolio').remove([item.storage_path])
    }

    const { error } = await supabase.from('portfolio_items').delete().eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
