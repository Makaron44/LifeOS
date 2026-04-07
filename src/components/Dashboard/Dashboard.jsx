import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  Lightbulb,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

export const Dashboard = () => {
  const [inboxText, setInboxText] = useState('')
  const [isAreasVisible, setIsAreasVisible] = useState(true)
  
  const areas = useLiveQuery(() => db.areas.toArray())
  const allTasks = useLiveQuery(() => db.tasks.toArray()) || []
  
  const getTodayStr = () => {
    // Returns YYYY-MM-DD in local time
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const todayTasks = useLiveQuery(async () => {
    const today = getTodayStr()
    return await db.tasks.where('dueDate').equals(today).and(t => t.status !== 'done').toArray()
  })

  const todayDoneTasks = useLiveQuery(async () => {
    const today = getTodayStr()
    return await db.tasks.where('dueDate').equals(today).and(t => t.status === 'done').toArray()
  })

  const todayEvents = useLiveQuery(async () => {
    const today = getTodayStr()
    return await db.events.filter(event => event.startDate.startsWith(today)).toArray()
  })

  // Get next 7 days tasks/events
  const nextWeekItems = useLiveQuery(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    const todayStr = getTodayStr()
    // Formatting nextWeekStr as YYYY-MM-DD local
    const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`
    
    const tasks = await db.tasks.where('dueDate').between(todayStr, nextWeekStr, true, true).toArray()
    const events = await db.events.filter(e => e.startDate >= todayStr && e.startDate <= nextWeekStr + 'T23:59:59').toArray()
    
    return [...tasks.map(t => ({...t, type: 'task'})), ...events.map(e => ({...e, type: 'event'}))]
      .sort((a, b) => new Date(a.dueDate || a.startDate) - new Date(b.dueDate || b.startDate))
  })

  const handleInboxSubmit = async (e) => {
    if (e.key === 'Enter' && inboxText.trim()) {
      await db.tasks.add({
        title: inboxText,
        status: 'inbox',
        priority: 'medium',
        dueDate: getTodayStr(),
        createdAt: new Date()
      })
      setInboxText('')
    }
  }

  const toggleTask = async (id, currentStatus) => {
    await db.tasks.update(id, { status: currentStatus === 'done' ? 'todo' : 'done' })
  }

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header-section">
        <h1>Witaj w Twoim LifeOS 👋</h1>
        <p>Oto Twój plan na dziś.</p>
      </div>

      <div className="dashboard-grid">
        {/* Inbox Section */}
        <section className="dashboard-card inbox-card">
          <div className="card-header">
            <div className="card-title">
              <PlusCircle size={20} color="var(--primary)" />
              <span>Szybki zapis (Inbox)</span>
            </div>
          </div>
          <div className="inbox-input-wrapper">
            <input 
              type="text" 
              placeholder="Co masz na myśli? (Enter by dodać)" 
              value={inboxText}
              onChange={(e) => setInboxText(e.target.value)}
              onKeyDown={handleInboxSubmit}
            />
            <Plus size={18} />
          </div>
        </section>

        {/* Today (Na Teraz) Section */}
        <section className="dashboard-card today-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--success)" />
              <span>Na Teraz</span>
            </div>
            <Link to="/tasks" className="view-all">Zobacz wszystkie</Link>
          </div>
          <div className="today-content">
            {(!todayTasks?.length && !todayEvents?.length && !todayDoneTasks?.length) ? (
              <div className="empty-state">
                <Lightbulb size={32} color="var(--text-muted)" />
                <p>Brak zadań na dziś. Czas na odpoczynek!</p>
              </div>
            ) : (
              <div className="dashboard-list-container">
                <ul className="dashboard-list">
                  {todayEvents?.map(event => (
                    <li key={event.id} className="event-item">
                      <div className="item-time"><Clock size={14} /> {formatTime(event.startDate)}</div>
                      <div className="item-details">
                        <span className="item-title">{event.title}</span>
                        <span className="item-type">Spotkanie</span>
                      </div>
                    </li>
                  ))}
                  {todayTasks?.map(task => (
                    <li key={task.id} className="task-item">
                      <div 
                        className="dashboard-checkbox"
                        onClick={() => toggleTask(task.id, task.status)}
                      >
                        <Check size={12} className="check-hidden" />
                      </div>
                      <span className="item-title">{task.title}</span>
                      <span className={`priority-dot ${task.priority}`}></span>
                    </li>
                  ))}
                </ul>

                {todayDoneTasks?.length > 0 && (
                  <div className="completed-divider">
                    <span>Ukończone dzisiaj</span>
                  </div>
                )}

                <ul className="dashboard-list done">
                  {todayDoneTasks?.map(task => (
                    <li key={task.id} className="task-item done">
                      <div 
                        className="dashboard-checkbox checked"
                        onClick={() => toggleTask(task.id, task.status)}
                      >
                        <Check size={12} />
                      </div>
                      <span className="item-title">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Future Preview Section */}
        <section className="dashboard-card week-card">
          <div className="card-header">
            <div className="card-title">
              <CalendarIcon size={20} color="var(--secondary)" />
              <span>Następne 7 dni</span>
            </div>
          </div>
          <div className="week-preview">
            {!nextWeekItems?.length ? (
              <p className="empty-text">Brak nadchodzących spraw.</p>
            ) : (
              <ul className="compact-list">
                {nextWeekItems.slice(0, 5).map(item => (
                  <li key={item.id} className="compact-item">
                    <span className={`compact-type-indicator ${item.type}`}></span>
                    <span className="item-date">
                      {new Date(item.dueDate || item.startDate).toLocaleDateString('pl-PL', {day: 'numeric', month: 'short'})}
                    </span>
                    <span className="item-title">{item.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Areas Section */}
        <section className="dashboard-card areas-grid-card">
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setIsAreasVisible(!isAreasVisible)}>
            <div className="card-title">
              <Layers size={20} color="var(--accent)" />
              <span>Twoje Obszary</span>
              {isAreasVisible ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>
            <Link to="/areas" className="view-all" onClick={(e) => e.stopPropagation()}>Zarządzaj</Link>
          </div>
          
          {isAreasVisible && (
            <div className="areas-grid">
              {areas?.map(area => (
                <Link to={`/areas/${area.id}`} key={area.id} className="area-tile" style={{'--area-color': area.color}}>
                  <div className="area-icon">
                    <div style={{width: 32, height: 32, borderRadius: '8px', backgroundColor: area.color + '20', color: area.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: area.color}}></div>
                    </div>
                  </div>
                  <div className="area-info">
                    <span className="area-name">{area.name}</span>
                    <span className="area-stats">
                      {allTasks.filter(t => t.areaId === area.id).length} zadań
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
