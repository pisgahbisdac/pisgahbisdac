const fs = require('fs');

const file = 'laporan.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Variables
content = content.replace(
  /let currentIncPhoto = '';\s*let currentExpPhoto = '';\s*let currentEditPhoto = '';/,
  `let currentIncPhotos = [];
    let currentExpPhotos = [];
    let currentEditPhotos = [];`
);

// 2. CSS updates
const cssInsert = `
    .photo-upload-grid { display: flex; gap: 10px; flex-wrap: wrap; }
    .photo-upload-grid .photo-upload-box { flex: 0 0 calc(33.333% - 7px); min-height: 80px; position: relative; margin-top: 0; }
    .photo-upload-grid .photo-preview { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm); }
    .remove-photo-btn { position: absolute; top: -5px; right: -5px; background: var(--red); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; padding: 0; }
`;
if (!content.includes('.photo-upload-grid')) {
  content = content.replace('</style>', cssInsert + '</style>');
}

// 3. Pemasukan HTML form
const incFormOld = `<label class="form-label">Foto Kuitansi (Opsional)</label>
                <label for="incPhotoUpload" class="photo-upload-box">
                  <div id="incPhotoIcon" style="color:var(--text3);">
                    <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span
                      style="margin-top:8px; display:inline-block; font-size:13px;">Unggah foto kuitansi</span>
                  </div>
                  <img id="incPhotoPreview" class="photo-preview" src="">
                </label>
                <input type="file" id="incPhotoUpload" accept="image/*" style="display:none"
                  onchange="handleReceiptPhoto(event, 'income')">`;

const incFormNew = `<label class="form-label">Foto Kuitansi (Opsional) - Max 3</label>
                <div class="photo-upload-grid" id="incPhotoGrid">
                  <label for="incPhotoUpload" class="photo-upload-box" id="incPhotoUploadBox" style="display:flex;">
                    <div style="color:var(--text3); text-align:center;">
                      <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span style="margin-top:8px; display:inline-block; font-size:11px;">Unggah Foto</span>
                    </div>
                  </label>
                </div>
                <input type="file" id="incPhotoUpload" accept="image/*" multiple style="display:none" onchange="handleReceiptPhoto(event, 'income')">`;

content = content.replace(incFormOld, incFormNew);

// 4. Pengeluaran HTML form
const expFormOld = `<label class="form-label">Foto Bukti (Opsional)</label>
              <label for="expPhotoUpload" class="photo-upload-box">
                <div id="expPhotoIcon" style="color:var(--text3);">
                  <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span
                    style="margin-top:8px; display:inline-block; font-size:13px;">Unggah foto nota</span>
                </div>
                <img id="expPhotoPreview" class="photo-preview" src="">
              </label>
              <input type="file" id="expPhotoUpload" accept="image/*" style="display:none"
                onchange="handleReceiptPhoto(event, 'expense')">`;

const expFormNew = `<label class="form-label">Foto Bukti (Opsional) - Max 3</label>
              <div class="photo-upload-grid" id="expPhotoGrid">
                <label for="expPhotoUpload" class="photo-upload-box" id="expPhotoUploadBox" style="display:flex;">
                  <div style="color:var(--text3); text-align:center;">
                    <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span style="margin-top:8px; display:inline-block; font-size:11px;">Unggah Nota</span>
                  </div>
                </label>
              </div>
              <input type="file" id="expPhotoUpload" accept="image/*" multiple style="display:none" onchange="handleReceiptPhoto(event, 'expense')">`;

content = content.replace(expFormOld, expFormNew);

// 5. Modal Edit Form
const editFormOld = `<label class="form-label">Foto Bukti Baru</label>
              <label for="editTransPhoto" class="photo-upload-box">
                <div id="editTransPhotoIcon" style="color:var(--text3);">
                  <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span
                    style="margin-top:8px; display:inline-block; font-size:13px;">Ganti foto kuitansi</span>
                </div>
                <img id="editTransPhotoPreview" class="photo-preview" src="">
              </label>
              <input type="file" id="editTransPhoto" accept="image/*" style="display:none"
                onchange="handleReceiptPhoto(event, 'edit')">`;

