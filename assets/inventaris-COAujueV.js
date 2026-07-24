import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const se="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function te(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():se}let H=null,B=[];function P(e){return new Intl.NumberFormat("id-ID").format(e)}function G(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const l=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${l[t.getMonth()]} ${t.getFullYear()}`}async function X(e,t={}){const l=new URL(te());l.searchParams.set("action",e),l.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),l.searchParams.set("_t",Date.now());for(let n in t)l.searchParams.set(n,t[n]);const i=await(await fetch(l.toString(),{method:"GET",redirect:"follow"})).json();if(!i.success)throw new Error(i.message||"API Error");return i}async function Y(e,t){const l={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},i=await(await fetch(te(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(l)})).json();if(!i.success)throw new Error(i.message||"API Error");return i}function N(e,t){return e?e.split(",").map(o=>o.trim()).includes(t):!1}function K(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),l=localStorage.getItem("BISDAC_name"),o=t&&(N(t,"Admin")||N(t,"Bendahara")||N(t,"Diakon")||N(t,"Ketua Jemaat")||N(t,"Pendeta"));e&&o?(H={token:e,role:t,name:l},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${l}`,document.querySelectorAll(".admin-only-field").forEach(i=>i.style.display=i.dataset.display||"block")):(H=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(i=>i.style.display="none"))}window.currentViewMode=localStorage.getItem("BISDAC_invViewMode")||"grid";window.changeViewMode=function(e){window.currentViewMode=e,localStorage.setItem("BISDAC_invViewMode",e),e==="grid"?(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")):(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active")),window.renderGrid()};window.renderGrid=function(){re();const e=document.getElementById("searchInput")?document.getElementById("searchInput").value.toLowerCase():"",t=document.getElementById("filterCategory")?document.getElementById("filterCategory").value:"",l=document.getElementById("filterStatus")?document.getElementById("filterStatus").value:"",o=document.getElementById("filterLoan")?document.getElementById("filterLoan").value:"";let i=B;(e||t||l||o)&&(i=B.filter(s=>{let d=!0;if(e&&(d=d&&(s.name&&s.name.toLowerCase().includes(e)||s.location&&s.location.toLowerCase().includes(e)||s.pic&&s.pic.toLowerCase().includes(e))),t&&(d=d&&s.category===t),l&&(d=d&&(s.status||"Active")===l),o){const c=s.loan_status||"Tersedia";d=d&&c===o}return d}));const n=document.getElementById("inventoryGrid");if(!i||i.length===0){n.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}const a=window.currentViewMode==="list";n.className=a?"inventory-list":"inventory-grid",n.innerHTML=i.map(s=>{const d=s.photo?s.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",c=s.status==="Disposed",g=c?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"";let y="";c?y='<span class="inv-badge-status" style="background:#ef4444;">Disposed</span>':(s.loan_status||"Tersedia")==="Dipinjam"?y='<span class="inv-badge-status" style="background:#eab308; color:#fff;">Dipinjam</span>':y=`<span class="inv-badge-status">${s.category||"Belum Kategori"}</span>`;const p=H?`<input type="checkbox" class="bulk-qr-checkbox" value="${s.id}" onclick="event.stopPropagation(); window.toggleBulkPrintButton();" style="position:absolute; top:15px; left:15px; z-index:20; width:20px; height:20px; cursor:pointer;" title="Pilih untuk cetak QR">`:"";return a?`
        <div class="inv-list-card" style="${g}" onclick="window.viewDetail('${s.id}')">
          ${p}
          <img src="${d}" class="inv-list-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'">
          <div class="inv-list-info">
            <div style="flex:1;">
              ${y}
              <div class="inv-asset-name" style="margin-top:4px;">
                ${s.name}
                <span style="font-size:0.7rem; font-weight:700; color:var(--accent-dark); background-color:var(--border-light); padding:4px 10px; border-radius:12px; white-space:nowrap; margin-left:8px; vertical-align:middle;">
                  ${s.qty||1} ${s.unit||"Unit"}
                </span>
              </div>
              
              <div style="display: flex; flex-wrap:wrap; gap: 16px; margin-bottom: 5px; margin-top:12px;">
                <div class="inv-asset-meta"><i class="fa-solid fa-barcode"></i> ${s.id}</div>
                <div class="inv-asset-meta"><i class="fa-regular fa-user"></i> ${s.pic}</div>
                <div class="inv-asset-meta"><i class="fa-solid fa-location-dot"></i> ${s.location||"-"}</div>
              </div>
            </div>
            
            ${H?`
              <div style="min-width: 150px; text-align:right; border-left:1px solid var(--border-light); padding-left:24px;">
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Nilai Aset</div>
                <div class="inv-asset-value" style="margin-top:4px;">Rp ${P(s.taksasi||s.value||0)}</div>
                <div class="btn btn-outline" style="margin-top:16px; padding:8px 16px; font-size:0.85rem; border-radius:50px; width:100%;">Lihat Detail</div>
              </div>
            `:'<div style="padding-left:24px;"><div class="btn btn-outline" style="padding:8px 16px; border-radius:50px;">Lihat Detail</div></div>'}
          </div>
        </div>
      `:`
        <div class="inv-asset-card" style="${g}" onclick="window.viewDetail('${s.id}')">
          ${p}
          <img src="${d}" class="inv-asset-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'">
          <div class="inv-asset-info">
            ${y}
            <div class="inv-asset-name" style="margin-top:4px;">
              ${s.name}
              <span style="font-size:0.7rem; font-weight:700; color:var(--accent-dark); background-color:var(--border-light); padding:4px 8px; border-radius:12px; white-space:nowrap; vertical-align:middle; display:inline-block; margin-left:4px;">
                ${s.qty||1} ${s.unit||"Unit"}
              </span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; margin-top: 8px;">
              <div class="inv-asset-meta"><i class="fa-solid fa-barcode" style="width:16px;"></i> ${s.id}</div>
              <div class="inv-asset-meta"><i class="fa-regular fa-user" style="width:16px;"></i> ${s.pic}</div>
              <div class="inv-asset-meta"><i class="fa-solid fa-location-dot" style="width:16px;"></i> ${s.location||"-"}</div>
            </div>
            
            ${H?`
              <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid var(--border-light); padding-top:16px; margin-top:auto;">
                <div>
                  <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Nilai Aset</div>
                  <div class="inv-asset-value">Rp ${P(s.taksasi||s.value||0)}</div>
                </div>
              </div>
            `:""}
          </div>
          <div class="card-action-btn"><i class="fa-solid fa-arrow-right"></i></div>
        </div>
      `}).join("")};async function j(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 60px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent-dark);"></i><p style="margin-top:15px; color:var(--text-muted); font-weight: 500;">Memuat koleksi inventaris...</p></div>',B=(await X("getInventory")).data||[],B.sort((i,n)=>new Date(n.created_at)-new Date(i.created_at)),window.renderGrid();const o=new URLSearchParams(window.location.search).get("id");o&&setTimeout(()=>{window.viewDetail(o)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=B.find(m=>m.id===e);if(!t)return;document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=G(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const l=document.getElementById("detailLoanBadge");(t.loan_status||"Tersedia")==="Dipinjam"?(l.style.background="#eab308",l.textContent=`Dipinjam oleh: ${t.borrowed_by||"-"} (s.d ${G(t.expected_return_date)||"-"})`):(l.style.background="#22c55e",l.textContent="Tersedia");const i=document.getElementById("detailStatusContainer"),n=document.getElementById("detailStatusBadge"),a=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(i.style.display="block",n.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',n.style.background="rgba(239, 68, 68, 0.2)",n.style.color="#ef4444",a.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",H&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${P(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(i.style.display="block",n.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',n.style.background="rgba(74, 222, 128, 0.1)",n.style.color="#4ade80",a.style.display="none");const s=document.getElementById("detailSubItems"),d=document.getElementById("detailSubItemsContainer");t.sub_items?(s.textContent=t.sub_items,d.style.display="flex"):d.style.display="none";const c=document.getElementById("detailPhotosContainer");c.innerHTML="";const g=[t.photo,t.pic2,t.pic3,t.pic4].filter(m=>m);g.length>0?(g.forEach(m=>{const f=document.createElement("img");f.src=m,f.style.height="180px",f.style.maxWidth="100%",f.style.borderRadius="12px",f.style.objectFit="contain",f.style.border="1px solid var(--border-light)",f.style.flexShrink="0",f.style.backgroundColor="#f8f9fa",f.style.cursor="pointer",f.onclick=()=>{document.getElementById("imagePreviewFull").src=m,document.getElementById("imagePreviewModal").style.display="flex"},c.appendChild(f)}),c.style.display="flex"):c.style.display="none",H?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${P(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${P(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const y=window.location.origin+window.location.pathname+"?id="+t.id,p=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(y)}`;document.getElementById("qrCodeImg").src=p,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const m=document.getElementById("detailName").textContent,f=document.getElementById("detailId").textContent.replace("ID: ",""),v=document.getElementById("qrCodeImg").src,u=document.createElement("canvas");u.width=384,u.height=520;const r=u.getContext("2d"),T=u.width/2;r.fillStyle="#ffffff",r.fillRect(0,0,u.width,u.height);const k=20,x=12,w=12,z=u.width-24,h=u.height-24;r.strokeStyle="#000000",r.lineWidth=5,r.beginPath(),r.moveTo(x+k,w),r.lineTo(x+z-k,w),r.quadraticCurveTo(x+z,w,x+z,w+k),r.lineTo(x+z,w+h-k),r.quadraticCurveTo(x+z,w+h,x+z-k,w+h),r.lineTo(x+k,w+h),r.quadraticCurveTo(x,w+h,x,w+h-k),r.lineTo(x,w+k),r.quadraticCurveTo(x,w,x+k,w),r.closePath(),r.stroke(),r.fillStyle="#000000",r.textAlign="center",r.textBaseline="top",r.font="bold 26px monospace";let A=m.toUpperCase();if(A.length<=24)r.fillText(A,T,45);else{let I=A.lastIndexOf(" ",24);I===-1&&(I=22);let D=A.substring(0,I),R=A.substring(I).trim();R.length>24&&(R=R.substring(0,21)+"..."),r.fillText(D,T,30),r.fillText(R,T,60)}const E=new Image;E.crossOrigin="Anonymous",await new Promise((I,D)=>{E.onload=I,E.onerror=D,E.src=v});const S=300;r.drawImage(E,T-S/2,95,S,S);const C=new Image;if(C.crossOrigin="Anonymous",await new Promise((I,D)=>{C.onload=I,C.onerror=()=>I(),C.src=window.location.origin+"/icons/PisgahColor.png"}),C.complete&&C.naturalWidth>0){const D=T,R=95+S/2,$=document.createElement("canvas");$.width=80,$.height=80;const U=$.getContext("2d");U.drawImage(C,0,0,80,80);const F=U.getImageData(0,0,80,80),b=F.data;for(let q=0;q<b.length;q+=4)b[q+3]>20&&(b[q]=0,b[q+1]=0,b[q+2]=0,b[q+3]=255);U.putImageData(F,0,0),r.fillStyle="#ffffff",r.beginPath(),r.arc(D,R,80/2+8,0,Math.PI*2),r.fill(),r.drawImage($,D-80/2,R-80/2,80,80)}r.fillStyle="#000000",r.font="bold 28px monospace",r.fillText(f,T,420),r.strokeStyle="#cccccc",r.lineWidth=1,r.beginPath(),r.moveTo(60,460),r.lineTo(u.width-60,460),r.stroke(),r.fillStyle="#888888",r.font="20px monospace",r.fillText("PISGAH-BISDAC",T,472);const _=document.getElementById("thermalPreviewModal");_.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=u.toDataURL();const L=document.getElementById("doDirectPrintBtn"),M=L.cloneNode(!0);L.parentNode.replaceChild(M,L),M.onclick=async()=>{try{const I=await navigator.serial.requestPort();await I.open({baudRate:9600});const D=I.writable.getWriter();showCustomAlert("Mencetak...","success");const $=r.getImageData(0,0,u.width,u.height).data,U=Math.ceil(u.width/8),F=u.height,b=new Uint8Array(8+U*F);b[0]=29,b[1]=118,b[2]=48,b[3]=0,b[4]=U&255,b[5]=U>>8&255,b[6]=F&255,b[7]=F>>8&255;let q=8;for(let W=0;W<F;W++)for(let J=0;J<U;J++){let Z=0;for(let O=0;O<8;O++){const ee=J*8+O;if(ee<u.width){const V=(W*u.width+ee)*4,le=$[V]*.299+$[V+1]*.587+$[V+2]*.114;$[V+3]>128&&le<128&&(Z|=1<<7-O)}}b[q++]=Z}const oe=new Uint8Array([27,64]),ae=new Uint8Array([27,97,1]),ie=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await D.write(oe),await D.write(ae),await D.write(b),await D.write(ie),D.releaseLock(),await I.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(I){console.error(I),I.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+I.message,"error")}}}catch(m){console.error(m),showCustomAlert("Gagal memuat preview: "+m.message,"error")}},window.printBarcode=()=>{const m=document.getElementById("qrCodeImg").src,f=document.getElementById("detailName").textContent,v=document.getElementById("detailId").textContent.replace("ID: ",""),u=window.open("","_blank");if(!u){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}u.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${v}</title>
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
            <h3>${f}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${m}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${v}</div>
          </div>
        </body>
      </html>
    `),u.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",ne(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const m=document.getElementById("deleteBtn"),f=m.innerHTML;m.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',m.disabled=!0;try{await Y("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",j()}catch(v){showCustomAlert(v.message,"error")}finally{m.innerHTML=f,m.disabled=!1}}};function re(){window.isAllSelected=!1;const e=document.querySelector("#btnSelectAll i");e&&(e.className="fa-regular fa-square-check");const t=document.getElementById("btnSelectAll");t&&t.classList.remove("active")}window.isAllSelected=!1;window.toggleSelectAll=function(){const e=document.querySelectorAll(".bulk-qr-checkbox");if(e.length===0)return;window.isAllSelected=!window.isAllSelected;const t=document.querySelector("#btnSelectAll i");window.isAllSelected?(e.forEach(l=>l.checked=!0),t&&(t.className="fa-solid fa-square-check"),document.getElementById("btnSelectAll").classList.add("active")):(e.forEach(l=>l.checked=!1),t&&(t.className="fa-regular fa-square-check"),document.getElementById("btnSelectAll").classList.remove("active")),window.toggleBulkPrintButton()};window.toggleBulkPrintButton=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked"),t=document.getElementById("bulkPrintContainer"),l=document.getElementById("bulkPrintCount");e.length>0?(l.textContent=e.length+" Dipilih",t.style.display="block"):t.style.display="none"};window.printSelectedQRs=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;const t=Array.from(e).map(n=>n.value),l=B.filter(n=>t.includes(n.id)),o=window.open("","_blank");if(!o){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}let i=`
    <html>
      <head>
        <title>Cetak Label Inventaris Massal</title>
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body { 
            font-family: 'Inter', sans-serif, monospace; 
            margin: 0; 
            background: #fff;
            color: #000;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
            justify-content: center;
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
            page-break-inside: avoid;
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
        <div class="grid-container">
  `;l.forEach(n=>{const a=window.location.origin+window.location.pathname+"?id="+n.id,s=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(a)}`,d=n.id.replace("ID: ","");i+=`
          <div class="label-box">
            <h3>${n.name}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${s}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${d}</div>
          </div>
    `}),i+=`
        </div>
      </body>
    </html>
  `,o.document.write(i),o.document.close(),e.forEach(n=>n.checked=!1),window.toggleBulkPrintButton()};window.printSelectedThermal=async function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print (Web Serial). Gunakan Google Chrome/Edge di PC.","error");const t=Array.from(e).map(o=>o.value),l=B.filter(o=>t.includes(o.id));try{const o=await navigator.serial.requestPort();await o.open({baudRate:9600});const i=o.writable.getWriter();showCustomAlert("Menghubungkan ke printer dan memulai cetak...","success");const n=new Uint8Array([27,64]),a=new Uint8Array([27,97,1]),s=new Uint8Array([27,74,48]);await i.write(n),await i.write(a);for(let c=0;c<l.length;c++){const g=l[c],y=await de(g);await i.write(y),await i.write(s)}const d=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await i.write(d),i.releaseLock(),await o.close(),showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success"),e.forEach(c=>c.checked=!1),window.toggleBulkPrintButton()}catch(o){console.error(o),o.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+o.message,"error")}};async function de(e){const t=e.name||"",l=e.id.replace("ID: ",""),o=window.location.origin+window.location.pathname+"?id="+e.id,i=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(o)}`,n=document.createElement("canvas");n.width=384,n.height=520;const a=n.getContext("2d"),s=n.width/2;a.fillStyle="#ffffff",a.fillRect(0,0,n.width,n.height);const d=20,c=12,g=12,y=n.width-24,p=n.height-24;a.strokeStyle="#000000",a.lineWidth=5,a.beginPath(),a.moveTo(c+d,g),a.lineTo(c+y-d,g),a.quadraticCurveTo(c+y,g,c+y,g+d),a.lineTo(c+y,g+p-d),a.quadraticCurveTo(c+y,g+p,c+y-d,g+p),a.lineTo(c+d,g+p),a.quadraticCurveTo(c,g+p,c,g+p-d),a.lineTo(c,g+d),a.quadraticCurveTo(c,g,c+d,g),a.closePath(),a.stroke(),a.fillStyle="#000000",a.textAlign="center",a.textBaseline="top",a.font="bold 26px monospace";let m=t.toUpperCase();if(m.length<=24)a.fillText(m,s,45);else{let h=m.lastIndexOf(" ",24);h===-1&&(h=22);let A=m.substring(0,h),E=m.substring(h).trim();E.length>24&&(E=E.substring(0,21)+"..."),a.fillText(A,s,30),a.fillText(E,s,60)}const f=new Image;f.crossOrigin="Anonymous",await new Promise(h=>{f.onload=h,f.onerror=h,f.src=i});const v=300;a.drawImage(f,s-v/2,95,v,v);const u=new Image;if(u.crossOrigin="Anonymous",await new Promise(h=>{u.onload=h,u.onerror=h,u.src=window.location.origin+"/icons/PisgahColor.png"}),u.complete&&u.naturalWidth>0){const A=s,E=95+v/2,S=document.createElement("canvas");S.width=80,S.height=80;const C=S.getContext("2d");C.drawImage(u,0,0,80,80);const _=C.getImageData(0,0,80,80),L=_.data;for(let M=0;M<L.length;M+=4)L[M+3]>20&&(L[M]=0,L[M+1]=0,L[M+2]=0,L[M+3]=255);C.putImageData(_,0,0),a.fillStyle="#ffffff",a.beginPath(),a.arc(A,E,80/2+8,0,Math.PI*2),a.fill(),a.drawImage(S,A-80/2,E-80/2,80,80)}a.fillStyle="#000000",a.font="bold 28px monospace",a.fillText(l,s,420),a.strokeStyle="#cccccc",a.lineWidth=1,a.beginPath(),a.moveTo(60,460),a.lineTo(n.width-60,460),a.stroke(),a.fillStyle="#888888",a.font="20px monospace",a.fillText("PISGAH-BISDAC",s,472);const T=a.getImageData(0,0,n.width,n.height).data,k=Math.ceil(n.width/8),x=n.height,w=new Uint8Array(8+k*x);w[0]=29,w[1]=118,w[2]=48,w[3]=0,w[4]=k&255,w[5]=k>>8&255,w[6]=x&255,w[7]=x>>8&255;let z=8;for(let h=0;h<x;h++)for(let A=0;A<k;A++){let E=0;for(let S=0;S<8;S++){const C=A*8+S;if(C<n.width){const _=(h*n.width+C)*4,L=T[_]*.299+T[_+1]*.587+T[_+2]*.114;T[_+3]>128&&L<128&&(E|=1<<7-S)}}w[z++]=E}return w}window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function ne(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");if(t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e){document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?P(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi||"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price||"",document.getElementById("formDepreciationYears").value=e.depreciation_years||"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none";const l=[];e.photo&&l.push(e.photo),e.pic2&&l.push(e.pic2),e.pic3&&l.push(e.pic3),e.pic4&&l.push(e.pic4),l.length>0&&(window.currentPhotosBase64=[...l],window.renderPhotoPreview())}else document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("formDepreciationYears").value="",document.getElementById("disposeFields").style.display="none"}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files;if(!t||t.length===0)return;t.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const l=document.getElementById("photoPreview");l.innerHTML="",l.style.display="flex",Array.from(t).slice(0,4).forEach(i=>{const n=new FileReader;n.onload=function(a){const s=new Image;s.onload=function(){const d=document.createElement("canvas"),c=500,g=500;let y=s.width,p=s.height;y>p?y>c&&(p*=c/y,y=c):p>g&&(y*=g/p,p=g),d.width=y,d.height=p,d.getContext("2d").drawImage(s,0,0,y,p);const f=d.toDataURL("image/jpeg",.4);window.currentPhotosBase64.push(f),window.renderPhotoPreview()},s.src=a.target.result},n.readAsDataURL(i)})});window.renderPhotoPreview=function(){const e=document.getElementById("photoPreview");if(e.innerHTML="",!window.currentPhotosBase64||window.currentPhotosBase64.length===0){e.style.display="none";return}e.style.display="flex",window.currentPhotosBase64.forEach((t,l)=>{const o=document.createElement("div");o.style.position="relative",o.style.display="inline-block";const i=document.createElement("img");i.src=t,i.style.width="80px",i.style.height="80px",i.style.objectFit="cover",i.style.borderRadius="8px",i.style.border="1px solid var(--glass-border)",i.style.flexShrink="0";const n=document.createElement("button");n.innerHTML='<i class="fa-solid fa-xmark"></i>',n.style.position="absolute",n.style.top="-5px",n.style.right="-5px",n.style.background="#ef4444",n.style.color="white",n.style.border="none",n.style.borderRadius="50%",n.style.width="20px",n.style.height="20px",n.style.cursor="pointer",n.style.display="flex",n.style.alignItems="center",n.style.justifyContent="center",n.style.fontSize="12px",n.onclick=a=>{a.preventDefault(),window.currentPhotosBase64.splice(l,1),window.renderPhotoPreview()},o.appendChild(i),o.appendChild(n),e.appendChild(o)})};window.showCustomAlert=function(e,t="success"){const l=document.getElementById("customAlertModal"),o=document.getElementById("alertTitle"),i=document.getElementById("alertMessage"),n=document.getElementById("alertIcon");i.textContent=e,t==="error"?(o.textContent="Gagal",o.style.color="#ef4444",n.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',n.style.color="#ef4444"):t==="warning"?(o.textContent="Perhatian",o.style.color="#d4af37",n.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',n.style.color="#d4af37"):(o.textContent="Berhasil",o.style.color="var(--accent)",n.innerHTML='<i class="fa-solid fa-circle-check"></i>',n.style.color="var(--accent)"),l.style.display="flex"};function Q(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{K(),j(),document.getElementById("formValue").addEventListener("input",Q),document.getElementById("formTaksasi").addEventListener("input",Q),document.getElementById("formDisposePrice").addEventListener("input",Q),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const l=document.getElementById("doLoginBtn");l.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',l.disabled=!0;try{const o=await X("login",{username:e,password:t});if(o.token){localStorage.setItem("BISDAC_token",o.token);const i=o.role||o.user&&o.user.role||"",n=o.nama||o.user&&o.user.nama||o.user&&o.user.name||"";localStorage.setItem("BISDAC_role",i),localStorage.setItem("BISDAC_name",n)}}catch(o){showCustomAlert(o.message,"error")}finally{l.innerHTML="Masuk",l.disabled=!1,document.getElementById("loginModal").style.display="none",K(),H&&j()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),K(),renderGrid(B),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{ne()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,l=document.getElementById("formValue").value.replace(/\./g,""),o=document.getElementById("formLocation").value,i=document.getElementById("formCategory").value,n=document.getElementById("formSource").value,a=document.getElementById("formTaksasi").value.replace(/\./g,""),s=document.getElementById("formPic").value,d=document.getElementById("formId").value,c=document.getElementById("formQty").value,g=document.getElementById("formUnit").value,y=document.getElementById("formSubItems").value,p=document.getElementById("formStatus").value;let m=document.getElementById("formDisposeReason").value,f=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!o||!s||!i||!n||!c||!g)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(p==="Disposed"&&!m)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");const v={isUpdate:!!d,id:d,name:e,date_acquired:t,value:l,location:o,category:i,source:n,taksasi:a,pic:s,qty:c,unit:g,sub_items:y,status:p,dispose_reason:p==="Disposed"?m:"",dispose_price:f,depreciation_years:document.getElementById("formDepreciationYears").value};window.currentPhotosBase64&&window.currentPhotosBase64.length>0?(v.photo=window.currentPhotosBase64[0]||"",v.pic2=window.currentPhotosBase64[1]||"",v.pic3=window.currentPhotosBase64[2]||"",v.pic4=window.currentPhotosBase64[3]||""):v.isUpdate;const u=document.getElementById("saveBtn");u.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',u.disabled=!0;try{await Y("saveInventory",v),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),j()}catch(r){showCustomAlert(r.message,"error")}finally{u.innerHTML="Simpan Data",u.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",()=>{window.renderGrid()})});window.exportCSV=function(){if(!B||B.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","MARKET_VALUE","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=B.map(a=>[a.id,G(a.date_acquired)||"",`"${(a.name||"").replace(/"/g,'""')}"`,`"${(a.category||"").replace(/"/g,'""')}"`,`"${(a.source||"").replace(/"/g,'""')}"`,a.value||0,a.taksasi||0,a.qty||1,a.unit||"Unit",`"${(a.location||"").replace(/"/g,'""')}"`,`"${(a.pic||"").replace(/"/g,'""')}"`,a.status||"Active",a.status==="Disposed"?`"${(a.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',a.status==="Disposed"?a.dispose_price||0:'""',`"${(a.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),l=e.join(",")+`
`+t.join(`
`),o=new Blob([l],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(o),n=document.createElement("a");n.setAttribute("href",i),n.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(n),n.click(),document.body.removeChild(n),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!B||B.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
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
  `;B.forEach(o=>{const i=o.photo?o.photo:"/icons/PisgahLogoColor.png",n=o.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${o.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${i}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong style="font-size:12px;">${o.name}</strong><br>
            <span style="color:#666; font-family:monospace;">${o.id}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${o.category||"-"}<br>
            <span style="color:#666;">${o.location}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${n}<br>
            ${o.qty||1} ${o.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${P(o.value||0)}<br>
            <span style="color:#666;">Market Value: ${P(o.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const l={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(l).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};window.openLoanModal=function(){if(!window.currentDetailId)return;const e=B.find(l=>l.id===window.currentDetailId);if(!e)return;document.getElementById("formLoanStatus").value=e.loan_status||"Tersedia",document.getElementById("formLoanBorrower").value=e.borrowed_by||"",e.borrow_date?document.getElementById("formLoanDate").value=new Date(e.borrow_date).toISOString().split("T")[0]:document.getElementById("formLoanDate").value=new Date().toISOString().split("T")[0],e.expected_return_date?document.getElementById("formLoanReturnDate").value=new Date(e.expected_return_date).toISOString().split("T")[0]:document.getElementById("formLoanReturnDate").value="";const t=document.getElementById("loanDetailsFields");t.style.display=e.loan_status==="Dipinjam"?"block":"none",document.getElementById("loanModal").style.display="flex"};document.getElementById("saveLoanBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=B.find(s=>s.id===window.currentDetailId);if(!e)return;const t=document.getElementById("formLoanStatus").value,l=document.getElementById("formLoanBorrower").value,o=document.getElementById("formLoanDate").value,i=document.getElementById("formLoanReturnDate").value;if(t==="Dipinjam"&&(!l||!o||!i))return showCustomAlert("Mohon lengkapi data peminjam dan tanggalnya!","error");const n={isUpdate:!0,id:e.id,loan_status:t,borrowed_by:t==="Dipinjam"?l:"",borrow_date:t==="Dipinjam"?o:"",expected_return_date:t==="Dipinjam"?i:""},a=document.getElementById("saveLoanBtn");a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',a.disabled=!0;try{await Y("saveInventory",n),showCustomAlert("Status Peminjaman berhasil diperbarui!","success"),document.getElementById("loanModal").style.display="none",j()}catch(s){showCustomAlert(s.message,"error")}finally{a.innerHTML="Simpan Status",a.disabled=!1}};window.openServiceModal=function(){window.currentDetailId&&(document.getElementById("formServiceDate").value=new Date().toISOString().split("T")[0],document.getElementById("formServiceDesc").value="",document.getElementById("formServiceCost").value="",document.getElementById("serviceModal").style.display="flex")};document.getElementById("saveServiceBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=document.getElementById("formServiceDate").value,t=document.getElementById("formServiceDesc").value,l=document.getElementById("formServiceCost").value;if(!e||!t)return showCustomAlert("Tanggal dan Keterangan wajib diisi!","error");const o={inventory_id:window.currentDetailId,service_date:e,description:t,cost:l},i=document.getElementById("saveServiceBtn");i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',i.disabled=!0;try{await Y("saveInventoryService",o),showCustomAlert("Riwayat servis berhasil dicatat!","success"),document.getElementById("serviceModal").style.display="none",loadServiceHistory(window.currentDetailId)}catch(n){showCustomAlert(n.message,"error")}finally{i.innerHTML="Simpan Riwayat",i.disabled=!1}};window.loadServiceHistory=async function(e){const t=document.getElementById("serviceHistoryContainer");t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat...</div>';try{const l=await X("getInventoryService",{inventory_id:e});if(!l.success)throw new Error(l.message);const o=l.data;if(!o||o.length===0){t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px; background:rgba(0,0,0,0.02); border-radius:8px;">Belum ada riwayat servis.</div>';return}o.sort((i,n)=>new Date(n.service_date)-new Date(i.service_date)),t.innerHTML=o.map(i=>`
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--text-dark); font-size:0.9rem;"><i class="fa-solid fa-calendar-day" style="color:var(--text-muted); margin-right:5px;"></i> ${G(i.service_date)}</strong>
          <span style="color:#ef4444; font-weight:bold; font-size:0.9rem;">Rp ${P(i.cost||0)}</span>
        </div>
        <div style="color:var(--text-dark); font-size:0.9rem; line-height:1.4;">${i.description}</div>
        <div style="color:var(--text-muted); font-size:0.75rem; text-align:right;">Dicatat oleh: ${i.created_by}</div>
      </div>
    `).join("")}catch(l){t.innerHTML=`<div style="text-align:center; color:#ef4444; font-size:0.9rem; padding:15px;">Gagal memuat: ${l.message}</div>`}};window.showDepreciationReport=function(){const e=document.getElementById("depreciationTableBody");e.innerHTML="";let t=0,l=0;new Date().getFullYear();const o=new Date;B.forEach(i=>{if(i.status==="Disposed"||!i.value)return;const n=parseFloat(i.value)||0,a=parseInt(i.depreciation_years)||0;let s=n,d="-";if(a>0&&i.date_acquired){const g=new Date(i.date_acquired);let p=((o.getFullYear()-g.getFullYear())*12+(o.getMonth()-g.getMonth()))/12;p<0&&(p=0),d=p.toFixed(1)+" Tahun";let m=n-n*(p/a);m<0&&(m=0),s=m}t+=n,l+=s;const c=document.createElement("tr");c.style.borderBottom="1px solid var(--border-light)",c.innerHTML=`
      <td style="padding:12px; color:var(--text-dark);">
        <strong>${i.name}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">${i.id}</span>
      </td>
      <td style="padding:12px; color:var(--text-muted);">${G(i.date_acquired)}</td>
      <td style="padding:12px; text-align:right; color:var(--text-dark);">Rp ${P(n)}</td>
      <td style="padding:12px; text-align:center; color:var(--text-dark);">${a>0?a:"-"}</td>
      <td style="padding:12px; text-align:center; color:var(--text-muted);">${d}</td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:${s===0?"#ef4444":"#22c55e"};">Rp ${P(s)}</td>
    `,e.appendChild(c)}),document.getElementById("depTotalAwal").textContent="Rp "+P(t),document.getElementById("depTotalBuku").textContent="Rp "+P(l),document.getElementById("depreciationModal").style.display="flex"};window.printDepreciation=function(){const e=document.querySelector("#depreciationModal .inv-modal-content").cloneNode(!0);e.querySelectorAll("button").forEach(i=>i.remove());const l=document.createElement("div");l.innerHTML=`
    <h2 style="text-align:center; margin-bottom:5px;">LAPORAN PENYUSUTAN NILAI ASET (DEPRESIASI)</h2>
    <p style="text-align:center; margin-top:0; margin-bottom:20px;">Gereja PISGAH-BISDAC | Tanggal Cetak: ${new Date().toLocaleString("id-ID")}</p>
  `,e.insertBefore(l,e.firstChild),e.style.padding="20px",e.style.background="#fff",e.style.color="#000";const o={margin:10,filename:`Laporan_Depresiasi_Aset_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2},jsPDF:{unit:"mm",format:"a4",orientation:"landscape"}};showCustomAlert("Sedang menyiapkan PDF...","success"),html2pdf().set(o).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
