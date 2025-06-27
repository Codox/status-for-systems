'use client'

import { useEffect, useState } from 'react'
import NextLink from 'next/link'
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

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetchWithAuth('/admin/incidents')
        const data: Incident[] = await response.json()
        setIncidents(data)
      } catch (err) {
        setError('Failed to load incidents. Please check your network and try again.')
        console.error('Error fetching incidents:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadIncidents()
  }, [])

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" p={0}>
        {/* Header skeleton */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          mb={6}
          mt={4}
          gap={3}
        >
          <Box>
            <Skeleton height="2rem" width="12rem" mb={2} />
            <Skeleton height="1rem" width="20rem" />
          </Box>
          <Skeleton height="2rem" width="8rem" alignSelf={{ base: "flex-start", sm: "auto" }} />
        </Flex>

        {/* Table skeleton */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
          <CardHeader bg={headerBg} py={3} px={6}>
            <Skeleton height="1.5rem" width="100%" />
          </CardHeader>
          <CardBody>
            <Skeleton height="3rem" mb={3} />
            <Skeleton height="3rem" mb={3} />
            <Skeleton height="3rem" />
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        mb={6}
        mt={4}
        gap={3}
      >
        <Box>
          <Heading as="h1" size="lg" mb={1}>Incidents</Heading>
          <Text color={textColor}>Manage and track system incidents</Text>
        </Box>
        <Button
          as={NextLink}
          href="/admin/incidents/new"
          colorScheme="blue"
          leftIcon={<AddIcon />}
          size="md"
        >
          New Incident
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {incidents.length === 0 && !error ? (
        <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
          <CardBody>
            <Center p={8} flexDirection="column" textAlign="center">
              <Icon as={WarningIcon} boxSize={12} color="gray.400" mb={4} />
              <Heading as="h3" size="md" mb={2}>No Incidents Found</Heading>
              <Text color={textColor} mb={6}>There are no incidents in the system yet.</Text>
              <Button
                as={NextLink}
                href="/admin/incidents/new"
                colorScheme="blue"
                leftIcon={<AddIcon />}
                size="md"
              >
                Create First Incident
              </Button>
            </Center>
          </CardBody>
        </Card>
      ) : (
        <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
          <CardHeader bg={headerBg} py={3} px={6}>
            <Heading size="sm">All Incidents</Heading>
          </CardHeader>
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Status</Th>
                    <Th>Impact</Th>
                    <Th>Created</Th>
                    <Th>Last Updated</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {incidents.map((incident) => (
                    <Tr key={incident._id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={`/admin/incidents/${incident._id}`}
                          fontWeight="medium"
                          color="blue.500"
                        >
                          {incident.title}
                        </Link>
                      </Td>
                      <Td>
                        <HStack>
                          <Icon as={getStatusIcon(incident.status)} />
                          <Badge colorScheme={getStatusColor(incident.status)}>
                            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getImpactColor(incident.impact)}>
                          {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        {formatDate(incident.createdAt)}
                      </Td>
                      <Td>
                        {formatDate(incident.updatedAt)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}
    </Container>
  )
}
