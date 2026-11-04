import React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './portalShared';

export const StoryShareModal = ({ isOpen, onClose, imageDataUrl, title = "Status Ibadah" }) => {
    if (!isOpen || !imageDataUrl) return null;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageDataUrl;
        a.download = `Status_Pisgah_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleShareWeb = async () => {
        try {
            if (navigator.share && navigator.canShare) {
                const blob = await (await fetch(imageDataUrl)).blob();
                const file = new File([blob], 'status_pisgah.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: title,
                        text: 'Jadwal & Warta Ibadah GMAHK Jemaat Pisgah BISDAC Batam',
                        files: [file]
                    });
                    return;
                }
            }
        } catch (e) {
            console.warn('Web Share tidak didukung atau dibatalkan:', e);
        }
        handleDownload();
    };

    const modalContent = (
        <div className="fixed inset-0 z-[550] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

            <div className="relative w-full max-w-sm bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border-2 border-[#E2E8D8] dark:border-navy-700 overflow-hidden z-10 flex flex-col">
                <div className="p-4 border-b border-[#E2E8D8] dark:border-navy-800 flex items-center justify-between bg-[#F7F9F3] dark:bg-navy-950">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-[#25D366]/20 text-[#128C7E] dark:text-emerald-400 flex items-center justify-center font-black">
                            <Icon name="WhatsApp" className="w-4 h-4" />
                        </span>
                        <div>
                            <h4 className="text-sm font-black text-navy-900 dark:text-white">Status WA / IG Story</h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Siap dibagikan ke jemaat</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1">
                        <Icon name="X" className="w-4 h-4" />
                    </button>
                </div>

                {/* Image Preview */}
                <div className="p-4 bg-navy-950 flex justify-center items-center">
                    <img
                        src={imageDataUrl}
                        alt="Preview Status"
                        className="max-h-[58vh] w-auto rounded-xl shadow-lg border border-gold-400/30 object-contain"
                    />
                </div>

                {/* Actions */}
                <div className="p-4 bg-[#F7F9F3] dark:bg-navy-950/80 border-t border-[#E2E8D8] dark:border-navy-800 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-navy-800 hover:bg-gray-100 dark:hover:bg-navy-700 border border-[#C5D5BC] dark:border-navy-700 text-[#2C3F21] dark:text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Icon name="Download" className="w-3.5 h-3.5" />
                            <span>Unduh Gambar</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleShareWeb}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                            <Icon name="Share" className="w-3.5 h-3.5" />
                            <span>Bagikan Langsung</span>
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 pt-1">
                        💡 Unduh lalu unggah ke <b>Status WhatsApp</b> atau <b>Instagram Story</b> HP Anda.
                    </p>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

