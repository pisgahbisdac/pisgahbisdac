import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */const se="https://script.google.com/macros/s/AKfycbxh6l6elvmca6j6snhZAH-YtCDtExU_UPcFm5e3_T-JDsIriixxRY2JYvcZvfRVASeX/exec";function X(){const e=localStorage.getItem("BISDAC_api_url");return e&&e.trim()!==""?e.trim():se}let _=null,k=[];function S(e){return new Intl.NumberFormat("id-ID").format(e)}function V(e){if(!e)return"-";const o=new Date(e);if(isNaN(o))return e;const i=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${o.getDate()} ${i[o.getMonth()]} ${o.getFullYear()}`}async function Z(e,o={}){const i=new URL(X());i.searchParams.set("action",e),i.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),i.searchParams.set("_t",Date.now());for(let n in o)i.searchParams.set(n,o[n]);const s=await(await fetch(i.toString(),{method:"GET",redirect:"follow"})).json();if(!s.success)throw new Error(s.message||"API Error");return s}async function ee(e,o){const i={action:e,token:localStorage.getItem("BISDAC_token")||"",data:o},s=await(await fetch(X(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(i)})).json();if(!s.success)throw new Error(s.message||"API Error");return s}function F(e,o){return e?e.split(",").map(t=>t.trim()).includes(o):!1}function J(){const e=localStorage.getItem("BISDAC_token"),o=localStorage.getItem("BISDAC_role"),i=localStorage.getItem("BISDAC_name"),t=o&&(F(o,"Admin")||F(o,"Bendahara")||F(o,"Diakon")||F(o,"Ketua Jemaat")||F(o,"Pendeta"));e&&t?(_={token:e,role:o,name:i},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${i}`,document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display=s.dataset.display||"block")):(_=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(s=>s.style.display="none"))}window.currentViewMode=localStorage.getItem("BISDAC_invViewMode")||"grid";window.changeViewMode=function(e){window.currentViewMode=e,localStorage.setItem("BISDAC_invViewMode",e),e==="grid"?(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")):(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active"));const o=document.getElementById("searchInput").value.toLowerCase();if(o){const i=k.filter(t=>t.name.toLowerCase().includes(o)||t.location.toLowerCase().includes(o)||t.pic.toLowerCase().includes(o));N(i)}else N(k)};function N(e){le();const o=document.getElementById("inventoryGrid");if(!e||e.length===0){o.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}const i=window.currentViewMode==="list";o.className=i?"inventory-list":"inventory-grid",o.innerHTML=e.map(t=>{const s=t.photo?t.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",n=t.status==="Disposed",a=n?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"",m=n?'<div class="inv-badge-status" style="background:rgba(239, 68, 68, 0.9); color:white; font-weight:bold;"><i class="fa-solid fa-ban"></i> DISPOSED</div>':`<div class="inv-badge-status">${t.category||"Uncategorized"}</div>`,g=_?`<input type="checkbox" class="bulk-qr-checkbox" value="${t.id}" onclick="event.stopPropagation(); window.toggleBulkPrintButton();" style="position:absolute; top:15px; left:15px; z-index:20; width:20px; height:20px; cursor:pointer;" title="Pilih untuk cetak QR">`:"";return i?`
        <div class="inv-list-card" style="${a}" onclick="window.viewDetail('${t.id}')">
          ${g}
          <img src="${s}" class="inv-list-photo" alt="${t.name}" onerror="this.src='/icons/PisgahLogoColor.png'">
          <div class="inv-list-info">
            ${m}
            <div style="flex:1;">
              <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
                ${t.name}
                <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
                  ${t.qty||1} ${t.unit||"Unit"}
                </span>
              </div>
              
              <div style="display: flex; flex-wrap:wrap; gap: 12px; margin-bottom: 5px;">
                <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${t.id}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> ${V(t.date_acquired)}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-user"></i> ${t.pic}</div>
                <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-location-dot"></i> ${t.location||"-"}</div>
              </div>
            </div>
            
            ${_?`
              <div class="inv-values-outer" style="min-width: 150px; display:flex; flex-direction:column; justify-content:flex-end;">
                <div class="inv-values-inner" style="margin-top: 35px; width:100%; text-align:right; border-left:1px solid rgba(255,255,255,0.1); padding-left:15px; padding-top: 15px;">
                  <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#4ade80;">Rp ${S(t.value)}</span></div>
                  <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); margin-top:8px;">Market Value<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${S(t.taksasi||0)}</span></div>
                </div>
              </div>
            `:""}
          </div>
        </div>
      `:`
        <div class="inv-asset-card" style="${a}" onclick="window.viewDetail('${t.id}')">
          ${g}
          ${m}
          <img src="${s}" class="inv-asset-photo" alt="${t.name}" onerror="this.src='/icons/PisgahLogoColor.png'">
          <div class="inv-asset-info">
            <div class="inv-asset-name" style="display:flex; align-items:center; gap:8px;">
              ${t.name}
              <span style="font-size:0.7rem; font-weight:bold; color:#000; background-color:var(--accent); padding:3px 8px; border-radius:12px; white-space:nowrap;">
                ${t.qty||1} ${t.unit||"Unit"}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
              <div class="inv-asset-meta" style="margin-bottom:0 !important; color:var(--accent); font-family:monospace; font-size:0.8rem;"><i class="fa-solid fa-barcode"></i> ${t.id}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> ${V(t.date_acquired)}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-regular fa-user"></i> ${t.pic}</div>
              <div class="inv-asset-meta" style="margin-bottom:0 !important; font-size:0.8rem;"><i class="fa-solid fa-location-dot"></i> ${t.location||"-"}</div>
            </div>
            
            ${_?`
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
                <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Perolehan<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem;">Rp ${S(t.value)}</span></div>
                <div style="font-size:0.75rem; color:rgba(255,255,255,0.6); text-align:right;">Market Value<br><span class="inv-asset-value" style="display:block; margin-top:2px; font-size:1rem; color:#d4af37;">Rp ${S(t.taksasi||0)}</span></div>
              </div>
            `:""}
          </div>
        </div>
      `}).join("")}async function j(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i></div>',k=(await Z("getInventory")).data||[],k.sort((s,n)=>new Date(n.created_at)-new Date(s.created_at)),N(k);const t=new URLSearchParams(window.location.search).get("id");t&&setTimeout(()=>{window.viewDetail(t)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const o=k.find(r=>r.id===e);if(!o)return;document.getElementById("detailName").textContent=o.name,document.getElementById("detailId").textContent=o.id,document.getElementById("detailCategory").textContent=o.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=o.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=V(o.date_acquired),document.getElementById("detailLocation").textContent=o.location,document.getElementById("detailPic").textContent=o.pic,document.getElementById("detailQty").textContent=o.qty||1,document.getElementById("detailUnit").textContent=o.unit||"Unit";const i=document.getElementById("detailStatusContainer"),t=document.getElementById("detailStatusBadge"),s=document.getElementById("detailDisposeInfo");o.status==="Disposed"?(i.style.display="block",t.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',t.style.background="rgba(239, 68, 68, 0.2)",t.style.color="#ef4444",s.style.display="block",document.getElementById("detailDisposeReason").textContent=o.dispose_reason||"-",_&&o.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${S(o.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(i.style.display="block",t.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',t.style.background="rgba(74, 222, 128, 0.1)",t.style.color="#4ade80",s.style.display="none");const n=document.getElementById("detailSubItems"),a=document.getElementById("detailSubItemsContainer");o.sub_items?(n.textContent=o.sub_items,a.style.display="flex"):a.style.display="none";const m=document.getElementById("detailPhotosContainer");m.innerHTML="";const g=[o.photo,o.pic2,o.pic3,o.pic4].filter(r=>r);g.length>0?(g.forEach(r=>{const d=document.createElement("img");d.src=r,d.style.height="180px",d.style.maxWidth="100%",d.style.borderRadius="12px",d.style.objectFit="contain",d.style.border="1px solid rgba(255,255,255,0.1)",d.style.flexShrink="0",d.style.backgroundColor="rgba(0,0,0,0.2)",d.style.cursor="pointer",d.onclick=()=>{document.getElementById("imagePreviewFull").src=r,document.getElementById("imagePreviewModal").style.display="flex"},m.appendChild(d)}),m.style.display="flex"):m.style.display="none",_?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${S(o.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${S(o.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const u=window.location.origin+window.location.pathname+"?id="+o.id,y=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(u)}`;document.getElementById("qrCodeImg").src=y,document.getElementById("qrCodeId").textContent=o.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const r=document.getElementById("detailName").textContent,d=document.getElementById("detailId").textContent.replace("ID: ",""),b=document.getElementById("qrCodeImg").src,c=document.createElement("canvas");c.width=384,c.height=520;const l=c.getContext("2d"),w=c.width/2;l.fillStyle="#ffffff",l.fillRect(0,0,c.width,c.height);const C=20,v=12,x=12,P=c.width-24,B=c.height-24;l.strokeStyle="#000000",l.lineWidth=5,l.beginPath(),l.moveTo(v+C,x),l.lineTo(v+P-C,x),l.quadraticCurveTo(v+P,x,v+P,x+C),l.lineTo(v+P,x+B-C),l.quadraticCurveTo(v+P,x+B,v+P-C,x+B),l.lineTo(v+C,x+B),l.quadraticCurveTo(v,x+B,v,x+B-C),l.lineTo(v,x+C),l.quadraticCurveTo(v,x,v+C,x),l.closePath(),l.stroke(),l.fillStyle="#000000",l.textAlign="center",l.textBaseline="top",l.font="bold 26px monospace";let U=r.toUpperCase();if(U.length<=24)l.fillText(U,w,45);else{let p=U.lastIndexOf(" ",24);p===-1&&(p=22);let h=U.substring(0,p),M=U.substring(p).trim();M.length>24&&(M=M.substring(0,21)+"..."),l.fillText(h,w,30),l.fillText(M,w,60)}const f=new Image;f.crossOrigin="Anonymous",await new Promise((p,h)=>{f.onload=p,f.onerror=h,f.src=b});const A=300;l.drawImage(f,w-A/2,95,A,A);const I=new Image;if(I.crossOrigin="Anonymous",await new Promise((p,h)=>{I.onload=p,I.onerror=()=>p(),I.src=window.location.origin+"/icons/PisgahColor.png"}),I.complete&&I.naturalWidth>0){const h=w,M=95+A/2,$=document.createElement("canvas");$.width=80,$.height=80;const z=$.getContext("2d");z.drawImage(I,0,0,80,80);const R=z.getImageData(0,0,80,80),E=R.data;for(let q=0;q<E.length;q+=4)E[q+3]>20&&(E[q]=0,E[q+1]=0,E[q+2]=0,E[q+3]=255);z.putImageData(R,0,0),l.fillStyle="#ffffff",l.beginPath(),l.arc(h,M,80/2+8,0,Math.PI*2),l.fill(),l.drawImage($,h-80/2,M-80/2,80,80)}l.fillStyle="#000000",l.font="bold 28px monospace",l.fillText(d,w,420),l.strokeStyle="#cccccc",l.lineWidth=1,l.beginPath(),l.moveTo(60,460),l.lineTo(c.width-60,460),l.stroke(),l.fillStyle="#888888",l.font="20px monospace",l.fillText("PISGAH-BISDAC",w,472);const D=document.getElementById("thermalPreviewModal");D.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=c.toDataURL();const T=document.getElementById("doDirectPrintBtn"),L=T.cloneNode(!0);T.parentNode.replaceChild(L,T),L.onclick=async()=>{try{const p=await navigator.serial.requestPort();await p.open({baudRate:9600});const h=p.writable.getWriter();showCustomAlert("Mencetak...","success");const $=l.getImageData(0,0,c.width,c.height).data,z=Math.ceil(c.width/8),R=c.height,E=new Uint8Array(8+z*R);E[0]=29,E[1]=118,E[2]=48,E[3]=0,E[4]=z&255,E[5]=z>>8&255,E[6]=R&255,E[7]=R>>8&255;let q=8;for(let O=0;O<R;O++)for(let W=0;W<z;W++){let K=0;for(let H=0;H<8;H++){const Y=W*8+H;if(Y<c.width){const G=(O*c.width+Y)*4,ie=$[G]*.299+$[G+1]*.587+$[G+2]*.114;$[G+3]>128&&ie<128&&(K|=1<<7-H)}}E[q++]=K}const oe=new Uint8Array([27,64]),ne=new Uint8Array([27,97,1]),ae=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await h.write(oe),await h.write(ne),await h.write(E),await h.write(ae),h.releaseLock(),await p.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(p){console.error(p),p.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+p.message,"error")}}}catch(r){console.error(r),showCustomAlert("Gagal memuat preview: "+r.message,"error")}},window.printBarcode=()=>{const r=document.getElementById("qrCodeImg").src,d=document.getElementById("detailName").textContent,b=document.getElementById("detailId").textContent.replace("ID: ",""),c=window.open("","_blank");if(!c){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}c.document.write(`
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
    `),c.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",te(o)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const r=document.getElementById("deleteBtn"),d=r.innerHTML;r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',r.disabled=!0;try{await ee("deleteInventory",{id:o.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",j()}catch(b){showCustomAlert(b.message,"error")}finally{r.innerHTML=d,r.disabled=!1}}};function le(){window.isAllSelected=!1;const e=document.querySelector("#btnSelectAll i");e&&(e.className="fa-regular fa-square-check");const o=document.getElementById("btnSelectAll");o&&o.classList.remove("active")}window.isAllSelected=!1;window.toggleSelectAll=function(){const e=document.querySelectorAll(".bulk-qr-checkbox");if(e.length===0)return;window.isAllSelected=!window.isAllSelected;const o=document.querySelector("#btnSelectAll i");window.isAllSelected?(e.forEach(i=>i.checked=!0),o&&(o.className="fa-solid fa-square-check"),document.getElementById("btnSelectAll").classList.add("active")):(e.forEach(i=>i.checked=!1),o&&(o.className="fa-regular fa-square-check"),document.getElementById("btnSelectAll").classList.remove("active")),window.toggleBulkPrintButton()};window.toggleBulkPrintButton=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked"),o=document.getElementById("bulkPrintContainer"),i=document.getElementById("bulkPrintCount");e.length>0?(i.textContent=e.length+" Dipilih",o.style.display="block"):o.style.display="none"};window.printSelectedQRs=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;const o=Array.from(e).map(n=>n.value),i=k.filter(n=>o.includes(n.id)),t=window.open("","_blank");if(!t){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}let s=`
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
  `;i.forEach(n=>{const a=window.location.origin+window.location.pathname+"?id="+n.id,m=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(a)}`,g=n.id.replace("ID: ","");s+=`
          <div class="label-box">
            <h3>${n.name}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${m}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${g}</div>
          </div>
    `}),s+=`
        </div>
      </body>
    </html>
  `,t.document.write(s),t.document.close(),e.forEach(n=>n.checked=!1),window.toggleBulkPrintButton()};window.printSelectedThermal=async function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print (Web Serial). Gunakan Google Chrome/Edge di PC.","error");const o=Array.from(e).map(t=>t.value),i=k.filter(t=>o.includes(t.id));try{const t=await navigator.serial.requestPort();await t.open({baudRate:9600});const s=t.writable.getWriter();showCustomAlert("Menghubungkan ke printer dan memulai cetak...","success");const n=new Uint8Array([27,64]),a=new Uint8Array([27,97,1]),m=new Uint8Array([27,74,48]);await s.write(n),await s.write(a);for(let u=0;u<i.length;u++){const y=i[u],r=await re(y);await s.write(r),await s.write(m)}const g=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await s.write(g),s.releaseLock(),await t.close(),showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success"),e.forEach(u=>u.checked=!1),window.toggleBulkPrintButton()}catch(t){console.error(t),t.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+t.message,"error")}};async function re(e){const o=e.name||"",i=e.id.replace("ID: ",""),t=window.location.origin+window.location.pathname+"?id="+e.id,s=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t)}`,n=document.createElement("canvas");n.width=384,n.height=520;const a=n.getContext("2d"),m=n.width/2;a.fillStyle="#ffffff",a.fillRect(0,0,n.width,n.height);const g=20,u=12,y=12,r=n.width-24,d=n.height-24;a.strokeStyle="#000000",a.lineWidth=5,a.beginPath(),a.moveTo(u+g,y),a.lineTo(u+r-g,y),a.quadraticCurveTo(u+r,y,u+r,y+g),a.lineTo(u+r,y+d-g),a.quadraticCurveTo(u+r,y+d,u+r-g,y+d),a.lineTo(u+g,y+d),a.quadraticCurveTo(u,y+d,u,y+d-g),a.lineTo(u,y+g),a.quadraticCurveTo(u,y,u+g,y),a.closePath(),a.stroke(),a.fillStyle="#000000",a.textAlign="center",a.textBaseline="top",a.font="bold 26px monospace";let b=o.toUpperCase();if(b.length<=24)a.fillText(b,m,45);else{let f=b.lastIndexOf(" ",24);f===-1&&(f=22);let A=b.substring(0,f),I=b.substring(f).trim();I.length>24&&(I=I.substring(0,21)+"..."),a.fillText(A,m,30),a.fillText(I,m,60)}const c=new Image;c.crossOrigin="Anonymous",await new Promise(f=>{c.onload=f,c.onerror=f,c.src=s});const l=300;a.drawImage(c,m-l/2,95,l,l);const w=new Image;if(w.crossOrigin="Anonymous",await new Promise(f=>{w.onload=f,w.onerror=f,w.src=window.location.origin+"/icons/PisgahColor.png"}),w.complete&&w.naturalWidth>0){const A=m,I=95+l/2,D=document.createElement("canvas");D.width=80,D.height=80;const T=D.getContext("2d");T.drawImage(w,0,0,80,80);const L=T.getImageData(0,0,80,80),p=L.data;for(let h=0;h<p.length;h+=4)p[h+3]>20&&(p[h]=0,p[h+1]=0,p[h+2]=0,p[h+3]=255);T.putImageData(L,0,0),a.fillStyle="#ffffff",a.beginPath(),a.arc(A,I,80/2+8,0,Math.PI*2),a.fill(),a.drawImage(D,A-80/2,I-80/2,80,80)}a.fillStyle="#000000",a.font="bold 28px monospace",a.fillText(i,m,420),a.strokeStyle="#cccccc",a.lineWidth=1,a.beginPath(),a.moveTo(60,460),a.lineTo(n.width-60,460),a.stroke(),a.fillStyle="#888888",a.font="20px monospace",a.fillText("PISGAH-BISDAC",m,472);const v=a.getImageData(0,0,n.width,n.height).data,x=Math.ceil(n.width/8),P=n.height,B=new Uint8Array(8+x*P);B[0]=29,B[1]=118,B[2]=48,B[3]=0,B[4]=x&255,B[5]=x>>8&255,B[6]=P&255,B[7]=P>>8&255;let U=8;for(let f=0;f<P;f++)for(let A=0;A<x;A++){let I=0;for(let D=0;D<8;D++){const T=A*8+D;if(T<n.width){const L=(f*n.width+T)*4,p=v[L]*.299+v[L+1]*.587+v[L+2]*.114;v[L+3]>128&&p<128&&(I|=1<<7-D)}}B[U++]=I}return B}window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function te(e=null){document.getElementById("formModal").style.display="flex";const o=document.getElementById("photoPreview");if(o.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e){document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?S(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi?S(e.taksasi):"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price?S(e.dispose_price):"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none";const i=[];e.photo&&i.push(e.photo),e.pic2&&i.push(e.pic2),e.pic3&&i.push(e.pic3),e.pic4&&i.push(e.pic4),i.length>0&&(window.currentPhotosBase64=[...i],window.renderPhotoPreview())}else document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("disposeFields").style.display="none"}document.getElementById("formPhoto").addEventListener("change",function(e){const o=e.target.files;if(!o||o.length===0)return;o.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const i=document.getElementById("photoPreview");i.innerHTML="",i.style.display="flex",Array.from(o).slice(0,4).forEach(s=>{const n=new FileReader;n.onload=function(a){const m=new Image;m.onload=function(){const g=document.createElement("canvas"),u=500,y=500;let r=m.width,d=m.height;r>d?r>u&&(d*=u/r,r=u):d>y&&(r*=y/d,d=y),g.width=r,g.height=d,g.getContext("2d").drawImage(m,0,0,r,d);const c=g.toDataURL("image/jpeg",.4);window.currentPhotosBase64.push(c),window.renderPhotoPreview()},m.src=a.target.result},n.readAsDataURL(s)})});window.renderPhotoPreview=function(){const e=document.getElementById("photoPreview");if(e.innerHTML="",!window.currentPhotosBase64||window.currentPhotosBase64.length===0){e.style.display="none";return}e.style.display="flex",window.currentPhotosBase64.forEach((o,i)=>{const t=document.createElement("div");t.style.position="relative",t.style.display="inline-block";const s=document.createElement("img");s.src=o,s.style.width="80px",s.style.height="80px",s.style.objectFit="cover",s.style.borderRadius="8px",s.style.border="1px solid var(--glass-border)",s.style.flexShrink="0";const n=document.createElement("button");n.innerHTML='<i class="fa-solid fa-xmark"></i>',n.style.position="absolute",n.style.top="-5px",n.style.right="-5px",n.style.background="#ef4444",n.style.color="white",n.style.border="none",n.style.borderRadius="50%",n.style.width="20px",n.style.height="20px",n.style.cursor="pointer",n.style.display="flex",n.style.alignItems="center",n.style.justifyContent="center",n.style.fontSize="12px",n.onclick=a=>{a.preventDefault(),window.currentPhotosBase64.splice(i,1),window.renderPhotoPreview()},t.appendChild(s),t.appendChild(n),e.appendChild(t)})};window.showCustomAlert=function(e,o="success"){const i=document.getElementById("customAlertModal"),t=document.getElementById("alertTitle"),s=document.getElementById("alertMessage"),n=document.getElementById("alertIcon");s.textContent=e,o==="error"?(t.textContent="Gagal",t.style.color="#ef4444",n.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',n.style.color="#ef4444"):o==="warning"?(t.textContent="Perhatian",t.style.color="#d4af37",n.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',n.style.color="#d4af37"):(t.textContent="Berhasil",t.style.color="var(--accent)",n.innerHTML='<i class="fa-solid fa-circle-check"></i>',n.style.color="var(--accent)"),i.style.display="flex"};function Q(e){let o=e.target.value.replace(/[^0-9]/g,"");o?e.target.value=new Intl.NumberFormat("id-ID").format(o):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{J(),j(),document.getElementById("formValue").addEventListener("input",Q),document.getElementById("formTaksasi").addEventListener("input",Q),document.getElementById("formDisposePrice").addEventListener("input",Q),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,o=document.getElementById("loginPassword").value;if(!e||!o)return showCustomAlert("Isi username dan password","error");const i=document.getElementById("doLoginBtn");i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',i.disabled=!0;try{const t=await Z("login",{username:e,password:o});if(t.token){localStorage.setItem("BISDAC_token",t.token);const s=t.role||t.user&&t.user.role||"",n=t.nama||t.user&&t.user.nama||t.user&&t.user.name||"";localStorage.setItem("BISDAC_role",s),localStorage.setItem("BISDAC_name",n)}}catch(t){showCustomAlert(t.message,"error")}finally{i.innerHTML="Masuk",i.disabled=!1,document.getElementById("loginModal").style.display="none",J(),_&&j()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),J(),N(k),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{te()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,o=document.getElementById("formDate").value,i=document.getElementById("formValue").value.replace(/\./g,""),t=document.getElementById("formLocation").value,s=document.getElementById("formCategory").value,n=document.getElementById("formSource").value,a=document.getElementById("formTaksasi").value.replace(/\./g,""),m=document.getElementById("formPic").value,g=document.getElementById("formId").value,u=document.getElementById("formQty").value,y=document.getElementById("formUnit").value,r=document.getElementById("formSubItems").value,d=document.getElementById("formStatus").value;let b=document.getElementById("formDisposeReason").value,c=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!t||!m||!s||!n||!u||!y)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(d==="Disposed"&&!b)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");d!=="Disposed"&&(b="",c="");const l={isUpdate:!!g,id:g,name:e,date_acquired:o,value:i,location:t,category:s,source:n,taksasi:a,pic:m,qty:u,unit:y,sub_items:r,status:d,dispose_reason:b,dispose_price:c};window.currentPhotosBase64&&window.currentPhotosBase64.length>0?(l.photo=window.currentPhotosBase64[0]||"",l.pic2=window.currentPhotosBase64[1]||"",l.pic3=window.currentPhotosBase64[2]||"",l.pic4=window.currentPhotosBase64[3]||""):l.isUpdate;const w=document.getElementById("saveBtn");w.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',w.disabled=!0;try{await ee("saveInventory",l),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),j()}catch(C){showCustomAlert(C.message,"error")}finally{w.innerHTML="Simpan Data",w.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",e=>{const o=e.target.value.toLowerCase(),i=k.filter(t=>t.name.toLowerCase().includes(o)||t.location.toLowerCase().includes(o)||t.pic.toLowerCase().includes(o));N(i)})});window.exportCSV=function(){if(!k||k.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","MARKET_VALUE","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],o=k.map(a=>[a.id,V(a.date_acquired)||"",`"${(a.name||"").replace(/"/g,'""')}"`,`"${(a.category||"").replace(/"/g,'""')}"`,`"${(a.source||"").replace(/"/g,'""')}"`,a.value||0,a.taksasi||0,a.qty||1,a.unit||"Unit",`"${(a.location||"").replace(/"/g,'""')}"`,`"${(a.pic||"").replace(/"/g,'""')}"`,a.status||"Active",a.status==="Disposed"?`"${(a.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',a.status==="Disposed"?a.dispose_price||0:'""',`"${(a.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),i=e.join(",")+`
`+o.join(`
`),t=new Blob([i],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(t),n=document.createElement("a");n.setAttribute("href",s),n.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(n),n.click(),document.body.removeChild(n),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!k||k.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let o=`
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
  `;k.forEach(t=>{const s=t.photo?t.photo:"/icons/PisgahLogoColor.png",n=t.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${t.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';o+=`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${s}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong style="font-size:12px;">${t.name}</strong><br>
            <span style="color:#666; font-family:monospace;">${t.id}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${t.category||"-"}<br>
            <span style="color:#666;">${t.location}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${n}<br>
            ${t.qty||1} ${t.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${S(t.value||0)}<br>
            <span style="color:#666;">Market Value: ${S(t.taksasi||0)}</span>
          </td>
        </tr>
    `}),o+=`
      </tbody>
    </table>
  `,e.innerHTML=o;const i={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(i).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};
