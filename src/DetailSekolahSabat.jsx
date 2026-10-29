import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, ArrowLeft, Calendar, ChevronRight, ChevronLeft, ExternalLink, Sparkles, X, Copy, Check } from "lucide-react";

// ============================================================
// MODUL PELAJARAN SEKOLAH SABAT HARIAN (ADVENTIST SABBATH SCHOOL)
// Triwulan IV 2026: "Karunia Nubuat"
// Fitur:
// 1. Bacaan Harian Interaktif 7 Hari (Sabat Petang s/d Jumat)
// 2. Deteksi Hari Ini otomatis dengan indikator lencana Hari Ini
// 3. Popup Ayat Alkitab interaktif saat ayat diklik (seperti Adventech)
// 4. Pengatur ukuran font (A, A+, A++) ramah lansia
// 5. Caching offline lengkap (PWA)
// ============================================================

export const SS_QUARTERLY_INFO = {
    id: "2026-04",
    title: "Karunia Nubuat",
    human_date: "Oktober · November · Desember 2026",
    cover: "https://sabbath-school.adventech.io/api/v1/images/global/2026-04/splash.png"
};

export const SS_LESSONS_CATALOG = [
    { id: "01", title: "Sang Pencipta Berbicara", dateRange: "26 Sep - 02 Okt 2026", startDate: "2026-09-26", endDate: "2026-10-02" },
    { id: "02", title: "Panggilan Seorang Nabi", dateRange: "03 Okt - 09 Okt 2026", startDate: "2026-10-03", endDate: "2026-10-09" },
    { id: "03", title: "Nabi-Nabi Perjanjian Lama", dateRange: "10 Okt - 16 Okt 2026", startDate: "2026-10-10", endDate: "2026-10-16" },
    { id: "04", title: "Nabi-Nabi Perjanjian Baru", dateRange: "17 Okt - 23 Okt 2026", startDate: "2026-10-17", endDate: "2026-10-23" },
    { id: "05", title: "Wahyu dan Inspirasi", dateRange: "24 Okt - 30 Okt 2026", startDate: "2026-10-24", endDate: "2026-10-30" },
    { id: "06", title: "Tulisan-Tulisan Nubuatan", dateRange: "31 Okt - 06 Nov 2026", startDate: "2026-10-31", endDate: "2026-11-06" },
    { id: "07", title: "Dengarkanlah Ini!", dateRange: "07 Nov - 13 Nov 2026", startDate: "2026-11-07", endDate: "2026-11-13" },
    { id: "08", title: "Menafsirkan Tulisan-Tulisan Nubuatan", dateRange: "14 Nov - 20 Nov 2026", startDate: "2026-11-14", endDate: "2026-11-20" },
    { id: "09", title: "Menguji Para Nabi", dateRange: "21 Nov - 27 Nov 2026", startDate: "2026-11-21", endDate: "2026-11-27" },
    { id: "10", title: "Otoritas dan Relevansi Kenabian", dateRange: "28 Nov - 04 Des 2026", startDate: "2026-11-28", endDate: "2026-12-04" },
    { id: "11", title: "Manifestasi Nubuat di Saat-Saat Krusial", dateRange: "05 Des - 11 Des 2026", startDate: "2026-12-05", endDate: "2026-12-11" },
    { id: "12", title: "Wahyu Nubuat Akhir Zaman", dateRange: "12 Des - 18 Des 2026", startDate: "2026-12-12", endDate: "2026-12-18" },
    { id: "13", title: "Berkat-Berkat dari Firman Nubuat", dateRange: "19 Des - 25 Des 2026", startDate: "2026-12-19", endDate: "2026-12-25" }
];

export const SS_DAY_TABS = [
    { idx: 0, label: "Sabat Petang", sub: "Pendahuluan" },
    { idx: 1, label: "Minggu", sub: "Pelajaran" },
    { idx: 2, label: "Senin", sub: "Pelajaran" },
    { idx: 3, label: "Selasa", sub: "Pelajaran" },
    { idx: 4, label: "Rabu", sub: "Pelajaran" },
    { idx: 5, label: "Kamis", sub: "Pelajaran" },
    { idx: 6, label: "Jumat", sub: "Pendalaman" }
];

