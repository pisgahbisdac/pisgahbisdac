#!/bin/bash
# Script untuk sinkronisasi otomatis ke GitHub

echo "========================================"
echo " Memulai sinkronisasi ke GitHub..."
echo " Waktu: $(date +'%Y-%m-%d %H:%M:%S')"
echo "========================================"

# Menambahkan semua perubahan ke staging
git add .

# Membuat komit dengan pesan waktu otomatis
git commit -m "Update otomatis: $(date +'%Y-%m-%d %H:%M:%S')"

# Mendorong perubahan ke GitHub
if git push origin main; then
    echo "========================================"
    echo " Sinkronisasi Berhasil! ✅"
    echo "========================================"
else
    # Jika branch utamanya 'master' (bukan main)
    if git push origin master; then
        echo "========================================"
        echo " Sinkronisasi Berhasil (Branch: Master)! ✅"
        echo "========================================"
    else
        echo "========================================"
        echo " Gagal melakukan push ke GitHub. ❌"
        echo " Pastikan koneksi internet dan akses Git Anda sudah benar."
        echo "========================================"
    fi
fi
