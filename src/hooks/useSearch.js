import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

export const useSearch = (query) => {
  const tasks = useLiveQuery(() => 
    db.tasks.toArray().then(items => 
      items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    ), [query]
  ) || []

  const events = useLiveQuery(() => 
    db.events.toArray().then(items => 
      items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    ), [query]
  ) || []

  const notes = useLiveQuery(() => 
    db.notes.toArray().then(items => 
      items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      )
    ), [query]
  ) || []

  return { tasks, events, notes }
}
