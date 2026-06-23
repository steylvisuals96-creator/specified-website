'use client'
import React, { useEffect, useState } from 'react'

type Lead = {
  id: string
  naam: string
  email: string
  telefoon?: string
  bericht?: string
  bron?: string
  status?: string
  createdAt?: string
}

export default function LeadsDuplicatePanel() {
  const [groepen, setGroepen] = useState<Lead[][]>([])
  const [bezig, setBezig] = useState<string | null>(null)
  const [geladen, setGeladen] = useState(false)

  useEffect(() => {
    fetch('/api/leads?limit=500&depth=0')
      .then(r => r.json())
      .then(data => {
        const leads: Lead[] = data.docs || []
        const emailMap = new Map<string, Lead[]>()
        for (const lead of leads) {
          if (!lead.email) continue
          const key = lead.email.toLowerCase()
          if (!emailMap.has(key)) emailMap.set(key, [])
          emailMap.get(key)!.push(lead)
        }
        setGroepen([...emailMap.values()].filter(g => g.length > 1))
        setGeladen(true)
      })
      .catch(() => setGeladen(true))
  }, [])

  const merge = async (keepId: string, mergeIds: string[]) => {
    setBezig(keepId)
    await fetch('/api/leads/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keepId, mergeIds }),
    }).catch(() => {})
    window.location.reload()
  }

  if (!geladen || groepen.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      {groepen.map((groep, i) => (
        <div key={i} style={{
          background: '#110e00', border: '1px solid rgba(250,203,4,0.25)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 12, color: '#facb04', fontWeight: 500, marginBottom: 10 }}>
            ⚠️ Mogelijke duplicaat — zelfde e-mail:{' '}
            <span style={{ color: '#fff' }}>{groep[0].email}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {groep.map(lead => (
              <div key={lead.id} style={{
                flex: '1 1 160px', background: '#111', border: '1px solid #222',
                borderRadius: 6, padding: '8px 10px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{lead.naam}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {lead.telefoon || '—'} · {lead.bron || '—'}
                </div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('nl-BE') : '—'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {groep.map(lead => (
              <button
                key={lead.id}
                disabled={bezig !== null}
                onClick={() => merge(lead.id, groep.filter(l => l.id !== lead.id).map(l => l.id))}
                style={{
                  fontSize: 11, padding: '4px 12px', borderRadius: 4,
                  border: 'none', background: '#facb04', color: '#111',
                  cursor: bezig ? 'wait' : 'pointer', fontWeight: 600,
                  opacity: bezig && bezig !== lead.id ? 0.4 : 1,
                }}
              >
                {bezig === lead.id ? 'Bezig...' : `Bewaar ${lead.naam.split(' ')[0]}, verwijder rest`}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
