import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{c as ue}from"./index-MbRB0llW.js";const me="https://lxapdcjquipdowscfgtq.supabase.co",ge="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w",U=ue(me,ge);async function pe(){try{const{data:e,error:t}=await U.from("inventaris").select("id").limit(1);return t?(console.warn("Supabase Inventaris check error:",t.message),!1):!0}catch(e){return console.warn("Supabase network unreachable:",e),!1}}async function ye(){try{let e=[],i=0,o=!0;for(;o;){const{data:n,error:a}=await U.from("inventaris").select("*").order("created_at",{ascending:!1}).range(i,i+1e3-1);if(a)throw a;n&&n.length>0?(e=e.concat(n),n.length<1e3?o=!1:i+=1e3):o=!1}return{success:!0,data:e}}catch(e){return console.error("fetchInventoryFromSupabase Error:",e),{success:!1,message:e.message,data:[]}}}async function fe(e){try{const t={id:e.id,name:e.name,category:e.category||"Lainnya",source:e.source||"",date_acquired:e.date_acquired||"",location:e.location||"",pic:e.pic||"",qty:parseFloat(e.qty)||1,unit:e.unit||"Unit",value:parseFloat(e.value)||0,taksasi:parseFloat(e.taksasi)||0,status:e.status||"Active",dispose_reason:e.dispose_reason||"",dispose_price:parseFloat(e.dispose_price)||0,loan_status:e.loan_status||"Tersedia",borrowed_by:e.borrowed_by||"",expected_return_date:e.expected_return_date||"",sub_items:typeof e.sub_items=="object"?JSON.stringify(e.sub_items):e.sub_items||"",photo:e.photo||"",pic2:e.pic2||"",pic3:e.pic3||"",pic4:e.pic4||"",depreciation_years:parseFloat(e.depreciation_years)||5,created_at:e.created_at||new Date().toISOString()},{data:i,error:o}=await U.from("inventaris").upsert(t,{onConflict:"id"}).select();if(o)throw o;return{success:!0,data:i,message:"Data inventaris berhasil disimpan di Supabase"}}catch(t){return console.error("saveInventoryToSupabase Error:",t),{success:!1,message:t.message}}}async function we(e){try{const{error:t}=await U.from("inventaris").delete().eq("id",e);if(t)throw t;return{success:!0,message:"Data berhasil dihapus dari Supabase"}}catch(t){return console.error("deleteInventoryFromSupabase Error:",t),{success:!1,message:t.message}}}async function he(e){try{const{data:t,error:i}=await U.from("inventory_services").select("*").eq("inventory_id",e).order("service_date",{ascending:!1});if(i)throw i;return{success:!0,data:t||[]}}catch(t){return console.error("fetchInventoryServicesFromSupabase Error:",t),{success:!1,message:t.message,data:[]}}}async function be(e){try{const t={inventory_id:e.inventory_id,service_date:e.service_date,description:e.description||"",cost:parseFloat(e.cost)||0,created_at:new Date().toISOString()},{error:i}=await U.from("inventory_services").insert([t]);if(i)throw i;return{success:!0,message:"Riwayat servis berhasil dicatat di Supabase"}}catch(t){return console.error("saveInventoryServiceToSupabase Error:",t),{success:!1,message:t.message}}}async function ve(e,t=()=>{}){try{t("Menghubungi Google Apps Script...");const i=new URL(e);i.searchParams.set("action","getInventory"),i.searchParams.set("_t",Date.now());const n=await(await fetch(i.toString(),{method:"GET",redirect:"follow"})).json();if(!n.success||!Array.isArray(n.data))throw new Error(n.message||"Gagal mengambil data dari Google Apps Script");const a=n.data;if(a.length===0)return{success:!0,count:0,message:"Tidak ada data inventaris di Google Sheets untuk dimigrasikan."};t(`Ditemukan ${a.length} aset. Memulai migrasi ke Supabase...`);const r=50;let m=0;for(let s=0;s<a.length;s+=r){const d=a.slice(s,s+r).map(l=>({id:String(l.id),name:l.name||"Tanpa Nama",category:l.category||"Lainnya",source:l.source||"",date_acquired:l.date_acquired?String(l.date_acquired):"",location:l.location||"",pic:l.pic||"",qty:parseFloat(l.qty)||1,unit:l.unit||"Unit",value:parseFloat(l.value)||0,taksasi:parseFloat(l.taksasi)||0,status:l.status||"Active",dispose_reason:l.dispose_reason||"",dispose_price:parseFloat(l.dispose_price)||0,loan_status:l.loan_status||"Tersedia",borrowed_by:l.borrowed_by||"",expected_return_date:l.expected_return_date||"",sub_items:typeof l.sub_items=="object"?JSON.stringify(l.sub_items):l.sub_items||"",photo:l.photo||"",pic2:l.pic2||"",pic3:l.pic3||"",pic4:l.pic4||"",depreciation_years:parseFloat(l.depreciation_years)||5,created_at:l.created_at||new Date().toISOString()})),{error:g}=await U.from("inventaris").upsert(d,{onConflict:"id"});if(g)throw g;m+=d.length,t(`Migrasi berjalan: ${m} / ${a.length} aset tersimpan...`)}return{success:!0,count:m,message:`Berhasil memigrasikan ${m} aset inventaris ke Supabase!`}}catch(i){return console.error("migrateInventarisGASToSupabase Error:",i),{success:!1,message:i.message}}}const xe="https://script.google.com/macros/s/AKfycbwfBsZNTUD-3Ss-eV6Vk7g3x1FbSBpMIjzGuZcxYkV2dQhj9Nw82YJNNsfoZ5nlSz7mnw/exec";function te(){return xe}let H=null,I=[],R=!1;function j(e,t){const i=document.getElementById("dbStatusDot"),o=document.getElementById("dbStatusText"),n=document.getElementById("dbStatusBadge");!i||!o||!n||(o.textContent=t,e==="online"?(n.style.background="rgba(16,185,129,0.1)",n.style.color="#059669",n.style.borderColor="rgba(16,185,129,0.2)",i.style.background="#10b981",i.style.boxShadow="0 0 8px rgba(16,185,129,0.6)"):e==="fallback"?(n.style.background="rgba(245,158,11,0.1)",n.style.color="#d97706",n.style.borderColor="rgba(245,158,11,0.2)",i.style.background="#f59e0b",i.style.boxShadow="0 0 8px rgba(245,158,11,0.6)"):e==="offline"?(n.style.background="rgba(239,68,68,0.1)",n.style.color="#dc2626",n.style.borderColor="rgba(239,68,68,0.2)",i.style.background="#ef4444",i.style.boxShadow="none"):(n.style.background="rgba(100,116,139,0.1)",n.style.color="#64748b",n.style.borderColor="rgba(100,116,139,0.2)",i.style.background="#94a3b8",i.style.boxShadow="none"))}async function ie(){return j("loading","Menghubungkan..."),R=await pe(),R?j("online","Supabase Aktif"):j("fallback","Google Sheets Cadangan"),R}window.migrateToSupabase=async function(){if(!confirm(`Mulai 1-Klik Migrasi seluruh data inventaris dari Google Sheets ke Supabase?

Data lama di Google Sheets akan tetap tersimpan aman sebagai cadangan ganda.`))return;const t=document.getElementById("migrateBtn"),i=t?t.innerHTML:"";t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Memigrasi...');try{const o=await ve(te(),n=>{t&&(t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> <span class="hide-on-mobile">${n}</span>`)});o.success?(alert(`Migrasi Berhasil!

${o.message}`),await ie(),await O()):alert(`Migrasi Gagal:
${o.message}`)}catch(o){alert(`Terjadi kesalahan saat migrasi: ${o.message}`)}finally{t&&(t.disabled=!1,t.innerHTML=i)}};function _(e){return new Intl.NumberFormat("id-ID").format(e)}function Y(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const i=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${i[t.getMonth()]} ${t.getFullYear()}`}async function ne(e,t={}){if(e==="getInventory"){if(R)try{const a=await ye();if(a.success)return a;console.warn("Supabase getInventory failed, falling back to GAS:",a.message)}catch(a){console.warn("Supabase fetch error, falling back to GAS:",a)}j("fallback","Google Sheets Cadangan")}if(e==="getInventoryService"&&R)try{const a=await he(t.inventory_id);if(a.success)return a}catch(a){console.warn("Supabase getInventoryService error, falling back to GAS:",a)}const i=new URL(te());i.searchParams.set("action",e),i.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),i.searchParams.set("_t",Date.now());for(let a in t)i.searchParams.set(a,t[a]);const n=await(await fetch(i.toString(),{method:"GET",redirect:"follow"})).json();if(!n.success)throw new Error(n.message||"API Error");return n}async function K(e,t){const i=async()=>{const o={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},a=await(await fetch(te(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(o)})).json();if(!a.success)throw new Error(a.message||"API Error");return a};if(e==="saveInventory"){if(R){try{const o=await fe(t);if(o.success)return i().catch(n=>console.warn("Background Dual Backup save to GAS failed:",n)),o;console.warn("Supabase save failed, falling back to GAS:",o.message)}catch(o){console.warn("Supabase save error, falling back to GAS:",o)}j("fallback","Google Sheets Cadangan")}return await i()}if(e==="deleteInventory"){if(R){try{const o=await we(t.id);if(o.success)return i().catch(n=>console.warn("Background Dual Backup delete to GAS failed:",n)),o}catch(o){console.warn("Supabase delete error, falling back to GAS:",o)}j("fallback","Google Sheets Cadangan")}return await i()}if(e==="saveInventoryService"){if(R)try{const o=await be(t);if(o.success)return i().catch(n=>console.warn("Background Dual Backup service to GAS failed:",n)),o}catch(o){console.warn("Supabase service error, falling back to GAS:",o)}return await i()}return await i()}function V(e,t){return e?e.split(",").map(o=>o.trim()).includes(t):!1}function Z(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),i=localStorage.getItem("BISDAC_name"),o=t&&(V(t,"Admin")||V(t,"Bendahara")||V(t,"Diakon")||V(t,"Ketua Jemaat")||V(t,"Pendeta"));e&&o?(H={token:e,role:t,name:i},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${i}`,document.querySelectorAll(".admin-only-field").forEach(n=>n.style.display=n.dataset.display||"block")):(H=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(n=>n.style.display="none"))}window.currentViewMode=localStorage.getItem("BISDAC_invViewMode")||"grid";window.changeViewMode=function(e){window.currentViewMode=e,localStorage.setItem("BISDAC_invViewMode",e),e==="grid"?(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")):(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active")),window.renderGrid()};window.renderGrid=function(){Ie();const e=document.getElementById("searchInput")?document.getElementById("searchInput").value.toLowerCase():"",t=document.getElementById("filterCategory")?document.getElementById("filterCategory").value:"",i=document.getElementById("filterStatus")?document.getElementById("filterStatus").value:"",o=document.getElementById("filterLoan")?document.getElementById("filterLoan").value:"";let n=I;(e||t||i||o)&&(n=I.filter(s=>{let d=!0;if(e&&(d=d&&(s.name&&s.name.toLowerCase().includes(e)||s.location&&s.location.toLowerCase().includes(e)||s.pic&&s.pic.toLowerCase().includes(e))),t&&(d=d&&s.category===t),i&&(d=d&&(s.status||"Active")===i),o){const g=s.loan_status||"Tersedia";d=d&&g===o}return d}));const a=document.getElementById("inventoryGrid");if(!n||n.length===0){a.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}const r=window.currentViewMode==="list";a.className=r?"inventory-list":"inventory-grid";const m=["linear-gradient(135deg, #f5eaea 0%, #ecd3d3 100%)","linear-gradient(135deg, #eaf2ee 0%, #d5e5db 100%)","linear-gradient(135deg, #eef3f8 0%, #d8e5f1 100%)","linear-gradient(135deg, #fbf2e5 0%, #f6e1c6 100%)","linear-gradient(135deg, #f0ebf5 0%, #e1d6eb 100%)","linear-gradient(135deg, #f5f2e6 0%, #ebe3cd 100%)"];a.innerHTML=n.map((s,d)=>{const g=s.photo?s.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",l=s.status==="Disposed",f=l?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"";let u="";l?u='<span class="inv-badge-status" style="background:#ef4444;">Disposed</span>':(s.loan_status||"Tersedia")==="Dipinjam"?u='<span class="inv-badge-status" style="background:#eab308; color:#fff;">Dipinjam</span>':u=`<span class="inv-badge-status">${s.category||"Belum Kategori"}</span>`;const y=H?`<input type="checkbox" class="bulk-qr-checkbox" value="${s.id}" onclick="event.stopPropagation(); window.toggleBulkPrintButton();" style="position:absolute; top:15px; right:15px; z-index:20; width:20px; height:20px; cursor:pointer; accent-color: var(--accent-dark);" title="Pilih untuk cetak QR">`:"",B=m[d%m.length];return r?`
        <div class="inv-list-card" style="${f}" onclick="window.viewDetail('${s.id}')">
          ${y}
          <img src="${g}" class="inv-list-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'" style="background: ${B};">
          <div class="inv-list-info">
            <div style="flex:1;">
              ${u}
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
                <div class="inv-asset-value" style="margin-top:4px;">Rp ${_(s.taksasi||s.value||0)}</div>
                <div class="btn btn-outline" style="margin-top:16px; padding:8px 16px; font-size:0.85rem; border-radius:50px; width:100%;">Lihat Detail</div>
              </div>
            `:'<div style="padding-left:24px;"><div class="btn btn-outline" style="padding:8px 16px; border-radius:50px;">Lihat Detail</div></div>'}
          </div>
        </div>
      `:`
        <div class="inv-asset-card" style="${f}" onclick="window.viewDetail('${s.id}')">
          ${y}
          <img src="${g}" class="inv-asset-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'" style="background: ${B};">
          <div class="inv-asset-info">
            ${u}
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
                  <div class="inv-asset-value">Rp ${_(s.taksasi||s.value||0)}</div>
                </div>
              </div>
            `:""}
          </div>
          <div class="card-action-btn"><i class="fa-solid fa-arrow-right"></i></div>
        </div>
      `}).join("")};async function O(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 60px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent-dark);"></i><p style="margin-top:15px; color:var(--text-muted); font-weight: 500;">Memuat koleksi inventaris...</p></div>',I=(await ne("getInventory")).data||[],I.sort((n,a)=>new Date(a.created_at)-new Date(n.created_at)),window.renderGrid();const o=new URLSearchParams(window.location.search).get("id");o&&setTimeout(()=>{window.viewDetail(o)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=I.find(u=>u.id===e);if(!t)return;window.currentDetailId=e,document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=Y(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const i=document.getElementById("detailLoanBadge");(t.loan_status||"Tersedia")==="Dipinjam"?(i.style.background="#eab308",i.textContent=`Dipinjam oleh: ${t.borrowed_by||"-"} (s.d ${Y(t.expected_return_date)||"-"})`):(i.style.background="#22c55e",i.textContent="Tersedia");const n=document.getElementById("detailStatusContainer"),a=document.getElementById("detailStatusBadge"),r=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(n.style.display="block",a.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',a.style.background="rgba(239, 68, 68, 0.2)",a.style.color="#ef4444",r.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",H&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${_(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(n.style.display="block",a.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',a.style.background="rgba(74, 222, 128, 0.1)",a.style.color="#4ade80",r.style.display="none");const m=document.getElementById("detailSubItems"),s=document.getElementById("detailSubItemsContainer");t.sub_items?(m.textContent=t.sub_items,s.style.display="flex"):s.style.display="none";const d=document.getElementById("detailPhotosContainer");d.innerHTML="";const g=[t.photo,t.pic2,t.pic3,t.pic4].filter(u=>u);g.length>0?(g.forEach(u=>{const y=document.createElement("img");y.src=u,y.style.height="180px",y.style.maxWidth="100%",y.style.borderRadius="12px",y.style.objectFit="contain",y.style.border="1px solid var(--border-light)",y.style.flexShrink="0",y.style.backgroundColor="#f8f9fa",y.style.cursor="pointer",y.onclick=()=>{document.getElementById("imagePreviewFull").src=u,document.getElementById("imagePreviewModal").style.display="flex"},d.appendChild(y)}),d.style.display="flex"):d.style.display="none",H?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${_(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${_(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const l=window.location.origin+window.location.pathname+"?id="+t.id,f=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(l)}`;document.getElementById("qrCodeImg").src=f,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const u=document.getElementById("detailName").textContent,y=document.getElementById("detailId").textContent.replace("ID: ",""),B=document.getElementById("qrCodeImg").src,p=document.createElement("canvas");p.width=384,p.height=520;const c=p.getContext("2d"),S=p.width/2;c.fillStyle="#ffffff",c.fillRect(0,0,p.width,p.height);const k=20,b=12,w=12,z=p.width-24,h=p.height-24;c.strokeStyle="#000000",c.lineWidth=5,c.beginPath(),c.moveTo(b+k,w),c.lineTo(b+z-k,w),c.quadraticCurveTo(b+z,w,b+z,w+k),c.lineTo(b+z,w+h-k),c.quadraticCurveTo(b+z,w+h,b+z-k,w+h),c.lineTo(b+k,w+h),c.quadraticCurveTo(b,w+h,b,w+h-k),c.lineTo(b,w+k),c.quadraticCurveTo(b,w,b+k,w),c.closePath(),c.stroke(),c.fillStyle="#000000",c.textAlign="center",c.textBaseline="top",c.font="bold 26px monospace";let A=u.toUpperCase();if(A.length<=24)c.fillText(A,S,45);else{let v=A.lastIndexOf(" ",24);v===-1&&(v=22);let T=A.substring(0,v),G=A.substring(v).trim();G.length>24&&(G=G.substring(0,21)+"..."),c.fillText(T,S,30),c.fillText(G,S,60)}const E=new Image;E.crossOrigin="Anonymous",await new Promise((v,T)=>{E.onload=v,E.onerror=T,E.src=B});const C=300;c.drawImage(E,S-C/2,95,C,C);const D=new Image;if(D.crossOrigin="Anonymous",await new Promise((v,T)=>{D.onload=v,D.onerror=()=>v(),D.src=window.location.origin+"/icons/PisgahColor.png"}),D.complete&&D.naturalWidth>0){const T=S,G=95+C/2,$=document.createElement("canvas");$.width=80,$.height=80;const F=$.getContext("2d");F.drawImage(D,0,0,80,80);const N=F.getImageData(0,0,80,80),x=N.data;for(let q=0;q<x.length;q+=4)x[q+3]>20&&(x[q]=0,x[q+1]=0,x[q+2]=0,x[q+3]=255);F.putImageData(N,0,0),c.fillStyle="#ffffff",c.beginPath(),c.arc(T,G,80/2+8,0,Math.PI*2),c.fill(),c.drawImage($,T-80/2,G-80/2,80,80)}c.fillStyle="#000000",c.font="bold 28px monospace",c.fillText(y,S,420),c.strokeStyle="#cccccc",c.lineWidth=1,c.beginPath(),c.moveTo(60,460),c.lineTo(p.width-60,460),c.stroke(),c.fillStyle="#888888",c.font="20px monospace",c.fillText("PISGAH-BISDAC",S,472);const M=document.getElementById("thermalPreviewModal");M.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=p.toDataURL();const L=document.getElementById("doDirectPrintBtn"),P=L.cloneNode(!0);L.parentNode.replaceChild(P,L),P.onclick=async()=>{try{const v=await navigator.serial.requestPort();await v.open({baudRate:9600});const T=v.writable.getWriter();showCustomAlert("Mencetak...","success");const $=c.getImageData(0,0,p.width,p.height).data,F=Math.ceil(p.width/8),N=p.height,x=new Uint8Array(8+F*N);x[0]=29,x[1]=118,x[2]=48,x[3]=0,x[4]=F&255,x[5]=F>>8&255,x[6]=N&255,x[7]=N>>8&255;let q=8;for(let Q=0;Q<N;Q++)for(let X=0;X<F;X++){let oe=0;for(let J=0;J<8;J++){const ae=X*8+J;if(ae<p.width){const W=(Q*p.width+ae)*4,ce=$[W]*.299+$[W+1]*.587+$[W+2]*.114;$[W+3]>128&&ce<128&&(oe|=1<<7-J)}}x[q++]=oe}const se=new Uint8Array([27,64]),le=new Uint8Array([27,97,1]),de=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await T.write(se),await T.write(le),await T.write(x),await T.write(de),T.releaseLock(),await v.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(v){console.error(v),v.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+v.message,"error")}}}catch(u){console.error(u),showCustomAlert("Gagal memuat preview: "+u.message,"error")}},window.printBarcode=()=>{const u=document.getElementById("qrCodeImg").src,y=document.getElementById("detailName").textContent,B=document.getElementById("detailId").textContent.replace("ID: ",""),p=window.open("","_blank");if(!p){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}p.document.write(`
      <html>
        <head>
          <title>Cetak Label - ${B}</title>
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
            <h3>${y}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${u}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${B}</div>
          </div>
        </body>
      </html>
    `),p.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",re(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const u=document.getElementById("deleteBtn"),y=u.innerHTML;u.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',u.disabled=!0;try{await K("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",O()}catch(B){showCustomAlert(B.message,"error")}finally{u.innerHTML=y,u.disabled=!1}}};function Ie(){window.isAllSelected=!1;const e=document.querySelector("#btnSelectAll i");e&&(e.className="fa-regular fa-square-check");const t=document.getElementById("btnSelectAll");t&&t.classList.remove("active")}window.isAllSelected=!1;window.toggleSelectAll=function(){const e=document.querySelectorAll(".bulk-qr-checkbox");if(e.length===0)return;window.isAllSelected=!window.isAllSelected;const t=document.querySelector("#btnSelectAll i");window.isAllSelected?(e.forEach(i=>i.checked=!0),t&&(t.className="fa-solid fa-square-check"),document.getElementById("btnSelectAll").classList.add("active")):(e.forEach(i=>i.checked=!1),t&&(t.className="fa-regular fa-square-check"),document.getElementById("btnSelectAll").classList.remove("active")),window.toggleBulkPrintButton()};window.toggleBulkPrintButton=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked"),t=document.getElementById("bulkPrintContainer"),i=document.getElementById("bulkPrintCount");e.length>0?(i.textContent=e.length+" Dipilih",t.style.display="block"):t.style.display="none"};window.printSelectedQRs=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;const t=Array.from(e).map(a=>a.value),i=I.filter(a=>t.includes(a.id)),o=window.open("","_blank");if(!o){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}let n=`
    <html>
      <head>
        <title>Cetak Label Inventaris Massal</title>
        <style>
          @page { size: auto; margin: 20mm; }
          body { 
            font-family: 'Inter', sans-serif, monospace; 
            margin: 0; 
            background: #fff;
            color: #000;
          }
          .grid-container {
            display: flex;
            flex-wrap: wrap;
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
            font-size: 13px; 
            line-height: 1.2;
            text-transform: uppercase; 
            color: #000;
            text-align: center;
            width: 100%;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
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
  `;i.forEach(a=>{const r=window.location.origin+window.location.pathname+"?id="+a.id,m=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(r)}`,s=a.id.replace("ID: ","");n+=`
          <div class="label-box">
            <h3>${a.name}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${m}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${s}</div>
          </div>
    `}),n+=`
        </div>
      </body>
    </html>
  `,o.document.write(n),o.document.close(),e.forEach(a=>a.checked=!1),window.toggleBulkPrintButton()};window.printSelectedThermal=async function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print (Web Serial). Gunakan Google Chrome/Edge di PC.","error");const t=Array.from(e).map(o=>o.value),i=I.filter(o=>t.includes(o.id));try{const o=await navigator.serial.requestPort();await o.open({baudRate:9600});const n=o.writable.getWriter();showCustomAlert("Menghubungkan ke printer dan memulai cetak...","success");const a=new Uint8Array([27,64]),r=new Uint8Array([27,97,1]),m=new Uint8Array([27,74,48]);await n.write(a),await n.write(r);for(let d=0;d<i.length;d++){const g=i[d],l=await Be(g);await n.write(l),await n.write(m)}const s=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await n.write(s),n.releaseLock(),await o.close(),showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success"),e.forEach(d=>d.checked=!1),window.toggleBulkPrintButton()}catch(o){console.error(o),o.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+o.message,"error")}};async function Be(e){const t=e.name||"",i=e.id.replace("ID: ",""),o=window.location.origin+window.location.pathname+"?id="+e.id,n=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(o)}`,a=document.createElement("canvas");a.width=384,a.height=520;const r=a.getContext("2d"),m=a.width/2;r.fillStyle="#ffffff",r.fillRect(0,0,a.width,a.height);const s=20,d=12,g=12,l=a.width-24,f=a.height-24;r.strokeStyle="#000000",r.lineWidth=5,r.beginPath(),r.moveTo(d+s,g),r.lineTo(d+l-s,g),r.quadraticCurveTo(d+l,g,d+l,g+s),r.lineTo(d+l,g+f-s),r.quadraticCurveTo(d+l,g+f,d+l-s,g+f),r.lineTo(d+s,g+f),r.quadraticCurveTo(d,g+f,d,g+f-s),r.lineTo(d,g+s),r.quadraticCurveTo(d,g,d+s,g),r.closePath(),r.stroke(),r.fillStyle="#000000",r.textAlign="center",r.textBaseline="top",r.font="bold 26px monospace";let u=t.toUpperCase();if(u.length<=24)r.fillText(u,m,45);else{let h=u.lastIndexOf(" ",24);h===-1&&(h=22);let A=u.substring(0,h),E=u.substring(h).trim();E.length>24&&(E=E.substring(0,21)+"..."),r.fillText(A,m,30),r.fillText(E,m,60)}const y=new Image;y.crossOrigin="Anonymous",await new Promise(h=>{y.onload=h,y.onerror=h,y.src=n});const B=300;r.drawImage(y,m-B/2,95,B,B);const p=new Image;if(p.crossOrigin="Anonymous",await new Promise(h=>{p.onload=h,p.onerror=h,p.src=window.location.origin+"/icons/PisgahColor.png"}),p.complete&&p.naturalWidth>0){const A=m,E=95+B/2,C=document.createElement("canvas");C.width=80,C.height=80;const D=C.getContext("2d");D.drawImage(p,0,0,80,80);const M=D.getImageData(0,0,80,80),L=M.data;for(let P=0;P<L.length;P+=4)L[P+3]>20&&(L[P]=0,L[P+1]=0,L[P+2]=0,L[P+3]=255);D.putImageData(M,0,0),r.fillStyle="#ffffff",r.beginPath(),r.arc(A,E,80/2+8,0,Math.PI*2),r.fill(),r.drawImage(C,A-80/2,E-80/2,80,80)}r.fillStyle="#000000",r.font="bold 28px monospace",r.fillText(i,m,420),r.strokeStyle="#cccccc",r.lineWidth=1,r.beginPath(),r.moveTo(60,460),r.lineTo(a.width-60,460),r.stroke(),r.fillStyle="#888888",r.font="20px monospace",r.fillText("PISGAH-BISDAC",m,472);const S=r.getImageData(0,0,a.width,a.height).data,k=Math.ceil(a.width/8),b=a.height,w=new Uint8Array(8+k*b);w[0]=29,w[1]=118,w[2]=48,w[3]=0,w[4]=k&255,w[5]=k>>8&255,w[6]=b&255,w[7]=b>>8&255;let z=8;for(let h=0;h<b;h++)for(let A=0;A<k;A++){let E=0;for(let C=0;C<8;C++){const D=A*8+C;if(D<a.width){const M=(h*a.width+D)*4,L=S[M]*.299+S[M+1]*.587+S[M+2]*.114;S[M+3]>128&&L<128&&(E|=1<<7-C)}}w[z++]=E}return w}window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function re(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");if(t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e){document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?_(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi||"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price||"",document.getElementById("formDepreciationYears").value=e.depreciation_years||"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none";const i=[];e.photo&&i.push(e.photo),e.pic2&&i.push(e.pic2),e.pic3&&i.push(e.pic3),e.pic4&&i.push(e.pic4),i.length>0&&(window.currentPhotosBase64=[...i],window.renderPhotoPreview())}else document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("formDepreciationYears").value="",document.getElementById("disposeFields").style.display="none"}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files;if(!t||t.length===0)return;t.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const i=document.getElementById("photoPreview");i.innerHTML="",i.style.display="flex",Array.from(t).slice(0,4).forEach(n=>{const a=new FileReader;a.onload=function(r){const m=new Image;m.onload=function(){const s=document.createElement("canvas"),d=800,g=800;let l=m.width,f=m.height;l>f?l>d&&(f*=d/l,l=d):f>g&&(l*=g/f,f=g),s.width=l,s.height=f,s.getContext("2d").drawImage(m,0,0,l,f);const y=s.toDataURL("image/webp",.7);window.currentPhotosBase64.push(y),window.renderPhotoPreview()},m.src=r.target.result},a.readAsDataURL(n)})});window.renderPhotoPreview=function(){const e=document.getElementById("photoPreview");if(e.innerHTML="",!window.currentPhotosBase64||window.currentPhotosBase64.length===0){e.style.display="none";return}e.style.display="flex",window.currentPhotosBase64.forEach((t,i)=>{const o=document.createElement("div");o.style.position="relative",o.style.display="inline-block";const n=document.createElement("img");n.src=t,n.style.width="80px",n.style.height="80px",n.style.objectFit="cover",n.style.borderRadius="8px",n.style.border="1px solid var(--glass-border)",n.style.flexShrink="0";const a=document.createElement("button");a.innerHTML='<i class="fa-solid fa-xmark"></i>',a.style.position="absolute",a.style.top="-5px",a.style.right="-5px",a.style.background="#ef4444",a.style.color="white",a.style.border="none",a.style.borderRadius="50%",a.style.width="20px",a.style.height="20px",a.style.cursor="pointer",a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="center",a.style.fontSize="12px",a.onclick=r=>{r.preventDefault(),window.currentPhotosBase64.splice(i,1),window.renderPhotoPreview()},o.appendChild(n),o.appendChild(a),e.appendChild(o)})};window.showCustomAlert=function(e,t="success"){const i=document.getElementById("customAlertModal"),o=document.getElementById("alertTitle"),n=document.getElementById("alertMessage"),a=document.getElementById("alertIcon");n.textContent=e,t==="error"?(o.textContent="Gagal",o.style.color="#ef4444",a.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',a.style.color="#ef4444"):t==="warning"?(o.textContent="Perhatian",o.style.color="#d4af37",a.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',a.style.color="#d4af37"):(o.textContent="Berhasil",o.style.color="var(--accent)",a.innerHTML='<i class="fa-solid fa-circle-check"></i>',a.style.color="var(--accent)"),i.style.display="flex"};function ee(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{window.currentViewMode==="list"?(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active")):(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")),Z(),ie().then(()=>O()),setInterval(()=>{const t=document.getElementById("liveDateTime");if(t){const i=new Date,o={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"};t.textContent=i.toLocaleDateString("id-ID",o).replace("pukul","").trim()}},1e3),document.getElementById("formValue").addEventListener("input",ee),document.getElementById("formTaksasi").addEventListener("input",ee),document.getElementById("formDisposePrice").addEventListener("input",ee),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const t=document.getElementById("loginUsername").value,i=document.getElementById("loginPassword").value;if(!t||!i)return showCustomAlert("Isi username dan password","error");const o=document.getElementById("doLoginBtn");o.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',o.disabled=!0;try{const n=await ne("login",{username:t,password:i});if(n.token){localStorage.setItem("BISDAC_token",n.token);const a=n.role||n.user&&n.user.role||"",r=n.nama||n.user&&n.user.nama||n.user&&n.user.name||"";localStorage.setItem("BISDAC_role",a),localStorage.setItem("BISDAC_name",r)}}catch(n){showCustomAlert(n.message,"error")}finally{o.innerHTML="Masuk",o.disabled=!1,document.getElementById("loginModal").style.display="none",Z(),H&&O()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),Z(),renderGrid(I),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{re()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const t=document.getElementById("formName").value,i=document.getElementById("formDate").value,o=document.getElementById("formValue").value.replace(/\./g,""),n=document.getElementById("formLocation").value,a=document.getElementById("formCategory").value,r=document.getElementById("formSource").value,m=document.getElementById("formTaksasi").value.replace(/\./g,""),s=document.getElementById("formPic").value,d=document.getElementById("formId").value,g=document.getElementById("formQty").value,l=document.getElementById("formUnit").value,f=document.getElementById("formSubItems").value,u=document.getElementById("formStatus").value;let y=document.getElementById("formDisposeReason").value,B=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!t||!n||!s||!a||!r||!g||!l)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(u==="Disposed"&&!y)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");const p={isUpdate:!!d,id:d,name:t,date_acquired:i,value:o,location:n,category:a,source:r,taksasi:m,pic:s,qty:g,unit:l,sub_items:f,status:u,dispose_reason:u==="Disposed"?y:"",dispose_price:B,depreciation_years:document.getElementById("formDepreciationYears").value};window.currentPhotosBase64&&window.currentPhotosBase64.length>0?(p.photo=window.currentPhotosBase64[0]||"",p.pic2=window.currentPhotosBase64[1]||"",p.pic3=window.currentPhotosBase64[2]||"",p.pic4=window.currentPhotosBase64[3]||""):p.isUpdate;const c=document.getElementById("saveBtn");c.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',c.disabled=!0;try{await K("saveInventory",p),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),O()}catch(S){showCustomAlert(S.message,"error")}finally{c.innerHTML="Simpan Data",c.disabled=!1}});const e=document.getElementById("searchInput");e.value="",e.addEventListener("input",()=>{window.renderGrid()})});window.exportCSV=function(){if(!I||I.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","MARKET_VALUE","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=I.map(r=>[r.id,Y(r.date_acquired)||"",`"${(r.name||"").replace(/"/g,'""')}"`,`"${(r.category||"").replace(/"/g,'""')}"`,`"${(r.source||"").replace(/"/g,'""')}"`,r.value||0,r.taksasi||0,r.qty||1,r.unit||"Unit",`"${(r.location||"").replace(/"/g,'""')}"`,`"${(r.pic||"").replace(/"/g,'""')}"`,r.status||"Active",r.status==="Disposed"?`"${(r.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',r.status==="Disposed"?r.dispose_price||0:'""',`"${(r.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),i=e.join(",")+`
`+t.join(`
`),o=new Blob([i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(o),a=document.createElement("a");a.setAttribute("href",n),a.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!I||I.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
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
  `;I.forEach(o=>{const n=o.photo?o.photo:"/icons/PisgahLogoColor.png",a=o.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${o.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
        <tr style="page-break-inside: avoid;">
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${n}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
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
            ${a}<br>
            ${o.qty||1} ${o.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${_(o.value||0)}<br>
            <span style="color:#666;">Market Value: ${_(o.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const i={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(i).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};window.openLoanModal=function(){if(!window.currentDetailId)return;const e=I.find(i=>i.id===window.currentDetailId);if(!e)return;document.getElementById("formLoanStatus").value=e.loan_status||"Tersedia",document.getElementById("formLoanBorrower").value=e.borrowed_by||"",e.borrow_date?document.getElementById("formLoanDate").value=new Date(e.borrow_date).toISOString().split("T")[0]:document.getElementById("formLoanDate").value=new Date().toISOString().split("T")[0],e.expected_return_date?document.getElementById("formLoanReturnDate").value=new Date(e.expected_return_date).toISOString().split("T")[0]:document.getElementById("formLoanReturnDate").value="";const t=document.getElementById("loanDetailsFields");t.style.display=e.loan_status==="Dipinjam"?"block":"none",document.getElementById("loanModal").style.display="flex"};document.getElementById("saveLoanBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=I.find(m=>m.id===window.currentDetailId);if(!e)return;const t=document.getElementById("formLoanStatus").value,i=document.getElementById("formLoanBorrower").value,o=document.getElementById("formLoanDate").value,n=document.getElementById("formLoanReturnDate").value;if(t==="Dipinjam"&&(!i||!o||!n))return showCustomAlert("Mohon lengkapi data peminjam dan tanggalnya!","error");const a={isUpdate:!0,id:e.id,loan_status:t,borrowed_by:t==="Dipinjam"?i:"",borrow_date:t==="Dipinjam"?o:"",expected_return_date:t==="Dipinjam"?n:""},r=document.getElementById("saveLoanBtn");r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',r.disabled=!0;try{await K("saveInventory",a),showCustomAlert("Status Peminjaman berhasil diperbarui!","success"),document.getElementById("loanModal").style.display="none",O()}catch(m){showCustomAlert(m.message,"error")}finally{r.innerHTML="Simpan Status",r.disabled=!1}};window.openServiceModal=function(){window.currentDetailId&&(document.getElementById("formServiceDate").value=new Date().toISOString().split("T")[0],document.getElementById("formServiceDesc").value="",document.getElementById("formServiceCost").value="",document.getElementById("serviceModal").style.display="flex")};document.getElementById("saveServiceBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=document.getElementById("formServiceDate").value,t=document.getElementById("formServiceDesc").value,i=document.getElementById("formServiceCost").value;if(!e||!t)return showCustomAlert("Tanggal dan Keterangan wajib diisi!","error");const o={inventory_id:window.currentDetailId,service_date:e,description:t,cost:i},n=document.getElementById("saveServiceBtn");n.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',n.disabled=!0;try{await K("saveInventoryService",o),showCustomAlert("Riwayat servis berhasil dicatat!","success"),document.getElementById("serviceModal").style.display="none",loadServiceHistory(window.currentDetailId)}catch(a){showCustomAlert(a.message,"error")}finally{n.innerHTML="Simpan Riwayat",n.disabled=!1}};window.loadServiceHistory=async function(e){const t=document.getElementById("serviceHistoryContainer");t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat...</div>';try{const i=await ne("getInventoryService",{inventory_id:e});if(!i.success)throw new Error(i.message);const o=i.data;if(!o||o.length===0){t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px; background:rgba(0,0,0,0.02); border-radius:8px;">Belum ada riwayat servis.</div>';return}o.sort((n,a)=>new Date(a.service_date)-new Date(n.service_date)),t.innerHTML=o.map(n=>`
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--text-dark); font-size:0.9rem;"><i class="fa-solid fa-calendar-day" style="color:var(--text-muted); margin-right:5px;"></i> ${Y(n.service_date)}</strong>
          <span style="color:#ef4444; font-weight:bold; font-size:0.9rem;">Rp ${_(n.cost||0)}</span>
        </div>
        <div style="color:var(--text-dark); font-size:0.9rem; line-height:1.4;">${n.description}</div>
        <div style="color:var(--text-muted); font-size:0.75rem; text-align:right;">Dicatat oleh: ${n.created_by}</div>
      </div>
    `).join("")}catch(i){t.innerHTML=`<div style="text-align:center; color:#ef4444; font-size:0.9rem; padding:15px;">Gagal memuat: ${i.message}</div>`}};window.showDepreciationReport=function(){const e=document.getElementById("depreciationTableBody");e.innerHTML="";let t=0,i=0;new Date().getFullYear();const o=new Date;I.forEach(n=>{if(n.status==="Disposed"||!n.value)return;const a=parseFloat(n.value)||0,r=parseInt(n.depreciation_years)||0;let m=a,s="-";if(r>0&&n.date_acquired){const g=new Date(n.date_acquired);let f=((o.getFullYear()-g.getFullYear())*12+(o.getMonth()-g.getMonth()))/12;f<0&&(f=0),s=f.toFixed(1)+" Tahun";let u=a-a*(f/r);u<0&&(u=0),m=u}t+=a,i+=m;const d=document.createElement("tr");d.style.borderBottom="1px solid var(--border-light)",d.innerHTML=`
      <td style="padding:12px; color:var(--text-dark);">
        <strong>${n.name}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">${n.id}</span>
      </td>
      <td style="padding:12px; color:var(--text-muted);">${Y(n.date_acquired)}</td>
      <td style="padding:12px; text-align:right; color:var(--text-dark);">Rp ${_(a)}</td>
      <td style="padding:12px; text-align:center; color:var(--text-dark);">${r>0?r:"-"}</td>
      <td style="padding:12px; text-align:center; color:var(--text-muted);">${s}</td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:${m===0?"#ef4444":"#22c55e"};">Rp ${_(m)}</td>
    `,e.appendChild(d)}),document.getElementById("depTotalAwal").textContent="Rp "+_(t),document.getElementById("depTotalBuku").textContent="Rp "+_(i),document.getElementById("depreciationModal").style.display="flex"};window.printDepreciation=function(){const e=document.querySelector("#depreciationModal .inv-modal-content").cloneNode(!0);e.querySelectorAll("button").forEach(n=>n.remove());const i=document.createElement("div");i.innerHTML=`
    <h2 style="text-align:center; margin-bottom:5px;">LAPORAN PENYUSUTAN NILAI ASET (DEPRESIASI)</h2>
    <p style="text-align:center; margin-top:0; margin-bottom:20px;">Gereja PISGAH-BISDAC | Tanggal Cetak: ${new Date().toLocaleString("id-ID")}</p>
  `,e.insertBefore(i,e.firstChild),e.style.padding="20px",e.style.background="#fff",e.style.color="#000";const o=window.open("","_blank","width=1000,height=700");if(!o){showCustomAlert("Browser memblokir popup. Tolong izinkan popup untuk mencetak.","error");return}o.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Depresiasi - PISGAH</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; margin: 0; width: 100%; box-sizing: border-box; }
        .inv-modal-content { max-width: none !important; padding: 0 !important; border: none !important; box-shadow: none !important; background: transparent !important; margin: 0 !important; width: 100% !important; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: auto; }
        th, td { border: 1px solid #ddd; padding: 10px; font-size: 14px; text-align: left; }
        th { background-color: #f1f5f9; color: #1e293b; }
        h2 { text-align: center; color: #1e293b; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #64748b; margin-top: 0; margin-bottom: 30px; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .summary-box strong { color: #1e293b; }
        @media print {
          @page { size: auto; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #0f766e; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Simpan ke PDF / Cetak</button>
      </div>
      ${e.innerHTML}
    </body>
    </html>
  `),o.document.close(),o.focus(),setTimeout(()=>{o.print()},250)};
