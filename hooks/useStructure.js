import { useState, useEffect } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../services/api'

const getAuthToken = async () => {
  return await SecureStore.getItemAsync('auth_token')
}

export default function useStructure () {
  const [structures, setStructures] = useState([])
  const [structureTypes, setStructureTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStructures = async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      const res = await axios.get(
        `${API_BASE_URL}/flat-house-structures/getAllFlatHouseStructures`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: token
          }
        }
      )

      const formatted = res.data.map(item => ({
        id: item.id,
        structureName: item.structureName,
        structure: item.structure,
        flatHouseStructureType: item.flatHouseStructureType
      }))

      setStructures(formatted)
      setError(null)
    } catch (err) {
      console.error('Fetch structures error:', err.message)
      setError('Failed to fetch structures')
    } finally {
      setLoading(false)
    }
  }

  const fetchStructureTypes = async () => {
    try {
      const token = await getAuthToken()
      const res = await axios.get(
        `${API_BASE_URL}/flat-house-structures/getFlatHouseStructureTypes`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: token
          }
        }
      )
      setStructureTypes(res.data)
    } catch (err) {
      console.error('Fetch structure types error:', err.message)
    }
  }

  const addStructure = async (structureName, flatHouseStructureTypeId) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      const headers = {
        secret_key: token
      }

      await axios.post(
        `${API_BASE_URL}/flat-house-structures/saveFlatHouseStructure`,
        {
          structureName,
          flatHouseStructureType: {
            id: flatHouseStructureTypeId
          }
        },
        { headers }
      )

      await fetchStructures()
    } catch (err) {
      console.error('Add structure error:', err.response?.data || err.message)
      throw err
    }
  }

  const updateStructure = async (
    id,
    structureName,
    flatHouseStructureTypeId
  ) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')

      const headers = {
        secret_key: token
      }

      await axios.put(
        `${API_BASE_URL}/flat-house-structures/updateFlatHouseStructure/${id}`,
        {
          structureName,
          flatHouseStructureType: {
            id: flatHouseStructureTypeId
          }
        },
        { headers }
      )

      await fetchStructures()
    } catch (err) {
      console.error(
        'Update structure error:',
        err.response?.data || err.message
      )
      throw err
    }
  }

  // Delete structure
  const deleteStructure = async id => {
    try {
      const token = await getAuthToken()
      await axios.delete(
        `${API_BASE_URL}/flat-house-structures/deleteFlatHouseStructure/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: token
          }
        }
      )
      await fetchStructures()
    } catch (err) {
      console.error('Delete structure error:', err.message)
      throw err
    }
  }

  const getStructureById = async id => {
    try {
      const token = await getAuthToken()
      const res = await axios.get(
        `${API_BASE_URL}/flat-house-structures/getFlatHouseStructureById${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: token
          }
        }
      )
      return res.data
    } catch (err) {
      console.error('Get structure by ID error:', err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchStructures()
    fetchStructureTypes()
  }, [])

  return {
    structures,
    structureTypes,
    loading,
    error,
    fetchStructures,
    addStructure,
    updateStructure,
    deleteStructure,
    getStructureById
  }
}
