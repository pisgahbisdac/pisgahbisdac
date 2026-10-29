import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, ArrowLeft, Calendar, ChevronRight, ChevronLeft, ExternalLink, Bookmark, Sparkles, Volume2, Type } from "lucide-react";

// ============================================================
// MODUL PELAJARAN SEKOLAH SABAT HARIAN (ADULT SABBATH SCHOOL)
// Triwulan IV 2026: "Karunia Nubuat"
// GMAHK Jemaat Pisgah BISDAC
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
    { idx: 0, label: "Sabat Petang", sub: "Pendahuluan & Hafalan" },
    { idx: 1, label: "Minggu", sub: "Pelajaran Hari 1" },
    { idx: 2, label: "Senin", sub: "Pelajaran Hari 2" },
    { idx: 3, label: "Selasa", sub: "Pelajaran Hari 3" },
    { idx: 4, label: "Rabu", sub: "Pelajaran Hari 4" },
    { idx: 5, label: "Kamis", sub: "Pelajaran Hari 5" },
    { idx: 6, label: "Jumat", sub: "Pendalaman & Doa" }
];

// Data Pelajaran 5 Built-in (100% Offline Standby)
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
      "content": "<h3 id=\"untuk-pelajaran-pekan-ini-bacalah\">Untuk Pelajaran Pekan Ini Bacalah</h3>\n<p><a class=\"verse\" verse=\"Heb11-Heb12,2Tim315-2Tim317,2Tim32\">Ibr. 1: 1, 2; 2 Tim. 3: 15-17; 2</a> Pt: 1: 18-21; <a class=\"verse\" verse=\"Exod1714,Rev119,Ezek41-Ezek48\">Kel. 17: 14; Why. 1: 19; Yeh. 4: 1-8</a>.</p>\n<blockquote>\n<p>Ayat Hafalan</p>\n\"Inilah wahyu Yesus Kristus, yang dikaruniakan Allah kepada Nya, supaya ditunjukkan-Nya kepada hamba-hamba-Nya apa yang harus segera terjadi. Dan oleh malaikat-Nya yang diutus-Nya, Ia telah menyatakannya kepada hamba-Nya Yohanes. Yohanes telah bersaksi tentang firman Allah dan tentang kesaksian yang diberikan oleh Yesus Kristus, yaitu segala sesuatu yang telah dilihatnya\" (<a class=\"verse\" verse=\"Rev11-Rev12\">Wahyu 1: 1, 2</a>).\n</blockquote>\n<p>Rasul Yohanes telah menjadi bagian dari lingkaran dalam Kedua Belas Rasul (<a class=\"verse\" verse=\"Luke851,Matt171,Matt2636-Matt2637\">Luk. 8: 51; Mat. 17: 1; Mat. 26: 36, 37</a>). Setelah kenaikan Kristus, ia melanjutkan pelayanannya di Yerusalem. Namun, sebelum jatuhnya kota itu (70 M), ia pindah ke Efesus untuk mengawasi gereja-gereja di provinsi Romawi Asia Kecil. Selama penganiayaan Kristen di bawah kaisar Romawi Domitianus, rasul itu diasingkan ke Patmos, sebuah pulau di Laut Aegea.</p>\n<p>Di Patmos, Yohanes menerima pekabaran nubuatan khusus yang ditujukan tidak hanya kepada tujuh jemaat di Asia Kecil, melainkan juga kepada orang-orang Kristen sepanjang zaman (<a class=\"verse\" verse=\"Rev11-Rev13,Rev19-Rev111\">Why. 1: 1-3, 9-11</a>). Rantai penyampaian pekabaran nubuatan, di mana Yohanes menjadi bagiannya, terlihat seperti ini: Allah Bapa, kepada Yesus Kristus, kepada malaikat, kepada rasul Yohanes, dan kepada para pembaca serta pendengar.</p>\n<p>Ini adalah contoh klasik dari proses wahyu-inspirasi di mana Allah menggunakan para nabi untuk mengomunikasikan berbagai pekabaran-Nya kepada umat manusia. Pekan ini kita akan secara khusus meneliti proses wahyu-inspirasi yang beragam, dengan fokus khusus pada cara lisan, tertulis, dan dramatisasi di mana pekabaran Ilahi telah dikomunikasikan kepada manusia.</p>\n<p><em>Pelajari pelajaran pekan ini untuk persiapan Sabat, 31 Oktober.</em></p>\n"
    },
    {
      "idx": 1,
      "id": "02",
      "title": "Wahyu Umum dan Khusus",
      "date": "25/10/2026",
      "content": "<p><code>Bacalah <a class=\"verse\" verse=\"Heb11-Heb12\">Ibrani 1: 1, 2</a>. Mengapakah Allah begitu tertarik untuk berbicara kepada kita? Apakah yang Ia sampaikan kepada kita melalui Yesus dan para nabi?</code></p>\n<p>Apakah yang akan dikatakan Pencipta kosmos kepada kita? Mengapakah Ia berkomunikasi dengan kita? Itu karena kita adalah manusia yang telah jatuh dalam dosa di dunia yang berdosa dan menghadapi kematian, penderitaan, dan ujian; karena itu, Allah berbicara kepada kita karena Ia ingin kita mengetahui mengapa kita ada di sini, mengapa keadaan begitu buruk, dan mengapa, terlepas dari semua itu, kita dapat berharap pada kasih-Nya bagi kita.</p>\n<p>Wahyu umum Allah, seperti yang terlihat di alam, berbicara dengan fasih tentang kuasa-Nya yang tak terbatas dan kasih-Nya yang peduli. Raja Daud berseru, &quot;Langit menceritakan kemuliaan Allah, dan cakrawala memberitakan pekerjaan tangan-Nya&quot; (<a class=\"verse\" verse=\"Ps192\">Mzm. 19: 2</a>). Rasul Paulus menambahkan, &quot;Sebab apa yang tidak nampak dari pada-Nya, yaitu kekuatan-Nya yang kekal dan keilahian-Nya, dapat dilihat dan dipahami dari karya-Nya sejak dunia diciptakan, sehingga mereka tidak dapat berdalih&quot; (<a class=\"verse\" verse=\"Rom120\">Rm. 1: 20</a>).</p>\n<p>Juga menakjubkan untuk merenungkan kuasa pemulihan Allah yang dimanifestasikan dalam proses penyembuhan misterius di dunia kita. Memang, &quot;Kuasa Allah yang menyembuhkan berlaku di seluruh alam. Jika sebatang pohon ditebang, jika seorang manusia terluka atau patah sebuah tulang, alam segera mulai memperbaiki luka itu. Bahkan sebelum keperluan itu ada, alat-alat penyembuhan sudah siap; dan segera setelah satu bagian terluka, setiap tenaga bekerja mengadakan pemulihan&quot; —Ellen G. White, Membina Pendidikan Sejati, hlm. 101.</p>\n<p>Seindah dan instruktif apa pun alam, ia mengungkapkan bukan hanya kuasa dan kasih Sang Pencipta, melainkan juga keberadaan ejahatan (lihat <a class=\"verse\" verse=\"Gen314-Gen319,Matt1324-Matt1330\">Kej. 3: 14-19; Mat. 13: 24-30</a>). Pekabaran yang ambigu ini hanya dapat dipahami dengan benar dalam terang wahyu khusus Allah-baik dalam Yesus Kristus, Firman Allah yang menjelma, maupun dalam Alkitab, Firman Allah Tertulis yang bersaksi tentang Dia (<a class=\"verse\" verse=\"John539\">Yoh. 5: 39</a>).</p>\n<p>Kitab Suci adalah catatan yang diilhami dari berbagai pekabaran Allah kepada semua manusia sepanjang zaman. Kitab Suci memberi tahu kita tentang Penciptaan dunia dan kejatuhannya yang tragis, dan tentang rencana penebusan Allah yang menakjubkan serta pemulihan akhir planet Bumi. Sesingkat dan seselektif apa pun beberapa narasi alkitabiah, narasi-narasi itu selalu dapat diandalkan, karena itu adalah Allah yang berbicara kepada kita (lihat <a class=\"verse\" verse=\"2Tim316,2Pet119-2Pet121\">2 Tim. 3: 16;2 Ptr. 1: 19-21</a>).</p>\n<p><code>Meskipun alam pastinya menunjuk pada realitas kuasa dan kasih Sang Pencipta, mengapakah kita masih sangat membutuhkan Firman Tertulis juga? Apakah yang Firman itu ceritakan kepada kita yang tidak diceritakan oleh alam, di dalam dan dari dirinya sendiri?</code></p>\n"
    },
    {
      "idx": 2,
      "id": "03",
      "title": "Proses Inspirasi",
      "date": "26/10/2026",
      "content": "<p>Banyak buku dan tulisan, bukan hanya Alkitab, telah sampai kepada kita selama berabad-abad. Namun, kita menganggap Alkitab sebagai Firman Allah. Apakah yang memisahkannya dari tulisan-tulisan lain?</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"2Tim315-2Tim317,Jas117\">2 Timotius 3: 15-17 dan Yakobus 1: 17</a>. Pekabaran penting apakah yang harus kita ambil dari ayat-ayat ini?</code></p>\n<p>Ada beberapa diskusi tentang terjemahan terbaik dari <a class=\"verse\" verse=\"2Tim316\">2 Timotius 3: 16</a>, tetapi sebagian besar terjemahan Alkitab menerjemahkan bagian ini dengan cara yang sama, menekankan bahwa seluruh Alkitab berasal dari Ilahi (<a class=\"verse\" verse=\"2Pet120-2Pet121\">2 Ptr. 1: 20, 21</a>). Seorang komentator Alkitab menjelaskan bahwa &quot;tampaknya lebih mungkin bahwa Paulus sedang merenungkan kitab suci secara keseluruhan di sini dan bahwa ia akan mengatakan bahwa keseluruhan kitab suci itu &#39;bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran,&#39; daripada bahwa setiap bagian kitab suci bermanfaat dalam cara-cara ini&quot;-G. W. Knight III, The Pastoral Epistles: A Commentary on the Greek Text (Grand Rapids, MI: Eerdmans, 1992), hlm. 445.</p>\n<p>Namun, bagaimanakah seharusnya kita memahami proses inspirasi yang melahirkan Alkitab? Kita harus menyadari bahwa inspirasi nubuat adalah Roh Kudus yang membantu nabi-nabi yang benar untuk komunikasi pekabaran Ilahi yang dapat diandalkan. Bantuan itu diberikan tidak hanya dalam proses menerima pekabaran, melainkan juga dalam mengomunikasikan pekabaran tersebut dengan jelas kepada penerimanya.</p>\n<p>Berbagai pekabaran Allah datang melalui penglihatan dan mimpi (<a class=\"verse\" verse=\"Num126,Isa61,Isa68\">Bil. 12: 6; Yes. 6: 1, 8</a>). Allah juga menggunakan saksi mata (<a class=\"verse\" verse=\"1John11-1John13\">1 Yoh. 1: 1-3</a>), penelitian sejarah yang diilhami Roh (<a class=\"verse\" verse=\"Luke11-Luke13\">Luk. 1: 1-3</a>), dan kesan Ilahi pada pikiran (<a class=\"verse\" verse=\"2Pet121\">2 Ptr. 1: 21</a>).</p>\n<p>Terlepas dari cara yang digunakan oleh Roh Kudus, para nabi dan penulis Alkitab diberi pekabaran kebenaran yang objektif, bukan subjektif, untuk dibagikan. Artinya, berbagai pekabaran Allah tidak boleh diubah atau didistorsi dengan cara apa pun oleh utusan-utusan-Nya, bahkan jika mereka menggunakan kata-kata mereka sendiri untuk mengungkapkan berbagai pekabaran tersebut. Tugas mengomunikasikan pekabaran nubuat kepada pendengar aslinya dapat dilakukan secara lisan (<a class=\"verse\" verse=\"2Pet119-2Pet121\">2 Ptr: 1: 19-21</a>), atau dalam bentuk tertulis (<a class=\"verse\" verse=\"John2030-John2031\">Yoh. 20: 30, 31</a>), atau bahkan melalui dramatisasi (<a class=\"verse\" verse=\"Ezek41-Ezek48\">Yeh. 4: 1-8</a>).</p>\n<p><code>Meskipun banyak pertanyaan tetap ada tentang bagaimanakah Alkitab diilhami, atau bagaimanakah inspirasi bekerja secara umum, mengapakah begitu penting untuk memercayai Alkitab sebagai Firman Allah yang diilhami, terlepas dari apa yang mungkin tidak sepenuhnya kita pahami tentang bagaimanakah itu ditulis?</code></p>\n"
    },
    {
      "idx": 3,
      "id": "04",
      "title": "Pekabaran Lisan",
      "date": "27/10/2026",
      "content": "<p><code>Bacalah <a class=\"verse\" verse=\"2Pet118-2Pet121\">2 Petrus 1: 18-21</a>. Jaminan apakah yang kita miliki bahwa pekabaran lisan yang disampaikan oleh nabi-nabi Allah sama diilhaminya dan dapat diandalkannya dengan pekabaran tertulis?</code></p>\n<p>Allah berbicara kepada Adain dan Hawa sebelum Kejatuhan (<a class=\"verse\" verse=\"Gen216-Gen217\">Kej. 2: 16, 17</a>) dan sesudahnya (<a class=\"verse\" verse=\"Gen39-Gen319\">Kej. 3: 9-19</a>). Dalam kedua kasus tersebut, mereka memahami firman-Nya dengan sempurna. Suara-Nya terdengar dalam istilah yang jelas juga di Sinai (<a class=\"verse\" verse=\"Exod201-Exod2020\">Kel. 20: 1-20</a>), serta pada saat pembaptisan dan transfigurasi Yesus (<a class=\"verse\" verse=\"Matt317,Matt175\">Mat. 3: 17; Mat. 17: 5</a>).</p>\n<p>Kita mungkin salah menafsirkan ketika orang lain berbicara kepada kita. kepada Musa: &#39;Akulah TUHAN&quot;&#39; (<a class=\"verse\" verse=\"Exod61\">Kel. 6: 1</a>). Banyak penulis Alkitab mengakui mendengar suara Allah saat Ia berbicara kepada mereka. Hal ini terjadi, misal nya, pada Yesaya (<a class=\"verse\" verse=\"Isa81,Isa811,Jer14,Jer19,Jer111\">Yes. 8: 1, 11), Yeremia (Yer. 1: 4, 9, 11)</a>, dan Yehezkiel (<a class=\"verse\" verse=\"Ezek316,Ezek61\">Yeh. 3: 16; Yeh. 6: 1</a>). Segala upaya untuk menyangkal klaim-klaim ini dan yang serupa lainnya berakhir dengan mempertanyakan kejujuran para nabi dan keandalan Alkitab itu sendiri.</p>\n<p>Sebagaimana Allah berbicara kepada para nabi dalam bahasa manusia yang dapat dimengerti, demikian pula para nabi berbicara kepada pendengar mereka masing-masing. Sebagai contoh, Nuh adalah nabi Allah yang benar dan &quot;pemberita kebenaran&quot; yang setia (<a class=\"verse\" verse=\"2Pet25\">2 Ptr. 2: 5</a>). Ia tidak menulis bagian apa pun dari Alkitab, tetapi ia menyampaikan pekabaran Allah secara lisan kepada orang-orang sezamannya, dan pekabarannya tidak kalah diilhaminya dibandingkan tulisan-tulisan nabi-nabi kanonik. Beberapa nabi lain, termasuk Natan, Elia, Elisa, dan Yohanes Pembaptis, tidak pernah menulis bagian apa pun dari Alkitab; sebaliknya, mereka menyampaikan pekabaran mereka secara lisan.</p>\n<p>Dan bagaimanakah dengan Yesus Kristus sendiri? Catatan Injil menyebutkan bahwa selama pelayanan duniawi-Nya &quot;Yesus membungkuk lalu menulis dengan jari-Nya di tanah&quot; (<a class=\"verse\" verse=\"John86\">Yoh. 8: 6</a>). Itu saja. Kita tidak memiliki catatan bahwa Yesus menulis hal lain. Namun, Ia mengajar dan berkhotbah secara lisan &quot;sebagai orang yang berkuasa&quot; (<a class=\"verse\" verse=\"Matt729\">Mat. 7: 29</a>). Beberapa pendengar-Nya bahkan mengakui, &quot;Belum pernah seorang manusia berkata-kata seperti orang itu!&quot; (<a class=\"verse\" verse=\"John746\">Yoh. 7: 46</a>). Yesus terutama adalah komunikator lisan berbagai pekabaran Allah. Berbagai pekabaran-Nya tidak kalah otoritatif atau mengikatnya hanya karena Dia sendiri tidak menulis buku-buku Alkitab.</p>\n<p><code>Sungguh menarik bahwa Allah memiliki nabi-nabi yang tidak memiliki tulisan di dalam Alkitab. Mengapakah nabi-nabi nonkanonik ini juga membawa otoritas?</code></p>\n"
    },
    {
      "idx": 4,
      "id": "05",
      "title": "Pekabaran Tertulis",
      "date": "28/10/2026",
      "content": "<p>Beberapa pidato terkenal telah berdampak mendalam pada kehidupan orang-orang dan bahkan mengubah jalannya sejarah. Jika pidato-pidato ini tidak direkam, kata-kata itu akan memudar atau menjadi terdistorsi seiring berjalannya waktu. Dengan demikian, tulisan memberikan keabadian pada kata yang diucapkan, dan keabadian itu memungkinkan pekabaran tersebut ditransmisikan melintasi waktu.</p>\n<p>Tak lama setelah orang Israel meninggalkan Mesir dan mengalahkan orang Amalek, Allah memerintahkan Musa untuk &quot;tuliskanlah semuanya ini dalam sebuah kitab sebagai tanda peringatan&quot; (<a class=\"verse\" verse=\"Exod1714\">Kel. 17: 14</a>). Dimulai dengan Musa, yang menulis lima kitab pertama Alkitab dan <a class=\"verse\" verse=\"Ps90\">Mazmur 90</a>, Roh Kudus membimbing para nabi kanonik untuk menghasilkan tulisan-tulisan yang sekarang terdiri dari 66 kitab dalam Alkitab.</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"Exod1714,John2030-John2031,1Cor1011,Rev119\">Keluaran 17: 14; Yohanes 20: 30, 31; 1 Korintus 10: 11; dan Wahyu 1: 19</a>. Apakah beberapa alasan Allah meminta nabi-nabi-Nya untuk menuliskan berbagai pekabaran yang Ia berikan kepada mereka?</code></p>\n<p>Berbagai kitab dalam Alkitab mencerminkan gaya sastra dan keterampilan penulisnya masing-masing. Seperti yang akan kita bahas dalam pelajaran pekan depan, nuansa pribadi dan berbagai gaya dari setiap penulis tidak mengurangi pekabaran mereka, karena tidak ada &quot;tingkatan&quot; inspirasi. Beberapa bagian Alkitab jelas lebih relevan dan dapat diterapkan pada kehidupan dan iman kita saat ini daripada bagian lain. Namun, kebenaran ini tidak membuat satu bagian Alkitab lebih diilhami daripada bagian lain.</p>\n<p>Terkadang penulis Alkitab mencatat berbagai pekabaran terilhami yang pertama kali mereka sampaikan secara lisan, oleh mereka sendiri, atau oleh rekan tepercaya. Dalam kitab Ulangan, Musa mencatat pidato-pidato terakhir yang ia sampaikan kepada orang Israel sebelum kematiannya. Keempat Injil mencatat banyak khotbah dan ajaran Yesus selama pelayanan duniawi-Nya.</p>\n<p>Namun, ada contoh di mana para nabi mengutip sumber-sumber yang tidak diilhami (<a class=\"verse\" verse=\"Acts1728,1Cor1533,Titus112\">Kis. 17: 28; 1 Kor. 15: 33; Tit. 1: 12</a>) dan bahkan perkataan Iblis (<a class=\"verse\" verse=\"Gen31-Gen35,Matt41-Matt411\">Kej. 3: 1-5; Mat. 4: 1-11</a>). Kita harus ingat bahwa saat para nabi mencatat perasaan dan keinginan orang lain, mereka juga mengungkapkan reaksi manusiawi mereka sendiri (lihat <a class=\"verse\" verse=\"Dan827,Rev228-Rev229\">Dan. 8: 27; Why. 22: 8, 9</a>). Lebih jauh lagi, Alkitab menggambarkan banyak contoh baik untuk ditiru, tetapi juga banyak contoh buruk untuk dihindari (<a class=\"verse\" verse=\"1Cor101-1Cor1011\">1 Kor. 10: 1-11</a>). Saat membaca Alkitab, kita harus mengingat bahwa, meskipun tidak ditulis dalam bahasa yang sempurna, Alkitab membawa pekabaran yang tidak mungkin salah yang akan bertahan dalam ujian waktu.</p>\n"
    },
    {
      "idx": 5,
      "id": "06",
      "title": "Drama, Simbol, dan Perumpamaan",
      "date": "29/10/2026",
      "content": "<p>Alkitab memiliki variasi yang kaya akan gambaran kata dan metafora. Sebagai contoh, seluruh sistem pengorbanan Perjanjian Lama dari mezbah-mezbah bapa leluhur, kemah suci Musa, dan Bait Suci di Yerusalem adalah representasi piktografis dari pengorbanan penebusan Kristus di kayu salib dan keimamatan surgawi-Nya (<a class=\"verse\" verse=\"Heb81-Heb86\">Ibr. 8: 1-6</a>). Dalam nubuatan Daniel, kerajaan dan kekuasaan di dunia diwakili oleh berbagai bagian dari sebuah patung besar (<a class=\"verse\" verse=\"Dan231-Dan245\">Dan. 2: 31-45</a>), berbagai binatang dan tanduk (<a class=\"verse\" verse=\"Dan7-Dan8\">Daniel 7 dan 8</a>), dan dua raja (<a class=\"verse\" verse=\"Dan11\">Daniel 11</a>). Representasi serupa juga muncul dalam kitab Wahyu, seperti dalam kasus dua binatang di pasal 13.</p>\n<p>Dalam ajaran-Nya, Yesus berbicara tentang diri-Nya, misalnya, sebagai Roti Hidup (<a class=\"verse\" verse=\"John635,John641-John658\">Yoh. 6: 35, 41-58</a>), Terang Dunia (<a class=\"verse\" verse=\"John812,John95\">Yoh. 8: 12; Yoh. 9: 5</a>), dan Pokok Anggur yang Benar (<a class=\"verse\" verse=\"John151-John158\">Yoh. 15: 1-8</a>). Dan melalui perumpamaan penabur (<a class=\"verse\" verse=\"Matt131-Matt139,Matt1318-Matt1323\">Mat. 13: 1-9, 18-23</a>) dan beberapa perumpamaan lainnya (<a class=\"verse\" verse=\"Matt1324-Matt1352\">Mat. 13: 24-52</a>, dst.), Yesus mengilustrasikan sifat dan pertumbuhan kerajaan-Nya.</p>\n<p><code>Bacalah <a class=\"verse\" verse=\"Ezek41-Ezek48\">Yehezkiel 4: 1-8</a>. Mengapakah menurut Anda Allah tidak hanya berbicara secara lisan tetapi juga mendramatisasi beberapa pekabaran Nya?</code></p>\n<p>Sebuah dramatisasi yang jelas muncul dalam <a class=\"verse\" verse=\"Ezek41-Ezek48\">Yehezkiel 4: 1-8</a>, di mana Allah meminta nabi itu untuk membuat model miniatur Yerusalem dan membaringkan dirinya, pertama di sisi kirinya selama 390 hari, mewakili kaum Israel, dan kemudian di sisi kanannya selama 40 hari, mewakili kaum Yehuda. Pengalaman visual lainnya adalah pernikahan Hosea yang ditahbiskan secara Ilahi dengan Gomer, seorang pelacur, yang mewakili ketidaksetiaan rohani Israel kepada Allah (<a class=\"verse\" verse=\"Hos12-Hos19\">Hos. 1: 2-9</a>).</p>\n<p>Pengalaman dramatis Yehezkiel dan Hosea tampak cukup mengejutkan saat ini. Namun, itulah intinya: hal-hal itu seharusnya mengejutkan, bukan hanya bagi kita, melainkan juga bagi orang-orang pada masa itu. Pada saat peringatan para nabi ditolak secara terbuka (lihat <a class=\"verse\" verse=\"2Chr3615-2Chr3621\">2 Taw. 36: 15-21</a>), tindakan terakhir belas kasihan Ilahi adalah secara dramatis memperingatkan orang-orang tentang kondisi mereka yang sebenarnya guna memimpin mereka pada pertobatan yang tulus. Presentasi yang dramatis seperti itu tentu seharusnya menunjukkan kepada mereka betapa seriusnya mereka harus menanggapi peringatan Allah kepada mereka.</p>\n<p><code>Jenis dramatisasi apakah yang mungkin dilakukan seseorang hari ini untuk memperingatkan kita tentang, misalnya, menjadi Laodikia? (Lihat <a class=\"verse\" verse=\"Rev314-Rev318\">Why, 3: 14-18</a>).</code></p>\n"
    },
    {
      "idx": 6,
      "id": "07",
      "title": "Ellen G. White tentang Wahyu dan Inspirasi",
      "date": "30/10/2026",
      "content": "<p>Gereja Masehi Advent Hari Ketujuh percaya bahwa Ellen G. White diilhami secara Ilahi. Tulisan, kehidupan, dan pelayanannya memenuhi kriteria nabi yang benar. Ia memiliki kualitas inspirasi yang sama dengan nabi-nabi Alkitab, meskipun ia tidak pernah menganggap tulisannya sama dengan Kitab Suci. Sebaliknya, Ellen G. White selalu meninggikan Alkitab. Namun, bagaimanakah ia sendiri memahami wahyu nubuatan Allah kepadanya dan proses inspirasinya?</p>\n<p>Pertama, Ellen G. White selalu menganggap Alkitab sebagai wahyu Allah yang otoritatif dan tidak mungkin salah. Alkitab mengungkapkan kebenaran Allah dan rencana keselamatan-Nya bagi umat manusia yang telah jatuh. Dalam proses itu, seperti yang sedang kita pelajari, Ia menggunakan para nabi untuk mengomunikasikan berbagai pekabaran-Nya.</p>\n<p>Kedua, Ellen G. White menyadari bahwa proses inspirasi melibatkan interaksi Ilahi-manusia. Allah mengomunikasikan berbagai pekabaran-Nya, tetapi kemudian nabi akan menyampaikan instruksi Ilahi itu menggunakan kata-katanya sendiri. Seperti yang dikatakan Ellen G. White:</p>\n<p>&quot;Bukanlah kata-kata dalam Alkitab yang diilhami, tetapi manusianyalah yang diilhami. Inspirasi tidak bertindak pada kata-kata manusia atau ekspresinya tetapi pada manusia itu sendiri, yang, di bawah pengaruh Roh Kudus, diilhami dengan pikiran. ... Pikiran dan kehendak Ilahi digabungkan dengan pikiran dan kehendak manusia; dengan demikian ucapan manusia adalah firman Allah&quot; —Selected Messages, jld. 1, hlm. 21.</p>\n<p>Sehubungan dengan penglihatan dan mimpi nubuat, Ellen G. White memahami &quot;inspirasi pikiran&quot; sebagai penyatuan wahyu Ilahi dan pengalaman manusia. Ia menulis, &quot;Alkitab, dengan kebenaran-kebenaran yang diberikan Allah yang diungkapkan dalam bahasa manusia, menyajikan penyatuan antara yang Ilahi dan yang insani&quot; (Selected Messages, jld. 1, hlm. 25). Allah menggunakan banyak cara untuk menghasilkan pemahaman tentang pekabaran-Nya dalam pikiran utusan-Nya. Ini termasuk representasi gambar, kata-kata, dan pemikiran yang melibatkan semua indra nabi. Pengalaman Ellen G. White serupa dengan pengalaman para penulis Alkitab.</p>\n<p>Ketiga, Ellen G. White mencatat bahwa tidak semua pengalaman dan komunikasi manusianya diilhami.</p>\n<p>&quot;Ada kalanya hal-hal umum harus dinyatakan,&quot; nasihatnya, &quot;pikiran-pikiran umum harus mengisi pikiran, surat-surat umum harus ditulis dan informasi diberikan yang telah disampaikan dari satu pekerja ke pekerja lainnya. Kata-kata seperti itu, informasi seperti itu, tidak diberikan di bawah inspirasi khusus Roh Allah&quot; —Selected Messages, jld. 1, hlm. 39.</p>\n<p>Penting untuk menyadari perbedaan in saat kita membaca dan menghubungkan dengan tulisan-tulisan dan pengalamannya, khususnya korespondensi dan buku hariannya. Mengetahui pemahaman Ellen G. White tentang wahyu dan inspirasi membantu kita menghindari hal-hal ekstrem dan membaca nasi hat-nasihatnya dengan bijaksana disertai pengertian.</p>\n<p>Untuk mengetahui lebih lanjut, kunjungi <a href=\"https://whiteestate.org/absg/5\">https://whiteestate.org/absg/5</a>.</p>\n"
    }
  ]
};

