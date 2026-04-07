import React, { useState } from 'react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { supabase } from '../../db/supabaseClient'
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  Filter, 
  LayoutList, 
  LayoutDashboard 
} from 'lucide-react'
import { TaskModal } from './TaskModal'
import { KanbanBoard } from './KanbanBoard'
import { ConfirmModal } from '../shared/ConfirmModal'
import './Tasks.css'

export const TasksPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState('list') // 'list' or 'kanban'

  const allTasks = useSupabaseQuery('lifeos_tasks') || []

  const tasks = React.useMemo(() => {
    let result = [...allTasks]
    
    if (filter === 'today') {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      result = result.filter(t => t.due_date === today)
    } else if (filter === 'done') {
      result = result.filter(t => t.status === 'done')
    } else if (filter === 'pending') {
      result = result.filter(t => t.status !== 'done')
    }
    
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    // Sort descending by created_at
    return result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }, [allTasks, filter, searchQuery])

  const areas = useSupabaseQuery('lifeos_areas') || []
  const getAreaName = (id) => areas?.find(a => a.id === id)?.name || 'Brak obszaru'

  const toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    await supabase.from('lifeos_tasks').update({ status: newStatus }).eq('id', id)
  }

  const handleDeleteClick = (id) => {
    setTaskToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      await supabase.from('lifeos_tasks').delete().eq('id', taskToDelete)
      setTaskToDelete(null)
    }
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="title-with-views">
          <h1>Zadania</h1>
          <div className="view-switcher">
            <button 
              className={viewType === 'list' ? 'active' : ''} 
              onClick={() => setViewType('list')}
              title="Widok listy"
            >
              <LayoutList size={20} />
            </button>
            <button 
              className={viewType === 'kanban' ? 'active' : ''} 
              onClick={() => setViewType('kanban')}
              title="Tablica Kanban"
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
        <button className="primary-btn icon-only-mobile" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> <span>Nowe zadanie</span>
        </button>
      </div>

      <div className="tasks-controls">
        <div className="tasks-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Szukaj zadań..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="tasks-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Wszystkie</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Do zrobienia</button>
          <button className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Na dziś</button>
          <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Ukończone</button>
        </div>
      </div>

      {viewType === 'list' ? (
        <div className="tasks-list">
          {!tasks || tasks.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
              <p>Nie znaleziono żadnych zadań.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
                <div 
                  className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                >
                  {task.status === 'done' && <Check size={14} />}
                </div>
                
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <div className="task-meta">
                    <span className="meta-item"><Calendar size={12} /> {task.due_date}</span>
                    <span className="meta-item"><Filter size={12} /> {getAreaName(task.area_id)}</span>
                  </div>
                </div>

                <div className="task-actions">
                  <button type="button" className="action-btn" title="Edytuj" onClick={(e) => { e.stopPropagation(); openEditModal(task); }}><Edit3 size={16} style={{ pointerEvents: 'none' }} /></button>
                  <button type="button" className="action-btn delete" title="Usuń" onClick={(e) => { e.stopPropagation(); handleDeleteClick(task.id); }}><Trash2 size={16} style={{ pointerEvents: 'none' }} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <KanbanBoard 
          tasks={tasks} 
          onEdit={openEditModal} 
          toggleStatus={toggleTaskStatus} 
          onDelete={handleDeleteClick} 
        />
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={closeModals} 
        taskToEdit={editingTask}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Usuń zadanie"
        message="Czy na pewno chcesz usunąć to zadanie?"
      />
    </div>
  )
}
