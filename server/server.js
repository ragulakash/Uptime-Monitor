const express = require('express');
const cors = require('cors');
const { startMonitorEngine } = require('./monitorEngine');
const apiRoutes = require('./routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Start the monitor engine (cron jobs)
startMonitorEngine();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
