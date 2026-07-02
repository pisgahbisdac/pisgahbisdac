export const DEFAULT_LAPORAN_API_URL = 'https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec';

function getActiveLaporanApiUrl() {
    const savedUrl = localStorage.getItem('BISDAC_api_url');
    return (savedUrl && savedUrl.trim() !== '') ? savedUrl.trim() : DEFAULT_LAPORAN_API_URL;
}

export async function fetchLaporanData() {
    try {
        const url = new URL(getActiveLaporanApiUrl());
        const timestamp = Date.now();
        
        // 1. Get Publik Token
        url.searchParams.set('action', 'login');
        url.searchParams.set('username', 'test');
        url.searchParams.set('password', 'Test1117!');
        url.searchParams.set('_t', timestamp);
        
        const resLogin = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
        const dataLogin = await resLogin.json();
        
        if (!dataLogin.success || !dataLogin.token) {
            console.error("Gagal login Publik untuk laporan:", dataLogin.message);
            return [];
        }
        
        const publicToken = dataLogin.token;

        // 2. Fetch Income
        url.searchParams.set('action', 'getIncomeList');
        url.searchParams.set('token', publicToken);
        url.searchParams.delete('username');
        url.searchParams.delete('password');
        url.searchParams.set('_t', timestamp + 1);
        const resInc = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
        const dataInc = await resInc.json();

        // 3. Fetch Expense
        url.searchParams.set('action', 'getExpenseList');
        url.searchParams.set('token', publicToken);
        url.searchParams.set('_t', timestamp + 2);
        const resExp = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
        const dataExp = await resExp.json();

        let allTransactions = [];

        if (dataInc && dataInc.success && Array.isArray(dataInc.data)) {
            const incFormatted = dataInc.data.map(tx => ({
                ...tx,
                type: 'income',
                // Pastikan sensor privasi di-set
                pihak: '*** (Privasi)'
            }));
            allTransactions = [...allTransactions, ...incFormatted];
        }

        if (dataExp && dataExp.success && Array.isArray(dataExp.data)) {
            const expFormatted = dataExp.data.map(tx => ({
                ...tx,
                type: 'expense',
                // Pastikan sensor privasi di-set
                pihak: '*** (Privasi)'
            }));
            allTransactions = [...allTransactions, ...expFormatted];
        }

        return allTransactions;
    } catch (error) {
        console.error("Gagal mengambil data Laporan Keuangan:", error);
        return [];
    }
}
