import React, { useState, useEffect } from 'react'
import { useSearch } from '../../hooks/useSearch'
import { Search, X, CheckSquare, Calendar, StickyNote, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './SearchModal.css'

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const { tasks, events, notes } = useSearch(query)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        // Toggle logic if needed, but isOpen is passed from parent
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <div className="search-input-header">
          <Search size={20} color="var(--primary)" />
          <input 
            autoFocus 
            type="text" 
            placeholder="Szukaj zadań, wydarzeń, notatek..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="close-search" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="search-results-body">
          {(!query) ? (
            <div className="search-empty-state">
              <p>Zacznij pisać, aby przeszukać bazę LifeOS...</p>
            </div>
          ) : (tasks.length === 0 && events.length === 0 && notes.length === 0) ? (
            <div className="search-empty-state">
              <p>Brak wyników dla "{query}"</p>
            </div>
          ) : (
            <div className="results-list">
              {tasks.length > 0 && (
                <div className="result-section">
                  <h4>Zadania</h4>
                  {tasks.map(task => (
                    <Link to="/tasks" key={task.id} className="result-item" onClick={onClose}>
                      <CheckSquare size={16} />
                      <span>{task.title}</span>
                      <ArrowRight size={14} className="arrow" />
                    </Link>
                  ))}
                </div>
              )}

              {events.length > 0 && (
                <div className="result-section">
                  <h4>Wydarzenia</h4>
                  {events.map(event => (
                    <Link to="/events" key={event.id} className="result-item" onClick={onClose}>
                      <Calendar size={16} />
                      <span>{event.title}</span>
                      <ArrowRight size={14} className="arrow" />
                    </Link>
                  ))}
                </div>
              )}

              {notes.length > 0 && (
                <div className="result-section">
                  <h4>Notatki</h4>
                  {notes.map(note => (
                    <Link to="/notes" key={note.id} className="result-item" onClick={onClose}>
                      <StickyNote size={16} />
                      <span>{note.title}</span>
                      <ArrowRight size={14} className="arrow" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="search-footer">
          <span>ESC by zamknąć</span>
          <span>TAB by przełączać</span>
        </div>
      </div>
    </div>
  )
}
