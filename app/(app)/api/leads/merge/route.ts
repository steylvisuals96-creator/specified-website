import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

const configPromise = import('@payload-config').then(m => m.default)

export async function POST(req: NextRequest) {
  try {
    const { keepId, mergeIds } = await req.json()
    if (!keepId || !Array.isArray(mergeIds) || mergeIds.length === 0) {
      return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
    }

    const config = await configPromise
    const payload = await getPayload({ config: config as any })

    const keepLead = await payload.findByID({ collection: 'leads', id: keepId })

    for (const mergeId of mergeIds) {
      const mergeLead = await payload.findByID({ collection: 'leads', id: mergeId })
      const updates: Record<string, any> = {}

      if (!keepLead.telefoon && mergeLead.telefoon) updates.telefoon = mergeLead.telefoon
      if (!keepLead.bericht && mergeLead.bericht) updates.bericht = mergeLead.bericht
      if (!keepLead.pand && mergeLead.pand) updates.pand = mergeLead.pand
      if (mergeLead.notities) {
        const bestaand = (keepLead.notities as string | undefined) || ''
        updates.notities = bestaand
          ? `${bestaand}\n\n[Samengevoegd van ${mergeLead.naam}]:\n${mergeLead.notities}`
          : mergeLead.notities
      }

      if (Object.keys(updates).length > 0) {
        await payload.update({ collection: 'leads', id: keepId, data: updates as any })
      }

      await payload.delete({ collection: 'leads', id: mergeId })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[merge leads]', err)
    return NextResponse.json({ error: 'Samenvoegen mislukt' }, { status: 500 })
  }
}
