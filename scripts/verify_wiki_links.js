
import fs from 'fs';
import path from 'path';

// Read the JSON file
const dataPath = path.join(process.cwd(), 'src/data/languageDefinitions.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);
const languages = data.languages;

const checkUrl = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        // Wiki returns 404 for non-existent pages.
        // It might return 200 for "Search results" if we are unlucky, but usually 404.
        if (response.status === 200) {
            return response.url;
        }
        return null;
    } catch (e) {
        return null;
    }
};

const processLanguages = async () => {
    const results = {};
    const updates = {};
    const errors = [];

    console.log("Checking Wikipedia links...");

    for (const [key, lang] of Object.entries(languages)) {
        const nameEncoded = lang.name.replace(/ /g, '_');

        // Strategy 1: Try with _language suffix (Current behavior)
        const urlWithSuffix = `https://en.wikipedia.org/wiki/${nameEncoded}_language`;
        let finalUrl = await checkUrl(urlWithSuffix);

        if (!finalUrl) {
            // Strategy 2: Try without suffix
            const urlWithoutSuffix = `https://en.wikipedia.org/wiki/${nameEncoded}`;
            finalUrl = await checkUrl(urlWithoutSuffix);

            if (!finalUrl) {
                // Strategy 3: Try slightly different variations if possible?
                // For now just error.
                errors.push({ key, name: lang.name });
                console.error(`[FAIL] ${lang.name}: Could not find a valid Wikipedia page.`);
                continue;
            }
        }

        // Check if we got a "Wikipedia does not have an article with this exact name" page 
        // (Though usually 404, but sometimes it doesn't).
        // Since we used HEAD, we can't check content. But status 200 on wiki usually means it exists.

        console.log(`[OK]   ${lang.name} -> ${finalUrl}`);
        updates[key] = finalUrl;
    }

    console.log("\n--- Summary ---");
    console.log(`Total checked: ${Object.keys(languages).length}`);
    console.log(`Found: ${Object.keys(updates).length}`);
    console.log(`Missing: ${errors.length}`);

    if (errors.length > 0) {
        console.log("\nMissing pages for:", errors.map(e => e.name).join(", "));
    }

    // Generate updated JSON content
    const updatedData = { ...data };
    for (const [key, url] of Object.entries(updates)) {
        updatedData.languages[key].wikiUrl = url;
    }

    // Write to a temporary file correctly
    fs.writeFileSync('src/data/languageDefinitions_updated.json', JSON.stringify(updatedData, null, 4));
    console.log("\nWrote updated data to src/data/languageDefinitions_updated.json");
};

processLanguages();
