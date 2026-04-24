/**
 * Call the server-side upload API route.
 * Sends JPEG + GIF blobs via FormData; server uses service role key.
 * Returns { jpegUrl, gifUrl } as public Supabase Storage URLs.
 */
export async function uploadSession(jpegBlob, gifBlob) {
  const form = new FormData()
  form.append('jpeg', jpegBlob, 'photo.jpg')
  form.append('gif',  gifBlob,  'photo.gif')

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error ?? 'Upload failed')
  return data // { jpegUrl, gifUrl }
}
