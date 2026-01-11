import React from 'react';
import IndonesiaMap from './IndonesiaMap';

const REGION_MAPPING = {
  // Java
  'Banten': 'banten',
  'Jawa-Barat': 'west-java',
  'Jawa-Tengah': 'central-java',
  'Daerah-Istimewa-Yogyakarta': 'yogyakarta',
  'Jawa-Timur': 'east-java',
  'Pulau-Madura': 'madura',

  // Sumatra
  'Aceh': 'sumatra',
  'Sumatera-Utara': 'sumatra',
  'Sumatera-Barat': 'sumatra',
  'Riau': 'sumatra',
  'Kepulauan-Riau': 'sumatra',
  'Jambi': 'sumatra',
  'Bengkulu': 'sumatra',
  'Sumatera-Selatan': 'sumatra',
  'Lampung': 'sumatra',
  'Pulau-Bangka': 'sumatra',
  'Pulau-Belitung': 'sumatra',
  'Pulau-Nias': 'sumatra',
  'Pulau-Siberut': 'sumatra',

  // Kalimantan
  'Kalimantan-Barat': 'kalimantan',
  'Kalimantan-Tengah': 'kalimantan',
  'Kalimantan-Selatan': 'kalimantan',
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
  'Maluku-Utara': 'maluku',
  'Pulau-Buru': 'maluku',

  // Nusa Tenggara (and Bali)
  'Bali': 'bali', // Can be mapped to 'java' or 'nusatenggara' depending on era
  'Nusa-Tenggara-Barat': 'nusatenggara',
  'Pulau-Lombok': 'nusatenggara',
  'Nusa-Tenggara-Timur': 'nusatenggara',
  'Pu-au-Sumba': 'nusatenggara',
  'Pulau-Timor': 'nusatenggara',
  'Pulau-Wetar': 'nusatenggara',
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

const Map = ({ year, hoveredRegion, onRegionHover, onRegionLeave, regionTimeline, languageDefs }) => {

  /*
  const getActiveLanguages = (regionId) => {
    const history = regionTimeline.regions[regionId];
    if (!history) return null;
    return history.filter(item => {
        const startOk = item.startYear <= year;
        const endOk = item.endYear === null || item.endYear > year;
        return startOk && endOk;
    });
  };
  */

  // Actually, I should use the function I partially defined.

  const getActiveLanguages = (regionId) => {
    // If regionTimeline is not yet loaded or passed (initial render), handle gracefully
    if (!regionTimeline || !regionTimeline.regions) return [];

    const history = regionTimeline.regions[regionId];
    if (!history) return [];

    return history.filter(item => {
      const startOk = item.startYear <= year;
      const endOk = item.endYear === null || item.endYear > year;
      return startOk && endOk;
    });
  };

  const getRegionData = (dataId) => {
    let entries = getActiveLanguages(dataId);

    if (entries.length === 0 && dataId !== 'all') {
      entries = getActiveLanguages('all');
    }

    if (entries.length === 0) {
      // Fallback for some specific islands that might resort to 'archipelago' if 'all' missed?
      // In original logic: specific > all > archipelago
      entries = getActiveLanguages('archipelago');
    }

    if (entries.length > 0) {
      // Return the color of the first valid entry.
      // We prefer specific languages over defaults if multiple?
      // The list is chronological by default from conversion? 
      // No, conversion logic pushed chronologically.
      // But active list is filtered. 
      // We probably want the most "specific" or "recent" update?
      // Actually, if multiple languages coexist, usually one is dominant or they share color in original data (region-based).
      // Let's take the last one in the list (most recent addition?) or first?
      // Original data: list of languages. "color" was on region object.
      // My conversion put color on each interval.
      // I'll take the first one.
      return { color: entries[0].color || '#334155' };
    }

    return { color: '#334155' };
  };

  // Generate dynamic CSS styles for regions
  const generateStyles = () => {
    return Object.entries(REGION_MAPPING).map(([svgId, dataId]) => {
      const regionData = getRegionData(dataId);
      const color = regionData.color;
      // Use ID selector for specificity. The SVG structure uses groups with IDs.
      // We target the path inside the group.
      return `
g[id = "${svgId}"] path {
    fill: ${color};
    transition: fill 0.5s ease, opacity 0.3s ease;
    cursor: pointer;
}
g[id = "${svgId}"]:hover path {
    opacity: 0.8;
    filter: brightness(1.2);
}
`;
    }).join('\n');
  };

  const handleMouseMove = (e) => {
    // Event delegation to find the region group
    const group = e.target.closest('g[id]');
    if (group && REGION_MAPPING[group.id]) {
      const mappingId = REGION_MAPPING[group.id];
      const regionData = getRegionData(mappingId);
      const regionName = group.id.replace(/-/g, ' ');
      onRegionHover(mappingId, regionData, regionName);
    } else {
      // If hovering over sea or non-mapped region
      onRegionLeave();
    }
  };

  return (
    <div className="map-container"
      onMouseLeave={onRegionLeave}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        const group = e.target.closest('g[id]');
        if (group && REGION_MAPPING[group.id]) {
          // Trigger click logic if needed (currently reusing hover logic for selection in App)
        }
      }}
    >
      <style>{generateStyles()}</style>
      <IndonesiaMap
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.2))' }}
      />
      <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'white', fontSize: '12px', opacity: 0.5 }}>
        *Interactive Map
      </div>
    </div>
  );
};

export default Map;