const editFormNew = `<label class="form-label">Foto Bukti Baru (Opsional) - Max 3</label>
              <div class="photo-upload-grid" id="editPhotoGrid">
                <label for="editTransPhoto" class="photo-upload-box" id="editPhotoUploadBox" style="display:flex;">
                  <div style="color:var(--text3); text-align:center;">
                    <script>document.write(getIcon('image', 'lucide-lg'))</script><br><span style="margin-top:8px; display:inline-block; font-size:11px;">Unggah Foto</span>
                  </div>
                </label>
              </div>
              <input type="file" id="editTransPhoto" accept="image/*" multiple style="display:none" onchange="handleReceiptPhoto(event, 'edit')">
              <div style="font-size:11px; color:var(--text3); margin-top:4px;">Mengunggah foto baru akan menimpa seluruh foto sebelumnya.</div>`;

content = content.replace(editFormOld, editFormNew);

// 6. Replace HandleReceiptPhoto & Modal logic
const oldPhotoJsRegex = /function handleReceiptPhoto\(event, type\) {[\s\S]*?function closePhotoModal\(\) \{[^\}]*?\}/m;

const newPhotoJs = `
    function handleReceiptPhoto(event, type) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      const MAX_CHARS = 48000;
      let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : currentEditPhotos);
      let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : 'editPhotoGrid');
      let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : 'editPhotoUploadBox');

      if (targetArray.length + files.length > 3) {
        notify('Maksimal 3 foto per transaksi!', 'error');
        event.target.value = '';
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let quality = 0.95; let scale = 1.0; let dataUrl = ''; let iterations = 0;
            let baseWidth = img.width; let baseHeight = img.height; const MAX_START = 1600;
            if (baseWidth > baseHeight && baseWidth > MAX_START) { baseHeight *= MAX_START / baseWidth; baseWidth = MAX_START; } 
            else if (baseHeight > MAX_START) { baseWidth *= MAX_START / baseHeight; baseHeight = MAX_START; }

            do {
              canvas.width = Math.floor(baseWidth * scale);
              canvas.height = Math.floor(baseHeight * scale);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              dataUrl = canvas.toDataURL('image/jpeg', quality);
              if (dataUrl.length > MAX_CHARS) {
                quality -= 0.1;
                if (quality < 0.4) { quality = 0.8; scale *= 0.8; }
              }
              iterations++;
            } while (dataUrl.length > MAX_CHARS && iterations < 15);

            targetArray.push(dataUrl);
            renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
          }
          img.src = e.target.result;
        }
        reader.readAsDataURL(file);
      });
      event.target.value = '';
    }

    function removePhoto(index, type) {
      let targetArray = type === 'income' ? currentIncPhotos : (type === 'expense' ? currentExpPhotos : currentEditPhotos);
      let targetGridId = type === 'income' ? 'incPhotoGrid' : (type === 'expense' ? 'expPhotoGrid' : 'editPhotoGrid');
      let targetUploadBoxId = type === 'income' ? 'incPhotoUploadBox' : (type === 'expense' ? 'expPhotoUploadBox' : 'editPhotoUploadBox');
      
      targetArray.splice(index, 1);
      renderPhotoPreview(targetArray, targetGridId, targetUploadBoxId, type);
    }

    function renderPhotoPreview(arr, gridId, boxId, type) {
      const grid = document.getElementById(gridId);
      Array.from(grid.querySelectorAll('.photo-preview-container')).forEach(el => el.remove());
      
      arr.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'photo-upload-box photo-preview-container';
        div.style.padding = '0';
        div.style.border = 'none';
        div.style.display = 'block';
        div.innerHTML = \`<img src="\${url}" class="photo-preview"><button class="remove-photo-btn" onclick="removePhoto(\${i}, '\${type}')">×</button>\`;
        grid.insertBefore(div, document.getElementById(boxId));
      });
      
      document.getElementById(boxId).style.display = arr.length >= 3 ? 'none' : 'flex';
    }

    function resetPhotoUpload(type) {
      if (type === 'income') { currentIncPhotos = []; renderPhotoPreview([], 'incPhotoGrid', 'incPhotoUploadBox', 'income'); document.getElementById('incPhotoUpload').value = ''; }
      else if (type === 'expense') { currentExpPhotos = []; renderPhotoPreview([], 'expPhotoGrid', 'expPhotoUploadBox', 'expense'); document.getElementById('expPhotoUpload').value = ''; }
      else if (type === 'edit') { currentEditPhotos = []; renderPhotoPreview([], 'editPhotoGrid', 'editPhotoUploadBox', 'edit'); document.getElementById('editTransPhoto').value = ''; }
    }

    let modalPhotoList = [];
    let currentPhotoIndex = 0;
    
    function openPhotoModal(url, url2 = '', url3 = '') { 
      modalPhotoList = [url, url2, url3].filter(u => u && u.trim() !== '');
      if (modalPhotoList.length === 0) return;
      currentPhotoIndex = 0;
      updatePhotoModalView();
      document.getElementById('receiptPhotoModal').style.display = 'flex'; 
    }
    
    function changePhoto(dir) {
      currentPhotoIndex += dir;
      if (currentPhotoIndex < 0) currentPhotoIndex = modalPhotoList.length - 1;
      if (currentPhotoIndex >= modalPhotoList.length) currentPhotoIndex = 0;
      updatePhotoModalView();
    }
    
    function updatePhotoModalView() {
      document.getElementById('photoModalImg').src = modalPhotoList[currentPhotoIndex];
      document.getElementById('prevPhotoBtn').style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
      document.getElementById('nextPhotoBtn').style.display = modalPhotoList.length > 1 ? 'flex' : 'none';
      document.getElementById('photoCounter').textContent = modalPhotoList.length > 1 ? \`Foto \${currentPhotoIndex + 1} dari \${modalPhotoList.length}\` : '';
    }
    
    function closePhotoModal() { 
      document.getElementById('receiptPhotoModal').style.display = 'none'; 
      document.getElementById('photoModalImg').src = ''; 
    }
    
    function getPhotoBtnIcon(r, isMasked = false) {
      if (isMasked || !r.receipt_photo) return '';
      let urls = \`'\${r.receipt_photo}', '\${r.receipt_photo_2 || ''}', '\${r.receipt_photo_3 || ''}'\`;
      let count = 1 + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
      let content = count > 1 ? \`<span style="font-size:10px; margin-left:2px; font-weight:bold">\${count}</span>\` : '';
      return \`<button class="btn-icon-only" onclick="openPhotoModal(\${urls})" style="margin-left:6px; color:var(--teal-pop);">\${safeIcon('image', 'lucide-sm')}\${content}</button>\`;
    }

    function getPhotoBtnText(r, isMasked = false) {
      if (isMasked || !r.receipt_photo) return '';
      let urls = \`'\${r.receipt_photo}', '\${r.receipt_photo_2 || ''}', '\${r.receipt_photo_3 || ''}'\`;
      let count = 1 + (r.receipt_photo_2 ? 1 : 0) + (r.receipt_photo_3 ? 1 : 0);
      let text = count > 1 ? \`📸 \${count} Foto\` : \`📷 Foto\`;
      return \`<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px; margin-top:6px;" onclick="openPhotoModal(\${urls})">\${text}</button>\`;
    }
`;

