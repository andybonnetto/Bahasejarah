const fs = require('fs');
const path = require('path');

// Paths
const MAP_COMPONENT_PATH = path.join(__dirname, '../src/components/Map.jsx');
const DATA_PATH = path.join(__dirname, '../src/data/languages.json');

// 1. Load Data
const languagesData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// 2. Extract REGION_MAPPING from Map.jsx
// We can't require the JSX file directly, so we'll extract the object using regex.
const mapContent = fs.readFileSync(MAP_COMPONENT_PATH, 'utf8');
const mappingRegex = /const REGION_MAPPING = ({[\s\S]*?});/;
const match = mapContent.match(mappingRegex);

if (!match) {
    console.error("Could not find REGION_MAPPING in Map.jsx");
    process.exit(1);
}

// Evaluate the object string to get the actual object
// We need to be careful about what's inside. Assuming it's a simple JS object with string keys/values.
// We might need to quote keys if they aren't quoted in the source, but Map.jsx usually has them quoted or standard identifier keys.
// The `eval` here is running on local content for debugging, so it's relatively safe for this distinct task.
let regionMapping;
try {
    // Wrap in parentheses to evaluate as an expression
    regionMapping = eval('(' + match[1] + ')');
} catch (e) {
    console.error("Failed to parse REGION_MAPPING object:", e);
    console.log("Extracted content:", match[1]);
    process.exit(1);
}

// 3. Audit
console.log("Starting Audit...");
console.log(`Found ${Object.keys(regionMapping).length} mapped regions in Map.jsx.`);

let errorsFound = false;

languagesData.periods.forEach(period => {
    console.log(`\nChecking Year: ${period.year} (${period.name})`);

    // Create a set of available region IDs for this period
    const availableRegionIds = new Set(period.regions.map(r => r.id));

    // Check every mapped value
    const missingIds = new Set();

    Object.entries(regionMapping).forEach(([svgId, dataId]) => {
        if (!availableRegionIds.has(dataId)) {
            missingIds.add(dataId);
        }
    });

    if (missingIds.size > 0) {
        errorsFound = true;
        console.error(`  [FAIL] Missing Data IDs: ${Array.from(missingIds).join(', ')}`);
        console.error(`  These Map.jsx regions point to data IDs that don't exist in year ${period.year}.`);
    } else {
        console.log("  [PASS] All mapped regions have data.");
    }
});

if (errorsFound) {
    console.log("\nAudit FAILED: Orphan mappings found.");
    process.exit(1);
} else {
    console.log("\nAudit PASSED: All mappings are valid.");
}
