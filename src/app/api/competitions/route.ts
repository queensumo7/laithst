import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase'
import { z } from 'zod'

const competitionSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  country: z.string().min(1),
  region: z.enum(['uae', 'europe', 'qatar', 'other']),
  event_date: z.string(),
  status: z.enum(['open', 'soon', 'closed', 'past']),
  event_type: z.string().min(1),
  booking_deadline: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(req.url)
    const region = searchParams.get('region')
    const status = searchParams.get('status')

    let query = supabase
      .from('competitions')
      .select('*')
      .order('event_date', { ascending: true })

    if (region) query = query.eq('region', region)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ competitions: data })
  } catch (err) {
    console.error('Get competitions error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = competitionSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    const { data: competition, error } = await supabase
      .from('competitions')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ competition }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    console.error('Create competition error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
