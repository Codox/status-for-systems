'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/utils/auth.utils';
import CreateGroupModal from '@/app/components/CreateGroupModal';
import CreateComponentModal from '@/app/components/CreateComponentModal';
import UpdateComponentModal from '@/app/components/UpdateComponentModal';
import UpdateGroupModal from '@/app/components/UpdateGroupModal';

interface Component {
  _id: string;
  name: string;
  status: string;
  description?: string;
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

const COMPONENT_STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  operational: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: '✓',
    label: 'Operational'
  },
  degraded: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: '⚠',
    label: 'Degraded'
  },
  partial: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '◐',
    label: 'Partial Outage'
  },
  major: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: '✕',
    label: 'Major Outage'
  },
  under_maintenance: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '🔧',
    label: 'Under Maintenance'
  },
};

export default function AdminComponentsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [ungroupedComponents, setUngroupedComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateComponentModalOpen, setIsCreateComponentModalOpen] = useState(false);
  const [isUpdateComponentModalOpen, setIsUpdateComponentModalOpen] = useState(false);
  const [isUpdateGroupModalOpen, setIsUpdateGroupModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const componentsResponse = await fetch('/api/admin/components', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!componentsResponse.ok) {
        throw new Error('Failed to fetch components');
      }

      const fetchedAllComponents = await componentsResponse.json();

      const groupsResponse = await fetch('/api/admin/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups');
      }

      const fetchedGroups = await groupsResponse.json();

      const groupedComponentIds = new Set<string>();
      for (const group of fetchedGroups) {
        for (const component of group.components) {
          groupedComponentIds.add(component._id);
        }
      }

      const fetchedUngroupedComponents = fetchedAllComponents.filter(
        (component: Component) => !groupedComponentIds.has(component._id)
      );

      setAllComponents(fetchedAllComponents);
      setGroups(fetchedGroups);
      setUngroupedComponents(fetchedUngroupedComponents);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication')) {
        router.push('/admin/login');
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to load components');
      setIsLoading(false);
    }
  };

  const refreshComponents = async () => {
    setIsLoading(true);
    setError(null);
    await loadComponents();
  };

  const handleCreateGroupClick = () => {
    setIsFABOpen(false);
    setIsCreateGroupModalOpen(true);
  };

  const handleCreateGroupModalClose = () => {
    setIsCreateGroupModalOpen(false);
  };

  const handleCreateGroupSuccess = () => {
    refreshComponents();
  };

  const handleCreateComponentClick = () => {
    setIsFABOpen(false);
    setIsCreateComponentModalOpen(true);
  };

  const handleCreateComponentModalClose = () => {
    setIsCreateComponentModalOpen(false);
  };

  const handleCreateComponentSuccess = () => {
    refreshComponents();
  };

  const handleEditComponentClick = (component: Component) => {
    setSelectedComponent(component);
    setIsUpdateComponentModalOpen(true);
  };

  const handleUpdateComponentModalClose = () => {
    setIsUpdateComponentModalOpen(false);
    setSelectedComponent(null);
  };

  const handleUpdateComponentSuccess = () => {
    refreshComponents();
  };

  const handleEditGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setIsUpdateGroupModalOpen(true);
  };

  const handleUpdateGroupModalClose = () => {
    setIsUpdateGroupModalOpen(false);
    setSelectedGroup(null);
  };

  const handleUpdateGroupSuccess = () => {
    refreshComponents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Components
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage system components and assign them to groups
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Groups Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Grouped Components ({groups.reduce((sum, group) => sum + group.components.length, 0)})
                  </h2>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {groups.length === 0 ? (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-400">No groups found</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">Create your first group to organize components</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <div key={group._id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                        <details className="group">
                          <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{group.name}</h3>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{group.description}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                {group.components.length} {group.components.length === 1 ? 'component' : 'components'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditGroupClick(group);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Edit Group"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <svg className="w-5 h-5 text-zinc-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </summary>
                          <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                            {group.components.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-500">
                                No components in this group
                              </p>
                            ) : (
                              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {group.components.map((component) => (
                                  <ComponentTile key={component._id} component={component} formatDate={formatDate} onEditClick={handleEditComponentClick} />
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ungrouped Components Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Ungrouped Components ({ungroupedComponents.length})
                  </h2>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Not assigned to any group
                  </span>
                </div>
              </div>

              <div className="p-4">
                {ungroupedComponents.length === 0 ? (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto text-green-300 dark:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-400">All components are grouped</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">Every component has been assigned to a group</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    {ungroupedComponents.map((component) => (
                      <ComponentTile key={component._id} component={component} formatDate={formatDate} onEditClick={handleEditComponentClick} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB Menu */}
      {!isLoading && (
        <>
          {/* Backdrop overlay when menu is open */}
          {isFABOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsFABOpen(false)}
            />
          )}

          <div className="fixed bottom-8 right-8 z-50">
            {/* FAB Menu List */}
            {isFABOpen && (
              <div className="absolute bottom-16 right-0 mb-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={handleCreateGroupClick}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-700"
                >
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Create Group</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">New component group</div>
                  </div>
                </button>

                <button
                  onClick={handleCreateComponentClick}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Create Component</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">New system component</div>
                  </div>
                </button>
              </div>
            )}

            {/* Main FAB Button */}
            <button
              onClick={() => setIsFABOpen(!isFABOpen)}
              className="group relative w-14 h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
              aria-label="Create menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6h.01M12 12h.01M12 18h.01" />
              </svg>
              
              {/* Ripple Effect on Hover */}
              <span className="absolute inset-0 rounded-full bg-white dark:bg-zinc-900 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
            </button>
          </div>
        </>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={handleCreateGroupModalClose}
        onSuccess={handleCreateGroupSuccess}
      />

      {/* Create Component Modal */}
      <CreateComponentModal
        isOpen={isCreateComponentModalOpen}
        onClose={handleCreateComponentModalClose}
        onSuccess={handleCreateComponentSuccess}
      />

      {/* Update Component Modal */}
      <UpdateComponentModal
        isOpen={isUpdateComponentModalOpen}
        component={selectedComponent}
        onClose={handleUpdateComponentModalClose}
        onSuccess={handleUpdateComponentSuccess}
      />

      {/* Update Group Modal */}
      <UpdateGroupModal
        isOpen={isUpdateGroupModalOpen}
        group={selectedGroup}
        onClose={handleUpdateGroupModalClose}
        onSuccess={handleUpdateGroupSuccess}
      />
    </>
  );
}

function ComponentTile({ component, formatDate, onEditClick }: { component: Component; formatDate: (date: string) => string; onEditClick: (component: Component) => void }) {
  const statusConfig = COMPONENT_STATUS_CONFIG[component.status] || {
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    icon: '?',
    label: component.status
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${statusConfig.color}`}>
        {statusConfig.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{component.name}</h4>
        {component.description && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{component.description}</p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          Created: {formatDate(component.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
        <button
          onClick={() => onEditClick(component)}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit Component"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
