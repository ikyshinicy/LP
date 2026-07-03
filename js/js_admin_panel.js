// ================= UPLOAD FOTO/VIDEO (versi lokal, untuk demo/presentasi) =================
// Catatan: ini menyimpan file langsung sebagai data (base64) di browser,
// jadi TIDAK butuh Cloudflare Worker / server apapun. Cukup untuk presentasi.
function uploadAsset(fileInputId, targetInputId, statusId) {
    const fileInput = document.getElementById(fileInputId);
    const targetInput = document.getElementById(targetInputId);
    const status = document.getElementById(statusId);
    const file = fileInput.files[0];

    if (!file) {
        status.textContent = 'Pilih file dulu.';
        status.style.color = 'var(--danger)';
        return;
    }

    status.textContent = 'Memproses...';
    status.style.color = '#888';

    const reader = new FileReader();
    reader.onload = () => {
        targetInput.value = reader.result; // hasil: data:image/...;base64,...
        status.textContent = '✓ Berhasil dipasang';
        status.style.color = 'var(--success)';
        fileInput.value = '';
    };
    reader.onerror = () => {
        status.textContent = '✗ Gagal membaca file';
        status.style.color = 'var(--danger)';
    };
    reader.readAsDataURL(file);
}

// ================= PANEL SWITCHING (Sidebar) =================
const panelMeta = {
    dashboard: { title: 'Dashboard', desc: 'Ringkasan pengelolaan konten website' },
    hero: { title: 'Hero & Tentang', desc: 'Ubah teks judul utama dan deskripsi tentang toko' },
    produk: { title: 'Kelola Produk', desc: 'Tambah, ubah, atau hapus produk yang tampil di landing page' },
    video: { title: 'Kelola Video', desc: 'Tambah video konten yang tampil otomatis di landing page' }
};

