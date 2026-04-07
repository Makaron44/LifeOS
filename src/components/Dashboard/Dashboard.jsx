import React, { useState, useMemo } from 'react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { supabase } from '../../db/supabaseClient'
import { useAuth } from '../../context/AuthContext'
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
  Layers,
  Search,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

export const Dashboard = () => {
  const [inboxText, setInboxText] = useState('')
  const [isAreasVisible, setIsAreasVisible] = useState(true)
  
  const { user } = useAuth()
  const areas = useSupabaseQuery('lifeos_areas') || []
  const allTasks = useSupabaseQuery('lifeos_tasks') || []
  const allEvents = useSupabaseQuery('lifeos_events') || []
  
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const todayTasks = useMemo(() => 
    allTasks.filter(t => t.due_date === todayStr && t.status !== 'done'),
    [allTasks, todayStr]
  )
  
  const todayDoneTasks = useMemo(() => 
    allTasks.filter(t => t.due_date === todayStr && t.status === 'done'),
    [allTasks, todayStr]
  )

  const todayEvents = useMemo(() => 
    allEvents.filter(e => e.start_date && e.start_date.startsWith(todayStr)),
    [allEvents, todayStr]
  )

  const nextWeekItems = useMemo(() => {
    if (!allTasks.length && !allEvents.length) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 8)
    
    const weekEndStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`
    
    const tasksNext = allTasks.filter(t => t.due_date > todayStr && t.due_date < weekEndStr && t.status !== 'done')
    const eventsNext = allEvents.filter(e => e.start_date > todayStr && e.start_date < weekEndStr + 'T23:59:59')
    
    return [
      ...tasksNext.map(t => ({...t, type: 'task', date: t.due_date})), 
      ...eventsNext.map(e => ({...e, type: 'event', date: e.start_date}))
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [allTasks, allEvents, todayStr])

  const handleInboxSubmit = async (e) => {
    if (e.key === 'Enter' && inboxText.trim()) {
      if (!user) return;
      const { error } = await supabase.from('lifeos_tasks').insert({
        title: inboxText.trim(),
        status: 'inbox',
        priority: 'medium',
        due_date: todayStr,
        user_id: user.id
      })
      if (error) {
        alert('Błąd zapisu: ' + error.message)
      } else {
        setInboxText('')
      }
    }
  }

  const toggleTask = async (id, currentStatus) => {
    await supabase.from('lifeos_tasks').update({ 
      status: currentStatus === 'done' ? 'todo' : 'done' 
    }).eq('id', id)
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const getAreaName = (areaId) => areas.find(a => a.id === areaId)?.name || 'Brak obszaru'
  const getAreaColor = (areaId) => areas.find(a => a.id === areaId)?.color || 'var(--primary)'

  return (
    <div className="dashboard">
      <div className="dashboard-header-section">
        <h1>Witaj w LifeOS 👋</h1>
        <p>Oto Twój inteligentny plan na dziś.</p>
      </div>

      <div className="dashboard-grid">
        {/* Inbox Section */}
        <section className="dashboard-card inbox-card">
          <div className="card-header">
            <div className="card-title">
              <PlusCircle size={20} color="var(--primary)" />
              <span>Szybki zapis</span>
            </div>
          </div>
          <div className="inbox-input-wrapper">
            <input 
              type="text" 
              placeholder="Co masz na myśli? (Wciśnij Enter)" 
              value={inboxText}
              onChange={(e) => setInboxText(e.target.value)}
              onKeyDown={handleInboxSubmit}
            />
            <Link to="/tasks" title="Przejdź do zadań">
              <ArrowRight size={20} color="var(--text-muted)" />
            </Link>
          </div>
        </section>

        {/* Today (Na Teraz) Section */}
        <section className="dashboard-card today-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={22} color="var(--success)" />
              <span>Na Teraz</span>
            </div>
            <Link to="/tasks" className="view-all">Szczegóły</Link>
          </div>
          
          <div className="today-content">
            {(!todayTasks.length && !todayEvents.length && !todayDoneTasks.length) ? (
              <div className="empty-state" style={{ padding: '2rem 0', textAlign: 'center', opacity: 0.6 }}>
                <Lightbulb size={40} style={{ marginBottom: '1rem' }} />
                <p>Twoja lista na dziś jest pusta.</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {/* Events First */}
                {todayEvents.map(event => (
                  <div key={event.id} className="event-item glass-item">
                    <div className="item-time">
                      <Clock size={14} />
                      {formatTime(event.start_date)}
                    </div>
                    <div className="item-details">
                      <div className="item-main">
                        <span className="item-title">{event.title}</span>
                      </div>
                      <div className="item-meta">
                        <span className="item-type" style={{ color: getAreaColor(event.area_id) }}>
                          {getAreaName(event.area_id)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tasks */}
                {todayTasks.map(task => (
                  <div key={task.id} className="task-item glass-item">
                    <div 
                      className="dashboard-checkbox"
                      onClick={() => toggleTask(task.id, task.status)}
                    >
                      <Check size={14} />
                    </div>
                    <div className="item-details" style={{ flex: 1 }}>
                      <div className="item-main">
                        <span className="item-title">{task.title}</span>
                      </div>
                      <div className="item-meta">
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority === 'urgent' ? 'Pilne' : task.priority === 'high' ? 'Ważne' : ''}
                        </span>
                        <span className="item-type" style={{ color: getAreaColor(task.area_id) }}>
                          {getAreaName(task.area_id)}
                        </span>
                      </div>
                    </div>
                    <div className="priority-dot" style={{ backgroundColor: getAreaColor(task.area_id) }}></div>
                  </div>
                ))}

                {/* Done Section */}
                {todayDoneTasks.length > 0 && (
                  <>
                    <div className="completed-divider">Ukończone</div>
                    {todayDoneTasks.map(task => (
                      <div key={task.id} className="task-item done glass-item">
                        <div 
                          className="dashboard-checkbox checked"
                          onClick={() => toggleTask(task.id, task.status)}
                        >
                          <Check size={14} />
                        </div>
                        <span className="item-title">{task.title}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Future Preview */}
        <section className="dashboard-card week-card">
          <div className="card-header">
            <div className="card-title">
              <CalendarIcon size={22} color="var(--secondary)" />
              <span>Nadchodzące</span>
            </div>
          </div>
          <div className="week-preview">
            {!nextWeekItems.length ? (
              <p style={{ opacity: 0.5, padding: '1rem 0' }}>Brak planów na najbliższe dni.</p>
            ) : (
              <div className="compact-list">
                {nextWeekItems.slice(0, 6).map(item => (
                  <div key={item.id} className="compact-item">
                    <div 
                      className="item-indicator" 
                      style={{ 
                        width: 4, 
                        height: 20, 
                        borderRadius: 2, 
                        background: item.type === 'task' ? 'var(--primary)' : 'var(--secondary)' 
                      }} 
                    />
                    <span className="item-date">
                      {new Date(item.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="item-title" style={{ fontSize: '0.9rem' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Areas Section */}
        <section className="dashboard-card areas-grid-card">
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setIsAreasVisible(!isAreasVisible)}>
            <div className="card-title">
              <Layers size={22} color="var(--accent)" />
              <span>Obszary Życia</span>
              {isAreasVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            <Link to="/areas" className="view-all" onClick={(e) => e.stopPropagation()}>Edytuj</Link>
          </div>
          
          {isAreasVisible && (
            <div className="areas-grid">
              {areas.map(area => {
                const areaTasksCount = allTasks.filter(t => t.area_id === area.id && t.status !== 'done').length
                return (
                  <Link to={`/areas/${area.id}`} key={area.id} className="area-tile" style={{'--area-color': area.color}}>
                    <div className="area-icon">
                      <div style={{
                        width: 38, 
                        height: 38, 
                        borderRadius: '12px', 
                        backgroundColor: area.color + '15', 
                        color: area.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <Layers size={20} />
                      </div>
                    </div>
                    <div className="area-info">
                      <span className="area-name">{area.name}</span>
                      <span className="area-stats">
                        {areaTasksCount} aktywnych zadań
                      </span>
                    </div>
                    <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
