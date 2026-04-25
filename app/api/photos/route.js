import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'photobooth'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'ENV missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // List all files, sorted by most recently created
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' } })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter only JPEGs (skip GIFs), build public URLs
  const photos = data
    .filter(f => f.name.endsWith('.jpg'))
    .map(f => ({
      name: f.name,
      createdAt: f.created_at,
      url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    }))

  return NextResponse.json({ photos })
}
