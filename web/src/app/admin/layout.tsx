'use client'

import { useState } from 'react'
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
  Icon,
  IconButton,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure
} from '@chakra-ui/react'
import {
  InfoIcon,
  SettingsIcon,
  WarningIcon,
  TimeIcon,
  ArrowBackIcon,
  HamburgerIcon
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

  // Responsive sidebar controls
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Navigation content - reused in both desktop sidebar and mobile drawer
  const NavigationContent = () => (
    <>
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
                onClick={isMobile ? onClose : undefined}
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
          onClick={isMobile ? onClose : undefined}
        >
          <Flex align="center">
            <Box minW="40px">
              <Icon as={ArrowBackIcon} boxSize="20px" />
            </Box>
            <Text>Back to Status Page</Text>
          </Flex>
        </Box>
      </Box>
    </>
  )

  return (
    <Flex minH="100vh" direction="column">
      {/* Mobile Header - only visible on mobile */}
      {isMobile && (
        <Flex
          as="header"
          align="center"
          justify="space-between"
          p={3}
          bg={headerBgColor}
          color="white"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Heading as="h1" size="md" fontWeight="bold">
            Admin Dashboard
          </Heading>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.600' }}
            onClick={onOpen}
          />
        </Flex>
      )}

      <Flex flex="1">
        {/* Desktop Sidebar - only visible on desktop */}
        {!isMobile && (
          <Box
            position="fixed"
            w={DRAWER_WIDTH}
            h="100vh"
            borderRightWidth="1px"
            bg={bgColor}
            boxShadow="sm"
            zIndex={10}
          >
            <NavigationContent />
          </Box>
        )}

        {/* Mobile Drawer - only visible when opened on mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton color="white" />
            <NavigationContent />
          </DrawerContent>
        </Drawer>

        {/* Main content */}
        <Box
          as="main"
          flex="1"
          p={3}
          ml={isMobile ? 0 : DRAWER_WIDTH}
          transition="margin-left 0.3s"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
