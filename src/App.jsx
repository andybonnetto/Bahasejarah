import React, { useState, useEffect, useRef } from 'react';
import Map from './components/Map';
import Timeline from './components/Timeline';
import InfoPanel from './components/InfoPanel';
import LanguageDetail from './pages/LanguageDetail';
import SidePanel from './components/SidePanel';
import RegionHistoryPanel from './components/RegionHistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import IntroductionSection from './components/IntroductionSection';
import languageDefinitions from './data/languageDefinitions.json';
import regionTimeline from './data/regionTimeline.json';

function App() {
  const [currentYear, setCurrentYear] = useState(-2000);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sidePanelData, setSidePanelData] = useState(null);
  const [selectedRegionHistory, setSelectedRegionHistory] = useState(null);
  const [theme, setTheme] = useState('dark');

  const detailSectionRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleRegionHover = (regionId, _unused, regionName) => {
    // Logic using regionTimeline to find active languages
    // This is mainly for the hovering InfoPanel

    const getActiveLanguages = (rId) => {
      const history = regionTimeline.regions[rId] || [];
      const global = regionTimeline.regions['all'] || [];
      const combined = [...global, ...history];

      return combined.filter(item => {
        const startOk = item.startYear <= currentYear;
        const endOk = item.endYear === null || item.endYear > currentYear;
        return startOk && endOk;
      });
    };

    let entries = getActiveLanguages(regionId);

    if (entries.length > 0) {
      const languages = entries.map(entry => {
        const langDef = languageDefinitions.languages[entry.languageId];
        if (!langDef) return null;
        return { ...langDef, id: entry.languageId };
      }).filter(Boolean);

      const uniqueLanguages = Array.from(new Set(languages.map(l => l.id)))
        .map(id => languages.find(l => l.id === id));

      if (uniqueLanguages.length > 0) {
        setHoveredInfo({
          languages: uniqueLanguages,
          regionName,
          regionId
        });
      } else {
        setHoveredInfo(null);
      }
    } else {
      setHoveredInfo(null);
    }
  };

  const handleRegionLeave = () => {
    setHoveredInfo(null);
  };

  const handleRegionClick = (regionId, regionName) => {
    const rId = regionId || (hoveredInfo && hoveredInfo.regionId);
    const rName = regionName || (hoveredInfo && hoveredInfo.regionName);

    if (rId) {
      setSelectedRegionHistory({
        regionId: rId,
        regionName: rName || rId
      });
      setSidePanelData(null);
      setHoveredInfo(null);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setSelectedRegionHistory(null); // Close the panel on selection
    // We do NOT auto-scroll, as per user request to just color the map initially.
    // But we update the content below.
  };

  const handleReset = () => {
    setSelectedLanguage(null);
    setSelectedRegionHistory(null);
  };

  const handleScrollToDetail = () => {
    if (detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ width: '100%', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* --- Map Section (Hero) --- */}
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>

        <header className="app-header">
          <div className="header-content">
            <div className="header-title-container">
              <div className="logo-container">
                <img src={`${import.meta.env.BASE_URL}logo_light.svg`} alt="Bahasejarah" className="header-logo logo-dark" />
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Bahasejarah" className="header-logo logo-light" />
              </div>
              <p className="header-subtitle">History of Indonesian Languages</p>
            </div>
          </div>
        </header>

        <div className="theme-toggle-wrapper">
          <ThemeToggle isDark={theme === 'dark'} toggleTheme={toggleTheme} />
        </div>

        <Map
          year={currentYear}
          onRegionHover={handleRegionHover}
          onRegionLeave={handleRegionLeave}
          onRegionClick={handleRegionClick}
          regionTimeline={regionTimeline}
          languageDefs={languageDefinitions.languages}
          selectedLanguageId={selectedLanguage?.id || (selectedLanguage?.name ? Object.keys(languageDefinitions.languages).find(key => languageDefinitions.languages[key].name === selectedLanguage.name) : null)} // Try to resolve ID if object doesn't have it (legacy)
        />

        <Timeline
          currentYear={currentYear}
          onChange={setCurrentYear}
          selectedLanguage={selectedLanguage}
        />

        {hoveredInfo && <InfoPanel data={hoveredInfo} mousePosition={mousePos} />}

        {selectedRegionHistory && (
          <RegionHistoryPanel
            regionId={selectedRegionHistory.regionId}
            regionName={selectedRegionHistory.regionName}
            regionTimeline={regionTimeline}
            languageDefs={languageDefinitions.languages}
            currentYear={currentYear}
            onClose={() => setSelectedRegionHistory(null)}
            onLanguageClick={handleLanguageSelect}
          />
        )}

        {sidePanelData && (
          <SidePanel
            data={sidePanelData}
            onClose={() => setSidePanelData(null)}
            onNavigate={handleLanguageSelect}
          />
        )}

        {/* Floating Action Buttons */}
        {selectedLanguage && (
          <>
            <button
              className="floating-action-btn btn-reset"
              onClick={handleReset}
              title="Reset to All Languages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </button>
            <button
              className="floating-action-btn btn-scroll-down"
              onClick={handleScrollToDetail}
              title="Scroll to Details"
            >
              ↓
            </button>
          </>
        )}

      </div>

      {/* --- Detail Section --- */}
      <div ref={detailSectionRef}>
        {selectedLanguage ? (
          <LanguageDetail
            language={selectedLanguage}
            onNavigate={handleLanguageSelect}
          />
        ) : (
          <IntroductionSection />
        )}
      </div>

    </div>
  );
}

export default App;
