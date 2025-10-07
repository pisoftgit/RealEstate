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

export default function useRoomTypes () {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRoomTypes = async () => {
    setLoading(true)
    setError(null)

    try {
      const config = await getAuthHeaders()
      const response = await axios.get(
        `${API_BASE_URL}/room-types/getAllRoomTypes`,
        config
      )

      const rawData = response?.data

      if (!Array.isArray(rawData)) {
        throw new Error('Invalid data format: expected an array')
      }

      const formattedRoomTypes = rawData.map(item => ({
        id: item.id,
        label: item.type,
        value: item.id,
        type: item.type
      }))

      setRoomTypes(formattedRoomTypes)
    } catch (err) {
      console.error('Error fetching room types:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })

      setError('Failed to fetch room types')
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
  }

  const getRoomTypeById = async id => {
    try {
      const config = await getAuthHeaders()
      const response = await axios.get(
        `${API_BASE_URL}/room-types/getRoomTypeById/${id}`,
        config
      )
      return response.data?.data
    } catch (err) {
      console.error('Error fetching room type by ID:', err.message)
      setError('Failed to fetch room type')
      throw err
    }
  }

  const saveRoomType = async roomTypeName => {
    try {
      const config = await getAuthHeaders()
      const response = await axios.post(
        `${API_BASE_URL}/room-types/saveRoomType`,
        { type: roomTypeName },
        config
      )

      const savedData = response?.data

      if (!savedData) {
        throw new Error('No room type data returned')
      }

      await fetchRoomTypes()
      return savedData
    } catch (err) {
      console.error('Error saving room type:', err.message)
      throw new Error('Failed to save room type')
    }
  }

  const updateRoomType = async (id, roomTypeName) => {
    try {
      const headers = await getAuthHeaders()

      const response = await axios.put(
        `${API_BASE_URL}/room-types/updateRoomType/${id}`,
        { type: roomTypeName },
        headers
      )

      await fetchRoomTypes()
      return response.data
    } catch (err) {
      console.error('Update error response:', err.response)
      console.error('Update error message:', err.message)
      throw new Error(
        `Failed to update room type: ${
          err.response?.data?.message || err.message
        }`
      )
    }
  }

  const deleteRoomType = async id => {
    try {
      const config = await getAuthHeaders()
      await axios.delete(
        `${API_BASE_URL}/room-types/deleteRoomType/${id}`,
        config
      )

      await fetchRoomTypes()
    } catch (err) {
      console.error('Error deleting room type:', err.message)
      throw new Error('Failed to delete room type')
    }
  }

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  return {
    roomTypes,
    loading,
    error,
    fetchRoomTypes,
    getRoomTypeById,
    saveRoomType,
    updateRoomType,
    deleteRoomType
  }
}
