import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'photobooth'

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: `ENV missing — URL: ${!!supabaseUrl}, KEY: ${!!serviceKey}. Restart dev server after editing .env` },
      { status: 500 }
    )
  }

  // Service role key bypasses all RLS — server-side only, never exposed to browser
  try {
    const supabase = createClient(supabaseUrl, serviceKey)
    const formData = await request.formData()
    const jpegBlob = formData.get('jpeg')
    const gifBlob  = formData.get('gif')

    if (!jpegBlob || !gifBlob) {
      return NextResponse.json({ error: 'Missing jpeg or gif in form data' }, { status: 400 })
    }

    const ts = Date.now()
    const jpegPath = `photo-${ts}.jpg`
    const gifPath  = `gif-${ts}.gif`

    const jpegBuf = Buffer.from(await jpegBlob.arrayBuffer())
    const gifBuf  = Buffer.from(await gifBlob.arrayBuffer())

    const jpegRes = await supabase.storage
      .from(BUCKET)
      .upload(jpegPath, jpegBuf, { contentType: 'image/jpeg', cacheControl: '3600' })

    if (jpegRes.error) {
      return NextResponse.json({ error: `JPEG upload failed: ${jpegRes.error.message} | status: ${jpegRes.error.status} | url: ${supabaseUrl} | bucket: ${BUCKET} | path: ${jpegPath}` }, { status: 500 })
    }

    const gifRes = await supabase.storage
      .from(BUCKET)
      .upload(gifPath, gifBuf, { contentType: 'image/gif', cacheControl: '3600' })

    if (gifRes.error) {
      return NextResponse.json({ error: `GIF: ${gifRes.error.message}` }, { status: 500 })
    }

    const jpegUrl = supabase.storage.from(BUCKET).getPublicUrl(jpegPath).data.publicUrl
    const gifUrl  = supabase.storage.from(BUCKET).getPublicUrl(gifPath).data.publicUrl

    return NextResponse.json({ jpegUrl, gifUrl })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
