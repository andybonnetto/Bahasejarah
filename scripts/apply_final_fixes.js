
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/languageDefinitions_updated.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

const manualFixes = {
    "early-malay": "https://en.wikipedia.org/wiki/Proto-Malayic_language",
    "early-javanese": "https://en.wikipedia.org/wiki/Old_Javanese_language",
    "old-javanese": "https://en.wikipedia.org/wiki/Old_Javanese_language",
    "middle-javanese": "https://en.wikipedia.org/wiki/Javanese_language",
    "market-malay": "https://en.wikipedia.org/wiki/Bazaar_Malay",
    "modern-javanese": "https://en.wikipedia.org/wiki/Javanese_language",
    "tombulu": "https://en.wikipedia.org/wiki/Tombulu_language",
    "balinese-sasak-sumbawa": "https://en.wikipedia.org/wiki/Bali%E2%80%93Sasak%E2%80%93Sumbawa_languages",
    "papuan-languages": "https://en.wikipedia.org/wiki/Papuan_languages",
    "proto-south-sulawesi": "https://en.wikipedia.org/wiki/South_Sulawesi_languages",
    "toraja": "https://en.wikipedia.org/wiki/Toraja-Sa%27dan_language",
    "massenrempulu": "https://en.wikipedia.org/wiki/South_Sulawesi_languages",
    "bantenese": "https://en.wikipedia.org/wiki/Bantenese_language",
    "cirebonese": "https://en.wikipedia.org/wiki/Cirebonese_dialect",
    "banyumasan": "https://en.wikipedia.org/wiki/Banyumasan_dialect",
    "mataraman": "https://en.wikipedia.org/wiki/Javanese_language",
    "arekan": "https://en.wikipedia.org/wiki/Arekan_Javanese"
};

for (const [key, url] of Object.entries(manualFixes)) {
    if (data.languages[key]) {
        data.languages[key].wikiUrl = url;
    } else {
        console.warn(`Warning: Key ${key} not found in data.`);
    }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
console.log("Updated manual fixes in languageDefinitions_updated.json");
