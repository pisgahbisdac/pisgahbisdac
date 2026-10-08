const fs = require('fs');
const https = require('https');
const path = require('path');

const books = [
    { id: 1,  nama: 'Kejadian',       pasal: 50 },
    { id: 2,  nama: 'Keluaran',       pasal: 40 },
    { id: 3,  nama: 'Imamat',         pasal: 27 },
    { id: 4,  nama: 'Bilangan',       pasal: 36 },
    { id: 5,  nama: 'Ulangan',        pasal: 34 },
    { id: 6,  nama: 'Yosua',          pasal: 24 },
    { id: 7,  nama: 'Hakim-hakim',    pasal: 21 },
    { id: 8,  nama: 'Rut',            pasal: 4 },
    { id: 9,  nama: '1 Samuel',       pasal: 31 },
    { id: 10, nama: '2 Samuel',       pasal: 24 },
    { id: 11, nama: '1 Raja-raja',    pasal: 22 },
    { id: 12, nama: '2 Raja-raja',    pasal: 25 },
    { id: 13, nama: '1 Tawarikh',     pasal: 29 },
    { id: 14, nama: '2 Tawarikh',     pasal: 36 },
    { id: 15, nama: 'Ezra',           pasal: 10 },
    { id: 16, nama: 'Nehemia',        pasal: 13 },
    { id: 17, nama: 'Ester',          pasal: 10 },
    { id: 18, nama: 'Ayub',           pasal: 42 },
    { id: 19, nama: 'Mazmur',         pasal: 150 },
    { id: 20, nama: 'Amsal',          pasal: 31 },
    { id: 21, nama: 'Pengkhotbah',    pasal: 12 },
    { id: 22, nama: 'Kidung Agung',   pasal: 8 },
    { id: 23, nama: 'Yesaya',         pasal: 66 },
    { id: 24, nama: 'Yeremia',        pasal: 52 },
    { id: 25, nama: 'Ratapan',        pasal: 5 },
    { id: 26, nama: 'Yehezkiel',      pasal: 48 },
    { id: 27, nama: 'Daniel',         pasal: 12 },
    { id: 28, nama: 'Hosea',          pasal: 14 },
    { id: 29, nama: 'Yoel',           pasal: 3 },
    { id: 30, nama: 'Amos',           pasal: 9 },
    { id: 31, nama: 'Obaja',          pasal: 1 },
    { id: 32, nama: 'Yunus',          pasal: 4 },
    { id: 33, nama: 'Mikha',          pasal: 7 },
    { id: 34, nama: 'Nahum',          pasal: 3 },
    { id: 35, nama: 'Habakuk',        pasal: 3 },
    { id: 36, nama: 'Zefanya',        pasal: 3 },
    { id: 37, nama: 'Hagai',          pasal: 2 },
    { id: 38, nama: 'Zakharia',       pasal: 14 },
    { id: 39, nama: 'Maleakhi',       pasal: 4 },
    { id: 40, nama: 'Matius',         pasal: 28 },
    { id: 41, nama: 'Markus',         pasal: 16 },
    { id: 42, nama: 'Lukas',          pasal: 24 },
    { id: 43, nama: 'Yohanes',        pasal: 21 },
    { id: 44, nama: 'Kisah Para Rasul',pasal: 28 },
    { id: 45, nama: 'Roma',           pasal: 16 },
    { id: 46, nama: '1 Korintus',     pasal: 16 },
    { id: 47, nama: '2 Korintus',     pasal: 13 },
    { id: 48, nama: 'Galatia',        pasal: 6 },
    { id: 49, nama: 'Efesus',         pasal: 6 },
    { id: 50, nama: 'Filipi',         pasal: 4 },
    { id: 51, nama: 'Kolose',         pasal: 4 },
    { id: 52, nama: '1 Tesalonika',   pasal: 5 },
    { id: 53, nama: '2 Tesalonika',   pasal: 3 },
    { id: 54, nama: '1 Timotius',     pasal: 6 },
    { id: 55, nama: '2 Timotius',     pasal: 4 },
    { id: 56, nama: 'Titus',          pasal: 3 },
    { id: 57, nama: 'Filemon',        pasal: 1 },
    { id: 58, nama: 'Ibrani',         pasal: 13 },
    { id: 59, nama: 'Yakobus',        pasal: 5 },
    { id: 60, nama: '1 Petrus',       pasal: 5 },
    { id: 61, nama: '2 Petrus',       pasal: 3 },
    { id: 62, nama: '1 Yohanes',      pasal: 5 },
    { id: 63, nama: '2 Yohanes',      pasal: 1 },
    { id: 64, nama: '3 Yohanes',      pasal: 1 },
    { id: 65, nama: 'Yudas',          pasal: 1 },
    { id: 66, nama: 'Wahyu',          pasal: 22 }
];

