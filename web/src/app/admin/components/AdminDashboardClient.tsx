'use client'

import { useState } from 'react'
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

interface AdminDashboardClientProps {
  initialGroups: Group[]
  initialComponents: Component[]
  initialStats: Stats
  initialRecentActivities: RecentActivity[]
  initialSystemHealth: SystemHealth
}

export default function AdminDashboardClient({
  initialGroups,
  initialComponents,
  initialStats,
  initialRecentActivities,
  initialSystemHealth
}: AdminDashboardClientProps) {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>(initialStats)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(initialRecentActivities)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(initialSystemHealth)

  // Groups and components state
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [availableComponents, setAvailableComponents] = useState<Component[]>(initialComponents)
  const [groupsLoading, setGroupsLoading] = useState(false)
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

  return (
    <Container maxW="container.xl" p={0}>
      {/* Header with actions */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        mb={6}
        mt={4}
        gap={3}
      >
        <Box>
          <Heading as="h1" size="lg" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color={textColor}>
            Monitor and manage your system status
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            as={NextLink}
            href="/admin/incidents/new"
            colorScheme="red"
            leftIcon={<AddIcon />}
            size="sm"
          >
            New Incident
          </Button>
          <Button
            onClick={onCreateGroupOpen}
            colorScheme="blue"
            leftIcon={<AddIcon />}
            size="sm"
          >
            New Group
          </Button>
        </HStack>
      </Flex>

      {/* Dashboard Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card shadow="md" borderRadius="lg" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total Groups</StatLabel>
              <StatNumber fontSize="2xl">{stats.totalGroups}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12% from last month
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="md" borderRadius="lg" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total Components</StatLabel>
              <StatNumber fontSize="2xl">{stats.totalComponents}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                8% from last month
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="md" borderRadius="lg" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Active Incidents</StatLabel>
              <StatNumber fontSize="2xl" color="red.500">{stats.activeIncidents}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                23% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="md" borderRadius="lg" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Operational</StatLabel>
              <StatNumber fontSize="2xl" color="green.500">{stats.operationalComponents}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                5% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
        {/* Groups Management */}
        <GridItem>
          <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden">
            <CardHeader bg={headerBg} py={4} px={6}>
              <Flex justify="space-between" align="center">
                <Heading as="h2" size="md">
                  Groups & Components
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<AddIcon />}
                  onClick={onCreateGroupOpen}
                >
                  Add Group
                </Button>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              {groupsError && (
                <Box p={4}>
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {groupsError}
                  </Alert>
                </Box>
              )}

              {groupsLoading ? (
                <VStack spacing={4} p={6}>
                  <Skeleton height="60px" width="100%" />
                  <Skeleton height="60px" width="100%" />
                  <Skeleton height="60px" width="100%" />
                </VStack>
              ) : groups.length === 0 ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Icon as={SettingsIcon} boxSize="48px" color="gray.400" />
                    <Text color={textColor} textAlign="center">
                      No groups found. Create your first group to get started.
                    </Text>
                    <Button
                      colorScheme="blue"
                      leftIcon={<AddIcon />}
                      onClick={onCreateGroupOpen}
                    >
                      Create Group
                    </Button>
                  </VStack>
                </Center>
              ) : (
                <List spacing={0}>
                  {groups.map((group, index) => (
                    <ListItem key={group._id}>
                      <Box
                        p={4}
                        borderBottomWidth={index < groups.length - 1 ? "1px" : "0"}
                        borderColor={borderColor}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          cursor="pointer"
                          onClick={() => toggleGroupExpansion(group._id)}
                          _hover={{ bg: hoverBg }}
                          p={2}
                          borderRadius="md"
                          mx={-2}
                        >
                          <HStack spacing={3}>
                            <Icon
                              as={ChevronRightIcon}
                              transform={expandedGroups[group._id] ? "rotate(90deg)" : "rotate(0deg)"}
                              transition="transform 0.2s"
                            />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{group.name}</Text>
                              <Text fontSize="sm" color={textColor}>
                                {group.description}
                              </Text>
                            </VStack>
                          </HStack>
                          <Badge colorScheme="blue" variant="subtle">
                            {group.components.length} components
                          </Badge>
                        </Flex>

                        <Collapse in={expandedGroups[group._id]} animateOpacity>
                          <Box mt={4} ml={6}>
                            {group.components.length === 0 ? (
                              <Text fontSize="sm" color={textColor} fontStyle="italic">
                                No components in this group
                              </Text>
                            ) : (
                              <VStack align="stretch" spacing={2}>
                                {group.components.map((component) => (
                                  <Flex
                                    key={component._id}
                                    justify="space-between"
                                    align="center"
                                    p={3}
                                    bg={subtleBg}
                                    borderRadius="md"
                                  >
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {component.name}
                                      </Text>
                                      <Text fontSize="xs" color={textColor}>
                                        {component.description}
                                      </Text>
                                    </VStack>
                                    <Badge
                                      colorScheme={component.status === 'operational' ? 'green' : 'red'}
                                      variant="subtle"
                                    >
                                      {component.status}
                                    </Badge>
                                  </Flex>
                                ))}
                              </VStack>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* System Health & Recent Activity */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* System Health */}
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardHeader bg={headerBg} py={4} px={6}>
                <Heading as="h3" size="sm">
                  System Health
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={textColor}>Uptime</Text>
                    <Text fontSize="sm" fontWeight="medium">{systemHealth.uptime}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color={textColor}>Response Time</Text>
                    <Text fontSize="sm" fontWeight="medium">{systemHealth.responseTime}ms</Text>
                  </HStack>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color={textColor}>CPU Usage</Text>
                      <Text fontSize="sm" fontWeight="medium">{systemHealth.cpuUsage}%</Text>
                    </HStack>
                    <Progress
                      value={systemHealth.cpuUsage}
                      colorScheme={getHealthColor(systemHealth.cpuUsage)}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color={textColor}>Memory Usage</Text>
                      <Text fontSize="sm" fontWeight="medium">{systemHealth.memoryUsage}%</Text>
                    </HStack>
                    <Progress
                      value={systemHealth.memoryUsage}
                      colorScheme={getHealthColor(systemHealth.memoryUsage)}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color={textColor}>Disk Usage</Text>
                      <Text fontSize="sm" fontWeight="medium">{systemHealth.diskUsage}%</Text>
                    </HStack>
                    <Progress
                      value={systemHealth.diskUsage}
                      colorScheme={getHealthColor(systemHealth.diskUsage)}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardHeader bg={headerBg} py={4} px={6}>
                <Heading as="h3" size="sm">
                  Recent Activity
                </Heading>
              </CardHeader>
              <CardBody p={0}>
                <List spacing={0}>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={activity.id}>
                      <Box
                        p={4}
                        borderBottomWidth={index < recentActivities.length - 1 ? "1px" : "0"}
                        borderColor={borderColor}
                      >
                        <HStack spacing={3} align="start">
                          <Icon
                            as={getActivityIcon(activity.type)}
                            boxSize="16px"
                            color={`${getStatusColor(activity.status || '')}.500`}
                            mt={1}
                          />
                          <VStack align="start" spacing={1} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              {activity.title}
                            </Text>
                            <Text fontSize="xs" color={textColor}>
                              {activity.description}
                            </Text>
                            <HStack spacing={2}>
                              <Text fontSize="xs" color={textColor}>
                                {formatDate(activity.timestamp)}
                              </Text>
                              {activity.status && (
                                <Badge
                                  size="sm"
                                  colorScheme={getStatusColor(activity.status)}
                                  variant="subtle"
                                >
                                  {activity.status}
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* Create Group Modal */}
      <Modal isOpen={isCreateGroupOpen} onClose={onCreateGroupClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {formError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {formError}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel>Group Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter group name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Components</FormLabel>
                  <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                    {availableComponents.map((component) => (
                      <Checkbox
                        key={component._id}
                        isChecked={formData.components.includes(component._id)}
                        onChange={(e) => handleComponentChange(component._id, e.target.checked)}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{component.name}</Text>
                          <Text fontSize="xs" color={textColor}>
                            {component.description}
                          </Text>
                        </VStack>
                      </Checkbox>
                    ))}
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateGroupClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Group
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  )
}
