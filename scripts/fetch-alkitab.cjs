const fs = require('fs');
const https = require('https');
const path = require('path');

const books = [
    { id: 1, pasal: 50 }, { id: 2, pasal: 40 }, { id: 3, pasal: 27 }, { id: 4, pasal: 36 },
    { id: 5, pasal: 34 }, { id: 6, pasal: 24 }, { id: 7, pasal: 21 }, { id: 8, pasal: 4 },
    { id: 9, pasal: 31 }, { id: 10, pasal: 24 }, { id: 11, pasal: 22 }, { id: 12, pasal: 25 },
    { id: 13, pasal: 29 }, { id: 14, pasal: 36 }, { id: 15, pasal: 10 }, { id: 16, pasal: 13 },
    { id: 17, pasal: 10 }, { id: 18, pasal: 42 }, { id: 19, pasal: 150 }, { id: 20, pasal: 31 },
    { id: 21, pasal: 12 }, { id: 22, pasal: 8 }, { id: 23, pasal: 66 }, { id: 24, pasal: 52 },
    { id: 25, pasal: 5 }, { id: 26, pasal: 48 }, { id: 27, pasal: 12 }, { id: 28, pasal: 14 },
    { id: 29, pasal: 3 }, { id: 30, pasal: 9 }, { id: 31, pasal: 1 }, { id: 32, pasal: 4 },
    { id: 33, pasal: 7 }, { id: 34, pasal: 3 }, { id: 35, pasal: 3 }, { id: 36, pasal: 3 },
    { id: 37, pasal: 2 }, { id: 38, pasal: 14 }, { id: 39, pasal: 4 }, { id: 40, pasal: 28 },
    { id: 41, pasal: 16 }, { id: 42, pasal: 24 }, { id: 43, pasal: 21 }, { id: 44, pasal: 28 },
    { id: 45, pasal: 16 }, { id: 46, pasal: 16 }, { id: 47, pasal: 13 }, { id: 48, pasal: 6 },
    { id: 49, pasal: 6 }, { id: 50, pasal: 4 }, { id: 51, pasal: 4 }, { id: 52, pasal: 5 },
    { id: 53, pasal: 3 }, { id: 54, pasal: 6 }, { id: 55, pasal: 4 }, { id: 56, pasal: 3 },
    { id: 57, pasal: 1 }, { id: 58, pasal: 13 }, { id: 59, pasal: 5 }, { id: 60, pasal: 5 },
    { id: 61, pasal: 3 }, { id: 62, pasal: 5 }, { id: 63, pasal: 1 }, { id: 64, pasal: 1 },
    { id: 65, pasal: 1 }, { id: 66, pasal: 22 }
];

const fetchJson = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    const dir = path.join(__dirname, '../public/alkitab');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log('Fetching all chapters from Beeble...');
    
    for (let book of books) {
        let bookData = {};
        for (let ch = 1; ch <= book.pasal; ch++) {
            let success = false;
            let retries = 3;
            while (!success && retries > 0) {
                try {
                    let data = await fetchJson(`https://beeble.vercel.app/api/v1/passage/${book.id}/${ch}`);
                    if(data && data.data && data.data.verses) {
                        bookData[ch] = data.data.verses.map(v => ({ ayat: v.verse, teks: v.content, type: v.type }));
                    } else {
                        throw new Error('Invalid data');
                    }
                    success = true;
                } catch(e) {
                    retries--;
                    await delay(1000);
                }
            }
            if(!success) console.error(`\nFailed to fetch book ${book.id} chapter ${ch}`);
            process.stdout.write('.');
            await delay(150); // limit rate
        }
        fs.writeFileSync(path.join(dir, `${book.id}.json`), JSON.stringify(bookData));
        console.log(`\nSaved book ${book.id}`);
    }
    console.log('\nAll done!');
}
main();
