import React, { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from 'lucide-react'
import './Calendar.css'

export const CalendarView = ({ events, areas, onEdit, onAdd }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getAreaColor = (areaId) => areas?.find(a => a.id === areaId)?.color || 'var(--primary)'

  // ... (rest of helper functions same)
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const totalDays = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)
  
  const adjustedStartDay = (startDay === 0 ? 6 : startDay - 1)

  const days = []
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayEvents = events?.filter(e => e.start_date?.startsWith(dateStr))
    const isToday = new Date().toISOString().split('T')[0] === dateStr

    const handleDayClick = () => {
      if (dayEvents && dayEvents.length > 0) {
        onEdit(dayEvents[0])
      } else {
        onAdd(dateStr)
      }
    }

    days.push(
      <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={handleDayClick}>
        <span className="day-number">{d}</span>
        <div className="day-dots">
          {dayEvents?.map(event => (
            <div 
              key={event.id} 
              className="calendar-event-dot" 
              style={{ backgroundColor: getAreaColor(event.area_id) }}
              onClick={(e) => { e.stopPropagation(); onEdit(event); }}
              title={event.title}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header-nav">
        <h2>{monthNames[month]} {year}</h2>
        <div className="nav-buttons">
          <button onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())}>Dziś</button>
          <button onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekday">Pn</div>
        <div className="weekday">Wt</div>
        <div className="weekday">Śr</div>
        <div className="weekday">Czw</div>
        <div className="weekday">Pt</div>
        <div className="weekday">Sob</div>
        <div className="weekday">Ndz</div>
        {days}
      </div>
    </div>
  )
}
