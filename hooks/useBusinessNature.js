// hooks/useBusinessNature.js
import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../services/api'

const useBusinessNature = () => {
  const [businessNatures, setBusinessNatures] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBusinessNatures = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token')
      console.log('Secret Key:', secretKey)

      const res = await fetch(
        `${API_BASE_URL}/business-nature/getAllBusinessNatures`,
        {
          headers: {
            secret_key: secretKey
          }
        }
      )

      const data = await res.json()
      console.log('API Response:', data)

      const list = data.data || data 
      if (Array.isArray(list)) {
        const mappedList = list.map(item => ({
          id: item.id, 
          name: item.nature,
          code: item.code
        }))
        setBusinessNatures(mappedList)
      } else {
        setBusinessNatures([])
      }
    } catch (error) {
      console.error('Error fetching business natures:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinessNatures()
  }, [])

  return { businessNatures, loading }
}

export default useBusinessNature
