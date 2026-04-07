import React, { useState, useEffect } from 'react'
import { Sun, Moon, Search, User } from 'lucide-react'
import { SearchModal } from '../shared/SearchModal'

export const Header = ({ theme, toggleTheme }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      <header className={`header ${isHidden ? 'header-hidden' : ''}`}>
        <div className="header-search-trigger" onClick={() => setIsSearchOpen(true)}>
          <Search size={18} className="search-icon" />
          <span>Szukaj...</span>
          <kbd className="search-kbd">⌘K</kbd>
        </div>
        
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Przełącz motyw">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="header-user">
            <div className="avatar-circle">
              <User size={18} />
            </div>
            <span className="user-name">Użytkownik</span>
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
