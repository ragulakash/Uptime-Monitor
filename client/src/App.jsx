import React, { useState, useEffect } from 'react';
import MonitorCard from './components/MonitorCard';
import api from './api';

function App() {
  const [monitors, setMonitors] = useState([]);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '' });

  useEffect(() => {
    fetchMonitors();
    // Poll for status updates
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitors = async () => {
    try {
      const res = await api.get('/monitors');
      setMonitors(res.data);
    } catch (err) {
      console.error("Error fetching monitors", err);
    }
  };

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    if (!newMonitor.name || !newMonitor.url) return;
    try {
      await api.post('/monitors', newMonitor);
      setNewMonitor({ name: '', url: '' });
      fetchMonitors();
    } catch (err) {
      alert("Failed to add monitor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/monitors/${id}`);
      fetchMonitors();
    } catch (err) {
      alert("Failed to delete monitor");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Uptime Pulse</h1>
        <div style={{ color: '#94a3b8' }}>
          Real-time Monitor
        </div>
      </header>

      <form className="add-monitor-form" onSubmit={handleAddMonitor}>
        <div className="input-group">
          <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Monitor Name</label>
          <input
            className="input"
            placeholder="e.g. My Portfolio"
            value={newMonitor.name}
            onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>URL to Monitor</label>
          <input
            className="input"
            placeholder="https://example.com"
            value={newMonitor.url}
            onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary">Add Monitor</button>
      </form>

      <div className="card-grid">
        {monitors.map(monitor => (
          <MonitorCard key={monitor.id} monitor={monitor} onDelete={handleDelete} />
        ))}
        {monitors.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            No monitors active. Add one above to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
