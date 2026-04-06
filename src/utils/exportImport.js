import { db } from '../db/database'

export const exportData = async () => {
  const allData = {
    areas: await db.areas.toArray(),
    tasks: await db.tasks.toArray(),
    events: await db.events.toArray(),
    notes: await db.notes.toArray(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }

  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `LifeOS_Backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        // Basic validation
        if (!data.areas || !data.tasks) {
          throw new Error('Nieprawidłowy format pliku LifeOS.')
        }

        // Clear existing data (optional, but cleaner for full restore)
        await db.areas.clear()
        await db.tasks.clear()
        await db.events.clear()
        await db.notes.clear()

        // Bulk add imported data
        if (data.areas.length > 0) await db.areas.bulkAdd(data.areas)
        if (data.tasks.length > 0) await db.tasks.bulkAdd(data.tasks)
        if (data.events.length > 0) await db.events.bulkAdd(data.events)
        if (data.notes.length > 0) await db.notes.bulkAdd(data.notes)

        resolve(true)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
}
