import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import auditRoutes from './routes/audit';
import authRoutes from './routes/auth';
import meetingRoutes from './routes/meetings';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/users';
import { seedUsers } from './seed';
import { APP_VERSION } from './version';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Azure Container Apps)
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.PUBLIC_URL
].filter(Boolean) as string[];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'PlooiKaart Backend API',
    status: 'healthy',
    version: APP_VERSION,
    endpoints: {
      auth: '/auth',
      meetings: '/meetings',
      audit: '/audit',
      users: '/users'
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', authRoutes);
app.use('/meetings', meetingRoutes);
app.use('/audit', auditRoutes);
app.use('/users', userRoutes); // For scores and me
app.use('/upload', uploadRoutes);

// Serve static files from the React app
//app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

mongoose.connect(process.env.MONGODB_URI as string)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedUsers();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
