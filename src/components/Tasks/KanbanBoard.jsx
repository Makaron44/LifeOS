import React from 'react'
import { db } from '../../db/database'
import { Check, Edit3, Trash2 } from 'lucide-react'
import './Kanban.css'

export const KanbanBoard = ({ tasks, onEdit, toggleStatus, onDelete }) => {
  const columns = [
    { id: 'inbox', title: 'Skrzynka', color: 'var(--text-muted)' },
    { id: 'todo', title: 'Do zrobienia', color: 'var(--primary)' },
    { id: 'in_progress', title: 'W trakcie', color: 'var(--warning)' },
    { id: 'done', title: 'Ukończone', color: 'var(--success)' }
  ]

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDrop = async (e, newStatus) => {
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    await db.tasks.update(taskId, { 
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date() : null 
    })
  }

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <div 
          key={column.id} 
          className="kanban-column"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, column.id)}
        >
          <div className="column-header">
            <div className="column-dot" style={{ backgroundColor: column.color }}></div>
            <h3 className="column-title">{column.title}</h3>
            <span className="column-count">
              {tasks?.filter(t => t.status === column.id).length || 0}
            </span>
          </div>
          
          <div className="column-cards">
            {tasks?.filter(t => t.status === column.id).map(task => (
              <div 
                key={task.id} 
                className="kanban-card"
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
              >
                <div className="card-top">
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  <div className="card-actions">
                    <button onClick={() => onEdit(task)}><Edit3 size={14} /></button>
                  </div>
                </div>
                <p className="card-title">{task.title}</p>
                <div className="card-bottom">
                   <span className="card-date">{task.dueDate}</span>
                   {task.status !== 'done' && (
                     <button className="quick-check" onClick={() => toggleStatus(task.id, task.status)}>
                       <Check size={14} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
