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
  AlertIcon
} from '@chakra-ui/react'

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
      <Center minH="50vh">
        <Skeleton>
          <Text color={textColor}>Loading groups...</Text>
        </Skeleton>
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Box spacing={6}>
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} mb={6}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Groups
          </Heading>
          <Text color={textColor}>
            Manage your service groups and their components
          </Text>
        </Box>
        <Box mt={{ base: 4, sm: 0 }}>
          <Button
            as={NextLink}
            href="/admin/groups/new"
            colorScheme="blue"
            size="sm"
          >
            Add Group
          </Button>
        </Box>
      </Flex>

      {/* Groups List */}
      <Box bg={cardBg} shadow="md" borderRadius="md" overflow="hidden">
        <List divider={<Divider />}>
          {groups.length > 0 ? (
            groups.map((group: Group) => (
              <ListItem key={group._id}>
                <Box px={4} py={4}>
                  <Flex justify="space-between" align="center">
                    <Flex align="center">
                      <Text fontWeight="medium" color="blue.600" isTruncated>
                        {group.name}
                      </Text>
                      <Badge ml={2} colorScheme="green" borderRadius="full" px={2}>
                        {group.components?.length || 0} components
                      </Badge>
                    </Flex>
                    <Link
                      as={NextLink}
                      href={`/admin/groups/${group._id}`}
                      color="blue.600"
                      fontWeight="medium"
                      _hover={{ color: "blue.500" }}
                    >
                      Edit
                    </Link>
                  </Flex>
                  <Box mt={2}>
                    <Text fontSize="sm" color={textColor}>
                      {group.description}
                    </Text>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem px={4} py={4} textAlign="center" color={textColor}>
              No groups found. Create your first group to get started.
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  )
}
