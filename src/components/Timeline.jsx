import React from 'react';

const Timeline = ({ currentYear, onChange }) => {
    const minYear = -2000;
    const maxYear = 2024;

    const formatYear = (year) => {
        if (year < 0) return `${Math.abs(year)} BC`;
        return `${year} AD`;
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            maxWidth: '800px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 100
        }}>
            <div style={{ marginBottom: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {formatYear(currentYear)}
            </div>
            <input
                type="range"
                min={minYear}
                max={maxYear}
                value={currentYear}
                onChange={(e) => onChange(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '5px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>2000 BC</span>
                <span>1000 BC</span>
                <span>0</span>
                <span>1000 AD</span>
                <span>2000 AD</span>
            </div>
        </div>
    );
};

export default Timeline;
