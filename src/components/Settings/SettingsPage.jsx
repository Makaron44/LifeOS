import React, { useState } from 'react'
import { LogOut, Database, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../db/supabaseClient'

export const SettingsPage = () => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      alert('Błąd wylogowywania: ' + err.message)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Ustawienia Systemowe</h1>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-header">
            <User size={24} color="var(--primary)" />
            <div>
              <h3>Konto Supabase</h3>
              <p>Jesteś zalogowany jako: <strong>{user?.email}</strong></p>
            </div>
          </div>
          
          <div className="settings-actions">
            <button className="settings-btn secondary" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={handleLogout}>
              <LogOut size={18} /> Wyloguj się
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }
        .settings-card {
          background-color: var(--bg-secondary);
          padding: 2rem;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .settings-card.danger {
          border-color: rgba(239, 68, 68, 0.2);
        }
        .settings-card-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .settings-card-header h3 {
          font-size: 1.125rem;
          margin-bottom: 0.25rem;
        }
        .settings-card-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .settings-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .settings-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background-color: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all 0.2s;
          width: 100%;
        }
        .settings-btn:hover {
          background-color: var(--primary-hover);
        }
        .settings-btn.secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .settings-btn.danger {
          background-color: transparent;
          color: var(--danger);
          border: 1px solid var(--danger);
        }
        .settings-btn.danger:hover {
          background-color: var(--danger);
          color: white;
        }
        .file-input-wrapper {
          position: relative;
          overflow: hidden;
        }
        .file-input-wrapper input[type=file] {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .status-msg {
          font-size: 0.875rem;
          color: var(--success);
          text-align: center;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
