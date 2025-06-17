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
  Container
} from '@chakra-ui/react'
import { LinkIcon, AddIcon, EditIcon } from '@chakra-ui/icons'

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

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchWithAuth('/admin/groups')
        const data: Group[] = await response.json()
        setGroups(data)
      } catch (err) {
        setError('Failed to load groups. Please check your network and try again.')
        console.error('Error fetching groups:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGroups()
  }, [])

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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

        {/* Card skeleton */}
        <Card shadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" mb={6}>
          <CardHeader bg={headerBg} py={3} px={6}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              gap={2}
            >
              <Skeleton height="1.5rem" width="8rem" />
              <Skeleton height="1rem" width="5rem" />
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {[1, 2, 3].map((i) => (
                <Box key={i} p={2}>
                  <Skeleton height="1.5rem" width="60%" mb={2} />
                  <Skeleton height="1rem" width="90%" mb={2} />
                  <Skeleton height="1rem" width="30%" />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    )
  }

  if (error) {
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
            <Heading as="h1" size="lg" mb={1}>
              Service Groups
            </Heading>
            <Text color={textColor}>
              Manage your service groups and their components
            </Text>
          </Box>
          <Button
            as={NextLink}
            href="/admin/groups/new"
            colorScheme="blue"
            size="sm"
            leftIcon={<AddIcon />}
            alignSelf={{ base: "flex-start", sm: "auto" }}
          >
            Add Group
          </Button>
        </Flex>

        {/* Error message */}
        <Alert status="error" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Heading as="h4" size="sm" mb={1}>
              Error Loading Groups
            </Heading>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Container>
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
        gap={3}
      >
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Service Groups
          </Heading>
          <Text color={textColor}>
            Manage your service groups and their components
          </Text>
        </Box>
        <Button
          as={NextLink}
          href="/admin/groups/new"
          colorScheme="blue"
          size="sm"
          leftIcon={<AddIcon />}
          alignSelf={{ base: "flex-start", sm: "auto" }}
        >
          Add Group
        </Button>
      </Flex>

      {/* Groups List */}
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
                Groups
              </Heading>
            </HStack>
            <Text fontSize="sm" color={textColor}>
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} total
            </Text>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {groups.length > 0 ? (
            <List>
              {groups.map((group: Group) => (
                <ListItem key={group._id} borderBottomWidth={1} borderColor={borderColor} _last={{ borderBottomWidth: 0 }}>
                  <Box px={6} py={4} _hover={{ bg: hoverBg }} transition="background 0.2s">
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align="flex-start"
                      gap={{ base: 3, sm: 0 }}
                    >
                      <HStack spacing={3} align="flex-start">
                        <Icon as={LinkIcon} mt={1} color="blue.500" />
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
                        alignSelf={{ base: "flex-start", sm: "center" }}
                        mt={{ base: 0, sm: 1 }}
                      >
                        Edit
                      </Button>
                    </Flex>
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
                  as={NextLink}
                  href="/admin/groups/new"
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                  leftIcon={<AddIcon />}
                >
                  Add Group
                </Button>
              </VStack>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}