function showPanel(panelId) {
    document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
    const target = document.getElementById('panel-' + panelId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-item[data-panel]').forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector('.nav-item[data-panel="' + panelId + '"]');
    if (activeItem) activeItem.classList.add('active');

    const meta = panelMeta[panelId];
    if (meta) {
        document.getElementById('topbarTitle').textContent = meta.title;
        document.getElementById('topbarDesc').textContent = meta.desc;
    }

    // Refresh data setiap kali panel dibuka
    if (panelId === 'hero' && document.getElementById('sectionSelect')) loadCurrentContent();
    if (panelId === 'produk') renderProductList();
    if (panelId === 'video') renderVideoList();
}

// ================= TEKS HERO / ABOUT =================
const defaultContent = {
    heroTitle: "Spesialis Buket Premium di Kota Sorong",
    heroDesc: "Berikan kejutan tak terlupakan untuk orang terkasih. Kami menghadirkan kreasi buket bunga, uang, dan snack estetik dengan ciri khas Korean Wrapping yang cantik dan elegan.",
    aboutTitle: "Tentang Nami Craft",
    aboutDesc: "Didirikan pada tahun 2019 oleh Ibu Ratna, Nami Craft berawal dari inovasi dan jeli melihat peluang di Kota Sorong. Kami hadir untuk melengkapi momen spesial Anda—mulai dari wisuda, ulang tahun, hingga anniversary. Dengan detail Korean Wrapping yang kekinian, setiap buket dirangkai penuh cinta untuk menyampaikan perasaan Anda kepada sosok yang berharga."
};

function loadCurrentContent() {
    const section = document.getElementById('sectionSelect').value;
    const savedContent = localStorage.getItem('nami_' + section) || defaultContent[section];
    document.getElementById('contentInput').value = savedContent;
}

function saveContent(e) {
    e.preventDefault();
    const section = document.getElementById('sectionSelect').value;
    const newContent = document.getElementById('contentInput').value;
    localStorage.setItem('nami_' + section, newContent);
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}

// ================= HELPER: baca/tulis array JSON di localStorage =================
function getArray(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}
function setArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ================= KELOLA PRODUK =================
function renderProductList() {
    const list = document.getElementById('productList');
    if (!list) return;
    const products = getArray('nami_products');
    if (products.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); font-size: 0.9rem;">Belum ada produk custom. Landing page akan menampilkan 3 produk default.</p>';
        return;
    }
    list.innerHTML = products.map(p => `
        <div style="display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
            <img src="${escapeHtml(p.image)}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" onerror="this.style.opacity=0.3">
            <div style="flex:1;">
                <strong style="font-size:0.9rem;">${escapeHtml(p.name)}</strong>
                <div style="font-size:0.8rem; color:var(--primary-color);">${escapeHtml(p.price)}</div>
            </div>
            <button type="button" class="btn" style="background:#eee; padding:6px 12px; font-size:0.8rem;" onclick="editProduct('${p.id}')"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn" style="background:#fde8e8; color:var(--danger); padding:6px 12px; font-size:0.8rem;" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function saveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById('prodEditId').value;
    const products = getArray('nami_products');
    const data = {
        name: document.getElementById('prodName').value,
        desc: document.getElementById('prodDesc').value,
        price: document.getElementById('prodPrice').value,
        image: document.getElementById('prodImage').value
    };
    if (editId) {
        const idx = products.findIndex(p => p.id === editId);
        if (idx > -1) products[idx] = { id: editId, ...data };
    } else {
        products.push({ id: generateId(), ...data });
    }
    setArray('nami_products', products);
    resetProductForm();
    renderProductList();
}

function editProduct(id) {
    const p = getArray('nami_products').find(p => p.id === id);
    if (!p) return;
    document.getElementById('prodEditId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodDesc').value = p.desc;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodImage').value = p.image;
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteProduct(id) {
    if (!confirm('Hapus produk ini?')) return;
    setArray('nami_products', getArray('nami_products').filter(p => p.id !== id));
    renderProductList();
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('prodEditId').value = '';
}

// ================= KELOLA VIDEO =================
function renderVideoList() {
    const list = document.getElementById('videoList');
    if (!list) return;
    const videos = getArray('nami_videos');
    if (videos.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); font-size: 0.9rem;">Belum ada video. Section "Konten Kami" akan otomatis disembunyikan di landing page.</p>';
        return;
    }
    list.innerHTML = videos.map(v => `
        <div style="display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
            <div style="width:50px; height:50px; background:#333; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff;"><i class="fas fa-play"></i></div>
            <div style="flex:1; min-width:0;">
                <strong style="font-size:0.85rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(v.caption || v.url)}</strong>
            </div>
            <button type="button" class="btn" style="background:#eee; padding:6px 12px; font-size:0.8rem;" onclick="editVideo('${v.id}')"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn" style="background:#fde8e8; color:var(--danger); padding:6px 12px; font-size:0.8rem;" onclick="deleteVideo('${v.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function saveVideo(e) {
    e.preventDefault();
    const editId = document.getElementById('vidEditId').value;
    const videos = getArray('nami_videos');
    const data = {
        url: document.getElementById('vidUrl').value,
        caption: document.getElementById('vidCaption').value
    };
    if (editId) {
        const idx = videos.findIndex(v => v.id === editId);
        if (idx > -1) videos[idx] = { id: editId, ...data };
    } else {
        videos.push({ id: generateId(), ...data });
    }
    setArray('nami_videos', videos);
    resetVideoForm();
    renderVideoList();
}

function editVideo(id) {
    const v = getArray('nami_videos').find(v => v.id === id);
    if (!v) return;
    document.getElementById('vidEditId').value = v.id;
    document.getElementById('vidUrl').value = v.url;
    document.getElementById('vidCaption').value = v.caption || '';
    document.getElementById('videoForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteVideo(id) {
    if (!confirm('Hapus video ini?')) return;
    setArray('nami_videos', getArray('nami_videos').filter(v => v.id !== id));
    renderVideoList();
}

function resetVideoForm() {
    document.getElementById('videoForm').reset();
    document.getElementById('vidEditId').value = '';
}

// ================= INISIALISASI SAAT HALAMAN ADMIN DIMUAT =================
window.onload = function () {
    showPanel('dashboard'); // panel default saat admin login
};
