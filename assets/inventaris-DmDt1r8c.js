import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const oe="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function J(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():oe}let k=null,y=[];function v(e){return new Intl.NumberFormat("id-ID").format(e)}function F(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const o=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${o[t.getMonth()]} ${t.getFullYear()}`}async function V(e,t={}){const o=new URL(J());o.searchParams.set("action",e),o.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),o.searchParams.set("_t",Date.now());for(let l in t)o.searchParams.set(l,t[l]);const s=await(await fetch(o.toString(),{method:"GET",redirect:"follow"})).json();if(!s.success)throw new Error(s.message||"API Error");return s}async function K(e,t){const o={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},s=await(await fetch(J(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(o)})).json();if(!s.success)throw new Error(s.message||"API Error");return s}function R(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),o=localStorage.getItem("BISDAC_name"),n=["Admin","Bendahara","Ketua Jemaat","Pendeta"].includes(t);e&&n?(k={token:e,role:t,name:o},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${o}`,document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display=s.dataset.display||"block")):(k=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display="none"))}function z(e){const t=document.getElementById("inventoryGrid");if(!e||e.length===0){t.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}t.innerHTML=e.map(o=>{const n=o.photo?o.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",s=o.status==="Disposed",l=s?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",d=s?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${o.category?o.category+" • ":""}${o.location}</div>`;return`
      <div class="inv-asset-card" style="${l}" onclick="window.viewDetail('${o.id}')">
        ${d}
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
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-calendar"></i> ${F(o.date_acquired)}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-user"></i> ${o.pic}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-truck-ramp-box"></i> ${o.source||"-"}</div>
          </div>
          
          ${k?`
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${v(o.value)}</span></div>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Taksasi Saat Ini<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${v(o.taksasi||0)}</span></div>
            </div>
          `:""}
        </div>
      </div>
    `}).join("")}async function M(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',y=(await V("getInventory")).data||[],y.sort((s,l)=>new Date(l.created_at)-new Date(s.created_at)),z(y);const n=new URLSearchParams(window.location.search).get("id");n&&setTimeout(()=>{window.viewDetail(n)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=y.find(i=>i.id===e);if(!t)return;document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=F(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const o=document.getElementById("detailStatusContainer"),n=document.getElementById("detailStatusBadge"),s=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(o.style.display="block",n.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',n.style.background="rgba(239, 68, 68, 0.2)",n.style.color="#ef4444",s.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",k&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${v(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(o.style.display="block",n.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',n.style.background="rgba(74, 222, 128, 0.1)",n.style.color="#4ade80",s.style.display="none");const l=document.getElementById("detailSubItems"),d=document.getElementById("detailSubItemsContainer");t.sub_items?(l.textContent=t.sub_items,d.style.display="flex"):d.style.display="none",t.photo?(document.getElementById("detailPhoto").src=t.photo,document.getElementById("detailPhoto").style.display="block"):document.getElementById("detailPhoto").style.display="none",k?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${v(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${v(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const w=window.location.origin+window.location.pathname+"?id="+t.id,g=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(w)}`;document.getElementById("qrCodeImg").src=g,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const i=document.getElementById("detailName").textContent,B=document.getElementById("detailId").textContent.replace("ID: ",""),f=document.getElementById("qrCodeImg").src,r=document.createElement("canvas");r.width=384,r.height=520;const a=r.getContext("2d"),E=r.width/2;a.fillStyle="#ffffff",a.fillRect(0,0,r.width,r.height);const p=20,c=12,m=12,b=r.width-24,A=r.height-24;a.strokeStyle="#000000",a.lineWidth=5,a.beginPath(),a.moveTo(c+p,m),a.lineTo(c+b-p,m),a.quadraticCurveTo(c+b,m,c+b,m+p),a.lineTo(c+b,m+A-p),a.quadraticCurveTo(c+b,m+A,c+b-p,m+A),a.lineTo(c+p,m+A),a.quadraticCurveTo(c,m+A,c,m+A-p),a.lineTo(c,m+p),a.quadraticCurveTo(c,m,c+p,m),a.closePath(),a.stroke(),a.fillStyle="#000000",a.textAlign="center",a.textBaseline="top",a.font="bold 36px monospace";let Q=i.length>20?i.substring(0,17)+"...":i;a.fillText(Q.toUpperCase(),E,40);const C=new Image;C.crossOrigin="Anonymous",await new Promise((u,I)=>{C.onload=u,C.onerror=I,C.src=f});const S=300;a.drawImage(C,E-S/2,95,S,S);const x=new Image;if(x.crossOrigin="Anonymous",await new Promise((u,I)=>{x.onload=u,x.onerror=()=>u(),x.src=window.location.origin+"/icons/PisgahColor.png"}),x.complete&&x.naturalWidth>0){const I=E,q=95+S/2;a.fillStyle="#ffffff",a.beginPath(),a.arc(I,q,80/2+8,0,Math.PI*2),a.fill(),a.drawImage(x,I-80/2,q-80/2,80,80)}a.fillStyle="#000000",a.font="bold 28px monospace",a.fillText(B,E,420),a.strokeStyle="#cccccc",a.lineWidth=1,a.beginPath(),a.moveTo(60,460),a.lineTo(r.width-60,460),a.stroke(),a.fillStyle="#888888",a.font="20px monospace",a.fillText("PISGAH-BISDAC",E,472);const Y=document.getElementById("thermalPreviewModal");Y.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=r.toDataURL();const $=document.getElementById("doDirectPrintBtn"),G=$.cloneNode(!0);$.parentNode.replaceChild(G,$),G.onclick=async()=>{try{const u=await navigator.serial.requestPort();await u.open({baudRate:9600});const I=u.writable.getWriter();showCustomAlert("Mencetak...","success");const D=a.getImageData(0,0,r.width,r.height).data,P=Math.ceil(r.width/8),T=r.height,h=new Uint8Array(8+P*T);h[0]=29,h[1]=118,h[2]=48,h[3]=0,h[4]=P&255,h[5]=P>>8&255,h[6]=T&255,h[7]=T>>8&255;let X=8;for(let U=0;U<T;U++)for(let N=0;N<P;N++){let j=0;for(let L=0;L<8;L++){const O=N*8+L;if(O<r.width){const _=(U*r.width+O)*4,ne=D[_]*.299+D[_+1]*.587+D[_+2]*.114;D[_+3]>128&&ne<128&&(j|=1<<7-L)}}h[X++]=j}const Z=new Uint8Array([27,64]),ee=new Uint8Array([27,97,1]),te=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await I.write(Z),await I.write(ee),await I.write(h),await I.write(te),I.releaseLock(),await u.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(u){console.error(u),u.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+u.message,"error")}}}catch(i){console.error(i),showCustomAlert("Gagal memuat preview: "+i.message,"error")}},window.printBarcode=()=>{const i=document.getElementById("qrCodeImg").src,B=document.getElementById("detailName").textContent,f=document.getElementById("detailId").textContent.replace("ID: ",""),r=window.open("","_blank");if(!r){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}r.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${f}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { 
              font-family: 'Inter', sans-serif, monospace; 
              margin: 0; 
              background: #fff;
              color: #000;
            }
            .label-box { 
              width: 55mm; 
              height: 75mm; 
              background: #fff;
              border: 2px solid #000;
              border-radius: 8px;
              padding: 5mm; 
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              margin: 0;
            }
            .label-box h3 { 
              margin: 0; 
              font-size: 14px; 
              text-transform: uppercase; 
              color: #000;
              text-align: center;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-wrapper { position: relative; width: 40mm; height: 40mm; margin: auto 0; }
            .qr-wrapper img.qr { width: 40mm; height: 40mm; display: block; }
            .qr-wrapper img.logo { 
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
              width: 9mm; height: 9mm; background: white; padding: 1mm; border-radius: 50%; object-fit: contain; 
            }
            .id-text { 
              margin: 0; 
              font-size: 13px; 
              font-weight: bold; 
              font-family: monospace; 
              color: #000; 
              text-align: center;
            }
          </style>
          <script>
            window.addEventListener('afterprint', function() { window.close(); });
            window.onload = function() { window.print(); };
          <\/script>
        </head>
        <body>
          <div class="label-box">
            <h3>${B}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${i}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${f}</div>
          </div>
        </body>
      </html>
    `),r.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",W(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const i=document.getElementById("deleteBtn"),B=i.innerHTML;i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',i.disabled=!0;try{await K("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",M()}catch(f){showCustomAlert(f.message,"error")}finally{i.innerHTML=B,i.disabled=!1}}};window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function W(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e?(document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?v(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi?v(e.taksasi):"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price?v(e.dispose_price):"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none",e.photo&&(document.getElementById("photoPreviewImg").src=e.photo,t.style.display="block")):(document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none")}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files[0];if(!t)return;const o=new FileReader;o.onload=function(n){const s=new Image;s.onload=function(){const l=document.createElement("canvas"),d=800,w=800;let g=s.width,i=s.height;g>i?g>d&&(i*=d/g,g=d):i>w&&(g*=w/i,i=w),l.width=g,l.height=i,l.getContext("2d").drawImage(s,0,0,g,i);const f=l.toDataURL("image/jpeg",.6);window.currentPhotoBase64=f,document.getElementById("photoPreviewImg").src=f,document.getElementById("photoPreview").style.display="block"},s.src=n.target.result},o.readAsDataURL(t)});window.showCustomAlert=function(e,t="success"){const o=document.getElementById("customAlertModal"),n=document.getElementById("alertTitle"),s=document.getElementById("alertMessage"),l=document.getElementById("alertIcon");s.textContent=e,t==="error"?(n.textContent="Gagal",n.style.color="#ef4444",l.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',l.style.color="#ef4444"):t==="warning"?(n.textContent="Perhatian",n.style.color="#d4af37",l.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',l.style.color="#d4af37"):(n.textContent="Berhasil",n.style.color="var(--accent)",l.innerHTML='<i class="fa-solid fa-circle-check"></i>',l.style.color="var(--accent)"),o.style.display="flex"};function H(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{R(),M(),document.getElementById("formValue").addEventListener("input",H),document.getElementById("formTaksasi").addEventListener("input",H),document.getElementById("formDisposePrice").addEventListener("input",H),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const o=document.getElementById("doLoginBtn");o.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',o.disabled=!0;try{const n=await V("login",{username:e,password:t});if(n.token){localStorage.setItem("BISDAC_token",n.token);const s=n.role||n.user&&n.user.role||"",l=n.nama||n.user&&n.user.nama||n.user&&n.user.name||"";localStorage.setItem("BISDAC_role",s),localStorage.setItem("BISDAC_name",l)}}catch(n){showCustomAlert(n.message,"error")}finally{o.innerHTML="Masuk",o.disabled=!1,document.getElementById("loginModal").style.display="none",R(),k&&M()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),R(),z(y),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{W()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,o=document.getElementById("formValue").value.replace(/\./g,""),n=document.getElementById("formLocation").value,s=document.getElementById("formCategory").value,l=document.getElementById("formSource").value,d=document.getElementById("formTaksasi").value.replace(/\./g,""),w=document.getElementById("formPic").value,g=document.getElementById("formId").value,i=document.getElementById("formQty").value,B=document.getElementById("formUnit").value,f=document.getElementById("formSubItems").value,r=document.getElementById("formStatus").value;let a=document.getElementById("formDisposeReason").value,E=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!n||!w||!s||!l||!i||!B)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(r==="Disposed"&&!a)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");r!=="Disposed"&&(a="",E="");const p={isUpdate:!!g,id:g,name:e,date_acquired:t,value:o,location:n,category:s,source:l,taksasi:d,pic:w,qty:i,unit:B,sub_items:f,status:r,dispose_reason:a,dispose_price:E};window.currentPhotoBase64&&(p.photo_base64=window.currentPhotoBase64);const c=document.getElementById("saveBtn");c.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',c.disabled=!0;try{await K("saveInventory",p),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),M()}catch(m){showCustomAlert(m.message,"error")}finally{c.innerHTML="Simpan Data",c.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",e=>{const t=e.target.value.toLowerCase(),o=y.filter(n=>n.name.toLowerCase().includes(t)||n.location.toLowerCase().includes(t)||n.pic.toLowerCase().includes(t));z(o)})});window.exportCSV=function(){if(!y||y.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","TAKSASI_SAAT_INI","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=y.map(d=>[d.id,F(d.date_acquired)||"",`"${(d.name||"").replace(/"/g,'""')}"`,`"${(d.category||"").replace(/"/g,'""')}"`,`"${(d.source||"").replace(/"/g,'""')}"`,d.value||0,d.taksasi||0,d.qty||1,d.unit||"Unit",`"${(d.location||"").replace(/"/g,'""')}"`,`"${(d.pic||"").replace(/"/g,'""')}"`,d.status||"Active",d.status==="Disposed"?`"${(d.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',d.status==="Disposed"?d.dispose_price||0:'""',`"${(d.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),o=e.join(",")+`
`+t.join(`
`),n=new Blob([o],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(n),l=document.createElement("a");l.setAttribute("href",s),l.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(l),l.click(),document.body.removeChild(l),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!y||y.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
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
  `;y.forEach(n=>{const s=n.photo?n.photo:"https://via.placeholder.com/60?text=No+Photo",l=n.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${n.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${s}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
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
            ${l}<br>
            ${n.qty||1} ${n.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${v(n.value||0)}<br>
            <span style="color:#666;">Taksasi: ${v(n.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const o={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(o).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
