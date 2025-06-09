import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/status-for-systems',
  user: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
})); 