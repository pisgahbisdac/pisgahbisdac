import React, { useRef, useMemo, useState, useEffect } from 'react';

import { KEGIATAN_KETERLIBATAN } from '../../constants/hadirConstants';

    function KeterlibatanRadarChart({ keterlibatan, subKelas, absen, isDarkMode, parseLocalDate }) {
    const radarRef = useRef(null);
    const chartRef = useRef(null);

    // Ambil tanggal Sabat terakhir yang punya data keterlibatan
    const lastSabbatWithData = useMemo(() => {
        const dates = [...new Set(keterlibatan.map(k => k.tanggal))].sort();
        return dates[dates.length - 1] || null;
    }, [keterlibatan]);

    // Ambil tanggal Sabat terakhir dari absen (fallback label)
    const lastSabbatFromAbsen = useMemo(() => {
        const dates = [...new Set(absen.filter(a => a.sesi === "Sekolah Sabat").map(a => a.tanggal))].sort();
        return dates[dates.length - 1] || null;
    }, [absen]);

    const targetDate = lastSabbatWithData || lastSabbatFromAbsen;

    // Agregat nilai per indikator (sum semua sub-kelas di tanggal terakhir)
    const aggregatedValues = useMemo(() => {
        if (!targetDate) return Array(10).fill(0);
        const recsForDate = keterlibatan.filter(k => k.tanggal === targetDate);
        return KEGIATAN_KETERLIBATAN.map(keg => {
            return recsForDate.reduce((sum, rec) => sum + (rec.values?.[keg.id] || 0), 0);
        });
    }, [keterlibatan, targetDate]);

    const maxVal = Math.max(...aggregatedValues, 1);

    // Label pendek untuk radar
    const shortLabels = [
        "Tepat Waktu", "Baca Alkitab", "Renungan", "Belajar SS",
        "Hadir Rabu", "Jangkauan", "Perawatan", "Doa", "Kel. Kecil", "Risalah"
    ];

    useEffect(() => {
        if (!window.Chart || !radarRef.current) return;
        if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

        const textColor  = isDarkMode ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.6)";
        const gridColor  = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
        const pointColor = isDarkMode ? "#2dd4bf" : "#0d9488";
        const fillColor  = isDarkMode ? "rgba(45,212,191,0.25)" : "rgba(13,148,136,0.18)";
        const lineColor  = isDarkMode ? "#2dd4bf" : "#0d9488";

        chartRef.current = new Chart(radarRef.current, {
            type: "radar",
            data: {
                labels: shortLabels,
                datasets: [{
                    label: "Jumlah Anggota",
                    data: aggregatedValues,
                    backgroundColor: fillColor,
                    borderColor: lineColor,
                    borderWidth: 2.5,
                    pointBackgroundColor: pointColor,
                    pointBorderColor: isDarkMode ? "#fff" : "#fff",
                    pointBorderWidth: 1.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.raw} anggota`,
                            title: (items) => KEGIATAN_KETERLIBATAN[items[0].dataIndex]?.text || items[0].label,
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: maxVal,
                        ticks: {
                            stepSize: Math.max(1, Math.ceil(maxVal / 4)),
                            color: textColor,
                            backdropColor: "transparent",
                            font: { size: 9 }
                        },
                        pointLabels: {
                            color: textColor,
                            font: { size: 10, weight: "bold" }
                        },
                        grid:        { color: gridColor },
                        angleLines:  { color: gridColor },
                    }
                }
            }
        });

        return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    }, [aggregatedValues, isDarkMode, maxVal]);

    const dateLabel = targetDate
        ? (() => { const d = parseLocalDate(targetDate); return d ? `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}` : targetDate; })()
        : "–";

    return (
        <div className="flex flex-col flex-1">
            {targetDate ? (
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mb-3 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2.5 py-1 rounded-lg inline-block self-start">
                    <i className="fa-solid fa-calendar-check mr-1"></i> Data: {dateLabel}
                </p>
            ) : (
                <p className="text-xs text-slate-500 italic mb-3">Belum ada data keterlibatan.</p>
            )}
            <div style={{ position: "relative", height: "200px" }}>
                <canvas ref={radarRef}></canvas>
            </div>
            {/* Mini legend nilai */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {shortLabels.map((label, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 truncate">{label}</span>
                        <span className="font-black text-teal-600 dark:text-teal-400 ml-1 shrink-0">{aggregatedValues[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

        function DashboardCharts({ jemaat, absen, tamuTambahan, subKelas, metrics, parseLocalDate, currentUserRole, isDarkMode, keterlibatan }) {
            const trendRef    = useRef(null);
            const donutRef    = useRef(null);
            const ageRef      = useRef(null);
            const genderRef   = useRef(null);
            const subkelasRef = useRef(null);
            const chartsRef   = useRef({});
            const [trendMode, setTrendMode] = useState("jumlah");

            const PALETTE = ["#378ADD","#1D9E75","#BA7517","#D4537E","#7F77DD","#639922","#D85A30"];
            const destroyChart = (key) => { if (chartsRef.current[key]) { chartsRef.current[key].destroy(); delete chartsRef.current[key]; } };

            const SUBKELAS_NAMES = subKelas.map(s => s.nama);

            const sabbatList = useMemo(() => {
                const dates = [...new Set(absen.filter(a => a.sesi === "Sekolah Sabat").map(a => a.tanggal))].sort();
                return dates.slice(-6);
            }, [absen]);

            const hadirPerSubPerSabbat = useMemo(() =>
                SUBKELAS_NAMES.map(sub =>
                    sabbatList.map(tgl =>
                        absen.filter(a => a.tanggal === tgl && a.sesi === "Sekolah Sabat" && a.status === "Hadir" &&
                            jemaat.find(j => j.nama === a.jemaatNama)?.subKelasNama === sub).length
                    )
                ), [sabbatList, absen, jemaat, subKelas]);

            const totalHadirPerSabbat = useMemo(() => {
                return sabbatList.map((tgl, i) => {
                    const fromAbsen = hadirPerSubPerSabbat.reduce((sum, arr) => sum + (arr[i] || 0), 0);
                    const fromTamu = tamuTambahan.filter(t => t.tanggal === tgl && t.sesi === "Sekolah Sabat").reduce((sum, g) => sum + (g.jumlah || 0), 0);
                    return fromAbsen + fromTamu;
                });
            }, [sabbatList, hadirPerSubPerSabbat, tamuTambahan]);

            const khotbahPerSabbat = useMemo(() => {
                return sabbatList.map(tgl => {
                    const fromAbsen = absen.filter(a => a.tanggal === tgl && a.sesi === "Khotbah" && a.status === "Hadir").length;
                    const fromTamu = tamuTambahan.filter(t => t.tanggal === tgl && t.sesi === "Khotbah").reduce((sum, g) => sum + (g.jumlah || 0), 0);
                    return fromAbsen + fromTamu;
                });
            }, [sabbatList, absen, tamuTambahan]);

            const ageGroups = useMemo(() => {
                const groups = { "<12": 0, "12–17": 0, "18–25": 0, "26–35": 0, "36–50": 0, "51–65": 0, "66+": 0 };
                const now = new Date().getFullYear();
                jemaat.forEach(j => {
                    if (!j.tglLahir) return;
                    const age = now - parseInt(j.tglLahir.split("-")[0]);
                    if (age < 12) groups["<12"]++;
                    else if (age <= 17) groups["12–17"]++;
                    else if (age <= 25) groups["18–25"]++;
                    else if (age <= 35) groups["26–35"]++;
                    else if (age <= 50) groups["36–50"]++;
                    else if (age <= 65) groups["51–65"]++;
                    else groups["66+"]++;
                });
                return groups;
            }, [jemaat]);

            const genderBaptis = useMemo(() => ({
                lk_baptis: jemaat.filter(j => j.gender === "Laki-laki"  && j.statusBaptis === "Sudah Baptis").length,
                lk_belum:  jemaat.filter(j => j.gender === "Laki-laki"  && j.statusBaptis !== "Sudah Baptis").length,
                pr_baptis: jemaat.filter(j => j.gender === "Perempuan"  && j.statusBaptis === "Sudah Baptis").length,
                pr_belum:  jemaat.filter(j => j.gender === "Perempuan"  && j.statusBaptis !== "Sudah Baptis").length,
            }), [jemaat]);

            const memberAttendance = useMemo(() => {
                const last4 = sabbatList.slice(-4);
                return jemaat.map(j => ({
                    nama: j.nama,
                    hadir: last4.filter(tgl => absen.find(a => a.tanggal === tgl && a.jemaatNama === j.nama && a.sesi === "Sekolah Sabat" && a.status === "Hadir")).length,
                    total: last4.length,
                })).sort((a, b) => b.hadir - a.hadir);
            }, [jemaat, absen, sabbatList]);

            const trendLastDiff = totalHadirPerSabbat.length >= 2
                ? totalHadirPerSabbat[totalHadirPerSabbat.length-1] - totalHadirPerSabbat[totalHadirPerSabbat.length-2]
                : 0;

            useEffect(() => {
                if (!window.Chart || !trendRef.current || sabbatList.length === 0) return;
                destroyChart("trend");
                const ctx = trendRef.current.getContext('2d');
                
                // Dynamic styling based on theme
                const textColor = isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.6)";
                const gridColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
                
                // Gradients for line fill
                const gradientSS = ctx.createLinearGradient(0, 0, 0, 300);
                gradientSS.addColorStop(0, isDarkMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(55,138,221,0.3)');
                gradientSS.addColorStop(1, 'rgba(56, 189, 248, 0)');

                const gradientKh = ctx.createLinearGradient(0, 0, 0, 300);
                gradientKh.addColorStop(0, isDarkMode ? 'rgba(52, 211, 153, 0.4)' : 'rgba(29,158,117,0.3)');
                gradientKh.addColorStop(1, 'rgba(52, 211, 153, 0)');

                const labels = sabbatList.map(d => { const p = parseLocalDate(d); return p ? `${p.getDate()}/${p.getMonth()+1}` : d; });
                const pctSS = totalHadirPerSabbat.map(v => jemaat.length > 0 ? Math.round(v/jemaat.length*100) : 0);
                const pctKh = khotbahPerSabbat.map(v => jemaat.length > 0 ? Math.round(v/jemaat.length*100) : 0);
                
                let datasets = [];
                if (trendMode === "jumlah" || trendMode === "persen") {
                    const dataSS = trendMode === "jumlah" ? totalHadirPerSabbat : pctSS;
                    const dataKh = trendMode === "jumlah" ? khotbahPerSabbat : pctKh;
                    
                    datasets = [
                        { 
                            label: trendMode === "jumlah" ? "Sekolah Sabat" : "SS (%)", 
                            data: dataSS, 
                            borderColor: isDarkMode ? "#38bdf8" : "#2563eb", // Bright blue/cyan
                            backgroundColor: gradientSS, 
                            borderWidth: 3, 
                            pointBackgroundColor: isDarkMode ? "#fff" : "#2563eb",
                            pointBorderColor: isDarkMode ? "#38bdf8" : "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 5, 
                            pointHoverRadius: 8,
                            tension: 0.4, // Smooth curve
                            fill: true 
                        },
                        { 
                            label: trendMode === "jumlah" ? "Khotbah" : "Khotbah (%)", 
                            data: dataKh, 
                            borderColor: isDarkMode ? "#34d399" : "#059669", // Bright emerald
                            backgroundColor: gradientKh, 
                            borderWidth: 3, 
                            pointBackgroundColor: isDarkMode ? "#fff" : "#059669",
                            pointBorderColor: isDarkMode ? "#34d399" : "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 5, 
                            pointHoverRadius: 8,
                            tension: 0.4, // Smooth curve
                            fill: true, 
                            borderDash: [5,5] 
                        },
                    ];
                } else {
                    datasets = [
                        { label: "Hadir SS", data: totalHadirPerSabbat, type: "bar", backgroundColor: "rgba(56, 189, 248, 0.6)", borderRadius: 4, yAxisID: "y" },
                        { label: "% Khotbah", data: pctKh, type: "line", borderColor: isDarkMode ? "#34d399" : "#059669", borderWidth: 3, pointBackgroundColor: "#fff", pointRadius: 5, tension: 0.4, yAxisID: "y2" },
                    ];
                }

                const scalesObj = {
                    x: { 
                        grid: { color: gridColor, drawBorder: false, borderDash: [5, 5] }, // Vertical drop lines
                        ticks: { color: textColor, font: { size: 11, family: 'Inter' } } 
                    },
                    y: { 
                        grid: { display: false }, // Hide horizontal lines for sleek look
                        ticks: { color: textColor, font: { size: 11, family: 'Inter' } }, 
                        beginAtZero: true 
                    }
                };
                
                if (trendMode === "combined") {
                    scalesObj.y2 = { position: "right", grid: { display: false }, ticks: { color: textColor, font: { size: 10 }, callback: v => v+"%" }, beginAtZero: true, max: 100 };
                }

                chartsRef.current.trend = new Chart(trendRef.current, {
                    type: trendMode === "combined" ? "bar" : "line",
                    data: { labels, datasets },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, 
                        scales: scalesObj,
                        interaction: { mode: 'nearest', axis: 'x', intersect: false }
                    }
                });
            }, [trendMode, sabbatList, totalHadirPerSabbat, khotbahPerSabbat, jemaat.length, isDarkMode]);

            useEffect(() => {
                if (!window.Chart || !donutRef.current) return;
                destroyChart("donut");
                const statusMap = {};
                jemaat.forEach(j => {
                    (j.statusJemaat || "Jemaat").split(",").map(s => s.trim()).forEach(s => { statusMap[s] = (statusMap[s] || 0) + 1; });
                });
                
                const textColor = isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";
                
                chartsRef.current.donut = new Chart(donutRef.current, {
                    type: "doughnut",
                    data: { labels: Object.keys(statusMap), datasets: [{ data: Object.values(statusMap), backgroundColor: PALETTE, borderWidth: isDarkMode ? 2 : 1, borderColor: isDarkMode ? '#0f172a' : '#fff', hoverOffset: 4 }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: "75%", plugins: { legend: { display: false } } }
                });
            }, [jemaat, isDarkMode]);

            useEffect(() => {
                if (!window.Chart || !ageRef.current) return;
                destroyChart("age");
                const textColor = isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
                
                chartsRef.current.age = new Chart(ageRef.current, {
                    type: "bar",
                    data: { labels: Object.keys(ageGroups), datasets: [{ data: Object.values(ageGroups), backgroundColor: PALETTE, borderWidth: 0, borderRadius: 6 }] },
                    options: { 
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, 
                        scales: { 
                            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }, 
                            y: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } }, beginAtZero: true } 
                        } 
                    }
                });
            }, [ageGroups, isDarkMode]);

            useEffect(() => {
                if (!window.Chart || !genderRef.current) return;
                destroyChart("gender");
                const { lk_baptis, lk_belum, pr_baptis, pr_belum } = genderBaptis;
                const textColor = isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
                
                chartsRef.current.gender = new Chart(genderRef.current, {
                    type: "bar",
                    data: { labels: ["Laki-laki","Perempuan"], datasets: [
                        { label: "Sudah baptis", data: [lk_baptis, pr_baptis], backgroundColor: isDarkMode ? "#34d399" : "#1D9E75", borderWidth: 0, borderRadius: 4 },
                        { label: "Belum baptis", data: [lk_belum, pr_belum],   backgroundColor: isDarkMode ? "#fb7185" : "#E24B4A", borderWidth: 0, borderRadius: 4 },
                    ]},
                    options: { 
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, 
                        scales: { 
                            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }, 
                            y: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } }, beginAtZero: true } 
                        } 
                    }
                });
            }, [genderBaptis, isDarkMode]);

            useEffect(() => {
                if (!window.Chart || !subkelasRef.current || SUBKELAS_NAMES.length === 0) return;
                destroyChart("subkelas");
                const last4 = sabbatList.slice(-4);
                const labels = last4.map(d => { const p = parseLocalDate(d); return p ? `${p.getDate()}/${p.getMonth()+1}` : d; });
                const textColor = isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
                
                chartsRef.current.subkelas = new Chart(subkelasRef.current, {
                    type: "bar",
                    data: { labels, datasets: SUBKELAS_NAMES.map((sub, i) => ({
                        label: sub, data: hadirPerSubPerSabbat[i]?.slice(-4) || [],
                        backgroundColor: PALETTE[i % PALETTE.length], borderWidth: 0, borderRadius: 4,
                    }))},
                    options: { 
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, 
                        scales: { 
                            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }, 
                            y: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } }, beginAtZero: true } 
                        } 
                    }
                });
            }, [sabbatList, hadirPerSubPerSabbat, subKelas, isDarkMode]);

            useEffect(() => { return () => { Object.values(chartsRef.current).forEach(c => c.destroy()); }; }, []);

            return (
                <div className="space-y-6 md:space-y-8">
                    {/* Kotak Metrik Kecil - Glow Box Style */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Hadir SS Terakhir", val: totalHadirPerSabbat[totalHadirPerSabbat.length-1] || 0, sub: `${jemaat.length > 0 ? Math.round((totalHadirPerSabbat[totalHadirPerSabbat.length-1]||0)/jemaat.length*100) : 0}% dari total`, diff: trendLastDiff, grad: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
                            { label: "Hadir Khotbah",     val: khotbahPerSabbat[khotbahPerSabbat.length-1] || 0,     sub: "Sabat terakhir", grad: "linear-gradient(135deg, #10b981, #059669)" },
                            { label: "Rata-rata Hadir SS", val: totalHadirPerSabbat.length > 0 ? Math.round(totalHadirPerSabbat.reduce((a,b)=>a+b,0)/totalHadirPerSabbat.length) : 0, sub: `${sabbatList.length} Sabat terakhir`, grad: "linear-gradient(135deg, #f59e0b, #d97706)" },
                            { label: "Tamu Sabat Ini",    val: metrics.tamuCount.hadirSabatIni, sub: "semua sub-kelas", grad: "linear-gradient(135deg, #ec4899, #e11d48)" },
                        ].map((m, i) => (
                            <div key={i} className="glow-box" style={{'--box-glow': m.grad}}>
                                <div className="glow-box-inner p-5 flex flex-col justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-[9px] font-black uppercase tracking-wider mb-2 leading-tight">{m.label}</p>
                                    <div>
                                        <p className="text-3xl md:text-2xl font-black text-slate-900 dark:text-white">{m.val}</p>
                                        <p className="text-xs md:text-[10px] text-slate-500 mt-1">{m.sub}</p>
                                        {m.diff !== undefined && (
                                            <span className={`text-[11px] md:text-[10px] font-bold ${m.diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {m.diff >= 0 ? "↑" : "↓"} {Math.abs(m.diff)} vs sblm
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Tren Kehadiran - Glow Box */}
                    <div className="glow-box" style={{'--box-glow': 'linear-gradient(45deg, #38bdf8, #818cf8, #34d399)'}}>
                        <div className="glow-box-inner p-5 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base md:text-sm uppercase tracking-wider flex items-center gap-2"><i className="fa-solid fa-chart-line text-cyan-500 dark:text-cyan-400"></i> Tren Kehadiran</h4>
                                    <p className="text-xs text-slate-500 mt-1">{sabbatList.length} Sabat terakhir · SS & Khotbah</p>
                                </div>
                                <div className="flex gap-1 text-[11px] md:text-[10px] font-black w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                                    {[["jumlah","Jumlah"],["persen","Persen"],["combined","Mix"]].map(([key, label]) => (
                                        <button key={key} onClick={() => setTrendMode(key)}
                                            className={`flex-1 sm:flex-none px-4 py-2 md:py-1.5 rounded-lg transition-all text-center ${trendMode === key ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ position:"relative", height:"260px" }}><canvas ref={trendRef}></canvas></div>
                            <div className="flex flex-wrap gap-5 mt-6 justify-center sm:justify-start">
                                {[["#38bdf8","Sekolah Sabat"],["#34d399","Khotbah"]].map(([c, l]) => (
                                    <span key={l} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                        <span style={{ width:12, height:12, borderRadius:4, background:c, display:"inline-block", boxShadow: `0 0 8px ${c}` }}></span>{l}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Kehadiran per Sub-Kelas - Glow Box */}
                        <div className="glow-box" style={{'--box-glow': 'linear-gradient(135deg, #a78bfa, #f472b6)'}}>
                            <div className="glow-box-inner p-5 md:p-6">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-wider"><i className="fa-solid fa-layer-group text-purple-500 dark:text-purple-400 mr-2"></i> Kehadiran per Sub-Kelas</h4>
                                <p className="text-xs text-slate-500 mb-6">4 Sabat terakhir</p>
                                <div style={{ position:"relative", height:"220px" }}><canvas ref={subkelasRef}></canvas></div>
                                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                                    {SUBKELAS_NAMES.map((s, i) => (
                                        <span key={s} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-white/5">
                                            <span style={{ width:8, height:8, borderRadius:2, background:PALETTE[i%PALETTE.length], display:"inline-block" }}></span>{s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status Keanggotaan - Glow Box */}
                        <div className="glow-box" style={{'--box-glow': 'linear-gradient(135deg, #fbbf24, #ea580c)'}}>
                            <div className="glow-box-inner p-5 md:p-6 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-6"><i className="fa-solid fa-circle-info text-amber-500 dark:text-amber-400 mr-2"></i> Status Keanggotaan</h4>
                                    <div className="flex items-center gap-6">
                                        <div style={{ position:"relative", width:120, height:120, flexShrink:0 }}>
                                            <canvas ref={donutRef}></canvas>
                                            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{jemaat.length}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Jiwa</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 flex-1 text-xs">
                                            {["Jemaat","Guru SS","Anggota SS","Koordinator SS"].map((s, i) => {
                                                const count = jemaat.filter(j => (j.statusJemaat||"").includes(s)).length;
                                                return (
                                                    <div key={s} className="flex items-center justify-between">
                                                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold">
                                                            <span style={{ width:10, height:10, borderRadius:3, background:PALETTE[i % PALETTE.length], display:"inline-block" }}></span>{s}
                                                        </span>
                                                        <span className="font-black text-slate-900 dark:text-white">{count}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 dark:border-white/10 pt-5 mt-5 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-slate-500 uppercase tracking-wider text-[10px]">Sudah Baptis</span><span className="text-emerald-600 dark:text-emerald-400">{metrics.baptisPersen}%</span></div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full" style={{ width:`${metrics.baptisPersen}%` }}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-slate-500 uppercase tracking-wider text-[10px]">Jemaat Aktif</span><span className="text-blue-600 dark:text-blue-400">{metrics.total > 0 ? Math.round(metrics.jemaatAktif/metrics.total*100) : 0}%</span></div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full" style={{ width:`${metrics.total > 0 ? (metrics.jemaatAktif/metrics.total)*100 : 0}%` }}></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Distribusi Usia */}
                        <div className="glow-box" style={{'--box-glow': 'linear-gradient(135deg, #34d399, #0ea5e9)'}}>
                            <div className="glow-box-inner p-5">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-wider"><i className="fa-solid fa-people-group text-sky-500 dark:text-sky-400 mr-2"></i> Distribusi Usia</h4>
                                <p className="text-xs text-slate-500 mb-4">Kelompok umur jemaat</p>
                                <div style={{ position:"relative", height:"200px" }}><canvas ref={ageRef}></canvas></div>
                            </div>
                        </div>

                        {/* Gender & Baptis */}
                        <div className="glow-box" style={{'--box-glow': 'linear-gradient(135deg, #f43f5e, #fbbf24)'}}>
                            <div className="glow-box-inner p-5">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-wider"><i className="fa-solid fa-venus-mars text-rose-500 dark:text-rose-400 mr-2"></i> Gender & Baptis</h4>
                                <p className="text-xs text-slate-500 mb-4">Laki-laki vs Perempuan</p>
                                <div style={{ position:"relative", height:"200px" }}><canvas ref={genderRef}></canvas></div>
                                <div className="flex justify-center gap-5 mt-4">
                                    {[[(isDarkMode ? "#34d399" : "#1D9E75"),"Sudah baptis"],[(isDarkMode ? "#fb7185" : "#E24B4A"),"Belum baptis"]].map(([c, l]) => (
                                        <span key={l} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                            <span style={{ width:10, height:10, borderRadius:3, background:c, display:"inline-block" }}></span>{l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan 10 Indikator Keterlibatan */}
<div className="glow-box" style={{'--box-glow': 'linear-gradient(135deg, #14b8a6, #6366f1)'}}>
    <div className="glow-box-inner p-5 flex flex-col h-full">
        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-wider">
            <i className="fa-solid fa-star text-teal-500 dark:text-teal-400 mr-2"></i> 10 Indikator Keterlibatan
        </h4>
        <p className="text-xs text-slate-500 mb-4">Sabat terakhir · semua sub-kelas</p>
        <KeterlibatanRadarChart
            keterlibatan={keterlibatan}
            subKelas={subKelas}
            absen={absen}
            isDarkMode={isDarkMode}
            parseLocalDate={parseLocalDate}
        />
    </div>
</div>
                    </div>
                </div>
            );
        }

export default DashboardCharts;