// Data Pelajaran 5 Built-in (Termasuk 53 Referensi Ayat Alkitab Lengkap)
const BUILTIN_LESSON_5 = {
    "id": "05",
    "title": "Wahyu dan Inspirasi",
    "start_date": "24/10/2026",
    "end_date": "30/10/2026",
    "memoryVerse": "\"Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada-Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes.\" (Wahyu 1:1)",
    "memoryVerseRef": "Wahyu 1:1",
    "days": [
        {
            "idx": 0,
            "id": "01",
            "title": "Wahyu dan Inspirasi",
            "date": "24/10/2026",
            "content": "<h3 id=\"untuk-pelajaran-pekan-ini-bacalah\">Untuk Pelajaran Pekan Ini Bacalah</h3>\n<p><a class=\"verse\" verse=\"Heb11-Heb12,2Tim315-2Tim317,2Tim32\">Ibr. 1: 1, 2; 2 Tim. 3: 15-17; 2</a> Pt: 1: 18-21; <a class=\"verse\" verse=\"Exod1714,Rev119,Ezek41-Ezek48\">Kel. 17: 14; Why. 1: 19; Yeh. 4: 1-8</a>.</p>\n<blockquote>\n<p>Ayat Hafalan</p>\n\"Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes. Yohanes telah bersaksi tentang firman Allah dan tentang kesaksian yang diberikan oleh Yesus Kristus, yaitu segala sesuatu yang telah dilihatnya\" (<a class=\"verse\" verse=\"Rev11-Rev12\">Wahyu 1: 1, 2</a>).\n</blockquote>\n<p>Rasul Yohanes telah menjadi bagian dari lingkaran dalam Kedua Belas Rasul (<a class=\"verse\" verse=\"Luke851,Matt171,Matt2636-Matt2637\">Luk. 8: 51; Mat. 17: 1; Mat. 26: 36, 37</a>). Setelah kenaikan Kristus, ia melanjutkan pelayanannya di Yerusalem. Namun, sebelum jatuhnya kota itu (70 M), ia pindah ke Efesus untuk mengawasi gereja-gereja di provinsi Romawi Asia Kecil. Selama penganiayaan Kristen di bawah kaisar Romawi Domitianus, rasul itu diasingkan ke Patmos, sebuah pulau di Laut Aegea.</p>\n<p>Di Patmos, Yohanes menerima pekabaran nubuatan khusus yang ditujukan tidak hanya kepada tujuh jemaat di Asia Kecil, melainkan juga kepada orang-orang Kristen sepanjang zaman (<a class=\"verse\" verse=\"Rev11-Rev13,Rev19-Rev111\">Why. 1: 1-3, 9-11</a>). Rantai penyampaian pekabaran nubuatan, di mana Yohanes menjadi bagiannya, terlihat seperti ini: Allah Bapa, kepada Yesus Kristus, kepada malaikat, kepada rasul Yohanes, dan kepada para pembaca serta pendengar.</p>\n<p>Ini adalah contoh klasik dari proses wahyu-inspirasi di mana Allah menggunakan para nabi untuk mengomunikasikan berbagai pekabaran-Nya kepada umat manusia. Pekan ini kita akan secara khusus meneliti proses wahyu-inspirasi yang beragam, dengan fokus khusus pada cara lisan, tertulis, dan dramatisasi di mana pekabaran Ilahi telah dikomunikasikan kepada manusia.</p>\n<p><em>Pelajari pelajaran pekan ini untuk persiapan Sabat, 31 Oktober.</em></p>\n",
            "verses": {
                "Rev11-Rev13,Rev19-Rev111": "<h2>Wahyu 1:1-3</h2> <sup>1</sup> Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada-Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes. <sup>2</sup> Yohanes telah bersaksi tentang firman Allah dan tentang kesaksian yang diberikan oleh Yesus Kristus, yaitu segala sesuatu yang telah dilihatnya. <sup>3</sup> Berbahagialah ia yang membacakan dan mereka yang mendengarkan kata-kata nubuat ini, dan yang menuruti apa yang ada tertulis di dalamnya, sebab waktunya sudah dekat.\n\n<h2>Wahyu 1:9-11</h2> <sup>9</sup> Aku, Yohanes, saudara dan sekutumu dalam kesusahan, dalam Kerajaan dan dalam ketekunan menantikan Yesus, berada di pulau yang bernama Patmos oleh karena firman Allah dan kesaksian yang diberikan oleh Yesus. <sup>10</sup> Pada hari Tuhan aku dikuasai oleh Roh dan aku mendengar dari belakangku suatu suara yang nyaring, seperti bunyi sangkakala, <sup>11</sup> katanya: \"Apa yang engkau lihat, tuliskanlah di dalam sebuah kitab dan kirimkanlah kepada ketujuh jemaat ini: ke Efesus, ke Smirna, ke Pergamus, ke Tiatira, ke Sardis, ke Filadelfia dan ke Laodikia.\"",
                "Luke851,Matt171,Matt2636-Matt2637": "<h2>Lukas 8:51</h2> <sup>51</sup> Setibanya di rumah Yairus, Yesus tidak memperbolehkan seorangpun ikut masuk dengan Dia, kecuali Petrus, Yohanes dan Yakobus dan ayah anak itu serta ibunya.\n\n<h2>Matius 17:1</h2> <sup>1</sup> Enam hari kemudian Yesus membawa Petrus, Yakobus dan Yohanes saudaranya, dan bersama-sama dengan mereka Ia naik ke sebuah gunung yang tinggi. Di situ mereka sendiri saja.\n\n<h2>Matius 26:36-37</h2> <sup>36</sup> Maka sampailah Yesus bersama-sama murid-murid-Nya ke suatu tempat yang bernama Getsemani. Lalu Ia berkata kepada murid-murid-Nya: \"Duduklah di sini, sementara Aku pergi ke sana untuk berdoa.\" <sup>37</sup> Dan Ia membawa Petrus dan kedua anak Zebedeus serta-Nya. Maka mulailah Ia merasa sedih dan gentar,",
                "Rev11-Rev12": "<h2>Wahyu 1:1-2</h2> <sup>1</sup> Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada-Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes. <sup>2</sup> Yohanes telah bersaksi tentang firman Allah dan tentang kesaksian yang diberikan oleh Yesus Kristus, yaitu segala sesuatu yang telah dilihatnya.",
                "Exod1714,Rev119,Ezek41-Ezek48": "<h2>Keluaran 17:14</h2> <sup>14</sup> Kemudian berfirmanlah TUHAN kepada Musa: \"Tuliskanlah semuanya ini dalam sebuah kitab sebagai tanda peringatan, dan ingatkanlah ke telinga Yosua, bahwa Aku akan menghapuskan sama sekali ingatan kepada Amalek dari kolong langit.\"\n\n<h2>Wahyu 1:19</h2> <sup>19</sup> Karena itu tuliskanlah apa yang telah kaulihat, baik yang terjadi sekarang maupun yang akan terjadi sesudah ini.\n\n<h2>Yehezkiel 4:1-8</h2> <sup>1</sup> \"Engkau, anak manusia, ambillah sebuah batu bata, letakkan di hadapanmu dan ukirlah di atasnya sebuah kota, yaitu Yerusalem. <sup>2</sup> Ukirlah kota itu dalam keadaan terkepung: dirikan sebuah benteng pengepungan, timbun pula tanah menjadi tembok pengepungan, tempatkan perkemahan tentara dan susun alat-alat pendobrak sekeliling kota itu. <sup>3</sup> Lalu ambillah sebidang besi dan dirikanlah itu di antaramu dengan kota itu menjadi dinding besi, kemudian tujukanlah wajahmu ke arah kota itu, sehingga kota itu dalam keadaan terkepung, dan engkaulah yang mengepung dia. Inilah menjadi lambang bagi kaum Israel. <sup>4</sup> Berbaringlah engkau pada sisi kirimu dan Aku akan menanggungkan hukuman kaum Israel atasmu. Berapa hari engkau berbaring demikian, selama itulah engkau menanggung hukuman mereka. <sup>5</sup> Beginilah Aku tentukan bagimu: Berapa tahun hukuman kaum Israel, sekian harilah engkau menanggung hukuman mereka, yaitu tiga ratus sembilan puluh hari. <sup>6</sup> Kalau engkau sudah mengakhiri waktu ini, berbaringlah engkau untuk kedua kalinya, tetapi pada sisi kananmu dan tanggunglah hukuman kaum Yehuda empat puluh hari lamanya; Aku menentukan bagimu satu hari untuk satu tahun. <sup>7</sup> Tujukanlah wajahmu kepada pengepungan Yerusalem dan kepalkanlah tinjumu kepadanya dan bernubuatlah melawan kota itu. <sup>8</sup> Lihat, Aku akan mengikat engkau dengan tali, sehingga engkau tidak dapat berbalik dari sisi yang satu ke sisi yang lain sampai engkau mengakhiri waktu pengepunganmu itu.",
                "Heb11-Heb12,2Tim315-2Tim317,2Tim32": "<h2>Ibrani 1:1-2</h2> <sup>1</sup> Setelah pada zaman dahulu Allah berulang kali dan dalam pelbagai cara berbicara kepada nenek moyang kita dengan perantaraan nabi-nabi, <sup>2</sup> maka pada zaman akhir ini Ia telah berbicara kepada kita dengan perantaraan Anak-Nya, yang telah Ia tetapkan sebagai yang berhak menerima segala yang ada. Oleh Dia Allah telah menjadikan alam semesta.\n\n<h2>2 Timotius 3:15-17</h2> <sup>15</sup> Ingatlah juga bahwa dari kecil engkau sudah mengenal Kitab Suci yang dapat memberi hikmat kepadamu dan menuntun engkau kepada keselamatan oleh iman kepada Kristus Yesus. <sup>16</sup> Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran. <sup>17</sup> Dengan demikian tiap-tiap manusia kepunyaan Allah diperlengkapi untuk setiap perbuatan baik.\n\n<h2>2 Timotius 3:2</h2> <sup>2</sup> Manusia akan mencintai dirinya sendiri dan menjadi hamba uang. Mereka akan membual dan menyombongkan diri, mereka akan menjadi pemfitnah, mereka akan berontak terhadap orang tua dan tidak tahu berterima kasih, tidak mempedulikan agama,"
            }
        },
        {
            "idx": 1,
            "id": "02",
            "title": "Wahyu Umum dan Khusus",
            "date": "25/10/2026",
            "content": "<p><code>Bacalah <a class=\"verse\" verse=\"Heb11-Heb12\">Ibrani 1: 1, 2</a>. Mengapakah Allah begitu tertarik untuk berbicara kepada kita? Apakah yang Ia sampaikan kepada kita melalui Yesus dan para nabi?</code></p>\n<p>Apakah yang akan dikatakan Pencipta kosmos kepada kita? Mengapakah Ia berkomunikasi dengan kita? Itu karena kita adalah manusia yang telah jatuh dalam dosa di dunia yang berdosa dan menghadapi kematian, penderitaan, dan ujian; karena itu, Allah berbicara kepada kita karena Ia ingin kita mengetahui mengapa kita ada di sini, mengapa keadaan begitu buruk, dan mengapa, terlepas dari semua itu, kita dapat berharap pada kasih-Nya bagi kita.</p>\n<p>Wahyu umum Allah, seperti yang terlihat di alam, berbicara dengan fasih tentang kuasa-Nya yang tak terbatas dan kasih-Nya yang peduli. Raja Daud berseru, &quot;Langit menceritakan kemuliaan Allah, dan cakrawala memberitakan pekerjaan tangan-Nya&quot; (<a class=\"verse\" verse=\"Ps192\">Mzm. 19: 2</a>). Rasul Paulus menambahkan, &quot;Sebab apa yang tidak nampak dari pada-Nya, yaitu kekuatan-Nya yang kekal dan keilahian-Nya, dapat dilihat dan dipahami dari karya-Nya sejak dunia diciptakan, sehingga mereka tidak dapat berdalih&quot; (<a class=\"verse\" verse=\"Rom120\">Rm. 1: 20</a>).</p>\n<p>Juga menakjubkan untuk merenungkan kuasa pemulihan Allah yang dimanifestasikan dalam proses penyembuhan misterius di dunia kita. Memang, &quot;Kuasa Allah yang menyembuhkan berlaku di seluruh alam. Jika sebatang pohon ditebang, jika seorang manusia terluka atau patah sebuah tulang, alam segera mulai memperbaiki luka itu. Bahkan sebelum keperluan itu ada, alat-alat penyembuhan sudah siap; dan segera setelah satu bagian terluka, setiap tenaga bekerja mengadakan pemulihan&quot; —Ellen G. White, Membina Pendidikan Sejati, hlm. 101.</p>\n<p>Seindah dan instruktif apa pun alam, ia mengungkapkan bukan hanya kuasa dan kasih Sang Pencipta, melainkan juga keberadaan ejahatan (lihat <a class=\"verse\" verse=\"Gen314-Gen319,Matt1324-Matt1330\">Kej. 3: 14-19; Mat. 13: 24-30</a>). Pekabaran yang ambigu ini hanya dapat dipahami dengan benar dalam terang wahyu khusus Allah-baik dalam Yesus Kristus, Firman Allah yang menjelma, maupun dalam Alkitab, Firman Allah Tertulis yang bersaksi tentang Dia (<a class=\"verse\" verse=\"John539\">Yoh. 5: 39</a>).</p>\n<p>Kitab Suci adalah catatan yang diilhami dari berbagai pekabaran Allah kepada semua manusia sepanjang zaman. Kitab Suci memberi tahu kita tentang Penciptaan dunia dan kejatuhannya yang tragis, dan tentang rencana penebusan Allah yang menakjubkan serta pemulihan akhir planet Bumi. Sesingkat dan seselektif apa pun beberapa narasi alkitabiah, narasi-narasi itu selalu dapat diandalkan, karena itu adalah Allah yang berbicara kepada kita (lihat <a class=\"verse\" verse=\"2Tim316,2Pet119-2Pet121\">2 Tim. 3: 16;2 Ptr. 1: 19-21</a>).</p>\n<p><code>Meskipun alam pastinya menunjuk pada realitas kuasa dan kasih Sang Pencipta, mengapakah kita masih sangat membutuhkan Firman Tertulis juga? Apakah yang Firman itu ceritakan kepada kita yang tidak diceritakan oleh alam, di dalam dan dari dirinya sendiri?</code></p>\n",
            "verses": {
                "2Tim316,2Pet119-2Pet121": "<h2>2 Timotius 3:16</h2> <sup>16</sup> Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran.\n\n<h2>2 Petrus 1:19-21</h2> <sup>19</sup> Dengan demikian kami makin diteguhkan oleh firman yang telah disampaikan oleh para nabi. Alangkah baiknya kalau kamu memperhatikannya sama seperti memperhatikan pelita yang bercahaya di tempat yang gelap sampai fajar menyingsing dan bintang timur terbit bersinar di dalam hatimu. <sup>20</sup> Yang terutama harus kamu ketahui, ialah bahwa nubuat-nubuat dalam Kitab Suci tidak boleh ditafsirkan menurut kehendak sendiri, <sup>21</sup> sebab tidak pernah nubuat dihasilkan oleh kehendak manusia, tetapi oleh dorongan Roh Kudus orang-orang berbicara atas nama Allah.",
                "John539": "<h2>Yohanes 5:39</h2> <sup>39</sup> Kamu menyelidiki Kitab-kitab Suci, sebab kamu menyangka bahwa oleh-Nya kamu mempunyai hidup yang kekal, tetapi walaupun Kitab-kitab Suci itu memberi kesaksian tentang Aku,",
                "Gen314-Gen319,Matt1324-Matt1330": "<h2>Kejadian 3:14-19</h2> <sup>14</sup> Lalu berfirmanlah TUHAN Allah kepada ular itu: \"Karena engkau berbuat demikian, terkutuklah engkau di antara segala ternak dan di antara segala binatang hutan; dengan perutmulah engkau akan menjalar dan debu tanahlah akan kaumakan seumur hidupmu. <sup>15</sup> Aku akan mengadakan permusuhan antara engkau dan perempuan ini, antara keturunanmu dan keturunannya; keturunannya akan meremukkan kepalamu, dan engkau akan meremukkan tumitnya.\" <sup>16</sup> Firman-Nya kepada perempuan itu: \"Susah payahmu waktu mengandung akan Kubuat sangat banyak; dengan kesakitan engkau akan melahirkan anakmu; namun engkau akan berahi kepada suamimu dan ia akan berkuasa atasmu.\" <sup>17</sup> Lalu firman-Nya kepada manusia itu: \"Karena engkau mendengarkan perkataan isterimu dan memakan dari buah pohon, yang telah Kuperintahkan kepadamu: Jangan makan dari padanya, maka terkutuklah tanah karena engkau; dengan bersusah payah engkau akan mencari rezekimu dari tanah seumur hidupmu: <sup>18</sup> semak duri dan rumput duri yang akan dihasilkannya bagimu, dan tumbuh-tumbuhan di padang akan menjadi makananmu; <sup>19</sup> dengan berpeluh engkau akan mencari makananmu, sampai engkau kembali lagi menjadi tanah, karena dari situlah engkau diambil; sebab engkau debu dan engkau akan kembali menjadi debu.\"\n\n<h2>Matius 13:24-30</h2> <sup>24</sup> Yesus membentangkan suatu perumpamaan lain lagi kepada mereka, kata-Nya: \"Hal Kerajaan Sorga itu seumpama orang yang menaburkan benih yang baik di ladangnya. <sup>25</sup> Tetapi pada waktu semua orang tidur, datanglah musuhnya menaburkan benih lalang di antara gandum itu, lalu pergi. <sup>26</sup> Ketika gandum itu tumbuh dan mulai berbulir, nampak jugalah lalang itu. <sup>27</sup> Maka datanglah hamba-hamba tuan ladang itu kepadanya dan berkata: Tuan, bukankah benih baik, yang tuan taburkan di ladang tuan? Dari manakah lalang itu? <sup>28</sup> Jawab tuan itu: Seorang musuh yang melakukannya. Lalu berkatalah hamba-hamba itu kepadanya: Jadi maukah tuan supaya kami pergi mencabut lalang itu? <sup>29</sup> Tetapi ia berkata: Jangan, sebab mungkin gandum itu ikut tercabut pada waktu kamu mencabut lalang itu. <sup>30</sup> Biarkanlah keduanya tumbuh bersama sampai waktu menuai. Pada waktu itu aku akan berkata kepada para penuai: Kumpulkanlah dahulu lalang itu dan ikatlah berberkas-berkas untuk dibakar; kemudian kumpulkanlah gandum itu ke dalam lumbungku.\"",
                "Rom120": "<h2>Roma 1:20</h2> <sup>20</sup> Sebab apa yang tidak nampak dari pada-Nya, yaitu kekuatan-Nya yang kekal dan keilahian-Nya, dapat nampak kepada pikiran dari karya-Nya sejak dunia diciptakan, sehingga mereka tidak dapat berdalih.",
                "Ps192": "<h2>Mazmur 19:2</h2> <sup>2</sup> (19-3) hari meneruskan berita itu kepada hari, dan malam menyampaikan pengetahuan itu kepada malam.",
                "Heb11-Heb12": "<h2>Ibrani 1:1-2</h2> <sup>1</sup> Setelah pada zaman dahulu Allah berulang kali dan dalam pelbagai cara berbicara kepada nenek moyang kita dengan perantaraan nabi-nabi, <sup>2</sup> maka pada zaman akhir ini Ia telah berbicara kepada kita dengan perantaraan Anak-Nya, yang telah Ia tetapkan sebagai yang berhak menerima segala yang ada. Oleh Dia Allah telah menjadikan alam semesta."
            }
        },
        {
            "idx": 2,
            "id": "03",
            "title": "Proses Inspirasi",
            "date": "26/10/2026",
            "content": "<p>Banyak buku dan tulisan, bukan hanya Alkitab, telah sampai kepada kita selama berabad-abad. Namun, kita menganggap Alkitab sebagai Firman Allah. Apakah yang memisahkannya dari tulisan-tulisan lain?</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"2Tim315-2Tim317,Jas117\">2 Timotius 3: 15-17 dan Yakobus 1: 17</a>. Pekabaran penting apakah yang harus kita ambil dari ayat-ayat ini?</code></p>\n<p>Ada beberapa diskusi tentang terjemahan terbaik dari <a class=\"verse\" verse=\"2Tim316\">2 Timotius 3: 16</a>, tetapi sebagian besar terjemahan Alkitab menerjemahkan bagian ini dengan cara yang sama, menekankan bahwa seluruh Alkitab berasal dari Ilahi (<a class=\"verse\" verse=\"2Pet120-2Pet121\">2 Ptr. 1: 20, 21</a>). Seorang komentator Alkitab menjelaskan bahwa &quot;tampaknya lebih mungkin bahwa Paulus sedang merenungkan kitab suci secara keseluruhan di sini dan bahwa ia akan mengatakan bahwa keseluruhan kitab suci itu &#39;bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran,&#39; daripada bahwa setiap bagian kitab suci bermanfaat dalam cara-cara ini&quot;-G. W. Knight III, The Pastoral Epistles: A Commentary on the Greek Text (Grand Rapids, MI: Eerdmans, 1992), hlm. 445.</p>\n<p>Namun, bagaimanakah seharusnya kita memahami proses inspirasi yang melahirkan Alkitab? Kita harus menyadari bahwa inspirasi nubuat adalah Roh Kudus yang membantu nabi-nabi yang benar untuk komunikasi pekabaran Ilahi yang dapat diandalkan. Bantuan itu diberikan tidak hanya dalam proses menerima pekabaran, melainkan juga dalam mengomunikasikan pekabaran tersebut dengan jelas kepada penerimanya.</p>\n<p>Berbagai pekabaran Allah datang melalui penglihatan dan mimpi (<a class=\"verse\" verse=\"Num126,Isa61,Isa68\">Bil. 12: 6; Yes. 6: 1, 8</a>). Allah juga menggunakan saksi mata (<a class=\"verse\" verse=\"1John11-1John13\">1 Yoh. 1: 1-3</a>), penelitian sejarah yang diilhami Roh (<a class=\"verse\" verse=\"Luke11-Luke13\">Luk. 1: 1-3</a>), dan kesan Ilahi pada pikiran (<a class=\"verse\" verse=\"2Pet121\">2 Ptr. 1: 21</a>).</p>\n<p>Terlepas dari cara yang digunakan oleh Roh Kudus, para nabi dan penulis Alkitab diberi pekabaran kebenaran yang objektif, bukan subjektif, untuk dibagikan. Artinya, berbagai pekabaran Allah tidak boleh diubah atau didistorsi dengan cara apa pun oleh utusan-utusan-Nya, bahkan jika mereka menggunakan kata-kata mereka sendiri untuk mengungkapkan berbagai pekabaran tersebut. Tugas mengomunikasikan pekabaran nubuat kepada pendengar aslinya dapat dilakukan secara lisan (<a class=\"verse\" verse=\"2Pet119-2Pet121\">2 Ptr: 1: 19-21</a>), atau dalam bentuk tertulis (<a class=\"verse\" verse=\"John2030-John2031\">Yoh. 20: 30, 31</a>), atau bahkan melalui dramatisasi (<a class=\"verse\" verse=\"Ezek41-Ezek48\">Yeh. 4: 1-8</a>).</p>\n<p><code>Meskipun banyak pertanyaan tetap ada tentang bagaimanakah Alkitab diilhami, atau bagaimanakah inspirasi bekerja secara umum, mengapakah begitu penting untuk memercayai Alkitab sebagai Firman Allah yang diilhami, terlepas dari apa yang mungkin tidak sepenuhnya kita pahami tentang bagaimanakah itu ditulis?</code></p>\n",
            "verses": {
                "Ezek41-Ezek48": "<h2>Yehezkiel 4:1-8</h2> <sup>1</sup> \"Engkau, anak manusia, ambillah sebuah batu bata, letakkan di hadapanmu dan ukirlah di atasnya sebuah kota, yaitu Yerusalem. <sup>2</sup> Ukirlah kota itu dalam keadaan terkepung: dirikan sebuah benteng pengepungan, timbun pula tanah menjadi tembok pengepungan, tempatkan perkemahan tentara dan susun alat-alat pendobrak sekeliling kota itu. <sup>3</sup> Lalu ambillah sebidang besi dan dirikanlah itu di antaramu dengan kota itu menjadi dinding besi, kemudian tujukanlah wajahmu ke arah kota itu, sehingga kota itu dalam keadaan terkepung, dan engkaulah yang mengepung dia. Inilah menjadi lambang bagi kaum Israel. <sup>4</sup> Berbaringlah engkau pada sisi kirimu dan Aku akan menanggungkan hukuman kaum Israel atasmu. Berapa hari engkau berbaring demikian, selama itulah engkau menanggung hukuman mereka. <sup>5</sup> Beginilah Aku tentukan bagimu: Berapa tahun hukuman kaum Israel, sekian harilah engkau menanggung hukuman mereka, yaitu tiga ratus sembilan puluh hari. <sup>6</sup> Kalau engkau sudah mengakhiri waktu ini, berbaringlah engkau untuk kedua kalinya, tetapi pada sisi kananmu dan tanggunglah hukuman kaum Yehuda empat puluh hari lamanya; Aku menentukan bagimu satu hari untuk satu tahun. <sup>7</sup> Tujukanlah wajahmu kepada pengepungan Yerusalem dan kepalkanlah tinjumu kepadanya dan bernubuatlah melawan kota itu. <sup>8</sup> Lihat, Aku akan mengikat engkau dengan tali, sehingga engkau tidak dapat berbalik dari sisi yang satu ke sisi yang lain sampai engkau mengakhiri waktu pengepunganmu itu.",
                "John2030-John2031": "<h2>Yohanes 20:30-31</h2> <sup>30</sup> Memang masih banyak tanda lain yang dibuat Yesus di depan mata murid-murid-Nya, yang tidak tercatat dalam kitab ini, <sup>31</sup> tetapi semua yang tercantum di sini telah dicatat, supaya kamu percaya, bahwa Yesuslah Mesias, Anak Allah, dan supaya kamu oleh imanmu memperoleh hidup dalam nama-Nya.",
                "2Pet119-2Pet121": "<h2>2 Petrus 1:19-21</h2> <sup>19</sup> Dengan demikian kami makin diteguhkan oleh firman yang telah disampaikan oleh para nabi. Alangkah baiknya kalau kamu memperhatikannya sama seperti memperhatikan pelita yang bercahaya di tempat yang gelap sampai fajar menyingsing dan bintang timur terbit bersinar di dalam hatimu. <sup>20</sup> Yang terutama harus kamu ketahui, ialah bahwa nubuat-nubuat dalam Kitab Suci tidak boleh ditafsirkan menurut kehendak sendiri, <sup>21</sup> sebab tidak pernah nubuat dihasilkan oleh kehendak manusia, tetapi oleh dorongan Roh Kudus orang-orang berbicara atas nama Allah.",
                "2Pet121": "<h2>2 Petrus 1:21</h2> <sup>21</sup> sebab tidak pernah nubuat dihasilkan oleh kehendak manusia, tetapi oleh dorongan Roh Kudus orang-orang berbicara atas nama Allah.",
                "Luke11-Luke13": "<h2>Lukas 1:1-3</h2> <sup>1</sup> Teofilus yang mulia, Banyak orang telah berusaha menyusun suatu berita tentang peristiwa-peristiwa yang telah terjadi di antara kita, <sup>2</sup> seperti yang disampaikan kepada kita oleh mereka, yang dari semula adalah saksi mata dan pelayan Firman. <sup>3</sup> Karena itu, setelah aku menyelidiki segala peristiwa itu dengan seksama dari asal mulanya, aku mengambil keputusan untuk membukukannya dengan teratur bagimu,",
                "1John11-1John13": "<h2>1 Yohanes 1:1-3</h2> <sup>1</sup> Apa yang telah ada sejak semula, yang telah kami dengar, yang telah kami lihat dengan mata kami, yang telah kami saksikan dan yang telah kami raba dengan tangan kami tentang Firman hidup--itulah yang kami tuliskan kepada kamu. <sup>2</sup> Hidup itu telah dinyatakan, dan kami telah melihatnya dan sekarang kami bersaksi dan memberitakan kepada kamu tentang hidup kekal, yang ada bersama-sama dengan Bapa dan yang telah dinyatakan kepada kami. <sup>3</sup> Apa yang telah kami lihat dan yang telah kami dengar itu, kami beritakan kepada kamu juga, supaya kamupun beroleh persekutuan dengan kami. Dan persekutuan kami adalah persekutuan dengan Bapa dan dengan Anak-Nya, Yesus Kristus.",
                "Num126,Isa61,Isa68": "<h2>Bilangan 12:6</h2> <sup>6</sup> Lalu berfirmanlah Ia: \"Dengarlah firman-Ku ini. Jika di antara kamu ada seorang nabi, maka Aku, TUHAN menyatakan diri-Ku kepadanya dalam penglihatan, Aku berbicara dengan dia dalam mimpi.\n\n<h2>Yesaya 6:1</h2> <sup>1</sup> Dalam tahun matinya raja Uzia aku melihat Tuhan duduk di atas takhta yang tinggi dan menjulang, dan ujung jubah-Nya memenuhi Bait Suci.\n\n<h2>Yesaya 6:8</h2> <sup>8</sup> Lalu aku mendengar suara Tuhan berkata: \"Siapakah yang akan Kuutus, dan siapakah yang mau pergi untuk Aku?\" Maka sahutku: \"Ini aku, utuslah aku!\"",
                "2Pet120-2Pet121": "<h2>2 Petrus 1:20-21</h2> <sup>20</sup> Yang terutama harus kamu ketahui, ialah bahwa nubuat-nubuat dalam Kitab Suci tidak boleh ditafsirkan menurut kehendak sendiri, <sup>21</sup> sebab tidak pernah nubuat dihasilkan oleh kehendak manusia, tetapi oleh dorongan Roh Kudus orang-orang berbicara atas nama Allah.",
                "2Tim316": "<h2>2 Timotius 3:16</h2> <sup>16</sup> Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran.",
                "2Tim315-2Tim317,Jas117": "<h2>2 Timotius 3:15-17</h2> <sup>15</sup> Ingatlah juga bahwa dari kecil engkau sudah mengenal Kitab Suci yang dapat memberi hikmat kepadamu dan menuntun engkau kepada keselamatan oleh iman kepada Kristus Yesus. <sup>16</sup> Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran. <sup>17</sup> Dengan demikian tiap-tiap manusia kepunyaan Allah diperlengkapi untuk setiap perbuatan baik.\n\n<h2>Yakobus 1:17</h2> <sup>17</sup> Setiap pemberian yang baik dan setiap anugerah yang sempurna, datangnya dari atas, diturunkan dari Bapa segala terang; pada-Nya tidak ada perubahan atau bayangan karena pertukaran."
            }
        },
        {
            "idx": 3,
            "id": "04",
            "title": "Pekabaran Lisan",
            "date": "27/10/2026",
            "content": "<p><code>Bacalah <a class=\"verse\" verse=\"2Pet118-2Pet121\">2 Petrus 1: 18-21</a>. Jaminan apakah yang kita miliki bahwa pekabaran lisan yang disampaikan oleh nabi-nabi Allah sama diilhaminya dan dapat diandalkannya dengan pekabaran tertulis?</code></p>\n<p>Allah berbicara kepada Adain dan Hawa sebelum Kejatuhan (<a class=\"verse\" verse=\"Gen216-Gen217\">Kej. 2: 16, 17</a>) dan sesudahnya (<a class=\"verse\" verse=\"Gen39-Gen319\">Kej. 3: 9-19</a>). Dalam kedua kasus tersebut, mereka memahami firman-Nya dengan sempurna. Suara-Nya terdengar dalam istilah yang jelas juga di Sinai (<a class=\"verse\" verse=\"Exod201-Exod2020\">Kel. 20: 1-20</a>), serta pada saat pembaptisan dan transfigurasi Yesus (<a class=\"verse\" verse=\"Matt317,Matt175\">Mat. 3: 17; Mat. 17: 5</a>).</p>\n<p>Kita mungkin salah menafsirkan ketika orang lain berbicara kepada kita. kepada Musa: &#39;Akulah TUHAN&quot;&#39; (<a class=\"verse\" verse=\"Exod61\">Kel. 6: 1</a>). Banyak penulis Alkitab mengakui mendengar suara Allah saat Ia berbicara kepada mereka. Hal ini terjadi, misal nya, pada Yesaya (<a class=\"verse\" verse=\"Isa81,Isa811,Jer14,Jer19,Jer111\">Yes. 8: 1, 11), Yeremia (Yer. 1: 4, 9, 11)</a>, dan Yehezkiel (<a class=\"verse\" verse=\"Ezek316,Ezek61\">Yeh. 3: 16; Yeh. 6: 1</a>). Segala upaya untuk menyangkal klaim-klaim ini dan yang serupa lainnya berakhir dengan mempertanyakan kejujuran para nabi dan keandalan Alkitab itu sendiri.</p>\n<p>Sebagaimana Allah berbicara kepada para nabi dalam bahasa manusia yang dapat dimengerti, demikian pula para nabi berbicara kepada pendengar mereka masing-masing. Sebagai contoh, Nuh adalah nabi Allah yang benar dan &quot;pemberita kebenaran&quot; yang setia (<a class=\"verse\" verse=\"2Pet25\">2 Ptr. 2: 5</a>). Ia tidak menulis bagian apa pun dari Alkitab, tetapi ia menyampaikan pekabaran Allah secara lisan kepada orang-orang sezamannya, dan pekabarannya tidak kalah diilhaminya dibandingkan tulisan-tulisan nabi-nabi kanonik. Beberapa nabi lain, termasuk Natan, Elia, Elisa, dan Yohanes Pembaptis, tidak pernah menulis bagian apa pun dari Alkitab; sebaliknya, mereka menyampaikan pekabaran mereka secara lisan.</p>\n<p>Dan bagaimanakah dengan Yesus Kristus sendiri? Catatan Injil menyebutkan bahwa selama pelayanan duniawi-Nya &quot;Yesus membungkuk lalu menulis dengan jari-Nya di tanah&quot; (<a class=\"verse\" verse=\"John86\">Yoh. 8: 6</a>). Itu saja. Kita tidak memiliki catatan bahwa Yesus menulis hal lain. Namun, Ia mengajar dan berkhotbah secara lisan &quot;sebagai orang yang berkuasa&quot; (<a class=\"verse\" verse=\"Matt729\">Mat. 7: 29</a>). Beberapa pendengar-Nya bahkan mengakui, &quot;Belum pernah seorang manusia berkata-kata seperti orang itu!&quot; (<a class=\"verse\" verse=\"John746\">Yoh. 7: 46</a>). Yesus terutama adalah komunikator lisan berbagai pekabaran Allah. Berbagai pekabaran-Nya tidak kalah otoritatif atau mengikatnya hanya karena Dia sendiri tidak menulis buku-buku Alkitab.</p>\n<p><code>Sungguh menarik bahwa Allah memiliki nabi-nabi yang tidak memiliki tulisan di dalam Alkitab. Mengapakah nabi-nabi nonkanonik ini juga membawa otoritas?</code></p>\n",
            "verses": {
                "John746": "<h2>Yohanes 7:46</h2> <sup>46</sup> Jawab penjaga-penjaga itu: \"Belum pernah seorang manusia berkata seperti orang itu!\"",
                "Matt729": "<h2>Matius 7:29</h2> <sup>29</sup> sebab Ia mengajar mereka sebagai orang yang berkuasa, tidak seperti ahli-ahli Taurat mereka.",
                "John86": "<h2>Yohanes 8:6</h2> <sup>6</sup> Mereka mengatakan hal itu untuk mencobai Dia, supaya mereka memperoleh sesuatu untuk menyalahkan-Nya. Tetapi Yesus membungkuk lalu menulis dengan jari-Nya di tanah.",
                "2Pet25": "<h2>2 Petrus 2:5</h2> <sup>5</sup> dan jikalau Allah tidak menyayangkan dunia purba, tetapi hanya menyelamatkan Nuh, pemberita kebenaran itu, dengan tujuh orang lain, ketika Ia mendatangkan air bah atas dunia orang-orang yang fasik;",
                "Ezek316,Ezek61": "<h2>Yehezkiel 3:16</h2> <sup>16</sup> Sesudah tujuh hari datanglah firman TUHAN kepadaku:\n\n<h2>Yehezkiel 6:1</h2> <sup>1</sup> Kemudian datanglah firman TUHAN kepadaku:",
                "Isa81,Isa811,Jer14,Jer19,Jer111": "<h2>Yesaya 8:1</h2> <sup>1</sup> Berfirmanlah TUHAN kepadaku: \"Ambillah sebuah batu tulis besar dan tuliskanlah di atasnya dengan tulisan biasa: Maher-Syalal Hash-Bas.\"\n\n<h2>Yesaya 8:11</h2> <sup>11</sup> Sebab beginilah firman TUHAN kepadaku, ketika tangan-Nya menguasai aku, dan ketika Ia memperingatkan aku, supaya jangan mengikuti tingkah laku bangsa ini:\n\n<h2>Yeremia 1:4</h2> <sup>4</sup> Firman TUHAN datang kepadaku, bunyinya:\n\n<h2>Yeremia 1:9</h2> <sup>9</sup> Lalu TUHAN mengulurkan tangan-Nya dan menjamah mulutku; TUHAN berfirman kepadaku: \"Sesungguhnya, Aku menaruh perkataan-perkataan-Ku ke dalam mulutmu.\n\n<h2>Yeremia 1:11</h2> <sup>11</sup> Sesudah itu firman TUHAN datang kepadaku, bunyinya: \"Apakah yang kaulihat, hai Yeremia?\" Jawabku: \"Aku melihat sebatang dahan pohon badam.\"",
                "Exod61": "<h2>Keluaran 6:1</h2> <sup>1</sup> (5-24) Tetapi TUHAN berfirman kepada Musa: \"Sekarang engkau akan melihat, apa yang akan Kulakukan kepada Firaun; sebab dipaksa oleh tangan yang kuat ia akan membiarkan mereka pergi, ya dipaksa oleh tangan yang kuat ia akan mengusir mereka dari negerinya.\"",
                "Matt317,Matt175": "<h2>Matius 3:17</h2> <sup>17</sup> lalu terdengarlah suara dari sorga yang mengatakan: \"Inilah Anak-Ku yang Kukasihi, kepada-Nyalah Aku berkenan.\"\n\n<h2>Matius 17:5</h2> <sup>5</sup> Dan tiba-tiba sedang ia berkata-kata turunlah awan yang terang menaungi mereka dan dari dalam awan itu terdengar suara yang berkata: \"Inilah Anak yang Kukasihi, kepada-Nyalah Aku berkenan, dengarkanlah Dia.\"",
                "Exod201-Exod2020": "<h2>Keluaran 20:1-20</h2> <sup>1</sup> Lalu Allah mengucapkan segala firman ini: <sup>2</sup> \"Akulah TUHAN, Allahmu, yang membawa engkau keluar dari tanah Mesir, dari tempat perbudakan. <sup>3</sup> Jangan ada padamu allah lain di hadapan-Ku. <sup>4</sup> Jangan membuat bagimu patung yang menyerupai apapun yang ada di langit di atas, atau yang ada di bumi di bawah, atau yang ada di dalam air di bawah bumi. <sup>5</sup> Jangan sujud menyembah kepadanya atau beribadah kepadanya, sebab Aku, TUHAN, Allahmu, adalah Allah yang cemburu, yang membalaskan kesalahan bapa kepada anak-anaknya, kepada keturunan yang ketiga dan keempat dari orang-orang yang membenci Aku, <sup>6</sup> tetapi Aku menunjukkan kasih setia kepada beribu-ribu orang, yaitu mereka yang mengasihi Aku dan yang berpegang pada perintah-perintah-Ku. <sup>7</sup> Jangan menyebut nama TUHAN, Allahmu, dengan sembarangan, sebab TUHAN akan memandang bersalah orang yang menyebut nama-Nya dengan sembarangan. <sup>8</sup> Ingatlah dan kuduskanlah hari Sabat: <sup>9</sup> enam hari lamanya engkau akan bekerja dan melakukan segala pekerjaanmu, <sup>10</sup> tetapi hari ketujuh adalah hari Sabat TUHAN, Allahmu; maka jangan melakukan sesuatu pekerjaan, engkau atau anakmu laki-laki, atau anakmu perempuan, atau hambamu laki-laki, atau hambamu perempuan, atau hewanmu atau orang asing yang di tempat kediamanmu. <sup>11</sup> Sebab enam hari lamanya TUHAN menjadikan langit dan bumi, laut dan segala isinya, dan Ia berhenti pada hari ketujuh; itulah sebabnya TUHAN memberkati hari Sabat dan menguduskannya. <sup>12</sup> Hormatilah ayahmu dan ibumu, supaya lanjut umurmu di tanah yang diberikan TUHAN, Allahmu, kepadamu. <sup>13</sup> Jangan membunuh. <sup>14</sup> Jangan berzinah. <sup>15</sup> Jangan mencuri. <sup>16</sup> Jangan mengucapkan saksi dusta tentang sesamamu. <sup>17</sup> Jangan mengingini rumah sesamamu; jangan mengingini isterinya, atau hambanya laki-laki, atau hambanya perempuan, atau lembunya atau keledainya, atau apapun yang dipunyai sesamamu.\" <sup>18</sup> Seluruh bangsa itu menyaksikan guruh mengguntur, kilat sabung-menyabung, sangkakala berbunyi dan gunung berasap. Maka bangsa itu takut dan gemetar dan mereka berdiri jauh-jauh. <sup>19</sup> Mereka berkata kepada Musa: \"Engkaulah berbicara dengan kami, maka kami akan mendengarkan; tetapi janganlah Allah berbicara dengan kami, nanti kami mati.\" <sup>20</sup> Tetapi Musa berkata kepada bangsa itu: \"Janganlah takut, sebab Allah telah datang dengan maksud untuk mencoba kamu dan dengan maksud supaya takut akan Dia ada padamu, agar kamu jangan berbuat dosa.\"",
                "Gen39-Gen319": "<h2>Kejadian 3:9-19</h2> <sup>9</sup> Tetapi TUHAN Allah memanggil manusia itu dan berfirman kepadanya: \"Di manakah engkau?\" <sup>10</sup> Ia menjawab: \"Ketika aku mendengar, bahwa Engkau ada dalam taman ini, aku menjadi takut, karena aku telanjang; sebab itu aku bersembunyi.\" <sup>11</sup> Firman-Nya: \"Siapakah yang memberitahukan kepadamu, bahwa engkau telanjang? Apakah engkau makan dari buah pohon, yang Kularang engkau makan itu?\" <sup>12</sup> Manusia itu menjawab: \"Perempuan yang Kautempatkan di sisiku, dialah yang memberi dari buah pohon itu kepadaku, maka kumakan.\" <sup>13</sup> Kemudian berfirmanlah TUHAN Allah kepada perempuan itu: \"Apakah yang telah kauperbuat ini?\" Jawab perempuan itu: \"Ular itu yang memperdayakan aku, maka kumakan.\" <sup>14</sup> Lalu berfirmanlah TUHAN Allah kepada ular itu: \"Karena engkau berbuat demikian, terkutuklah engkau di antara segala ternak dan di antara segala binatang hutan; dengan perutmulah engkau akan menjalar dan debu tanahlah akan kaumakan seumur hidupmu. <sup>15</sup> Aku akan mengadakan permusuhan antara engkau dan perempuan ini, antara keturunanmu dan keturunannya; keturunannya akan meremukkan kepalamu, dan engkau akan meremukkan tumitnya.\" <sup>16</sup> Firman-Nya kepada perempuan itu: \"Susah payahmu waktu mengandung akan Kubuat sangat banyak; dengan kesakitan engkau akan melahirkan anakmu; namun engkau akan berahi kepada suamimu dan ia akan berkuasa atasmu.\" <sup>17</sup> Lalu firman-Nya kepada manusia itu: \"Karena engkau mendengarkan perkataan isterimu dan memakan dari buah pohon, yang telah Kuperintahkan kepadamu: Jangan makan dari padanya, maka terkutuklah tanah karena engkau; dengan bersusah payah engkau akan mencari rezekimu dari tanah seumur hidupmu: <sup>18</sup> semak duri dan rumput duri yang akan dihasilkannya bagimu, dan tumbuh-tumbuhan di padang akan menjadi makananmu; <sup>19</sup> dengan berpeluh engkau akan mencari makananmu, sampai engkau kembali lagi menjadi tanah, karena dari situlah engkau diambil; sebab engkau debu dan engkau akan kembali menjadi debu.\"",
                "Gen216-Gen217": "<h2>Kejadian 2:16-17</h2> <sup>16</sup> Lalu TUHAN Allah memberi perintah ini kepada manusia: \"Semua pohon dalam taman ini boleh kaumakan buahnya dengan bebas, <sup>17</sup> tetapi pohon pengetahuan tentang yang baik dan yang jahat itu, janganlah kaumakan buahnya, sebab pada hari engkau memakannya, pastilah engkau mati.\"",
                "2Pet118-2Pet121": "<h2>2 Petrus 1:18-21</h2> <sup>18</sup> Suara itu kami dengar datang dari sorga, ketika kami bersama-sama dengan Dia di atas gunung yang kudus. <sup>19</sup> Dengan demikian kami makin diteguhkan oleh firman yang telah disampaikan oleh para nabi. Alangkah baiknya kalau kamu memperhatikannya sama seperti memperhatikan pelita yang bercahaya di tempat yang gelap sampai fajar menyingsing dan bintang timur terbit bersinar di dalam hatimu. <sup>20</sup> Yang terutama harus kamu ketahui, ialah bahwa nubuat-nubuat dalam Kitab Suci tidak boleh ditafsirkan menurut kehendak sendiri, <sup>21</sup> sebab tidak pernah nubuat dihasilkan oleh kehendak manusia, tetapi oleh dorongan Roh Kudus orang-orang berbicara atas nama Allah."
            }
        },
        {
            "idx": 4,
            "id": "05",
            "title": "Pekabaran Tertulis",
            "date": "28/10/2026",
            "content": "<p>Beberapa pidato terkenal telah berdampak mendalam pada kehidupan orang-orang dan bahkan mengubah jalannya sejarah. Jika pidato-pidato ini tidak direkam, kata-kata itu akan memudar atau menjadi terdistorsi seiring berjalannya waktu. Dengan demikian, tulisan memberikan keabadian pada kata yang diucapkan, dan keabadian itu memungkinkan pekabaran tersebut ditransmisikan melintasi waktu.</p>\n<p>Tak lama setelah orang Israel meninggalkan Mesir dan mengalahkan orang Amalek, Allah memerintahkan Musa untuk &quot;tuliskanlah semuanya ini dalam sebuah kitab sebagai tanda peringatan&quot; (<a class=\"verse\" verse=\"Exod1714\">Kel. 17: 14</a>). Dimulai dengan Musa, yang menulis lima kitab pertama Alkitab dan <a class=\"verse\" verse=\"Ps90\">Mazmur 90</a>, Roh Kudus membimbing para nabi kanonik untuk menghasilkan tulisan-tulisan yang sekarang terdiri dari 66 kitab dalam Alkitab.</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"Exod1714,John2030-John2031,1Cor1011,Rev119\">Keluaran 17: 14; Yohanes 20: 30, 31; 1 Korintus 10: 11; dan Wahyu 1: 19</a>. Apakah beberapa alasan Allah meminta nabi-nabi-Nya untuk menuliskan berbagai pekabaran yang Ia berikan kepada mereka?</code></p>\n<p>Berbagai kitab dalam Alkitab mencerminkan gaya sastra dan keterampilan penulisnya masing-masing. Seperti yang akan kita bahas dalam pelajaran pekan depan, nuansa pribadi dan berbagai gaya dari setiap penulis tidak mengurangi pekabaran mereka, karena tidak ada &quot;tingkatan&quot; inspirasi. Beberapa bagian Alkitab jelas lebih relevan dan dapat diterapkan pada kehidupan dan iman kita saat ini daripada bagian lain. Namun, kebenaran ini tidak membuat satu bagian Alkitab lebih diilhami daripada bagian lain.</p>\n<p>Terkadang penulis Alkitab mencatat berbagai pekabaran terilhami yang pertama kali mereka sampaikan secara lisan, oleh mereka sendiri, atau oleh rekan tepercaya. Dalam kitab Ulangan, Musa mencatat pidato-pidato terakhir yang ia sampaikan kepada orang Israel sebelum kematiannya. Keempat Injil mencatat banyak khotbah dan ajaran Yesus selama pelayanan duniawi-Nya.</p>\n<p>Namun, ada contoh di mana para nabi mengutip sumber-sumber yang tidak diilhami (<a class=\"verse\" verse=\"Acts1728,1Cor1533,Titus112\">Kis. 17: 28; 1 Kor. 15: 33; Tit. 1: 12</a>) dan bahkan perkataan Iblis (<a class=\"verse\" verse=\"Gen31-Gen35,Matt41-Matt411\">Kej. 3: 1-5; Mat. 4: 1-11</a>). Kita harus ingat bahwa saat para nabi mencatat perasaan dan keinginan orang lain, mereka juga mengungkapkan reaksi manusiawi mereka sendiri (lihat <a class=\"verse\" verse=\"Dan827,Rev228-Rev229\">Dan. 8: 27; Why. 22: 8, 9</a>). Lebih jauh lagi, Alkitab menggambarkan banyak contoh baik untuk ditiru, tetapi juga banyak contoh buruk untuk dihindari (<a class=\"verse\" verse=\"1Cor101-1Cor1011\">1 Kor. 10: 1-11</a>). Saat membaca Alkitab, kita harus mengingat bahwa, meskipun tidak ditulis dalam bahasa yang sempurna, Alkitab membawa pekabaran yang tidak mungkin salah yang akan bertahan dalam ujian waktu.</p>\n",
            "verses": {
                "1Cor101-1Cor1011": "<h2>1 Korintus 10:1-11</h2> <sup>1</sup> Aku mau, supaya kamu mengetahui, saudara-saudara, bahwa nenek moyang kita semua berada di bawah perlindungan awan dan bahwa mereka semua telah melintasi laut. <sup>2</sup> Untuk menjadi pengikut Musa mereka semua telah dibaptis dalam awan dan dalam laut. <sup>3</sup> Mereka semua makan makanan rohani yang sama <sup>4</sup> dan mereka semua minum minuman rohani yang sama, sebab mereka minum dari batu karang rohani yang mengikuti mereka, dan batu karang itu ialah Kristus. <sup>5</sup> Tetapi sungguhpun demikian Allah tidak berkenan kepada bagian yang terbesar dari mereka, karena mereka ditewaskan di padang gurun. <sup>6</sup> Semuanya ini telah terjadi sebagai contoh bagi kita untuk memperingatkan kita, supaya jangan kita menginginkan hal-hal yang jahat seperti yang telah mereka perbuat, <sup>7</sup> dan supaya jangan kita menjadi penyembah-penyembah berhala, sama seperti beberapa orang dari mereka, seperti ada tertulis: \"Maka duduklah bangsa itu untuk makan dan minum; kemudian bangunlah mereka dan bersukaria.\" <sup>8</sup> Janganlah kita melakukan percabulan, seperti yang dilakukan oleh beberapa orang dari mereka, sehingga pada satu hari telah tewas dua puluh tiga ribu orang. <sup>9</sup> Dan janganlah kita mencobai Tuhan, seperti yang dilakukan oleh beberapa orang dari mereka, sehingga mereka mati dipagut ular. <sup>10</sup> Dan janganlah bersungut-sungut, seperti yang dilakukan oleh beberapa orang dari mereka, sehingga mereka dibinasakan oleh malaikat maut. <sup>11</sup> Semuanya ini telah menimpa mereka sebagai contoh dan dituliskan untuk menjadi peringatan bagi kita yang hidup pada waktu, di mana zaman akhir telah tiba.",
                "Dan827,Rev228-Rev229": "<h2>Daniel 8:27</h2> <sup>27</sup> Maka aku, Daniel, lelah dan jatuh sakit beberapa hari lamanya; kemudian bangunlah aku dan melakukan pula urusan raja. Dan aku tercengang-cengang tentang penglihatan itu, tetapi tidak memahaminya.\n\n<h2>Wahyu 22:8-9</h2> <sup>8</sup> Dan aku, Yohanes, akulah yang telah mendengar dan melihat semuanya itu. Dan setelah aku mendengar dan melihatnya, aku tersungkur di depan kaki malaikat, yang telah menunjukkan semuanya itu kepadaku, untuk menyembahnya. <sup>9</sup> Tetapi ia berkata kepadaku: \"Jangan berbuat demikian! Aku adalah hamba, sama seperti engkau dan saudara-saudaramu, para nabi dan semua mereka yang menuruti segala perkataan kitab ini. Sembahlah Allah!\"",
                "Gen31-Gen35,Matt41-Matt411": "<h2>Kejadian 3:1-5</h2> <sup>1</sup> Adapun ular ialah yang paling cerdik dari segala binatang di darat yang dijadikan oleh TUHAN Allah. Ular itu berkata kepada perempuan itu: \"Tentulah Allah berfirman: Semua pohon dalam taman ini jangan kamu makan buahnya, bukan?\" <sup>2</sup> Lalu sahut perempuan itu kepada ular itu: \"Buah pohon-pohonan dalam taman ini boleh kami makan, <sup>3</sup> tetapi tentang buah pohon yang ada di tengah-tengah taman, Allah berfirman: Jangan kamu makan ataupun raba buah itu, nanti kamu mati.\" <sup>4</sup> Tetapi ular itu berkata kepada perempuan itu: \"Sekali-kali kamu tidak akan mati, <sup>5</sup> tetapi Allah mengetahui, bahwa pada waktu kamu memakannya matamu akan terbuka, dan kamu akan menjadi seperti Allah, tahu tentang yang baik dan yang jahat.\"\n\n<h2>Matius 4:1-11</h2> <sup>1</sup> Maka Yesus dibawa oleh Roh ke padang gurun untuk dicobai Iblis. <sup>2</sup> Dan setelah berpuasa empat puluh hari dan empat puluh malam, akhirnya laparlah Yesus. <sup>3</sup> Lalu datanglah si pencoba itu dan berkata kepada-Nya: \"Jika Engkau Anak Allah, perintahkanlah supaya batu-batu ini menjadi roti.\" <sup>4</sup> Tetapi Yesus menjawab: \"Ada tertulis: Manusia hidup bukan dari roti saja, tetapi dari setiap firman yang keluar dari mulut Allah.\" <sup>5</sup> Kemudian Iblis membawa-Nya ke Kota Suci dan menempatkan Dia di bubungan Bait Allah, <sup>6</sup> lalu berkata kepada-Nya: \"Jika Engkau Anak Allah, jatuhkanlah diri-Mu ke bawah, sebab ada tertulis: Mengenai Engkau Ia akan memerintahkan malaikat-malaikat-Nya dan mereka akan menatang Engkau di atas tangannya, supaya kaki-Mu jangan terantuk kepada batu.\" <sup>7</sup> Yesus berkata kepadanya: \"Ada pula tertulis: Janganlah engkau mencobai Tuhan, Allahmu!\" <sup>8</sup> Dan Iblis membawa-Nya pula ke atas gunung yang sangat tinggi dan memperlihatkan kepada-Nya semua kerajaan dunia dengan kemegahannya, <sup>9</sup> dan berkata kepada-Nya: \"Semua itu akan kuberikan kepada-Mu, jika Engkau sujud menyembah aku.\" <sup>10</sup> Maka berkatalah Yesus kepadanya: \"Enyahlah, Iblis! Sebab ada tertulis: Engkau harus menyembah Tuhan, Allahmu, dan hanya kepada Dia sajalah engkau berbakti!\" <sup>11</sup> Lalu Iblis meninggalkan Dia, dan lihatlah, malaikat-malaikat datang melayani Yesus.",
                "Acts1728,1Cor1533,Titus112": "<h2>Kisah Rasul-rasul 17:28</h2> <sup>28</sup> Sebab di dalam Dia kita hidup, kita bergerak, kita ada, seperti yang telah juga dikatakan oleh pujangga-pujanggamu: Sebab kita ini dari keturunan Allah juga.\n\n<h2>1 Korintus 15:33</h2> <sup>33</sup> Janganlah kamu sesat: Pergaulan yang buruk merusakkan kebiasaan yang baik.\n\n<h2>Titus 1:12</h2> <sup>12</sup> Seorang dari kalangan mereka, nabi mereka sendiri, pernah berkata: \"Dasar orang Kreta pembohong, binatang buas, pelahap yang malas.\"",
                "Exod1714,John2030-John2031,1Cor1011,Rev119": "<h2>Keluaran 17:14</h2> <sup>14</sup> Kemudian berfirmanlah TUHAN kepada Musa: \"Tuliskanlah semuanya ini dalam sebuah kitab sebagai tanda peringatan, dan ingatkanlah ke telinga Yosua, bahwa Aku akan menghapuskan sama sekali ingatan kepada Amalek dari kolong langit.\"\n\n<h2>Yohanes 20:30-31</h2> <sup>30</sup> Memang masih banyak tanda lain yang dibuat Yesus di depan mata murid-murid-Nya, yang tidak tercatat dalam kitab ini, <sup>31</sup> tetapi semua yang tercantum di sini telah dicatat, supaya kamu percaya, bahwa Yesuslah Mesias, Anak Allah, dan supaya kamu oleh imanmu memperoleh hidup dalam nama-Nya.\n\n<h2>1 Korintus 10:11</h2> <sup>11</sup> Semuanya ini telah menimpa mereka sebagai contoh dan dituliskan untuk menjadi peringatan bagi kita yang hidup pada waktu, di mana zaman akhir telah tiba.\n\n<h2>Wahyu 1:19</h2> <sup>19</sup> Karena itu tuliskanlah apa yang telah kaulihat, baik yang terjadi sekarang maupun yang akan terjadi sesudah ini.",
                "Ps90": "<h2>Mazmur 90</h2> <sup>1</sup> Doa Musa, abdi Allah. Tuhan, Engkaulah tempat perteduhan kami turun-temurun. <sup>2</sup> Sebelum gunung-gunung dilahirkan, dan bumi dan dunia diperanakkan, bahkan dari selama-lamanya sampai selama-lamanya Engkaulah Allah. <sup>3</sup> Engkau mengembalikan manusia kepada debu, dan berkata: \"Kembalilah, hai anak-anak manusia!\" <sup>4</sup> Sebab di mata-Mu seribu tahun sama seperti hari kemarin, apabila berlalu, atau seperti suatu giliran jaga di waktu malam. <sup>5</sup> Engkau menghanyutkan manusia; mereka seperti mimpi, seperti rumput yang bertumbuh, <sup>6</sup> di waktu pagi berkembang dan bertumbuh, di waktu petang lisut dan layu. <sup>7</sup> Sungguh, kami habis lenyap karena murka-Mu, dan karena kehangatan amarah-Mu kami terkejut. <sup>8</sup> Engkau menaruh kesalahan kami di hadapan-Mu, dan dosa kami yang tersembunyi dalam cahaya wajah-Mu. <sup>9</sup> Sungguh, segala hari kami berlalu karena gemas-Mu, kami menghabiskan tahun-tahun kami seperti keluh. <sup>10</sup> Masa hidup kami tujuh puluh tahun dan jika kami kuat, delapan puluh tahun, dan kebanggaannya adalah kesukaran dan penderitaan; sebab berlalunya buru-buru, dan kami melayang lenyap. <sup>11</sup> Siapakah yang mengenal kekuatan murka-Mu dan takut kepada gemas-Mu? <sup>12</sup> Ajarlah kami menghitung hari-hari kami sedemikian, hingga kami beroleh hati yang bijaksana. <sup>13</sup> Kembalilah, ya TUHAN--berapa lama lagi? --dan sayangilah hamba-hamba-Mu! <sup>14</sup> Kenyangkanlah kami di waktu pagi dengan kasih setia-Mu, supaya kami bersorak-sorai dan bersukacita semasa hari-hari kami. <sup>15</sup> Buatlah kami bersukacita seimbang dengan hari-hari Engkau menindas kami, seimbang dengan tahun-tahun kami mengalami celaka. <sup>16</sup> Biarlah kelihatan kepada hamba-hamba-Mu perbuatan-Mu, dan semarak-Mu kepada anak-anak mereka. <sup>17</sup> Kiranya kemurahan Tuhan, Allah kami, atas kami, dan teguhkanlah perbuatan tangan kami, ya, perbuatan tangan kami, teguhkanlah itu.",
                "Exod1714": "<h2>Keluaran 17:14</h2> <sup>14</sup> Kemudian berfirmanlah TUHAN kepada Musa: \"Tuliskanlah semuanya ini dalam sebuah kitab sebagai tanda peringatan, dan ingatkanlah ke telinga Yosua, bahwa Aku akan menghapuskan sama sekali ingatan kepada Amalek dari kolong langit.\""
            }
        },
        {
            "idx": 5,
            "id": "06",
            "title": "Drama, Simbol, dan Perumpamaan",
            "date": "29/10/2026",
            "content": "<p>Alkitab memiliki variasi yang kaya akan gambaran kata dan metafora. Sebagai contoh, seluruh sistem pengorbanan Perjanjian Lama dari mezbah-mezbah bapa leluhur, kemah suci Musa, dan Bait Suci di Yerusalem adalah representasi piktografis dari pengorbanan penebusan Kristus di kayu salib dan keimamatan surgawi-Nya (<a class=\"verse\" verse=\"Heb81-Heb86\">Ibr. 8: 1-6</a>). Dalam nubuatan Daniel, kerajaan dan kekuasaan di dunia diwakili oleh berbagai bagian dari sebuah patung besar (<a class=\"verse\" verse=\"Dan231-Dan245\">Dan. 2: 31-45</a>), berbagai binatang dan tanduk (<a class=\"verse\" verse=\"Dan7-Dan8\">Daniel 7 dan 8</a>), dan dua raja (<a class=\"verse\" verse=\"Dan11\">Daniel 11</a>). Representasi serupa juga muncul dalam kitab Wahyu, seperti dalam kasus dua binatang di pasal 13.</p>\n<p>Dalam ajaran-Nya, Yesus berbicara tentang diri-Nya, misalnya, sebagai Roti Hidup (<a class=\"verse\" verse=\"John635,John641-John658\">Yoh. 6: 35, 41-58</a>), Terang Dunia (<a class=\"verse\" verse=\"John812,John95\">Yoh. 8: 12; Yoh. 9: 5</a>), dan Pokok Anggur yang Benar (<a class=\"verse\" verse=\"John151-John158\">Yoh. 15: 1-8</a>). Dan melalui perumpamaan penabur (<a class=\"verse\" verse=\"Matt131-Matt139,Matt1318-Matt1323\">Mat. 13: 1-9, 18-23</a>) dan beberapa perumpamaan lainnya (<a class=\"verse\" verse=\"Matt1324-Matt1352\">Mat. 13: 24-52</a>, dst.), Yesus mengilustrasikan sifat dan pertumbuhan kerajaan-Nya.</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"Ezek41-Ezek48\">Yehezkiel 4: 1-8</a>. Mengapakah menurut Anda Allah tidak hanya berbicara secara lisan tetapi juga mendramatisasi beberapa pekabaran Nya?</code></p>\n<p>Sebuah dramatisasi yang jelas muncul dalam <a class=\"verse\" verse=\"Ezek41-Ezek48\">Yehezkiel 4: 1-8</a>, di mana Allah meminta nabi itu untuk membuat model miniatur Yerusalem dan membaringkan dirinya, pertama di sisi kirinya selama 390 hari, mewakili kaum Israel, dan kemudian di sisi kanannya selama 40 hari, mewakili kaum Yehuda. Pengalaman visual lainnya adalah pernikahan Hosea yang ditahbiskan secara Ilahi dengan Gomer, seorang pelacur, yang mewakili ketidaksetiaan rohani Israel kepada Allah (<a class=\"verse\" verse=\"Hos12-Hos19\">Hos. 1: 2-9</a>).</p>\n<p>Pengalaman dramatis Yehezkiel dan Hosea tampak cukup mengejutkan saat ini. Namun, itulah intinya: hal-hal itu seharusnya mengejutkan, bukan hanya bagi kita, melainkan juga bagi orang-orang pada masa itu. Pada saat peringatan para nabi ditolak secara terbuka (lihat <a class=\"verse\" verse=\"2Chr3615-2Chr3621\">2 Taw. 36: 15-21</a>), tindakan terakhir belas kasihan Ilahi adalah secara dramatis memperingatkan orang-orang tentang kondisi mereka yang sebenarnya guna memimpin mereka pada pertobatan yang tulus. Presentasi yang dramatis seperti itu tentu seharusnya menunjukkan kepada mereka betapa seriusnya mereka harus menanggapi peringatan Allah kepada mereka.</p>\n<p><code>Jenis dramatisasi apakah yang mungkin dilakukan seseorang hari ini untuk memperingatkan kita tentang, misalnya, menjadi Laodikia? (Lihat <a class=\"verse\" verse=\"Rev314-Rev318\">Why, 3: 14-18</a>).</code></p>\n",
            "verses": {
                "Rev314-Rev318": "<h2>Wahyu 3:14-18</h2> <sup>14</sup> \"Dan tuliskanlah kepada malaikat jemaat di Laodikia: Inilah firman dari Amin, Saksi yang setia dan benar, permulaan dari ciptaan Allah: <sup>15</sup> Aku tahu segala pekerjaanmu: engkau tidak dingin dan tidak panas. Alangkah baiknya jika engkau dingin atau panas! <sup>16</sup> Jadi karena engkau suam-suam kuku, dan tidak dingin atau panas, Aku akan memuntahkan engkau dari mulut-Ku. <sup>17</sup> Karena engkau berkata: Aku kaya dan aku telah memperkayakan diriku dan aku tidak kekurangan apa-apa, dan karena engkau tidak tahu, bahwa engkau melarat, dan malang, miskin, buta dan telanjang, <sup>18</sup> maka Aku menasihatkan engkau, supaya engkau membeli dari pada-Ku emas yang telah dimurnikan dalam api, agar engkau menjadi kaya, dan juga pakaian putih, supaya engkau memakainya, agar jangan kelihatan ketelanjanganmu yang memalukan; dan lagi minyak untuk melumas matamu, supaya engkau dapat melihat.",
                "2Chr3615-2Chr3621": "<h2>2 Tawarikh 36:15-21</h2> <sup>15</sup> Namun TUHAN, Allah nenek moyang mereka, berulang-ulang mengirim pesan melalui utusan-utusan-Nya, karena Ia sayang kepada umat-Nya dan tempat kediaman-Nya. <sup>16</sup> Tetapi mereka mengolok-olok utusan-utusan Allah itu, menghina segala firman-Nya, dan mengejek nabi-nabi-Nya. Oleh sebab itu murka TUHAN bangkit terhadap umat-Nya, sehingga tidak mungkin lagi pemulihan. <sup>17</sup> TUHAN menggerakkan raja orang Kasdim melawan mereka. Raja itu membunuh teruna mereka dengan pedang dalam rumah kudus mereka, dan tidak menyayangkan teruna atau gadis, orang tua atau orang ubanan--semua diserahkan TUHAN ke dalam tangannya. <sup>18</sup> Seluruh perkakas rumah Allah, yang besar dan yang kecil, serta harta benda dari rumah TUHAN, harta benda raja dan harta benda para panglimanya, semuanya dibawanya ke Babel. <sup>19</sup> Mereka membakar rumah Allah, merobohkan tembok Yerusalem dan membakar segala puri dalam kota itu dengan api, sehingga musnahlah segala perabotannya yang indah-indah. <sup>20</sup> Mereka yang masih tinggal dan yang luput dari pedang diangkutnya ke Babel dan mereka menjadi budaknya dan budak anak-anaknya sampai kerajaan Persia berkuasa. <sup>21</sup> Dengan demikian genaplah firman TUHAN yang diucapkan Yeremia, sampai tanah itu pulih dari akibat dilalaikannya tahun-tahun sabatnya, karena tanah itu tandus selama menjalani sabat, hingga genaplah tujuh puluh tahun.",
                "Hos12-Hos19": "<h2>Hosea 1:2-9</h2> <sup>2</sup> Ketika TUHAN mulai berbicara dengan perantaraan Hosea, berfirmanlah Ia kepada Hosea: \"Pergilah, kawinilah seorang perempuan sundal dan peranakkanlah anak-anak sundal, karena negeri ini bersundal hebat dengan membelakangi TUHAN.\" <sup>3</sup> Maka pergilah ia dan mengawini Gomer binti Diblaim, lalu mengandunglah perempuan itu dan melahirkan baginya seorang anak laki-laki. <sup>4</sup> Kemudian berfirmanlah TUHAN kepada Hosea: \"Berilah nama Yizreel kepada anak itu, sebab sedikit waktu lagi maka Aku akan menghukum keluarga Yehu karena hutang darah Yizreel dan Aku akan mengakhiri pemerintahan kaum Israel. <sup>5</sup> Maka pada waktu itu Aku akan mematahkan busur panah Israel di lembah Yizreel.\" <sup>6</sup> Lalu perempuan itu mengandung lagi dan melahirkan seorang anak perempuan. Berfirmanlah TUHAN kepada Hosea: \"Berilah nama Lo-Ruhama kepada anak itu, sebab Aku tidak akan menyayangi lagi kaum Israel, dan sama sekali tidak akan mengampuni mereka. <sup>7</sup> Tetapi Aku akan menyayangi kaum Yehuda dan menyelamatkan mereka demi TUHAN, Allah mereka. Aku akan menyelamatkan mereka bukan dengan panah atau pedang, dengan alat perang atau dengan kuda dan orang-orang berkuda.\" <sup>8</sup> Sesudah menyapih Lo-Ruhama, mengandunglah perempuan itu lagi dan melahirkan seorang anak laki-laki. <sup>9</sup> Lalu berfirmanlah Ia: \"Berilah nama Lo-Ami kepada anak itu, sebab kamu ini bukanlah umat-Ku dan Aku ini bukanlah Allahmu.\"",
                "Ezek41-Ezek48": "<h2>Yehezkiel 4:1-8</h2> <sup>1</sup> \"Engkau, anak manusia, ambillah sebuah batu bata, letakkan di hadapanmu dan ukirlah di atasnya sebuah kota, yaitu Yerusalem. <sup>2</sup> Ukirlah kota itu dalam keadaan terkepung: dirikan sebuah benteng pengepungan, timbun pula tanah menjadi tembok pengepungan, tempatkan perkemahan tentara dan susun alat-alat pendobrak sekeliling kota itu. <sup>3</sup> Lalu ambillah sebidang besi dan dirikanlah itu di antaramu dengan kota itu menjadi dinding besi, kemudian tujukanlah wajahmu ke arah kota itu, sehingga kota itu dalam keadaan terkepung, dan engkaulah yang mengepung dia. Inilah menjadi lambang bagi kaum Israel. <sup>4</sup> Berbaringlah engkau pada sisi kirimu dan Aku akan menanggungkan hukuman kaum Israel atasmu. Berapa hari engkau berbaring demikian, selama itulah engkau menanggung hukuman mereka. <sup>5</sup> Beginilah Aku tentukan bagimu: Berapa tahun hukuman kaum Israel, sekian harilah engkau menanggung hukuman mereka, yaitu tiga ratus sembilan puluh hari. <sup>6</sup> Kalau engkau sudah mengakhiri waktu ini, berbaringlah engkau untuk kedua kalinya, tetapi pada sisi kananmu dan tanggunglah hukuman kaum Yehuda empat puluh hari lamanya; Aku menentukan bagimu satu hari untuk satu tahun. <sup>7</sup> Tujukanlah wajahmu kepada pengepungan Yerusalem dan kepalkanlah tinjumu kepadanya dan bernubuatlah melawan kota itu. <sup>8</sup> Lihat, Aku akan mengikat engkau dengan tali, sehingga engkau tidak dapat berbalik dari sisi yang satu ke sisi yang lain sampai engkau mengakhiri waktu pengepunganmu itu.",
                "Matt1324-Matt1352": "<h2>Matius 13:24-52</h2> <sup>24</sup> Yesus membentangkan suatu perumpamaan lain lagi kepada mereka, kata-Nya: \"Hal Kerajaan Sorga itu seumpama orang yang menaburkan benih yang baik di ladangnya. <sup>25</sup> Tetapi pada waktu semua orang tidur, datanglah musuhnya menaburkan benih lalang di antara gandum itu, lalu pergi. <sup>26</sup> Ketika gandum itu tumbuh dan mulai berbulir, nampak jugalah lalang itu. <sup>27</sup> Maka datanglah hamba-hamba tuan ladang itu kepadanya dan berkata: Tuan, bukankah benih baik, yang tuan taburkan di ladang tuan? Dari manakah lalang itu? <sup>28</sup> Jawab tuan itu: Seorang musuh yang melakukannya. Lalu berkatalah hamba-hamba itu kepadanya: Jadi maukah tuan supaya kami pergi mencabut lalang itu? <sup>29</sup> Tetapi ia berkata: Jangan, sebab mungkin gandum itu ikut tercabut pada waktu kamu mencabut lalang itu. <sup>30</sup> Biarkanlah keduanya tumbuh bersama sampai waktu menuai. Pada waktu itu aku akan berkata kepada para penuai: Kumpulkanlah dahulu lalang itu dan ikatlah berberkas-berkas untuk dibakar; kemudian kumpulkanlah gandum itu ke dalam lumbungku.\" <sup>31</sup> Yesus membentangkan suatu perumpamaan lain lagi kepada mereka, kata-Nya: \"Hal Kerajaan Sorga itu seumpama biji sesawi, yang diambil dan ditaburkan orang di ladangnya. <sup>32</sup> Memang biji itu yang paling kecil dari segala jenis benih, tetapi apabila sudah tumbuh, sesawi itu lebih besar dari pada sayuran yang lain, bahkan menjadi pohon, sehingga burung-burung di udara datang bersarang pada cabang-cabangnya.\" <sup>33</sup> Dan Ia menceriterakan perumpamaan ini juga kepada mereka: \"Hal Kerajaan Sorga itu seumpama ragi yang diambil seorang perempuan dan diadukkan ke dalam tepung terigu tiga sukat sampai khamir seluruhnya.\" <sup>34</sup> Semuanya itu disampaikan Yesus kepada orang banyak dalam perumpamaan, dan tanpa perumpamaan suatupun tidak disampaikan-Nya kepada mereka, <sup>35</sup> supaya genaplah firman yang disampaikan oleh nabi: \"Aku mau membuka mulut-Ku mengatakan perumpamaan, Aku mau mengucapkan hal yang tersembunyi sejak dunia dijadikan.\" <sup>36</sup> Maka Yesuspun meninggalkan orang banyak itu, lalu pulang. Murid-murid-Nya datang dan berkata kepada-Nya: \"Jelaskanlah kepada kami perumpamaan tentang lalang di ladang itu.\" <sup>37</sup> Ia menjawab, kata-Nya: \"Orang yang menaburkan benih baik ialah Anak Manusia; <sup>38</sup> ladang ialah dunia. Benih yang baik itu anak-anak Kerajaan dan lalang anak-anak si jahat. <sup>39</sup> Musuh yang menaburkan benih lalang ialah Iblis. Waktu menuai ialah akhir zaman dan para penuai itu malaikat. <sup>40</sup> Maka seperti lalang itu dikumpulkan dan dibakar dalam api, demikian juga pada akhir zaman. <sup>41</sup> Anak Manusia akan menyuruh malaikat-malaikat-Nya dan mereka akan mengumpulkan segala sesuatu yang menyesatkan dan semua orang yang melakukan kejahatan dari dalam Kerajaan-Nya. <sup>42</sup> Semuanya akan dicampakkan ke dalam dapur api; di sanalah akan terdapat ratapan dan kertakan gigi. <sup>43</sup> Pada waktu itulah orang-orang benar akan bercahaya seperti matahari dalam Kerajaan Bapa mereka. Siapa bertelinga, hendaklah ia mendengar!\" <sup>44</sup> \"Hal Kerajaan Sorga itu seumpama harta yang terpendam di ladang, yang ditemukan orang, lalu dipendamkannya lagi. Oleh sebab sukacitanya pergilah ia menjual seluruh miliknya lalu membeli ladang itu. <sup>45</sup> Demikian pula hal Kerajaan Sorga itu seumpama seorang pedagang yang mencari mutiara yang indah. <sup>46</sup> Setelah ditemukannya mutiara yang sangat berharga, iapun pergi menjual seluruh miliknya lalu membeli mutiara itu.\" <sup>47</sup> \"Demikian pula hal Kerajaan Sorga itu seumpama pukat yang dilabuhkan di laut, lalu mengumpulkan berbagai-bagai jenis ikan. <sup>48</sup> Setelah penuh, pukat itupun diseret orang ke pantai, lalu duduklah mereka dan mengumpulkan ikan yang baik ke dalam pasu dan ikan yang tidak baik mereka buang. <sup>49</sup> Demikianlah juga pada akhir zaman: Malaikat-malaikat akan datang memisahkan orang jahat dari orang benar, <sup>50</sup> lalu mencampakkan orang jahat ke dalam dapur api; di sanalah akan terdapat ratapan dan kertakan gigi. <sup>51</sup> Mengertikah kamu semuanya itu?\" Mereka menjawab: \"Ya, kami mengerti.\" <sup>52</sup> Maka berkatalah Yesus kepada mereka: \"Karena itu setiap ahli Taurat yang menerima pelajaran dari hal Kerajaan Sorga itu seumpama tuan rumah yang mengeluarkan harta yang baru dan yang lama dari perbendaharaannya.\"",
                "Matt131-Matt139,Matt1318-Matt1323": "<h2>Matius 13:1-9</h2> <sup>1</sup> Pada hari itu keluarlah Yesus dari rumah itu dan duduk di tepi danau. <sup>2</sup> Maka datanglah orang banyak berbondong-bondong lalu mengerumuni Dia, sehingga Ia naik ke perahu dan duduk di situ, sedangkan orang banyak semuanya berdiri di pantai. <sup>3</sup> Dan Ia mengucapkan banyak hal dalam perumpamaan kepada mereka. Kata-Nya: \"Adalah seorang penabur keluar untuk menabur. <sup>4</sup> Pada waktu ia menabur, sebagian benih itu jatuh di pinggir jalan, lalu datanglah burung dan memakannya sampai habis. <sup>5</sup> Sebagian jatuh di tanah yang berbatu-batu, yang tidak banyak tanahnya, lalu benih itupun segera tumbuh, karena tanahnya tipis. <sup>6</sup> Tetapi sesudah matahari terbit, layulah ia dan menjadi kering karena tidak berakar. <sup>7</sup> Sebagian lagi jatuh di tengah semak duri, lalu makin besarlah semak itu dan menghimpitnya sampai mati. <sup>8</sup> Dan sebagian jatuh di tanah yang baik lalu berbuah: ada yang seratus kali lipat, ada yang enam puluh kali lipat, ada yang tiga puluh kali lipat. <sup>9</sup> Siapa bertelinga, hendaklah ia mendengar!\"\n\n<h2>Matius 13:18-23</h2> <sup>18</sup> Karena itu, dengarlah arti perumpamaan penabur itu. <sup>19</sup> Kepada setiap orang yang mendengar firman tentang Kerajaan Sorga, tetapi tidak mengertinya, datanglah si jahat dan merampas yang ditaburkan dalam hati orang itu; itulah benih yang ditaburkan di pinggir jalan. <sup>20</sup> Benih yang ditaburkan di tanah yang berbatu-batu ialah orang yang mendengar firman itu dan segera menerimanya dengan gembira. <sup>21</sup> Tetapi ia tidak berakar dan tahan sebentar saja. Apabila datang penindasan atau penganiayaan karena firman itu, orang itupun segera murtad. <sup>22</sup> Yang ditaburkan di tengah semak duri ialah orang yang mendengar firman itu, lalu kekuatiran dunia ini dan tipu daya kekayaan menghimpit firman itu sehingga tidak berbuah. <sup>23</sup> Yang ditaburkan di tanah yang baik ialah orang yang mendengar firman itu dan mengerti, dan karena itu ia berbuah, ada yang seratus kali lipat, ada yang enam puluh kali lipat, ada yang tiga puluh kali lipat.\"",
                "John151-John158": "<h2>Yohanes 15:1-8</h2> <sup>1</sup> \"Akulah pokok anggur yang benar dan Bapa-Kulah pengusahanya. <sup>2</sup> Setiap ranting pada-Ku yang tidak berbuah, dipotong-Nya dan setiap ranting yang berbuah, dibersihkan-Nya, supaya ia lebih banyak berbuah. <sup>3</sup> Kamu memang sudah bersih karena firman yang telah Kukatakan kepadamu. <sup>4</sup> Tinggallah di dalam Aku dan Aku di dalam kamu. Sama seperti ranting tidak dapat berbuah dari dirinya sendiri, kalau ia tidak tinggal pada pokok anggur, demikian juga kamu tidak berbuah, jikalau kamu tidak tinggal di dalam Aku. <sup>5</sup> Akulah pokok anggur dan kamulah ranting-rantingnya. Barangsiapa tinggal di dalam Aku dan Aku di dalam dia, ia berbuah banyak, sebab di luar Aku kamu tidak dapat berbuat apa-apa. <sup>6</sup> Barangsiapa tidak tinggal di dalam Aku, ia dibuang ke luar seperti ranting dan menjadi kering, kemudian dikumpulkan orang dan dicampakkan ke dalam api lalu dibakar. <sup>7</sup> Jikalau kamu tinggal di dalam Aku dan firman-Ku tinggal di dalam kamu, mintalah apa saja yang kamu kehendaki, dan kamu akan menerimanya. <sup>8</sup> Dalam hal inilah Bapa-Ku dipermuliakan, yaitu jika kamu berbuah banyak dan dengan demikian kamu adalah murid-murid-Ku.\"",
                "John812,John95": "<h2>Yohanes 8:12</h2> <sup>12</sup> Maka Yesus berkata pula kepada orang banyak, kata-Nya: \"Akulah terang dunia; barangsiapa mengikut Aku, ia tidak akan berjalan dalam kegelapan, melainkan ia akan mempunyai terang hidup.\"\n\n<h2>Yohanes 9:5</h2> <sup>5</sup> Selama Aku di dalam dunia, Akulah terang dunia.\"",
                "John635,John641-John658": "<h2>Yohanes 6:35</h2> <sup>35</sup> Kata Yesus kepada mereka: \"Akulah roti hidup; barangsiapa datang kepada-Ku, ia tidak akan lapar lagi, dan barangsiapa percaya kepada-Ku, ia tidak akan haus lagi.\n\n<h2>Yohanes 6:41-58</h2> <sup>41</sup> Maka bersungut-sungutlah orang Yahudi tentang Dia, karena Ia telah mengatakan: \"Akulah roti yang telah turun dari sorga.\" <sup>42</sup> Kata mereka: \"Bukankah Ia ini Yesus, anak Yusuf, yang ibu bapanya kita kenal? Bagaimana Ia dapat berkata: Aku telah turun dari sorga?\" <sup>43</sup> Jawab Yesus kepada mereka: \"Jangan kamu bersungut-sungut. <sup>44</sup> Tidak ada seorangpun yang dapat datang kepada-Ku, jikalau ia tidak ditarik oleh Bapa yang mengutus Aku, dan ia akan Kubangkitkan pada akhir zaman. <sup>45</sup> Ada tertulis dalam kitab nabi-nabi: Dan mereka semua akan diajar oleh Allah. Dan setiap orang, yang telah mendengar dan menerima pengajaran dari Bapa, datang kepada-Ku. <sup>46</sup> Hal itu tidak berarti, bahwa ada orang yang telah melihat Bapa. Hanya Dia yang datang dari Allah, Dialah yang telah melihat Bapa. <sup>47</sup> Aku berkata kepadamu: Sesungguhnya barangsiapa percaya, ia mempunyai hidup yang kekal. <sup>48</sup> Akulah roti hidup. <sup>49</sup> Nenek moyangmu telah makan manna di padang gurun dan mereka telah mati. <sup>50</sup> Inilah roti yang turun dari sorga: Barangsiapa makan dari padanya, ia tidak akan mati. <sup>51</sup> Akulah roti hidup yang telah turun dari sorga. Jikalau seorang makan dari roti ini, ia akan hidup selama-lamanya, dan roti yang Kuberikan itu ialah daging-Ku, yang akan Kuberikan untuk hidup dunia.\" <sup>52</sup> Orang-orang Yahudi bertengkar antara sesama mereka dan berkata: \"Bagaimana Ia ini dapat memberikan daging-Nya kepada kita untuk dimakan.\" <sup>53</sup> Maka kata Yesus kepada mereka: \"Aku berkata kepadamu, sesungguhnya jikalau kamu tidak makan daging Anak Manusia dan minum darah-Nya, kamu tidak mempunyai hidup di dalam dirimu. <sup>54</sup> Barangsiapa makan daging-Ku dan minum darah-Ku, ia mempunyai hidup yang kekal dan Aku akan membangkitkan dia pada akhir zaman. <sup>55</sup> Sebab daging-Ku adalah benar-benar makanan dan darah-Ku adalah benar-benar minuman. <sup>56</sup> Barangsiapa makan daging-Ku dan minum darah-Ku, ia tinggal di dalam Aku dan Aku di dalam dia. <sup>57</sup> Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, akan hidup oleh Aku. <sup>58</sup> Inilah roti yang telah turun dari sorga, bukan roti seperti yang dimakan nenek moyangmu dan mereka telah mati. Barangsiapa makan roti ini, ia akan hidup selama-lamanya.\"",
                "Dan11": "<h2>Daniel 11</h2> <sup>1</sup> seperti dahulu aku juga mendampinginya untuk menguatkan dan menyokongnya, yakni pada tahun pertama pemerintahan Darius, orang Media itu.\" <sup>2</sup> \"Oleh sebab itu, aku akan memberitahukan kepadamu hal yang benar. Sesungguhnya, tiga raja lagi akan muncul di negeri Persia, dan yang keempat akan mendapat kekayaan yang lebih besar dari mereka semua, dan apabila ia telah menjadi kuat karena kekayaannya, ia akan berusaha sekuat-kuatnya untuk melawan kerajaan Yunani. <sup>3</sup> Kemudian akan muncul seorang raja yang gagah perkasa, yang akan memerintah dengan kekuasaan yang besar dan akan berbuat sekehendaknya. <sup>4</sup> Tetapi baru saja ia muncul, maka kerajaannya akan pecah dan terbagi-bagi menurut keempat mata angin dari langit, jatuh bukan kepada keturunannya, dan tanpa kekuasaan seperti yang dipunyainya; sebab kerajaannya akan runtuh dan menjadi milik orang-orang yang lain dari pada orang-orang ini. <sup>5</sup> Maka raja negeri Selatan akan menjadi kuat; tetapi salah seorang dari panglima-panglimanya akan menjadi lebih kuat dari padanya dan orang ini memerintah, lalu kekuasaannya akan menjadi kekuasaan yang besar. <sup>6</sup> Beberapa tahun kemudian keduanya akan bersekutu: puteri raja negeri Selatan akan datang kepada raja negeri Utara untuk mengadakan persetujuan. Tetapi puteri itu tidak berhasil, juga keturunannya tidak dapat bertahan: puteri itu akan diserahkan, demikian pula orang-orang yang mengantarnya, anak yang dilahirkannya dan orang yang mengawininya. <sup>7</sup> Dan pada waktu itu akan tumbuh suatu tunas yang seakar dengan puteri itu menggantikan orang itu, dan orang ini akan bergerak maju melawan tentara raja negeri Utara dan memasuki kota bentengnya, dan ia akan bertindak terhadap mereka dan ia akan berkuasa. <sup>8</sup> Bahkan dewa-dewa mereka dan patung-patung tuangan mereka dan barang-barang mereka yang berharga dari perak dan emas akan diangkutnya sebagai jarahan ke Mesir, lalu beberapa tahun lamanya ia akan berhenti berperang melawan raja negeri Utara. <sup>9</sup> Kemudian raja ini akan memasuki kerajaan raja negeri Selatan, tetapi kemudian pulang ke negerinya sendiri. <sup>10</sup> Kemudian anak-anaknya akan bersiap untuk berperang, dan akan mengerahkan sejumlah tentara yang besar, lalu salah seorang dari mereka itu akan bergerak maju melawan dia, menggenangi dan meliputi semuanya seperti air bah; dan pada serbuan yang kedua kalinya ia akan sampai ke benteng musuhnya. <sup>11</sup> Maka menggeramlah raja negeri Selatan itu, lalu maju berperang melawan raja negeri Utara, yang telah mengerahkan sejumlah tentara besar, dan tentara besar itu akan jatuh ke tangan musuhnya. <sup>12</sup> Setelah tentara besar itu dihancurkannya, maka hatinya akan bermegah; walaupun ia telah menewaskan berlaksa-laksa orang, ia tidak akan mempunyai kekuatan. <sup>13</sup> Lalu untuk kedua kalinya raja negeri Utara itu akan mengerahkan sejumlah tentara besar, lebih besar dari yang pertama, dan beberapa tahun kemudian, ia akan bergerak maju melawan dia dengan tentara yang besar dan dengan banyak perlengkapan perang. <sup>14</sup> Pada waktu itu banyak orang akan bangkit melawan raja negeri Selatan; juga orang-orang yang lalim dari bangsamu akan membesarkan diri, sehingga penglihatan itu menjadi kenyataan, tetapi mereka akan tergelincir. <sup>15</sup> Maka raja negeri Utara itu akan datang, mendirikan kubu pengepungan dan merebut kota yang berbenteng; dan tentara negeri Selatan tidak akan dapat bertahan, juga pasukan-pasukan pilihannya sekalipun, ya, tidak ada kekuatan apapun yang dapat bertahan, <sup>16</sup> sehingga raja yang menyerangnya akan berbuat sekehendak hati, dan tidak ada seorangpun yang dapat bertahan menghadapinya; ia akan menduduki Tanah Permai dan seluruhnya akan ada dalam kekuasaannya. <sup>17</sup> Kemudian ia akan berusaha untuk menguasai seluruh kerajaan orang yang lain itu: ia akan mengadakan persetujuan dengan dia, dan seorang puterinya diberikannya kepadanya untuk menghancurkan kerajaan itu, tetapi maksudnya itu tidak akan berhasil dan tidak akan menguntungkannya. <sup>18</sup> Lalu ia akan memalingkan mukanya ke tanah-tanah pesisir dan banyak yang direbutnya; tetapi seorang panglima akan menghentikan penghinaannya itu, bahkan akan mengembalikan penghinaan itu kepadanya. <sup>19</sup> Sesudah itu ia akan memalingkan mukanya ke kota-kota benteng di negerinya sendiri; tetapi ia akan tergelincir dan jatuh dan tidak akan ditemukan lagi. <sup>20</sup> Menggantikan dia akan muncul seorang yang menyuruh seorang pemungut pajak menjalani bagian yang terindah dari kerajaan itu, tetapi beberapa hari kemudian ia akan dibinasakan, bukan oleh kemarahan atau oleh peperangan. <sup>21</sup> Menggantikan dia akan muncul seorang yang hina, yang tidak memperoleh martabat raja; tetapi dengan tak disangka-sangka ia akan datang merebut kedudukan raja dengan perbuatan-perbuatan licin. <sup>22</sup> Seluruh tentara yang datang melanda akan dihanyutkan di hadapannya dan dihancurkan, bahkan juga seorang raja Perjanjian. <sup>23</sup> Dan dari saat diadakan persekutuan dengan dia, ia akan berlaku curang, dan ia akan maju serta menjadi berkuasa, meskipun sedikit orang-orangnya. <sup>24</sup> Dengan tak disangka-sangka ia akan memasuki daerah-daerah yang paling subur dari negeri itu, dan melakukan apa yang belum pernah dilakukan oleh para bapa dan nenek moyangnya, yakni menghamburkan rampasan dan jarahan dan harta di antara orang-orangnya; juga terhadap tempat-tempat yang berbenteng ia membuat siasat, tetapi hanya untuk sementara waktu. <sup>25</sup> Kekuatan dan keberaniannya akan ditujukannya melawan raja negeri Selatan dengan memakai tentara yang besar; dan walaupun raja negeri Selatan itu akan bersiap untuk berperang dengan tentara yang amat besar dan kuat, ia tidak akan dapat bertahan, sebab akan diadakan siasat terhadap dia, <sup>26</sup> dan orang-orang yang makan dari santapannya akan meruntuhkannya: tentaranya akan hanyut dan banyak orangnya yang tewas dibunuh. <sup>27</sup> Dan kedua raja itu bermaksud jahat, dan sedang mereka duduk bersama-sama pada satu meja, mereka akan saling membohongi; tetapi hal itu tidak akan berhasil, sebab akhir zaman itu belum mencapai waktu yang ditetapkan. <sup>28</sup> Kemudian ia akan pulang ke negerinya dengan banyak harta, dan hatinya bermaksud menentang Perjanjian Kudus; dan itu dilakukannya, lalu pulang ke negerinya. <sup>29</sup> Pada waktu yang ditetapkan ia akan memasuki pula negeri Selatan, tetapi kali yang kedua ini tidak akan sama dengan yang pertama, <sup>30</sup> karena akan datang kapal-kapal orang Kitim melawan dia, sehingga hilanglah keberaniannya. Lalu pulanglah ia dengan hati mendendam terhadap Perjanjian Kudus dan ia akan bertindak: setelah pulang kembali, ia akan menujukan perhatiannya kepada mereka yang meninggalkan Perjanjian Kudus. <sup>31</sup> Tentaranya akan muncul, mereka akan menajiskan tempat kudus, benteng itu, menghapuskan korban sehari-hari dan menegakkan kekejian yang membinasakan. <sup>32</sup> Dan orang-orang yang berlaku fasik terhadap Perjanjian akan dibujuknya sampai murtad dengan kata-kata licin; tetapi umat yang mengenal Allahnya akan tetap kuat dan akan bertindak. <sup>33</sup> Dan orang-orang bijaksana di antara umat itu akan membuat banyak orang mengerti, tetapi untuk beberapa waktu lamanya mereka akan jatuh oleh karena pedang dan api, oleh karena ditawan dan dirampas. <sup>34</sup> Sementara jatuh, mereka akan mendapat pertolongan sedikit, dan banyak orang akan menggabungkan diri kepada mereka secara berpura-pura. <sup>35</sup> Sebagian dari orang-orang bijaksana itu akan jatuh, supaya dengan demikian diadakan pengujian, penyaringan dan pemurnian di antara mereka, sampai pada akhir zaman; sebab akhir zaman itu belum mencapai waktu yang telah ditetapkan. <sup>36</sup> Raja itu akan berbuat sekehendak hati; ia akan meninggikan dan membesarkan dirinya terhadap setiap allah. Juga terhadap Allah yang mengatasi segala allah ia akan mengucapkan kata-kata yang tak senonoh sama sekali, dan ia akan beruntung sampai akhir murka itu; sebab apa yang telah ditetapkan akan terjadi. <sup>37</sup> Juga para allah nenek moyangnya tidak akan diindahkannya; baik pujaan orang-orang perempuan maupun allah manapun juga tidak akan diindahkannya, sebab terhadap semuanya itu ia akan membesarkan diri. <sup>38</sup> Tetapi sebagai ganti semuanya itu ia akan menghormati dewa benteng-benteng: dewa yang tidak dikenal oleh nenek moyangnya akan dihormatinya dengan membawa emas dan perak dan permata dan barang-barang yang berharga. <sup>39</sup> Dan ia akan bertindak terhadap benteng-benteng yang diperkuat dengan pertolongan dewa asing itu. Siapa yang mengakui dewa ini akan dilimpahi kehormatan; ia akan membuat mereka menjadi berkuasa atas banyak orang dan kepada mereka akan dibagikannya tanah sebagai upah. <sup>40</sup> Tetapi pada akhir zaman raja negeri Selatan akan berperang dengan dia, dan raja negeri Utara itu akan menyerbunya dengan kereta dan orang-orang berkuda dan dengan banyak kapal; dan ia akan memasuki negeri-negeri, dan menggenangi dan meliputi semuanya seperti air bah. <sup>41</sup> Juga Tanah Permai akan dimasukinya, dan banyak orang akan jatuh; tetapi dari tangannya akan terluput tanah Edom, tanah Moab dan bagian yang penting dari bani Amon. <sup>42</sup> Ia akan menjangkau negeri-negeri, dan negeri Mesir tidak akan terluput. <sup>43</sup> Ia akan menguasai harta benda emas dan perak dan segala barang berharga negeri Mesir, dan orang Libia serta orang Etiopia akan mengikuti dia. <sup>44</sup> Tetapi kabar-kabar dari sebelah timur dan dari sebelah utara akan mengejutkan hatinya, sehingga ia akan keluar dengan kegeraman yang besar untuk memusnahkan dan membinasakan banyak orang. <sup>45</sup> Ia akan mendirikan kemah kebesarannya di antara laut dan gunung Permai yang kudus itu, tetapi kemudian ia akan menemui ajalnya dan tidak ada seorangpun yang menolongnya.\"",
                "Dan7-Dan8": "<h2>Daniel 7</h2> <sup>1</sup> Pada tahun pertama pemerintahan Belsyazar, raja Babel, bermimpilah Daniel dan mendapat penglihatan-penglihatan di tempat tidurnya. Lalu dituliskannya mimpi itu, dan inilah garis besarnya: <sup>2</sup> Berkatalah Daniel, demikian: \"Pada malam hari aku mendapat penglihatan, tampak keempat angin dari langit mengguncangkan laut besar, <sup>3</sup> dan empat binatang besar naik dari dalam laut, yang satu berbeda dengan yang lain. <sup>4</sup> Yang pertama rupanya seperti seekor singa, dan mempunyai sayap burung rajawali; aku terus melihatnya sampai sayapnya tercabut dan ia terangkat dari tanah dan ditegakkan pada dua kaki seperti manusia, dan kepadanya diberikan hati manusia. <sup>5</sup> Dan tampak ada seekor binatang yang lain, yang kedua, rupanya seperti beruang; ia berdiri pada sisinya yang sebelah, dan tiga tulang rusuk masih ada di dalam mulutnya di antara giginya. Dan demikianlah dikatakan kepadanya: Ayo, makanlah daging banyak-banyak. <sup>6</sup> Kemudian aku melihat, tampak seekor binatang yang lain, rupanya seperti macan tutul; ada empat sayap burung pada punggungnya, lagipula binatang itu berkepala empat, dan kepadanya diberikan kekuasaan. <sup>7</sup> Kemudian aku melihat dalam penglihatan malam itu, tampak seekor binatang yang keempat, yang menakutkan dan mendahsyatkan, dan ia sangat kuat. Ia bergigi besar dari besi; ia melahap dan meremukkan, dan sisanya diinjak-injaknya dengan kakinya; ia berbeda dengan segala binatang yang terdahulu; lagipula ia bertanduk sepuluh. <sup>8</sup> Sementara aku memperhatikan tanduk-tanduk itu, tampak tumbuh di antaranya suatu tanduk lain yang kecil, sehingga tiga dari tanduk-tanduk yang dahulu itu tercabut; dan pada tanduk itu tampak ada mata seperti mata manusia dan mulut yang menyombong. <sup>9</sup> Sementara aku terus melihat, takhta-takhta diletakkan, lalu duduklah Yang Lanjut Usianya; pakaian-Nya putih seperti salju dan rambut-Nya bersih seperti bulu domba; kursi-Nya dari nyala api dengan roda-rodanya dari api yang berkobar-kobar; <sup>10</sup> suatu sungai api timbul dan mengalir dari hadapan-Nya; seribu kali beribu-ribu melayani Dia, dan selaksa kali berlaksa-laksa berdiri di hadapan-Nya. Lalu duduklah Majelis Pengadilan dan dibukalah Kitab-kitab. <sup>11</sup> Aku terus melihatnya, karena perkataan sombong yang diucapkan tanduk itu; aku terus melihatnya, sampai binatang itu dibunuh, tubuhnya dibinasakan dan diserahkan ke dalam api yang membakar. <sup>12</sup> Juga kekuasaan binatang-binatang yang lain dicabut, dan jangka hidup mereka ditentukan sampai pada waktu dan saatnya. <sup>13</sup> Aku terus melihat dalam penglihatan malam itu, tampak datang dengan awan-awan dari langit seorang seperti anak manusia; datanglah ia kepada Yang Lanjut Usianya itu, dan ia dibawa ke hadapan-Nya. <sup>14</sup> Lalu diberikan kepadanya kekuasaan dan kemuliaan dan kekuasaan sebagai raja, maka orang-orang dari segala bangsa, suku bangsa dan bahasa mengabdi kepadanya. Kekuasaannya ialah kekuasaan yang kekal, yang tidak akan lenyap, dan kerajaannya ialah kerajaan yang tidak akan musnah. <sup>15</sup> Maka aku, Daniel, terharu karena hal itu, dan penglihatan-penglihatan yang kulihat itu menggelisahkan aku. <sup>16</sup> Lalu kudekati salah seorang dari mereka yang berdiri di sana dan kuminta penjelasan tentang semuanya itu. Maka berkatalah ia kepadaku dan diberitahukannyalah kepadaku maknanya: <sup>17</sup> Binatang-binatang besar yang empat ekor itu ialah empat raja yang akan muncul dari dalam bumi; <sup>18</sup> sesudah itu orang-orang kudus milik Yang Mahatinggi akan menerima pemerintahan, dan mereka akan memegang pemerintahan itu sampai selama-lamanya, bahkan kekal selama-lamanya. <sup>19</sup> Lalu aku ingin mendapat penjelasan tentang binatang yang keempat itu, yang berbeda dengan segala binatang yang lain, yang sangat menakutkan, dengan gigi besinya dan kuku tembaganya, yang melahap dan meremukkan dan menginjak-injak sisanya dengan kakinya; <sup>20</sup> dan tentang kesepuluh tanduk yang ada pada kepalanya, dan tentang tanduk yang lain, yakni tanduk yang mempunyai mata dan yang mempunyai mulut yang menyombong, yang tumbuh sehingga patahlah tiga tanduk, dan yang lebih besar rupanya dari tanduk-tanduk yang lain. <sup>21</sup> Dan aku melihat tanduk itu berperang melawan orang-orang kudus dan mengalahkan mereka, <sup>22</sup> sampai Yang Lanjut Usianya itu datang dan keadilan diberikan kepada orang-orang kudus milik Yang Mahatinggi dan waktunya datang orang-orang kudus itu memegang pemerintahan. <sup>23</sup> Maka demikianlah katanya: Binatang yang keempat itu ialah kerajaan yang keempat yang akan ada di bumi, yang akan berbeda dengan segala kerajaan dan akan menelan seluruh bumi, menginjak-injaknya dan meremukkannya. <sup>24</sup> Kesepuluh tanduk itu ialah kesepuluh raja yang muncul dari kerajaan itu. Sesudah mereka, akan muncul seorang raja; dia berbeda dengan raja-raja yang dahulu dan akan merendahkan tiga raja. <sup>25</sup> Ia akan mengucapkan perkataan yang menentang Yang Mahatinggi, dan akan menganiaya orang-orang kudus milik Yang Mahatinggi; ia berusaha untuk mengubah waktu dan hukum, dan mereka akan diserahkan ke dalam tangannya selama satu masa dan dua masa dan setengah masa. <sup>26</sup> Lalu Majelis Pengadilan akan duduk, dan kekuasaan akan dicabut dari padanya untuk dimusnahkan dan dihancurkan sampai lenyap. <sup>27</sup> Maka pemerintahan, kekuasaan dan kebesaran dari kerajaan-kerajaan di bawah semesta langit akan diberikan kepada orang-orang kudus, umat Yang Mahatinggi: pemerintahan mereka adalah pemerintahan yang kekal, dan segala kekuasaan akan mengabdi dan patuh kepada mereka. <sup>28</sup> Sekianlah berita itu. Adapun aku, Daniel, pikiran-pikiranku sangat menggelisahkan aku, sehingga aku menjadi pucat; dan aku menyimpan hal itu dalam ingatanku.\"<h2>Daniel 8</h2> <sup>1</sup> Pada tahun yang ketiga pemerintahan raja Belsyazar, nampaklah kepadaku, Daniel, suatu penglihatan sesudah yang tampak kepadaku dahulu itu. <sup>2</sup> Aku melihat dalam penglihatan itu, dan sementara aku melihat, aku berada di puri Susan, yang ada di wilayah Elam, dan aku melihat dalam penglihatan itu, bahwa aku sedang di tepi sungai Ulai. <sup>3</sup> Aku mengangkat mukaku dan melihat, tampak seekor domba jantan berdiri di depan sungai itu; tanduknya dua dan kedua tanduk itu tinggi, tetapi yang satu lebih tinggi dari yang lain, dan yang tinggi itu tumbuh terakhir. <sup>4</sup> Aku melihat domba jantan itu menanduk ke barat, ke utara dan ke selatan, dan tidak ada seekor binatangpun yang tahan menghadapi dia, dan tidak ada yang dapat membebaskan dari kuasanya; ia berbuat sekehendak hatinya dan membesarkan diri. <sup>5</sup> Tetapi sementara aku memperhatikannya, tampak seekor kambing jantan datang dari sebelah barat, yang melintasi seluruh bumi tanpa menginjak tanah; dan kambing jantan itu mempunyai satu tanduk yang aneh di antara kedua matanya. <sup>6</sup> Ia datang pada domba jantan yang dua tanduknya dan yang kulihat berdiri di depan sungai itu, lalu menyerangnya dengan keganasan yang hebat. <sup>7</sup> Aku melihatnya mendekati domba jantan itu; ia menggeram, lalu ditanduknya domba jantan itu, dipatahkannya kedua tanduknya, dan domba jantan itu tidak berdaya untuk tahan menghadapi dia; dihempaskannya dia ke bumi, diinjak-injaknya, dan tidak ada yang melepaskan domba jantan itu dari kuasanya. <sup>8</sup> Kambing jantan itu sangat membesarkan dirinya, tetapi ketika ia sampai pada puncak kuasanya, patahlah tanduk yang besar itu, lalu pada tempatnya tumbuh empat tanduk yang aneh, sejajar dengan keempat mata angin yang dari langit. <sup>9</sup> Maka dari salah satu tanduk itu muncul suatu tanduk kecil, yang menjadi sangat besar ke arah selatan, ke arah timur dan ke arah Tanah Permai. <sup>10</sup> Ia menjadi besar, bahkan sampai kepada bala tentara langit, dan dari bala tentara itu, dari bintang-bintang, dijatuhkannya beberapa ke bumi, dan diinjak-injaknya. <sup>11</sup> Bahkan terhadap Panglima bala tentara itupun ia membesarkan dirinya, dan dari pada-Nya diambilnya korban persembahan sehari-hari, dan tempat-Nya yang kudus dirobohkannya. <sup>12</sup> Suatu kebaktian diadakan secara fasik menggantikan korban sehari-hari, kebenaran dihempaskannya ke bumi, dan apapun yang dibuatnya, semuanya berhasil. <sup>13</sup> Kemudian kudengar seorang kudus berbicara, dan seorang kudus lain berkata kepada yang berbicara itu: \"Sampai berapa lama berlaku penglihatan ini, yakni korban sehari-hari dan kefasikan yang membinasakan, tempat kudus yang diserahkan dan bala tentara yang diinjak-injak?\" <sup>14</sup> Maka ia menjawab: \"Sampai lewat dua ribu tiga ratus petang dan pagi, lalu tempat kudus itu akan dipulihkan dalam keadaan yang wajar.\" <sup>15</sup> Sedang aku, Daniel, melihat penglihatan itu dan berusaha memahaminya, maka tampaklah seorang berdiri di depanku, yang rupanya seperti seorang laki-laki; <sup>16</sup> dan aku mendengar dari tengah sungai Ulai itu suara manusia yang berseru: \"Gabriel, buatlah orang ini memahami penglihatan itu!\" <sup>17</sup> Lalu datanglah ia ke tempat aku berdiri, dan ketika ia datang, terkejutlah aku dan jatuh tertelungkup, lalu ia berkata kepadaku: \"Pahamilah, anak manusia, bahwa penglihatan itu mengenai akhir masa!\" <sup>18</sup> Sementara ia berbicara dengan aku, jatuh pingsanlah aku tertelungkup ke tanah; tetapi ia menyentuh aku dan membuat aku berdiri kembali. <sup>19</sup> Lalu berkatalah ia: \"Kuberitahukan kepadamu apa yang akan terjadi pada akhir murka ini, sebab hal itu mengenai akhir zaman. <sup>20</sup> Domba jantan yang kaulihat itu, dengan kedua tanduknya, ialah raja-raja orang Media dan Persia. <sup>21</sup> Dan kambing jantan yang berbulu kesat itu ialah raja negeri Yunani, dan tanduk besar yang di antara kedua matanya itu ialah raja yang pertama. <sup>22</sup> Dan bahwa tanduk itu patah dan pada tempatnya itu muncul empat buah, berarti: empat kerajaan akan muncul dari bangsa itu, tetapi tidak sekuat yang terdahulu. <sup>23</sup> Dan pada akhir kerajaan mereka, apabila orang-orang fasik telah penuh kejahatannya, maka akan muncul seorang raja dengan muka yang garang dan yang pandai menipu. <sup>24</sup> Kekuatannya akan menjadi hebat, tetapi tidak sekuat yang terdahulu, dan ia akan mendatangkan kebinasaan yang mengerikan, dan apa yang dilakukannya akan berhasil; orang-orang berkuasa akan dibinasakannya, juga umat orang kudus. <sup>25</sup> Dan oleh karena akalnya, penipuan yang dilakukannya akan berhasil; ia akan membesarkan dirinya dalam hatinya, dan dengan tak disangka-sangka banyak orang akan dibinasakannya; juga ia akan bangkit melawan Raja segala raja. Tetapi tanpa perbuatan tangan manusia, ia akan dihancurkan. <sup>26</sup> Adapun penglihatan tentang petang dan pagi itu, apa yang dikatakan tentang itu adalah benar. Tetapi engkau, sembunyikanlah penglihatan itu, sebab hal itu mengenai masa depan yang masih jauh.\" <sup>27</sup> Maka aku, Daniel, lelah dan jatuh sakit beberapa hari lamanya; kemudian bangunlah aku dan melakukan pula urusan raja. Dan aku tercengang-cengang tentang penglihatan itu, tetapi tidak memahaminya.",
                "Dan231-Dan245": "<h2>Daniel 2:31-45</h2> <sup>31</sup> Ya raja, tuanku melihat suatu penglihatan, yakni sebuah patung yang amat besar! Patung ini tinggi, berkilau-kilauan luar biasa, tegak di hadapan tuanku, dan tampak mendahsyatkan. <sup>32</sup> Adapun patung itu, kepalanya dari emas tua, dada dan lengannya dari perak, perut dan pinggangnya dari tembaga, <sup>33</sup> sedang pahanya dari besi dengan kakinya sebagian dari besi dan sebagian lagi dari tanah liat. <sup>34</sup> Sementara tuanku melihatnya, terungkit lepas sebuah batu tanpa perbuatan tangan manusia, lalu menimpa patung itu, tepat pada kakinya yang dari besi dan tanah liat itu, sehingga remuk. <sup>35</sup> Maka dengan sekaligus diremukkannyalah juga besi, tanah liat, tembaga, perak dan emas itu, dan semuanya menjadi seperti sekam di tempat pengirikan pada musim panas, lalu angin menghembuskannya, sehingga tidak ada bekas-bekasnya yang ditemukan. Tetapi batu yang menimpa patung itu menjadi gunung besar yang memenuhi seluruh bumi. <sup>36</sup> Itulah mimpi tuanku, dan sekarang maknanya akan kami katakan kepada tuanku raja: <sup>37</sup> Ya tuanku raja, raja segala raja, yang kepadanya oleh Allah semesta langit telah diberikan kerajaan, kekuasaan, kekuatan dan kemuliaan, <sup>38</sup> dan yang ke dalam tangannya telah diserahkan-Nya anak-anak manusia, di manapun mereka berada, binatang-binatang di padang dan burung-burung di udara, dan yang dibuat-Nya menjadi kuasa atas semuanya itu--tuankulah kepala yang dari emas itu. <sup>39</sup> Tetapi sesudah tuanku akan muncul suatu kerajaan lain, yang kurang besar dari kerajaan tuanku; kemudian suatu kerajaan lagi, yakni yang ketiga, dari tembaga, yang akan berkuasa atas seluruh bumi. <sup>40</sup> Sesudah itu akan ada suatu kerajaan yang keempat, yang keras seperti besi, tepat seperti besi yang meremukkan dan menghancurkan segala sesuatu; dan seperti besi yang menghancurluluhkan, maka kerajaan ini akan meremukkan dan menghancurluluhkan semuanya. <sup>41</sup> Dan seperti tuanku lihat kaki dan jari-jarinya sebagian dari tanah liat tukang periuk dan sebagian lagi dari besi, itu berarti, bahwa kerajaan itu terbagi; memang kerajaan itu juga keras seperti besi, sesuai dengan yang tuanku lihat besi itu bercampur dengan tanah liat. <sup>42</sup> Tetapi sebagaimana jari-jari kaki itu sebagian dari besi dan sebagian lagi dari tanah liat, demikianlah kerajaan itu akan menjadi keras sebagian dan rapuh sebagian. <sup>43</sup> Seperti tuanku lihat besi bercampur dengan tanah liat, itu berarti: mereka akan bercampur oleh perkawinan, tetapi tidak akan merupakan satu kesatuan, seperti besi tidak dapat bercampur dengan tanah liat. <sup>44</sup> Tetapi pada zaman raja-raja, Allah semesta langit akan mendirikan suatu kerajaan yang tidak akan binasa sampai selama-lamanya, dan kekuasaan tidak akan beralih lagi kepada bangsa lain: kerajaan itu akan meremukkan segala kerajaan dan menghabisinya, tetapi kerajaan itu sendiri akan tetap untuk selama-lamanya, <sup>45</sup> tepat seperti yang tuanku lihat, bahwa tanpa perbuatan tangan manusia sebuah batu terungkit lepas dari gunung dan meremukkan besi, tembaga, tanah liat, perak dan emas itu. Allah yang maha besar telah memberitahukan kepada tuanku raja apa yang akan terjadi di kemudian hari; mimpi itu adalah benar dan maknanya dapat dipercayai.\"",
                "Heb81-Heb86": "<h2>Ibrani 8:1-6</h2> <sup>1</sup> Inti segala yang kita bicarakan itu ialah: kita mempunyai Imam Besar yang demikian, yang duduk di sebelah kanan takhta Yang Mahabesar di sorga, <sup>2</sup> dan yang melayani ibadah di tempat kudus, yaitu di dalam kemah sejati, yang didirikan oleh Tuhan dan bukan oleh manusia. <sup>3</sup> Sebab setiap Imam Besar ditetapkan untuk mempersembahkan korban dan persembahan dan karena itu Yesus perlu mempunyai sesuatu untuk dipersembahkan. <sup>4</sup> Sekiranya Ia di bumi ini, Ia sama sekali tidak akan menjadi imam, karena di sini telah ada orang-orang yang mempersembahkan persembahan menurut hukum Taurat. <sup>5</sup> Pelayanan mereka adalah gambaran dan bayangan dari apa yang ada di sorga, sama seperti yang diberitahukan kepada Musa, ketika ia hendak mendirikan kemah: \"Ingatlah,\" demikian firman-Nya, \"bahwa engkau membuat semuanya itu menurut contoh yang telah ditunjukkan kepadamu di atas gunung itu.\" <sup>6</sup> Tetapi sekarang Ia telah mendapat suatu pelayanan yang jauh lebih agung, karena Ia menjadi Pengantara dari perjanjian yang lebih mulia, yang didasarkan atas janji yang lebih tinggi."
            }
        },
        {
            "idx": 6,
            "id": "07",
            "title": "Ellen G. White tentang Wahyu dan Inspirasi",
            "date": "30/10/2026",
            "content": "<p>Gereja Masehi Advent Hari Ketujuh percaya bahwa Ellen G. White diilhami secara Ilahi. Tulisan, kehidupan, dan pelayanannya memenuhi kriteria nabi yang benar. Ia memiliki kualitas inspirasi yang sama dengan nabi-nabi Alkitab, meskipun ia tidak pernah menganggap tulisannya sama dengan Kitab Suci. Sebaliknya, Ellen G. White selalu meninggikan Alkitab. Namun, bagaimanakah ia sendiri memahami wahyu nubuatan Allah kepadanya dan proses inspirasinya?</p>\n<p>Pertama, Ellen G. White selalu menganggap Alkitab sebagai wahyu Allah yang otoritatif dan tidak mungkin salah. Alkitab mengungkapkan kebenaran Allah dan rencana keselamatan-Nya bagi umat manusia yang telah jatuh. Dalam proses itu, seperti yang sedang kita pelajari, Ia menggunakan para nabi untuk mengomunikasikan berbagai pekabaran-Nya.</p>\n<p>Kedua, Ellen G. White menyadari bahwa proses inspirasi melibatkan interaksi Ilahi-manusia. Allah mengomunikasikan berbagai pekabaran-Nya, tetapi kemudian nabi akan menyampaikan instruksi Ilahi itu menggunakan kata-katanya sendiri. Seperti yang dikatakan Ellen G. White:</p>\n<p>&quot;Bukanlah kata-kata dalam Alkitab yang diilhami, tetapi manusianyalah yang diilhami. Inspirasi tidak bertindak pada kata-kata manusia atau ekspresinya tetapi pada manusia itu sendiri, yang, di bawah pengaruh Roh Kudus, diilhami dengan pikiran. ... Pikiran dan kehendak Ilahi digabungkan dengan pikiran dan kehendak manusia; dengan demikian ucapan manusia adalah firman Allah&quot; —Selected Messages, jld. 1, hlm. 21.</p>\n<p>Sehubungan dengan penglihatan dan mimpi nubuat, Ellen G. White memahami &quot;inspirasi pikiran&quot; sebagai penyatuan wahyu Ilahi dan pengalaman manusia. Ia menulis, &quot;Alkitab, dengan kebenaran-kebenaran yang diberikan Allah yang diungkapkan dalam bahasa manusia, menyajikan penyatuan antara yang Ilahi dan yang insani&quot; (Selected Messages, jld. 1, hlm. 25). Allah menggunakan banyak cara untuk menghasilkan pemahaman tentang pekabaran-Nya dalam pikiran utusan-Nya. Ini termasuk representasi gambar, kata-kata, dan pemikiran yang melibatkan semua indra nabi. Pengalaman Ellen G. White serupa dengan pengalaman para penulis Alkitab.</p>\n<p>Ketiga, Ellen G. White mencatat bahwa tidak semua pengalaman dan komunikasi manusianya diilhami.</p>\n<p>&quot;Ada kalanya hal-hal umum harus dinyatakan,&quot; nasihatnya, &quot;pikiran-pikiran umum harus mengisi pikiran, surat-surat umum harus ditulis dan informasi diberikan yang telah disampaikan dari satu pekerja ke pekerja lainnya. Kata-kata seperti itu, informasi seperti itu, tidak diberikan di bawah inspirasi khusus Roh Allah&quot; —Selected Messages, jld. 1, hlm. 39.</p>\n<p>Penting untuk menyadari perbedaan in saat kita membaca dan menghubungkan dengan tulisan-tulisan dan pengalamannya, khususnya korespondensi dan buku hariannya. Mengetahui pemahaman Ellen G. White tentang wahyu dan inspirasi membantu kita menghindari hal-hal ekstrem dan membaca nasi hat-nasihatnya dengan bijaksana disertai pengertian.</p>\n<p>Untuk mengetahui lebih lanjut, kunjungi <a href=\"https://whiteestate.org/absg/5\">https://whiteestate.org/absg/5</a>.</p>\n",
            "verses": {}
        }
    ]
};