content = content.replace(oldPhotoJsRegex, newPhotoJs);

// 7. Update Modal DOM
const oldModalDOM = `<div class="modal-overlay" id="receiptPhotoModal" style="z-index:9999;"
    onclick="if(event.target===this) closePhotoModal()">
    <div class="modal-content"
      style="max-width:800px; padding:16px; position:relative; background:transparent; box-shadow:none;">
      <button class="btn-icon-only"
        style="position:absolute; top:-40px; right:0; color:white; background:rgba(0,0,0,0.5);"
        onclick="closePhotoModal()"><script>document.write(getIcon('x', 'lucide-lg'))</script></button>
      <img id="photoModalImg" src="" style="width:100%; max-height:85vh; object-fit:contain; border-radius:8px;">
    </div>
  </div>`;

const newModalDOM = `<div class="modal-overlay" id="receiptPhotoModal" style="z-index:9999;" onclick="if(event.target===this) closePhotoModal()">
    <div class="modal-content" style="max-width:800px; padding:24px; position:relative; background:var(--bg-card); display:flex; flex-direction:column; align-items:center;">
      <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:15px; align-items:center;">
        <h3 style="margin:0; font-size:16px;">Galeri Foto Bukti</h3>
        <button class="btn-icon-only" onclick="closePhotoModal()"><script>document.write(getIcon('x', 'lucide-md'))</script></button>
      </div>
      <div style="position:relative; width:100%; display:flex; justify-content:center; align-items:center; min-height:300px;">
        <button id="prevPhotoBtn" class="btn-icon-only" style="position:absolute; left:0; z-index:10; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:40px; height:40px; display:none;" onclick="changePhoto(-1)">&#10094;</button>
        <img id="photoModalImg" src="" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:var(--radius-md);">
        <button id="nextPhotoBtn" class="btn-icon-only" style="position:absolute; right:0; z-index:10; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:40px; height:40px; display:none;" onclick="changePhoto(1)">&#10095;</button>
      </div>
      <div id="photoCounter" style="margin-top:10px; font-size:14px; color:var(--text3); font-weight:bold;"></div>
    </div>
  </div>`;

