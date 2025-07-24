'use client'

import React, { useState, useEffect } from 'react'
import NextLink from 'next/link'
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
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
  Spinner
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
  const [incidentId, setIncidentId] = useState<string>('')
  const [incident, setIncident] = useState<Incident | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL is not configured');
        }

        // Fetch incident details
        const incidentResponse = await fetch(`${apiUrl}/public/incidents/${incidentId}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!incidentResponse.ok) {
          throw new Error(`Failed to fetch incident: ${incidentResponse.statusText}`);
        }

        const incidentData = await incidentResponse.json();
        setIncident(incidentData);

        // Fetch incident updates
        const updatesResponse = await fetch(`${apiUrl}/public/incidents/${incidentId}/updates`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!updatesResponse.ok) {
          throw new Error(`Failed to fetch updates: ${updatesResponse.statusText}`);
        }

        const updatesData = await updatesResponse.json();
        setUpdates(updatesData);
      } catch (err) {
        setError('Failed to load incident details. Please try again.');
        console.error('Error loading incident:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [incidentId]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" p={0}>
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container maxW="container.xl" p={0}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Incident not found or failed to load
        </Alert>
        <Button
          as="a"
          href="/"
          mt={4}
          leftIcon={<ArrowBackIcon />}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Box mb={6}>
        <Button
          as="a"
          href="/"
          variant="ghost"
          leftIcon={<ArrowBackIcon />}
          size="sm"
          mb={4}
          color={textColor}
        >
          Back to Dashboard
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
                  {incident.affectedComponents.map((affectedComponent) => (
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
                  ))}
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
                            // Find the component in the incident's affected components
                            const component = incident.affectedComponents.find(c => c._id === compUpdate.id);
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
  );
}
