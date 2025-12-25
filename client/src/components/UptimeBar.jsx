import React from 'react';
import { formatToLocalTime } from '../utils';

const UptimeBar = ({ history = [] }) => {
    // We need to fill 50 bars (representing recent checks)
    // If history is less than 50, we pad with empty
    // History is ordered newest first in API, so we reverse for visualization (oldest -> newest)

    const totalBars = 50;
    const data = [...history].reverse(); // Now Oldest -> Newest

    // Create an array of length totalBars
    const bars = Array.from({ length: totalBars }).map((_, i) => {
        // We want to map the end of the data array to the end of the bars array
        // data index: (data.length - 1) corresponds to bars index (totalBars - 1)
        // relative index
        const dataIndex = data.length - (totalBars - i);

        if (dataIndex < 0) return { status: 'empty' };

        const point = data[dataIndex];
        return {
            status: point.status_code >= 200 && point.status_code < 300 ? 'success' : 'error',
            ...point
        };
    });

    return (
        <div className="uptime-bar-container" title="Last 50 checks">
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className={`uptime-bar ${bar.status === 'success' ? 'bar-success' : bar.status === 'error' ? 'bar-error' : ''}`}
                    title={bar.created_at ? `${formatToLocalTime(bar.created_at)} - ${bar.status_code} (${bar.response_time_ms}ms)` : 'No Data'}
                />
            ))}
        </div>
    );
};

export default UptimeBar;
