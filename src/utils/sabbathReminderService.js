import { getSabbathSunsetSchedule } from '../components/portal/portalShared';

const REMINDER_STORAGE_KEY = 'PISGAH_SABBATH_REMINDERS_ENABLED';

export const isNotificationSupported = () => {
    return typeof window !== 'undefined' && 'Notification' in window;
};

export const getReminderPreference = () => {
    try {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem(REMINDER_STORAGE_KEY) === 'true';
    } catch (e) {
        return false;
    }
};

export const setReminderPreference = (enabled) => {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(REMINDER_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {}
};

export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) return 'unsupported';
    try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
            setReminderPreference(true);
            showInstantNotification(
                '🔔 Pengingat Sabat & Ibadah Aktif',
                'Puji Tuhan! Anda akan menerima pengingat saat memasuki Sabat Suci di Batam dan jadwal ibadah GMAHK Pisgah.'
            );
        } else {
            setReminderPreference(false);
        }
        return perm;
    } catch (e) {
        console.warn('Gagal meminta izin notifikasi:', e);
        return 'denied';
    }
};

export const showInstantNotification = (title, body, icon = './icons/PisgahColor.png') => {
    if (!isNotificationSupported() || Notification.permission !== 'granted') return;
    try {
        const notif = new Notification(title, {
            body,
            icon,
            badge: icon,
            tag: 'pisgah-reminder-' + Date.now(),
            silent: false
        });
        notif.onclick = () => {
            window.focus();
            notif.close();
        };
    } catch (e) {
        console.warn('Gagal menampilkan notifikasi:', e);
    }
};

// Cek dan jadwalkan pengingat otomatis saat web terbuka
export const checkAndTriggerSabbathReminder = () => {
    if (!isNotificationSupported() || Notification.permission !== 'granted' || !getReminderPreference()) {
        return;
    }

    try {
        const now = new Date();
        const day = now.getDay(); // 0 = Minggu, 5 = Jumat, 6 = Sabtu
        const sched = getSabbathSunsetSchedule(now);

        // Pengingat Jumat Sore Masuk Sabat (17:00 - 18:30 WIB)
        if (day === 5) {
            const todayStr = now.toISOString().slice(0, 10);
            const flagKey = `pisgah_sunset_alert_${todayStr}`;
            if (!sessionStorage.getItem(flagKey)) {
                const sunsetTime = sched.bukaSabat.date;
                const diffMin = (sunsetTime.getTime() - now.getTime()) / (1000 * 60);

                // Jika berada dalam rentang 45 menit sebelum matahari terbenam atau baru saja terbenam
                if (diffMin <= 45 && diffMin >= -30) {
                    sessionStorage.setItem(flagKey, 'true');
                    showInstantNotification(
                        '🕊️ Selamat Memasuki Hari Sabat Suci!',
                        `Matahari terbenam di Batam pukul ${sched.bukaSabat.formatted} WIB. Selamat beribadah & menikmati perhentian bersama Tuhan.`
                    );
                }
            }
        }
    } catch (e) {
        console.warn('Error checking sabbath reminder:', e);
    }
};

