import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { X, Layers } from 'lucide-react'

export const AreaModal = ({ isOpen, onClose, areaToEdit = null }) => {
  const { user } = useAuth()
  const [name, setName] = useState(areaToEdit?.name || '')
  const [color, setColor] = useState(areaToEdit?.color || '#6366F1')
  const [icon, setIcon] = useState(areaToEdit?.icon || 'Layers')

  useEffect(() => {
    if (isOpen) {
      setName(areaToEdit?.name || '')
      setColor(areaToEdit?.color || '#6366F1')
      setIcon(areaToEdit?.icon || 'Layers')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, areaToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (areaToEdit) {
      await supabase.from('lifeos_areas').update({ name, color, icon }).eq('id', areaToEdit.id)
    } else {
      await supabase.from('lifeos_areas').insert({ name, color, icon, user_id: user.id })
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{areaToEdit ? 'Edytuj obszar' : 'Nowy obszar'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nazwa obszaru</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Np. Praca, Dom, Hobby..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Kolor przewodni</label>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              style={{ height: '50px', cursor: 'pointer' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="secondary-btn">Anuluj</button>
            <button type="submit" className="primary-btn">Zapisz obszar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
