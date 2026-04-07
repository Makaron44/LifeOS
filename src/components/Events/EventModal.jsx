import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { X, Type, Calendar as CalendarIcon, Clock, Hash, FileText, Trash2 } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { useAuth } from '../../context/AuthContext'

export const EventModal = ({ isOpen, onClose, eventToEdit = null }) => {
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas') || []
  const [title, setTitle] = useState(eventToEdit?.title || '')
  const [startDate, setStartDate] = useState(eventToEdit?.start_date || new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(eventToEdit?.end_date || new Date().toISOString().slice(0, 16))
  const [areaId, setAreaId] = useState(eventToEdit?.area_id || '')
  const [description, setDescription] = useState(eventToEdit?.description || '')
  const [loading, setLoading] = useState(false)

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
  }, [isOpen, eventToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || loading) return
    
    setLoading(true)
    try {
      const eventData = {
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        area_id: areaId ? parseInt(areaId) : null,
        description: description.trim(),
        user_id: user.id
      }

      let result
      if (eventToEdit && eventToEdit.id) {
        result = await supabase.from('lifeos_events').update(eventData).eq('id', eventToEdit.id)
      } else {
        result = await supabase.from('lifeos_events').insert(eventData)
      }

      if (result.error) throw result.error
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Nie udało się zapisać wydarzenia: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      setLoading(true)
      try {
        const { error } = await supabase.from('lifeos_events').delete().eq('id', eventToEdit.id)
        if (error) throw error
        onClose()
      } catch (error) {
        alert('Błąd usuwania: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{eventToEdit ? 'Edytuj Wydarzenie' : 'Nowe Wydarzenie'}</h2>
          <button onClick={onClose} className="theme-toggle-btn"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Type size={14} style={{ marginRight: '6px' }} /> Tytuł wydarzenia</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Co się dzieje?"
              required 
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Clock size={14} style={{ marginRight: '6px' }} /> Początek</label>
              <input 
                type="datetime-local" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label><Clock size={14} style={{ marginRight: '6px' }} /> Koniec</label>
              <input 
                type="datetime-local" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label><Hash size={14} style={{ marginRight: '6px' }} /> Obszar Życia</label>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Wybierz obszar...</option>
              {areas?.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><FileText size={14} style={{ marginRight: '6px' }} /> Opis (opcjonalnie)</label>
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
                className="secondary-btn delete-btn" 
                style={{ marginRight: 'auto', color: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                Usuń
              </button>
            )}
            <button type="button" onClick={onClose} className="secondary-btn" disabled={loading}>Anuluj</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz wydarzenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
