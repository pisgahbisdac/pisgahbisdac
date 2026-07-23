import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const se="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function K(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():se}let D=null,h=[];function x(e){return new Intl.NumberFormat("id-ID").format(e)}function O(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const a=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${a[t.getMonth()]} ${t.getFullYear()}`}async function Q(e,t={}){const a=new URL(K());a.searchParams.set("action",e),a.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),a.searchParams.set("_t",Date.now());for(let l in t)a.searchParams.set(l,t[l]);const s=await(await fetch(a.toString(),{method:"GET",redirect:"follow"})).json();if(!s.success)throw new Error(s.message||"API Error");return s}async function Y(e,t){const a={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},s=await(await fetch(K(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(a)})).json();if(!s.success)throw new Error(s.message||"API Error");return s}function z(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),a=localStorage.getItem("BISDAC_name"),n=["Admin","Bendahara","Ketua Jemaat","Pendeta"].includes(t);e&&n?(D={token:e,role:t,name:a},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${a}`,document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display=s.dataset.display||"block")):(D=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display="none"))}function j(e){const t=document.getElementById("inventoryGrid");if(!e||e.length===0){t.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}t.innerHTML=e.map(a=>{const n=a.photo?a.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",s=a.status==="Disposed",l=s?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",r=s?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${a.category?a.category+" • ":""}${a.location}</div>`;return`
      <div class="inv-asset-card" style="${l}" onclick="window.viewDetail('${a.id}')">
        ${r}
        <img src="${n}" class="inv-asset-photo" alt="${a.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
        <div class="inv-asset-info">
          <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
            ${a.name}
            <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
              ${a.qty||1} ${a.unit||"Unit"}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${a.id}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-calendar"></i> ${O(a.date_acquired)}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-user"></i> ${a.pic}</div>
            <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-truck-ramp-box"></i> ${a.source||"-"}</div>
          </div>
          
          ${D?`
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${x(a.value)}</span></div>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Taksasi Saat Ini<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${x(a.taksasi||0)}</span></div>
            </div>
          `:""}
        </div>
      </div>
    `}).join("")}async function N(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',h=(await Q("getInventory")).data||[],h.sort((s,l)=>new Date(l.created_at)-new Date(s.created_at)),j(h);const n=new URLSearchParams(window.location.search).get("id");n&&setTimeout(()=>{window.viewDetail(n)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=h.find(i=>i.id===e);if(!t)return;document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=O(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const a=document.getElementById("detailStatusContainer"),n=document.getElementById("detailStatusBadge"),s=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(a.style.display="block",n.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',n.style.background="rgba(239, 68, 68, 0.2)",n.style.color="#ef4444",s.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",D&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${x(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(a.style.display="block",n.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',n.style.background="rgba(74, 222, 128, 0.1)",n.style.color="#4ade80",s.style.display="none");const l=document.getElementById("detailSubItems"),r=document.getElementById("detailSubItemsContainer");t.sub_items?(l.textContent=t.sub_items,r.style.display="flex"):r.style.display="none";const u=document.getElementById("detailPhotosContainer");u.innerHTML="";const w=[t.photo,t.photo2,t.photo3,t.photo4].filter(i=>i);w.length>0?(w.forEach(i=>{const d=document.createElement("img");d.src=i,d.style.height="180px",d.style.maxWidth="100%",d.style.borderRadius="12px",d.style.objectFit="contain",d.style.border="1px solid rgba(255,255,255,0.1)",d.style.flexShrink="0",d.style.backgroundColor="rgba(0,0,0,0.2)",u.appendChild(d)}),u.style.display="flex"):u.style.display="none",D?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${x(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${x(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const b=window.location.origin+window.location.pathname+"?id="+t.id,E=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(b)}`;document.getElementById("qrCodeImg").src=E,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const i=document.getElementById("detailName").textContent,d=document.getElementById("detailId").textContent.replace("ID: ",""),I=document.getElementById("qrCodeImg").src,c=document.createElement("canvas");c.width=384,c.height=520;const o=c.getContext("2d"),f=c.width/2;o.fillStyle="#ffffff",o.fillRect(0,0,c.width,c.height);const v=20,g=12,p=12,C=c.width-24,S=c.height-24;o.strokeStyle="#000000",o.lineWidth=5,o.beginPath(),o.moveTo(g+v,p),o.lineTo(g+C-v,p),o.quadraticCurveTo(g+C,p,g+C,p+v),o.lineTo(g+C,p+S-v),o.quadraticCurveTo(g+C,p+S,g+C-v,p+S),o.lineTo(g+v,p+S),o.quadraticCurveTo(g,p+S,g,p+S-v),o.lineTo(g,p+v),o.quadraticCurveTo(g,p,g+v,p),o.closePath(),o.stroke(),o.fillStyle="#000000",o.textAlign="center",o.textBaseline="top",o.font="bold 26px monospace";let P=i.toUpperCase();if(P.length<=24)o.fillText(P,f,45);else{let m=P.lastIndexOf(" ",24);m===-1&&(m=22);let y=P.substring(0,m),A=P.substring(m).trim();A.length>24&&(A=A.substring(0,21)+"..."),o.fillText(y,f,30),o.fillText(A,f,60)}const T=new Image;T.crossOrigin="Anonymous",await new Promise((m,y)=>{T.onload=m,T.onerror=y,T.src=I});const L=300;o.drawImage(T,f-L/2,95,L,L);const k=new Image;if(k.crossOrigin="Anonymous",await new Promise((m,y)=>{k.onload=m,k.onerror=()=>m(),k.src=window.location.origin+"/icons/PisgahColor.png"}),k.complete&&k.naturalWidth>0){const y=f,A=95+L/2;o.fillStyle="#ffffff",o.beginPath(),o.arc(y,A,80/2+8,0,Math.PI*2),o.fill(),o.drawImage(k,y-80/2,A-80/2,80,80)}o.fillStyle="#000000",o.font="bold 28px monospace",o.fillText(d,f,420),o.strokeStyle="#cccccc",o.lineWidth=1,o.beginPath(),o.moveTo(60,460),o.lineTo(c.width-60,460),o.stroke(),o.fillStyle="#888888",o.font="20px monospace",o.fillText("PISGAH-BISDAC",f,472);const Z=document.getElementById("thermalPreviewModal");Z.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=c.toDataURL();const H=document.getElementById("doDirectPrintBtn"),J=H.cloneNode(!0);H.parentNode.replaceChild(J,H),J.onclick=async()=>{try{const m=await navigator.serial.requestPort();await m.open({baudRate:9600});const y=m.writable.getWriter();showCustomAlert("Mencetak...","success");const _=o.getImageData(0,0,c.width,c.height).data,M=Math.ceil(c.width/8),$=c.height,B=new Uint8Array(8+M*$);B[0]=29,B[1]=118,B[2]=48,B[3]=0,B[4]=M&255,B[5]=M>>8&255,B[6]=$&255,B[7]=$>>8&255;let ee=8;for(let R=0;R<$;R++)for(let F=0;F<M;F++){let V=0;for(let q=0;q<8;q++){const W=F*8+q;if(W<c.width){const U=(R*c.width+W)*4,ae=_[U]*.299+_[U+1]*.587+_[U+2]*.114;_[U+3]>128&&ae<128&&(V|=1<<7-q)}}B[ee++]=V}const te=new Uint8Array([27,64]),ne=new Uint8Array([27,97,1]),oe=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await y.write(te),await y.write(ne),await y.write(B),await y.write(oe),y.releaseLock(),await m.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(m){console.error(m),m.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+m.message,"error")}}}catch(i){console.error(i),showCustomAlert("Gagal memuat preview: "+i.message,"error")}},window.printBarcode=()=>{const i=document.getElementById("qrCodeImg").src,d=document.getElementById("detailName").textContent,I=document.getElementById("detailId").textContent.replace("ID: ",""),c=window.open("","_blank");if(!c){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}c.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${I}</title>
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
            <h3>${d}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${i}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${I}</div>
          </div>
        </body>
      </html>
    `),c.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",X(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const i=document.getElementById("deleteBtn"),d=i.innerHTML;i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',i.disabled=!0;try{await Y("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",N()}catch(I){showCustomAlert(I.message,"error")}finally{i.innerHTML=d,i.disabled=!1}}};window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function X(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e?(document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?x(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi?x(e.taksasi):"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price?x(e.dispose_price):"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none",e.photo&&(document.getElementById("photoPreviewImg").src=e.photo,t.style.display="block")):(document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none")}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files;if(!t||t.length===0)return;t.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const a=document.getElementById("photoPreview");a.innerHTML="",a.style.display="flex",Array.from(t).slice(0,4).forEach(s=>{const l=new FileReader;l.onload=function(r){const u=new Image;u.onload=function(){const w=document.createElement("canvas"),b=800,E=800;let i=u.width,d=u.height;i>d?i>b&&(d*=b/i,i=b):d>E&&(i*=E/d,d=E),w.width=i,w.height=d,w.getContext("2d").drawImage(u,0,0,i,d);const c=w.toDataURL("image/jpeg",.6);window.currentPhotosBase64.push(c);const o=document.createElement("img");o.src=c,o.style.width="80px",o.style.height="80px",o.style.objectFit="cover",o.style.borderRadius="8px",o.style.border="1px solid var(--glass-border)",o.style.flexShrink="0",a.appendChild(o)},u.src=r.target.result},l.readAsDataURL(s)})});window.showCustomAlert=function(e,t="success"){const a=document.getElementById("customAlertModal"),n=document.getElementById("alertTitle"),s=document.getElementById("alertMessage"),l=document.getElementById("alertIcon");s.textContent=e,t==="error"?(n.textContent="Gagal",n.style.color="#ef4444",l.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',l.style.color="#ef4444"):t==="warning"?(n.textContent="Perhatian",n.style.color="#d4af37",l.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',l.style.color="#d4af37"):(n.textContent="Berhasil",n.style.color="var(--accent)",l.innerHTML='<i class="fa-solid fa-circle-check"></i>',l.style.color="var(--accent)"),a.style.display="flex"};function G(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{z(),N(),document.getElementById("formValue").addEventListener("input",G),document.getElementById("formTaksasi").addEventListener("input",G),document.getElementById("formDisposePrice").addEventListener("input",G),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const a=document.getElementById("doLoginBtn");a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',a.disabled=!0;try{const n=await Q("login",{username:e,password:t});if(n.token){localStorage.setItem("BISDAC_token",n.token);const s=n.role||n.user&&n.user.role||"",l=n.nama||n.user&&n.user.nama||n.user&&n.user.name||"";localStorage.setItem("BISDAC_role",s),localStorage.setItem("BISDAC_name",l)}}catch(n){showCustomAlert(n.message,"error")}finally{a.innerHTML="Masuk",a.disabled=!1,document.getElementById("loginModal").style.display="none",z(),D&&N()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),z(),j(h),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{X()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,a=document.getElementById("formValue").value.replace(/\./g,""),n=document.getElementById("formLocation").value,s=document.getElementById("formCategory").value,l=document.getElementById("formSource").value,r=document.getElementById("formTaksasi").value.replace(/\./g,""),u=document.getElementById("formPic").value,w=document.getElementById("formId").value,b=document.getElementById("formQty").value,E=document.getElementById("formUnit").value,i=document.getElementById("formSubItems").value,d=document.getElementById("formStatus").value;let I=document.getElementById("formDisposeReason").value,c=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!n||!u||!s||!l||!b||!E)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(d==="Disposed"&&!I)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");d!=="Disposed"&&(I="",c="");const o={isUpdate:!!w,id:w,name:e,date_acquired:t,value:a,location:n,category:s,source:l,taksasi:r,pic:u,qty:b,unit:E,sub_items:i,status:d,dispose_reason:I,dispose_price:c};window.currentPhotosBase64&&window.currentPhotosBase64.length>0&&(o.photo_base64=window.currentPhotosBase64[0]||"",o.photo2_base64=window.currentPhotosBase64[1]||"",o.photo3_base64=window.currentPhotosBase64[2]||"",o.photo4_base64=window.currentPhotosBase64[3]||"");const f=document.getElementById("saveBtn");f.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',f.disabled=!0;try{await Y("saveInventory",o),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),N()}catch(v){showCustomAlert(v.message,"error")}finally{f.innerHTML="Simpan Data",f.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",e=>{const t=e.target.value.toLowerCase(),a=h.filter(n=>n.name.toLowerCase().includes(t)||n.location.toLowerCase().includes(t)||n.pic.toLowerCase().includes(t));j(a)})});window.exportCSV=function(){if(!h||h.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","TAKSASI_SAAT_INI","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=h.map(r=>[r.id,O(r.date_acquired)||"",`"${(r.name||"").replace(/"/g,'""')}"`,`"${(r.category||"").replace(/"/g,'""')}"`,`"${(r.source||"").replace(/"/g,'""')}"`,r.value||0,r.taksasi||0,r.qty||1,r.unit||"Unit",`"${(r.location||"").replace(/"/g,'""')}"`,`"${(r.pic||"").replace(/"/g,'""')}"`,r.status||"Active",r.status==="Disposed"?`"${(r.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',r.status==="Disposed"?r.dispose_price||0:'""',`"${(r.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),a=e.join(",")+`
`+t.join(`
`),n=new Blob([a],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(n),l=document.createElement("a");l.setAttribute("href",s),l.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(l),l.click(),document.body.removeChild(l),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!h||h.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
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
  `;h.forEach(n=>{const s=n.photo?n.photo:"https://via.placeholder.com/60?text=No+Photo",l=n.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${n.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
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
            Awal: ${x(n.value||0)}<br>
            <span style="color:#666;">Taksasi: ${x(n.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const a={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(a).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
