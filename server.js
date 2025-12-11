const express = require('express');
const { Client, Environment } = require('square');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from current directory

// Initialize Square Client
const client = new Client({
    accessToken: process.env.SANDBOX_ACCESS_TOKEN,
    environment: Environment.Sandbox, // Change to Environment.Production for live
});

// Process Payment Route
app.post('/process-payment', async (req, res) => {
    const { sourceId, amount } = req.body;

    try {
        const payment = await client.paymentsApi.createPayment({
            sourceId: sourceId,
            idempotencyKey: crypto.randomUUID(), // Unique ID to prevent duplicate payments
            amountMoney: {
                amount: Math.round(amount * 100), // Convert to cents (integer)
                currency: 'USD',
            },
        });

        // Send success response
        // BigInt handling for serialization if necessary, simplified here
        const result = payment.result;
        const jsonResult = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ success: true, payment: jsonResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
