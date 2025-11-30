export function validateRequiredEnvVars(): void {
  const requiredVars = [
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
    { name: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD },
  ];

  const missingVars = requiredVars
    .filter(({ value }) => !value || value.trim() === '')
    .map(({ name }) => name);

  if (missingVars.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║                    CONFIGURATION ERROR                         ║
╚════════════════════════════════════════════════════════════════╝

Required environment variables are not set:
  ${missingVars.map(name => `- ${name}`).join('\n  ')}

These variables are essential for backend security and must be configured.

Please set them in your .env file:
  JWT_SECRET=<your-secret-key>
  ADMIN_PASSWORD=<your-admin-password>

The application cannot start without these variables.
`;
    throw new Error(errorMessage);
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Call validateRequiredEnvVars() first.');
  }
  return secret;
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set. Call validateRequiredEnvVars() first.');
  }
  return password;
}
