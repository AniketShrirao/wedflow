import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExcelBuffer, generatePdfBuffer } from '@/lib/exporter'
import JSZip from 'jszip'

const resourceMap: Record<string, { table: string; columns: string[] }> = {
  guests: { table: 'guests', columns: ['id', 'name', 'phone', 'email', 'group_name', 'invite_status'] },
  vendors: { table: 'vendors', columns: ['id', 'name', 'contact', 'email', 'phone'] },
  songs: { table: 'playlists_tracks', columns: ['id', 'title', 'artist', 'duration', 'added_by'] },
  events: { table: 'event_details', columns: ['id', 'title', 'date', 'venue'] },
  todos: { table: 'todos', columns: ['id', 'title', 'assigned_to', 'status', 'due_date'] }
}

export async function GET(request: NextRequest, { params }: { params: { resource: string } }) {
  try {
    // Debug: ensure we capture resource correctly. `params` may be a Promise in Next.js.
    const paramsObj = await params
    console.log('Export API called', { url: request.url, pathname: request.nextUrl.pathname, params: paramsObj })
    // Fallback: extract resource from pathname, or from query param `resource`, if params missing
    const extracted = request.nextUrl.pathname.split('/').filter(Boolean).pop() || ''
    const resourceFromQuery = request.nextUrl.searchParams.get('resource') || ''
    const resource = paramsObj?.resource || resourceFromQuery || extracted
    const format = (request.nextUrl.searchParams.get('format') || 'xlsx').toLowerCase()
    const id = request.nextUrl.searchParams.get('id')
    const idsParam = request.nextUrl.searchParams.get('ids')
    const zipRequested = request.nextUrl.searchParams.get('zip') === 'true'

    if (!resource || !(resource in resourceMap)) {
      console.error('Invalid export resource', { resource, resourceFromQuery, extracted, resourceMapKeys: Object.keys(resourceMap) })
      return NextResponse.json({ error: 'Invalid resource', resource, resourceFromQuery, extracted }, { status: 400 })
    }

    const mapping = resourceMap[resource]
    const supabase = await createClient()

    let data: any[] | null = null
    let error: any = null

    if (id) {
      const single = await supabase.from(mapping.table).select('*').eq('id', id).maybeSingle()
      if (single.error) {
        error = single.error
      } else if (!single.data) {
        data = []
      } else {
        data = [single.data]
      }
    } else if (idsParam) {
      const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean)
      const many = await supabase.from(mapping.table).select('*').in('id', ids)
      data = many.data as any[]
      error = many.error
    } else {
      const all = await supabase.from(mapping.table).select('*')
      data = all.data as any[]
      error = all.error
    }
    if (error) {
      console.error('Export query error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const rows = (data || []).map((r: any) => {
      const out: Record<string, any> = {}
      mapping.columns.forEach(col => { out[col] = r[col] ?? '' })
      return out
    })

    const filename = `${resource}${id ? `-${id}` : ''}.${format === 'pdf' ? 'pdf' : 'xlsx'}`

    // If user requested a zip container: return a single consolidated file for selected ids
    if (zipRequested) {
      // If ids were provided, produce a single file containing all selected rows (user expects one spreadsheet)
      if (idsParam && rows.length > 0) {
        if (format === 'pdf') {
          const buffer = await generatePdfBuffer(mapping.columns, rows)
          const res = new NextResponse(buffer)
          res.headers.set('Content-Type', 'application/pdf')
          res.headers.set('Content-Disposition', `attachment; filename="${resource}-selected.pdf"`)
          return res
        } else {
          const buffer = await generateExcelBuffer(mapping.columns, rows)
          const res = new NextResponse(buffer)
          res.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.headers.set('Content-Disposition', `attachment; filename="${resource}-selected.xlsx"`)
          return res
        }
      }

      // Fallback: for non-selected or full exports, keep previous behavior of single file in folder
      const zip = new JSZip()
      const folder = zip.folder(resource)!
      if (format === 'pdf') {
        const buffer = await generatePdfBuffer(mapping.columns, rows)
        folder.file(filename, buffer)
      } else {
        const buffer = await generateExcelBuffer(mapping.columns, rows)
        folder.file(filename, buffer)
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
      const zipName = `${resource}${id ? `-${id}` : ''}.zip`
      const res = new NextResponse(zipBuffer)
      res.headers.set('Content-Type', 'application/zip')
      res.headers.set('Content-Disposition', `attachment; filename="${zipName}"`)
      return res
    }

    if (format === 'pdf') {
      const buffer = await generatePdfBuffer(mapping.columns, rows)
      const res = new NextResponse(buffer)
      res.headers.set('Content-Type', 'application/pdf')
      res.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      return res
    }

    // default to xlsx
    const buffer = await generateExcelBuffer(mapping.columns, rows)
    const res = new NextResponse(buffer)
    res.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    return res
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
