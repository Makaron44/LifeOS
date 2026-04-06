import React, { useState, useEffect } from 'react'
import { db } from '../../db/database'
import { X } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

export const EventModal = ({ isOpen, onClose, eventToEdit = null }) => {
  const areas = useLiveQuery(() => db.areas.toArray())
  const [title, setTitle] = useState(eventToEdit?.title || '')
  const [startDate, setStartDate] = useState(eventToEdit?.startDate || new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(eventToEdit?.endDate || new Date().toISOString().slice(0, 16))
  const [areaId, setAreaId] = useState(eventToEdit?.areaId || '')
  const [description, setDescription] = useState(eventToEdit?.description || '')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(eventToEdit?.title || '')
      setStartDate(eventToEdit?.startDate || new Date().toISOString().slice(0, 16))
      setEndDate(eventToEdit?.endDate || new Date().toISOString().slice(0, 16))
      setAreaId(eventToEdit?.areaId || '')
      setDescription(eventToEdit?.description || '')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, eventToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const eventData = {
      title,
      startDate,
      endDate,
      areaId: areaId ? parseInt(areaId) : null,
      description,
      updatedAt: new Date()
    }

    if (eventToEdit && eventToEdit.id) {
      await db.events.update(eventToEdit.id, eventData)
    } else {
      await db.events.add({ ...eventData, createdAt: new Date() })
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
                    await db.events.delete(eventToEdit.id);
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
