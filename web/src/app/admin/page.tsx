'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api'
import {
  Box,
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
  SkeletonText
} from '@chakra-ui/react'
import {
  ChevronDownIcon,
  PeopleIcon,
  SettingsIcon,
  WarningIcon,
  CheckIcon,
  RepeatIcon,
  AddIcon,
  TimeIcon,
  InfoIcon
} from '@chakra-ui/icons'

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

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const subtleBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load dashboard statistics
        const response = await fetchWithAuth('/api/admin/stats')
        const data = await response.json()
        setStats(data)

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
        return '🚨'
      case 'maintenance':
        return '🔧'
      case 'status_change':
        return '🔄'
      case 'component_added':
        return '➕'
      default:
        return '📝'
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
    <Box>
      {/* Header with actions */}
      <Flex justify="space-between" align="center" mb={4}>
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
              <Icon as={PeopleIcon} boxSize="3rem" color="blue.500" opacity={0.8} />
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
                              <Box fontSize="lg">{getActivityIcon(activity.type)}</Box>
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
    </Box>
  )
}
