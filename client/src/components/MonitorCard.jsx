import React, { useEffect, useState } from 'react';
import UptimeBar from './UptimeBar';
import api from '../api';
import { formatToLocalTime } from '../utils';

const MonitorCard = ({ monitor, onDelete }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
        // Poll history every minute to match server updates
        const interval = setInterval(fetchHistory, 60000);
        return () => clearInterval(interval);
    }, [monitor.id]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/monitors/${monitor.id}/history`);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const isUp = monitor.last_status >= 200 && monitor.last_status < 300;
    const statusLabels = {
        0: 'DOWN (Network)',
        500: 'Server Error',
        404: 'Not Found'
    }

    const statusText = isUp ? 'OPERATIONAL' : (statusLabels[monitor.last_status] || `DOWN (${monitor.last_status || 'Unknown'})`);

    return (
        <div className="card">
            <div className="monitor-header">
                <div>
                    <div className="monitor-name">{monitor.name}</div>
                    <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="monitor-url">{monitor.url}</a>
                </div>
                <div className={`status-badge ${isUp ? 'status-up' : 'status-down'}`}>
                    {monitor.last_status ? statusText : 'PENDING'}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Last checked: {formatToLocalTime(monitor.last_check)}</span>
                {history[0] && <span>{history[0].response_time_ms}ms</span>}
            </div>

            <UptimeBar history={history} />

            <button className="delete-btn" onClick={() => onDelete(monitor.id)}>Remove Monitor</button>
        </div>
    );
};

export default MonitorCard;
