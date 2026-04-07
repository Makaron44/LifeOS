import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { X } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { useAuth } from '../../context/AuthContext'

export const EventModal = ({ isOpen, onClose, eventToEdit = null }) => {
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas')
  const [title, setTitle] = useState(eventToEdit?.title || '')
  const [startDate, setStartDate] = useState(eventToEdit?.start_date || new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(eventToEdit?.end_date || new Date().toISOString().slice(0, 16))
  const [areaId, setAreaId] = useState(eventToEdit?.area_id || '')
  const [description, setDescription] = useState(eventToEdit?.description || '')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(eventToEdit?.title || '')
      setStartDate(eventToEdit?.start_date || new Date().toISOString().slice(0, 16))
      setEndDate(eventToEdit?.end_date || new Date().toISOString().slice(0, 16))
      setAreaId(eventToEdit?.area_id || '')
      setDescription(eventToEdit?.description || '')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, eventToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    const eventData = {
      title,
      start_date: startDate,
      end_date: endDate,
      area_id: areaId ? parseInt(areaId) : null,
      description,
      user_id: user.id
    }

    if (eventToEdit && eventToEdit.id) {
      await supabase.from('lifeos_events').update(eventData).eq('id', eventToEdit.id)
    } else {
      await supabase.from('lifeos_events').insert(eventData)
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{eventToEdit ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tytuł wydarzenia</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Co się dzieje?"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Początek</label>
              <input 
                type="datetime-local" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Koniec</label>
              <input 
                type="datetime-local" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Obszar Życia</label>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Brak obszaru</option>
              {areas?.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Opis (opcjonalnie)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Dodaj więcej szczegółów..."
              rows={3}
            />
          </div>

          <div className="modal-footer">
            {eventToEdit && (
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ marginRight: 'auto', color: 'var(--danger)' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
                    await supabase.from('lifeos_events').delete().eq('id', eventToEdit.id);
                    onClose();
                  }
                }}
              >
                Usuń
              </button>
            )}
            <button type="button" onClick={onClose} className="secondary-btn">Anuluj</button>
            <button type="submit" className="primary-btn">Zapisz wydarzenie</button>
          </div>
        </form>
      </div>
    </div>
  )
}
