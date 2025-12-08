// hooks/useRoleAssignment.js
import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../services/api'

const useRoleAssignment = (empId) => {
  const [roles, setRoles] = useState([])
  const [userRoleIds, setUserRoleIds] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoleAssignment = async () => {
    if (!empId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const secretKey = await SecureStore.getItemAsync('auth_token')
      console.log('Fetching roles for empId:', empId)

      const res = await fetch(
        `${API_BASE_URL}/roles/assign?emp_id=${empId}`,
        {
          headers: {
            secret_key: secretKey
          }
        }
      )

      const data = await res.json()
      console.log('API Response:', data)

      // Set available roles
      if (data.roles && Array.isArray(data.roles)) {
        setRoles(data.roles)
      } else {
        setRoles([])
      }

      // Set user data and their assigned roleIds
      if (data.user) {
        setUser(data.user)
        // This is the key part - set the roleIds that are already assigned
        if (data.user.roleIds && Array.isArray(data.user.roleIds)) {
          console.log('User already has these roles assigned:', data.user.roleIds)
          setUserRoleIds(data.user.roleIds)
        } else {
          setUserRoleIds([])
        }
      } else {
        setUserRoleIds([])
      }
    } catch (error) {
      console.error('Error fetching role assignment:', error.message)
      setError(error.message)
      setRoles([])
      setUserRoleIds([])
    } finally {
      setLoading(false)
    }
  }

  const assignRoles = async (employeeId, roleIds) => {
    try {
      setLoading(true)
      const secretKey = await SecureStore.getItemAsync('auth_token')

      // Prepare payload in the correct format: { id, roleIds }
      const payload = {
        id: employeeId,
        roleIds: roleIds
      }

      console.log('Assigning roles with payload:', payload)

      const res = await fetch(
        `${API_BASE_URL}/roles/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey
          },
          body: JSON.stringify(payload)
        }
      )

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Get response as text first to check what we're receiving
      const responseText = await res.text()
      console.log('Raw API Response:', responseText)

      // Try to parse as JSON, if it fails, handle as plain text
      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed JSON Response:', data)

        if (data.roles && Array.isArray(data.roles)) {
          setRoles(data.roles)
        }

        if (data.user) {
          setUser(data.user)
          if (Array.isArray(data.user.roleIds)) {
            setUserRoleIds(data.user.roleIds)
          }
        }
      } catch (parseError) {
        // If response is not JSON (e.g., plain text message)
        console.log('Response is not JSON, treating as success message:', responseText)
        data = { 
          success: true, 
          message: responseText,
          roleIds: roleIds 
        }
        // Update local state with the assigned roles
        setUserRoleIds(roleIds)
      }

      return data
    } catch (error) {
      console.error('Error assigning roles:', error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Helper function to flatten nested roles
  const flattenRoles = (rolesArray) => {
    let flatList = []

    const flatten = (items) => {
      items.forEach(item => {
        flatList.push({
          id: item.id,
          name: item.name,
          hasChildren: item.children && item.children.length > 0
        })

        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      })
    }

    flatten(rolesArray)
    return flatList
  }

  // Helper function to check if user has a specific role
  const hasRole = (roleId) => {
    return userRoleIds.includes(roleId)
  }

  useEffect(() => {
    fetchRoleAssignment()
  }, [empId])

  return {
    roles,
    userRoleIds,
    user,
    loading,
    error,
    fetchRoleAssignment,
    assignRoles,
    flattenRoles,
    hasRole
  }
}

export default useRoleAssignment
