'use client'

import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/api'
import {
  Box,
  Container,
  Text,
  Heading,
  SimpleGrid,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Flex,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Divider,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AvatarGroup,
  Tooltip,
  Skeleton,
  SkeletonText,
  List,
  ListItem,
  Collapse,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Center,
  Spinner
} from '@chakra-ui/react'
import {
  ChevronDownIcon,
  LinkIcon,
  SettingsIcon,
  WarningIcon,
  CheckIcon,
  RepeatIcon,
  AddIcon,
  TimeIcon,
  InfoIcon,
  EditIcon,
  ChevronRightIcon
} from '@chakra-ui/icons'

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

interface Stats {
  totalGroups: number
  totalComponents: number
  activeIncidents: number
  operationalComponents: number
}

interface RecentActivity {
  id: string
  type: 'incident' | 'maintenance' | 'status_change' | 'component_added'
  title: string
  description: string
  timestamp: string
  status?: string
  user?: string
}

interface SystemHealth {
  uptime: string
  responseTime: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

// Mock data for demonstration purposes
const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'incident',
    title: 'API Gateway Outage',
    description: 'The API Gateway experienced a complete outage',
    timestamp: '2023-06-15T14:30:00Z',
    status: 'resolved'
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'Database Maintenance',
    description: 'Scheduled maintenance on primary database',
    timestamp: '2023-06-14T08:00:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Auth Service Status Change',
    description: 'Auth Service changed from degraded to operational',
    timestamp: '2023-06-13T18:45:00Z',
    user: 'admin'
  },
  {
    id: '4',
    type: 'component_added',
    title: 'New Component Added',
    description: 'Added Payment Processing Service to Financial group',
    timestamp: '2023-06-12T11:20:00Z',
    user: 'admin'
  }
]

