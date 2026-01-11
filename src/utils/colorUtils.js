
/**
 * Maps language families/branches to specific Hues (0-360).
 * Colors are chosen to be distinct but harmonious on a dark/light map.
 */
const BRANCH_HUES = {
    // Austronesian / Malayo-Polynesian Core
    'Austronesian': 180, // Cyan
    'Malayo-Polynesian': 180, // Cyan

    // Major Branches
    'Malayic': 160, // Teal/Green
    'Javanese': 200, // Light Blue
    'Sundanese': 220, // Blue
    'Madurese': 210, // Blue-ish

    // Sulawesi
    'South Sulawesi': 280, // Purple
    'Minahasan': 300, // Magenta
    'Gorontalic': 290, // Violet
    'Kaili-Pamona': 270, // Purple-Blue

    // Eastern
    'Central-Eastern Malayo-Polynesian': 30, // Orange
    'Central Maluku': 40, // Orange-Yellow
    'Timoric': 25, // Red-Orange

    // Papuan
    'Papuan': 0, // Red
    'West Papuan': 10, // Red-Orange (Ternate)

    // Others
    'Lampungic': 140, // Green
    'West Barito': 120, // Green (Ngaju)
    'Indo-European': 60, // Yellow (Sanskrit influence/Colonial)

    // Fallback
    'Other': 0 // Grey/Red fallback if not found?
};

/**
 * Calculates the start year (first apparition) for each language ID found in the timeline.
 * @param {Object} timelineData - The regionTimeline.json data
 * @returns {Object} Map of languageId -> minStartYear
 */
export const getLanguageStartYears = (timelineData) => {
    const startYears = {};

    if (!timelineData || !timelineData.regions) return startYears;

    Object.values(timelineData.regions).forEach(regionSegments => {
        if (Array.isArray(regionSegments)) {
            regionSegments.forEach(segment => {
                const { languageId, startYear } = segment;
                if (startYears[languageId] === undefined || startYear < startYears[languageId]) {
                    startYears[languageId] = startYear;
                }
            });
        }
    });

    return startYears;
};

/**
 * Generates a HSLA color string for a language instance.
 * @param {string} languageId 
 * @param {number} currentYear 
 * @param {Object} definitions - languageDefinitions.languages
 * @param {Object} startYears - Result from getLanguageStartYears
 * @param {Object} options - { overrideOpacity, selected }
 * @returns {string} HSLA color string
 */
export const getLanguageColor = (languageId, currentYear, definitions, startYears, options = {}) => {
    // 1. Get Language Metadata
    const def = definitions[languageId];
    const branch = def ? def.branch : 'Other';

    // 2. Determine Hue (Type)
    // Try exact match or partial match (e.g. if branch is "Malayo-Polynesian, Javanese" -> Javanese?)
    // For now simple lookup
    let hue = BRANCH_HUES[branch];
    if (hue === undefined) {
        // Fallback: Try to find a key that is contained in the branch string
        const foundKey = Object.keys(BRANCH_HUES).find(key => branch && branch.includes(key));
        hue = foundKey ? BRANCH_HUES[foundKey] : 0; // Default Red if unknown
    }

    // 3. Determine Saturation (Age)
    // "Proportional to the period of time of the first apparition"
    // Interpretation: The longer it has been around, the more saturated (established).
    // Or: The older it is, the more "faded" it might be? 
    // Let's go with: Old/Established = Saturated. New/Emerging = Less Saturated?
    // Actually, distinctness is important. Let's try:
    // Saturation ranges from 40% (new) to 90% (ancient).

    const startYear = startYears[languageId] !== undefined ? startYears[languageId] : currentYear;
    const age = currentYear - startYear;

    // Cap age influence at 2000 years for max saturation
    const maxAge = 2000;
    const minSat = 40;
    const maxSat = 90;
    const saturationRatio = Math.min(Math.max(age, 0) / maxAge, 1);

    const saturation = minSat + (saturationRatio * (maxSat - minSat));

    // 4. Determine Lightness
    // Keep lightness relatively constant or allow it to vary slightly?
    // Dark mode map: 50% or 60% usually pops well.
    // If we want transparency to work well, we need high lightness/saturation.
    const lightness = 60;

    // 5. Determine Alpha (Transparency)
    // "set to 20 to highlight when multiple languages are present"
    // If selected, maybe opaque?
    let alpha = 0.2;
    if (options.selected) {
        alpha = 0.8; // High visibility for selected
    } else if (options.overrideOpacity) {
        alpha = options.overrideOpacity;
    }

    // Special case for "Papuan" or "Other" to avoid looking like error red?
    // 0 Hue is Red. Maybe desaturate if unknown?
    if (hue === 0 && !branch) {
        return `hsla(0, 0%, 50%, ${alpha})`;
    }

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
};
