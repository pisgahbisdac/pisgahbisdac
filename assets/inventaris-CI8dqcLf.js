import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const P="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function k(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():P}let y=null,r=[];function m(e){return new Intl.NumberFormat("id-ID").format(e)}function E(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const o=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${o[t.getMonth()]} ${t.getFullYear()}`}async function A(e,t={}){const o=new URL(k());o.searchParams.set("action",e),o.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),o.searchParams.set("_t",Date.now());for(let s in t)o.searchParams.set(s,t[s]);const a=await(await fetch(o.toString(),{method:"GET",redirect:"follow"})).json();if(!a.success)throw new Error(a.message||"API Error");return a}async function C(e,t){const o={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},a=await(await fetch(k(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(o)})).json();if(!a.success)throw new Error(a.message||"API Error");return a}function b(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),o=localStorage.getItem("BISDAC_name"),n=["Admin","Bendahara","Ketua Jemaat","Pendeta"].includes(t);e&&n?(y={token:e,role:t,name:o},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${o}`,document.querySelectorAll(".admin-only-field").forEach(a=>a.style.display="block")):(y=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(a=>a.style.display="none"))}function B(e){const t=document.getElementById("inventoryGrid");if(!e||e.length===0){t.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}t.innerHTML=e.map(o=>{const n=o.photo?o.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",a=o.status==="Disposed",s=a?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",l=a?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${o.category?o.category+" • ":""}${o.location}</div>`;return`
      <div class="inv-asset-card" style="${s}" onclick="window.viewDetail('${o.id}')">
        ${l}
        <img src="${n}" class="inv-asset-photo" alt="${o.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="inv-asset-info">
          <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
            ${o.name}
            <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
              ${o.qty||1} ${o.unit||"Unit"}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${o.id}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-calendar"></i> ${E(o.date_acquired)}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-user"></i> ${o.pic}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-truck-ramp-box"></i> ${o.source||"-"}</div>
          </div>
          
          ${y?`
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${m(o.value)}</span></div>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Taksasi Saat Ini<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${m(o.taksasi||0)}</span></div>
            </div>
          `:""}
        </div>
      </div>
    `}).join("")}async function I(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',r=(await A("getInventory")).data||[],r.sort((a,s)=>new Date(s.created_at)-new Date(a.created_at)),B(r);const n=new URLSearchParams(window.location.search).get("id");n&&setTimeout(()=>{window.viewDetail(n)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=r.find(d=>d.id===e);if(!t)return;document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=E(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const o=document.getElementById("detailStatusContainer"),n=document.getElementById("detailStatusBadge"),a=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(o.style.display="block",n.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',n.style.background="rgba(239, 68, 68, 0.2)",n.style.color="#ef4444",a.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",y&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${m(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(o.style.display="block",n.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',n.style.background="rgba(74, 222, 128, 0.1)",n.style.color="#4ade80",a.style.display="none");const s=document.getElementById("detailSubItems"),l=document.getElementById("detailSubItemsContainer");t.sub_items?(s.textContent=t.sub_items,l.style.display="flex"):l.style.display="none",t.photo?(document.getElementById("detailPhoto").src=t.photo,document.getElementById("detailPhoto").style.display="block"):document.getElementById("detailPhoto").style.display="none",y?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${m(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${m(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const u=window.location.origin+window.location.pathname+"?id="+t.id,i=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(u)}`;document.getElementById("qrCodeImg").src=i,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printBarcode=()=>{const d=document.getElementById("qrCodeImg").src,p=document.getElementById("detailName").textContent,c=document.getElementById("detailId").textContent.replace("ID: ",""),g=window.open("","_blank","width=700,height=500");g.document.write(`
      <html>
        <head>
          <title>Preview Thermal Label - ${c}</title>
          <style>
            @page { size: 35mm 50mm; margin: 0; }
            body { 
              font-family: 'Inter', sans-serif, monospace; 
              margin: 0; 
              background: #111827;
              display: flex;
              flex-direction: column;
              align-items: center;
              height: 100vh;
              color: white;
            }
            .toolbar {
              background: #1f2937;
              width: 100%;
              padding: 20px;
              text-align: center;
              box-sizing: border-box;
              border-bottom: 1px solid #374151;
            }
            .toolbar button {
              background: #d4af37;
              border: none;
              padding: 12px 24px;
              font-weight: bold;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              color: #000;
              transition: transform 0.2s;
            }
            .toolbar button:hover { transform: scale(1.05); background: #f0c950; }
            .toolbar p { margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; }
            
            .preview-container {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              width: 100%;
            }
            
            /* Thermal Label Box (Portrait 35mm x 50mm) */
            .label-box { 
              width: 35mm; 
              height: 50mm; 
              background: #fff;
              border: 1.5px solid #000;
              border-radius: 4px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
              padding: 3mm 2mm; 
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              overflow: hidden;
            }
            .label-box h3 { 
              margin: 0; 
              font-size: 11px; 
              text-transform: uppercase; 
              color: #000;
              text-align: center;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-wrapper { position: relative; width: 22mm; height: 22mm; margin: auto 0; }
            .qr-wrapper img.qr { width: 22mm; height: 22mm; display: block; }
            .qr-wrapper img.logo { 
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
              width: 6mm; height: 6mm; background: white; padding: 0.5mm; border-radius: 50%; object-fit: contain; 
            }
            .id-text { 
              margin: 0; 
              font-size: 10px; 
              font-weight: bold; 
              font-family: monospace; 
              color: #000; 
              text-align: center;
            }
            
            .print-only { display: none; }
            
            /* Print Specific Styles */
            @media print {
              body * { visibility: hidden; }
              body { background: #fff; display: block; height: auto; }
              .print-only { 
                display: flex !important; 
                visibility: visible; 
                position: absolute; 
                left: 0; 
                top: 0; 
                box-shadow: none; 
                border: 1.5px solid #000;
                margin: 0;
              }
              .print-only * { visibility: visible; }
            }
          </style>
        </head>
        <body>
          <div class="toolbar no-print">
            <button onclick="window.print()">🖨️ Cetak ke Printer Thermal</button>
            <p>Pastikan pengaturan ukuran kertas (Paper Size) di printer Anda diatur ke portrait <b>35mm x 50mm</b></p>
          </div>
          
          <div class="preview-container no-print">
            <div class="label-box">
              <h3>${p}</h3>
              <div class="qr-wrapper">
                <img class="qr" src="${d}">
                <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
              </div>
              <div class="id-text">${c}</div>
            </div>
          </div>
          
          <!-- Hidden box strictly for printing to avoid UI interference -->
          <div class="label-box print-only">
            <h3>${p}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${d}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${c}</div>
          </div>
        </body>
      </html>
    `),g.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",S(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const d=document.getElementById("deleteBtn"),p=d.innerHTML;d.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',d.disabled=!0;try{await C("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",I()}catch(c){showCustomAlert(c.message,"error")}finally{d.innerHTML=p,d.disabled=!1}}};window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function S(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e?(document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?m(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi?m(e.taksasi):"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price?m(e.dispose_price):"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none",e.photo&&(document.getElementById("photoPreviewImg").src=e.photo,t.style.display="block")):(document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none")}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files[0];if(!t)return;const o=new FileReader;o.onload=function(n){const a=new Image;a.onload=function(){const s=document.createElement("canvas"),l=800,u=800;let i=a.width,d=a.height;i>d?i>l&&(d*=l/i,i=l):d>u&&(i*=u/d,d=u),s.width=i,s.height=d,s.getContext("2d").drawImage(a,0,0,i,d);const c=s.toDataURL("image/jpeg",.6);window.currentPhotoBase64=c,document.getElementById("photoPreviewImg").src=c,document.getElementById("photoPreview").style.display="block"},a.src=n.target.result},o.readAsDataURL(t)});window.showCustomAlert=function(e,t="success"){const o=document.getElementById("customAlertModal"),n=document.getElementById("alertTitle"),a=document.getElementById("alertMessage"),s=document.getElementById("alertIcon");a.textContent=e,t==="error"?(n.textContent="Gagal",n.style.color="#ef4444",s.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',s.style.color="#ef4444"):t==="warning"?(n.textContent="Perhatian",n.style.color="#d4af37",s.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',s.style.color="#d4af37"):(n.textContent="Berhasil",n.style.color="var(--accent)",s.innerHTML='<i class="fa-solid fa-circle-check"></i>',s.style.color="var(--accent)"),o.style.display="flex"};function h(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{b(),I(),document.getElementById("formValue").addEventListener("input",h),document.getElementById("formTaksasi").addEventListener("input",h),document.getElementById("formDisposePrice").addEventListener("input",h),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const o=document.getElementById("doLoginBtn");o.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',o.disabled=!0;try{const n=await A("login",{username:e,password:t});if(n.token){localStorage.setItem("BISDAC_token",n.token);const a=n.role||n.user&&n.user.role||"",s=n.nama||n.user&&n.user.nama||n.user&&n.user.name||"";localStorage.setItem("BISDAC_role",a),localStorage.setItem("BISDAC_name",s)}}catch(n){showCustomAlert(n.message,"error")}finally{o.innerHTML="Masuk",o.disabled=!1,document.getElementById("loginModal").style.display="none",b(),y&&I()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),b(),B(r),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{S()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,o=document.getElementById("formValue").value.replace(/\./g,""),n=document.getElementById("formLocation").value,a=document.getElementById("formCategory").value,s=document.getElementById("formSource").value,l=document.getElementById("formTaksasi").value.replace(/\./g,""),u=document.getElementById("formPic").value,i=document.getElementById("formId").value,d=document.getElementById("formQty").value,p=document.getElementById("formUnit").value,c=document.getElementById("formSubItems").value,g=document.getElementById("formStatus").value;let v=document.getElementById("formDisposeReason").value,x=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!n||!u||!a||!s||!d||!p)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(g==="Disposed"&&!v)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");g!=="Disposed"&&(v="",x="");const w={isUpdate:!!i,id:i,name:e,date_acquired:t,value:o,location:n,category:a,source:s,taksasi:l,pic:u,qty:d,unit:p,sub_items:c,status:g,dispose_reason:v,dispose_price:x};window.currentPhotoBase64&&(w.photo_base64=window.currentPhotoBase64);const f=document.getElementById("saveBtn");f.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',f.disabled=!0;try{await C("saveInventory",w),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),I()}catch(D){showCustomAlert(D.message,"error")}finally{f.innerHTML="Simpan Data",f.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",e=>{const t=e.target.value.toLowerCase(),o=r.filter(n=>n.name.toLowerCase().includes(t)||n.location.toLowerCase().includes(t)||n.pic.toLowerCase().includes(t));B(o)})});window.exportCSV=function(){if(!r||r.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","TAKSASI_SAAT_INI","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=r.map(l=>[l.id,E(l.date_acquired)||"",`"${(l.name||"").replace(/"/g,'""')}"`,`"${(l.category||"").replace(/"/g,'""')}"`,`"${(l.source||"").replace(/"/g,'""')}"`,l.value||0,l.taksasi||0,l.qty||1,l.unit||"Unit",`"${(l.location||"").replace(/"/g,'""')}"`,`"${(l.pic||"").replace(/"/g,'""')}"`,l.status||"Active",l.status==="Disposed"?`"${(l.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',l.status==="Disposed"?l.dispose_price||0:'""',`"${(l.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),o=e.join(",")+`
`+t.join(`
`),n=new Blob([o],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(n),s=document.createElement("a");s.setAttribute("href",a),s.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(s),s.click(),document.body.removeChild(s),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!r||r.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <h2 style="margin: 0; font-size: 24px; color: #1a2e22;">Laporan Backup Inventaris PISGAH</h2>
      <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
      <thead>
        <tr style="background: #1a2e22; color: white;">
          <th style="padding: 8px; border: 1px solid #ddd; width: 60px;">Foto</th>
          <th style="padding: 8px; border: 1px solid #ddd;">ID & Nama</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Kategori & Lokasi</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Status & Qty</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Nilai (Rp)</th>
        </tr>
      </thead>
      <tbody>
  `;r.forEach(n=>{const a=n.photo?n.photo:"https://via.placeholder.com/60?text=No+Photo",s=n.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${n.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${a}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong style="font-size:12px;">${n.name}</strong><br>
            <span style="color:#666; font-family:monospace;">${n.id}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${n.category||"-"}<br>
            <span style="color:#666;">${n.location}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${s}<br>
            ${n.qty||1} ${n.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${m(n.value||0)}<br>
            <span style="color:#666;">Taksasi: ${m(n.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const o={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(o).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
