import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendShootEmails, sendBrandEmails } from '@/lib/email'
import { z } from 'zod'

const shootSchema = z.object({
  type: z.literal('shoot'),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  shoot_type: z.string().min(1),
  preferred_date: z.string().optional(),
  location: z.string().optional(),
  vision: z.string().optional(),
})

const brandSchema = z.object({
  type: z.literal('brand'),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  brand_name: z.string().min(1),
  instagram_handle: z.string().optional(),
  service_interest: z.string().min(1),
  message: z.string().optional(),
})

const enquirySchema = z.discriminatedUnion('type', [shootSchema, brandSchema])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = enquirySchema.parse(body)
    const supabase = createSupabaseAdminClient()

    if (parsed.type === 'shoot') {
      const { type, ...data } = parsed
      const { data: enquiry, error } = await supabase
        .from('shoot_enquiries')
        .insert({ ...data, status: 'new' })
        .select()
        .single()

      if (error) throw error
      await sendShootEmails(enquiry)
      return NextResponse.json({ success: true, id: enquiry.id })
    }

    if (parsed.type === 'brand') {
      const { type, ...data } = parsed
      const { data: enquiry, error } = await supabase
        .from('brand_enquiries')
        .insert({ ...data, status: 'new' })
        .select()
        .single()

      if (error) throw error
      await sendBrandEmails(enquiry)
      return NextResponse.json({ success: true, id: enquiry.id })
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    console.error('Enquiry error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'shoot'
    const status = searchParams.get('status')

    const table = type === 'brand' ? 'brand_enquiries' : 'shoot_enquiries'
    let query = supabase.from(table).select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ enquiries: data })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