content = content.replace(oldModalDOM, newModalDOM);

// 8. API updates (saveIncomeForm, saveBulkIncome, saveExpenseForm)
content = content.replace(/receipt_photo_base64:\s*currentIncPhoto/g, "receipt_photo_base64: currentIncPhotos[0] || '', receipt_photo_base64_2: currentIncPhotos[1] || '', receipt_photo_base64_3: currentIncPhotos[2] || ''");
content = content.replace(/receipt_photo_base64:\s*currentExpPhoto/g, "receipt_photo_base64: currentExpPhotos[0] || '', receipt_photo_base64_2: currentExpPhotos[1] || '', receipt_photo_base64_3: currentExpPhotos[2] || ''");

// Also reset calls
content = content.replace(/currentIncPhoto = ''; document.getElementById\('incPhotoUpload'\).value = ''; document.getElementById\('incPhotoPreview'\).style.display = 'none'; document.getElementById\('incPhotoPreview'\).src = ''; document.getElementById\('incPhotoIcon'\).style.display = 'block';/g, "resetPhotoUpload('income');");
content = content.replace(/currentExpPhoto = ''; document.getElementById\('expPhotoUpload'\).value = ''; document.getElementById\('expPhotoPreview'\).style.display = 'none'; document.getElementById\('expPhotoPreview'\).src = ''; document.getElementById\('expPhotoIcon'\).style.display = 'block';/g, "resetPhotoUpload('expense');");

// 9. API updates for editRecord and editBulkIncome
content = content.replace(/receipt_photo_base64:\s*currentEditPhoto,/g, "receipt_photo_base64: currentEditPhotos[0] || '', receipt_photo_base64_2: currentEditPhotos[1] || '', receipt_photo_base64_3: currentEditPhotos[2] || '',");

// Also reset call for edit
content = content.replace(/currentEditPhoto = '';\s*document.getElementById\('editTransPhoto'\).value = '';\s*document.getElementById\('editTransPhotoPreview'\).style.display = 'none';\s*document.getElementById\('editTransPhotoPreview'\).src = '';\s*document.getElementById\('editTransPhotoIcon'\).style.display = 'block';/g, "resetPhotoUpload('edit');");

