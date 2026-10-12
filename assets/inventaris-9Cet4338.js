import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{c as ue}from"./index-MbRB0llW.js";const me="https://lxapdcjquipdowscfgtq.supabase.co",ge="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXBkY2pxdWlwZG93c2NmZ3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQxNDQsImV4cCI6MjEwNzAzMDE0NH0.GvXjY42WCBaOQXVNnu8vZHKuXtPSXp4EqcwzcKBXq0w",U=ue(me,ge);async function pe(){try{const{data:e,error:t}=await U.from("inventaris").select("id").limit(1);return t?(console.warn("Supabase Inventaris check error:",t.message),!1):!0}catch(e){return console.warn("Supabase network unreachable:",e),!1}}async function ye(){try{let e=[],a=0,n=!0;for(;n;){const{data:i,error:o}=await U.from("inventaris").select("*").order("created_at",{ascending:!1}).range(a,a+1e3-1);if(o)throw o;i&&i.length>0?(e=e.concat(i),i.length<1e3?n=!1:a+=1e3):n=!1}return{success:!0,data:e}}catch(e){return console.error("fetchInventoryFromSupabase Error:",e),{success:!1,message:e.message,data:[]}}}async function fe(e){try{const t={id:e.id,name:e.name,category:e.category||"Lainnya",source:e.source||"",date_acquired:e.date_acquired||"",location:e.location||"",pic:e.pic||"",qty:parseFloat(e.qty)||1,unit:e.unit||"Unit",value:parseFloat(e.value)||0,taksasi:parseFloat(e.taksasi)||0,status:e.status||"Active",dispose_reason:e.dispose_reason||"",dispose_price:parseFloat(e.dispose_price)||0,loan_status:e.loan_status||"Tersedia",borrowed_by:e.borrowed_by||"",expected_return_date:e.expected_return_date||"",sub_items:typeof e.sub_items=="object"?JSON.stringify(e.sub_items):e.sub_items||"",photo:e.photo||"",pic2:e.pic2||"",pic3:e.pic3||"",pic4:e.pic4||"",depreciation_years:parseFloat(e.depreciation_years)||5,created_at:e.created_at||new Date().toISOString()},{data:a,error:n}=await U.from("inventaris").upsert(t,{onConflict:"id"}).select();if(n)throw n;return{success:!0,data:a,message:"Data inventaris berhasil disimpan di Supabase"}}catch(t){return console.error("saveInventoryToSupabase Error:",t),{success:!1,message:t.message}}}async function we(e){try{const{error:t}=await U.from("inventaris").delete().eq("id",e);if(t)throw t;return{success:!0,message:"Data berhasil dihapus dari Supabase"}}catch(t){return console.error("deleteInventoryFromSupabase Error:",t),{success:!1,message:t.message}}}async function he(e){try{const{data:t,error:a}=await U.from("inventory_services").select("*").eq("inventory_id",e).order("service_date",{ascending:!1});if(a)throw a;return{success:!0,data:t||[]}}catch(t){return console.error("fetchInventoryServicesFromSupabase Error:",t),{success:!1,message:t.message,data:[]}}}async function be(e){try{const t={inventory_id:e.inventory_id,service_date:e.service_date,description:e.description||"",cost:parseFloat(e.cost)||0,created_at:new Date().toISOString()},{error:a}=await U.from("inventory_services").insert([t]);if(a)throw a;return{success:!0,message:"Riwayat servis berhasil dicatat di Supabase"}}catch(t){return console.error("saveInventoryServiceToSupabase Error:",t),{success:!1,message:t.message}}}async function ve(e,t=()=>{}){try{t("Menghubungi Google Apps Script...");const a=new URL(e);a.searchParams.set("action","getInventory"),a.searchParams.set("_t",Date.now());const i=await(await fetch(a.toString(),{method:"GET",redirect:"follow"})).json();if(!i.success||!Array.isArray(i.data))throw new Error(i.message||"Gagal mengambil data dari Google Apps Script");const o=i.data;if(o.length===0)return{success:!0,count:0,message:"Tidak ada data inventaris di Google Sheets untuk dimigrasikan."};t(`Ditemukan ${o.length} aset. Memulai migrasi ke Supabase...`);const r=50;let u=0;for(let s=0;s<o.length;s+=r){const d=o.slice(s,s+r).map(l=>({id:String(l.id),name:l.name||"Tanpa Nama",category:l.category||"Lainnya",source:l.source||"",date_acquired:l.date_acquired?String(l.date_acquired):"",location:l.location||"",pic:l.pic||"",qty:parseFloat(l.qty)||1,unit:l.unit||"Unit",value:parseFloat(l.value)||0,taksasi:parseFloat(l.taksasi)||0,status:l.status||"Active",dispose_reason:l.dispose_reason||"",dispose_price:parseFloat(l.dispose_price)||0,loan_status:l.loan_status||"Tersedia",borrowed_by:l.borrowed_by||"",expected_return_date:l.expected_return_date||"",sub_items:typeof l.sub_items=="object"?JSON.stringify(l.sub_items):l.sub_items||"",photo:l.photo||"",pic2:l.pic2||"",pic3:l.pic3||"",pic4:l.pic4||"",depreciation_years:parseFloat(l.depreciation_years)||5,created_at:l.created_at||new Date().toISOString()})),{error:g}=await U.from("inventaris").upsert(d,{onConflict:"id"});if(g)throw g;u+=d.length,t(`Migrasi berjalan: ${u} / ${o.length} aset tersimpan...`)}return{success:!0,count:u,message:`Berhasil memigrasikan ${u} aset inventaris ke Supabase!`}}catch(a){return console.error("migrateInventarisGASToSupabase Error:",a),{success:!1,message:a.message}}}const xe="https://script.google.com/macros/s/AKfycbwfBsZNTUD-3Ss-eV6Vk7g3x1FbSBpMIjzGuZcxYkV2dQhj9Nw82YJNNsfoZ5nlSz7mnw/exec";function te(){return xe}let H=null,B=[],R=!1;function j(e,t){const a=document.getElementById("dbStatusDot"),n=document.getElementById("dbStatusText"),i=document.getElementById("dbStatusBadge");!a||!n||!i||(n.textContent=t,e==="online"?(i.style.background="rgba(16,185,129,0.1)",i.style.color="#059669",i.style.borderColor="rgba(16,185,129,0.2)",a.style.background="#10b981",a.style.boxShadow="0 0 8px rgba(16,185,129,0.6)"):e==="fallback"?(i.style.background="rgba(245,158,11,0.1)",i.style.color="#d97706",i.style.borderColor="rgba(245,158,11,0.2)",a.style.background="#f59e0b",a.style.boxShadow="0 0 8px rgba(245,158,11,0.6)"):e==="offline"?(i.style.background="rgba(239,68,68,0.1)",i.style.color="#dc2626",i.style.borderColor="rgba(239,68,68,0.2)",a.style.background="#ef4444",a.style.boxShadow="none"):(i.style.background="rgba(100,116,139,0.1)",i.style.color="#64748b",i.style.borderColor="rgba(100,116,139,0.2)",a.style.background="#94a3b8",a.style.boxShadow="none"))}async function ie(){return j("loading","Menghubungkan..."),R=await pe(),R?j("online","Supabase Aktif"):j("fallback","Google Sheets Cadangan"),R}window.migrateToSupabase=async function(){if(!confirm(`Mulai 1-Klik Migrasi seluruh data inventaris dari Google Sheets ke Supabase?

Data lama di Google Sheets akan tetap tersimpan aman sebagai cadangan ganda.`))return;const t=document.getElementById("migrateBtn"),a=t?t.innerHTML:"";t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Memigrasi...');try{const n=await ve(te(),i=>{t&&(t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> <span class="hide-on-mobile">${i}</span>`)});n.success?(alert(`Migrasi Berhasil!

${n.message}`),await ie(),await O()):alert(`Migrasi Gagal:
${n.message}`)}catch(n){alert(`Terjadi kesalahan saat migrasi: ${n.message}`)}finally{t&&(t.disabled=!1,t.innerHTML=a)}};function T(e){return new Intl.NumberFormat("id-ID").format(e)}function Y(e){if(!e)return"-";const t=new Date(e);if(isNaN(t))return e;const a=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return`${t.getDate()} ${a[t.getMonth()]} ${t.getFullYear()}`}async function ne(e,t={}){if(e==="getInventory"){if(R)try{const o=await ye();if(o.success)return o;console.warn("Supabase getInventory failed, falling back to GAS:",o.message)}catch(o){console.warn("Supabase fetch error, falling back to GAS:",o)}j("fallback","Google Sheets Cadangan")}if(e==="getInventoryService"&&R)try{const o=await he(t.inventory_id);if(o.success)return o}catch(o){console.warn("Supabase getInventoryService error, falling back to GAS:",o)}const a=new URL(te());a.searchParams.set("action",e),a.searchParams.set("token",localStorage.getItem("BISDAC_token")||""),a.searchParams.set("_t",Date.now());for(let o in t)a.searchParams.set(o,t[o]);const i=await(await fetch(a.toString(),{method:"GET",redirect:"follow"})).json();if(!i.success)throw new Error(i.message||"API Error");return i}async function K(e,t){const a=async()=>{const n={action:e,token:localStorage.getItem("BISDAC_token")||"",data:t},o=await(await fetch(te(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},redirect:"follow",body:JSON.stringify(n)})).json();if(!o.success)throw new Error(o.message||"API Error");return o};if(e==="saveInventory"){if(R){try{const n=await fe(t);if(n.success)return a().catch(i=>console.warn("Background Dual Backup save to GAS failed:",i)),n;console.warn("Supabase save failed, falling back to GAS:",n.message)}catch(n){console.warn("Supabase save error, falling back to GAS:",n)}j("fallback","Google Sheets Cadangan")}return await a()}if(e==="deleteInventory"){if(R){try{const n=await we(t.id);if(n.success)return a().catch(i=>console.warn("Background Dual Backup delete to GAS failed:",i)),n}catch(n){console.warn("Supabase delete error, falling back to GAS:",n)}j("fallback","Google Sheets Cadangan")}return await a()}if(e==="saveInventoryService"){if(R)try{const n=await be(t);if(n.success)return a().catch(i=>console.warn("Background Dual Backup service to GAS failed:",i)),n}catch(n){console.warn("Supabase service error, falling back to GAS:",n)}return await a()}return await a()}function V(e,t){return e?e.split(",").map(n=>n.trim()).includes(t):!1}function Z(){const e=localStorage.getItem("BISDAC_token"),t=localStorage.getItem("BISDAC_role"),a=localStorage.getItem("BISDAC_name"),n=t&&(V(t,"Admin")||V(t,"Bendahara")||V(t,"Diakon")||V(t,"Ketua Jemaat")||V(t,"Pendeta"));e&&n?(H={token:e,role:t,name:a},document.getElementById("loginBtn").style.display="none",document.getElementById("adminControls").style.display="flex",document.getElementById("userNameDisplay").textContent=`Hi, ${a}`,document.querySelectorAll(".admin-only-field").forEach(i=>i.style.display=i.dataset.display||"block")):(H=null,document.getElementById("loginBtn").style.display="block",document.getElementById("adminControls").style.display="none",document.querySelectorAll(".admin-only-field").forEach(i=>i.style.display="none"))}window.currentViewMode=localStorage.getItem("BISDAC_invViewMode")||"grid";window.changeViewMode=function(e){window.currentViewMode=e,localStorage.setItem("BISDAC_invViewMode",e),e==="grid"?(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")):(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active")),window.renderGrid()};window.renderGrid=function(){Ie();const e=document.getElementById("searchInput")?document.getElementById("searchInput").value.toLowerCase():"",t=document.getElementById("filterCategory")?document.getElementById("filterCategory").value:"",a=document.getElementById("filterStatus")?document.getElementById("filterStatus").value:"",n=document.getElementById("filterLoan")?document.getElementById("filterLoan").value:"";let i=B;(e||t||a||n)&&(i=B.filter(s=>{let d=!0;if(e&&(d=d&&(s.name&&s.name.toLowerCase().includes(e)||s.location&&s.location.toLowerCase().includes(e)||s.pic&&s.pic.toLowerCase().includes(e))),t&&(d=d&&s.category===t),a&&(d=d&&(s.status||"Active")===a),n){const g=s.loan_status||"Tersedia";d=d&&g===n}return d}));const o=document.getElementById("inventoryGrid");if(!i||i.length===0){o.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: rgba(255,255,255,0.6);">Belum ada data inventaris.</div>';return}const r=window.currentViewMode==="list";o.className=r?"inventory-list":"inventory-grid";const u=["linear-gradient(135deg, #f5eaea 0%, #ecd3d3 100%)","linear-gradient(135deg, #eaf2ee 0%, #d5e5db 100%)","linear-gradient(135deg, #eef3f8 0%, #d8e5f1 100%)","linear-gradient(135deg, #fbf2e5 0%, #f6e1c6 100%)","linear-gradient(135deg, #f0ebf5 0%, #e1d6eb 100%)","linear-gradient(135deg, #f5f2e6 0%, #ebe3cd 100%)"];o.innerHTML=i.map((s,d)=>{const g=s.photo?s.photo:"https://images.unsplash.com/photo-1548625361-ec8587d60f58?w=500&q=80",l=s.status==="Disposed",f=l?"opacity: 0.7; filter: grayscale(80%); border: 1px solid rgba(239, 68, 68, 0.3);":"";let m="";l?m='<span class="inv-badge-status" style="background:#ef4444;">Disposed</span>':(s.loan_status||"Tersedia")==="Dipinjam"?m='<span class="inv-badge-status" style="background:#eab308; color:#fff;">Dipinjam</span>':m=`<span class="inv-badge-status">${s.category||"Belum Kategori"}</span>`;const y=H?`<input type="checkbox" class="bulk-qr-checkbox" value="${s.id}" onclick="event.stopPropagation(); window.toggleBulkPrintButton();" style="position:absolute; top:15px; right:15px; z-index:20; width:20px; height:20px; cursor:pointer; accent-color: var(--accent-dark);" title="Pilih untuk cetak QR">`:"",b=u[d%u.length];return r?`
        <div class="inv-list-card" style="${f}" onclick="window.viewDetail('${s.id}')">
          ${y}
          <img src="${g}" class="inv-list-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'" style="background: ${b};">
          <div class="inv-list-info">
            <div style="flex:1;">
              ${m}
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
                <div class="inv-asset-value" style="margin-top:4px;">Rp ${T(s.taksasi||s.value||0)}</div>
                <div class="btn btn-outline" style="margin-top:16px; padding:8px 16px; font-size:0.85rem; border-radius:50px; width:100%;">Lihat Detail</div>
              </div>
            `:'<div style="padding-left:24px;"><div class="btn btn-outline" style="padding:8px 16px; border-radius:50px;">Lihat Detail</div></div>'}
          </div>
        </div>
      `:`
        <div class="inv-asset-card" style="${f}" onclick="window.viewDetail('${s.id}')">
          ${y}
          <img src="${g}" class="inv-asset-photo" alt="${s.name}" onerror="this.src='/icons/PisgahLogoColor.png'" style="background: ${b};">
          <div class="inv-asset-info">
            ${m}
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
                  <div class="inv-asset-value">Rp ${T(s.taksasi||s.value||0)}</div>
                </div>
              </div>
            `:""}
          </div>
          <div class="card-action-btn"><i class="fa-solid fa-arrow-right"></i></div>
        </div>
      `}).join("")};async function O(){try{const e=document.getElementById("inventoryGrid");e.innerHTML='<div style="grid-column: 1 / -1; text-align:center; padding: 60px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--accent-dark);"></i><p style="margin-top:15px; color:var(--text-muted); font-weight: 500;">Memuat koleksi inventaris...</p></div>',B=(await ne("getInventory")).data||[],B.sort((i,o)=>new Date(o.created_at)-new Date(i.created_at)),window.renderGrid();const n=new URLSearchParams(window.location.search).get("id");n&&setTimeout(()=>{window.viewDetail(n)},300)}catch(e){document.getElementById("inventoryGrid").innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: #ef4444;">Gagal memuat data: ${e.message}</div>`}}window.viewDetail=function(e){const t=B.find(m=>m.id===e);if(!t)return;window.currentDetailId=e,document.getElementById("detailName").textContent=t.name,document.getElementById("detailId").textContent=t.id,document.getElementById("detailCategory").textContent=t.category||"Belum Dikategorikan",document.getElementById("detailSource").textContent=t.source||"Tidak Diketahui Asalnya",document.getElementById("detailDate").textContent=Y(t.date_acquired),document.getElementById("detailLocation").textContent=t.location,document.getElementById("detailPic").textContent=t.pic,document.getElementById("detailQty").textContent=t.qty||1,document.getElementById("detailUnit").textContent=t.unit||"Unit";const a=document.getElementById("detailLoanBadge");(t.loan_status||"Tersedia")==="Dipinjam"?(a.style.background="#eab308",a.textContent=`Dipinjam oleh: ${t.borrowed_by||"-"} (s.d ${Y(t.expected_return_date)||"-"})`):(a.style.background="#22c55e",a.textContent="Tersedia");const i=document.getElementById("detailStatusContainer"),o=document.getElementById("detailStatusBadge"),r=document.getElementById("detailDisposeInfo");t.status==="Disposed"?(i.style.display="block",o.innerHTML='<i class="fa-solid fa-ban"></i> Disposed',o.style.background="rgba(239, 68, 68, 0.2)",o.style.color="#ef4444",r.style.display="block",document.getElementById("detailDisposeReason").textContent=t.dispose_reason||"-",H&&t.dispose_price?(document.getElementById("detailDisposePrice").textContent=`Rp ${T(t.dispose_price)}`,document.getElementById("detailDisposePrice").parentElement.style.display="block"):document.getElementById("detailDisposePrice").parentElement.style.display="none"):(i.style.display="block",o.innerHTML='<i class="fa-solid fa-circle-check"></i> Active',o.style.background="rgba(74, 222, 128, 0.1)",o.style.color="#4ade80",r.style.display="none");const u=document.getElementById("detailSubItems"),s=document.getElementById("detailSubItemsContainer");t.sub_items?(u.textContent=t.sub_items,s.style.display="flex"):s.style.display="none";const d=document.getElementById("detailPhotosContainer");d.innerHTML="";const g=[t.photo,t.pic2,t.pic3,t.pic4].filter(m=>m);g.length>0?(g.forEach(m=>{const y=document.createElement("img");y.src=m,y.style.height="180px",y.style.maxWidth="100%",y.style.borderRadius="12px",y.style.objectFit="contain",y.style.border="1px solid var(--border-light)",y.style.flexShrink="0",y.style.backgroundColor="#f8f9fa",y.style.cursor="pointer",y.onclick=()=>{document.getElementById("imagePreviewFull").src=m,document.getElementById("imagePreviewModal").style.display="flex"},d.appendChild(y)}),d.style.display="flex"):d.style.display="none",H?(document.getElementById("detailValueContainer").style.display="block",document.getElementById("detailValue").textContent=`Rp ${T(t.value)}`,document.getElementById("detailTaksasiContainer").style.display="block",document.getElementById("detailTaksasi").textContent=`Rp ${T(t.taksasi||0)}`,document.getElementById("detailAdminActions").style.display="flex"):(document.getElementById("detailValueContainer").style.display="none",document.getElementById("detailTaksasiContainer").style.display="none",document.getElementById("detailAdminActions").style.display="none");const l=window.location.origin+window.location.pathname+"?id="+t.id,f=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(l)}`;document.getElementById("qrCodeImg").src=f,document.getElementById("qrCodeId").textContent=t.id,document.getElementById("detailModal").style.display="flex",window.printDirectThermal=async()=>{try{if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print. Gunakan Google Chrome/Edge di PC atau Chrome di Android.","error");const m=document.getElementById("detailName").textContent,y=document.getElementById("detailId").textContent.replace("ID: ",""),b=document.getElementById("qrCodeImg").src,p=document.createElement("canvas");p.width=384,p.height=520;const c=p.getContext("2d"),_=p.width/2;c.fillStyle="#ffffff",c.fillRect(0,0,p.width,p.height);const S=20,v=12,w=12,z=p.width-24,h=p.height-24;c.strokeStyle="#000000",c.lineWidth=5,c.beginPath(),c.moveTo(v+S,w),c.lineTo(v+z-S,w),c.quadraticCurveTo(v+z,w,v+z,w+S),c.lineTo(v+z,w+h-S),c.quadraticCurveTo(v+z,w+h,v+z-S,w+h),c.lineTo(v+S,w+h),c.quadraticCurveTo(v,w+h,v,w+h-S),c.lineTo(v,w+S),c.quadraticCurveTo(v,w,v+S,w),c.closePath(),c.stroke(),c.fillStyle="#000000",c.textAlign="center",c.textBaseline="top",c.font="bold 26px monospace";let k=m.toUpperCase();if(k.length<=24)c.fillText(k,_,45);else{let x=k.lastIndexOf(" ",24);x===-1&&(x=22);let D=k.substring(0,x),G=k.substring(x).trim();G.length>24&&(G=G.substring(0,21)+"..."),c.fillText(D,_,30),c.fillText(G,_,60)}const E=new Image;E.crossOrigin="Anonymous",await new Promise((x,D)=>{E.onload=x,E.onerror=D,E.src=b});const A=300;c.drawImage(E,_-A/2,95,A,A);const C=new Image;if(C.crossOrigin="Anonymous",await new Promise((x,D)=>{C.onload=x,C.onerror=()=>x(),C.src=window.location.origin+"/icons/PisgahColor.png"}),C.complete&&C.naturalWidth>0){const D=_,G=95+A/2,$=document.createElement("canvas");$.width=80,$.height=80;const F=$.getContext("2d");F.drawImage(C,0,0,80,80);const N=F.getImageData(0,0,80,80),I=N.data;for(let q=0;q<I.length;q+=4)I[q+3]>20&&(I[q]=0,I[q+1]=0,I[q+2]=0,I[q+3]=255);F.putImageData(N,0,0),c.fillStyle="#ffffff",c.beginPath(),c.arc(D,G,80/2+8,0,Math.PI*2),c.fill(),c.drawImage($,D-80/2,G-80/2,80,80)}c.fillStyle="#000000",c.font="bold 28px monospace",c.fillText(y,_,420),c.strokeStyle="#cccccc",c.lineWidth=1,c.beginPath(),c.moveTo(60,460),c.lineTo(p.width-60,460),c.stroke(),c.fillStyle="#888888",c.font="20px monospace",c.fillText("PISGAH-BISDAC",_,472);const M=document.getElementById("thermalPreviewModal");M.style.cssText="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:#111827; align-items:center; justify-content:center;",document.getElementById("thermalPreviewImg").src=p.toDataURL();const L=document.getElementById("doDirectPrintBtn"),P=L.cloneNode(!0);L.parentNode.replaceChild(P,L),P.onclick=async()=>{try{const x=await navigator.serial.requestPort();await x.open({baudRate:9600});const D=x.writable.getWriter();showCustomAlert("Mencetak...","success");const $=c.getImageData(0,0,p.width,p.height).data,F=Math.ceil(p.width/8),N=p.height,I=new Uint8Array(8+F*N);I[0]=29,I[1]=118,I[2]=48,I[3]=0,I[4]=F&255,I[5]=F>>8&255,I[6]=N&255,I[7]=N>>8&255;let q=8;for(let Q=0;Q<N;Q++)for(let X=0;X<F;X++){let oe=0;for(let J=0;J<8;J++){const ae=X*8+J;if(ae<p.width){const W=(Q*p.width+ae)*4,ce=$[W]*.299+$[W+1]*.587+$[W+2]*.114;$[W+3]>128&&ce<128&&(oe|=1<<7-J)}}I[q++]=oe}const se=new Uint8Array([27,64]),le=new Uint8Array([27,97,1]),de=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await D.write(se),await D.write(le),await D.write(I),await D.write(de),D.releaseLock(),await x.close(),document.getElementById("thermalPreviewModal").style.display="none",showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success")}catch(x){console.error(x),x.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+x.message,"error")}}}catch(m){console.error(m),showCustomAlert("Gagal memuat preview: "+m.message,"error")}},window.printBarcode=()=>{const m=document.getElementById("qrCodeImg").src,y=document.getElementById("detailName").textContent,b=document.getElementById("detailId").textContent.replace("ID: ",""),p=window.open("","_blank");if(!p){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}p.document.write(`
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
            <h3>${y}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${m}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${b}</div>
          </div>
        </body>
      </html>
    `),p.document.close()},document.getElementById("editBtn").onclick=()=>{document.getElementById("detailModal").style.display="none",re(t)},document.getElementById("deleteBtn").onclick=async()=>{if(!confirm("Hapus aset ini?"))return;const m=document.getElementById("deleteBtn"),y=m.innerHTML;m.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Hapus...',m.disabled=!0;try{await K("deleteInventory",{id:t.id}),showCustomAlert("Berhasil dihapus!","success"),document.getElementById("detailModal").style.display="none",O()}catch(b){showCustomAlert(b.message,"error")}finally{m.innerHTML=y,m.disabled=!1}}};function Ie(){window.isAllSelected=!1;const e=document.querySelector("#btnSelectAll i");e&&(e.className="fa-regular fa-square-check");const t=document.getElementById("btnSelectAll");t&&t.classList.remove("active")}window.isAllSelected=!1;window.toggleSelectAll=function(){const e=document.querySelectorAll(".bulk-qr-checkbox");if(e.length===0)return;window.isAllSelected=!window.isAllSelected;const t=document.querySelector("#btnSelectAll i");window.isAllSelected?(e.forEach(a=>a.checked=!0),t&&(t.className="fa-solid fa-square-check"),document.getElementById("btnSelectAll").classList.add("active")):(e.forEach(a=>a.checked=!1),t&&(t.className="fa-regular fa-square-check"),document.getElementById("btnSelectAll").classList.remove("active")),window.toggleBulkPrintButton()};window.toggleBulkPrintButton=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked"),t=document.getElementById("bulkPrintContainer"),a=document.getElementById("bulkPrintCount");e.length>0?(a.textContent=e.length+" Dipilih",t.style.display="block"):t.style.display="none"};window.printSelectedQRs=function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;const t=Array.from(e).map(o=>o.value),a=B.filter(o=>t.includes(o.id)),n=window.open("","_blank");if(!n){showCustomAlert("Pop-up diblokir oleh browser Anda. Izinkan pop-up untuk pisgahbisdac.app agar dapat mencetak.","error");return}let i=`
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
  `;a.forEach(o=>{const r=window.location.origin+window.location.pathname+"?id="+o.id,u=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(r)}`,s=o.id.replace("ID: ","");i+=`
          <div class="label-box">
            <h3>${o.name}</h3>
            <div class="qr-wrapper">
              <img class="qr" src="${u}">
              <img class="logo" src="${window.location.origin}/icons/PisgahColor.png">
            </div>
            <div class="id-text">${s}</div>
          </div>
    `}),i+=`
        </div>
      </body>
    </html>
  `,n.document.write(i),n.document.close(),e.forEach(o=>o.checked=!1),window.toggleBulkPrintButton()};window.printSelectedThermal=async function(){const e=document.querySelectorAll(".bulk-qr-checkbox:checked");if(e.length===0)return;if(!("serial"in navigator))return showCustomAlert("Browser Anda tidak mendukung Direct Print (Web Serial). Gunakan Google Chrome/Edge di PC.","error");const t=Array.from(e).map(n=>n.value),a=B.filter(n=>t.includes(n.id));try{const n=await navigator.serial.requestPort();await n.open({baudRate:9600});const i=n.writable.getWriter();showCustomAlert("Menghubungkan ke printer dan memulai cetak...","success");const o=new Uint8Array([27,64]),r=new Uint8Array([27,97,1]),u=new Uint8Array([27,74,48]);await i.write(o),await i.write(r);for(let d=0;d<a.length;d++){const g=a[d],l=await Be(g);await i.write(l),await i.write(u)}const s=new Uint8Array([10,10,10,10,10,10,10,10,10,10]);await i.write(s),i.releaseLock(),await n.close(),showCustomAlert("Berhasil dicetak langsung ke printer thermal!","success"),e.forEach(d=>d.checked=!1),window.toggleBulkPrintButton()}catch(n){console.error(n),n.name!=="NotFoundError"&&showCustomAlert("Gagal print: "+n.message,"error")}};async function Be(e){const t=e.name||"",a=e.id.replace("ID: ",""),n=window.location.origin+window.location.pathname+"?id="+e.id,i=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(n)}`,o=document.createElement("canvas");o.width=384,o.height=520;const r=o.getContext("2d"),u=o.width/2;r.fillStyle="#ffffff",r.fillRect(0,0,o.width,o.height);const s=20,d=12,g=12,l=o.width-24,f=o.height-24;r.strokeStyle="#000000",r.lineWidth=5,r.beginPath(),r.moveTo(d+s,g),r.lineTo(d+l-s,g),r.quadraticCurveTo(d+l,g,d+l,g+s),r.lineTo(d+l,g+f-s),r.quadraticCurveTo(d+l,g+f,d+l-s,g+f),r.lineTo(d+s,g+f),r.quadraticCurveTo(d,g+f,d,g+f-s),r.lineTo(d,g+s),r.quadraticCurveTo(d,g,d+s,g),r.closePath(),r.stroke(),r.fillStyle="#000000",r.textAlign="center",r.textBaseline="top",r.font="bold 26px monospace";let m=t.toUpperCase();if(m.length<=24)r.fillText(m,u,45);else{let h=m.lastIndexOf(" ",24);h===-1&&(h=22);let k=m.substring(0,h),E=m.substring(h).trim();E.length>24&&(E=E.substring(0,21)+"..."),r.fillText(k,u,30),r.fillText(E,u,60)}const y=new Image;y.crossOrigin="Anonymous",await new Promise(h=>{y.onload=h,y.onerror=h,y.src=i});const b=300;r.drawImage(y,u-b/2,95,b,b);const p=new Image;if(p.crossOrigin="Anonymous",await new Promise(h=>{p.onload=h,p.onerror=h,p.src=window.location.origin+"/icons/PisgahColor.png"}),p.complete&&p.naturalWidth>0){const k=u,E=95+b/2,A=document.createElement("canvas");A.width=80,A.height=80;const C=A.getContext("2d");C.drawImage(p,0,0,80,80);const M=C.getImageData(0,0,80,80),L=M.data;for(let P=0;P<L.length;P+=4)L[P+3]>20&&(L[P]=0,L[P+1]=0,L[P+2]=0,L[P+3]=255);C.putImageData(M,0,0),r.fillStyle="#ffffff",r.beginPath(),r.arc(k,E,80/2+8,0,Math.PI*2),r.fill(),r.drawImage(A,k-80/2,E-80/2,80,80)}r.fillStyle="#000000",r.font="bold 28px monospace",r.fillText(a,u,420),r.strokeStyle="#cccccc",r.lineWidth=1,r.beginPath(),r.moveTo(60,460),r.lineTo(o.width-60,460),r.stroke(),r.fillStyle="#888888",r.font="20px monospace",r.fillText("PISGAH-BISDAC",u,472);const _=r.getImageData(0,0,o.width,o.height).data,S=Math.ceil(o.width/8),v=o.height,w=new Uint8Array(8+S*v);w[0]=29,w[1]=118,w[2]=48,w[3]=0,w[4]=S&255,w[5]=S>>8&255,w[6]=v&255,w[7]=v>>8&255;let z=8;for(let h=0;h<v;h++)for(let k=0;k<S;k++){let E=0;for(let A=0;A<8;A++){const C=k*8+A;if(C<o.width){const M=(h*o.width+C)*4,L=_[M]*.299+_[M+1]*.587+_[M+2]*.114;_[M+3]>128&&L<128&&(E|=1<<7-A)}}w[z++]=E}return w}window.closeFormModal=function(){document.getElementById("formModal").style.display="none"};function re(e=null){document.getElementById("formModal").style.display="flex";const t=document.getElementById("photoPreview");if(t.style.display="none",document.getElementById("formPhoto").value="",window.currentPhotoBase64="",e){document.getElementById("formTitle").textContent="Edit Aset",document.getElementById("formId").value=e.id,document.getElementById("formName").value=e.name,document.getElementById("formDate").value=e.date_acquired?e.date_acquired.substring(0,10):"",document.getElementById("formValue").value=e.value?T(e.value):"",document.getElementById("formLocation").value=e.location,document.getElementById("formCategory").value=e.category||"",document.getElementById("formSource").value=e.source||"",document.getElementById("formTaksasi").value=e.taksasi||"",document.getElementById("formPic").value=e.pic,document.getElementById("formQty").value=e.qty||1,document.getElementById("formUnit").value=e.unit||"Unit",document.getElementById("formSubItems").value=e.sub_items||"",document.getElementById("formStatus").value=e.status||"Active",document.getElementById("formDisposeReason").value=e.dispose_reason||"",document.getElementById("formDisposePrice").value=e.dispose_price||"",document.getElementById("formDepreciationYears").value=e.depreciation_years||"",document.getElementById("disposeFields").style.display=e.status==="Disposed"?"block":"none";const a=[];e.photo&&a.push(e.photo),e.pic2&&a.push(e.pic2),e.pic3&&a.push(e.pic3),e.pic4&&a.push(e.pic4),a.length>0&&(window.currentPhotosBase64=[...a],window.renderPhotoPreview())}else document.getElementById("formTitle").textContent="Tambah Aset Baru",document.getElementById("formId").value="",document.getElementById("formName").value="",document.getElementById("formDate").value="",document.getElementById("formValue").value="",document.getElementById("formLocation").value="",document.getElementById("formCategory").value="",document.getElementById("formSource").value="",document.getElementById("formTaksasi").value="",document.getElementById("formPic").value="",document.getElementById("formQty").value="1",document.getElementById("formUnit").value="Buah",document.getElementById("formSubItems").value="",document.getElementById("formStatus").value="Active",document.getElementById("formDisposeReason").value="",document.getElementById("formDisposePrice").value="",document.getElementById("formDepreciationYears").value="",document.getElementById("disposeFields").style.display="none"}document.getElementById("formPhoto").addEventListener("change",function(e){const t=e.target.files;if(!t||t.length===0)return;t.length>4&&showCustomAlert("Maksimal 4 gambar diperbolehkan. Hanya 4 gambar pertama yang akan diproses.","warning"),window.currentPhotosBase64=[];const a=document.getElementById("photoPreview");a.innerHTML="",a.style.display="flex",Array.from(t).slice(0,4).forEach(i=>{const o=new FileReader;o.onload=function(r){const u=new Image;u.onload=function(){const s=document.createElement("canvas"),d=800,g=800;let l=u.width,f=u.height;l>f?l>d&&(f*=d/l,l=d):f>g&&(l*=g/f,f=g),s.width=l,s.height=f,s.getContext("2d").drawImage(u,0,0,l,f);const y=s.toDataURL("image/webp",.7);window.currentPhotosBase64.push(y),window.renderPhotoPreview()},u.src=r.target.result},o.readAsDataURL(i)})});window.renderPhotoPreview=function(){const e=document.getElementById("photoPreview");if(e.innerHTML="",!window.currentPhotosBase64||window.currentPhotosBase64.length===0){e.style.display="none";return}e.style.display="flex",window.currentPhotosBase64.forEach((t,a)=>{const n=document.createElement("div");n.style.position="relative",n.style.display="inline-block";const i=document.createElement("img");i.src=t,i.style.width="80px",i.style.height="80px",i.style.objectFit="cover",i.style.borderRadius="8px",i.style.border="1px solid var(--glass-border)",i.style.flexShrink="0";const o=document.createElement("button");o.innerHTML='<i class="fa-solid fa-xmark"></i>',o.style.position="absolute",o.style.top="-5px",o.style.right="-5px",o.style.background="#ef4444",o.style.color="white",o.style.border="none",o.style.borderRadius="50%",o.style.width="20px",o.style.height="20px",o.style.cursor="pointer",o.style.display="flex",o.style.alignItems="center",o.style.justifyContent="center",o.style.fontSize="12px",o.onclick=r=>{r.preventDefault(),window.currentPhotosBase64.splice(a,1),window.renderPhotoPreview()},n.appendChild(i),n.appendChild(o),e.appendChild(n)})};window.showCustomAlert=function(e,t="success"){const a=document.getElementById("customAlertModal"),n=document.getElementById("alertTitle"),i=document.getElementById("alertMessage"),o=document.getElementById("alertIcon");i.textContent=e,t==="error"?(n.textContent="Gagal",n.style.color="#ef4444",o.innerHTML='<i class="fa-solid fa-circle-exclamation"></i>',o.style.color="#ef4444"):t==="warning"?(n.textContent="Perhatian",n.style.color="#d4af37",o.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i>',o.style.color="#d4af37"):(n.textContent="Berhasil",n.style.color="var(--accent)",o.innerHTML='<i class="fa-solid fa-circle-check"></i>',o.style.color="var(--accent)"),a.style.display="flex"};function ee(e){let t=e.target.value.replace(/[^0-9]/g,"");t?e.target.value=new Intl.NumberFormat("id-ID").format(t):e.target.value=""}document.addEventListener("DOMContentLoaded",()=>{window.currentViewMode==="list"?(document.getElementById("btnViewList").classList.add("active"),document.getElementById("btnViewGrid").classList.remove("active")):(document.getElementById("btnViewGrid").classList.add("active"),document.getElementById("btnViewList").classList.remove("active")),Z(),ie().then(()=>O()),setInterval(()=>{const e=document.getElementById("liveDateTime");if(e){const t=new Date,a={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"};e.textContent=t.toLocaleDateString("id-ID",a).replace("pukul","").trim()}},1e3),document.getElementById("formValue").addEventListener("input",ee),document.getElementById("formTaksasi").addEventListener("input",ee),document.getElementById("formDisposePrice").addEventListener("input",ee),document.getElementById("loginBtn").addEventListener("click",()=>{document.getElementById("loginModal").style.display="flex"}),document.getElementById("doLoginBtn").addEventListener("click",async()=>{const e=document.getElementById("loginUsername").value,t=document.getElementById("loginPassword").value;if(!e||!t)return showCustomAlert("Isi username dan password","error");const a=document.getElementById("doLoginBtn");a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...',a.disabled=!0;try{const n=await ne("login",{username:e,password:t});if(n.token){localStorage.setItem("BISDAC_token",n.token);const i=n.role||n.user&&n.user.role||"",o=n.nama||n.user&&n.user.nama||n.user&&n.user.name||"";localStorage.setItem("BISDAC_role",i),localStorage.setItem("BISDAC_name",o)}}catch(n){showCustomAlert(n.message,"error")}finally{a.innerHTML="Masuk",a.disabled=!1,document.getElementById("loginModal").style.display="none",Z(),H&&O()}}),document.getElementById("backupBtn").addEventListener("click",()=>{document.getElementById("backupModal").style.display="flex"}),document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("logoutModal").style.display="flex"}),document.getElementById("doLogoutBtn").addEventListener("click",()=>{localStorage.removeItem("BISDAC_token"),localStorage.removeItem("BISDAC_role"),localStorage.removeItem("BISDAC_name"),Z(),renderGrid(B),document.getElementById("logoutModal").style.display="none"}),document.getElementById("addBtn").addEventListener("click",()=>{re()}),document.getElementById("saveBtn").addEventListener("click",async()=>{const e=document.getElementById("formName").value,t=document.getElementById("formDate").value,a=document.getElementById("formValue").value.replace(/\./g,""),n=document.getElementById("formLocation").value,i=document.getElementById("formCategory").value,o=document.getElementById("formSource").value,r=document.getElementById("formTaksasi").value.replace(/\./g,""),u=document.getElementById("formPic").value,s=document.getElementById("formId").value,d=document.getElementById("formQty").value,g=document.getElementById("formUnit").value,l=document.getElementById("formSubItems").value,f=document.getElementById("formStatus").value;let m=document.getElementById("formDisposeReason").value,y=document.getElementById("formDisposePrice").value.replace(/\./g,"");if(!e||!n||!u||!i||!o||!d||!g)return showCustomAlert("Mohon lengkapi field wajib (*)","error");if(f==="Disposed"&&!m)return showCustomAlert("Mohon isi Justifikasi / Alasan Disposal","error");const b={isUpdate:!!s,id:s,name:e,date_acquired:t,value:a,location:n,category:i,source:o,taksasi:r,pic:u,qty:d,unit:g,sub_items:l,status:f,dispose_reason:f==="Disposed"?m:"",dispose_price:y,depreciation_years:document.getElementById("formDepreciationYears").value};window.currentPhotosBase64&&window.currentPhotosBase64.length>0?(b.photo=window.currentPhotosBase64[0]||"",b.pic2=window.currentPhotosBase64[1]||"",b.pic3=window.currentPhotosBase64[2]||"",b.pic4=window.currentPhotosBase64[3]||""):b.isUpdate;const p=document.getElementById("saveBtn");p.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',p.disabled=!0;try{await K("saveInventory",b),showCustomAlert("Berhasil disimpan!","success"),closeFormModal(),O()}catch(c){showCustomAlert(c.message,"error")}finally{p.innerHTML="Simpan Data",p.disabled=!1}}),document.getElementById("searchInput").addEventListener("input",()=>{window.renderGrid()})});window.exportCSV=function(){if(!B||B.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");const e=["ID","TANGGAL_PEROLEHAN","NAMA_ASET","KATEGORI","ASAL_BARANG","NILAI_PEROLEHAN","MARKET_VALUE","QTY","SATUAN","LOKASI","PENANGGUNG_JAWAB","STATUS","JUSTIFIKASI_DISPOSAL","HARGA_DISPOSAL","RINCIAN"],t=B.map(r=>[r.id,Y(r.date_acquired)||"",`"${(r.name||"").replace(/"/g,'""')}"`,`"${(r.category||"").replace(/"/g,'""')}"`,`"${(r.source||"").replace(/"/g,'""')}"`,r.value||0,r.taksasi||0,r.qty||1,r.unit||"Unit",`"${(r.location||"").replace(/"/g,'""')}"`,`"${(r.pic||"").replace(/"/g,'""')}"`,r.status||"Active",r.status==="Disposed"?`"${(r.dispose_reason||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`:'""',r.status==="Disposed"?r.dispose_price||0:'""',`"${(r.sub_items||"").replace(/"/g,'""').replace(/\n/g," ; ")}"`].join(",")),a=e.join(",")+`
