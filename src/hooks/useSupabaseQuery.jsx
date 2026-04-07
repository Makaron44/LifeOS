import { useState, useEffect } from 'react'
import { supabase } from '../db/supabaseClient'

export function useSupabaseQuery(tableName, filterFn = null, dependencies = []) {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      const { data: result, error } = await supabase.from(tableName).select('*')
      if (error) {
        console.error(`Error fetching ${tableName}:`, error)
        if (isMounted) setData([])
        return
      }
      
      if (isMounted) {
        let finalData = result || []
        if (filterFn) {
          finalData = finalData.filter(filterFn)
        }
        setData(finalData)
        setLoading(false)
      }
    }

    fetchData()

    const channel = supabase.channel(`public:${tableName}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData() // Naive but robust strategy: refetch all on any change
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, ...dependencies])

  return data
}
