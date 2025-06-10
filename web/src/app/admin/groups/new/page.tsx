'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth } from '@/lib/api'

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewGroupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    components: [] as string[]
  })
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const response = await fetchWithAuth('/admin/components')
        const data = await response.json()
        setAvailableComponents(data)
      } catch (err) {
        setError('Failed to load components. Please try again.')
        console.error('Error loading components:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadComponents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetchWithAuth('/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create group')
      }

      router.push('/admin/groups')
    } catch (err) {
      setError('Failed to create group. Please try again.')
      console.error('Error creating group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleComponentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      components: checked 
        ? [...prev.components, value]
        : prev.components.filter(id => id !== value)
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading components...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/groups"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Groups
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Group</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new group to organize your system components. Groups help you categorize and manage related components together, making it easier to monitor and maintain your system's health.
          </p>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter group name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter group description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Components
              </label>
              <div className="mt-1 space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                {availableComponents.length > 0 ? (
                  availableComponents.map((component) => (
                    <div key={component._id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`component-${component._id}`}
                          name="components"
                          type="checkbox"
                          value={component._id}
                          checked={formData.components.includes(component._id)}
                          onChange={handleComponentChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          htmlFor={`component-${component._id}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          {component.name}
                        </label>
                        <p className="text-sm text-gray-500">{component.description}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          component.status === 'operational' ? 'bg-green-100 text-green-800' :
                          component.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                          component.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                          component.status === 'major' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {component.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No components available</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 