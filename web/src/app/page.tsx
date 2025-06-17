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
        bgColor: 'green.50',
        bgColorDark: 'green.900',
        color: 'green.700',
        colorDark: 'green.200',
        icon: "✓",
        severity: 0,
        displayText: "Operational"
      };
    case "degraded":
      return {
        bgColor: 'yellow.50',
        bgColorDark: 'yellow.900',
        color: 'yellow.700',
        colorDark: 'yellow.200',
        icon: "!",
        severity: 1,
        displayText: "Degraded"
      };
    case "partial":
      return {
        bgColor: 'orange.50',
        bgColorDark: 'orange.900',
        color: 'orange.700',
        colorDark: 'orange.200',
        icon: "!",
        severity: 2,
        displayText: "Partial Outage"
      };
    case "major":
      return {
        bgColor: 'red.50',
        bgColorDark: 'red.900',
        color: 'red.700',
        colorDark: 'red.200',
        icon: "×",
        severity: 3,
        displayText: "Major Outage"
      };
    case "under_maintenance":
      return {
        bgColor: 'blue.50',
        bgColorDark: 'blue.900',
        color: 'blue.700',
        colorDark: 'blue.200',
        icon: "⚡",
        severity: 0,
        displayText: "Under Maintenance"
      };
    default:
      return {
        bgColor: 'gray.50',
        bgColorDark: 'gray.900',
        color: 'gray.600',
        colorDark: 'gray.400',
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

  // Function to get overall system status
  const getOverallStatus = () => {
    if (!groups || groups.length === 0) return { icon: "✓", text: "All Systems Operational", subtext: "All core services are functioning normally", bgColor: "green.100", color: "green.700", bgColorDark: "green.800", colorDark: "green.200" };

    let highestSeverity = 0;
    let statusCount = { operational: 0, degraded: 0, partial: 0, major: 0, maintenance: 0 };

    groups.forEach(group => {
      group.components.forEach(component => {
        const status = getStatusStyles(component.status);
        if (status.severity > highestSeverity) {
          highestSeverity = status.severity;
        }

        // Count status types
        switch (component.status) {
          case 'operational': statusCount.operational++; break;
          case 'degraded': statusCount.degraded++; break;
          case 'partial': statusCount.partial++; break;
          case 'major': statusCount.major++; break;
          case 'under_maintenance': statusCount.maintenance++; break;
        }
      });
    });

    // Determine overall status
    if (statusCount.major > 0) {
      return { icon: "×", text: "Major Service Outage", subtext: "Some services are experiencing major issues", bgColor: "red.100", color: "red.700", bgColorDark: "red.800", colorDark: "red.200" };
    } else if (statusCount.partial > 0) {
      return { icon: "!", text: "Partial Service Outage", subtext: "Some services are partially affected", bgColor: "orange.100", color: "orange.700", bgColorDark: "orange.800", colorDark: "orange.200" };
    } else if (statusCount.degraded > 0) {
      return { icon: "!", text: "Degraded Performance", subtext: "Some services are experiencing degraded performance", bgColor: "yellow.100", color: "yellow.700", bgColorDark: "yellow.800", colorDark: "yellow.200" };
    } else if (statusCount.maintenance > 0) {
      return { icon: "⚡", text: "Maintenance in Progress", subtext: "Some services are under maintenance", bgColor: "blue.100", color: "blue.700", bgColorDark: "blue.800", colorDark: "blue.200" };
    } else {
      return { icon: "✓", text: "All Systems Operational", subtext: "All core services are functioning normally", bgColor: "green.100", color: "green.700", bgColorDark: "green.800", colorDark: "green.200" };
    }
  };

  const overallStatus = getOverallStatus();

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
                  bg={useColorModeValue(overallStatus.bgColor, overallStatus.bgColorDark)}
                  color={useColorModeValue(overallStatus.color, overallStatus.colorDark)}
                  fontWeight="bold"
                  mr={1.5}
              >
                {overallStatus.icon}
              </Center>
              <Box>
                <Heading as="h2" size="sm" fontWeight="medium">
                  {overallStatus.text}
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  {overallStatus.subtext}
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
                              bg={useColorModeValue(groupStatus.bgColor, groupStatus.bgColorDark)}
                          >
                            <Flex align="center" justify="space-between">
                              <Heading as="h2" size="sm" fontWeight="medium">
                                {group.name}
                              </Heading>
                              <Badge
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                  bg={useColorModeValue(groupStatus.bgColor, groupStatus.bgColorDark)}
                                  color={useColorModeValue(groupStatus.color, groupStatus.colorDark)}
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
                                          bg={useColorModeValue(statusStyles.bgColor, statusStyles.bgColorDark)}
                                          color={useColorModeValue(statusStyles.color, statusStyles.colorDark)}
                                          fontWeight="medium"
                                      >
                                        {statusStyles.icon} {statusStyles.displayText}
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