const mockSystemHealth: SystemHealth = {
  uptime: '15d 7h 23m',
  responseTime: 187, // ms
  cpuUsage: 42, // percentage
  memoryUsage: 68, // percentage
  diskUsage: 57 // percentage
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalComponents: 0,
    activeIncidents: 0,
    operationalComponents: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Groups and components state
  const [groups, setGroups] = useState<Group[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [groupsError, setGroupsError] = useState('')

  // Create group modal state
  const { isOpen: isCreateGroupOpen, onOpen: onCreateGroupOpen, onClose: onCreateGroupClose } = useDisclosure()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    components: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const subtleBg = useColorModeValue('gray.50', 'gray.700')

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle component checkbox changes
  const handleComponentChange = (componentId: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      components: isChecked
        ? [...prev.components, componentId]
        : prev.components.filter(id => id !== componentId)
    }))
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      components: []
    })
    setFormError('')
  }

  // Handle create group form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError('')

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

      // Refresh groups data
      loadGroups()

      // Close modal and reset form
      onCreateGroupClose()
      resetFormData()
    } catch (err) {
      setFormError('Failed to create group. Please try again.')
      console.error('Error creating group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load groups data
  const loadGroups = async () => {
    setGroupsLoading(true)
    try {
      const response = await fetchWithAuth('/admin/groups')
      const data: Group[] = await response.json()
      setGroups(data)
    } catch (err) {
      setGroupsError('Failed to load groups. Please check your network and try again.')
      console.error('Error fetching groups:', err)
    } finally {
      setGroupsLoading(false)
    }
  }

  // Load components data
  const loadComponents = async () => {
    try {
      const response = await fetchWithAuth('/admin/components')
      const data = await response.json()
      setAvailableComponents(data)
    } catch (err) {
      console.error('Error loading components:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load dashboard statistics
        // const response = await fetchWithAuth('/api/admin/stats')
        // const data = await response.json()
        // setStats(data)

        // Load groups and components
        loadGroups()
        loadComponents()

        // In a real app, you would fetch these from the API
        // For now, we'll use mock data after a short delay to simulate loading
        setTimeout(() => {
          setRecentActivities(mockRecentActivities)
          setSystemHealth(mockSystemHealth)
          setLoading(false)
        }, 800)
      } catch (error) {
        setError('Failed to load dashboard data')
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return 'green'
      case 'in_progress':
        return 'blue'
      case 'scheduled':
        return 'purple'
      case 'investigating':
        return 'orange'
      default:
        return 'gray'
    }
  }

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return WarningIcon
      case 'maintenance':
        return TimeIcon
      case 'status_change':
        return RepeatIcon
      case 'component_added':
        return AddIcon
      default:
        return InfoIcon
    }
  }

  // Helper function to get health status color
  const getHealthColor = (value: number) => {
    if (value < 50) return 'green'
    if (value < 75) return 'yellow'
    return 'red'
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      {/* Header with actions */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        mb={6}
        mt={4}
        gap={3}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Admin Dashboard
          </Heading>
          <Text color={textColor}>
            Monitor and manage your system status
          </Text>
        </Box>
        <HStack spacing={2}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" colorScheme="blue">
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem>Create Incident</MenuItem>
              <MenuItem>Schedule Maintenance</MenuItem>
              <MenuItem>Add Component</MenuItem>
              <MenuItem>View Reports</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        {/* Total Groups */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} height="100%" overflow="hidden">
          <CardHeader bg={headerBg} py={2} px={4}>
            <Text fontWeight="medium" fontSize="sm">Groups</Text>
          </CardHeader>
          <CardBody p={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Stat>
                  <StatNumber fontSize="2xl">{loading ? <Skeleton height="1.5rem" width="3rem" /> : stats.totalGroups}</StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="increase" />
                    12% from last month
                  </StatHelpText>
                </Stat>
              </Box>
              <Icon as={LinkIcon} boxSize="3rem" color="blue.500" opacity={0.8} />
            </Flex>
          </CardBody>
        </Card>

        {/* Total Components */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} height="100%" overflow="hidden">
          <CardHeader bg={headerBg} py={2} px={4}>
            <Text fontWeight="medium" fontSize="sm">Components</Text>
          </CardHeader>
          <CardBody p={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Stat>
                  <StatNumber fontSize="2xl">{loading ? <Skeleton height="1.5rem" width="3rem" /> : stats.totalComponents}</StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="increase" />
                    8% from last month
                  </StatHelpText>
                </Stat>
              </Box>
              <Icon as={SettingsIcon} boxSize="3rem" color="purple.500" opacity={0.8} />
            </Flex>
          </CardBody>
        </Card>

        {/* Active Incidents */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} height="100%" overflow="hidden">
          <CardHeader bg={headerBg} py={2} px={4}>
            <Text fontWeight="medium" fontSize="sm">Active Incidents</Text>
          </CardHeader>
          <CardBody p={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Stat>
                  <StatNumber fontSize="2xl">{loading ? <Skeleton height="1.5rem" width="3rem" /> : stats.activeIncidents}</StatNumber>
                  <StatHelpText mb={0}>
                    <StatArrow type="decrease" />
                    25% from last week
                  </StatHelpText>
                </Stat>
              </Box>
              <Icon as={WarningIcon} boxSize="3rem" color="red.500" opacity={0.8} />
            </Flex>
          </CardBody>
        </Card>

        {/* Operational Components */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} height="100%" overflow="hidden">
          <CardHeader bg={headerBg} py={2} px={4}>
            <Text fontWeight="medium" fontSize="sm">Operational</Text>
          </CardHeader>
          <CardBody p={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Stat>
                  <StatNumber fontSize="2xl">{loading ? <Skeleton height="1.5rem" width="3rem" /> : stats.operationalComponents}</StatNumber>
                  <StatHelpText mb={0}>
                    {stats.totalComponents > 0 && (
                      <Text>
                        {Math.round((stats.operationalComponents / stats.totalComponents) * 100)}% of total
                      </Text>
                    )}
                  </StatHelpText>
                </Stat>
              </Box>
              <Icon as={CheckIcon} boxSize="3rem" color="green.500" opacity={0.8} />
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Groups and Components Section */}
      <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
        <CardHeader bg={headerBg} py={3} px={6}>
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            gap={2}
          >
            <HStack spacing={2}>
              <Icon as={LinkIcon} color="blue.500" />
              <Heading as="h3" size="md">
                Service Groups
              </Heading>
            </HStack>
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<AddIcon />}
              onClick={onCreateGroupOpen}
            >
              Add Group
            </Button>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {groupsLoading ? (
            <VStack spacing={4} align="stretch" p={6}>
              {[1, 2, 3].map((i) => (
                <Box key={i} p={2}>
                  <Skeleton height="1.5rem" width="60%" mb={2} />
                  <Skeleton height="1rem" width="90%" mb={2} />
                  <Skeleton height="1rem" width="30%" />
                </Box>
              ))}
            </VStack>
          ) : groupsError ? (
            <Alert status="error" m={6} borderRadius="md">
              <AlertIcon />
              <Box>
                <Heading as="h4" size="sm" mb={1}>
                  Error Loading Groups
                </Heading>
                <Text fontSize="sm">{groupsError}</Text>
              </Box>
            </Alert>
          ) : groups.length > 0 ? (
            <List>
              {groups.map((group: Group) => (
                <ListItem key={group._id} borderBottomWidth={1} borderColor={borderColor} _last={{ borderBottomWidth: 0 }}>
                  <Box>
                    <Flex
                      px={6}
                      py={4}
                      _hover={{ bg: hoverBg }}
                      transition="background 0.2s"
                      justify="space-between"
                      align="flex-start"
                      onClick={() => toggleGroupExpansion(group._id)}
                      cursor="pointer"
                    >
                      <HStack spacing={3} align="flex-start">
                        <Icon
                          as={expandedGroups[group._id] ? ChevronDownIcon : ChevronRightIcon}
                          mt={1}
                          color="blue.500"
                        />
                        <Box>
                          <Heading as="h4" size="sm" mb={1} color="blue.600">
                            {group.name}
                          </Heading>
                          <Text fontSize="sm" color={textColor} mb={2}>
                            {group.description}
                          </Text>
                          <Badge colorScheme="green" borderRadius="full" px={2}>
                            {group.components?.length || 0} {group.components?.length === 1 ? 'component' : 'components'}
                          </Badge>
                        </Box>
                      </HStack>
                      <Button
                        as={NextLink}
                        href={`/admin/groups/${group._id}`}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        leftIcon={<EditIcon />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Button>
                    </Flex>
                    <Collapse in={expandedGroups[group._id]} animateOpacity>
                      <Box pl={16} pr={6} pb={4} bg={subtleBg}>
                        {group.components && group.components.length > 0 ? (
                          <VStack spacing={3} align="stretch">
                            {group.components.map((component) => (
                              <Box key={component._id} p={2} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                                <Flex justify="space-between" align="flex-start">
                                  <Box>
                                    <Text fontWeight="medium">{component.name}</Text>
                                    <Text fontSize="sm" color={textColor} mb={1}>{component.description}</Text>
                                    <Badge
                                      colorScheme={
                                        component.status === 'operational' ? 'green' :
                                        component.status === 'degraded' ? 'yellow' :
                                        component.status === 'partial' ? 'orange' :
                                        component.status === 'major' ? 'red' : 'gray'
                                      }
                                      borderRadius="full"
                                      px={2}
                                      py={0.5}
                                      fontSize="xs"
                                    >
                                      {component.status.replace('_', ' ')}
                                    </Badge>
                                  </Box>
                                  <Button
                                    as={NextLink}
                                    href={`/admin/components/${component._id}`}
                                    size="xs"
                                    colorScheme="blue"
                                    variant="ghost"
                                    leftIcon={<EditIcon />}
                                  >
                                    Edit
                                  </Button>
                                </Flex>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color={textColor} py={2}>
                            No components in this group.
                          </Text>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box px={6} py={8} textAlign="center">
              <VStack spacing={3}>
                <Icon as={LinkIcon} boxSize="3rem" color="gray.300" />
                <Text fontWeight="medium">No groups found</Text>
                <Text color={textColor} fontSize="sm">
                  Create your first group to get started.
                </Text>
                <Button
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                  leftIcon={<AddIcon />}
                  onClick={onCreateGroupOpen}
                >
                  Add Group
                </Button>
              </VStack>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Create Group Modal */}
      <Modal isOpen={isCreateGroupOpen} onClose={onCreateGroupClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {formError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {formError}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter group name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Components</FormLabel>
                  <Box
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                    p={4}
                    maxH="300px"
                    overflowY="auto"
                  >
                    <VStack spacing={3} align="stretch">
                      {availableComponents.length > 0 ? (
                        availableComponents.map((component) => (
                          <Box key={component._id} p={2} _hover={{ bg: hoverBg }} borderRadius="md">
                            <Flex>
                              <Checkbox
                                id={`component-${component._id}`}
                                isChecked={formData.components.includes(component._id)}
                                onChange={(e) => handleComponentChange(component._id, e.target.checked)}
                                mr={3}
                                mt={1}
                              />
                              <Box>
                                <Text fontWeight="medium">{component.name}</Text>
                                <Text fontSize="sm" color={textColor} mb={1}>{component.description}</Text>
                                <Badge
                                  colorScheme={
                                    component.status === 'operational' ? 'green' :
                                    component.status === 'degraded' ? 'yellow' :
                                    component.status === 'partial' ? 'orange' :
                                    component.status === 'major' ? 'red' : 'gray'
                                  }
                                  borderRadius="full"
                                  px={2}
                                  py={0.5}
                                  fontSize="xs"
                                >
                                  {component.status.replace('_', ' ')}
                                </Badge>
                              </Box>
                            </Flex>
                          </Box>
                        ))
                      ) : (
                        <Text fontSize="sm" color={textColor}>No components available</Text>
                      )}
                    </VStack>
                  </Box>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateGroupClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Left Column */}
        <GridItem>
          {/* Recent Activity */}
          <Card shadow="md" borderRadius="lg" mb={6}>
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Heading as="h3" size="md">
                  Recent Activity
                </Heading>
                <Button size="xs" variant="ghost">
                  View All
                </Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              {loading ? (
                <VStack spacing={4} align="stretch">
                  {[1, 2, 3].map((i) => (
                    <Box key={i} p={3}>
                      <SkeletonText noOfLines={2} spacing="2" />
                      <Skeleton height="10px" mt={2} />
                    </Box>
                  ))}
                </VStack>
              ) : recentActivities.length > 0 ? (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Event</Th>
                        <Th>Time</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentActivities.map((activity) => (
                        <Tr key={activity.id} _hover={{ bg: hoverBg }}>
                          <Td>
                            <HStack spacing={2}>
                              <Icon as={getActivityIcon(activity.type)} boxSize="1.5rem" />
                              <Box>
                                <Text fontWeight="medium">{activity.title}</Text>
                                <Text fontSize="xs" color={textColor}>{activity.description}</Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatDate(activity.timestamp)}</Text>
                          </Td>
                          <Td>
                            {activity.status && (
                              <Badge colorScheme={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                            )}
                            {activity.user && (
                              <Text fontSize="xs" color={textColor}>by {activity.user}</Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Box pt={1} borderTopWidth="1px" borderColor={borderColor}>
                  <Text fontSize="sm" color={textColor} py={2}>
                    No recent activity to display
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Incidents & Maintenance */}
          <Card shadow="md" borderRadius="lg">
            <CardHeader pb={0}>
              <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                <TabList>
                  <Tab>Active Incidents</Tab>
                  <Tab>Scheduled Maintenance</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={4}>
                    {stats.activeIncidents > 0 ? (
                      <VStack spacing={3} align="stretch">
                        {[...Array(2)].map((_, i) => (
                          <Box key={i} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                            <Flex justify="space-between" align="start">
                              <Box>
                                <Badge colorScheme="red" mb={1}>Major Outage</Badge>
                                <Heading as="h4" size="sm">Database Connectivity Issues</Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>
                                  Users are experiencing slow response times and intermittent failures.
                                </Text>
                              </Box>
                              <Text fontSize="xs" color={textColor}>
                                Started 2h ago
                              </Text>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Box p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <Text fontSize="sm" color={textColor}>
                          No active incidents at this time.
                        </Text>
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={3} align="stretch">
                      <Box p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Badge colorScheme="purple" mb={1}>Scheduled</Badge>
                            <Heading as="h4" size="sm">Database Optimization</Heading>
                            <Text fontSize="sm" color={textColor} mt={1}>
                              Scheduled maintenance to optimize database performance.
                            </Text>
                          </Box>
                          <Text fontSize="xs" color={textColor}>
                            In 2 days
                          </Text>
                        </Flex>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardHeader>
          </Card>
        </GridItem>

        {/* Right Column */}
        <GridItem>
          {/* System Health */}
          <Card shadow="md" borderRadius="lg" mb={6}>
            <CardHeader>
              <Heading as="h3" size="md">System Health</Heading>
            </CardHeader>
            <CardBody pt={0}>
              {loading ? (
                <VStack spacing={4} align="stretch">
                  <SkeletonText noOfLines={1} />
                  <Skeleton height="20px" />
                  <SkeletonText noOfLines={3} spacing="4" />
                </VStack>
              ) : systemHealth ? (
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between">
                    <Text fontWeight="medium">System Uptime</Text>
                    <Text>{systemHealth.uptime}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="medium">Avg Response Time</Text>
                    <Text>{systemHealth.responseTime} ms</Text>
                  </Flex>
                  <Divider />
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">CPU Usage</Text>
                      <Text fontSize="sm">{systemHealth.cpuUsage}%</Text>
                    </Flex>
                    <Progress
                      value={systemHealth.cpuUsage}
                      size="sm"
                      borderRadius="md"
                      colorScheme={getHealthColor(systemHealth.cpuUsage)}
                      mb={3}
                    />
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Memory Usage</Text>
                      <Text fontSize="sm">{systemHealth.memoryUsage}%</Text>
                    </Flex>
                    <Progress
                      value={systemHealth.memoryUsage}
                      size="sm"
                      borderRadius="md"
                      colorScheme={getHealthColor(systemHealth.memoryUsage)}
                      mb={3}
                    />
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">Disk Usage</Text>
                      <Text fontSize="sm">{systemHealth.diskUsage}%</Text>
                    </Flex>
                    <Progress
                      value={systemHealth.diskUsage}
                      size="sm"
                      borderRadius="md"
                      colorScheme={getHealthColor(systemHealth.diskUsage)}
                    />
                  </Box>
                </VStack>
              ) : (
                <Text fontSize="sm" color={textColor}>
                  System health information is not available.
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card shadow="md" borderRadius="lg" mb={6}>
            <CardHeader>
              <Heading as="h3" size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={2} spacing={3}>
                <Button colorScheme="blue" size="sm" variant="outline">
                  Create Incident
                </Button>
                <Button colorScheme="purple" size="sm" variant="outline">
                  Schedule Maintenance
                </Button>
                <Button colorScheme="green" size="sm" variant="outline">
                  Add Component
                </Button>
                <Button colorScheme="orange" size="sm" variant="outline">
                  Generate Report
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Team Activity */}
          <Card shadow="md" borderRadius="lg">
            <CardHeader>
              <Heading as="h3" size="md">Team Activity</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Flex>
                  <AvatarGroup size="sm" max={3} mr={2}>
                    <Avatar name="Ryan Florence" />
                    <Avatar name="Segun Adebayo" />
                    <Avatar name="Kent Dodds" />
                    <Avatar name="Prosper Otemuyiwa" />
                  </AvatarGroup>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">4 team members online</Text>
                    <Text fontSize="xs" color={textColor}>Active now</Text>
                  </Box>
                </Flex>
                <Divider />
                <VStack spacing={3} align="stretch">
                  <Flex>
                    <Avatar size="xs" name="John Smith" mr={2} />
                    <Box>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="medium">John Smith</Text> resolved an incident
                      </Text>
                      <Text fontSize="xs" color={textColor}>2 hours ago</Text>
                    </Box>
                  </Flex>
                  <Flex>
                    <Avatar size="xs" name="Sarah Johnson" mr={2} />
                    <Box>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="medium">Sarah Johnson</Text> scheduled maintenance
                      </Text>
                      <Text fontSize="xs" color={textColor}>5 hours ago</Text>
                    </Box>
                  </Flex>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  )
}
