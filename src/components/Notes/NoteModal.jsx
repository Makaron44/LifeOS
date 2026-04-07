import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { X, Pin } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { useAuth } from '../../context/AuthContext'

export const NoteModal = ({ isOpen, onClose, noteToEdit = null }) => {
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas')
  const [title, setTitle] = useState(noteToEdit?.title || '')
  const [content, setContent] = useState(noteToEdit?.content || '')
  const [areaId, setAreaId] = useState(noteToEdit?.area_id || '')
  const [category, setCategory] = useState(noteToEdit?.category || 'note')
  const [isPinned, setIsPinned] = useState(noteToEdit?.is_pinned || false)

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
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, noteToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    const noteData = {
      title,
      content,
      area_id: areaId ? parseInt(areaId) : null,
      category,
      is_pinned: isPinned,
      updated_at: new Date(),
      user_id: user.id
    }

    if (noteToEdit && noteToEdit.id) {
      await supabase.from('lifeos_notes').update(noteData).eq('id', noteToEdit.id)
    } else {
      await supabase.from('lifeos_notes').insert(noteData)
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '700px'}}>
        <div className="modal-header">
          <h2>{noteToEdit ? 'Edytuj notatkę' : 'Nowa notatka'}</h2>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button 
              type="button" 
              onClick={() => setIsPinned(!isPinned)}
              style={{color: isPinned ? 'var(--primary)' : 'var(--text-muted)'}}
            >
              <Pin size={20} fill={isPinned ? 'var(--primary)' : 'none'} />
            </button>
            <button onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tytuł</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Tytuł notatki..."
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kategoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="note">Notatka</option>
                <option value="recipe">Przepis</option>
                <option value="document">Dokument</option>
                <option value="idea">Pomysł</option>
              </select>
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
          </div>

          <div className="form-group">
            <label>Treść</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Wpisz treść notatki... (Markdown już wkrótce)"
              rows={10}
              required
            />
          </div>

          <div className="modal-footer">
            {noteToEdit && (
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ marginRight: 'auto', color: 'var(--danger)' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
                    await supabase.from('lifeos_notes').delete().eq('id', noteToEdit.id);
                    onClose();
                  }
                }}
              >
                Usuń
              </button>
            )}
            <button type="button" onClick={onClose} className="secondary-btn">Anuluj</button>
            <button type="submit" className="primary-btn">Zapisz notatkę</button>
          </div>
        </form>
      </div>
    </div>
  )
}
