'use client'

import { Suspense } from "react";
import {
  Box,
  Text,
  Heading,
  Container,
  SimpleGrid,
  Flex,
  Badge,
  Skeleton,
  List,
  ListItem,
  Center,
  VStack,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';

// Types
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

const getStatusStyles = (status: string) => {
  switch (status) {
    case "operational":
      return {
        bgColor: 'success.light',
        color: 'success.dark',
        icon: "✓",
        severity: 0,
        displayText: "Operational"
      };
    case "degraded":
      return {
        bgColor: 'warning.light',
        color: 'warning.dark',
        icon: "!",
        severity: 1,
        displayText: "Degraded"
      };
    case "partial":
      return {
        bgColor: 'orange.light',
        color: 'orange.dark',
        icon: "!",
        severity: 2,
        displayText: "Partial Outage"
      };
    case "major":
      return {
        bgColor: 'error.light',
        color: 'error.dark',
        icon: "×",
        severity: 3,
        displayText: "Major Outage"
      };
    case "under_maintenance":
      return {
        bgColor: 'info.light',
        color: 'info.dark',
        icon: "⚡",
        severity: 0,
        displayText: "Under Maintenance"
      };
    default:
      return {
        bgColor: 'grey.200',
        color: 'text.secondary',
        icon: "?",
        severity: 0,
        displayText: "Unknown"
      };
  }
};

const getHighestSeverityStatus = (components: Component[]) => {
  return components.reduce((highest, component) => {
    const currentStatus = getStatusStyles(component.status);
    return currentStatus.severity > highest.severity ? currentStatus : highest;
  }, getStatusStyles("operational"));
};

async function getGroups(): Promise<Group[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${apiUrl}/public/groups`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
}

function ErrorState({ message }: { message: string }) {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box p={4} shadow="md" borderRadius="md" bg={useColorModeValue('white', 'gray.800')} textAlign="center">
      <Box maxW="md" mx="auto">
        <Heading as="h3" size="md" mb={1} fontWeight="medium">
          Unable to Load System Status
        </Heading>
        <Text fontSize="sm" color={textColor} mb={2}>
          {message}
        </Text>
        <Text fontSize="sm" color={textColor}>
          Please try refreshing the page or contact support if the issue persists.
        </Text>
      </Box>
    </Box>
  );
}

function LoadingState() {
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box>
      <Skeleton height="40px" width="25%" mb={2} />
      <VStack spacing={4}>
        {[1, 2, 3].map((i) => (
          <Box key={i} p={3} shadow="md" borderRadius="md" bg={useColorModeValue('white', 'gray.800')} width="100%">
            <Skeleton height="30px" width="33%" mb={2} />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {[1, 2].map((j) => (
                <Box key={j} p={2} bg={bgColor} borderRadius="md">
                  <Skeleton height="24px" width="50%" mb={1} />
                  <Skeleton height="20px" width="75%" />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function EmptyState() {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box p={4} shadow="md" borderRadius="md" bg={useColorModeValue('white', 'gray.800')} textAlign="center">
      <Box maxW="md" mx="auto">
        <Heading as="h3" size="md" mb={1} fontWeight="medium">
          No Service Groups Available
        </Heading>
        <Text fontSize="sm" color={textColor}>
          There are currently no service groups to display. This could be because:
        </Text>
        <List spacing={1} mt={2} mb={2}>
          <ListItem>
            <Text fontSize="sm" color={textColor}>• The system is being initialized</Text>
          </ListItem>
          <ListItem>
            <Text fontSize="sm" color={textColor}>• Services are being configured</Text>
          </ListItem>
          <ListItem>
            <Text fontSize="sm" color={textColor}>• There might be a temporary issue</Text>
          </ListItem>
        </List>
        <Text fontSize="sm" color={textColor}>
          Please check back later or contact support if this persists.
        </Text>
      </Box>
    </Box>
  );
}

// Data fetching component
async function HomeData() {
  try {
    const groups = await getGroups();
    return { groups, error: null };
  } catch (error) {
    return { groups: null, error };
  }
}

// Client component for rendering
function HomeContent({ groups, error }: { groups: Group[] | null, error: any }) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // If there's an error, render the error state
  if (error) {
    return (
      <Box as="main" minH="100vh" bg={bgColor}>
        <Container maxW="container.lg" py={4}>
          <ErrorState message={error instanceof Error ? error.message : 'An unexpected error occurred'} />
        </Container>
      </Box>
    );
  }

  // Otherwise render the normal UI
  return (
    <Box as="main" minH="100vh" bg={bgColor}>
      <Container maxW="container.lg" py={4}>
        {/* Header */}
        <Box mb={4}>
          <Heading as="h1" size="lg" fontWeight="bold">
            System Status
          </Heading>
          <Text fontSize="sm" color={textColor} mt={1}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </Box>

        {/* Overall Status */}
        <Box p={3} mb={4} shadow="md" borderRadius="md" bg={useColorModeValue('white', 'gray.800')}>
          <Flex align="center">
            <Center
              h="32px"
              w="32px"
              borderRadius="full"
              bg={useColorModeValue('green.100', 'green.800')}
              color={useColorModeValue('green.700', 'green.200')}
              fontWeight="bold"
              mr={1.5}
            >
              ✓
            </Center>
            <Box>
              <Heading as="h2" size="sm" fontWeight="medium">
                All Systems Operational
              </Heading>
              <Text fontSize="sm" color={textColor}>
                All core services are functioning normally
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Service Groups */}
        <Suspense fallback={<LoadingState />}>
          {groups && groups.length > 0 ? (
            <VStack spacing={4} mb={4} align="stretch">
              {groups.map((group) => {
                const groupStatus = getHighestSeverityStatus(group.components);
                return (
                  <Box key={group._id} p={3} shadow="md" borderRadius="md" bg={useColorModeValue('white', 'gray.800')}>
                    <Box
                      mb={2}
                      p={2}
                      borderRadius="md"
                      bg={useColorModeValue(
                        `${groupStatus.bgColor.replace('light', '50')}`,
                        `${groupStatus.bgColor.replace('light', '900')}`
                      )}
                    >
                      <Flex align="center" justify="space-between">
                        <Heading as="h2" size="sm" fontWeight="medium">
                          {group.name}
                        </Heading>
                        <Badge
                          px={2}
                          py={1}
                          borderRadius="md"
                          color={useColorModeValue(
                            `${groupStatus.color.replace('dark', '700')}`,
                            `${groupStatus.color.replace('dark', '300')}`
                          )}
                          fontWeight="medium"
                        >
                          {groupStatus.icon} {group.components.every(c => c.status === "operational") ? "All Operational" : groupStatus.displayText}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm" color={textColor} mt={0.5}>
                        {group.description}
                      </Text>
                    </Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {group.components.map((component) => {
                        const statusStyles = getStatusStyles(component.status);
                        return (
                          <Box key={component._id} p={2} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                            <Flex align="center" justify="space-between" mb={1}>
                              <Heading as="h3" size="xs" fontWeight="medium">
                                {component.name}
                              </Heading>
                              <Badge
                                px={2}
                                py={1}
                                borderRadius="md"
                                bg={useColorModeValue(
                                  `${statusStyles.bgColor.replace('light', '50')}`,
                                  `${statusStyles.bgColor.replace('light', '900')}`
                                )}
                                color={useColorModeValue(
                                  `${statusStyles.color.replace('dark', '700')}`,
                                  `${statusStyles.color.replace('dark', '300')}`
                                )}
                                fontWeight="medium"
                              >
                                {statusStyles.icon} {component.status.replace('_', ' ')}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" color={textColor}>
                              {component.description}
                            </Text>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <EmptyState />
          )}
        </Suspense>
      </Container>
    </Box>
  );
}

// Main component that combines data fetching and rendering
export default async function Home() {
  const { groups, error } = await HomeData();
  return <HomeContent groups={groups} error={error} />;
}
