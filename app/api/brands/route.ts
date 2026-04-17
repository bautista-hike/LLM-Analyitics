import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Converts "My Company Name" → "my-company-name"
function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// GET /api/brands — list all saved brand profiles
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST /api/brands — upsert (insert or update) a brand profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, industry, region, description, website, keywords, competitors, sourceUrls } = body

    if (!companyName?.trim()) {
      return NextResponse.json({ success: false, error: 'companyName is required' }, { status: 400 })
    }

    const id = toSlug(companyName)

    const { data, error } = await supabase
      .from('brand_profiles')
      .upsert(
        {
          id,
          company_name: companyName.trim(),
          industry: industry ?? '',
          region: region ?? '',
          description: description ?? '',
          website: website ?? null,
          keywords: keywords ?? [],
          competitors: competitors ?? [],
          source_urls: sourceUrls ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('POST /api/brands error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
