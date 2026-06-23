'use client'
import React, { useState } from 'react'

export default function LeadsActiesCell({ rowData }: { rowData?: any }) {
  const [fase, setFase] = useState<'idle' | 'bevestig' | 'bezig'>('idle')
  const id = rowData?.id

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const verwijder = async (e: React.MouseEvent) => {
    stop(e)
    setFase('bezig')
    await fetch(`/api/leads/${id}`, { method: 'DELETE' }).catch(() => {})
    window.location.reload()
  }

  if (fase === 'bevestig') return (
    <span onClick={stop} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#888' }}>Zeker?</span>
      <button onClick={verwijder} style={dangerBtn}>Ja, verwijder</button>
      <button onClick={e => { stop(e); setFase('idle') }} style={ghostBtn}>Annuleer</button>
    </span>
  )

  if (fase === 'bezig') return (
    <span style={{ fontSize: 11, color: '#555' }}>Verwijderen...</span>
  )

  return (
    <button
      onClick={e => { stop(e); setFase('bevestig') }}
      style={deleteBtn}
    >
      ✕ Verwijder
    </button>
  )
}

const deleteBtn = {
  fontSize: 11, padding: '3px 10px', borderRadius: 4,
  border: '1px solid rgba(226,75,74,0.5)', background: 'transparent',
  color: '#e24b4a', cursor: 'pointer', lineHeight: '1.4',
}
const dangerBtn = {
  fontSize: 11, padding: '3px 10px', borderRadius: 4,
  border: 'none', background: '#e24b4a', color: '#fff',
  cursor: 'pointer', lineHeight: '1.4',
}
const ghostBtn = {
  fontSize: 11, padding: '3px 10px', borderRadius: 4,
  border: '1px solid #333', background: 'transparent',
  color: '#666', cursor: 'pointer', lineHeight: '1.4',
}