// ============================================================
// RESOLVER & KAMUS ALKITAB DIGITAL LOKAL (OFFLINE-FIRST)
// Memastikan setiap ayat yang diklik PASTI langsung menampilkan firman Tuhan lengkap
// ============================================================
const SS_ALKITAB_BOOK_ALIAS = {
    "kej": 1, "kejadian": 1, "gen": 1, "ge": 1, "gn": 1,
    "kel": 2, "keluaran": 2, "exod": 2, "exo": 2, "ex": 2,
    "im": 3, "imamat": 3, "lev": 3, "le": 3, "lv": 3,
    "bil": 4, "bilangan": 4, "num": 4, "nu": 4, "nm": 4,
    "ul": 5, "ulangan": 5, "deut": 5, "deu": 5, "dt": 5,
    "yos": 6, "yosua": 6, "josh": 6, "jos": 6,
    "hak": 7, "hakim": 7, "hakim-hakim": 7, "judg": 7, "jdg": 7,
    "rut": 8, "ruth": 8, "ru": 8,
    "1sam": 9, "1 samuel": 9, "1samuel": 9,
    "2sam": 10, "2 samuel": 10, "2samuel": 10,
    "1raj": 11, "1 raja-raja": 11, "1rajaraja": 11, "1kgs": 11,
    "2raj": 12, "2 raja-raja": 12, "2rajaraja": 12, "2kgs": 12,
    "1taw": 13, "1 tawarikh": 13, "1tawarikh": 13, "1chr": 13,
    "2taw": 14, "2 tawarikh": 14, "2tawarikh": 14, "2chr": 14,
    "ezr": 15, "ezra": 15,
    "neh": 16, "nehemia": 16,
    "est": 17, "ester": 17, "esth": 17,
    "ayb": 18, "ayub": 18, "job": 18, "jb": 18,
    "mzm": 19, "mazmur": 19, "ps": 19, "psa": 19, "psm": 19,
    "ams": 20, "amsal": 20, "prov": 20, "pro": 20, "pr": 20,
    "pkh": 21, "pengkhotbah": 21, "eccl": 21, "ecc": 21, "ec": 21,
    "kid": 22, "kidung": 22, "kidung agung": 22, "song": 22, "sg": 22,
    "yes": 23, "yesaya": 23, "isa": 23, "is": 23,
    "yer": 24, "yeremia": 24, "jer": 24, "jr": 24,
    "rat": 25, "ratapan": 25, "lam": 25, "la": 25,
    "yeh": 26, "yehezkiel": 26, "ezek": 26, "eze": 26,
    "dan": 27, "daniel": 27, "dn": 27,
    "hos": 28, "hosea": 28, "ho": 28,
    "yoe": 29, "yoel": 29, "joel": 29, "jl": 29,
    "am": 30, "amos": 30,
    "ob": 31, "obaja": 31, "obad": 31,
    "yun": 32, "yunus": 32, "jonah": 32, "jon": 32,
    "mi": 33, "mikha": 33, "mic": 33,
    "nah": 34, "nahum": 34, "na": 34,
    "hab": 35, "habakuk": 35, "hb": 35,
    "zef": 36, "zefanya": 36, "zeph": 36, "zp": 36,
    "hag": 37, "hagai": 37, "hg": 37,
    "za": 38, "zakharia": 38, "zech": 38, "zc": 38,
    "mal": 39, "maleakhi": 39, "ml": 39,
    "mat": 40, "matius": 40, "matt": 40, "mt": 40,
    "mrk": 41, "markus": 41, "mark": 41, "mk": 41,
    "luk": 42, "lukas": 42, "luke": 42, "lk": 42,
    "yoh": 43, "yohanes": 43, "john": 43, "jn": 43,
    "kis": 44, "kisah": 44, "kisah para rasul": 44, "acts": 44, "ac": 44,
    "rom": 45, "roma": 45, "rm": 45, "ro": 45,
    "1kor": 46, "1 korintus": 46, "1cor": 46, "1co": 46,
    "2kor": 47, "2 korintus": 47, "2cor": 47, "2co": 47,
    "gal": 48, "galatia": 48, "ga": 48,
    "ef": 49, "efesus": 49, "eph": 49, "ep": 49,
    "flp": 50, "filipi": 50, "phil": 50, "php": 50,
    "kol": 51, "kolose": 51, "col": 51,
    "1tes": 52, "1 tesalonika": 52, "1thess": 52, "1th": 52,
    "2tes": 53, "2 tesalonika": 53, "2thess": 53, "2th": 53,
    "1tim": 54, "1 timotius": 54, "1ti": 54,
    "2tim": 55, "2 timotius": 55, "2ti": 55,
    "tit": 56, "titus": 56, "ti": 56,
    "flm": 57, "filemon": 57, "phlm": 57, "phm": 57,
    "ibr": 58, "ibrani": 58, "heb": 58, "he": 58,
    "yak": 59, "yakobus": 59, "jas": 59, "jm": 59,
    "1pet": 60, "1ptr": 60, "1 petrus": 60, "1pt": 60, "1pe": 60,
    "2pet": 61, "2ptr": 61, "2 petrus": 61, "2pt": 61, "2pe": 61,
    "1yoh": 62, "1 yohanes": 62, "1john": 62, "1jn": 62,
    "2yoh": 63, "2 yohanes": 63, "2john": 63, "2jn": 63,
    "3yoh": 64, "3 yohanes": 64, "3john": 64, "3jn": 64,
    "yud": 65, "yudas": 65, "jude": 65, "jd": 65,
    "why": 66, "wahyu": 66, "rev": 66, "re": 66
};

