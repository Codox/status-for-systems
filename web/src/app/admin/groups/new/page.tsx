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
  Spinner
} from '@chakra-ui/react'
import { LinkIcon, ArrowBackIcon, AddIcon } from '@chakra-ui/icons'

interface Component {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewGroupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    components: [] as string[]
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

      router.push('/admin/groups')
    } catch (err) {
      setError('Failed to create group. Please try again.')
      console.error('Error creating group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleComponentChange = (componentId: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      components: isChecked
        ? [...prev.components, componentId]
        : prev.components.filter(id => id !== componentId)
    }))
  }

  if (isLoading) {
    return (
      <Center minH="300px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Loading components...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Container maxW="container.xl" p={0}>
      <VStack spacing={6} align="stretch">
        {/* Header with back button */}
        <Box>
          <Button
            as={NextLink}
            href="/admin/groups"
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            size="sm"
            mb={4}
            color={textColor}
          >
            Back to Groups
          </Button>
          <Heading as="h1" size="lg" mb={1}>
            Create New Group
          </Heading>
          <Text color={textColor}>
            Create a new group to organize your system components. Groups help you categorize and manage related components together.
          </Text>
        </Box>

        {/* Form Card */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden">
          <CardBody p={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
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

                <Flex justify="flex-end">
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                    size="md"
                  >
                    Create Group
                  </Button>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
