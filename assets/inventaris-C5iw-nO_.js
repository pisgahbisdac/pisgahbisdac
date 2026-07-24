import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const se="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function X(){const t=localStorage.getItem("BISDAC_api_url");return t&&t.trim()!==""?t.trim():se}let z=null,k=[];function S(t){return new Intl.NumberFormat("id-ID").format(t)}function V(t){if(!t)return"-";const o=new Date(t);if(isNaN(o))return t;const s=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${o.getDate()} ${s[o.getMonth()]} ${o.getFullYear()}`}async function Z(t,o={}){const s=new URL(X());s.searchParams.set("action",t),s.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),s.searchParams.set("_t",Date.now());for(let i in o)s.searchParams.set(i,o[i]);const l=await(await fetch(s.toString(),{method:"GET",redirect:"follow"})).json();if(!l.success)throw new Error(l.message||"API Error");return l}async function ee(t,o){const s={action:t,token:localStorage.getItem("BISDAC_token")||"",data:o},l=await(await fetch(X(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(s)})).json();if(!l.success)throw new Error(l.message||"API Error");return l}function N(t,o){return t?t.split(",").map(e=>e.trim()).includes(o):!1}function J(){const t=localStorage.getItem("BISDAC_token"),o=localStorage.getItem("BISDAC_role"),s=localStorage.getItem("BISDAC_name"),e=o&&(N(o,"Admin")||N(o,"Bendahara")||N(o,"Diakon")||N(o,"Ketua Jemaat")||N(o,"Pendeta"));t&&e?(z={token:t,role:o,name:s},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${s}`,document.querySelectorAll(".admin-only-field").forEach(l=>l.style.display=l.dataset.display||"block")):(z=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(l=>l.style.display="none"))}window.currentViewMode=localStorage.getItem("BISDAC_invViewMode")||"grid";window.changeViewMode=function(t){window.currentViewMode=t,localStorage.setItem("BISDAC_invViewMode",t),t==="grid"?(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")):(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active"));const o=document.getElementById("searchInput").value.toLowerCase();if(o){const s=k.filter(e=>e.name.toLowerCase().includes(o)||e.location.toLowerCase().includes(o)||e.pic.toLowerCase().includes(o));F(s)}else F(k)};function F(t){le();const o=document.getElementById("inventoryGrid");if(!t||t.length===0){o.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}const s=window.currentViewMode==="list";o.className=s?"inventory-list":"inventory-grid",o.innerHTML=t.map(e=>{const l=e.photo?e.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",i=e.status==="Disposed",n=i?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",m=i?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${e.category||"Uncategorized"}</div>`,g=z?`<input type="checkbox" class="bulk-qr-checkbox" value="${e.id}" onclick="event.stopPropagation(); window.toggleBulkPrintButton();" style="position:absolute; top:15px; left:15px; z-index:20; width:20px; height:20px; cursor:pointer;" title="Pilih untuk cetak QR">`:"";return s?`
        <div class="inv-list-card" style="${n}" onclick="window.viewDetail('${e.id}')">
          ${g}
          <img src="${l}" class="inv-list-photo" alt="${e.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
          <div class="inv-list-info">
            ${m}
            <div style="flex:1;">
              <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
                ${e.name}
                <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
                  ${e.qty||1} ${e.unit||"Unit"}
                </span>
              </div>
              
              <div style="display: flex; flex-wrap:wrap; gap: 12px; margin-bottom: 5px;">
                <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${e.id}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> ${V(e.date_acquired)}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-user"></i> ${e.pic}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-location-dot"></i> ${e.location||"-"}</div>
              </div>
            </div>
            
            ${z?`
              <div class="inv-values-outer" style="min-width: 150px; display:flex; flex-direction:column; justify-content:flex-end;">
                <div class="inv-values-inner" style="margin-top: 35px; width:100%; text-align:right; border-left:1px solid rgba(255,255,255,0.1); padding-left:15px; padding-top: 15px;">
                  <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#4ade80;">Rp ${S(e.value)}</span></div>
                  <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); margin-top:8px;">Market Value<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${S(e.taksasi||0)}</span></div>
                </div>
              </div>
            `:""}
          </div>
        </div>
      `:`
        <div class="inv-asset-card" style="${n}" onclick="window.viewDetail('${e.id}')">
          ${g}
          ${m}
          <img src="${l}" class="inv-asset-photo" alt="${e.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Photo'">
          <div class="inv-asset-info">
            <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
              ${e.name}
              <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
                ${e.qty||1} ${e.unit||"Unit"}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
              <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${e.id}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> ${V(e.date_acquired)}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-user"></i> ${e.pic}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-location-dot"></i> ${e.location||"-"}</div>
            </div>
            
            ${z?`
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
                <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${S(e.value)}</span></div>
                <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Market Value<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${S(e.taksasi||0)}</span></div>
              </div>
            `:""}
          </div>
        </div>
      `}).join("")}async function j(){try{const t=document.getElementById("inventoryGrid");t.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',k=(await Z("getInventory")).data||[],k.sort((l,i)=>new Date(i.created_at)-new Date(l.created_at)),F(k);const e=new URLSearchParams(window.location.search).get("id");e&&setTimeout(()=>{window.viewDetail(e)},300)}catch(t){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${t.message}</div>`}}window.viewDetail=function(t){const o=k.find(r=>r.id===t);if(!o)return;document.getElementById("detailName").textContent=o.name,document.getElementById("detailId").textContent=o.id,document.getElementById("detailCategory").textContent=o.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=o.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=V(o.date_acquired),document.getElementById("detailLocation").textContent=o.location,document.getElementById("detailPic").textContent=o.pic,document.getElementById("detailQty").textContent=o.qty||1,document.getElementById("detailUnit").textContent=o.unit||"Unit";const s=document.getElementById("detailStatusContainer"),e=document.getElementById("detailStatusBadge"),l=document.getElementById("detailDisposeInfo");o.status==="Disposed"?(s.style.display="block",e.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',e.style.background="rgba(239, 68, 68, 0.2)",e.style.color="#ef4444",l.style.display="block",document.getElementById("detailDisposeReason").textContent=o.dispose_reason||"-",z&&o.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${S(o.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(s.style.display="block",e.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',e.style.background="rgba(74, 222, 128, 0.1)",e.style.color="#4ade80",l.style.display="none");const i=document.getElementById("detailSubItems"),n=document.getElementById("detailSubItemsContainer");o.sub_items?(i.textContent=o.sub_items,n.style.display="flex"):n.style.display="none";const m=document.getElementById("detailPhotosContainer");m.innerHTML="";const g=[o.photo,o.photo2,o.photo3,o.photo4].filter(r=>r);g.length>0?(g.forEach(r=>{const d=document.createElement("img");d.src=r,d.style.height="180px",d.style.maxWidth="100%",d.style.borderRadius="12px",d.style.objectFit="contain",d.style.border="1px solid rgba(255,255,255,0.1)",d.style.flexShrink="0",d.style.backgroundColor="rgba(0,0,0,0.2)",d.style.cursor="pointer",d.onclick=()=>{document.getElementById("imagePreviewFull").src=r,document.getElementById("imagePreviewModal").style.display="flex"},m.appendChild(d)}),m.style.display="flex"):m.style.display="none",z?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${S(o.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${S(o.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const u=window.location.origin+window.location.pathname+"?id="+o.id,y=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(u)}`;document.getElementById("qrCodeImg").src=y,document.getElementById("qrCodeId").textContent=o.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const r=document.getElementById("detailName").textContent,d=document.getElementById("detailId").textContent.replace("ID: ",""),b=document.getElementById("qrCodeImg").src,c=document.createElement("canvas");c.width=384,c.height=520;const a=c.getContext("2d"),w=c.width/2;a.fillStyle="#ffffff",a.fillRect(0,0,c.width,c.height);const C=20,v=12,x=12,D=c.width-24,B=c.height-24;a.strokeStyle="#000000",a.lineWidth=5,a.beginPath(),a.moveTo(v+C,x),a.lineTo(v+D-C,x),a.quadraticCurveTo(v+D,x,v+D,x+C),a.lineTo(v+D,x+B-C),a.quadraticCurveTo(v+D,x+B,v+D-C,x+B),a.lineTo(v+C,x+B),a.quadraticCurveTo(v,x+B,v,x+B-C),a.lineTo(v,x+C),a.quadraticCurveTo(v,x,v+C,x),a.closePath(),a.stroke(),a.fillStyle="#000000",a.textAlign="center",a.textBaseline="top",a.font="bold 26px monospace";let U=r.toUpperCase();if(U.length<=24)a.fillText(U,w,45);else{let p=U.lastIndexOf(" ",24);p===-1&&(p=22);let h=U.substring(0,p),M=U.substring(p).trim();M.length>24&&(M=M.substring(0,21)+"..."),a.fillText(h,w,30),a.fillText(M,w,60)}const f=new Image;f.crossOrigin="Anonymous",await new Promise((p,h)=>{f.onload=p,f.onerror=h,f.src=b});const A=300;a.drawImage(f,w-A/2,95,A,A);const I=new Image;if(I.crossOrigin="Anonymous",await new Promise((p,h)=>{I.onload=p,I.onerror=()=>p(),I.src=window.location.origin+"/icons/PisgahColor.png"}),I.complete&&I.naturalWidth>0){const h=w,M=95+A/2,$=document.createElement("canvas");$.width=80,$.height=80;const _=$.getContext("2d");_.drawImage(I,0,0,80,80);const R=_.getImageData(0,0,80,80),E=R.data;for(let q=0;q<E.length;q+=4)E[q+3]>20&&(E[q]=0,E[q+1]=0,E[q+2]=0,E[q+3]=255);_.putImageData(R,0,0),a.fillStyle="#ffffff",a.beginPath(),a.arc(h,M,80/2+8,0,Math.PI*2),a.fill(),a.drawImage($,h-80/2,M-80/2,80,80)}a.fillStyle="#000000",a.font="bold 28px monospace",a.fillText(d,w,420),a.strokeStyle="#cccccc",a.lineWidth=1,a.beginPath(),a.moveTo(60,460),a.lineTo(c.width-60,460),a.stroke(),a.fillStyle="#888888",a.font="20px monospace",a.fillText("PISGAH-BISDAC",w,472);const P=document.getElementById("thermalPreviewModal");P.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=c.toDataURL();const T=document.getElementById("doDirectPrintBtn"),L=T.cloneNode(!0);T.parentNode.replaceChild(L,T),L.onclick=async()=>{try{const p=await navigator.serial.requestPort();await p.open({baudRate:9600});const h=p.writable.getWriter();showCustomAlert("Mencetak...","success");const $=a.getImageData(0,0,c.width,c.height).data,_=Math.ceil(c.width/8),R=c.height,E=new Uint8Array(8+_*R);E[0]=29,E[1]=118,E[2]=48,E[3]=0,E[4]=_&255,E[5]=_>>8&255,E[6]=R&255,E[7]=R>>8&255;let q=8;for(let O=0;O<R;O++)for(let W=0;W<_;W++){let K=0;for(let H=0;H<8;H++){const Y=W*8+H;if(Y<c.width){const G=(O*c.width+Y)*4,ie=$[G]*.299+$[G+1]*.587+$[G+2]*.114;$[G+3]>128&&ie<128&&(K|=1<<7-H)}}E[q++]=K}const oe=new Uint8Array([27,64]),ne=new Uint8Array([27,97,1]),ae=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await h.write(oe),await h.write(ne),await h.write(E),await h.write(ae),h.releaseLock(),await p.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(p){console.error(p),p.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+p.message,"error")}}}catch(r){console.error(r),showCustomAlert("Gagal memuat preview: "+r.message,"error")}},window.printBarcode=()=>{const r=document.getElementById("qrCodeImg").src,d=document.getElementById("detailName").textContent,b=document.getElementById("detailId").textContent.replace("ID: ",""),c=window.open("","_blank");if(!c){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}c.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${b}</title>
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
              <img class="qr" src="${r}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${b}</div>
          </div>
        </body>
      </html>
    `),c.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",te(o)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const r=document.getElementById("deleteBtn"),d=r.innerHTML;r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',r.disabled=!0;try{await ee("deleteInventory",{id:o.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",j()}catch(b){showCustomAlert(b.message,"error")}finally{r.innerHTML=d,r.disabled=!1}}};function le(){window.isAllSelected=!1;const t=document.querySelector("#btnSelectAll i");t&&(t.className="fa-regular fa-square-check");const o=document.getElementById("btnSelectAll");o&&o.classList.remove("active")}window.isAllSelected=!1;window.toggleSelectAll=function(){const t=document.querySelectorAll(".bulk-qr-checkbox");if(t.length===0)return;window.isAllSelected=!window.isAllSelected;const o=document.querySelector("#btnSelectAll i");window.isAllSelected?(t.forEach(s=>s.checked=!0),o&&(o.className="fa-solid fa-square-check"),document.getElementById("btnSelectAll").classList.add("active")):(t.forEach(s=>s.checked=!1),o&&(o.className="fa-regular fa-square-check"),document.getElementById("btnSelectAll").classList.remove("active")),window.toggleBulkPrintButton()};window.toggleBulkPrintButton=function(){const t=document.querySelectorAll(".bulk-qr-checkbox:checked"),o=document.getElementById("bulkPrintContainer"),s=document.getElementById("bulkPrintCount");t.length>0?(s.textContent=t.length+" Dipilih",o.style.display="block"):o.style.display="none"};window.printSelectedQRs=function(){const t=document.querySelectorAll(".bulk-qr-checkbox:checked");if(t.length===0)return;const o=Array.from(t).map(i=>i.value),s=k.filter(i=>o.includes(i.id)),e=window.open("","_blank");if(!e){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}let l=`
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
  `;s.forEach(i=>{const n=window.location.origin+window.location.pathname+"?id="+i.id,m=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(n)}`,g=i.id.replace("ID: ","");l+=`
          <div class="label-box">
            <h3>${i.name}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${m}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${g}</div>
          </div>
    `}),l+=`
        </div>
      </body>
    </html>
  `,e.document.write(l),e.document.close(),t.forEach(i=>i.checked=!1),window.toggleBulkPrintButton()};window.printSelectedThermal=async function(){const t=document.querySelectorAll(".bulk-qr-checkbox:checked");if(t.length===0)return;if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print (Web Serial). Gunakan Google Chrome/Edge di PC.","error");const o=Array.from(t).map(e=>e.value),s=k.filter(e=>o.includes(e.id));try{const e=await navigator.serial.requestPort();await e.open({baudRate:9600});const l=e.writable.getWriter();showCustomAlert("Menghubungkan ke printer dan memulai cetak...","success");const i=new Uint8Array([27,64]),n=new Uint8Array([27,97,1]),m=new Uint8Array([27,74,48]);await l.write(i),await l.write(n);for(let u=0;u<s.length;u++){const y=s[u],r=await re(y);await l.write(r),await l.write(m)}const g=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await l.write(g),l.releaseLock(),await e.close(),showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success"),t.forEach(u=>u.checked=!1),window.toggleBulkPrintButton()}catch(e){console.error(e),e.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+e.message,"error")}};async function re(t){const o=t.name||"",s=t.id.replace("ID: ",""),e=window.location.origin+window.location.pathname+"?id="+t.id,l=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(e)}`,i=document.createElement("canvas");i.width=384,i.height=520;const n=i.getContext("2d"),m=i.width/2;n.fillStyle="#ffffff",n.fillRect(0,0,i.width,i.height);const g=20,u=12,y=12,r=i.width-24,d=i.height-24;n.strokeStyle="#000000",n.lineWidth=5,n.beginPath(),n.moveTo(u+g,y),n.lineTo(u+r-g,y),n.quadraticCurveTo(u+r,y,u+r,y+g),n.lineTo(u+r,y+d-g),n.quadraticCurveTo(u+r,y+d,u+r-g,y+d),n.lineTo(u+g,y+d),n.quadraticCurveTo(u,y+d,u,y+d-g),n.lineTo(u,y+g),n.quadraticCurveTo(u,y,u+g,y),n.closePath(),n.stroke(),n.fillStyle="#000000",n.textAlign="center",n.textBaseline="top",n.font="bold 26px monospace";let b=o.toUpperCase();if(b.length<=24)n.fillText(b,m,45);else{let f=b.lastIndexOf(" ",24);f===-1&&(f=22);let A=b.substring(0,f),I=b.substring(f).trim();I.length>24&&(I=I.substring(0,21)+"..."),n.fillText(A,m,30),n.fillText(I,m,60)}const c=new Image;c.crossOrigin="Anonymous",await new Promise(f=>{c.onload=f,c.onerror=f,c.src=l});const a=300;n.drawImage(c,m-a/2,95,a,a);const w=new Image;if(w.crossOrigin="Anonymous",await new Promise(f=>{w.onload=f,w.onerror=f,w.src=window.location.origin+"/icons/PisgahColor.png"}),w.complete&&w.naturalWidth>0){const A=m,I=95+a/2,P=document.createElement("canvas");P.width=80,P.height=80;const T=P.getContext("2d");T.drawImage(w,0,0,80,80);const L=T.getImageData(0,0,80,80),p=L.data;for(let h=0;h<p.length;h+=4)p[h+3]>20&&(p[h]=0,p[h+1]=0,p[h+2]=0,p[h+3]=255);T.putImageData(L,0,0),n.fillStyle="#ffffff",n.beginPath(),n.arc(A,I,80/2+8,0,Math.PI*2),n.fill(),n.drawImage(P,A-80/2,I-80/2,80,80)}n.fillStyle="#000000",n.font="bold 28px monospace",n.fillText(s,m,420),n.strokeStyle="#cccccc",n.lineWidth=1,n.beginPath(),n.moveTo(60,460),n.lineTo(i.width-60,460),n.stroke(),n.fillStyle="#888888",n.font="20px monospace",n.fillText("PISGAH-BISDAC",m,472);const v=n.getImageData(0,0,i.width,i.height).data,x=Math.ceil(i.width/8),D=i.height,B=new Uint8Array(8+x*D);B[0]=29,B[1]=118,B[2]=48,B[3]=0,B[4]=x&255,B[5]=x>>8&255,B[6]=D&255,B[7]=D>>8&255;let U=8;for(let f=0;f<D;f++)for(let A=0;A<x;A++){let I=0;for(let P=0;P<8;P++){const T=A*8+P;if(T<i.width){const L=(f*i.width+T)*4,p=v[L]*.299+v[L+1]*.587+v[L+2]*.114;v[L+3]>128&&p<128&&(I|=1<<7-P)}}B[U++]=I}return B}window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function te(t=null){document.getElementById("formModal").style.display="flex";const o=document.getElementById("photoPreview");o.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",t?(document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=t.id,document.getElementById("formName").value=t.name,document.getElementById("formDate").value=t.date_acquired?t.date_acquired.substring(0,10):"",document.getElementById("formValue").value=t.value?S(t.value):"",document.getElementById("formLocation").value=t.location,document.getElementById("formCategory").value=t.category||"",document.getElementById("formSource").value=t.source||"",document.getElementById("formTaksasi").value=t.taksasi?S(t.taksasi):"",document.getElementById("formPic").value=t.pic,document.getElementById("formQty").value=t.qty||1,document.getElementById("formUnit").value=t.unit||"Unit",document.getElementById("formSubItems").value=t.sub_items||"",document.getElementById("formStatus").value=t.status||"Active",document.getElementById("formDisposeReason").value=t.dispose_reason||"",document.getElementById("formDisposePrice").value=t.dispose_price?S(t.dispose_price):"",document.getElementById("disposeFields").style.display=t.status==="Disposed"?"block":"none",t.photo&&(document.getElementById("photoPreviewImg").src=t.photo,o.style.display="block")):(document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none")}document.getElementById("formPhoto").addEventListener("change",function(t){const o=t.target.files;if(!o||o.length===0)return;o.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const s=document.getElementById("photoPreview");s.innerHTML="",s.style.display="flex",Array.from(o).slice(0,4).forEach(l=>{const i=new FileReader;i.onload=function(n){const m=new Image;m.onload=function(){const g=document.createElement("canvas"),u=800,y=800;let r=m.width,d=m.height;r>d?r>u&&(d*=u/r,r=u):d>y&&(r*=y/d,d=y),g.width=r,g.height=d,g.getContext("2d").drawImage(m,0,0,r,d);const c=g.toDataURL("image/jpeg",.6);window.currentPhotosBase64.push(c);const a=document.createElement("img");a.src=c,a.style.width="80px",a.style.height="80px",a.style.objectFit="cover",a.style.borderRadius="8px",a.style.border="1px solid var(--glass-border)",a.style.flexShrink="0",s.appendChild(a)},m.src=n.target.result},i.readAsDataURL(l)})});window.showCustomAlert=function(t,o="success"){const s=document.getElementById("customAlertModal"),e=document.getElementById("alertTitle"),l=document.getElementById("alertMessage"),i=document.getElementById("alertIcon");l.textContent=t,o==="error"?(e.textContent="Gagal",e.style.color="#ef4444",i.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',i.style.color="#ef4444"):o==="warning"?(e.textContent="Perhatian",e.style.color="#d4af37",i.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',i.style.color="#d4af37"):(e.textContent="Berhasil",e.style.color="var(--accent)",i.innerHTML='<i class="fa-solid fa-circle-check"></i>',i.style.color="var(--accent)"),s.style.display="flex"};function Q(t){let o=t.target.value.replace(/[^0-9]/g,"");o?t.target.value=new Intl.NumberFormat("id-ID").format(o):t.target.value=""}document.addEventListener("DOMContentLoaded",()=>{J(),j(),document.getElementById("formValue").addEventListener("input",Q),document.getElementById("formTaksasi").addEventListener("input",Q),document.getElementById("formDisposePrice").addEventListener("input",Q),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const t=document.getElementById("loginUsername").value,o=document.getElementById("loginPassword").value;if(!t||!o)return showCustomAlert("Isi username dan password","error");const s=document.getElementById("doLoginBtn");s.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',s.disabled=!0;try{const e=await Z("login",{username:t,password:o});if(e.token){localStorage.setItem("BISDAC_token",e.token);const l=e.role||e.user&&e.user.role||"",i=e.nama||e.user&&e.user.nama||e.user&&e.user.name||"";localStorage.setItem("BISDAC_role",l),localStorage.setItem("BISDAC_name",i)}}catch(e){showCustomAlert(e.message,"error")}finally{s.innerHTML="Masuk",s.disabled=!1,document.getElementById("loginModal").style.display="none",J(),z&&j()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),J(),F(k),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{te()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const t=document.getElementById("formName").value,o=document.getElementById("formDate").value,s=document.getElementById("formValue").value.replace(/\./g,""),e=document.getElementById("formLocation").value,l=document.getElementById("formCategory").value,i=document.getElementById("formSource").value,n=document.getElementById("formTaksasi").value.replace(/\./g,""),m=document.getElementById("formPic").value,g=document.getElementById("formId").value,u=document.getElementById("formQty").value,y=document.getElementById("formUnit").value,r=document.getElementById("formSubItems").value,d=document.getElementById("formStatus").value;let b=document.getElementById("formDisposeReason").value,c=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!t||!e||!m||!l||!i||!u||!y)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(d==="Disposed"&&!b)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");d!=="Disposed"&&(b="",c="");const a={isUpdate:!!g,id:g,name:t,date_acquired:o,value:s,location:e,category:l,source:i,taksasi:n,pic:m,qty:u,unit:y,sub_items:r,status:d,dispose_reason:b,dispose_price:c};window.currentPhotosBase64&&window.currentPhotosBase64.length>0&&(a.photo_base64=window.currentPhotosBase64[0]||"",a.photo2_base64=window.currentPhotosBase64[1]||"",a.photo3_base64=window.currentPhotosBase64[2]||"",a.photo4_base64=window.currentPhotosBase64[3]||"");const w=document.getElementById("saveBtn");w.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',w.disabled=!0;try{await ee("saveInventory",a),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),j()}catch(C){showCustomAlert(C.message,"error")}finally{w.innerHTML="Simpan Data",w.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",t=>{const o=t.target.value.toLowerCase(),s=k.filter(e=>e.name.toLowerCase().includes(o)||e.location.toLowerCase().includes(o)||e.pic.toLowerCase().includes(o));F(s)})});window.exportCSV=function(){if(!k||k.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const t=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","MARKET_VALUE","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],o=k.map(n=>[n.id,V(n.date_acquired)||"",`"${(n.name||"").replace(/"/g,'""')}"`,`"${(n.category||"").replace(/"/g,'""')}"`,`"${(n.source||"").replace(/"/g,'""')}"`,n.value||0,n.taksasi||0,n.qty||1,n.unit||"Unit",`"${(n.location||"").replace(/"/g,'""')}"`,`"${(n.pic||"").replace(/"/g,'""')}"`,n.status||"Active",n.status==="Disposed"?`"${(n.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',n.status==="Disposed"?n.dispose_price||0:'""',`"${(n.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),s=t.join(",")+`
`+o.join(`
`),e=new Blob([s],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(e),i=document.createElement("a");i.setAttribute("href",l),i.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(i),i.click(),document.body.removeChild(i),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!k||k.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const t=document.createElement("div");t.style.padding="20px",t.style.fontFamily="Arial, sans-serif",t.style.color="#333",t.style.background="#fff";let o=`
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
  `;k.forEach(e=>{const l=e.photo?e.photo:"https://via.placeholder.com/60?text=No+Photo",i=e.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${e.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';o+=`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${l}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong style="font-size:12px;">${e.name}</strong><br>
            <span style="color:#666; font-family:monospace;">${e.id}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${e.category||"-"}<br>
            <span style="color:#666;">${e.location}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${i}<br>
            ${e.qty||1} ${e.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${S(e.value||0)}<br>
            <span style="color:#666;">Market Value: ${S(e.taksasi||0)}</span>
          </td>
        </tr>
    `}),o+=`
      </tbody>
    </table>
  `,t.innerHTML=o;const s={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(s).from(t).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