// Normalisasi alias kamus Alkitab (tanpa spasi, titik, atau tanda hubung)
const NORMALIZED_SS_BOOK_ALIAS = {};
for (const [k, v] of Object.entries(SS_ALKITAB_BOOK_ALIAS)) {
    NORMALIZED_SS_BOOK_ALIAS[k.toLowerCase().replace(/[\s.-]/g, "")] = v;
}
NORMALIZED_SS_BOOK_ALIAS["kisahrasulrasul"] = 44;
NORMALIZED_SS_BOOK_ALIAS["kisahpararasul"] = 44;
NORMALIZED_SS_BOOK_ALIAS["kisahrasul"] = 44;
NORMALIZED_SS_BOOK_ALIAS["kis"] = 44;

const SS_ALKITAB_BOOK_NAMES = {
    1: "Kejadian", 2: "Keluaran", 3: "Imamat", 4: "Bilangan", 5: "Ulangan",
    6: "Yosua", 7: "Hakim-hakim", 8: "Rut", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Raja-raja", 12: "2 Raja-raja", 13: "1 Tawarikh", 14: "2 Tawarikh",
    15: "Ezra", 16: "Nehemia", 17: "Ester", 18: "Ayub", 19: "Mazmur",
    20: "Amsal", 21: "Pengkhotbah", 22: "Kidung Agung", 23: "Yesaya",
    24: "Yeremia", 25: "Ratapan", 26: "Yehezkiel", 27: "Daniel", 28: "Hosea",
    29: "Yoel", 30: "Amos", 31: "Obaja", 32: "Yunus", 33: "Mikha",
    34: "Nahum", 35: "Habakuk", 36: "Zefanya", 37: "Hagai", 38: "Zakharia",
    39: "Maleakhi", 40: "Matius", 41: "Markus", 42: "Lukas", 43: "Yohanes",
    44: "Kisah Para Rasul", 45: "Roma", 46: "1 Korintus", 47: "2 Korintus",
    48: "Galatia", 49: "Efesus", 50: "Filipi", 51: "Kolose", 52: "1 Tesalonika",
    53: "2 Tesalonika", 54: "1 Timotius", 55: "2 Timotius", 56: "Titus",
    57: "Filemon", 58: "Ibrani", 59: "Yakobus", 60: "1 Petrus", 61: "2 Petrus",
    62: "1 Yohanes", 63: "2 Yohanes", 64: "3 Yohanes", 65: "Yudas", 66: "Wahyu"
};

