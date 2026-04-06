import React, { useState } from 'react'
import { Sun, Moon, Search, User } from 'lucide-react'
import { SearchModal } from '../shared/SearchModal'

export const Header = ({ theme, toggleTheme }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-search" onClick={() => setIsSearchOpen(true)} style={{ cursor: 'pointer' }}>
          <Search size={18} />
          <input type="text" placeholder="Szukaj wszystkiego... (Ctrl+K)" readOnly style={{ cursor: 'pointer' }} />
        </div>
        
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <span>Użytkownik</span>
          </div>
        </div>
      </header>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}
