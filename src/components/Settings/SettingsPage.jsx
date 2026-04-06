import React, { useState } from 'react'
import { exportData, importData } from '../../utils/exportImport'
import { Download, Upload, Trash2, Database, ShieldAlert } from 'lucide-react'
import { db } from '../../db/database'

export const SettingsPage = () => {
  const [importStatus, setImportStatus] = useState('')

  const handleExport = async () => {
    try {
      await exportData()
    } catch (err) {
      alert('Błąd eksportu: ' + err.message)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (window.confirm('UWAGA: Import danych nadpisze Twoją aktualną bazę LifeOS. Czy na pewno chcesz kontynuować?')) {
      setImportStatus('Importowanie...')
      try {
        await importData(file)
        setImportStatus('Import zakończony sukcesem! Odśwież stronę.')
        window.location.reload()
      } catch (err) {
        setImportStatus('Błąd importu: ' + err.message)
      }
    }
  }

  const clearData = async () => {
    if (window.confirm('CZY NA PEWNO chcesz usunąć WSZYSTKIE dane? Tej operacji nie można cofnąć.')) {
      await db.areas.clear()
      await db.tasks.clear()
      await db.events.clear()
      await db.notes.clear()
      window.location.reload()
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
            <Database size={24} color="var(--primary)" />
            <div>
              <h3>Zarządzanie danymi</h3>
              <p>Eksportuj i importuj swoje dane w formacie JSON.</p>
            </div>
          </div>
          
          <div className="settings-actions">
            <button className="settings-btn" onClick={handleExport}>
              <Download size={18} /> Eksportuj kopię (Backup)
            </button>
            <div className="file-input-wrapper">
              <button className="settings-btn secondary">
                <Upload size={18} /> Importuj z pliku
              </button>
              <input type="file" accept=".json" onChange={handleImport} />
            </div>
            {importStatus && <p className="status-msg">{importStatus}</p>}
          </div>
        </section>

        <section className="settings-card danger">
          <div className="settings-card-header">
            <ShieldAlert size={24} color="var(--danger)" />
            <div>
              <h3>Strefa Niebezpieczeństwa</h3>
              <p>Możesz trwale usunąć wszystkie swoje dane z urządzenia.</p>
            </div>
          </div>
          
          <div className="settings-actions">
            <button className="settings-btn danger" onClick={clearData}>
              <Trash2 size={18} /> Wyczyść wszystkie dane (Reset)
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