// Parsing satu referensi spesifik (e.g. "Yohanes 8:12", "Yohanes 9:5", "Daniel 7", "Wahyu 1:1-3")
function parseSingleRef(t, fallbackBookId = null) {
    if (!t) return null;
    const cleanT = t.trim();

    // 1. Pola standar: [Nama Kitab] [Pasal](:[Ayat])
    const m = cleanT.match(/^([123]?\s*[A-Za-z\s.-]+?)\s*(\d+)(?:\s*[:,\s]\s*([\d\s,-]+))?$/i);
    let bookId = null;
    let chapter = 1;
    let vPart = "";

    if (m) {
        const bookStr = m[1].toLowerCase().replace(/[\s.-]/g, "");
        bookId = NORMALIZED_SS_BOOK_ALIAS[bookStr];
        if (bookId) {
            chapter = parseInt(m[2], 10);
            vPart = m[3] ? m[3].trim() : "";
        }
    }

    // 2. Pola tanpa nama kitab: [Pasal]:[Ayat] atau [Pasal] saja dengan fallbackBookId
    if (!bookId && fallbackBookId) {
        const m2 = cleanT.match(/^(\d+)(?:\s*[:,\s]\s*([\d\s,-]+))?$/i);
        if (m2) {
            bookId = fallbackBookId;
            chapter = parseInt(m2[1], 10);
            vPart = m2[2] ? m2[2].trim() : "";
        }
    }

    if (!bookId) return null;

    let startV = 1;
    let endV = 999;
    if (vPart) {
        const vList = [];
        for (const seg of vPart.split(/[,]/)) {
            const cleanSeg = seg.trim();
            if (cleanSeg.includes("-")) {
                const [s, e] = cleanSeg.split("-").map(x => parseInt(x.trim(), 10));
                if (!isNaN(s) && !isNaN(e)) vList.push({ s, e });
            } else {
                const n = parseInt(cleanSeg, 10);
                if (!isNaN(n)) vList.push({ s: n, e: n });
            }
        }
        if (vList.length > 0) {
            startV = Math.min(...vList.map(x => x.s));
            endV = Math.max(...vList.map(x => x.e));
        }
    }

    const bookName = SS_ALKITAB_BOOK_NAMES[bookId] || "Kitab";
    const verse = endV === 999 || startV === endV ? String(startV) : `${startV}-${endV}`;
    const buttonLabel = endV === 999
        ? `${bookName} ${chapter}`
        : `${bookName} ${chapter}:${verse}`;

    return {
        bookId,
        bookName,
        chapter,
        startV,
        endV,
        verse,
        buttonLabel,
        returnTab: "belajar_sekolah_sabat"
    };
}

