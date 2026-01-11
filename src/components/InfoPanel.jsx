import React from 'react';

const InfoPanel = ({ data, mousePosition }) => {
    // Handle both array (old format) and object with languages property (new format)
    const languagesData = data?.languages || data;

    if (!languagesData || (Array.isArray(languagesData) && languagesData.length === 0)) return null;

    const languages = Array.isArray(languagesData) ? languagesData : [languagesData];

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            top: mousePosition.y + 20,
            left: mousePosition.x + 20,
            padding: '16px',
            maxWidth: '300px',
            pointerEvents: 'none',
            zIndex: 50,
            color: 'var(--text-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {languages.map((lang, index) => (
                <div key={index} style={{ borderBottom: index < languages.length - 1 ? '1px solid var(--glass-border)' : 'none', paddingBottom: index < languages.length - 1 ? '12px' : '0' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--accent-color)' }}>{lang.name}</h3>
                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Period:</strong> {lang.period}</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Alphabet:</strong> {lang.alphabet}</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Family:</strong> {lang.branch}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.8 }}>
                        {lang.description}
                    </div>
                    {(lang.parent || (lang.children && lang.children.length > 0)) && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                            {lang.parent && <div><strong>Parent:</strong> {lang.parent}</div>}
                            {lang.children && lang.children.length > 0 && <div><strong>Child:</strong> {lang.children.join(', ')}</div>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InfoPanel;
