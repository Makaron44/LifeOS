import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
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

  const tasks = useLiveQuery(async () => {
    let collection;
    
    if (filter === 'today') {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      collection = db.tasks.where('dueDate').equals(today);
    } else if (filter === 'done') {
      collection = db.tasks.where('status').equals('done');
    } else if (filter === 'pending') {
      collection = db.tasks.where('status').notEqual('done');
    } else {
      collection = db.tasks.toCollection();
    }
    
    let result = await collection.toArray();
    
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filter, searchQuery])

  const areas = useLiveQuery(() => db.areas.toArray())
  const getAreaName = (id) => areas?.find(a => a.id === id)?.name || 'Brak obszaru'

  const toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    await db.tasks.update(id, { 
      status: newStatus, 
      completedAt: newStatus === 'done' ? new Date() : null 
    })
  }

  const handleDeleteClick = (id) => {
    setTaskToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      await db.tasks.delete(taskToDelete)
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
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nowe zadanie
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
                    <span className="meta-item"><Calendar size={12} /> {task.dueDate}</span>
                    <span className="meta-item"><Filter size={12} /> {getAreaName(task.areaId)}</span>
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
          onDelete={deleteTask} 
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