export default function DetailSekolahSabat({ setActiveTab, dataPejabat, setHideGlobalBack }) {
    // Sembunyikan tombol back global karena komponen ini memiliki sticky header sendiri
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
    const [lessonData, setLessonData] = useState(() => {
        try {
            const cached = localStorage.getItem(`pisgah_ss_lesson_2026_04_${currentActiveLessonId}`);
            if (cached) return JSON.parse(cached);
        } catch (e) { }
        return currentActiveLessonId === "05" ? BUILTIN_LESSON_5 : BUILTIN_LESSON_5;
    });
    const [isLoading, setIsLoading] = useState(false);

    // Ambil data pelajaran ketika lessonId berubah
    useEffect(() => {
        let isMounted = true;
        const fetchLesson = async () => {
            // 1. Cek cache lokal
            try {
                const cached = localStorage.getItem(`pisgah_ss_lesson_2026_04_${selectedLessonId}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (isMounted) setLessonData(parsed);
                    return;
                }
            } catch (e) { }

            // 2. Jika Pelajaran 5 dan belum ada cache, gunakan builtin
            if (selectedLessonId === "05") {
                if (isMounted) setLessonData(BUILTIN_LESSON_5);
                try {
                    localStorage.setItem("pisgah_ss_lesson_2026_04_05", JSON.stringify(BUILTIN_LESSON_5));
                } catch (e) { }
                return;
            }

            // 3. Tarik dari API Adventech
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
                        daysData.push({
                            idx: i,
                            id: d.id,
                            title: d.title,
                            date: d.date,
                            content: readData.content
                        });
                    } catch (err) {
                        daysData.push({
                            idx: i,
                            id: d.id,
                            title: d.title,
                            date: d.date,
                            content: "<p>Konten sedang dimuat atau perangkat sedang offline.</p>"
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
                        localStorage.setItem(`pisgah_ss_lesson_2026_04_${selectedLessonId}`, JSON.stringify(assembled));
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

    // Kelas ukuran font responsif ramah lansia
    const fontClass = fontSizeLevel === 2
        ? "text-xl sm:text-2xl leading-relaxed font-medium"
        : fontSizeLevel === 1
            ? "text-lg sm:text-xl leading-relaxed"
            : "text-base sm:text-lg leading-relaxed";

    const handlePrevDay = () => {
        if (selectedDayIdx > 0) setSelectedDayIdx(prev => prev - 1);
    };

    const handleNextDay = () => {
        if (selectedDayIdx < 6) setSelectedDayIdx(prev => prev + 1);
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in relative pb-16 text-[#2C3F21] dark:text-gray-100">
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
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition ${fontSizeLevel === 0 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
                            title="Ukuran Font Standar"
                        >
                            A
                        </button>
                        <button
                            type="button"
                            onClick={() => setFontSizeLevel(1)}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition ${fontSizeLevel === 1 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
                            title="Ukuran Font Besar"
                        >
                            A+
                        </button>
                        <button
                            type="button"
                            onClick={() => setFontSizeLevel(2)}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition ${fontSizeLevel === 2 ? "bg-navy-900 text-gold-400 dark:bg-gold-500 dark:text-navy-950" : "text-navy-600 dark:text-gray-300 hover:bg-navy-100"}`}
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

            {/* KARTU HEADER TRIWULAN & TEMA PEKAN INI */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1C2C16] via-[#2A4422] to-[#1E3019] dark:from-navy-900 dark:via-navy-950 dark:to-navy-900 p-6 md:p-8 text-white shadow-xl border-2 border-[#4A7045]/60 dark:border-gold-500/40">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/40 font-extrabold text-[10.5px] uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5" /> Pedoman Pendalaman Alkitab Dewasa
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
                                <Sparkles className="w-4 h-4 text-gold-400" /> Ayat Hafalan Pekan Ini
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveTab("alkitab")}
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
                                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer min-w-[5.5rem] sm:min-w-[6.5rem] relative ${
                                    isActive
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
                                    {isToday ? "Hari Ini ⭐" : tab.sub.split(" ")[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* KONTEN BACAAN PELAJARAN HARIAN */}
            <div className="glass-box rounded-[2rem] shadow-sm border border-navy-100/60 dark:border-navy-800 p-5 sm:p-8 relative">
                {isLoading ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-[#4A7045] dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm font-bold text-navy-600 dark:text-gray-300">Memuat teks pelajaran harian Sekolah Sabat...</p>
                    </div>
                ) : currentDay ? (
                    <div className="space-y-6">
                        {/* Judul & Tanggal Hari Pelajaran */}
                        <div className="border-b border-navy-100 dark:border-navy-800 pb-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <span className="text-xs font-black uppercase tracking-wider text-[#4A7045] dark:text-gold-400">
                                    {SS_DAY_TABS[selectedDayIdx]?.label} • Pelajaran Harian
                                </span>
                                {currentDay.date && (
                                    <span className="text-xs text-navy-500 dark:text-gray-400 font-bold bg-navy-50 dark:bg-navy-900 px-2.5 py-1 rounded-lg">
                                        🗓 {currentDay.date}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                                {currentDay.title}
                            </h2>
                        </div>

                        {/* Isi Teks Pelajaran */}
                        <div
                            className={`ss-reader-content prose dark:prose-invert max-w-none text-[#2C3F21] dark:text-gray-200 ${fontClass}`}
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
        </div>
    );
}
