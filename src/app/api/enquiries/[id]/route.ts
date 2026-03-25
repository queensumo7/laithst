import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.string(),
  type: z.enum(['shoot', 'brand', 'contact']),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, type } = updateSchema.parse(body)
    const supabase = createSupabaseAdminClient()

    const tableMap = { shoot: 'shoot_enquiries', brand: 'brand_enquiries', contact: 'contact_messages' }
    const table = tableMap[type]

    const { data, error } = await supabase
      .from(table)
      .update({ status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
