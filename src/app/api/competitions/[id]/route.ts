import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  region: z.enum(['uae', 'europe', 'qatar', 'other']).optional(),
  event_date: z.string().optional(),
  status: z.enum(['open', 'soon', 'closed', 'past']).optional(),
  event_type: z.string().optional(),
  booking_deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*, competition_bookings(count)')
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ competition: data })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    const { data: competition, error } = await supabase
      .from('competitions')
      .update(data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ competition })
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
    const { error } = await supabase.from('competitions').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