`+t.join(`
`),n=new Blob([a],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(n),o=document.createElement("a");o.setAttribute("href",i),o.setAttribute("download",`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(o),o.click(),document.body.removeChild(o),document.getElementById("backupModal").style.display="none"};window.exportPDF=function(){if(!B||B.length===0)return showCustomAlert("Tidak ada data untuk di-backup.","error");document.getElementById("backupModal").style.display="none",showCustomAlert("Sedang menyiapkan PDF. Mohon tunggu beberapa detik...","success");const e=document.createElement("div");e.style.padding="20px",e.style.fontFamily="Arial, sans-serif",e.style.color="#333",e.style.background="#fff";let t=`
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
  `;B.forEach(n=>{const i=n.photo?n.photo:"/icons/PisgahLogoColor.png",o=n.status==="Disposed"?`<span style="color:red; font-weight:bold;">Disposed</span><br><span style="font-size:8px;">${n.dispose_reason||""}</span>`:'<span style="color:green; font-weight:bold;">Active</span>';t+=`
        <tr style="page-break-inside: avoid;">
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <img src="${i}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
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
            ${o}<br>
            ${n.qty||1} ${n.unit||"Unit"}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            Awal: ${T(n.value||0)}<br>
            <span style="color:#666;">Market Value: ${T(n.taksasi||0)}</span>
          </td>
        </tr>
    `}),t+=`
      </tbody>
    </table>
  `,e.innerHTML=t;const a={margin:10,filename:`Backup_Inventaris_PISGAH_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};html2pdf().set(a).from(e).save().then(()=>{document.getElementById("customAlertModal").style.display="none"})};window.openLoanModal=function(){if(!window.currentDetailId)return;const e=B.find(a=>a.id===window.currentDetailId);if(!e)return;document.getElementById("formLoanStatus").value=e.loan_status||"Tersedia",document.getElementById("formLoanBorrower").value=e.borrowed_by||"",e.borrow_date?document.getElementById("formLoanDate").value=new Date(e.borrow_date).toISOString().split("T")[0]:document.getElementById("formLoanDate").value=new Date().toISOString().split("T")[0],e.expected_return_date?document.getElementById("formLoanReturnDate").value=new Date(e.expected_return_date).toISOString().split("T")[0]:document.getElementById("formLoanReturnDate").value="";const t=document.getElementById("loanDetailsFields");t.style.display=e.loan_status==="Dipinjam"?"block":"none",document.getElementById("loanModal").style.display="flex"};document.getElementById("saveLoanBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=B.find(u=>u.id===window.currentDetailId);if(!e)return;const t=document.getElementById("formLoanStatus").value,a=document.getElementById("formLoanBorrower").value,n=document.getElementById("formLoanDate").value,i=document.getElementById("formLoanReturnDate").value;if(t==="Dipinjam"&&(!a||!n||!i))return showCustomAlert("Mohon lengkapi data peminjam dan tanggalnya!","error");const o={isUpdate:!0,id:e.id,loan_status:t,borrowed_by:t==="Dipinjam"?a:"",borrow_date:t==="Dipinjam"?n:"",expected_return_date:t==="Dipinjam"?i:""},r=document.getElementById("saveLoanBtn");r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',r.disabled=!0;try{await K("saveInventory",o),showCustomAlert("Status Peminjaman berhasil diperbarui!","success"),document.getElementById("loanModal").style.display="none",O()}catch(u){showCustomAlert(u.message,"error")}finally{r.innerHTML="Simpan Status",r.disabled=!1}};window.openServiceModal=function(){window.currentDetailId&&(document.getElementById("formServiceDate").value=new Date().toISOString().split("T")[0],document.getElementById("formServiceDesc").value="",document.getElementById("formServiceCost").value="",document.getElementById("serviceModal").style.display="flex")};document.getElementById("saveServiceBtn").onclick=async()=>{if(!window.currentDetailId)return;const e=document.getElementById("formServiceDate").value,t=document.getElementById("formServiceDesc").value,a=document.getElementById("formServiceCost").value;if(!e||!t)return showCustomAlert("Tanggal dan Keterangan wajib diisi!","error");const n={inventory_id:window.currentDetailId,service_date:e,description:t,cost:a},i=document.getElementById("saveServiceBtn");i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...',i.disabled=!0;try{await K("saveInventoryService",n),showCustomAlert("Riwayat servis berhasil dicatat!","success"),document.getElementById("serviceModal").style.display="none",loadServiceHistory(window.currentDetailId)}catch(o){showCustomAlert(o.message,"error")}finally{i.innerHTML="Simpan Riwayat",i.disabled=!1}};window.loadServiceHistory=async function(e){const t=document.getElementById("serviceHistoryContainer");t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat...</div>';try{const a=await ne("getInventoryService",{inventory_id:e});if(!a.success)throw new Error(a.message);const n=a.data;if(!n||n.length===0){t.innerHTML='<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:15px; background:rgba(0,0,0,0.02); border-radius:8px;">Belum ada riwayat servis.</div>';return}n.sort((i,o)=>new Date(o.service_date)-new Date(i.service_date)),t.innerHTML=n.map(i=>`
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--text-dark); font-size:0.9rem;"><i class="fa-solid fa-calendar-day" style="color:var(--text-muted); margin-right:5px;"></i> ${Y(i.service_date)}</strong>
          <span style="color:#ef4444; font-weight:bold; font-size:0.9rem;">Rp ${T(i.cost||0)}</span>
        </div>
        <div style="color:var(--text-dark); font-size:0.9rem; line-height:1.4;">${i.description}</div>
        <div style="color:var(--text-muted); font-size:0.75rem; text-align:right;">Dicatat oleh: ${i.created_by}</div>
      </div>
    `).join("")}catch(a){t.innerHTML=`<div style="text-align:center; color:#ef4444; font-size:0.9rem; padding:15px;">Gagal memuat: ${a.message}</div>`}};window.showDepreciationReport=function(){const e=document.getElementById("depreciationTableBody");e.innerHTML="";let t=0,a=0;new Date().getFullYear();const n=new Date;B.forEach(i=>{if(i.status==="Disposed"||!i.value)return;const o=parseFloat(i.value)||0,r=parseInt(i.depreciation_years)||0;let u=o,s="-";if(r>0&&i.date_acquired){const g=new Date(i.date_acquired);let f=((n.getFullYear()-g.getFullYear())*12+(n.getMonth()-g.getMonth()))/12;f<0&&(f=0),s=f.toFixed(1)+" Tahun";let m=o-o*(f/r);m<0&&(m=0),u=m}t+=o,a+=u;const d=document.createElement("tr");d.style.borderBottom="1px solid var(--border-light)",d.innerHTML=`
      <td style="padding:12px; color:var(--text-dark);">
        <strong>${i.name}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">${i.id}</span>
      </td>
      <td style="padding:12px; color:var(--text-muted);">${Y(i.date_acquired)}</td>
      <td style="padding:12px; text-align:right; color:var(--text-dark);">Rp ${T(o)}</td>
      <td style="padding:12px; text-align:center; color:var(--text-dark);">${r>0?r:"-"}</td>
      <td style="padding:12px; text-align:center; color:var(--text-muted);">${s}</td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:${u===0?"#ef4444":"#22c55e"};">Rp ${T(u)}</td>
    `,e.appendChild(d)}),document.getElementById("depTotalAwal").textContent="Rp "+T(t),document.getElementById("depTotalBuku").textContent="Rp "+T(a),document.getElementById("depreciationModal").style.display="flex"};window.printDepreciation=function(){const e=document.querySelector("#depreciationModal .inv-modal-content").cloneNode(!0);e.querySelectorAll("button").forEach(i=>i.remove());const a=document.createElement("div");a.innerHTML=`
    <h2 style="text-align:center; margin-bottom:5px;">LAPORAN PENYUSUTAN NILAI ASET (DEPRESIASI)</h2>
    <p style="text-align:center; margin-top:0; margin-bottom:20px;">Gereja PISGAH-BISDAC | Tanggal Cetak: ${new Date().toLocaleString("id-ID")}</p>
  `,e.insertBefore(a,e.firstChild),e.style.padding="20px",e.style.background="#fff",e.style.color="#000";const n=window.open("","_blank","width=1000,height=700");if(!n){showCustomAlert("Browser memblokir popup. Tolong izinkan popup untuk mencetak.","error");return}n.document.write(`
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
  `),n.document.close(),n.focus(),setTimeout(()=>{n.print()},250)};
