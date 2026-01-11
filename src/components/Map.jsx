import React, { useMemo } from 'react';
import IndonesiaMap from './IndonesiaMap';
import { getLanguageColor, getLanguageStartYears } from '../utils/colorUtils';

const REGION_MAPPING = {
  // Java
  'Banten': 'banten',
  'Jawa-Barat': 'west-java',
  'Jawa-Tengah': 'central-java',
  'Daerah-Istimewa-Yogyakarta': 'yogyakarta',
  'Jawa-Timur': 'east-java',
  'Pulau-Madura': 'madura',

  // Sumatra
  'Aceh': 'aceh', // Fixed mapping from sumatra to aceh
  'Sumatera-Utara': 'sumatra',
  'Sumatera-Barat': 'minangkabau', // Or minangkabau? Check timeline keys.
  'Riau': 'sumatra',
  'Kepulauan-Riau': 'kepulauan-riau',
  'Jambi': 'sumatra',
  'Bengkulu': 'bengkulu',
  'Sumatera-Selatan': 'sumatra',
  'Lampung': 'lampung',
  'Pulau-Bangka': 'sumatra',
  'Pulau-Belitung': 'sumatra',
  'Pulau-Nias': 'sumatra',
  'Pulau-Siberut': 'sumatra',

  // Kalimantan
  'Kalimantan-Barat': 'kalimantan',
  'Kalimantan-Tengah': 'ngaju', // or ngaju?
  'Kalimantan-Selatan': 'banjar',
  'Kalimantan-Utara---Kalimantan-Timur': 'kalimantan',

  // Sulawesi
  'Sulawesi-Utara': 'sulawesi-utara',
  'Gorontalo': 'gorontalo',
  'Sulawesi-Tengah': 'sulawesi-tengah',
  'Sulawesi-Barat': 'sulawesi-barat',
  'Sulawesi-Selatan': 'sulawesi-selatan',
  'Sulawesi-Tenggara': 'sulawesi-tenggara',
  'Pulau-Buton': 'sulawesi-tenggara',
  'Pulau-Muna': 'sulawesi-tenggara',

  // Papua
  'Papua': 'papua',
  'Papua-Barat': 'papua',

  // Maluku
  'Maluku': 'maluku',
  'Maluku-Utara': 'maluku', // or ternate?
  'Pulau-Buru': 'maluku',

  // Nusa Tenggara (and Bali)
  'Bali': 'bali',
  'Nusa-Tenggara-Barat': 'sumbawa', // Split NTB into Lombok(Sasak)/Sumbawa? Using sumbawa key for now based on timeline
  'Pulau-Lombok': 'sasak',
  'Nusa-Tenggara-Timur': 'flores', // Broad mapping
  'Pu-au-Sumba': 'sumba',
  'Pulau-Timor': 'timor',
  'Pulau-Wetar': 'maluku',
  'NTT-Small-1': 'nusatenggara',
  'NTT-Small-2': 'nusatenggara',
  'NTT-Small-3': 'nusatenggara',
  'NTT-Small-4': 'nusatenggara',
  'NTT-Small-5': 'nusatenggara',
  'NTT-Small-6': 'nusatenggara',
  'NTT-Small-7': 'nusatenggara',
  'NTT-Small-8': 'nusatenggara',
  'NTT-Small-9': 'nusatenggara',
  'NTB-Small-1': 'nusatenggara'
};

