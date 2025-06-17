# Material UI Integration

This document provides information about the Material UI (MUI) integration in the project.

## Overview

Material UI has been integrated into the project with minimal dependencies. The integration includes:

1. Core MUI packages
2. Theme configuration that respects system light/dark mode preferences
3. Integration with the existing font setup (Geist)

## Installed Packages

The following packages have been installed:

- `@mui/material`: Core MUI components
- `@emotion/react`: Peer dependency for MUI
- `@emotion/styled`: Peer dependency for MUI

## Project Structure

The MUI integration consists of the following files:

- `/src/components/ThemeProvider.tsx`: A custom theme provider that configures MUI theming
- `/src/components/MUIDemo.tsx`: A demo component showcasing various MUI components
- `/src/app/mui-demo/page.tsx`: A demo page that renders the MUIDemo component

## Usage

### Theme Provider

The MUI ThemeProvider is set up in the root layout (`/src/app/layout.tsx`), making MUI components and theming available throughout the application.

### Using MUI Components

To use MUI components in your application:

1. Import the components from `@mui/material`
2. Use them in your React components

Example:

```tsx
'use client'; // Add this if using in a Server Component

import { Button, TextField } from '@mui/material';

export function MyComponent() {
  return (
    <div>
      <TextField label="Name" variant="outlined" />
      <Button variant="contained">Submit</Button>
    </div>
  );
}
```

### Demo Page

A demo page showcasing various MUI components is available at `/mui-demo`. This page demonstrates how to use MUI components in the project.

## Customization

### Theme Customization

The MUI theme is configured in `/src/components/ThemeProvider.tsx`. You can customize the theme by modifying this file.

The current theme configuration:

- Uses system preference for light/dark mode
- Matches the color scheme with the existing CSS variables
- Uses the Geist font family

### Adding Icons

If you need to use MUI icons, install the `@mui/icons-material` package:

```bash
npm install @mui/icons-material
```

Then import and use icons in your components:

```tsx
import { Home as HomeIcon } from '@mui/icons-material';

export function MyComponent() {
  return (
    <div>
      <HomeIcon />
    </div>
  );
}
```

## Best Practices

1. Use the `sx` prop for styling MUI components when possible
2. For complex styling, consider using the `styled` API from `@emotion/styled`
3. Keep the ThemeProvider at the root level to ensure consistent theming
4. Use the 'use client' directive when using MUI components in Server Components
