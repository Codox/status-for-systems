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
  Flex,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

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
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
      <Box mt={2}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <VStack spacing={3} align="stretch">
      <Box>
        <Heading as="h1" size="lg" mb={1}>
          Dashboard Overview
        </Heading>
        <Text color={textColor}>
          Welcome to your system status dashboard
        </Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={2}>
        {/* Total Groups */}
        <Box shadow="md" borderRadius="md" bg={cardBg} height="100%">
          <Flex p={2} align="center">
            <Box fontSize="2rem" mr={2}>👥</Box>
            <Box>
              <Text fontSize="sm" color={textColor}>
                Total Groups
              </Text>
              <Heading as="h3" size="md">
                {stats.totalGroups}
              </Heading>
            </Box>
          </Flex>
        </Box>

        {/* Total Components */}
        <Box shadow="md" borderRadius="md" bg={cardBg} height="100%">
          <Flex p={2} align="center">
            <Box fontSize="2rem" mr={2}>⚙️</Box>
            <Box>
              <Text fontSize="sm" color={textColor}>
                Total Components
              </Text>
              <Heading as="h3" size="md">
                {stats.totalComponents}
              </Heading>
            </Box>
          </Flex>
        </Box>

        {/* Active Incidents */}
        <Box shadow="md" borderRadius="md" bg={cardBg} height="100%">
          <Flex p={2} align="center">
            <Box fontSize="2rem" mr={2}>🚨</Box>
            <Box>
              <Text fontSize="sm" color={textColor}>
                Active Incidents
              </Text>
              <Heading as="h3" size="md">
                {stats.activeIncidents}
              </Heading>
            </Box>
          </Flex>
        </Box>

        {/* Operational Components */}
        <Box shadow="md" borderRadius="md" bg={cardBg} height="100%">
          <Flex p={2} align="center">
            <Box fontSize="2rem" mr={2}>✅</Box>
            <Box>
              <Text fontSize="sm" color={textColor}>
                Operational Components
              </Text>
              <Heading as="h3" size="md">
                {stats.operationalComponents}
              </Heading>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Recent Activity */}
      <Card variant="outline">
        <CardBody>
          <Heading as="h3" size="sm" mb={2}>
            Recent Activity
          </Heading>
          <Box pt={1} borderTopWidth="1px" borderColor={borderColor}>
            <Text fontSize="sm" color={textColor} py={2}>
              No recent activity to display
            </Text>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}
