'use client'

import { useState, useEffect } from 'react'
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
  Checkbox,
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
  Stack,
  Spinner,
  FormHelperText
} from '@chakra-ui/react'
import { ArrowBackIcon, WarningIcon } from '@chakra-ui/icons'

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewIncidentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'investigating',
    impact: 'minor',
    affectedComponents: [] as string[]
  })
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const response = await fetchWithAuth('/admin/components')
        const data = await response.json()
        setAvailableComponents(data)
      } catch (err) {
        setError('Failed to load components. Please try again.')
        console.error('Error loading components:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadComponents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetchWithAuth('/admin/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create incident')
      }

      router.push('/admin/incidents')
    } catch (err) {
      setError('Failed to create incident. Please try again.')
      console.error('Error creating incident:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (componentId: string) => {
    setFormData(prev => {
      const affectedComponents = [...prev.affectedComponents]

      if (affectedComponents.includes(componentId)) {
        // Remove if already selected
        return {
          ...prev,
          affectedComponents: affectedComponents.filter(id => id !== componentId)
        }
      } else {
        // Add if not selected
        return {
          ...prev,
          affectedComponents: [...affectedComponents, componentId]
        }
      }
    })
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" p={0}>
        <Center>
          <Spinner size="xl" />
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      <Flex mb={6} align="center">
        <Button
          as={NextLink}
          href="/admin/incidents"
          variant="ghost"
          leftIcon={<ArrowBackIcon />}
          mr={3}
          size="sm"
        >
          Back
        </Button>
        <Heading as="h1" size="lg">Create New Incident</Heading>
      </Flex>

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
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief description of the incident"
                />
                <FormHelperText>
                  Provide a clear, concise title that describes the incident
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed information about the incident"
                  minH="150px"
                />
                <FormHelperText>
                  Include details about the cause, impact, and any workarounds
                </FormHelperText>
              </FormControl>

              <HStack spacing={6} align="flex-start">
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                  <FormHelperText>
                    Current status of the incident
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Impact</FormLabel>
                  <Select
                    name="impact"
                    value={formData.impact}
                    onChange={handleChange}
                  >
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="none">None</option>
                  </Select>
                  <FormHelperText>
                    Severity of the incident
                  </FormHelperText>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Affected Components</FormLabel>
                <Card variant="outline" borderColor={borderColor}>
                  <CardBody>
                    {availableComponents.length === 0 ? (
                      <Text color={textColor}>No components available</Text>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {availableComponents.map((component) => (
                          <Checkbox
                            key={component._id}
                            isChecked={formData.affectedComponents.includes(component._id)}
                            onChange={() => handleCheckboxChange(component._id)}
                          >
                            {component.name}
                          </Checkbox>
                        ))}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
                <FormHelperText>
                  Select all components affected by this incident
                </FormHelperText>
              </FormControl>

              <Divider />

              <Flex justify="flex-end" gap={3}>
                <Button
                  as={NextLink}
                  href="/admin/incidents"
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  loadingText="Creating..."
                  size="md"
                >
                  Create Incident
                </Button>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  )
}
