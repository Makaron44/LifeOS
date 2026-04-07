import React, { useState } from 'react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { Layers, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaModal } from './AreaModal'
import './Areas.css'

export const AreasPage = () => {
  const areas = useSupabaseQuery('lifeos_areas') || []
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Obszary Życia</h1>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nowy obszar
        </button>
      </div>
      
      <AreaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <div className="areas-list-grid">
        {areas?.map(area => (
          <Link to={`/areas/${area.id}`} key={area.id} className="area-list-item" style={{'--area-color': area.color}}>
            <div className="area-item-icon">
              <div style={{width: 48, height: 48, borderRadius: '12px', backgroundColor: area.color + '15', color: area.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Layers size={24} />
              </div>
            </div>
            <div className="area-item-info">
              <h3>{area.name}</h3>
              <p>Zarządzaj zadaniami i notatkami w tym obszarze.</p>
            </div>
            <ChevronRight size={20} className="chevron" />
          </Link>
        ))}
      </div>
    </div>
  )
}
