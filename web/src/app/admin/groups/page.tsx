'use client'

import { useEffect, useState } from 'react'
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

interface Group {
  _id: string;
  name: string;
  description: string;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchWithAuth('/admin/groups')
        const data: Group[] = await response.json()
        setGroups(data)
      } catch (err) {
        setError('Failed to load groups. Please check your network and try again.')
        console.error('Error fetching groups:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGroups()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading groups...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your service groups and their components
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/groups/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Group
          </Link>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {groups.length > 0 ? (
            groups.map((group: Group) => (
              <li key={group._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {group.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {group.components?.length || 0} components
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Link
                        href={`/admin/groups/${group._id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {group.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No groups found. Create your first group to get started.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
} 