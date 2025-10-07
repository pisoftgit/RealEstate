import { useState, useEffect } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../services/api'

export const getAuthHeaders = async () => {
  const secretKey = await SecureStore.getItemAsync('auth_token')

  if (!secretKey) {
    console.warn('No secret key found!')
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      secret_key: secretKey
    }
  }
}

export default function useParkingTypes() {
  const [parkingTypes, setParkingTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchParkingTypes = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/parking-types/getAllParkingTypes`, headers)
      
      const rawData = response?.data
      if (!Array.isArray(rawData)) {
        throw new Error('Invalid data format: expected an array')
      }
      
      const formatted = rawData.map(item => ({
        id: item.id,
        label: item.type,
        value: item.id,
        type: item.type
      }))

      setParkingTypes(formatted)
    } catch (err) {
      console.error('Error fetching parking types:', err.message)
      setError('Failed to fetch parking types')
      setParkingTypes([])
    } finally {
      setLoading(false)
    }
  }

  const getParkingTypeById = async (id) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/parking-types/getParkingTypeById/${id}`, headers)
      return response.data?.data
    } catch (err) {
      console.error('Error fetching parking type by ID:', err.message)
      setError('Failed to fetch parking type')
      throw err
    }
  }

  const saveParkingType = async (typeName) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.post(
        `${API_BASE_URL}/parking-types/saveParkingType`,
        { type: typeName },
        headers
      )
      await fetchParkingTypes()
      return response.data
    } catch (err) {
      console.error('Error saving parking type:', err.message)
      throw new Error('Failed to save parking type')
    }
  }

  const updateParkingType = async (id, typeName) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.put(
        `${API_BASE_URL}/parking-types/updateParkingType/${id}`,
        { type: typeName },
        headers
      )
      await fetchParkingTypes()
      return response.data
    } catch (err) {
      console.error('Error updating parking type:', err.response?.data || err.message)
      throw new Error('Failed to update parking type')
    }
  }

  const deleteParkingType = async (id) => {
    try {
      const headers = await getAuthHeaders()
      await axios.delete(`${API_BASE_URL}/parking-types/deleteParkingType/${id}`, headers)
      await fetchParkingTypes()
    } catch (err) {
      console.error('Error deleting parking type:', err.message)
      throw new Error('Failed to delete parking type')
    }
  }

  useEffect(() => {
    fetchParkingTypes()
  }, [])

  return {
    parkingTypes,
    loading,
    error,
    fetchParkingTypes,
    getParkingTypeById,
    saveParkingType,
    updateParkingType,
    deleteParkingType
  }
}
