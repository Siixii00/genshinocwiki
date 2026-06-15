const GalleryData = {
    STORAGE_KEY: 'genshin_gallery',
    useApi: true,
    cachedGallery: null,
    
    defaultItems: [
        {
            id: '1',
            title: '原神 5.0 版本前瞻',
            type: 'video',
            url: 'https://www.youtube.com/embed/example',
            category: 'pv',
            description: '5.0版本前瞻直播',
            date: '2024-08-15'
        }
    ],
    
    async init() {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            try {
                this.cachedGallery = await ApiClient.getGallery();
            } catch (e) {
                console.warn('Gallery API unavailable, using localStorage');
                this.useApi = false;
                this.initLocalStorage();
            }
        } else {
            this.initLocalStorage();
        }
    },
    
    initLocalStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.saveAllLocal(this.defaultItems);
        }
    },
    
    getAllLocal() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading gallery data:', e);
            return [];
        }
    },
    
    async getAll() {
        if (this.useApi) {
            return this.cachedGallery || await ApiClient.getGallery();
        }
        return this.getAllLocal();
    },
    
    async getById(id) {
        const items = await this.getAll();
        return items.find(item => item.id === id) || null;
    },
    
    saveAllLocal(items) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
            return true;
        } catch (e) {
            console.error('Error saving gallery data:', e);
            return false;
        }
    },
    
    async add(item) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const added = await ApiClient.addGalleryItem(item);
            if (added) {
                this.cachedGallery = await ApiClient.getGallery();
            }
            return added;
        }
        
        const items = this.getAllLocal();
        item.id = Date.now().toString();
        items.unshift(item);
        return this.saveAllLocal(items) ? item : null;
    },
    
    async update(id, updates) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const updated = await ApiClient.updateGalleryItem(id, updates);
            if (updated) {
                this.cachedGallery = await ApiClient.getGallery();
            }
            return updated;
        }
        
        const items = this.getAllLocal();
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        items[index] = { ...items[index], ...updates };
        return this.saveAllLocal(items) ? items[index] : null;
    },
    
    async delete(id) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const result = await ApiClient.deleteGalleryItem(id);
            if (result.success) {
                this.cachedGallery = await ApiClient.getGallery();
            }
            return result.success;
        }
        
        const items = this.getAllLocal();
        const filtered = items.filter(item => item.id !== id);
        return this.saveAllLocal(filtered);
    },
    
    async filter(filters = {}) {
        let items = await this.getAll();
        
        if (filters.category && filters.category !== 'all') {
            items = items.filter(item => item.category === filters.category);
        }
        
        if (filters.type && filters.type !== 'all') {
            items = items.filter(item => item.type === filters.type);
        }
        
        return items;
    },
    
    getCategoryName(category) {
        const names = {
            official: '官方活動',
            festival: '節日賀圖',
            pv: '宣傳PV',
            wallpaper: '桌布',
            other: '其他'
        };
        return names[category] || category;
    }
};

