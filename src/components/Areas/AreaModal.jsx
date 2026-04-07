import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { X, Layers, Palette } from 'lucide-react'

export const AreaModal = ({ isOpen, onClose, areaToEdit = null }) => {
  const { user } = useAuth()
  const [name, setName] = useState(areaToEdit?.name || '')
  const [color, setColor] = useState(areaToEdit?.color || '#7C3AED')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(areaToEdit?.name || '')
      setColor(areaToEdit?.color || '#7C3AED')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, areaToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || loading) return
    
    setLoading(true)
    try {
      const areaData = { 
        name: name.trim(), 
        color, 
        icon: 'Layers',
        user_id: user.id 
      }

      let result
      if (areaToEdit && areaToEdit.id) {
        result = await supabase.from('lifeos_areas').update(areaData).eq('id', areaToEdit.id)
      } else {
        result = await supabase.from('lifeos_areas').insert(areaData)
      }

      if (result.error) throw result.error
      onClose()
    } catch (error) {
      console.error('Error saving area:', error)
      alert('Nie udało się zapisać obszaru: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{areaToEdit ? 'Edytuj Obszar' : 'Nowy Obszar'}</h2>
          <button onClick={onClose} className="theme-toggle-btn"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Layers size={14} style={{ marginRight: '6px' }} /> Nazwa obszaru</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Np. Praca, Rozwój, Dom..."
              required 
              autoFocus
            />
          </div>

          <div className="form-group">
            <label><Palette size={14} style={{ marginRight: '6px' }} /> Kolor identyfikacyjny</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                style={{ width: '60px', height: '45px', padding: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {color.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="secondary-btn" disabled={loading}>Anuluj</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz obszar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
