'use client';

import { Box, Button, Card, CardContent, Typography, Stack, TextField } from '@mui/material';

export function MUIDemo() {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MUI Components Demo
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Basic Form
          </Typography>
          <Stack spacing={2}>
            <TextField label="Name" variant="outlined" />
            <TextField label="Email" variant="outlined" type="email" />
            <Button variant="contained" color="primary">
              Submit
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained">Primary</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
      </Stack>

      <Typography variant="body1" paragraph>
        Material UI has been successfully integrated into your Next.js project.
        You can now use all MUI components throughout your application.
      </Typography>
    </Box>
  );
}
