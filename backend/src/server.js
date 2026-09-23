require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const { generateCustomId } = require('./utils/generateCustomId');

const app = express();
const prisma = new PrismaClient();
// const redis = new Redis(process.env.REDIS_URL); // Uncomment when Redis is running

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files

// --- DUMMY ROUTE TO TEST ID GENERATION ---
app.post('/api/auth/register-mock', async (req, res) => {
  try {
    const { role, name, phone } = req.body; // e.g. 'DRIVER', 'Ramesh Kumar', '9998887776'
    
    // 1. Generate Custom ID!
    const customId = await generateCustomId(role);

    // 2. Insert into DB (Mocking without actual DB connection for now)
    // Normally: await prisma.user.create({ ... })
    
    res.json({
      success: true,
      message: `Successfully generated ID for new ${role}`,
      data: {
        id: customId,
        name,
        phone,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Basic Health Check
app.get('/', (req, res) => {
  res.json({ status: 'LunchMate API is running (Express + Prisma + Redis)' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Folder architecture ready. ID Generator ready.`);
});
