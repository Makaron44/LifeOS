import { useMemo } from 'react'
import { useSupabaseQuery } from './useSupabaseQuery'

export const useSearch = (query) => {
  const allTasks = useSupabaseQuery('lifeos_tasks') || []
  const allEvents = useSupabaseQuery('lifeos_events') || []
  const allNotes = useSupabaseQuery('lifeos_notes') || []

  const tasks = useMemo(() => {
    if (!query) return []
    return allTasks.filter(item => 
      item.title?.toLowerCase().includes(query.toLowerCase())
    )
  }, [allTasks, query])

  const events = useMemo(() => {
    if (!query) return []
    return allEvents.filter(item => 
      item.title?.toLowerCase().includes(query.toLowerCase())
    )
  }, [allEvents, query])

  const notes = useMemo(() => {
    if (!query) return []
    return allNotes.filter(item => 
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.content?.toLowerCase().includes(query.toLowerCase())
    )
  }, [allNotes, query])

  return { tasks, events, notes }
}
