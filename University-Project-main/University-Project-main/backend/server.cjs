const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
let MongoMemoryServer;
try {
  // optional dependency; only loaded if installed
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch {}
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const researchRoutes = require('./routes/research.cjs');
const applicationRoutes = require('./routes/applications.cjs');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler.cjs');
const { notFound } = require('./middleware/notFound.cjs');

// Load environment variables
// When packaged (pkg), allow reading .env next to the exe
const runtimeBaseDir = process.pkg ? path.dirname(process.execPath) : __dirname;
dotenv.config({ path: path.join(runtimeBaseDir, '.env') });

const app = express();

// Security middleware
// app.use(helmet());
// app.use(compression());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// CORS configuration
// Allow any localhost/127.0.0.1 port in development to avoid dev-server port prompts breaking CORS
const isLocalOrigin = (origin) => {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;

    // Also allow RFC1918 private IPv4 ranges in development (LAN testing)
    // - 10.0.0.0/8
    // - 172.16.0.0/12
    // - 192.168.0.0/16
    if (/^10\./.test(host)) return true;
    const m172 = /^172\.(\d{1,3})\./.exec(host);
    if (m172) {
      const second = Number(m172[1]);
      if (second >= 16 && second <= 31) return true;
    }
    if (/^192\.168\./.test(host)) return true;

    return false;
  } catch {
    return false;
  }
};

const parseAllowedOrigins = () => {
  const list = [];
  if (process.env.CORS_ORIGINS) {
    list.push(
      ...process.env.CORS_ORIGINS
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  if (process.env.FRONTEND_URL) {
    list.push(process.env.FRONTEND_URL.trim());
  }
  return Array.from(new Set(list));
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'production') {
      // If configured, restrict to allowed origins. If not, allow all for initial deployment.
      if (allowedOrigins.length > 0) {
        return callback(null, !!origin && allowedOrigins.includes(origin));
      }
      return callback(null, true);
    }
    // In development allow any localhost/127.0.0.1 (any port) and any explicitly allowed via env
    if (isLocalOrigin(origin)) return callback(null, true);
    if (allowedOrigins.length > 0 && origin && allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const uploadsDir = process.env.UPLOAD_PATH
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.join(runtimeBaseDir, 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Unable to create uploads directory:', uploadsDir, e);
}
app.use('/uploads', express.static(uploadsDir));

// Favicon (avoid 404/500 when browsers request it)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const conn = mongoose.connection;
  res.json({ 
    status: 'OK', 
    message: 'Research Grant API is running',
    timestamp: new Date().toISOString(),
    db: {
      state: conn.readyState, // 1=connected
      host: conn?.host || null,
      name: conn?.name || null
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/applications', applicationRoutes);

// Serve React production build (if present)
// - For local dev, you can still run CRA separately.
// - For packaged exe, the build is bundled into backend/web-build.
const webBuildDir = path.join(__dirname, 'web-build');
const webIndex = path.join(webBuildDir, 'index.html');
if (fs.existsSync(webIndex)) {
  app.use(express.static(webBuildDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    return res.sendFile(webIndex);
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'research_grant_db';

    // Support in-memory DB for local/dev when MONGODB_URI=memory
    if (mongoUri === 'memory') {
      if (!MongoMemoryServer) {
        throw new Error('mongodb-memory-server is not installed. Run npm i -D mongodb-memory-server');
      }
      const mem = await MongoMemoryServer.create({ instance: { dbName } });
      mongoUri = mem.getUri();
      console.log('Using in-memory MongoDB instance');
    }

    const conn = await mongoose.connect(mongoUri, { dbName });
    console.log(`MongoDB Connected: ${conn.connection.host}/${dbName}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
// Default to 5050 to match existing local dev convention in the frontend.
const PORT = process.env.PORT || 5050;

const listenWithFallback = async (port) => {
  // If HOST is explicitly set, respect it.
  const preferredHosts = process.env.HOST
    ? [process.env.HOST]
    : ['::', '0.0.0.0', '127.0.0.1'];

  let lastErr;
  for (const host of preferredHosts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve, reject) => {
        const server = app.listen(port, host, () => {
          console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
          console.log(`Listening on host: ${host}`);
          console.log(`Health check: http://localhost:${port}/api/health`);
          resolve(server);
        });
        server.on('error', (err) => {
          try {
            server.close();
          } catch {}
          reject(err);
        });
      });
      return;
    } catch (err) {
      lastErr = err;
      // If the port is already taken, don't keep trying.
      if (err && err.code === 'EADDRINUSE') throw err;
    }
  }
  throw lastErr || new Error('Unable to start server on any host binding');
};

const startServer = async () => {
  await connectDB();

  await listenWithFallback(PORT);
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