// Pisahkan HTML ayat menjadi beberapa perikop / pasal / kitab jika terdapat lebih dari satu referensi
function parseSectionsFromHtml(html, fallbackLabel) {
    if (!html) return [];
    const regex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=(?:<h2[^>]*>|$))/gi;
    const sections = [];
    let match;
    let lastBookId = null;

    while ((match = regex.exec(html)) !== null) {
        const rawTitle = match[1].replace(/<[^>]*>/g, "").trim();
        const bodyHtml = match[2].trim();
        const target = parseSingleRef(rawTitle, lastBookId);
        if (target) lastBookId = target.bookId;

        sections.push({
            title: rawTitle,
            bodyHtml,
            target
        });
    }

    if (sections.length === 0) {
        const target = parseSingleRef(fallbackLabel);
        sections.push({
            title: fallbackLabel || "Ayat Alkitab",
            bodyHtml: html,
            target
        });
    }

    return sections;
}

// Fungsi ekstraksi spesifikasi ayat dari teks label majemuk (e.g. "Ibr. 1: 1, 2; 2 Tim. 3: 15-17" atau "Daniel 7 dan 8")
function parseCompoundRef(label) {
    if (!label) return [];
    const parts = label.split(";");
    const allSpecs = [];
    for (const part of parts) {
        const t = part.trim();
        if (!t) continue;
        // Tangani "Daniel 7 dan 8"
        const mDan = t.match(/^([123]?\s*[A-Za-z\s.-]+?)\s+(\d+)\s+(?:dan|sampai|-)\s+(\d+)$/i);
        if (mDan) {
            const bookStr = mDan[1].toLowerCase().replace(/[\s.-]/g, "");
            const bookId = NORMALIZED_SS_BOOK_ALIAS[bookStr];
            if (bookId) {
                allSpecs.push({ bookId, chapter: parseInt(mDan[2], 10), startV: 1, endV: 999 });
                allSpecs.push({ bookId, chapter: parseInt(mDan[3], 10), startV: 1, endV: 999 });
                continue;
            }
        }

        const m = t.match(/^([123]?\s*[A-Za-z\s.-]+?)\s*(\d+)(?:\s*[:,\s]\s*([\d\s,-]+))?$/i);
        if (m) {
            const bookStr = m[1].toLowerCase().replace(/[\s.-]/g, "");
            const bookId = NORMALIZED_SS_BOOK_ALIAS[bookStr];
            if (bookId) {
                const chapter = parseInt(m[2], 10);
                const vPart = m[3] ? m[3].trim() : "";
                if (!vPart) {
                    allSpecs.push({ bookId, chapter, startV: 1, endV: 999 });
                } else {
                    const vList = [];
                    for (const seg of vPart.split(/[,]/)) {
                        const cleanSeg = seg.trim();
                        if (cleanSeg.includes("-")) {
                            const [s, e] = cleanSeg.split("-").map(x => parseInt(x.trim(), 10));
                            if (!isNaN(s) && !isNaN(e)) vList.push({ s, e });
                        } else {
                            const n = parseInt(cleanSeg, 10);
                            if (!isNaN(n)) vList.push({ s: n, e: n });
                        }
                    }
                    if (vList.length === 0) {
                        allSpecs.push({ bookId, chapter, startV: 1, endV: 999 });
                    } else {
                        const minV = Math.min(...vList.map(x => x.s));
                        const maxV = Math.max(...vList.map(x => x.e));
                        const vSet = new Set(vList.flatMap(x => {
                            const arr = [];
                            for (let i = x.s; i <= x.e; i++) arr.push(i);
                            return arr;
                        }));
                        allSpecs.push({ bookId, chapter, startV: minV, endV: maxV, vSet });
                    }
                }
            }
        }
    }
    return allSpecs;
}

