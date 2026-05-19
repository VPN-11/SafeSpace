const mongoose = require("mongoose");

const dbStatus = {
  state: "disconnected",
  host: null,
  name: null,
  lastError: null,
  connectedAt: null,
};

let cachedConnection = null;
let connectionPromise = null;

function setDisconnectedStatus(error = null) {
  dbStatus.state = "disconnected";
  dbStatus.host = null;
  dbStatus.name = null;
  dbStatus.connectedAt = null;
  dbStatus.lastError = error ? error.message : null;
}

function getMongooseConnection() {
  return mongoose.connections[0] || mongoose.connection;
}

function setConnectedStatus(connection) {
  dbStatus.state = "connected";
  dbStatus.host = connection.host;
  dbStatus.name = connection.name;
  dbStatus.connectedAt = dbStatus.connectedAt || new Date().toISOString();
  dbStatus.lastError = null;
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const timeoutMs = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 15000;
  const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE) || 20;
  const minPoolSize = Number(process.env.MONGODB_MIN_POOL_SIZE) || 0;
  const connection = getMongooseConnection();

  if (!mongoUri) {
    const error = new Error("MONGODB_URI is not configured.");
    setDisconnectedStatus(error);
    console.error(`MongoDB configuration error: ${error.message}`);
    throw error;
  }

  if (connection.readyState === 1) {
    cachedConnection = mongoose;
    setConnectedStatus(connection);
    return cachedConnection;
  }

  if (connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  dbStatus.state = "connecting";
  dbStatus.lastError = null;

  connectionPromise = (async () => {
    dbStatus.state = "connecting";
    dbStatus.lastError = null;

    const connectionAttempt = mongoose.connect(mongoUri, {
      connectTimeoutMS: timeoutMs,
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || timeoutMs,
      maxPoolSize,
      minPoolSize,
    });

    connectionAttempt.catch(() => {});

    const conn = await Promise.race([
      connectionAttempt,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);

    cachedConnection = conn;
    setConnectedStatus(conn.connection);

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    setDisconnectedStatus(error);
    connectionPromise = null;
    cachedConnection = null;
    if (getMongooseConnection().readyState !== 1) {
      await mongoose.disconnect().catch(() => {});
    }
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

function getDBStatus() {
  const connection = getMongooseConnection();
  return {
    ...dbStatus,
    mongooseReadyState: connection.readyState,
  };
}

function isDBReady() {
  return getMongooseConnection().readyState === 1;
}

mongoose.connection.on("disconnected", () => {
  cachedConnection = null;
  connectionPromise = null;
  if (dbStatus.state !== "disconnected") {
    setDisconnectedStatus(new Error("MongoDB connection disconnected."));
  }
});

mongoose.connection.on("connected", () => {
  cachedConnection = mongoose;
  setConnectedStatus(mongoose.connection);
});

mongoose.connection.on("error", (error) => {
  setDisconnectedStatus(error);
});

module.exports = {
  connectDB,
  getDBStatus,
  isDBReady,
};
