import React from 'react';
import languageDefinitions from '../data/languageDefinitions_updated.json';

import { useState } from 'react';

const LanguageDetail = ({ language, onBack, onNavigate }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    if (!language) return null;

    const findLanguageConfig = (name) => {
        return Object.values(languageDefinitions.languages).find(l => l.name === name);
    };

    const handleNavigate = (name) => {
        const target = findLanguageConfig(name);
        if (target && onNavigate) {
            onNavigate(target);
        }
    };

    const renderLink = (name) => {
        const target = findLanguageConfig(name);
        const isClickable = !!target;

        return (
            <span
                key={name}
                onClick={() => isClickable && handleNavigate(name)}
                className={`lang-link ${isClickable ? "clickable" : ""}`}
            >
                {name}
            </span>
        );
    };

    return (
        <div className="language-detail-container">
            <button
                onClick={onBack}
                className="lang-back-btn"
            >
                ← Back to Map
            </button>

            <div className="glass-panel language-detail-content">
                <h1 className="language-title">{language.name}</h1>

                <div className="language-detail-grid">
                    <div>
                        <h3>Period</h3>
                        <p>{language.period}</p>
                    </div>
                    <div>
                        <h3>Writing System</h3>
                        <p>{language.alphabet}</p>
                        {language.alphabetImage && (
                            <div className="alphabet-img-container">
                                <img
                                    src={`${import.meta.env.BASE_URL}${language.alphabetImage.startsWith('/') ? language.alphabetImage.substring(1) : language.alphabetImage}`}
                                    alt={`${language.name} alphabet`}
                                    className="alphabet-img"
                                    onClick={() => setIsImageModalOpen(true)}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3>Language Family</h3>
                        <p>{language.branch}</p>
                    </div>
                    {/* Placeholder for regions if available in data, or static for now */}
                    {language.source && (
                        <div>
                            <h3>Source</h3>
                            <p className="source-text">
                                {language.source}
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3>Description</h3>
                    <p style={{ lineHeight: '1.6' }}>{language.description}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3>Lineage</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {language.parent && (
                            <>
                                {renderLink(language.parent)}
                                <span>→</span>
                            </>
                        )}

                        <span className="lang-tag">{language.name}</span>

                        {language.children && language.children.length > 0 && (
                            <>
                                <span>→</span>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {language.children.map(child => renderLink(child))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <h3>Learn More</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><a href={language.wikiUrl} target="_blank" rel="noreferrer" className="wiki-link">Wikipedia: {language.name}</a></li>
                    </ul>
                </div>
            </div>

            {isImageModalOpen && (
                <div
                    onClick={() => setIsImageModalOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={`${import.meta.env.BASE_URL}${language.alphabetImage.startsWith('/') ? language.alphabetImage.substring(1) : language.alphabetImage}`}
                            alt={`${language.name} alphabet`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                        />
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                fontSize: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageDetail;
