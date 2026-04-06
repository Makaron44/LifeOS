import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { Plus, Trash2, Edit3, Clock, LayoutList, Calendar as CalendarIcon } from 'lucide-react'
import { EventModal } from './EventModal'
import { CalendarView } from './CalendarView'
import { ConfirmModal } from '../shared/ConfirmModal'
import './Events.css'

export const EventsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [viewType, setViewType] = useState('list') // 'list' or 'calendar'
  const [preSelectedDate, setPreSelectedDate] = useState(null)

  const events = useLiveQuery(() => 
    db.events.toArray().then(items => 
      items.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    )
  )

  const areas = useLiveQuery(() => db.areas.toArray())
  const getArea = (id) => areas?.find(a => a.id === id)

  const handleDeleteClick = (id) => {
    setEventToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (eventToDelete) {
      await db.events.delete(eventToDelete)
      setEventToDelete(null)
    }
  }

  const openEditModal = (event) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const openAddModal = (dateStr = null) => {
    setPreSelectedDate(dateStr)
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setPreSelectedDate(null)
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('pl-PL', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="title-with-views">
          <h1>Wydarzenia</h1>
          <div className="view-switcher">
            <button 
              className={viewType === 'list' ? 'active' : ''} 
              onClick={() => setViewType('list')}
              title="Widok listy"
            >
              <LayoutList size={20} />
            </button>
            <button 
              className={viewType === 'calendar' ? 'active' : ''} 
              onClick={() => setViewType('calendar')}
              title="Widok kalendarza"
            >
              <CalendarIcon size={20} />
            </button>
          </div>
        </div>
        <button className="primary-btn" onClick={() => openAddModal()}>
          <Plus size={18} /> Nowe wydarzenie
        </button>
      </div>

      {viewType === 'list' ? (
        <div className="events-list">
          {!events || events.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
              <p>Nie znaleziono żadnych wydarzeń.</p>
            </div>
          ) : (
            events.map(event => {
              const area = getArea(event.areaId)
              return (
                <div key={event.id} className="event-card">
                  <div className="event-date-indicator" style={{backgroundColor: area?.color || 'var(--primary)'}}></div>
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <div className="event-meta">
                      <span className="meta-item"><Clock size={14} /> {formatDateTime(event.startDate)}</span>
                      {area && (
                        <span className="meta-item" style={{color: area.color}}>
                          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: area.color}}></div>
                          {area.name}
                        </span>
                      )}
                    </div>
                    {event.description && <p className="event-description">{event.description}</p>}
                  </div>

                  <div className="event-actions">
                    <button type="button" className="action-btn" title="Edytuj" onClick={(e) => { e.stopPropagation(); openEditModal(event); }}><Edit3 size={16} style={{ pointerEvents: 'none' }} /></button>
                    <button type="button" className="action-btn delete" title="Usuń" onClick={(e) => { e.stopPropagation(); handleDeleteClick(event.id); }}><Trash2 size={16} style={{ pointerEvents: 'none' }} /></button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <CalendarView 
          events={events} 
          areas={areas}
          onEdit={openEditModal} 
          onAdd={openAddModal} 
        />
      )}

      <EventModal 
        isOpen={isModalOpen} 
        onClose={closeModals} 
        eventToEdit={editingEvent}
        defaultDate={preSelectedDate}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Usuń wydarzenie"
        message="Czy na pewno chcesz usunąć to wydarzenie?"
      />
    </div>
  )
}
