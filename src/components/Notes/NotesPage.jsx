import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { Plus, Search, Trash2, Edit3, Pin, FileText, Book, Lightbulb, FileBox } from 'lucide-react'
import { NoteModal } from './NoteModal'
import { ConfirmModal } from '../shared/ConfirmModal'
import './Notes.css'

export const NotesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const notes = useLiveQuery(async () => {
    let result = await db.notes.toArray();
    if (searchQuery) {
      result = result.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sort by pinned first, then by date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [searchQuery])

  const areas = useLiveQuery(() => db.areas.toArray())
  const getArea = (id) => areas?.find(a => a.id === id)

  const handleDeleteClick = (id) => {
    setNoteToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (noteToDelete) {
      await db.notes.delete(noteToDelete)
      setNoteToDelete(null)
    }
  }

  const togglePin = async (id, currentPinned) => {
    await db.notes.update(id, { isPinned: !currentPinned })
  }

  const openEditModal = (note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'recipe': return <Book size={18} />;
      case 'document': return <FileBox size={18} />;
      case 'idea': return <Lightbulb size={18} />;
      default: return <FileText size={18} />;
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notatki</h1>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nowa notatka
        </button>
      </div>

      <div className="notes-controls">
        <div className="notes-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Szukaj w notatkach..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notes-grid">
        {!notes || notes.length === 0 ? (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>Brak notatek. Stwórz swoją pierwszą!</p>
          </div>
        ) : (
          notes.map(note => {
            const area = getArea(note.areaId)
            return (
              <div key={note.id} className={`note-card ${note.isPinned ? 'pinned' : ''}`}>
                <div className="note-card-header">
                  <span className="category-tag">
                    {getCategoryIcon(note.category)}
                    {note.category}
                  </span>
                  <button 
                    className="pin-btn" 
                    onClick={() => togglePin(note.id, note.isPinned)}
                    title={note.isPinned ? 'Odepnij' : 'Przypnij'}
                  >
                    <Pin size={16} fill={note.isPinned ? 'var(--primary)' : 'none'} color={note.isPinned ? 'var(--primary)' : 'var(--text-muted)'} />
                  </button>
                </div>
                
                <div className="note-body" onClick={() => openEditModal(note)}>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-excerpt">{note.content}</p>
                </div>

                <div className="note-card-footer">
                  {area && (
                    <span className="area-badge" style={{'--area-color': area.color}}>
                      {area.name}
                    </span>
                  )}
                  <div className="note-actions">
                    <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); openEditModal(note); }}><Edit3 size={16} style={{ pointerEvents: 'none' }} /></button>
                    <button type="button" className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(note.id); }}><Trash2 size={16} style={{ pointerEvents: 'none' }} /></button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={closeModals} 
        noteToEdit={editingNote}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Usuń notatkę"
        message="Czy na pewno chcesz bezpowrotnie usunąć tę notatkę?"
      />
    </div>
  )
}