// Fetch dan susun HTML ayat langsung dari database Alkitab lokal (public/alkitab/*.json)
async function resolveVersesFromLocalBible(verseLabel) {
    const specs = parseCompoundRef(verseLabel);
    if (!specs || specs.length === 0) return null;

    let fullHtml = "";
    for (const spec of specs) {
        try {
            const baseUrl = (import.meta.env && import.meta.env.BASE_URL) || "/";
            const cleanBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
            const res = await fetch(`${cleanBase}alkitab/${spec.bookId}.json`);
            if (!res.ok) continue;
            const bookData = await res.json();
            const chList = bookData[String(spec.chapter)] || [];
            const bookName = SS_ALKITAB_BOOK_NAMES[spec.bookId] || "Kitab";
            const rangeTitle = spec.endV === 999
                ? `${bookName} Pasal ${spec.chapter}`
                : `${bookName} ${spec.chapter}:${spec.startV}${spec.endV > spec.startV ? "-" + spec.endV : ""}`;

            fullHtml += `<h2>${rangeTitle}</h2>\n`;
            const matched = chList.filter(v => {
                if (v.type !== "content") return false;
                if (spec.endV === 999) return true;
                if (spec.vSet) return spec.vSet.has(v.ayat);
                return v.ayat >= spec.startV && v.ayat <= spec.endV;
            });
            matched.forEach(v => {
                fullHtml += `<sup>${v.ayat}</sup> ${v.teks} `;
            });
            fullHtml += "\n\n";
        } catch (e) {
            console.warn("Gagal load Alkitab lokal:", spec, e);
        }
    }
    return fullHtml.trim() || null;
}

// Cache key unik & fungsi validasi cache offline
const SS_CACHE_PREFIX = "pisgah_ss_v5_";

