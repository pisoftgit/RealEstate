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
      secret_key: secretKey,
    },
  }
}

export default function useOwnershipTypes() {
  const [ownershipTypes, setOwnershipTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOwnershipTypes = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/ownership-types/getAllOwnershipTypes`, headers)
      const data = response.data

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected an array')
      }

      setOwnershipTypes(data)
    } catch (err) {
      console.error('Error fetching ownership types:', err.response?.data || err.message)
      setError('Failed to fetch ownership types')
      setOwnershipTypes([])
    } finally {
      setLoading(false)
    }
  }

  const getOwnershipTypeById = async (id) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/getOwnershipTypeById/${id}`, headers)
      return response.data?.data || null
    } catch (err) {
      console.error('Error fetching ownership type by ID:', err.message)
      setError('Failed to fetch ownership type')
      throw err
    }
  }

  const saveOwnershipType = async (typeName) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.post(
        `${API_BASE_URL}/ownership-types/saveOwnershipType`,
        { type: typeName },
        headers
      )
      await fetchOwnershipTypes()
      return response.data
    } catch (err) {
      console.error('Error saving ownership type:', err.message)
      throw new Error('Failed to save ownership type')
    }
  }

  const updateOwnershipType = async (id, typeName) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.put(
        `${API_BASE_URL}/ownership-types/updateOwnershipType/${id}`,
        { type: typeName },
        headers
      )
      await fetchOwnershipTypes()
      return response.data
    } catch (err) {
      console.error('Error updating ownership type:', err.response?.data || err.message)
      throw new Error('Failed to update ownership type')
    }
  }

  const deleteOwnershipType = async (id) => {
    try {
      const headers = await getAuthHeaders()
      await axios.delete(`${API_BASE_URL}/ownership-types/deleteOwnershipType/${id}`, headers)
      await fetchOwnershipTypes()
    } catch (err) {
      console.error('Error deleting ownership type:', err.message)
      throw new Error('Failed to delete ownership type')
    }
  }

  useEffect(() => {
    fetchOwnershipTypes()
  }, [])

  return {
    ownershipTypes,
    loading,
    error,
    fetchOwnershipTypes,
    getOwnershipTypeById,
    saveOwnershipType,
    updateOwnershipType,
    deleteOwnershipType,
  }
}
