# Chakra UI Integration

This document provides information about the Chakra UI integration in the project.

## Overview

Chakra UI has been integrated into the project with minimal dependencies. The integration includes:

1. Core Chakra UI packages
2. Theme configuration that respects system light/dark mode preferences
3. Integration with the existing font setup (Geist)

## Installed Packages

The following packages have been installed:

- `@chakra-ui/react`: Core Chakra UI components
- `@chakra-ui/next-js`: Next.js integration for Chakra UI
- `@emotion/react`: Peer dependency for Chakra UI
- `@emotion/styled`: Peer dependency for Chakra UI
- `framer-motion`: Peer dependency for Chakra UI animations

## Project Structure

The Chakra UI integration consists of the following files:

- `/src/components/ThemeProvider.tsx`: A custom theme provider that configures Chakra UI theming
- `/src/components/ChakraDemo.tsx`: A demo component showcasing various Chakra UI components
- `/src/app/chakra-demo/page.tsx`: A demo page that renders the ChakraDemo component

## Usage

### Theme Provider

The Chakra UI ThemeProvider is set up in the root layout (`/src/app/layout.tsx`), making Chakra UI components and theming available throughout the application.

### Using Chakra UI Components

To use Chakra UI components in your application:

1. Import the components from `@chakra-ui/react`
2. Use them in your React components

Example:

```tsx
'use client'; // Add this if using in a Server Component

import { Button, Input } from '@chakra-ui/react';

export function MyComponent() {
  return (
    <div>
      <Input placeholder="Name" />
      <Button colorScheme="blue">Submit</Button>
    </div>
  );
}
```

## Customization

### Theme Customization

The Chakra UI theme is configured in `/src/components/ThemeProvider.tsx`. You can customize the theme by modifying this file.

The current theme configuration:

- Uses system preference for light/dark mode
- Matches the color scheme with the existing CSS variables
- Uses the Geist font family

### Adding Icons

If you need to use Chakra UI icons, install the `@chakra-ui/icons` package:

```bash
npm install @chakra-ui/icons
```

Then import and use icons in your components:

```tsx
import { CheckIcon } from '@chakra-ui/icons';

export function MyComponent() {
  return (
    <div>
      <CheckIcon />
    </div>
  );
}
```

## Best Practices

1. Use Chakra UI's prop-based styling system for consistent styling
2. Use the `useColorModeValue` hook for theme-aware styling
3. Keep the ThemeProvider at the root level to ensure consistent theming
4. Use the 'use client' directive when using Chakra UI components in Server Components
