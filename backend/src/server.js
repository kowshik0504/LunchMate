const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Basic health check routes
app.get('/', (req, res) => {
    res.send('LunchMate API is running perfectly!');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'LunchMate Backend API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start Server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
