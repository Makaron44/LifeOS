import React, { useState, useEffect } from 'react'
import { db } from '../../db/database'
import { X, Pin } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

export const NoteModal = ({ isOpen, onClose, noteToEdit = null }) => {
  const areas = useLiveQuery(() => db.areas.toArray())
  const [title, setTitle] = useState(noteToEdit?.title || '')
  const [content, setContent] = useState(noteToEdit?.content || '')
  const [areaId, setAreaId] = useState(noteToEdit?.areaId || '')
  const [category, setCategory] = useState(noteToEdit?.category || 'note')
  const [isPinned, setIsPinned] = useState(noteToEdit?.isPinned || false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(noteToEdit?.title || '')
      setContent(noteToEdit?.content || '')
      setAreaId(noteToEdit?.areaId || '')
      setCategory(noteToEdit?.category || 'note')
      setIsPinned(noteToEdit?.isPinned || false)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, noteToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const noteData = {
      title,
      content,
      areaId: areaId ? parseInt(areaId) : null,
      category,
      isPinned,
      updatedAt: new Date()
    }

    if (noteToEdit && noteToEdit.id) {
      await db.notes.update(noteToEdit.id, noteData)
    } else {
      await db.notes.add({ ...noteData, createdAt: new Date() })
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
                    await db.notes.delete(noteToEdit.id);
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