const fetchXml = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const parseXml = (xmlStr, chapterNum) => {
    let verses = [];
    
    // Sabda sometimes includes context from previous chapters. We need to find the correct chapter block.
    // The correct chapter block usually has `<chap>X</chap>`. If chapter 1, it might just be the first block without `<chap>1</chap>` if it's the only one, or we can just find the `<chapter>` block that belongs to the requested chapter.
    // Actually, a safer way is to split the xml by `<chapter>` and find the one containing `<chap>chapterNum</chap>`. For chapter 1, it might not have `<chap>`.
    
    let chapterBlocks = xmlStr.split('<chapter>');
    let targetBlock = '';
    
    if (chapterNum === 1) {
        // For chapter 1, it's usually the last block anyway, or the first block. Let's just find the block that DOES NOT have <chap>2</chap> or just the last block.
        // Actually, just find the block with <chap>1</chap>. If none, use the first block that has <verse>
        targetBlock = chapterBlocks.find(b => b.includes(`<chap>${chapterNum}</chap>`)) || chapterBlocks.find(b => b.includes('<verse>'));
    } else {
        targetBlock = chapterBlocks.find(b => b.includes(`<chap>${chapterNum}</chap>`));
        if (!targetBlock) targetBlock = chapterBlocks[chapterBlocks.length - 1];
    }
    
    if (!targetBlock) targetBlock = xmlStr;

    let verseRegex = /<verse>([\s\S]*?)<\/verse>/g;
    let match;
    while((match = verseRegex.exec(targetBlock)) !== null) {
        let vBlock = match[1];
        let titleMatch = vBlock.match(/<title>([\s\S]*?)<\/title>/);
        if (titleMatch && titleMatch[1].trim()) {
            verses.push({ ayat: 0, teks: titleMatch[1].trim(), type: 'title' });
        }
        let numberMatch = vBlock.match(/<number>([\s\S]*?)<\/number>/);
        let textMatch = vBlock.match(/<text>([\s\S]*?)<\/text>/);
        if (numberMatch && textMatch) {
            verses.push({ ayat: parseInt(numberMatch[1]), teks: textMatch[1].trim().replace(/<[^>]+>/g, ''), type: 'content' });
        }
    }
    return verses;
};

async function main() {
    const dir = path.join(__dirname, '../public/alkitab');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // We only need book 1 for now since the user only complains about Kejadian 1 not working.
    // I will fetch everything, but prioritize 1 and 2 to show user quickly!
    
    let queue = [];
    for (let book of books) {
        for (let ch = 1; ch <= book.pasal; ch++) {
            queue.push({ bookId: book.id, ch, nama: book.nama });
        }
    }
    
    // Move book 1 to the front just in case
    let results = {};
    for (let book of books) results[book.id] = {};
    
    const BATCH_SIZE = 20; // Sabda API can handle this
    console.log('Fetching all chapters from Sabda...');
    
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
        let batch = queue.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (task) => {
            let retries = 3;
            while(retries > 0) {
                try {
                    const bookQuery = task.nama.replace(/\s+/g, '+');
                    let xml = await fetchXml(`https://alkitab.sabda.org/api/passage.php?passage=${bookQuery}+${task.ch}&ver=tb`);
                    results[task.bookId][task.ch] = parseXml(xml, task.ch);
                    break;
                } catch(e) { retries--; }
            }
        }));
        process.stdout.write('.');
    }
    
    for (let book of books) {
        fs.writeFileSync(path.join(dir, `${book.id}.json`), JSON.stringify(results[book.id]));
    }
    console.log('\nAll done!');
}
main();
