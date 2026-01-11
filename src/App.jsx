import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Timeline from './components/Timeline';
import InfoPanel from './components/InfoPanel';
import LanguageDetail from './pages/LanguageDetail';
import SidePanel from './components/SidePanel';
import RegionHistoryPanel from './components/RegionHistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import languageDefinitions from './data/languageDefinitions_updated.json';
import regionTimeline from './data/regionTimeline.json';

function App() {
  const [currentYear, setCurrentYear] = useState(-2000);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sidePanelData, setSidePanelData] = useState(null);
  const [selectedRegionHistory, setSelectedRegionHistory] = useState(null);
  const [theme, setTheme] = useState('dark');

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
    // Find history for this region
    // Logic using regionTimeline

    let activeLanguages = [];

    const getActiveLanguages = (rId) => {
      const history = regionTimeline.regions[rId] || [];
      const global = regionTimeline.regions['all'] || [];
      const combined = [...global, ...history];

      // Dedup by languageId and startYear if needed, or just prioritize region?
      // With pruning, we should just combine. If duplicates exist, we filter them.

      return combined.filter(item => {
        const startOk = item.startYear <= currentYear;
        const endOk = item.endYear === null || item.endYear > currentYear;
        return startOk && endOk;
      });
    };

    let entries = getActiveLanguages(regionId);

    // DEDUP logic: if we have multiple entries for same language (e.g. one from 'all' one from region), which one wins? 
    // Region should strictly override or supplement.
    // Since we pruned exact duplicates, we might have partial overlaps?
    // Let's rely on unique languageId set later in the flow.

    if (entries.length > 0) {
      const languages = entries.map(entry => {
        // Use languageDefinitions here
        const langDef = languageDefinitions.languages[entry.languageId];
        if (!langDef) return null;
        return { ...langDef, id: entry.languageId }; // Add ID to object
      }).filter(Boolean);

      // Unique languages
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

  const handleRegionClick = () => {
    if (hoveredInfo) {
      // Open the region history panel
      setSelectedRegionHistory({
        regionId: hoveredInfo.regionId,
        regionName: hoveredInfo.regionName
      });
      setSidePanelData(null);
    }
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {selectedLanguage ? (
        <LanguageDetail
          language={selectedLanguage}
          onBack={() => setSelectedLanguage(null)}
          onNavigate={setSelectedLanguage}
        />
      ) : (
        <>
          <header style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div className="glass-panel" style={{ padding: '20px', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-color)' }}>Bahasejarah</h1>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>History of Indonesian Languages</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px', marginLeft: '10px' }}>
                <ThemeToggle isDark={theme === 'dark'} toggleTheme={toggleTheme} />
              </div>
            </div>
          </header>

          <main style={{ width: '100%', height: '100%' }}>
            <div onClick={handleRegionClick} style={{ width: '100%', height: '100%' }}>
              <Map
                year={currentYear}
                hoveredRegion={hoveredInfo ? 'active' : null}
                onRegionHover={handleRegionHover}
                onRegionLeave={handleRegionLeave}
                regionTimeline={regionTimeline} // Pass new data
                languageDefs={languageDefinitions.languages} // Pass definitions for color lookups if needed
              />
            </div>
          </main>

          <Timeline currentYear={currentYear} onChange={setCurrentYear} />

          {hoveredInfo && <InfoPanel data={hoveredInfo} mousePosition={mousePos} />}

          {selectedRegionHistory && (
            <RegionHistoryPanel
              regionId={selectedRegionHistory.regionId}
              regionName={selectedRegionHistory.regionName}
              regionTimeline={regionTimeline} // Pass new data
              languageDefs={languageDefinitions.languages}
              currentYear={currentYear}
              onClose={() => setSelectedRegionHistory(null)}
              onLanguageClick={setSelectedLanguage}
            />
          )}

          {sidePanelData && (
            <SidePanel
              data={sidePanelData}
              onClose={() => setSidePanelData(null)}
              onNavigate={setSelectedLanguage}
            />
          )}

        </>
      )}
    </div>
  );
}

export default App;
