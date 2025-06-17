'use client';

import { Box, Button, Card, CardBody, Heading, Text, VStack, HStack, Input } from '@chakra-ui/react';

export function ChakraDemo() {
  return (
    <Box maxW="600px" mx="auto" my={4} p={2}>
      <Heading as="h1" size="lg" mb={4}>
        Chakra UI Components Demo
      </Heading>

      <Card mb={4} variant="outline">
        <CardBody>
          <Heading as="h2" size="md" mb={3}>
            Basic Form
          </Heading>
          <VStack spacing={3} align="stretch">
            <Input placeholder="Name" />
            <Input placeholder="Email" type="email" />
            <Button colorScheme="blue">
              Submit
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <HStack spacing={2} mb={4}>
        <Button colorScheme="blue">Primary</Button>
        <Button variant="outline" colorScheme="blue">Outlined</Button>
        <Button variant="ghost">Text</Button>
      </HStack>

      <Text fontSize="md" mb={4}>
        Chakra UI has been successfully integrated into your Next.js project.
        You can now use all Chakra UI components throughout your application.
      </Text>
    </Box>
  );
}
