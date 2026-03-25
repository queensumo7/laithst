import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendBookingEmails } from '@/lib/email'
import { z } from 'zod'
import { PACKAGE_PRICES } from '@/types'

const bookingSchema = z.object({
  competition_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  horse_name: z.string().min(1),
  class_round: z.string().optional(),
  package: z.enum(['photos', 'reel', 'bundle']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = bookingSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', data.competition_id)
      .single()

    if (compError || !competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    if (competition.status !== 'open') {
      return NextResponse.json({ error: 'Booking is not open for this competition' }, { status: 400 })
    }

    // Insert booking
    const { data: booking, error } = await supabase
      .from('competition_bookings')
      .insert({
        ...data,
        package_price: PACKAGE_PRICES[data.package],
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Send emails
    await sendBookingEmails(booking, competition)

    return NextResponse.json({ success: true, booking_id: booking.id })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const competition_id = searchParams.get('competition_id')

    let query = supabase
      .from('competition_bookings')
      .select('*, competition:competitions(name, location, event_date)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (competition_id) query = query.eq('competition_id', competition_id)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (err) {
    console.error('Get bookings error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
