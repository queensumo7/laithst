import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const portfolioSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['competition', 'private', 'reel']),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
  storage_path: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
  alt_text: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let query = supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (featured === 'true') query = query.eq('is_featured', true)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ items: data })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = portfolioSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    const { data: item, error } = await supabase
      .from('portfolio_items')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ item }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Upload endpoint — handles multipart form data
export async function PUT(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filename)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filename,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
