import React from 'react';

const IntroductionSection = () => {
    return (
        <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-color)',
            minHeight: '40vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            borderTop: '1px solid var(--glass-border)'
        }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--accent-color)' }}>
                Welcome to Bahasejarah
            </h2>
            <p style={{ maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.8 }}>
                Explore the history and evolution of languages across the Indonesian archipelago.
                Use the timeline to travel through history, hover over regions to see active languages,
                and <strong>click on a region or language</strong> to view detailed lineage and information.
            </p>
            <div style={{ marginTop: '40px', opacity: 0.5, fontSize: '0.9rem' }}>
                Scroll up to interact with the map
            </div>
        </div>
    );
};

export default IntroductionSection;
