import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { X, Pin, Type, Layers, Tag, FileText, Trash2 } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { useAuth } from '../../context/AuthContext'

export const NoteModal = ({ isOpen, onClose, noteToEdit = null }) => {
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas') || []
  const [title, setTitle] = useState(noteToEdit?.title || '')
  const [content, setContent] = useState(noteToEdit?.content || '')
  const [areaId, setAreaId] = useState(noteToEdit?.area_id || '')
  const [category, setCategory] = useState(noteToEdit?.category || 'note')
  const [isPinned, setIsPinned] = useState(noteToEdit?.is_pinned || false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(noteToEdit?.title || '')
      setContent(noteToEdit?.content || '')
      setAreaId(noteToEdit?.area_id || '')
      setCategory(noteToEdit?.category || 'note')
      setIsPinned(noteToEdit?.is_pinned || false)
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, noteToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || loading) return
    
    setLoading(true)
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        area_id: areaId ? parseInt(areaId) : null,
        category,
        is_pinned: isPinned,
        updated_at: new Date(),
        user_id: user.id
      }

      let result
      if (noteToEdit && noteToEdit.id) {
        result = await supabase.from('lifeos_notes').update(noteData).eq('id', noteToEdit.id)
      } else {
        result = await supabase.from('lifeos_notes').insert(noteData)
      }

      if (result.error) throw result.error
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Nie udało się zapisać notatki: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      setLoading(true)
      try {
        const { error } = await supabase.from('lifeos_notes').delete().eq('id', noteToEdit.id)
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
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{noteToEdit ? 'Edytuj Notatkę' : 'Nowa Notatka'}</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Odepnij' : 'Przypnij'}
              className="theme-toggle-btn"
              style={{ color: isPinned ? 'var(--primary)' : 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}
            >
              <Pin size={20} fill={isPinned ? 'var(--primary)' : 'none'} />
            </button>
            <button onClick={onClose} className="theme-toggle-btn"><X size={20} /></button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Type size={14} style={{ marginRight: '6px' }} /> Tytuł</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Tytuł Twojej notatki..."
              required 
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Tag size={14} style={{ marginRight: '6px' }} /> Kategoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="note">Notatka</option>
                <option value="recipe">Przepis</option>
                <option value="document">Dokument</option>
                <option value="idea">Pomysł / Projekt</option>
              </select>
            </div>
            <div className="form-group">
              <label><Layers size={14} style={{ marginRight: '6px' }} /> Obszar Życia</label>
              <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="">Wybierz obszar...</option>
                {areas?.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><FileText size={14} style={{ marginRight: '6px' }} /> Treść notatki</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Zacznij pisać tutaj..."
              rows={12}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            {noteToEdit && (
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
              {loading ? 'Zapisywanie...' : 'Zapisz notatkę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
