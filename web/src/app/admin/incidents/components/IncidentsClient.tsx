'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/api'
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
  Link,
  Badge,
  List,
  ListItem,
  Divider,
  useColorModeValue,
  Skeleton,
  Center,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  Icon,
  HStack,
  VStack,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip
} from '@chakra-ui/react'
import { AddIcon, WarningIcon, InfoIcon, TimeIcon, CheckIcon } from '@chakra-ui/icons'

interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'critical' | 'major' | 'minor' | 'none';
  affectedComponents: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface IncidentsClientProps {
  initialIncidents: Incident[]
}

export default function IncidentsClient({ initialIncidents }: IncidentsClientProps) {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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
        return 'gray';
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Calculate duration
  const calculateDuration = (createdAt: string, resolvedAt?: string) => {
    const start = new Date(createdAt)
    const end = resolvedAt ? new Date(resolvedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const refreshIncidents = async () => {
    setIsLoading(true)
    try {
      const response = await fetchWithAuth('/admin/incidents')
      const data: Incident[] = await response.json()
      setIncidents(data)
      setError('')
    } catch (err) {
      setError('Failed to refresh incidents. Please try again.')
      console.error('Error fetching incidents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Container maxW="container.xl" p={0}>
        <Alert status="error" borderRadius="md" mt={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error Loading Incidents</Text>
            <Text>{error}</Text>
          </Box>
          <Button ml={4} size="sm" onClick={refreshIncidents}>
            Retry
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      {/* Header */}
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
            Incidents
          </Heading>
          <Text color={textColor}>
            Manage and track system incidents
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            onClick={refreshIncidents}
            variant="outline"
            size="sm"
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            as={NextLink}
            href="/admin/incidents/new"
            colorScheme="red"
            leftIcon={<AddIcon />}
            size="sm"
          >
            New Incident
          </Button>
        </HStack>
      </Flex>

      {/* Incidents List */}
      <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden">
        <CardHeader bg={headerBg} py={4} px={6}>
          <Flex justify="space-between" align="center">
            <Heading as="h2" size="md">
              All Incidents ({incidents.length})
            </Heading>
            <Text fontSize="sm" color={textColor}>
              {incidents.filter(i => i.status !== 'resolved').length} active
            </Text>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {isLoading ? (
            <VStack spacing={4} p={6}>
              {[1, 2, 3].map((i) => (
                <Box key={i} w="100%" p={4} borderWidth="1px" borderRadius="md">
                  <Skeleton height="20px" mb={2} />
                  <Skeleton height="16px" mb={2} width="80%" />
                  <HStack spacing={2}>
                    <Skeleton height="20px" width="60px" />
                    <Skeleton height="20px" width="80px" />
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : incidents.length === 0 ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Icon as={WarningIcon} boxSize="48px" color="gray.400" />
                <Text fontWeight="medium">No incidents found</Text>
                <Text color={textColor} textAlign="center">
                  No incidents have been reported yet.
                </Text>
                <Button
                  as={NextLink}
                  href="/admin/incidents/new"
                  colorScheme="red"
                  leftIcon={<AddIcon />}
                >
                  Create First Incident
                </Button>
              </VStack>
            </Center>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Incident</Th>
                    <Th>Status</Th>
                    <Th>Impact</Th>
                    <Th>Duration</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {incidents.map((incident) => (
                    <Tr key={incident._id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Link
                            as={NextLink}
                            href={`/admin/incidents/${incident._id}`}
                            fontWeight="medium"
                            color="blue.600"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {incident.title}
                          </Link>
                          <Text fontSize="sm" color={textColor} noOfLines={2}>
                            {incident.description}
                          </Text>
                          {incident.affectedComponents.length > 0 && (
                            <Text fontSize="xs" color={textColor}>
                              {incident.affectedComponents.length} component(s) affected
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon
                            as={getStatusIcon(incident.status)}
                            color={`${getStatusColor(incident.status)}.500`}
                          />
                          <Badge
                            colorScheme={getStatusColor(incident.status)}
                            variant="subtle"
                          >
                            {incident.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getImpactColor(incident.impact)}
                          variant="subtle"
                        >
                          {incident.impact}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {calculateDuration(incident.createdAt, incident.resolvedAt)}
                        </Text>
                      </Td>
                      <Td>
                        <Tooltip label={formatDate(incident.createdAt)}>
                          <Text fontSize="sm" color={textColor}>
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Button
                          as={NextLink}
                          href={`/admin/incidents/${incident._id}`}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}
