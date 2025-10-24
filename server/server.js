// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ Connection error:", err));

// Schema for panel, battery, or load
const DeviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    voltageUsed: { type: Number, required: true },
    voltageReceived: { type: Number, required: true },
    currentReceived: { type: Number, required: true },
    powerGenerated: { type: Number, required: true },
    percent: { type: Number },       // optional for battery
    temperature: { type: Number },   // optional for battery
    timestamp: { type: Date, default: Date.now }
});

// Model
const Device = mongoose.model("Device", DeviceSchema);

// POST API to receive array of data
app.post("/api/devices", async (req, res) => {
    try {
        const devicesArray = req.body; // Expect an array
        if (!Array.isArray(devicesArray)) {
            return res.status(400).json({ error: "Data must be an array" });
        }

        // Insert all objects into MongoDB
        const savedDevices = await Device.insertMany(devicesArray);
        res.status(201).json({ message: "Devices data saved", data: savedDevices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all devices
app.get("/api/devices", async (req, res) => {
    try {
        const devices = await Device.find().sort({ timestamp: -1 });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET by device name
app.get("/api/devices/:name", async (req, res) => {
    try {
        const devices = await Device.find({ name: req.params.name }).sort({ timestamp: -1 });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
