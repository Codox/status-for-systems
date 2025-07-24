'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { fetchWithAuth } from '@/lib/api'
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Container,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Center,
  Spinner,
  FormHelperText,
  Checkbox
} from '@chakra-ui/react'
import { ArrowBackIcon, WarningIcon, CheckIcon, InfoIcon, TimeIcon } from '@chakra-ui/icons'

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Update {
  statusUpdate?: {
    from: string | null;
    to: string;
  };
  description: string | null;
  type: string;
  componentStatusUpdates?: {
    id: string;
    from: string;
    to: string;
    _id: string;
  }[];
  createdAt: string;
  _id: string;
}

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'critical' | 'major' | 'minor' | 'none';
  affectedComponents: { _id: string; name: string; status: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function IncidentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // Create a ref for the update form
  const updateFormRef = React.useRef<HTMLDivElement>(null)
  const [incidentId, setIncidentId] = useState<string>('')
  const [incident, setIncident] = useState<Incident | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Status update form
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    description: '',
    componentUpdates: [] as { id: string; status: string }[]
  })

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')

  // Status badge colors
  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'investigating':
        return 'orange';
      case 'identified':
        return 'blue';
      case 'monitoring':
        return 'purple';
      case 'resolved':
        return 'green';
      default:
        return 'gray';
    }
  }

  // Status icons
  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'investigating':
        return WarningIcon;
      case 'identified':
        return InfoIcon;
      case 'monitoring':
        return TimeIcon;
      case 'resolved':
        return CheckIcon;
      default:
        return InfoIcon;
    }
  }

  // Impact badge colors
  const getImpactColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'critical':
        return 'red';
      case 'major':
        return 'orange';
      case 'minor':
        return 'yellow';
      case 'none':
        return 'green';
      default:
        return 'gray';
    }
  }

  // Format update type for display
  const formatUpdateType = (type: string) => {
    switch (type) {
      case 'created':
        return 'Incident Created';
      case 'updated':
        return 'Incident Updated';
      case 'status_changed':
        return 'Status Changed';
      case 'component_updated':
        return 'Component Updated';
      default:
        // For any other types, capitalize the first letter and replace underscores with spaces
        return type.replace(/_/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Set incidentId from params when component mounts or params changes
  useEffect(() => {
    if (params.id) {
      setIncidentId(params.id);
    }
  }, [params.id]);

  // Load data when incidentId changes
  useEffect(() => {
    // Skip if incidentId is not set yet
    if (!incidentId) return;

    const loadData = async () => {
      try {
        // Fetch incident details
        const incidentResponse = await fetchWithAuth(`/admin/incidents/${incidentId}`)
        const incidentData = await incidentResponse.json()
        setIncident(incidentData)

        // Fetch incident updates from the new endpoint
        const updatesResponse = await fetchWithAuth(`/admin/incidents/${incidentId}/updates`)
        const updatesData = await updatesResponse.json()
        setUpdates(updatesData)

        // Initialize status update form with current values
        setStatusUpdate({
          status: incidentData.status,
          description: '',
          componentUpdates: [...incidentData.affectedComponents]
        })

        // Fetch all components
        const componentsResponse = await fetchWithAuth('/admin/components')
        const componentsData = await componentsResponse.json()
        setComponents(componentsData)
      } catch (err) {
        setError('Failed to load incident details. Please try again.')
        console.error('Error loading incident:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [incidentId])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusUpdate(prev => ({
      ...prev,
      status: e.target.value
    }))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStatusUpdate(prev => ({
      ...prev,
      description: e.target.value
    }))
  }

  const handleComponentStatusChange = (componentId: string, status: string) => {
    setStatusUpdate(prev => {
      const componentUpdates = [...prev.componentUpdates]
      const componentIndex = componentUpdates.findIndex(comp => comp.id === componentId)

      if (componentIndex !== -1) {
        // Update the status of the component
        componentUpdates[componentIndex] = { ...componentUpdates[componentIndex], status }
      } else {
        // Add component if not already in the list
        componentUpdates.push({ id: componentId, status })
      }

      return {
        ...prev,
        componentUpdates
      }
    })
  }

  const handleUpdateIncident = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetchWithAuth(`/admin/incidents/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidentId: incidentId,
          status: statusUpdate.status,
          description: statusUpdate.description,
          componentUpdates: statusUpdate.componentUpdates
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update incident')
      }

      // Refresh incident data
      const updatedIncident = await response.json()
      setIncident(updatedIncident)

      // Refresh updates from the new endpoint
      const updatesResponse = await fetchWithAuth(`/admin/incidents/${incidentId}/updates`)
      const updatesData = await updatesResponse.json()
      setUpdates(updatesData)

      // Reset the description field
      setStatusUpdate(prev => ({
        ...prev,
        description: ''
      }))
    } catch (err) {
      setError('Failed to update incident. Please try again.')
      console.error('Error updating incident:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseIncident = async () => {
    setIsClosing(true)
    setError('')

    try {
      const response = await fetchWithAuth(`/admin/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to close incident')
      }

      // Redirect to incidents list
      router.push('/admin/incidents')
    } catch (err) {
      setError('Failed to close incident. Please try again.')
      console.error('Error closing incident:', err)
      setIsClosing(false)
    }
  }


  if (isLoading) {
    return (
      <Container maxW="container.xl" p={0}>
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      </Container>
    )
  }

  if (!incident) {
    return (
      <Container maxW="container.xl" p={0}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Incident not found or failed to load
        </Alert>
        <Button
          as={NextLink}
          href="/admin/incidents"
          mt={4}
          leftIcon={<ArrowBackIcon />}
        >
          Back to Incidents
        </Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      <Box mb={6}>
        <Button
          as={NextLink}
          href="/admin/incidents"
          variant="ghost"
          leftIcon={<ArrowBackIcon />}
          size="sm"
          mb={4}
          color={textColor}
        >
          Back to Incidents
        </Button>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading as="h1" size="lg" mb={1}>
              {incident.title}
            </Heading>
            <HStack spacing={4} mb={2}>
              <Badge colorScheme={getStatusColor(incident.status)} fontSize="sm" px={2} py={1}>
                <HStack spacing={1}>
                  <Icon as={getStatusIcon(incident.status)} boxSize={3} />
                  <Text>{incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}</Text>
                </HStack>
              </Badge>
              <Badge colorScheme={getImpactColor(incident.impact)} fontSize="sm" px={2} py={1}>
                Impact: {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
              </Badge>
            </HStack>
            <Text color={textColor}>
              Created: {formatDate(incident.createdAt)} • Last updated: {formatDate(incident.updatedAt)}
            </Text>
          </Box>
          <HStack spacing={4}>
            {incident.status !== 'resolved' && (
              <Button
                colorScheme="green"
                leftIcon={<CheckIcon />}
                onClick={handleCloseIncident}
                isLoading={isClosing}
                loadingText="Closing..."
              >
                Close Incident
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
        <CardHeader bg={headerBg} py={4} px={6}>
          <Heading size="md">Incident Details</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Description</Text>
              <Text whiteSpace="pre-wrap">{incident.description}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={4}>Affected Components</Text>
              {incident.affectedComponents.length === 0 ? (
                <Text color={textColor}>No components affected</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {incident.affectedComponents.map((affectedComponent) => {

                    return (
                      <HStack key={affectedComponent._id} justify="space-between" p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">{affectedComponent.name}</Text>
                        <Badge colorScheme={
                          affectedComponent.status === 'operational' ? 'green' :
                          affectedComponent.status === 'degraded' ? 'yellow' :
                          affectedComponent.status === 'partial' ? 'orange' :
                          affectedComponent.status === 'major' ? 'red' : 'purple'
                        }>
                          {affectedComponent.status.replace('_', ' ').charAt(0).toUpperCase() +
                           affectedComponent.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Updates Section */}
      <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
        <CardHeader bg={headerBg} py={4} px={6}>
          <Heading size="md">Updates</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Update Form */}
            <Box ref={updateFormRef} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
              <Heading size="sm" mb={4}>Add Update</Heading>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={statusUpdate.status}
                    onChange={handleStatusChange}
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={statusUpdate.description}
                    onChange={handleDescriptionChange}
                    placeholder="Provide details about this update"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Component Statuses</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {incident.affectedComponents.map((affectedComponent) => {
                      const component = components.find(c => c._id === affectedComponent._id);
                      if (!component) return null;

                      const currentStatus = statusUpdate.componentUpdates.find(
                        c => c.id === affectedComponent._id
                      )?.status || affectedComponent.status;

                      return (
                        <Box key={component._id} p={3} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium" mb={2}>{component.name}</Text>
                          <Select
                            value={currentStatus}
                            onChange={(e) => handleComponentStatusChange(affectedComponent._id, e.target.value)}
                            size="sm"
                          >
                            <option value="operational">Operational</option>
                            <option value="degraded">Degraded</option>
                            <option value="partial">Partial Outage</option>
                            <option value="major">Major Outage</option>
                            <option value="under_maintenance">Under Maintenance</option>
                          </Select>
                        </Box>
                      );
                    })}
                  </VStack>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={handleUpdateIncident}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  alignSelf="flex-end"
                >
                  Save Update
                </Button>
              </VStack>
            </Box>

            <Divider />

            {/* Updates List */}
            {updates && updates.length > 0 ? (
              <VStack align="stretch" spacing={4}>
                {updates.map((update) => (
                  <Box key={update._id} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">
                        {update.statusUpdate && (
                          <Badge colorScheme={getStatusColor(update.statusUpdate.to as Incident['status'])} mr={2}>
                            {update.statusUpdate.to.charAt(0).toUpperCase() + update.statusUpdate.to.slice(1)}
                          </Badge>
                        )}
                        {formatUpdateType(update.type)}
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {formatDate(update.createdAt)}
                      </Text>
                    </HStack>

                    {update.description && (
                      <Box mb={2}>
                        <Text whiteSpace="pre-wrap">{update.description}</Text>
                      </Box>
                    )}

                    {update.componentStatusUpdates && update.componentStatusUpdates.length > 0 && (
                      <Box mt={2}>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Component Updates:</Text>
                        <VStack align="stretch" spacing={1}>
                          {update.componentStatusUpdates.map((compUpdate) => {
                            const component = components.find(c => c._id === compUpdate.id);
                            return component ? (
                              <HStack key={compUpdate._id} spacing={2}>
                                <Text fontSize="sm">{component.name}:</Text>
                                <Badge size="sm" colorScheme={
                                  compUpdate.from === 'operational' ? 'green' :
                                  compUpdate.from === 'degraded' ? 'yellow' :
                                  compUpdate.from === 'partial' ? 'orange' :
                                  compUpdate.from === 'major' ? 'red' : 'purple'
                                }>
                                  {compUpdate.from.charAt(0).toUpperCase() + compUpdate.from.slice(1)}
                                </Badge>
                                <Text fontSize="sm">→</Text>
                                <Badge size="sm" colorScheme={
                                  compUpdate.to === 'operational' ? 'green' :
                                  compUpdate.to === 'degraded' ? 'yellow' :
                                  compUpdate.to === 'partial' ? 'orange' :
                                  compUpdate.to === 'major' ? 'red' : 'purple'
                                }>
                                  {compUpdate.to.charAt(0).toUpperCase() + compUpdate.to.slice(1)}
                                </Badge>
                              </HStack>
                            ) : null;
                          })}
                        </VStack>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color={textColor}>No updates yet</Text>
            )}
          </VStack>
        </CardBody>
      </Card>

    </Container>
  )
}
