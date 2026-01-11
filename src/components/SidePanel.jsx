import React from 'react';

const SidePanel = ({ data, onClose, onNavigate }) => {
    const languages = data?.languages || data;
    const regionName = data?.regionName;

    if (!languages || languages.length === 0) return null;

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: '320px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            zIndex: 100,
            padding: '24px',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-color)' }}>
                    {regionName || 'Languages in Region'}
                </h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0 5px'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {languages.map((lang, index) => (
                    <div
                        key={index}
                        onClick={() => onNavigate(lang)}
                        style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        className="hover:bg-white/10 hover:border-blue-400/50"
                    >
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--accent-color)' }}>{lang.name}</h3>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '5px' }}>{lang.period}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                            <span style={{ opacity: 0.6 }}>Family: </span> {lang.branch}
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent-color)', opacity: 0.8 }}>
                            Click to view details →
                        </div>
                    </div>
                ))}
            </div>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(20px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default SidePanel;
