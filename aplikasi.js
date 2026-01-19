// --- CONFIGURATION ---
const SB_URL = "https://kicwwytoteuuzfhbwpav.supabase.co"; 
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY3d3eXRvdGV1dXpmaGJ3cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDgwNDAsImV4cCI6MjA4NDAyNDA0MH0.CCH9XBSukHPk2xRJ6o6rCUYh59J8ToEkcN6OJ_kTIis";

let supabaseClient;
try {
    supabaseClient = supabase.createClient(SB_URL, SB_KEY);
} catch (e) {
    console.error("Gagal inisialisasi Supabase.", e);
}

let currentTab = 'marketing';
let isAdmin = false;
let allAssets = [];

// --- CORE FUNCTIONS ---
async function fetchAssets() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '<p class="text-center col-span-full py-10 text-gray-400 animate-pulse">Memuat materi...</p>';

    const { data, error } = await supabaseClient
        .from('assets')
        .select('*')
        .eq('category', currentTab)
        .order('id', { ascending: false });

    if (error) {
        gallery.innerHTML = `<p class="text-center col-span-full text-red-500">Error: ${error.message}</p>`;
        return;
    }

    allAssets = data;
    renderGallery(allAssets);
}

function renderGallery(items) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    if (items.length === 0) {
        gallery.innerHTML = `<p class="text-center col-span-full py-10 text-gray-400 italic">Konten tidak ditemukan.</p>`;
        return;
    }

    items.forEach(item => {
        const programTitle = item.program_title || 'Program Ramadhan';
        const programDate = item.program_date || '';
        
        // 🆕 CONDITIONAL RENDERING: Marketing Kit vs Reminder Kit
        if (currentTab === 'reminder') {
            // REMINDER KIT - Hanya Judul & Caption (Tanpa Gambar)
// REMINDER KIT - Hanya Judul & Caption (Tanpa Gambar)
gallery.innerHTML += `
    <div class="reminder-card bg-white rounded-2xl p-4 sm:p-5 animate-fadeIn hover:shadow-xl transition-all duration-300">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
                <h3 class="text-orange-600 font-bold text-base sm:text-lg mb-1">${programTitle}</h3>
                ${programDate ? `<span class="badge-date">${programDate}</span>` : ''}
            </div>
            <div class="text-3xl">📋</div>
        </div>
        
        <!-- Caption Content dengan Read More -->
        <div class="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200 mb-4">
            <div id="caption-box-${item.id}" class="caption-box">
                <p id="cap-${item.id}" class="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">${item.caption}</p>
            </div>
            <span id="read-more-${item.id}" class="read-more-btn" onclick="toggleCaption(${item.id})">
                <span id="read-more-text-${item.id}">Selengkapnya</span>
                <i data-lucide="chevron-down" class="w-4 h-4" id="read-more-icon-${item.id}"></i>
            </span>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2">
            <button onclick="copyText('cap-${item.id}')" 
                    class="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold text-sm transition-all shadow-md hover:shadow-lg">
                <i data-lucide="copy" class="w-4 h-4"></i> 
                <span>Salin Caption</span>
            </button>
            
            <!-- Admin Buttons -->
            <div class="flex gap-1 ${!isAdmin ? 'hidden' : ''}">
                <button onclick="editMode(${item.id})"
                        class="bg-amber-50 text-amber-600 p-3 rounded-lg hover:bg-amber-100 border border-amber-200">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteData(${item.id})" 
                        class="bg-red-50 text-red-500 p-3 rounded-lg hover:bg-red-100 border border-red-200">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    </div>
`;
        } else {
            // MARKETING KIT - Dengan Gambar (Original)
            gallery.innerHTML += `
                <div class="program-card animate-fadeIn">
                    <!-- Header Program -->
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-3 sm:p-4">
                        <h3 class="text-white font-bold text-sm sm:text-base mb-1">${programTitle}</h3>
                        ${programDate ? `<span class="badge-date">${programDate}</span>` : ''}
                    </div>

                    <!-- Image -->
                    <div class="relative overflow-hidden bg-gray-100">
                        <img src="${item.image_url}" 
                             loading="lazy" 
                             class="w-full h-auto object-cover hover:scale-105 transition duration-500" 
                             onerror="this.src='https://placehold.co/600x400?text=Gambar+Rusak'">
                    </div>

                    <!-- Content -->
                    <div class="p-3 sm:p-4 flex flex-col">
                        <!-- Caption Box -->
                        <div class="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mb-3 sm:mb-4 h-32 overflow-y-auto">
                            <p id="cap-${item.id}" class="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">${item.caption}</p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button onclick="copyText('cap-${item.id}')" 
                                    class="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-2.5 rounded-lg hover:bg-indigo-100 font-medium text-xs sm:text-sm transition">
                                <i data-lucide="copy" class="w-4 h-4"></i> 
                                <span>Salin Caption</span>
                            </button>

                            <button onclick="downloadImageToGallery('${item.image_url}', '${programTitle.replace(/[^a-zA-Z0-9]/g, '_')}')" 
                                    class="bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                                <i data-lucide="download" class="w-4 h-4"></i>
                                <span>Download</span>
                            </button>

                            <!-- Admin Buttons -->
                            <div class="flex gap-1 ${!isAdmin ? 'hidden' : ''}">
                                <button onclick="editMode(${item.id})"
                                        class="flex-1 sm:flex-initial bg-amber-50 text-amber-600 p-2 rounded-lg hover:bg-amber-100 border border-amber-200">
                                    <i data-lucide="edit-3" class="w-4 h-4 mx-auto"></i>
                                </button>
                                <button onclick="deleteData(${item.id})" 
                                        class="flex-1 sm:flex-initial bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 border border-red-200">
                                    <i data-lucide="trash-2" class="w-4 h-4 mx-auto"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    lucide.createIcons();
}

// --- DOWNLOAD TO GALLERY (FIXED) ---
async function downloadImageToGallery(url, programName) {
    try {
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
        loadingMsg.textContent = 'Mengunduh...';
        document.body.appendChild(loadingMsg);

        const response = await fetch(url);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        
        const timestamp = new Date().getTime();
        a.download = `ramadhan_lmi_${programName}_${timestamp}.jpg`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(loadingMsg);
            
            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
            successMsg.textContent = '✅ Berhasil diunduh!';
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                document.body.removeChild(successMsg);
            }, 2000);
        }, 100);

    } catch (error) {
        console.error('Download error:', error);
        alert('Gagal mengunduh gambar. Coba lagi.');
    }
}

// --- SEARCH & FILTER ---
function handleSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allAssets.filter(item => 
        item.caption.toLowerCase().includes(keyword) ||
        (item.program_title && item.program_title.toLowerCase().includes(keyword)) ||
        (item.program_date && item.program_date.toLowerCase().includes(keyword))
    );
    renderGallery(filtered);
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('btn-marketing').className = `flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base ${tab === 'marketing' ? 'tab-active' : 'text-gray-500'}`;
    document.getElementById('btn-reminder').className = `flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base ${tab === 'reminder' ? 'tab-active' : 'text-gray-500'}`;
    fetchAssets();
}

// --- ADMIN FUNCTIONS ---
function toggleAdmin() {
    const pw = prompt("Password Admin:");
    if (pw === "ramadanqu") {
        isAdmin = !isAdmin;
        document.getElementById('adminPanel').classList.toggle('hidden', !isAdmin);
        fetchAssets();
    }
}

// 🆕 DYNAMIC FORM - Show/Hide Image Input based on Category
function toggleImageInput() {
    const category = document.getElementById('category').value;
    const imageInputSection = document.getElementById('imageInputSection');
    const previewSection = document.getElementById('previewSection');
    
    if (category === 'reminder') {
        imageInputSection.classList.add('hidden');
        previewSection.classList.add('hidden');
    } else {
        imageInputSection.classList.remove('hidden');
        previewSection.classList.remove('hidden');
    }
}

async function uploadToStorage(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabaseClient.storage
        .from('assets') 
        .upload(fileName, file);
    if (error) throw error;
    const { data: publicUrl } = supabaseClient.storage.from('assets').getPublicUrl(fileName);
    return publicUrl.publicUrl;
}

function previewUrl(url) {
    const img = document.getElementById('imgPreview');
    const placeholder = document.getElementById('previewPlaceholder');
    if(url) {
        img.src = url;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
    }
}

function previewFile(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('imgPreview');
            const placeholder = document.getElementById('previewPlaceholder');
            img.src = e.target.result;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
}

async function saveData() {
    const id = document.getElementById('editId').value;
    const fileInput = document.getElementById('fileInput').files[0];
    let image_url = document.getElementById('imgUrl').value;
    const caption = document.getElementById('captionText').value;
    const category = document.getElementById('category').value;
    const program_title = document.getElementById('programTitle').value;
    const program_date = document.getElementById('programDate').value;
    const btn = document.getElementById('btnSave');

    try {
        btn.disabled = true;
        btn.innerText = "Memproses...";

        // Logika upload gambar
        if (category === 'marketing') {
            if (fileInput) {
                image_url = await uploadToStorage(fileInput);
            }
            if (!image_url) throw new Error("Marketing Kit harus memiliki gambar!");
        } else {
            image_url = image_url || 'https://placehold.co/600x400?text=Reminder+Kit';
        }

        if (!caption) throw new Error("Harap isi caption!");

        const payload = { 
            image_url, 
            caption, 
            category,
            program_title: program_title || null,
            program_date: program_date || null
        };
        
        let res;
        if (id) {
            // PERBAIKAN: Konversi ID ke Number agar dikenali database
            res = await supabaseClient.from('assets').update(payload).eq('id', Number(id));
        } else {
            res = await supabaseClient.from('assets').insert([payload]);
        }

        // Cek jika ada error dari Supabase
        if (res.error) throw res.error;

        alert("✅ Berhasil disimpan!");
        resetForm();
        fetchAssets(); // Refresh tampilan gallery
    } catch (err) {
        console.error("Detail Error:", err);
        alert("❌ Gagal menyimpan: " + (err.message || "Periksa koneksi/izin database"));
    } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Konten";
    }
}

function editMode(itemId) {
    // Cari data dari allAssets berdasarkan ID
    const item = allAssets.find(asset => asset.id === itemId);
    
    if (!item) {
        alert('❌ Data tidak ditemukan!');
        return;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('formTitle').innerText = "Update Konten";
    document.getElementById('editId').value = item.id;
    document.getElementById('imgUrl').value = item.image_url || '';
    document.getElementById('captionText').value = item.caption || '';
    document.getElementById('category').value = item.category || 'marketing';
    document.getElementById('programTitle').value = item.program_title || '';
    document.getElementById('programDate').value = item.program_date || '';
    document.getElementById('btnCancel').classList.remove('hidden');
    
    // Toggle image input based on category
    toggleImageInput();
    
    if (item.category === 'marketing' && item.image_url) {
        previewUrl(item.image_url);
    }
}

async function deleteData(id) {
    if(confirm('Hapus konten ini?')) {
        await supabaseClient.from('assets').delete().eq('id', id);
        fetchAssets();
    }
}

function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('imgUrl').value = '';
    document.getElementById('captionText').value = '';
    document.getElementById('programTitle').value = '';
    document.getElementById('programDate').value = '';
    document.getElementById('category').value = 'marketing';
    document.getElementById('imgPreview').classList.add('hidden');
    document.getElementById('previewPlaceholder').classList.remove('hidden');
    document.getElementById('btnCancel').classList.add('hidden');
    document.getElementById('formTitle').innerText = "Tambah Konten Baru";
    
    // Reset image input visibility
    toggleImageInput();
}

function copyText(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    toast.textContent = '✅ Caption tersalin!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

function toggleCaption(id) {
    const box = document.getElementById(`caption-box-${id}`);
    const text = document.getElementById(`read-more-text-${id}`);
    const icon = document.getElementById(`read-more-icon-${id}`);
    
    if (box.classList.contains('expanded')) {
        box.classList.remove('expanded');
        text.textContent = 'Selengkapnya';
        icon.setAttribute('data-lucide', 'chevron-down');
    } else {
        box.classList.add('expanded');
        text.textContent = 'Lebih Sedikit';
        icon.setAttribute('data-lucide', 'chevron-up');
    }
    lucide.createIcons(); // Re-render icons
}

// Initialize
fetchAssets();
