import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { ChevronLeft, Plus, CheckCircle2, StickyNote, Calendar, X } from 'lucide-react'
import { TaskModal } from '../Tasks/TaskModal'
import { EventModal } from '../Events/EventModal'
import { NoteModal } from '../Notes/NoteModal'
import './Areas.css'

export const AreaDetailPage = () => {
  const { id } = useParams()
  const areaIdInt = parseInt(id)
  
  const allAreas = useSupabaseQuery('lifeos_areas') || []
  const area = allAreas.find(a => a.id === areaIdInt)
  
  const allTasks = useSupabaseQuery('lifeos_tasks') || []
  const tasks = allTasks.filter(t => t.area_id === areaIdInt)
  
  const allNotes = useSupabaseQuery('lifeos_notes') || []
  const notes = allNotes.filter(n => n.area_id === areaIdInt)
  
  const allEvents = useSupabaseQuery('lifeos_events') || []
  const events = allEvents.filter(e => e.area_id === areaIdInt)

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
                    <span className="item-date">{new Date(event.start_date || 0).toLocaleDateString('pl-PL', {day: 'numeric', month: 'short'})}</span>
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
    </div>
  )
}
