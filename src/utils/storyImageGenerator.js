// Generator Gambar Status WhatsApp & Instagram Story (Rasio 9:16 - 1080x1920)

export const generateStoryImage = async ({
    badge = "GMAHK PISGAH BISDAC",
    title = "Ibadah Hari Sabat",
    subtitle = "Kebaktian & Sekolah Sabat Bersama",
    date = "",
    time = "",
    location = "GMAHK Jemaat Pisgah BISDAC - Batam",
    speaker = "",
    note = ""
}) => {
    return new Promise((resolve, reject) => {
        try {
            const width = 1080;
            const height = 1920;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Canvas context tidak tersedia"));
                return;
            }

            // Helper untuk menggambar teks terbungkus rapi (Word Wrap) di tengah kanvas
            const drawWrappedText = (text, startY, maxWidth, lineHeight, font, color) => {
                ctx.font = font;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                const words = String(text || '').trim().split(' ');
                let line = '';
                const lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(line.trim());
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                if (line.trim()) lines.push(line.trim());

                lines.forEach((l, idx) => {
                    ctx.fillText(l, width / 2, startY + (idx * lineHeight));
                });

                return startY + (lines.length * lineHeight);
            };

            // 1. Background Gradient (Luxury Navy & Obsidian)
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#07111e');
            bgGrad.addColorStop(0.35, '#0d1d33');
            bgGrad.addColorStop(0.75, '#060d17');
            bgGrad.addColorStop(1, '#04080f');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. Decorative Gold Glows
            const glow1 = ctx.createRadialGradient(width * 0.5, height * 0.25, 50, width * 0.5, height * 0.25, 500);
            glow1.addColorStop(0, 'rgba(209, 155, 69, 0.18)');
            glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow1;
            ctx.fillRect(0, 0, width, height * 0.6);

            // Decorative Corner Borders (Margin Aman 65px dan 80px)
            ctx.strokeStyle = 'rgba(209, 155, 69, 0.4)';
            ctx.lineWidth = 3;
            ctx.strokeRect(65, 65, width - 130, height - 130);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(80, 80, width - 160, height - 160);

            // 3. Header / Church Name
            ctx.textAlign = 'center';
            ctx.fillStyle = '#C5A880';
            ctx.font = 'bold 34px "Inter", "Segoe UI", sans-serif';
            ctx.letterSpacing = '5px';
            ctx.fillText('GEREJA MASEHI ADVENT HARI KETUJUH', width / 2, 165);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 46px "Inter", "Segoe UI", sans-serif';
            ctx.letterSpacing = '3px';
            ctx.fillText('JEMAAT PISGAH BISDAC • BATAM', width / 2, 225);

            // Divider Line
            const lineGrad = ctx.createLinearGradient(width * 0.25, 0, width * 0.75, 0);
            lineGrad.addColorStop(0, 'rgba(209, 155, 69, 0)');
            lineGrad.addColorStop(0.5, '#D19B45');
            lineGrad.addColorStop(1, 'rgba(209, 155, 69, 0)');
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(width * 0.2, 265);
            ctx.lineTo(width * 0.8, 265);
            ctx.stroke();

            // 4. Badge Pill
            let nextY = 360;
            if (badge) {
                ctx.font = 'bold 28px "Inter", sans-serif';
                const badgeText = badge.toUpperCase();
                const metrics = ctx.measureText(badgeText);
                const bWidth = metrics.width + 60;
                const bHeight = 56;
                const bX = (width - bWidth) / 2;

                ctx.fillStyle = 'rgba(209, 155, 69, 0.22)';
                ctx.beginPath();
                ctx.roundRect(bX, nextY - 40, bWidth, bHeight, 28);
                ctx.fill();

                ctx.strokeStyle = '#D19B45';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#E5B558';
                ctx.fillText(badgeText, width / 2, nextY);
                nextY += 90;
            } else {
                nextY += 40;
            }

            // 5. Main Title (Wrapped)
            nextY = drawWrappedText(title, nextY, width - 280, 80, '900 64px "Inter", "Georgia", sans-serif', '#FFFFFF');

            // Subtitle
            if (subtitle) {
                nextY += 20;
                nextY = drawWrappedText(subtitle, nextY, width - 300, 48, '500 32px "Inter", sans-serif', '#D4DFCE');
            }

            // 6. Highlight Center Box: Date, Speaker, Time, Location
            // Hitung isi konten box terlebih dahulu agar posisinya berada tepat di tengah vertikal (vertical center)
            const boxItems = [];

            if (date) {
                boxItems.push({
                    type: 'date',
                    label: '📅 HARI & TANGGAL',
                    value: date,
                    labelFont: 'bold 28px "Inter", sans-serif',
                    labelColor: '#E5B558',
                    valueFont: '900 46px "Inter", sans-serif',
                    valueColor: '#FFFFFF',
                    spacing: 52
                });
            }

            if (speaker) {
                boxItems.push({
                    type: 'speaker',
                    label: '🎙️ PEMBICARA FIRMAN',
                    value: speaker,
                    labelFont: 'bold 26px "Inter", sans-serif',
                    labelColor: '#C5A880',
                    valueFont: '900 40px "Inter", sans-serif',
                    valueColor: '#FFFFFF',
                    spacing: 48
                });
            }

            const timeLoc = [time ? `⏰ ${time}` : '', location ? `📍 ${location}` : ''].filter(Boolean).join(' • ');
            if (timeLoc) {
                boxItems.push({
                    type: 'timeloc',
                    value: timeLoc,
                    valueFont: '600 30px "Inter", sans-serif',
                    valueColor: 'rgba(255, 255, 255, 0.9)',
                    spacing: 0
                });
            }

            // Tentukan posisi dan tinggi box secara proporsional
            const boxW = width - 240;
            const boxX = 120;
            const boxY = Math.max(nextY + 60, 780);

            // Hitung tinggi konten dalam box
            let estimatedContentH = 0;
            boxItems.forEach((item, idx) => {
                if (item.label) {
                    estimatedContentH += item.spacing + 50; // label + value
                } else {
                    estimatedContentH += 40; // single line
                }
                if (idx < boxItems.length - 1) {
                    estimatedContentH += 40; // gap antar item
                }
            });

            // Berikan padding atas-bawah yang seimbang di dalam box
            const boxPadding = 60;
            const boxH = Math.max(300, estimatedContentH + (boxPadding * 2));

            // Gambar Kotak Transparan Mewah
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 32);
            ctx.fill();

            ctx.strokeStyle = 'rgba(209, 155, 69, 0.35)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Render Konten di Dalam Box (Vertically Centered)
            let insideY = boxY + ((boxH - estimatedContentH) / 2) + 32;

            boxItems.forEach((item, idx) => {
                if (item.label) {
                    ctx.font = item.labelFont;
                    ctx.fillStyle = item.labelColor;
                    ctx.textAlign = 'center';
                    ctx.fillText(item.label, width / 2, insideY);

                    insideY += item.spacing;

                    ctx.font = item.valueFont;
                    ctx.fillStyle = item.valueColor;
                    ctx.fillText(item.value, width / 2, insideY);
                } else {
                    ctx.font = item.valueFont;
                    ctx.fillStyle = item.valueColor;
                    ctx.textAlign = 'center';

                    // Cek jika teks waktu/lokasi terlalu panjang untuk kotak
                    const maxInnerWidth = boxW - 60;
                    const textWidth = ctx.measureText(item.value).width;
                    if (textWidth > maxInnerWidth) {
                        ctx.font = '600 26px "Inter", sans-serif';
                    }
                    ctx.fillText(item.value, width / 2, insideY);
                }

                if (idx < boxItems.length - 1) {
                    insideY += 50;
                }
            });

            // 7. Note / Blessing Verse (Wrapped rapi di dalam batas aman 800px, tidak akan over/menabrak border)
            if (note) {
                const noteY = boxY + boxH + 85;
                drawWrappedText(`"${note}"`, noteY, width - 280, 48, 'italic 32px "Georgia", serif', 'rgba(209, 155, 69, 0.95)');
            }

            // 8. Footer Call to Action (pisgahbisdac.app)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.font = '600 28px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Informasi Warta & Ibadah Digital:', width / 2, height - 170);

            ctx.fillStyle = '#E5B558';
            ctx.font = 'bold 34px "Inter", sans-serif';
            ctx.fillText('pisgahbisdac.app • Batam', width / 2, height - 120);

            const dataUrl = canvas.toDataURL('image/png', 0.95);
            resolve(dataUrl);
        } catch (err) {
            reject(err);
        }
    });
};
