const cron = require('node-cron');
const axios = require('axios');
const db = require('./database');

function startMonitorEngine() {
    console.log('Starting Monitor Engine...');

    // Run every minute: * * * * *
    cron.schedule('* * * * *', () => {
        console.log('Running monitor check task...');

        db.all("SELECT * FROM monitors WHERE is_active = 1", [], (err, monitors) => {
            if (err) {
                console.error("Error fetching monitors:", err);
                return;
            }

            monitors.forEach(monitor => {
                checkMonitor(monitor);
            });
        });
    });
}

async function checkMonitor(monitor) {
    const startTime = Date.now();
    let status = 0;

    try {
        const response = await axios.get(monitor.url, { timeout: 5000 });
        status = response.status;
    } catch (error) {
        if (error.response) {
            status = error.response.status;
        } else if (error.code === 'ECONNREFUSED') {
            status = 0; // Custom code for connection refused
        } else {
            status = 500; // Generic error
        }
        console.error(`Check failed for ${monitor.url}:`, error.message);
    } finally {
        const responseTime = Date.now() - startTime;
        logHeartbeat(monitor.id, status, responseTime);
    }
}

function logHeartbeat(monitorId, status, responseTime) {
    const stmt = db.prepare("INSERT INTO heartbeats (monitor_id, status_code, response_time_ms) VALUES (?, ?, ?)");
    stmt.run(monitorId, status, responseTime, (err) => {
        if (err) {
            console.error("Error logging heartbeat:", err);
        } else {
            // console.log(`Logged heartbeat for Monitor ${monitorId}: Status ${status}, Time ${responseTime}ms`);
        }
    });
    stmt.finalize();
}

module.exports = { startMonitorEngine };
