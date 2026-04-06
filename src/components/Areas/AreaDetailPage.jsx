import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { ChevronLeft, Plus, CheckCircle2, StickyNote, Calendar, X } from 'lucide-react'
import { TaskModal } from '../Tasks/TaskModal'
import { EventModal } from '../Events/EventModal'
import { NoteModal } from '../Notes/NoteModal'

export const AreaDetailPage = () => {
  const { id } = useParams()
  const areaIdInt = parseInt(id)
  
  const area = useLiveQuery(() => db.areas.get(areaIdInt))
  const tasks = useLiveQuery(() => db.tasks.where('areaId').equals(areaIdInt).toArray())
  const notes = useLiveQuery(() => db.notes.where('areaId').equals(areaIdInt).toArray())
  const events = useLiveQuery(() => db.events.where('areaId').equals(areaIdInt).toArray())

  const [showAddMenu, setShowAddMenu] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'task', 'event', 'note'

  if (!area) return <div className="loading-container">Ładowanie obszaru...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/areas" className="back-link"><ChevronLeft size={24} /></Link>
          <div className="area-header-info">
            <h1 style={{ color: area.color, marginBottom: 0 }}>{area.name}</h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Obszar Życia LifeOS</span>
          </div>
        </div>
        <div className="header-actions" style={{ position: 'relative' }}>
            <button 
              className="primary-btn" 
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              {showAddMenu ? <X size={18} /> : <Plus size={18} />} 
              {showAddMenu ? 'Zamknij' : 'Dodaj coś'}
            </button>

            {showAddMenu && (
              <div className="quick-add-menu">
                <button onClick={() => { setActiveModal('task'); setShowAddMenu(false); }}>
                  <CheckCircle2 size={16} /> Zadanie
                </button>
                <button onClick={() => { setActiveModal('event'); setShowAddMenu(false); }}>
                  <Calendar size={16} /> Wydarzenie
                </button>
                <button onClick={() => { setActiveModal('note'); setShowAddMenu(false); }}>
                  <StickyNote size={16} /> Notatka
                </button>
              </div>
            )}
        </div>
      </div>

      <TaskModal 
        isOpen={activeModal === 'task'} 
        onClose={() => setActiveModal(null)}
        taskToEdit={{ areaId: areaIdInt }} // Pre-fill areaId
      />
      <EventModal 
        isOpen={activeModal === 'event'} 
        onClose={() => setActiveModal(null)}
        eventToEdit={{ areaId: areaIdInt }} // Pre-fill areaId
      />
      <NoteModal 
        isOpen={activeModal === 'note'} 
        onClose={() => setActiveModal(null)}
        noteToEdit={{ areaId: areaIdInt }} // Pre-fill areaId
      />

      <div className="area-dashboard-grid">
        {/* Tasks in this Area */}
        <section className="area-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Zadania w tym obszarze</span>
            </div>
            <span className="count-badge">{tasks?.length || 0}</span>
          </div>
          <div className="card-content">
            {!tasks?.length ? (
              <p className="empty-text">Brak aktywnych zadań.</p>
            ) : (
              <ul className="area-list">
                {tasks.map(task => (
                  <li key={task.id} className={`area-item ${task.status === 'done' ? 'done' : ''}`}>
                    <span className="item-dot" style={{backgroundColor: area.color}}></span>
                    <span className="item-title">{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Events in this Area */}
        <section className="area-card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={18} color="var(--secondary)" />
              <span>Nadchodzące wydarzenia</span>
            </div>
            <span className="count-badge">{events?.length || 0}</span>
          </div>
          <div className="card-content">
            {!events?.length ? (
              <p className="empty-text">Brak zaplanowanych wydarzeń.</p>
            ) : (
              <ul className="area-list">
                {events.map(event => (
                  <li key={event.id} className="area-item">
                    <span className="item-date">{new Date(event.startDate).toLocaleDateString('pl-PL', {day: 'numeric', month: 'short'})}</span>
                    <span className="item-title">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Notes in this Area */}
        <section className="area-card" style={{gridColumn: 'span 2'}}>
          <div className="card-header">
            <div className="card-title">
              <StickyNote size={18} color="var(--primary)" />
              <span>Notatki i Wiedza</span>
            </div>
            <span className="count-badge">{notes?.length || 0}</span>
          </div>
          <div className="area-notes-grid">
            {notes?.slice(0, 4).map(note => (
              <div key={note.id} className="area-note-card">
                <h4>{note.title}</h4>
                <p>{note.content.substring(0, 60)}...</p>
              </div>
            ))}
            {!notes?.length && <p className="empty-text">Brak notatek w tym obszarze.</p>}
          </div>
        </section>
      </div>

      <style>{`
        .area-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .area-card {
          background-color: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .count-badge {
          background-color: var(--bg-tertiary);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .area-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .area-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-tertiary);
        }
        .item-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .item-title {
          font-size: 0.9375rem;
          color: var(--text-primary);
        }
        .item-date {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          width: 40px;
        }
        .area-notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .area-note-card {
          background-color: var(--bg-tertiary);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        .area-note-card h4 {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .area-note-card p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .empty-text {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-top: 1rem;
          font-style: italic;
        }
        @media (max-width: 1024px) {
          .area-dashboard-grid {
            grid-template-columns: 1fr;
          }
          .area-card {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
