import React, { useState, useEffect } from 'react'
import { supabase } from '../../db/supabaseClient'
import { X, Type, Flag, Calendar as CalendarIcon, Hash, Info, Trash2 } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { useAuth } from '../../context/AuthContext'

export const TaskModal = ({ isOpen, onClose, taskToEdit = null }) => {
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas') || []
  const [title, setTitle] = useState(taskToEdit?.title || '')
  const [priority, setPriority] = useState(taskToEdit?.priority || 'medium')
  const [dueDate, setDueDate] = useState(taskToEdit?.due_date || new Date().toISOString().split('T')[0])
  const [areaId, setAreaId] = useState(taskToEdit?.area_id || '')
  const [status, setStatus] = useState(taskToEdit?.status || 'todo')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTitle(taskToEdit?.title || '')
      setPriority(taskToEdit?.priority || 'medium')
      setDueDate(taskToEdit?.due_date || new Date().toISOString().split('T')[0])
      setAreaId(taskToEdit?.area_id || '')
      setStatus(taskToEdit?.status || 'todo')
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, taskToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || loading) return
    
    setLoading(true)
    try {
      const taskData = {
        title: title.trim(),
        priority,
        due_date: dueDate,
        area_id: areaId ? parseInt(areaId) : null,
        status,
        user_id: user.id
      }

      let result
      if (taskToEdit && taskToEdit.id) {
        result = await supabase.from('lifeos_tasks').update(taskData).eq('id', taskToEdit.id)
      } else {
        result = await supabase.from('lifeos_tasks').insert(taskData)
      }

      if (result.error) throw result.error
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Nie udało się zapisać zadania: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      setLoading(true)
      try {
        const { error } = await supabase.from('lifeos_tasks').delete().eq('id', taskToEdit.id)
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
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{taskToEdit ? 'Edytuj Zadanie' : 'Nowe Zadanie'}</h2>
          <button onClick={onClose} className="theme-toggle-btn"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Type size={14} style={{ marginRight: '6px' }} /> Tytuł zadania</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Co trzeba zrobić?"
              required 
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Flag size={14} style={{ marginRight: '6px' }} /> Priorytet</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
                <option value="urgent">Pilny (ASAP)</option>
              </select>
            </div>
            <div className="form-group">
              <label><CalendarIcon size={14} style={{ marginRight: '6px' }} /> Termin</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Hash size={14} style={{ marginRight: '6px' }} /> Obszar Życia</label>
              <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="">Wybierz obszar...</option>
                {areas?.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><Info size={14} style={{ marginRight: '6px' }} /> Status</label>
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
              {loading ? 'Zapisywanie...' : 'Zapisz zadanie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
