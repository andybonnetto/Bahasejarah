
const urls = [
    "https://en.wikipedia.org/wiki/Proto-Malayic_language",
    "https://en.wikipedia.org/wiki/Old_Javanese_language",
    "https://en.wikipedia.org/wiki/Javanese_language",
    "https://en.wikipedia.org/wiki/Bazaar_Malay",
    "https://en.wikipedia.org/wiki/Tombulu_language",
    "https://en.wikipedia.org/wiki/Bali%E2%80%93Sasak%E2%80%93Sumbawa_languages",
    "https://en.wikipedia.org/wiki/Papuan_languages",
    "https://en.wikipedia.org/wiki/South_Sulawesi_languages",
    "https://en.wikipedia.org/wiki/Toraja-Sa%27dan_language",
    "https://en.wikipedia.org/wiki/Bantenese_language",
    "https://en.wikipedia.org/wiki/Cirebonese_dialect",
    "https://en.wikipedia.org/wiki/Cirebonese_language",
    "https://en.wikipedia.org/wiki/Banyumasan_dialect",
    "https://en.wikipedia.org/wiki/Arekan_dialect",
    "https://en.wikipedia.org/wiki/Arekan_Javanese"
];

const check = async () => {
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            if (res.status === 200) {
                console.log(`[OK] ${url} -> ${res.url}`);
            } else {
                console.log(`[FAIL] ${url} (${res.status})`);
            }
        } catch (e) {
            console.log(`[ERR] ${url}: ${e.message}`);
        }
    }
};

check();
