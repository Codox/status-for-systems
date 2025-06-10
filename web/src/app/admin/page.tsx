'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api'

interface Stats {
  totalGroups: number
  totalComponents: number
  activeIncidents: number
  operationalComponents: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalComponents: 0,
    activeIncidents: 0,
    operationalComponents: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchWithAuth('/api/admin/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        setError('Failed to load dashboard statistics')
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [])

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your system status dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Groups */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Groups
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalGroups}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Components */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Components
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalComponents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Incidents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeIncidents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Components */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Operational Components
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.operationalComponents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500">
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 