const GalleryUI = {
    getVideoThumbnail(url) {
        if (!url) return null;
        
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
        }
        
        const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
        if (bilibiliMatch) {
            return null;
        }
        
        return null;
    },
    
    extractYouTubeId(url) {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    },
    
    renderItem(item) {
        const categoryLabel = GalleryData.getCategoryName(item.category);
        const videoUrl = item.videoUrl || item.url;
        
        let mediaHtml;
        if (item.type === 'video') {
            const youtubeId = this.extractYouTubeId(videoUrl);
            if (youtubeId) {
                mediaHtml = `
                    <div class="video-thumbnail" style="background-image: url('https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg')">
                        <div class="video-play-overlay">
                            <span class="play-icon">▶</span>
                        </div>
                    </div>
                `;
            } else {
                mediaHtml = `
                    <div class="video-placeholder">
                        <span class="play-icon">▶</span>
                        <span class="video-title">${item.title}</span>
                    </div>
                `;
            }
        } else {
            mediaHtml = `<img src="${item.url}" alt="${item.title}" onerror="this.parentElement.innerHTML='<div class=\\'video-placeholder\\'><span>圖片載入失敗</span></div>'">`;
        }
        
        return `
            <article class="gallery-card" data-id="${item.id}" data-type="${item.type}">
                <div class="gallery-card-media">
                    ${mediaHtml}
                </div>
                <div class="gallery-card-info">
                    <h3 class="gallery-card-title">${item.title}</h3>
                    <div class="gallery-card-meta">
                        <span class="gallery-card-category">${categoryLabel}</span>
                        <span class="gallery-card-type ${item.type}">${item.type === 'video' ? '影片' : '圖片'}</span>
                    </div>
                </div>
            </article>
        `;
    },
    
    renderGrid(items) {
        const grid = document.getElementById('gallery-grid');
        
        if (!grid) return;
        
        if (items.length === 0) {
            grid.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-gallery-icon">📷</div>
                    <p>尚無媒體內容</p>
                </div>
            `;
        } else {
            grid.innerHTML = items.map(item => this.renderItem(item)).join('');
        }
    },
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    showPreview(item) {
        console.log('showPreview item:', item);
        
        const container = document.getElementById('preview-container');
        const title = document.getElementById('preview-title');
        const description = document.getElementById('preview-description');
        
        if (!container) return;
        
        title.textContent = item.title;
        description.textContent = item.description || '';
        
        if (item.type === 'video') {
            const videoUrl = item.videoUrl || item.url;
            console.log('videoUrl:', videoUrl);
            
            const embedUrl = this.getEmbedUrl(videoUrl);
            console.log('embedUrl:', embedUrl);
            
            if (embedUrl) {
                container.innerHTML = `<iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (videoUrl) {
                container.innerHTML = `<video src="${videoUrl}" controls autoplay style="max-width:100%;max-height:70vh;"></video>`;
            } else {
                container.innerHTML = `<div style="color:white;padding:2rem;text-align:center;">無法載入影片</div>`;
            }
        } else {
            container.innerHTML = `<img src="${item.url}" alt="${item.title}">`;
        }
        
        this.showModal('preview-modal');
        this.currentItemId = item.id;
    },
    
    getEmbedUrl(url) {
        if (!url) return null;
        
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }
        
        const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
        if (bilibiliMatch) {
            return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&high_quality=1`;
        }
        
        return null;
    }
};

const Gallery = {
    currentFilters: {
        category: 'all',
        type: 'all'
    },
    currentItemId: null,
    editMode: false,
    
    async init() {
        await GalleryData.init();
        this.bindEvents();
        await this.refresh();
    },
    
    async refresh() {
        const items = await GalleryData.filter(this.currentFilters);
        GalleryUI.renderGrid(items);
    },
    
    bindEvents() {
        document.addEventListener('auth:login', () => {
            this.updateEditButtons(true);
        });
        
        document.addEventListener('auth:logout', () => {
            this.updateEditButtons(false);
        });
        
        this.updateEditButtons(Auth.isLoggedIn());
        
        document.getElementById('add-media-btn')?.addEventListener('click', () => {
            if (!Auth.isLoggedIn()) {
                GalleryUI.showToast('請先登入', 'error');
                return;
            }
            this.editMode = false;
            document.getElementById('media-modal-title').textContent = '新增媒體';
            document.getElementById('media-form').reset();
            document.getElementById('image-url-group').style.display = 'block';
            document.getElementById('video-url-group').style.display = 'none';
            GalleryUI.showModal('media-modal');
        });
        
        document.getElementById('media-modal-close')?.addEventListener('click', () => {
            GalleryUI.hideModal('media-modal');
        });
        
        document.getElementById('media-cancel')?.addEventListener('click', () => {
            GalleryUI.hideModal('media-modal');
        });
        
        document.getElementById('media-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'media-modal') {
                GalleryUI.hideModal('media-modal');
            }
        });
        
        document.getElementById('media-type')?.addEventListener('change', (e) => {
            const type = e.target.value;
            document.getElementById('image-url-group').style.display = type === 'image' ? 'block' : 'none';
            document.getElementById('video-url-group').style.display = type === 'video' ? 'block' : 'none';
        });
        
        document.getElementById('media-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        document.querySelectorAll('.gallery-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.gallery-filters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilters.category = btn.dataset.category;
                await this.refresh();
            });
        });
        
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', async () => {
                document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilters.type = tab.dataset.type;
                await this.refresh();
            });
        });
        
        document.getElementById('gallery-grid')?.addEventListener('click', async (e) => {
            const card = e.target.closest('.gallery-card');
            if (card) {
                const item = await GalleryData.getById(card.dataset.id);
                if (item) {
                    this.currentItemId = item.id;
                    GalleryUI.showPreview(item);
                }
            }
        });
        
        document.getElementById('preview-close')?.addEventListener('click', () => {
            GalleryUI.hideModal('preview-modal');
            document.getElementById('preview-container').innerHTML = '';
        });
        
        document.getElementById('preview-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'preview-modal') {
                GalleryUI.hideModal('preview-modal');
                document.getElementById('preview-container').innerHTML = '';
            }
        });
        
        document.getElementById('preview-delete')?.addEventListener('click', async () => {
            if (!Auth.isLoggedIn()) {
                GalleryUI.showToast('請先登入', 'error');
                return;
            }
            if (this.currentItemId && confirm('確定要刪除此媒體嗎？')) {
                await GalleryData.delete(this.currentItemId);
                GalleryUI.hideModal('preview-modal');
                document.getElementById('preview-container').innerHTML = '';
                GalleryUI.showToast('已刪除');
                await this.refresh();
            }
        });
        
        document.getElementById('preview-edit')?.addEventListener('click', async () => {
            if (!Auth.isLoggedIn()) {
                GalleryUI.showToast('請先登入', 'error');
                return;
            }
            const item = await GalleryData.getById(this.currentItemId);
            if (item) {
                this.editMode = true;
                this.populateEditForm(item);
                GalleryUI.hideModal('preview-modal');
                GalleryUI.showModal('media-modal');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                GalleryUI.hideModal('media-modal');
                GalleryUI.hideModal('preview-modal');
            }
        });
    },
    
    async handleFormSubmit() {
        const form = document.getElementById('media-form');
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const type = document.getElementById('media-type').value;
        
        if (type === 'video') {
            const videoInput = document.getElementById('media-video-url');
            data.url = videoInput ? videoInput.value : '';
        } else {
            const imageInput = document.getElementById('media-url');
            data.url = imageInput ? imageInput.value : '';
        }
        
        delete data.videoUrl;
        
        console.log('Processed data:', data);
        
        if (!data.url) {
            GalleryUI.showToast('請輸入連結', 'error');
            return;
        }
        
        if (this.editMode && this.currentItemId) {
            const updated = await GalleryData.update(this.currentItemId, data);
            if (updated) {
                GalleryUI.showToast('已更新');
            } else {
                GalleryUI.showToast('更新失敗', 'error');
            }
        } else {
            const added = await GalleryData.add(data);
            if (added) {
                GalleryUI.showToast('已新增');
            } else {
                GalleryUI.showToast('新增失敗', 'error');
            }
        }
        
        GalleryUI.hideModal('media-modal');
        await this.refresh();
        this.editMode = false;
    },
    
    populateEditForm(item) {
        document.getElementById('media-modal-title').textContent = '編輯媒體';
        document.getElementById('media-title').value = item.title;
        document.getElementById('media-type').value = item.type;
        document.getElementById('media-category').value = item.category;
        document.getElementById('media-description').value = item.description || '';
        document.getElementById('media-date').value = item.date || '';
        
        if (item.type === 'video') {
            document.getElementById('image-url-group').style.display = 'none';
            document.getElementById('video-url-group').style.display = 'block';
            document.getElementById('media-video-url').value = item.url || item.videoUrl || '';
        } else {
            document.getElementById('image-url-group').style.display = 'block';
            document.getElementById('video-url-group').style.display = 'none';
            document.getElementById('media-url').value = item.url || '';
        }
        
        this.currentItemId = item.id;
    },
    
    updateEditButtons(isLoggedIn) {
        const previewActions = document.querySelector('.preview-actions');
        const addBtn = document.getElementById('add-media-btn');
        const musicControl = document.getElementById('music-control-panel');
        
        if (previewActions) {
            previewActions.style.display = isLoggedIn ? 'flex' : 'none';
        }
        
        if (addBtn) {
            addBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        }
        
        if (musicControl) {
            musicControl.style.display = isLoggedIn ? 'flex' : 'none';
        }
    }
};

if (typeof window !== 'undefined') {
    window.GalleryData = GalleryData;
}

document.addEventListener('DOMContentLoaded', () => {
    Gallery.init();
});
