import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Layers, 
  Settings 
} from 'lucide-react'
import './Layout.css'

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Layers size={24} color="var(--primary)" />
        <span>LifeOS</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <CheckSquare size={20} />
          <span>Zadania</span>
        </NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Calendar size={20} />
          <span>Wydarzenia</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <StickyNote size={20} />
          <span>Notatki</span>
        </NavLink>
        <NavLink to="/areas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Layers size={20} />
          <span>Obszary</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={20} />
          <span>Ustawienia</span>
        </NavLink>
      </div>
    </aside>
  )
}
