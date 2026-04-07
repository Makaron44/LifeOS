import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import '../../index.css'

export const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