function getValidCachedLesson(lessonId) {
    try {
        // Hapus cache usang yang tidak memiliki ayat
        localStorage.removeItem(`pisgah_ss_lesson_2026_04_${lessonId}`);
        localStorage.removeItem(`pisgah_ss_lesson_v2_2026_04_${lessonId}`);
        localStorage.removeItem(`pisgah_ss_lesson_v3_2026_04_${lessonId}`);
        localStorage.removeItem(`pisgah_ss_lesson_v4_2026_04_${lessonId}`);

        const raw = localStorage.getItem(`${SS_CACHE_PREFIX}${lessonId}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Pastikan ada ayat di dalamnya
        const hasVerses = parsed?.days?.some(d => d.verses && Object.keys(d.verses).length > 0);
        if (hasVerses) return parsed;
    } catch (e) { }
    return null;
}

export default function DetailSekolahSabat({ setActiveTab, dataPejabat, setHideGlobalBack }) {
    useEffect(() => {
        if (setHideGlobalBack) setHideGlobalBack(true);
        return () => { if (setHideGlobalBack) setHideGlobalBack(false); };
    }, [setHideGlobalBack]);

    // Hitung hari saat ini (0 = Sabat Petang, 1 = Minggu, ..., 6 = Jumat)
    const todayDayIdx = useMemo(() => {
        const jsDay = new Date().getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
        if (jsDay === 6) return 0; // Sabat
        return jsDay + 1; // Sun -> 1, Mon -> 2, Tue -> 3, Wed -> 4, Thu -> 5, Fri -> 6
    }, []);

    // Hitung pekan pelajaran saat ini berdasarkan tanggal kalender
    const currentActiveLessonId = useMemo(() => {
        const now = new Date();
        const ymd = now.toISOString().slice(0, 10);
        const match = SS_LESSONS_CATALOG.find(l => ymd >= l.startDate && ymd <= l.endDate);
        return match ? match.id : "05";
    }, []);

    const [selectedLessonId, setSelectedLessonId] = useState(currentActiveLessonId);
    const [selectedDayIdx, setSelectedDayIdx] = useState(todayDayIdx);
    const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0: normal, 1: large, 2: extra-large
    const [popupFontSizeLevel, setPopupFontSizeLevel] = useState(() => {
        try {
            const saved = localStorage.getItem("pisgah_ss_popup_font_size");
            if (saved !== null) return parseInt(saved, 10);
        } catch (e) { }
        return 0; // 0: normal, 1: large, 2: extra-large
    });
    const [activeVersePopup, setActiveVersePopup] = useState(null); // { title, html, rawText, verseLabel }
    const [copiedToast, setCopiedToast] = useState(false);

    const handleSetPopupFontSize = (lvl) => {
        setPopupFontSizeLevel(lvl);
        try {
            localStorage.setItem("pisgah_ss_popup_font_size", String(lvl));
        } catch (e) { }
    };

    const [lessonData, setLessonData] = useState(() => {
        const validCached = getValidCachedLesson(currentActiveLessonId);
        if (validCached) return validCached;
        return BUILTIN_LESSON_5;
    });
    const [isLoading, setIsLoading] = useState(false);

    // Ambil data pelajaran ketika lessonId berubah
    useEffect(() => {
        let isMounted = true;
        const fetchLesson = async () => {
            // 1. Cek cache lokal tervalidasi
            const validCached = getValidCachedLesson(selectedLessonId);
            if (validCached) {
                if (isMounted) setLessonData(validCached);
                return;
            }

            // 2. Jika Pelajaran 5 dan belum ada cache, selalu gunakan builtin lengkap
            if (selectedLessonId === "05") {
                if (isMounted) setLessonData(BUILTIN_LESSON_5);
                try {
                    localStorage.setItem(`${SS_CACHE_PREFIX}05`, JSON.stringify(BUILTIN_LESSON_5));
                } catch (e) { }
                return;
            }

            // 3. Tarik dari API Adventech (Termasuk Pemetaan Ayat Alkitab)
            setIsLoading(true);
            try {
                const res = await fetch(`https://sabbath-school.adventech.io/api/v1/in/quarterlies/2026-04/lessons/${selectedLessonId}/index.json`);
                const data = await res.json();
                const daysData = [];
                for (let i = 0; i < (data.days || []).length; i++) {
                    const d = data.days[i];
                    try {
                        const readRes = await fetch(d.full_path + "/read/index.json");
                        const readData = await readRes.json();
                        const bibleMap = {};
                        if (readData.bible && readData.bible.length > 0) {
                            readData.bible.forEach(b => {
                                if (b.verses) Object.assign(bibleMap, b.verses);
                            });
                        }
                        daysData.push({
                            idx: i,
                            id: d.id,
                            title: d.title,
                            date: d.date,
                            content: readData.content,
                            verses: bibleMap
                        });
                    } catch (err) {
                        daysData.push({
                            idx: i,
                            id: d.id,
                            title: d.title,
                            date: d.date,
                            content: "<p>Konten sedang dimuat atau perangkat sedang offline.</p>",
                            verses: {}
                        });
                    }
                }

                const assembled = {
                    id: selectedLessonId,
                    title: data.lesson.title,
                    start_date: data.lesson.start_date,
                    end_date: data.lesson.end_date,
                    days: daysData
                };

                if (isMounted) {
                    setLessonData(assembled);
                    try {
                        localStorage.setItem(`${SS_CACHE_PREFIX}${selectedLessonId}`, JSON.stringify(assembled));
                    } catch (e) { }
                }
            } catch (err) {
                console.warn("Gagal fetch pelajaran SS online:", err);
                if (isMounted && !lessonData) setLessonData(BUILTIN_LESSON_5);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchLesson();
        return () => { isMounted = false; };
    }, [selectedLessonId]);

    // Data hari yang dipilih saat ini
    const currentDay = useMemo(() => {
        if (!lessonData || !lessonData.days || lessonData.days.length === 0) return null;
        return lessonData.days[selectedDayIdx] || lessonData.days[0];
    }, [lessonData, selectedDayIdx]);

    // Metadata pekan terpilih
    const currentCatalogItem = useMemo(() => {
        return SS_LESSONS_CATALOG.find(l => l.id === selectedLessonId) || SS_LESSONS_CATALOG[4];
    }, [selectedLessonId]);

    // Handler klik ayat di dalam konten HTML
    const handleContentClick = async (e) => {
        const anchor = e.target.closest("a.verse");
        if (anchor) {
            e.preventDefault();
            e.stopPropagation();
            const verseKey = anchor.getAttribute("verse") || "";
            const verseLabel = anchor.textContent.trim();

            // 1. Cek di kamus ayat hari ini
            let verseHtml = currentDay?.verses?.[verseKey];

            // 2. Jika tidak ditemukan di hari ini, cek di hari lain pada pelajaran ini
            if (!verseHtml && lessonData?.days) {
                for (const d of lessonData.days) {
                    if (d.verses && d.verses[verseKey]) {
                        verseHtml = d.verses[verseKey];
                        break;
                    }
                }
            }

            // 3. Fallback ke BUILTIN_LESSON_5 (selalu lengkap 53 perikop di memori bundle)
            if (!verseHtml && BUILTIN_LESSON_5?.days) {
                for (const d of BUILTIN_LESSON_5.days) {
                    if (d.verses && d.verses[verseKey]) {
                        verseHtml = d.verses[verseKey];
                        break;
                    }
                }
            }

            // 4. Jika ditemukan di kamus Adventech:
            if (verseHtml) {
                const titleMatch = verseHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
                const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : verseLabel;
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = verseHtml;
                const rawText = tempDiv.textContent || tempDiv.innerText || "";
                const sections = parseSectionsFromHtml(verseHtml, verseLabel);

                setActiveVersePopup({
                    title: verseLabel || title,
                    sections: sections,
                    html: verseHtml,
                    rawText: rawText.trim(),
                    verseKey,
                    verseLabel
                });
                return;
            }

            // 5. Lookup dinamis langsung dari Alkitab Digital lokal (sehingga isi firman Tuhan PASTI LANGSUNG MUNCUL!)
            setActiveVersePopup({
                title: verseLabel,
                isLoading: true,
                sections: [{
                    title: verseLabel,
                    bodyHtml: `<div class="p-6 text-center text-navy-500 dark:text-gray-400 font-medium animate-pulse"><p>Memuat firman Tuhan untuk <b>${verseLabel}</b>...</p></div>`,
                    target: null
                }],
                html: `<div class="p-6 text-center text-navy-500 dark:text-gray-400 font-medium animate-pulse"><p>Memuat firman Tuhan untuk <b>${verseLabel}</b>...</p></div>`,
                rawText: verseLabel,
                verseKey,
                verseLabel
            });

            const dynamicHtml = await resolveVersesFromLocalBible(verseLabel);
            if (dynamicHtml) {
                const titleMatch = dynamicHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
                const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : verseLabel;
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = dynamicHtml;
                const rawText = tempDiv.textContent || tempDiv.innerText || "";
                const sections = parseSectionsFromHtml(dynamicHtml, verseLabel);

                setActiveVersePopup({
                    title: verseLabel || title,
                    sections: sections,
                    html: dynamicHtml,
                    rawText: rawText.trim(),
                    verseKey,
                    verseLabel
                });
                return;
            }

            // 6. Fallback jika format teks ayat di luar pola baku
            const fallbackTarget = parseSingleRef(verseLabel);
            const fallbackSections = [{
                title: verseLabel,
                bodyHtml: `<div class="p-4 bg-amber-50/80 dark:bg-navy-800 rounded-2xl border border-amber-200/80 dark:border-navy-700 text-sm leading-relaxed"><p class="font-bold text-navy-900 dark:text-gold-400 mb-1.5 flex items-center gap-1.5">📖 ${verseLabel}</p><p class="text-xs text-navy-600 dark:text-gray-300">Teks firman Tuhan dapat Anda buka dan baca langsung secara menyeluruh di Alkitab Digital melalui tombol di bawah.</p></div>`,
                target: fallbackTarget
            }];
            setActiveVersePopup({
                title: verseLabel,
                sections: fallbackSections,
                html: fallbackSections[0].bodyHtml,
                rawText: verseLabel,
                verseKey,
                verseLabel
            });
        }
    };

    // Salin ayat ke clipboard
    const handleCopyVerse = async () => {
        if (!activeVersePopup) return;
        let textToCopy = "";
        if (activeVersePopup.sections && activeVersePopup.sections.length > 0) {
            textToCopy = activeVersePopup.sections.map(s => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = s.bodyHtml;
                const cleanText = (tempDiv.textContent || tempDiv.innerText || "").trim();
                return `${s.title}\n${cleanText}`;
            }).join("\n\n");
        } else if (activeVersePopup.rawText) {
            textToCopy = activeVersePopup.rawText;
        }
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 2500);
        } catch (e) {
            console.warn("Gagal copy text:", e);
        }
    };

    // Kelas ukuran font responsif ramah lansia
    const fontClass = fontSizeLevel === 2
        ? "text-xl sm:text-2xl leading-loose font-medium"
        : fontSizeLevel === 1
            ? "text-lg sm:text-xl leading-relaxed"
            : "text-base sm:text-lg leading-relaxed";

    // Kelas ukuran font teks di dalam popup modal ayat
    const popupFontClass = popupFontSizeLevel === 2
        ? "text-lg sm:text-xl leading-loose font-medium"
        : popupFontSizeLevel === 1
            ? "text-base sm:text-lg leading-relaxed font-medium"
            : "text-sm sm:text-base leading-relaxed font-medium";

    // Daftar target unik (kitab, pasal, ayat) dari perikop di popup
    const distinctTargets = useMemo(() => {
        if (!activeVersePopup) return [];
        if (activeVersePopup.sections && activeVersePopup.sections.length > 0) {
            const targets = [];
            const seen = new Set();
            for (const sec of activeVersePopup.sections) {
                if (sec.target) {
                    const key = `${sec.target.bookId}_${sec.target.chapter}_${sec.target.verse}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        targets.push(sec.target);
                    }
                }
            }
            if (targets.length > 0) return targets;
        }
        if (activeVersePopup.target) return [activeVersePopup.target];
        const fallback = parseSingleRef(activeVersePopup.verseLabel || activeVersePopup.title);
        return fallback ? [fallback] : [];
    }, [activeVersePopup]);

    // Navigasi langsung ke ayat di Alkitab Digital dari Popup Modal (mendukung pasal/kitab berbeda)
    const handleNavigateTarget = (target) => {
        if (!target) return;
        const finalTarget = {
            bookId: target.bookId,
            bookName: target.bookName || SS_ALKITAB_BOOK_NAMES[target.bookId] || "Wahyu",
            chapter: target.chapter || 1,
            verse: target.verse || (target.startV ? String(target.startV) : "1"),
            startAyat: target.startV || parseInt(target.verse, 10) || 1,
            endAyat: target.endV || target.startV || parseInt(target.verse, 10) || 1,
            returnTab: 'belajar_sekolah_sabat'
        };

        window.__alkitabDirectTarget = finalTarget;
        window.__alkitabReturnTab = 'belajar_sekolah_sabat';
        try {
            localStorage.setItem('alkitabDirectTarget', JSON.stringify(finalTarget));
            localStorage.setItem('alkitabReturnTab', 'belajar_sekolah_sabat');
        } catch (e) { }
        window.dispatchEvent(new CustomEvent('alkitab-direct-target', { detail: finalTarget }));

        setActiveVersePopup(null);
        setActiveTab("alkitab");
    };

    const handleOpenInAlkitab = (popup) => {
        if (!popup) return;
        if (distinctTargets.length > 0) {
            handleNavigateTarget(distinctTargets[0]);
            return;
        }
        const specs = parseCompoundRef(popup.verseLabel || popup.title);
        let target = null;
        if (specs && specs.length > 0) {
            const spec = specs[0];
            const bookName = SS_ALKITAB_BOOK_NAMES[spec.bookId] || "Wahyu";
            const verseRange = spec.endV === 999 || spec.startV === spec.endV
                ? String(spec.startV)
                : `${spec.startV}-${spec.endV}`;
            target = {
                bookId: spec.bookId,
                bookName: bookName,
                chapter: spec.chapter,
                verse: verseRange,
                returnTab: 'belajar_sekolah_sabat'
            };
        } else {
            target = { bookName: "Wahyu", bookId: 66, chapter: 1, verse: "1", returnTab: 'belajar_sekolah_sabat' };
        }
        handleNavigateTarget(target);
    };

    // Navigasi langsung ke ayat hafalan di Alkitab Digital
    const handleOpenMemoryVerseInAlkitab = () => {
        const memoryRef = selectedLessonId === "05" ? "Wahyu 1: 1" : (currentCatalogItem?.memoryVerseRef || "Wahyu 1: 1");
        const specs = parseCompoundRef(memoryRef);
        let target = { bookName: "Wahyu", bookId: 66, chapter: 1, verse: "1", returnTab: 'belajar_sekolah_sabat' };
        if (specs && specs.length > 0) {
            const spec = specs[0];
            target = {
                bookId: spec.bookId,
                bookName: SS_ALKITAB_BOOK_NAMES[spec.bookId] || "Wahyu",
                chapter: spec.chapter,
                verse: spec.endV === 999 || spec.startV === spec.endV ? String(spec.startV) : `${spec.startV}-${spec.endV}`,
                returnTab: 'belajar_sekolah_sabat'
            };
        }
        handleNavigateTarget(target);
    };

    const handlePrevDay = () => {
        if (selectedDayIdx > 0) setSelectedDayIdx(prev => prev - 1);
    };

    const handleNextDay = () => {
        if (selectedDayIdx < 6) setSelectedDayIdx(prev => prev + 1);
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in relative pb-16 text-[#2C3F21] dark:text-gray-100">
            {/* INLINE CSS KHUSUS UNTUK TAMPILAN BACAAN SEKOLAH SABAT MIRIP WEB ADVENTECH */}
            <style>{`
                .ss-reader-body {
                    color: inherit;
                    font-family: inherit;
                }
                .ss-reader-body h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-top: 2rem;
                    margin-bottom: 0.85rem;
                    color: #1e293b;
                    letter-spacing: -0.02em;
                }
                .dark .ss-reader-body h2 {
                    color: #f1f5f9;
                }
                .ss-reader-body h3 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-top: 1.6rem;
                    margin-bottom: 0.65rem;
                    color: #334155;
                }
                .dark .ss-reader-body h3 {
                    color: #e2e8f0;
                }
                .ss-reader-body h4 {
                    font-size: 1.05rem;
                    font-weight: 700;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: #475569;
                }
                .dark .ss-reader-body h4 {
                    color: #cbd5e1;
                }
                .ss-reader-body p {
                    margin-bottom: 1.35rem;
                    line-height: 1.85;
                }
                .ss-reader-body blockquote {
                    position: relative;
                    margin: 1.75rem 0;
                    padding: 1.15rem 1.4rem;
                    border-left: 4px solid #D19B45;
                    background-color: rgba(209, 155, 69, 0.08);
                    border-radius: 0 1.25rem 1.25rem 0;
                    font-style: italic;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .dark .ss-reader-body blockquote {
                    border-left-color: #f59e0b;
                    background-color: rgba(245, 158, 11, 0.12);
                }
                .ss-reader-body blockquote p:first-child {
                    font-weight: 800;
                    font-style: normal;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.06em;
                    color: #B4791E;
                    margin-bottom: 0.5rem;
                }
                .dark .ss-reader-body blockquote p:first-child {
                    color: #fbbf24;
                }
                /* Tautan Ayat Alkitab Interaktif */
                .ss-reader-body a.verse {
                    color: #2e7d32;
                    background-color: rgba(46, 125, 50, 0.09);
                    border-bottom: 1.5px dotted #2e7d32;
                    padding: 0.1rem 0.4rem;
                    border-radius: 0.375rem;
                    font-weight: 700;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.2rem;
                }
                .dark .ss-reader-body a.verse {
                    color: #f6c85f;
                    background-color: rgba(246, 200, 95, 0.14);
                    border-bottom-color: #f6c85f;
                }
                .ss-reader-body a.verse:hover {
                    background-color: rgba(46, 125, 50, 0.2);
                    border-bottom-style: solid;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }
                .dark .ss-reader-body a.verse:hover {
                    background-color: rgba(246, 200, 95, 0.28);
                }
                .ss-reader-body hr {
                    border: none;
                    border-top: 1px dashed rgba(100, 116, 139, 0.25);
                    margin: 2rem 0;
                }
                /* Format Ayat Pop-up */
                .verse-popup-body h2 {
                    font-size: 1.3rem;
                    font-weight: 800;
                    margin-bottom: 0.85rem;
                    color: #1e3a8a;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    padding-bottom: 0.5rem;
                }
                .dark .verse-popup-body h2 {
                    color: #fbbf24;
                    border-bottom-color: rgba(255,255,255,0.12);
                }
                .verse-popup-body sup {
                    color: #D19B45;
                    font-weight: 800;
                    font-size: 0.78rem;
                    margin-right: 0.3rem;
                    margin-left: 0.15rem;
                    vertical-align: super;
                }
                .dark .verse-popup-body sup {
                    color: #fbbf24;
                }
                .verse-popup-body p {
                    margin-bottom: 0.85rem;
                    line-height: 1.8;
                }
            `}</style>

            {/* STICKY TOP BAR */}
            <div className="sticky top-16 md:top-[4.5rem] z-[35] rounded-2xl px-3 sm:px-4 py-2.5 liquid-glass-header transition-all flex items-center justify-between gap-2 sm:gap-3 shadow-sm border border-navy-100/50 dark:border-navy-700/50">
                <button
                    onClick={() => {
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            setActiveTab("belajar");
                        }
                    }}
                    className="flex items-center justify-center px-3.5 py-2 rounded-xl liquid-glass-pill text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white font-extrabold transition-all gap-1.5 group shrink-0 shadow-xs cursor-pointer"
                    title="Kembali ke Menu Belajar"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-xs sm:text-sm">Kembali</span>
                </button>

                {/* Dropdown Pemilih Pekan Pelajaran */}
                <div className="flex-1 max-w-xs sm:max-w-md min-w-0">
                    <select
                        value={selectedLessonId}
                        onChange={(e) => {
                            setSelectedLessonId(e.target.value);
                            setSelectedDayIdx(0);
                        }}
                        className="w-full px-2.5 sm:px-3 py-1.5 bg-white/90 dark:bg-navy-900 border border-navy-200/80 dark:border-navy-700 rounded-xl text-xs sm:text-sm font-bold text-navy-800 dark:text-gold-400 outline-none focus:border-gold-500 shadow-2xs cursor-pointer truncate"
                    >
                        {SS_LESSONS_CATALOG.map((item) => (
                            <option key={item.id} value={item.id}>
                                Pelajaran {parseInt(item.id, 10)}: {item.title} {item.id === currentActiveLessonId ? "(Pekan Ini)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Kontrol Ukuran Teks (Ramah Lansia) & Link Luar */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <div className="hidden sm:flex items-center bg-white/80 dark:bg-navy-800 rounded-xl p-0.5 border border-navy-200/60 dark:border-navy-700">
                        <button
                            type="button"
                            onClick={() => setFontSizeLevel(0)}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${fontSizeLevel === 0 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
                            title="Ukuran Font Standar"
                        >
                            A
                        </button>
                        <button
                            type="button"
                            onClick={() => setFontSizeLevel(1)}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${fontSizeLevel === 1 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
                            title="Ukuran Font Besar"
                        >
                            A+
                        </button>
                        <button
                            type="button"
                            onClick={() => setFontSizeLevel(2)}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${fontSizeLevel === 2 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
                            title="Ukuran Font Ekstra Besar (Ramah Lansia)"
                        >
                            A++
                        </button>
                    </div>

                    <a
                        href="https://sabbath-school.adventech.io/in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-navy-100/80 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-gold-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                        title="Buka di Website Resmi Adventech"
                    >
                        <span className="hidden md:inline">Adventech</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* KARTU HEADER TRIWULAN & TEMA PEKAN INI (DIPERTAHANKAN SESUAI GAMBAR) */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1C2C16] via-[#2A4422] to-[#1E3019] dark:from-navy-900 dark:via-navy-950 dark:to-navy-900 p-6 md:p-8 text-white shadow-xl border-2 border-[#4A7045]/60 dark:border-gold-500/40">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/40 font-extrabold text-[10.5px] uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5" /> PEDOMAN PENDALAMAN ALKITAB DEWASA
                        </span>
                        <span className="text-xs text-white/80 font-bold bg-white/10 px-3 py-1 rounded-full">
                            🗓 {currentCatalogItem.dateRange}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                        Pelajaran {parseInt(selectedLessonId, 10)}: {currentCatalogItem.title}
                    </h1>
                    <p className="text-sm sm:text-base text-gold-300 font-semibold mb-5">
                        {SS_QUARTERLY_INFO.title} • {SS_QUARTERLY_INFO.human_date}
                    </p>

                    {/* KARTU AYAT HAFALAN KHUSUS */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/10 dark:bg-navy-800/80 backdrop-blur-md border border-white/20 shadow-md">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-gold-400" /> AYAT HAFALAN PEKAN INI
                            </span>
                            <button
                                type="button"
                                onClick={handleOpenMemoryVerseInAlkitab}
                                className="px-3 py-1 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-black transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Buka di Alkitab</span>
                            </button>
                        </div>
                        <p className="text-sm sm:text-base italic text-white/95 leading-relaxed font-medium">
                            {selectedLessonId === "05"
                                ? "\"Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada-Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes.\" (Wahyu 1:1)"
                                : `Renungkan dan hafalkan ayat firman Tuhan untuk Pekan ${parseInt(selectedLessonId, 10)} ini guna meneguhkan iman dan pengharapan rohani Anda.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* TAB HARI DALAM SEPEKAN (HORIZONTAL SCROLL) */}
            <div className="rounded-2xl p-1.5 bg-[#E2E8D8] dark:bg-navy-900 border border-[#C5D5BC] dark:border-navy-700 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 px-1">
                    {SS_DAY_TABS.map((tab) => {
                        const isActive = selectedDayIdx === tab.idx;
                        const isToday = todayDayIdx === tab.idx;
                        return (
                            <button
                                key={tab.idx}
                                onClick={() => setSelectedDayIdx(tab.idx)}
                                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer min-w-[5.5rem] sm:min-w-[6.5rem] relative ${isActive
                                    ? "bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-md scale-102 font-extrabold"
                                    : "bg-white/80 dark:bg-navy-800 text-navy-800 dark:text-gray-200 hover:bg-white dark:hover:bg-navy-700/80 border border-navy-100 dark:border-navy-700/50"
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    <span>{tab.label}</span>
                                    {isToday && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" title="Hari Ini"></span>
                                    )}
                                </div>
                                <span className={`text-[9.5px] mt-0.5 ${isActive ? "text-gold-300 dark:text-navy-800" : "text-navy-500 dark:text-gray-400"}`}>
                                    {isToday ? "Hari Ini ⭐" : tab.sub}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* KONTEN BACAAN PELAJARAN HARIAN (DENGAN TAMPILAN ELEGAN SEPERTI WEB ADVENTECH) */}
            <div className="glass-box rounded-[2rem] shadow-sm border border-navy-100/60 dark:border-navy-800 p-5 sm:p-8 md:p-10 relative">
                {isLoading ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-[#4A7045] dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm font-bold text-navy-600 dark:text-gray-300">Memuat teks pelajaran harian Sekolah Sabat...</p>
                    </div>
                ) : currentDay ? (
                    <div className="space-y-6">
                        {/* Judul & Tanggal Hari Pelajaran */}
                        <div className="border-b border-navy-100 dark:border-navy-800 pb-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A7045]/10 dark:bg-gold-500/15 text-[#4A7045] dark:text-gold-400 font-extrabold text-xs uppercase tracking-wider">
                                    {SS_DAY_TABS[selectedDayIdx]?.label} • {currentDay.date || "Pelajaran Harian"}
                                </span>
                                <span className="text-[11px] text-navy-500 dark:text-gray-400 italic">
                                    💡 Ketuk tautan ayat untuk membuka firman Tuhan
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                                {currentDay.title}
                            </h2>
                        </div>

                        {/* Isi Teks Pelajaran (Event Delegated Click untuk Tautan Ayat) */}
                        <div
                            onClick={handleContentClick}
                            className={`ss-reader-body ${fontClass}`}
                            dangerouslySetInnerHTML={{ __html: currentDay.content }}
                        />

                        {/* NAVIGASI HARI SEBELUMNYA / SELANJUTNYA */}
                        <div className="pt-6 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-3 flex-wrap">
                            <button
                                type="button"
                                disabled={selectedDayIdx <= 0}
                                onClick={handlePrevDay}
                                className="px-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-gray-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>{selectedDayIdx > 0 ? SS_DAY_TABS[selectedDayIdx - 1]?.label : "Awal Pekan"}</span>
                            </button>

                            <div className="text-xs font-bold text-navy-500 dark:text-gray-400">
                                Hari {selectedDayIdx + 1} dari 7
                            </div>

                            <button
                                type="button"
                                disabled={selectedDayIdx >= 6}
                                onClick={handleNextDay}
                                className="px-4 py-2.5 rounded-xl bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                            >
                                <span>{selectedDayIdx < 6 ? SS_DAY_TABS[selectedDayIdx + 1]?.label : "Akhir Pekan"}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-navy-500 dark:text-gray-400 font-medium">
                        Pelajaran tidak ditemukan. Silakan pilih hari atau pekan lain melalui menu di atas.
                    </div>
                )}
            </div>

            {/* MODAL POPUP AYAT ALKITAB ELEGAN (SEPERTI PADA WEB ADVENTECH) */}
            {activeVersePopup && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-900/70 backdrop-blur-md p-4 animate-fade-in"
                    onClick={() => setActiveVersePopup(null)}
                >
                    <div
                        className="glass-box rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl animate-scale-up border-2 border-navy-100 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-100 dark:border-navy-800 shrink-0 gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-400/20 text-gold-500 dark:text-gold-400 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-black text-navy-900 dark:text-white leading-tight truncate">
                                        {activeVersePopup.verseLabel || activeVersePopup.title}
                                    </h3>
                                    <p className="text-[10.5px] font-bold text-gold-600 dark:text-gold-400">
                                        Alkitab Terjemahan Baru (TB)
                                    </p>
                                </div>
                            </div>

                            {/* Kontrol Ukuran Teks di Popup & Tombol Tutup */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex items-center bg-navy-100/80 dark:bg-navy-800 rounded-xl p-0.5 border border-navy-200/60 dark:border-navy-700">
                                    <button
                                        type="button"
                                        onClick={() => handleSetPopupFontSize(0)}
                                        className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${popupFontSizeLevel === 0
                                                ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-xs"
                                                : "text-navy-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-navy-700"
                                            }`}
                                        title="Ukuran Teks Standar"
                                    >
                                        A
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetPopupFontSize(1)}
                                        className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${popupFontSizeLevel === 1
                                                ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-xs"
                                                : "text-navy-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-navy-700"
                                            }`}
                                        title="Ukuran Teks Besar"
                                    >
                                        A+
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetPopupFontSize(2)}
                                        className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${popupFontSizeLevel === 2
                                                ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950 shadow-xs"
                                                : "text-navy-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-navy-700"
                                            }`}
                                        title="Ukuran Teks Ekstra Besar (Ramah Lansia)"
                                    >
                                        A++
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveVersePopup(null)}
                                    className="p-1.5 rounded-xl text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition cursor-pointer"
                                    title="Tutup Popup"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Isi Teks Ayat Alkitab (Scrollable dengan perikop dan font dinamis) */}
                        <div className={`overflow-y-auto flex-1 pr-1 space-y-3.5 verse-popup-body ${popupFontClass} text-navy-800 dark:text-gray-200 select-text`}>
                            {activeVersePopup.sections && activeVersePopup.sections.length > 0 ? (
                                activeVersePopup.sections.map((sec, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-navy-50/70 dark:bg-navy-800/70 rounded-2xl p-3.5 sm:p-4 border border-navy-100/90 dark:border-navy-700/70 space-y-2.5 transition-all shadow-2xs"
                                    >
                                        {/* Header Tiap Bagian / Pasal / Ayat dengan Tombol Alkitab Khusus */}
                                        <div className="flex items-center justify-between gap-2 border-b border-navy-100 dark:border-navy-700/60 pb-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="w-2 h-2 rounded-full bg-[#4A7045] dark:bg-gold-400 shrink-0"></span>
                                                <h4 className="text-sm sm:text-base font-black text-navy-950 dark:text-gold-300 truncate">
                                                    {sec.title}
                                                </h4>
                                            </div>
                                            {sec.target && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleNavigateTarget(sec.target)}
                                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#4A7045]/15 dark:bg-gold-500/20 hover:bg-[#4A7045] hover:text-white dark:hover:bg-gold-500 dark:hover:text-navy-950 text-[#375533] dark:text-gold-300 transition flex items-center gap-1.5 cursor-pointer border border-[#4A7045]/30 dark:border-gold-500/30 shrink-0 active:scale-95 shadow-xs"
                                                    title={`Buka ${sec.target.buttonLabel || sec.title} di Alkitab Digital`}
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>Buka di Alkitab</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Teks Ayat Firman Tuhan */}
                                        <div
                                            className="leading-relaxed pl-1 text-navy-800 dark:text-gray-200"
                                            dangerouslySetInnerHTML={{ __html: sec.bodyHtml }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: activeVersePopup.html }} />
                            )}
                        </div>

                        {/* Tombol Aksi Bawah */}
                        <div className="pt-3.5 mt-2 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleCopyVerse}
                                    className="px-3.5 py-2 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-gray-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                >
                                    {copiedToast ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-navy-600 dark:text-gray-300" />}
                                    <span>{copiedToast ? "Tersalin!" : "Salin Ayat"}</span>
                                </button>

                                {/* Jika hanya 1 target ayat: Tombol tunggal "Buka di Alkitab Digital" */}
                                {distinctTargets.length <= 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleNavigateTarget(distinctTargets[0] || activeVersePopup.target)}
                                        className="px-3.5 py-2 rounded-xl bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        <span>Buka di Alkitab Digital</span>
                                    </button>
                                )}

                                {/* Jika ada lebih dari 1 pasal atau kitab berbeda: Setiap perikop memiliki tombol spesifik */}
                                {distinctTargets.length > 1 && (
                                    distinctTargets.map((tgt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleNavigateTarget(tgt)}
                                            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#4A7045] dark:bg-gold-500 hover:bg-[#3A5836] dark:hover:bg-gold-600 text-white dark:text-navy-950 text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                            title={`Buka ${tgt.buttonLabel} di Alkitab Digital`}
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>Buka {tgt.buttonLabel}</span>
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveVersePopup(null)}
                                className="px-4 py-2 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 text-navy-700 dark:text-gray-300 text-xs font-bold cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
