// src/app.ts
import express from 'express';
import academicNetworkRoutes from './routes/academicNetworkRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;  // Use 5000 to avoid conflicts

app.use(express.json());

app.use('/api/neo4j', academicNetworkRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Neo4j Academic Network API is RUNNING! 🎉</h1>');
});

// This will only run if everything loaded correctly
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`Open your browser and go to http://localhost:${PORT}`);
});