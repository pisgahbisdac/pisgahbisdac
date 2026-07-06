        export const cleanDateString = (dateInput) => {
            if (!dateInput) return "";
            if (typeof dateInput === 'string') {
                if (dateInput.includes('T')) return dateInput.split('T')[0];
                return dateInput;
            }
            return "";
        };

        export const formatLocalYYYYMMDD = (dateObj) => {
            if (!dateObj) return "";
            const year  = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day   = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        export const maskNoHp = (noHp) => {
            if (!noHp) return "-";
            const str = String(noHp).replace(/\s/g, "");
            if (str.length <= 4) return "****";
            const visible = str.slice(0, 4);
            const end     = str.slice(-2);
            const masked  = "*".repeat(Math.max(0, str.length - 6));
            return `${visible}${masked}${end}`;
        };

        export const parseLocalDate = (dateStr) => {
            if (!dateStr) return null;
            const cleaned = cleanDateString(dateStr);
            const parts   = cleaned.split('-');
            if (parts.length !== 3) return null;
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        };

        export const getSabbatsInMonth = (yearMonth) => {
            if (!yearMonth) return [];
            const [year, month] = yearMonth.split('-').map(Number);
            const sabbats = [];
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month - 1, d);
                if (date.getDay() === 6) {
                    sabbats.push(formatLocalYYYYMMDD(date));
                }
            }
            return sabbats;
        };