const Map = ({ year, onRegionHover, onRegionLeave, onRegionClick, regionTimeline, languageDefs, selectedLanguageId }) => {

  // Memoize start years calculation
  const startYears = useMemo(() => getLanguageStartYears(regionTimeline), [regionTimeline]);

  const getActiveLanguages = (regionId) => {
    if (!regionTimeline || !regionTimeline.regions) return [];

    const history = regionTimeline.regions[regionId] || [];
    const global = regionTimeline.regions['all'] || [];

    // Combine global and regional history
    // Note: In case of duplicates or overrides, we might want logic, 
    // but for "Market Malay" being present everywhere, union is safer.
    const combined = regionId === 'all' ? history : [...global, ...history];

    return combined.filter(item => {
      const startOk = item.startYear <= year;
      const endOk = item.endYear === null || item.endYear > year;
      return startOk && endOk;
    });
  };

  const getRegionColor = (dataId) => {
    // 1. Get Active Languages for this region
    let entries = getActiveLanguages(dataId);

    // Fallback logic
    if (entries.length === 0) {
      entries = getActiveLanguages('archipelago');
    }

    if (entries.length === 0) return '#1e293b'; // Default Dark Slate

    // 2. Determine Color based on Mode
    if (selectedLanguageId) {
      // MODE: Selected Language
      // Check if selected language is active in this region
      const isActive = entries.some(e => e.languageId === selectedLanguageId);

      if (isActive) {
        // Render the selected language color
        // High opacity? Or keeping 20%? User said "color all the regions with the selected language in the color of the language and all other regions in dark grey".
        // Implicitly wants clarity. I'll use higher opacity for selected to pop.
        return getLanguageColor(selectedLanguageId, year, languageDefs, startYears, { selected: true });
      } else {
        // Dark Grey
        return '#333333';
      }
    } else {
      // MODE: All Languages
      // "Transparency -> set to 20 to highlight when multiple languages are present"
      // Since we can only render one color per path, this requirement is tricky.
      // We will render the color of the DOMINANT (last active) language with 0.2 opacity.
      // If multiple languages are present, the Map logic (SVG) limitation prevents true blending unless we had layers.
      // But 20% opacity against a dark background is requested.

      // Strategy: Take the last entry (often most specific or recent)
      const visibleLanguage = entries[entries.length - 1];

      return getLanguageColor(visibleLanguage.languageId, year, languageDefs, startYears, { overrideOpacity: 0.5 });
    }
  };

  // Generate dynamic CSS styles for regions
  const generateStyles = () => {
    if (!regionTimeline) return '';

    return Object.entries(REGION_MAPPING).map(([svgId, dataId]) => {
      const color = getRegionColor(dataId);

      return `
g[id="${svgId}"] path {
    fill: ${color};
    transition: fill 0.3s ease;
    cursor: pointer;
}
g[id="${svgId}"]:hover path {
    filter: brightness(1.3);
    opacity: 0.8;
}
`;
    }).join('\n');
  };

  const handleMouseMove = (e) => {
    const group = e.target.closest('g[id]');
    if (group && REGION_MAPPING[group.id]) {
      const mappingId = REGION_MAPPING[group.id];
      const regionName = group.id.replace(/-/g, ' ');

      // Pass data for tooltip
      // We need to pass ALL active languages for the tooltip to list them
      let entries = getActiveLanguages(mappingId);
      if (entries.length === 0) entries = getActiveLanguages('all');

      // Map to full definitions
      const activeLangs = entries.map(e => ({
        ...languageDefs[e.languageId],
        id: e.languageId
      })).filter(l => l.name); // Ensure valid

      const regionData = {
        languages: activeLangs,
        regionId: mappingId,
        regionName
      };

      onRegionHover(mappingId, regionData, regionName);
    } else {
      onRegionLeave();
    }
  };

  const handleRegionClick = (e) => {
    const group = e.target.closest('g[id]');
    if (group && REGION_MAPPING[group.id]) {
      const mappingId = REGION_MAPPING[group.id];
      const regionName = group.id.replace(/-/g, ' ');
      if (onRegionClick) {
        onRegionClick(mappingId, regionName);
      }
    }
  };

  return (
    <div className="map-container"
      onMouseLeave={onRegionLeave}
      onMouseMove={handleMouseMove}
      onClick={handleRegionClick}
    >
      <style>{generateStyles()}</style>
      <IndonesiaMap
        style={{ width: '100%', height: '100%' }} // Removed fixed filter to allow dynamic color to shine
      />
      <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'white', fontSize: '12px', opacity: 0.5 }}>
        *Developed by Andy Bonnetto.
      </div>
    </div>
  );
};

export default Map;
