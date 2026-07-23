import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const P="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function w(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():P}let y=null,g=[];function u(e){return new Intl.NumberFormat("id-ID").format(e)}function x(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const n=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${n[t.getMonth()]} ${t.getFullYear()}`}async function k(e,t={}){const n=new URL(w());n.searchParams.set("action",e),n.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),n.searchParams.set("_t",Date.now());for(let s in t)n.searchParams.set(s,t[s]);const a=await(await fetch(n.toString(),{method:"GET",redirect:"follow"})).json();if(!a.success)throw new Error(a.message||"API Error");return a}async function C(e,t){const n={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},a=await(await fetch(w(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(n)})).json();if(!a.success)throw new Error(a.message||"API Error");return a}function v(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),n=localStorage.getItem("BISDAC_name"),o=["Admin","Bendahara","Ketua Jemaat","Pendeta"].includes(t);e&&o?(y={token:e,role:t,name:n},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${n}`,document.querySelectorAll(".admin-only-field").forEach(a=>a.style.display="block")):(y=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(a=>a.style.display="none"))}function E(e){const t=document.getElementById("inventoryGrid");if(!e||e.length===0){t.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}t.innerHTML=e.map(n=>{const o=n.photo?n.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",a=n.status==="Disposed",s=a?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",d=a?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${n.category?n.category+" • ":""}${n.location}</div>`;return`
      <div class="inv-asset-card" style="${s}" onclick="window.viewDetail('${n.id}')">
        ${d}
        <img src="${o}" class="inv-asset-photo" alt="${n.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="inv-asset-info">
          <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
            ${n.name}
            <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
              ${n.qty||1} ${n.unit||"Unit"}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${n.id}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-calendar"></i> ${x(n.date_acquired)}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-user"></i> ${n.pic}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-truck-ramp-box"></i> ${n.source||"-"}</div>
          </div>
          
          ${y?`
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${u(n.value)}</span></div>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Taksasi Saat Ini<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${u(n.taksasi||0)}</span></div>
            </div>
          `:""}
        </div>
      </div>
    `}).join("")}async function I(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',g=(await k("getInventory")).data||[],g.sort((a,s)=>new Date(s.created_at)-new Date(a.created_at)),E(g);const o=new URLSearchParams(window.location.search).get("id");o&&setTimeout(()=>{window.viewDetail(o)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=g.find(l=>l.id===e);if(!t)return;document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=x(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const n=document.getElementById("detailStatusContainer"),o=document.getElementById("detailStatusBadge"),a=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(n.style.display="block",o.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',o.style.background="rgba(239, 68, 68, 0.2)",o.style.color="#ef4444",a.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",y&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${u(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(n.style.display="block",o.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',o.style.background="rgba(74, 222, 128, 0.1)",o.style.color="#4ade80",a.style.display="none");const s=document.getElementById("detailSubItems"),d=document.getElementById("detailSubItemsContainer");t.sub_items?(s.textContent=t.sub_items,d.style.display="flex"):d.style.display="none",t.photo?(document.getElementById("detailPhoto").src=t.photo,document.getElementById("detailPhoto").style.display="block"):document.getElementById("detailPhoto").style.display="none",y?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${u(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${u(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const c=window.location.origin+window.location.pathname+"?id="+t.id,i=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(c)}`;document.getElementById("qrCodeImg").src=i,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printBarcode=()=>{const l=document.getElementById("qrCodeImg").src,m=document.getElementById("detailName").textContent,r=document.getElementById("detailId").textContent.replace("ID: ",""),p=window.open("","_blank","width=700,height=500");p.document.write(`
      <html>
        <head>
          <title>Preview Thermal Label - ${r}</title>
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
              <h3>${m}</h3>
              <div class="qr-wrapper">
                <img class="qr" src="${l}">
                <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
              </div>
              <div class="id-text">${r}</div>
            </div>
          </div>
          
          <!-- Hidden box strictly for printing to avoid UI interference -->
          <div class="label-box print-only">
            <h3>${m}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${l}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${r}</div>
          </div>
        </body>
      </html>
    `),p.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",D(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const l=document.getElementById("deleteBtn"),m=l.innerHTML;l.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',l.disabled=!0;try{await C("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",I()}catch(r){showCustomAlert(r.message,"error")}finally{l.innerHTML=m,l.disabled=!1}}};window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function D(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e?(document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?u(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi?u(e.taksasi):"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price?u(e.dispose_price):"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none",e.photo&&(document.getElementById("photoPreviewImg").src=e.photo,t.style.display="block")):(document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none")}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files[0];if(!t)return;const n=new FileReader;n.onload=function(o){const a=new Image;a.onload=function(){const s=document.createElement("canvas"),d=800,c=800;let i=a.width,l=a.height;i>l?i>d&&(l*=d/i,i=d):l>c&&(i*=c/l,l=c),s.width=i,s.height=l,s.getContext("2d").drawImage(a,0,0,i,l);const r=s.toDataURL("image/jpeg",.6);window.currentPhotoBase64=r,document.getElementById("photoPreviewImg").src=r,document.getElementById("photoPreview").style.display="block"},a.src=o.target.result},n.readAsDataURL(t)});window.showCustomAlert=function(e,t="success"){const n=document.getElementById("customAlertModal"),o=document.getElementById("alertTitle"),a=document.getElementById("alertMessage"),s=document.getElementById("alertIcon");a.textContent=e,t==="error"?(o.textContent="Gagal",o.style.color="#ef4444",s.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',s.style.color="#ef4444"):t==="warning"?(o.textContent="Perhatian",o.style.color="#d4af37",s.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',s.style.color="#d4af37"):(o.textContent="Berhasil",o.style.color="var(--accent)",s.innerHTML='<i class="fa-solid fa-circle-check"></i>',s.style.color="var(--accent)"),n.style.display="flex"};function B(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{v(),I(),document.getElementById("formValue").addEventListener("input",B),document.getElementById("formTaksasi").addEventListener("input",B),document.getElementById("formDisposePrice").addEventListener("input",B),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const n=document.getElementById("doLoginBtn");n.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',n.disabled=!0;try{const o=await k("login",{username:e,password:t});if(o.token){localStorage.setItem("BISDAC_token",o.token);const a=o.role||o.user&&o.user.role||"",s=o.nama||o.user&&o.user.nama||o.user&&o.user.name||"";localStorage.setItem("BISDAC_role",a),localStorage.setItem("BISDAC_name",s)}}catch(o){showCustomAlert(o.message,"error")}finally{n.innerHTML="Masuk",n.disabled=!1,document.getElementById("loginModal").style.display="none",v(),y&&I()}}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),v(),E(g),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{D()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,n=document.getElementById("formValue").value.replace(/\./g,""),o=document.getElementById("formLocation").value,a=document.getElementById("formCategory").value,s=document.getElementById("formSource").value,d=document.getElementById("formTaksasi").value.replace(/\./g,""),c=document.getElementById("formPic").value,i=document.getElementById("formId").value,l=document.getElementById("formQty").value,m=document.getElementById("formUnit").value,r=document.getElementById("formSubItems").value,p=document.getElementById("formStatus").value,h=document.getElementById("formDisposeReason").value,S=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!o||!c||!a||!s||!l||!m)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(p==="Disposed"&&!h)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");const b={isUpdate:!!i,id:i,name:e,date_acquired:t,value:n,location:o,category:a,source:s,taksasi:d,pic:c,qty:l,unit:m,sub_items:r,status:p,dispose_reason:h,dispose_price:S};window.currentPhotoBase64&&(b.photo_base64=window.currentPhotoBase64);const f=document.getElementById("saveBtn");f.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',f.disabled=!0;try{await C("saveInventory",b),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),I()}catch(A){showCustomAlert(A.message,"error")}finally{f.innerHTML="Simpan Data",f.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",e=>{const t=e.target.value.toLowerCase(),n=g.filter(o=>o.name.toLowerCase().includes(t)||o.location.toLowerCase().includes(t)||o.pic.toLowerCase().includes(t));E(n)})});