// Load original photos when edit is opened
const editInitRegex = /if \(isIncome\) \{([^]+?)currentEditPhoto = x\.receipt_photo \|\| '';/g;
content = content.replace(/currentEditPhoto = '';/g, "currentEditPhotos = [];");
content = content.replace(/currentEditPhoto = x\.receipt_photo \|\| '';/g, `
    currentEditPhotos = [x.receipt_photo, x.receipt_photo_2, x.receipt_photo_3].filter(p => p && p.trim() !== '');
    renderPhotoPreview(currentEditPhotos, 'editPhotoGrid', 'editPhotoUploadBox', 'edit');
`);

// The DOM replacement for the old Edit Preview hiding might need cleanup:
// Look for document.getElementById('editTransPhotoPreview')...
content = content.replace(/document\.getElementById\('editTransPhotoPreview'\)\.src = currentEditPhoto;[\s\S]*?else \{[\s\S]*?document\.getElementById\('editTransPhotoIcon'\)\.style\.display = 'block';[\s\S]*?\}/g, "");

// 10. Replace Photo buttons in list generations

content = content.replace(/x\.receipt_photo \? \`\<button class="btn-icon-only" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)" style="margin-left:6px; color:var\(--teal-pop\);"\>\$\{safeIcon\('image', 'lucide-sm'\)\}\<\/button\>\` : ''/g, "getPhotoBtnIcon(x)");
content = content.replace(/x\.receipt_photo \? \`\<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px; margin-top:6px;" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)"\>📷 Foto\<\/button\>\` : ''/g, "getPhotoBtnText(x)");
content = content.replace(/x\.receipt_photo \? \`\<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px;" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)"\>📷 Foto\<\/button\>\` : ''/g, "getPhotoBtnText(x)");

// Other badge instances
content = content.replace(/let photoBtn = \(x\.receipt_photo && !shouldHide\) \? \`\<button class="btn-icon-only" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)" style="margin-left:6px; color:var\(--teal-pop\);"\>\$\{safeIcon\('image', 'lucide-sm'\)\}\<\/button\>\` : '';/g, "let photoBtn = getPhotoBtnIcon(x, shouldHide);");
content = content.replace(/let photoBtn = \(x\.receipt_photo && !shouldHide\) \? \`\<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px;" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)"\>📷 Foto\<\/button\>\` : '';/g, "let photoBtn = getPhotoBtnText(x, shouldHide);");

content = content.replace(/const photoBtn = \(x\.receipt_photo && !isMasked\) \? \`\<button class="btn-icon-only" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)" style="margin-left:6px; color:var\(--teal-pop\);"\>\$\{safeIcon\('image', 'lucide-sm'\)\}\<\/button\>\` : '';/g, "const photoBtn = getPhotoBtnIcon(x, isMasked);");
content = content.replace(/if \(x\.receipt_photo && !isMasked\) \{ photoBtn = \`\<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px; margin-top:6px;" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)"\>📷 Foto\<\/button\>\`; \}/g, "photoBtn = getPhotoBtnText(x, isMasked);");

content = content.replace(/if \(x\.receipt_photo\) \{ photoBtn = \`\<button class="btn btn-ghost" style="padding:3px 8px; font-size:11px; margin-top:6px;" onclick="openPhotoModal\('\$\{x\.receipt_photo\}'\)"\>📷 Foto\<\/button\>\`; \}/g, "photoBtn = getPhotoBtnText(x);");
content = content.replace(/if \(found\.receipt_photo\) \{ photoBtn = \`\<button class="btn btn-ghost" style="padding:4px 8px; font-size:12px; margin-top:8px;" onclick="openPhotoModal\('\$\{found\.receipt_photo\}'\)"\>\$\{safeIcon\('image', 'lucide-sm'\)\} Lihat Foto\<\/button\>\`; \}/g, "photoBtn = getPhotoBtnText(found);");

// Write back
fs.writeFileSync(file, content);
console.log('Update completed successfully!');
