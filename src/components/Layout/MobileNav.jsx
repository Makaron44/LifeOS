import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Layers,
  Settings
} from 'lucide-react'

export const MobileNav = () => {
  return (
    <nav className="mobile-nav">
      <NavLink to="/" end className="mobile-nav-link">
        <Home size={18} />
        <span>Pulpit</span>
      </NavLink>
      <NavLink to="/tasks" className="mobile-nav-link">
        <CheckSquare size={18} />
        <span>Zadania</span>
      </NavLink>
      <NavLink to="/events" className="mobile-nav-link">
        <Calendar size={18} />
        <span>Kalendarz</span>
      </NavLink>
      <NavLink to="/notes" className="mobile-nav-link">
        <StickyNote size={18} />
        <span>Notatki</span>
      </NavLink>
      <NavLink to="/areas" className="mobile-nav-link">
        <Layers size={18} />
        <span>Obszary</span>
      </NavLink>
      <NavLink to="/settings" className="mobile-nav-link">
        <Settings size={18} />
        <span>Ustawienia</span>
      </NavLink>
    </nav>
  )
}
