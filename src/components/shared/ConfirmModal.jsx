import React from 'react'
import { AlertCircle } from 'lucide-react'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="modal-header" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
            <AlertCircle size={32} />
          </div>
        </div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
        
        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onClose} className="secondary-btn" style={{ flex: 1 }}>Anuluj</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="primary-btn" 
            style={{ flex: 1, backgroundColor: 'var(--danger)', border: 'none' }}
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  )
}
