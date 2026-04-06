import React, { useState, useEffect } from 'react'
import { db } from '../../db/database'
import { X } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

export const TaskModal = ({ isOpen, onClose, taskToEdit = null }) => {
  const areas = useLiveQuery(() => db.areas.toArray())
  const [title, setTitle] = useState(taskToEdit?.title || '')
  const [priority, setPriority] = useState(taskToEdit?.priority || 'medium')
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || new Date().toISOString().split('T')[0])
  const [areaId, setAreaId] = useState(taskToEdit?.areaId || '')
  const [status, setStatus] = useState(taskToEdit?.status || 'todo')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(taskToEdit?.title || '')
      setPriority(taskToEdit?.priority || 'medium')
      setDueDate(taskToEdit?.dueDate || new Date().toISOString().split('T')[0])
      setAreaId(taskToEdit?.areaId || '')
      setStatus(taskToEdit?.status || 'todo')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, taskToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const taskData = {
      title,
      priority,
      dueDate,
      areaId: areaId ? parseInt(areaId) : null,
      status,
      updatedAt: new Date()
    }

    if (taskToEdit && taskToEdit.id) {
      await db.tasks.update(taskToEdit.id, taskData)
    } else {
      await db.tasks.add({ ...taskData, createdAt: new Date() })
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{taskToEdit ? 'Edytuj zadanie' : 'Nowe zadanie'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tytuł zadania</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Co trzeba zrobić?"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priorytet</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
                <option value="urgent">Pilny</option>
              </select>
            </div>
            <div className="form-group">
              <label>Termin</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-row">
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
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="inbox">Skrzynka odbiorcza</option>
                <option value="todo">Do zrobienia</option>
                <option value="in_progress">W trakcie</option>
                <option value="done">Ukończone</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            {taskToEdit && (
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ marginRight: 'auto', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
                    await db.tasks.delete(taskToEdit.id);
                    onClose();
                  }
                }}
              >
                Usuń
              </button>
            )}
            <button type="button" onClick={onClose} className="secondary-btn">Anuluj</button>
            <button type="submit" className="primary-btn">Zapisz zadanie</button>
          </div>
        </form>
      </div>
    </div>
  )
}
