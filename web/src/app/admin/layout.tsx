'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Box,
  Text,
  Heading,
  Flex,
  VStack,
  HStack,
  List,
  ListItem,
  Divider,
  useColorModeValue,
  Icon
} from '@chakra-ui/react'
import {
  InfoIcon,
  SettingsIcon,
  WarningIcon,
  TimeIcon,
  ArrowBackIcon
} from '@chakra-ui/icons'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: InfoIcon },
  { name: 'Groups', href: '/admin/groups', icon: TimeIcon },
  { name: 'Components', href: '/admin/components', icon: SettingsIcon },
  { name: 'Incidents', href: '/admin/incidents', icon: WarningIcon },
]

const DRAWER_WIDTH = "240px"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const bgColor = useColorModeValue('white', 'gray.800')
  const headerBgColor = useColorModeValue('blue.500', 'blue.600')
  const activeBgColor = useColorModeValue('blue.50', 'blue.900')
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        position="fixed"
        w={DRAWER_WIDTH}
        h="100vh"
        borderRightWidth="1px"
        bg={bgColor}
        boxShadow="sm"
      >
        {/* Logo */}
        <Flex
          align="center"
          justify="center"
          h="64px"
          bg={headerBgColor}
        >
          <Heading as="h1" size="md" color="white" fontWeight="bold">
            Admin Dashboard
          </Heading>
        </Flex>

        {/* Navigation */}
        <VStack spacing={0} align="stretch" py={2} flex="1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Box key={item.name}>
                <Box
                  as={Link}
                  href={item.href}
                  display="block"
                  py={2}
                  px={3}
                  mx={1}
                  borderRadius="md"
                  bg={isActive ? activeBgColor : 'transparent'}
                  _hover={{ bg: isActive ? activeBgColor : hoverBgColor }}
                >
                  <Flex align="center">
                    <Box minW="40px">
                      <Icon as={item.icon} boxSize="20px" />
                    </Box>
                    <Text fontWeight={isActive ? "medium" : "normal"}>
                      {item.name}
                    </Text>
                  </Flex>
                </Box>
              </Box>
            )
          })}
        </VStack>

        {/* Footer */}
        <Divider />
        <Box py={2}>
          <Box
            as={Link}
            href="/"
            display="block"
            py={2}
            px={3}
            mx={1}
            borderRadius="md"
            _hover={{ bg: hoverBgColor }}
          >
            <Flex align="center">
              <Box minW="40px">
                <Icon as={ArrowBackIcon} boxSize="20px" />
              </Box>
              <Text>Back to Status Page</Text>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box as="main" flex="1" p={3} ml={DRAWER_WIDTH}>
        {children}
      </Box>
    </Flex>
  )
}
