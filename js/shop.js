const ShopData = {
    cachedProducts: null,
    
    async init() {
        await this.loadProducts();
    },
    
    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            this.cachedProducts = await response.json();
        } catch (e) {
            console.error('Failed to load products:', e);
            this.cachedProducts = [];
        }
    },
    
    async getAll() {
        if (!this.cachedProducts) {
            await this.loadProducts();
        }
        return this.cachedProducts;
    },
    
    async getById(id) {
        const items = await this.getAll();
        return items.find(item => item.id === id) || null;
    },
    
    async add(item) {
        const result = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (result.ok) {
            await this.loadProducts();
            return await result.json();
        }
        return null;
    },
    
    async update(id, updates) {
        const result = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        if (result.ok) {
            await this.loadProducts();
            return await result.json();
        }
        return null;
    },
    
    async delete(id) {
        const result = await fetch(`/api/products?id=${id}`, {
            method: 'DELETE'
        });
        if (result.ok) {
            await this.loadProducts();
            return true;
        }
        return false;
    },
    
    async filter(filters = {}) {
        let items = await this.getAll();
        
        if (filters.category && filters.category !== 'all') {
            items = items.filter(item => item.category === filters.category);
        }
        
        return items;
    },
    
    getCategoryName(category) {
        const names = {
            figure: '模型',
            merch: '周邊',
            plush: '玩偶',
            accessory: '配件',
            other: '其他'
        };
        return names[category] || category;
    }
};

const ShopUI = {
    renderFeatured(items) {
        const container = document.getElementById('featured-grid');
        const section = document.getElementById('featured-section');
        if (!container) return;
        
        const featuredItems = items.filter(item => item.featured);
        
        if (featuredItems.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }
        
        if (section) section.style.display = 'block';
        
        container.innerHTML = featuredItems.map(item => {
            const imagePosition = item.image_position || 50;
            return `
            <div class="featured-item" data-id="${item.id}">
                <img src="${item.main_image}" alt="${item.name}" style="object-position: center ${imagePosition}%" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/></svg>'">
                <div class="featured-item-overlay">
                    <div class="featured-item-name">${item.name}</div>
                    <div class="featured-item-price">${item.price || ''}</div>
                </div>
            </div>
        `}).join('');
    },
    
    renderSeriesSections(items) {
        const container = document.getElementById('series-sections');
        if (!container) return;
        
        const itemsWithSeries = items.filter(item => item.series);
        
        if (itemsWithSeries.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const seriesMap = {};
        itemsWithSeries.forEach(item => {
            const series = item.series;
            if (!seriesMap[series]) {
                seriesMap[series] = [];
            }
            seriesMap[series].push(item);
        });
        
        container.innerHTML = Object.entries(seriesMap).map(([series, seriesItems]) => {
            const itemsHtml = seriesItems.map(item => {
                const imagePosition = item.image_position || 50;
                return `
                <div class="series-item" data-id="${item.id}">
                    <img src="${item.main_image}" alt="${item.name}" style="object-position: center ${imagePosition}%" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/></svg>'">
                </div>
            `}).join('');
            
            return `
            <div class="series-section">
                <h3 class="series-title">${series}</h3>
                <div class="series-grid">${itemsHtml}</div>
            </div>
        `}).join('');
        
        container.querySelectorAll('.series-item').forEach(el => {
            el.addEventListener('click', async () => {
                const item = await ShopData.getById(el.dataset.id);
                if (item) {
                    Shop.currentItemId = item.id;
                    this.showPreview(item);
                }
            });
        });
        
        container.querySelectorAll('.featured-item').forEach(el => {
            el.addEventListener('click', async () => {
                const item = await ShopData.getById(el.dataset.id);
                if (item) {
                    Shop.currentItemId = item.id;
                    this.showPreview(item);
                }
            });
        });
    },
    
    renderMarquee(items) {
        const track = document.getElementById('marquee-track');
        if (!track || items.length === 0) return;
        
        const marqueeItems = items.slice(0, 10);
        const content = marqueeItems.map(item => {
            const imagePosition = item.image_position || 50;
            return `
            <div class="marquee-item" data-id="${item.id}">
                <img src="${item.main_image}" alt="${item.name}" style="object-position: center ${imagePosition}%" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22>No Image</text></svg>'">
                <span class="marquee-item-name">${item.name}</span>
            </div>
        `}).join('');
        
        track.innerHTML = content + content;
    },
    
    renderItem(item) {
        const categoryLabel = ShopData.getCategoryName(item.category);
        const imagePosition = item.image_position || 50;
        
        return `
            <article class="shop-card" data-id="${item.id}">
                <div class="shop-card-image">
                    <img src="${item.main_image}" alt="${item.name}" style="object-position: center ${imagePosition}%" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22>No Image</text></svg>'">
                </div>
                <div class="shop-card-info">
                    <h3 class="shop-card-name">${item.name}</h3>
                    <div class="shop-card-meta">
                        <span class="shop-card-category">${categoryLabel}</span>
                        <span class="shop-card-price">${item.price || ''}</span>
                    </div>
                </div>
            </article>
        `;
    },
    
    renderGrid(items) {
        const grid = document.getElementById('shop-grid');
        
        if (!grid) return;
        
        if (items.length === 0) {
            grid.innerHTML = `
                <div class="empty-shop">
                    <div class="empty-shop-icon">🛒</div>
                    <p>尚無商品</p>
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
        const container = document.getElementById('preview-container');
        const title = document.getElementById('preview-title');
        const price = document.getElementById('preview-price');
        const description = document.getElementById('preview-description');
        const gallery = document.getElementById('preview-gallery');
        const linkBtn = document.getElementById('preview-link');
        
        if (!container) return;
        
        title.textContent = item.name;
        price.textContent = item.price || '';
        description.textContent = item.description || '';
        
        container.innerHTML = `<img src="${item.main_image}" alt="${item.name}">`;
        
        if (item.images && item.images.length > 0) {
            const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
            gallery.innerHTML = images.map((img, i) => `
                <img src="${img}" alt="${item.name} - ${i + 1}" class="preview-gallery-img" data-src="${img}">
            `).join('');
            gallery.style.display = 'flex';
        } else {
            gallery.style.display = 'none';
        }
        
        if (item.link) {
            linkBtn.href = item.link;
            linkBtn.style.display = 'inline-block';
        } else {
            linkBtn.style.display = 'none';
        }
        
        this.showModal('preview-modal');
    }
};

const Shop = {
    currentFilters: {
        category: 'all'
    },
    currentItemId: null,
    editMode: false,
    
    async init() {
        await ShopData.init();
        this.bindEvents();
        await this.refresh();
    },
    
    async refresh() {
        const items = await ShopData.filter(this.currentFilters);
        ShopUI.renderFeatured(items);
        ShopUI.renderSeriesSections(items);
        ShopUI.renderMarquee(items);
        ShopUI.renderGrid(items);
    },
    
    bindEvents() {
        document.addEventListener('auth:login', () => {
            this.updateEditButtons(true);
        });
        
        document.addEventListener('auth:logout', () => {
            this.updateEditButtons(false);
        });
        
        this.updateEditButtons(Auth.isLoggedIn());
        
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            if (!Auth.isLoggedIn()) {
                ShopUI.showToast('請先登入', 'error');
                return;
            }
            this.editMode = false;
            document.getElementById('product-modal-title').textContent = '新增商品';
            document.getElementById('product-form').reset();
            ShopUI.showModal('product-modal');
        });
        
        document.getElementById('product-modal-close')?.addEventListener('click', () => {
            ShopUI.hideModal('product-modal');
        });
        
        document.getElementById('product-cancel')?.addEventListener('click', () => {
            ShopUI.hideModal('product-modal');
        });
        
        document.getElementById('product-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                ShopUI.hideModal('product-modal');
            }
        });
        
        document.getElementById('product-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        document.querySelectorAll('.shop-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.shop-filters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilters.category = btn.dataset.category;
                await this.refresh();
            });
        });
        
        document.getElementById('shop-grid')?.addEventListener('click', async (e) => {
            const card = e.target.closest('.shop-card');
            if (card) {
                const item = await ShopData.getById(card.dataset.id);
                if (item) {
                    this.currentItemId = item.id;
                    ShopUI.showPreview(item);
                }
            }
        });
        
        document.getElementById('preview-close')?.addEventListener('click', () => {
            ShopUI.hideModal('preview-modal');
            document.getElementById('preview-container').innerHTML = '';
        });
        
        document.getElementById('preview-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'preview-modal') {
                ShopUI.hideModal('preview-modal');
                document.getElementById('preview-container').innerHTML = '';
            }
        });
        
        document.getElementById('preview-gallery')?.addEventListener('click', (e) => {
            const img = e.target.closest('.preview-gallery-img');
            if (img) {
                document.getElementById('preview-container').innerHTML = `<img src="${img.dataset.src}" alt="Preview">`;
            }
        });
        
        document.getElementById('preview-delete')?.addEventListener('click', async () => {
            if (!Auth.isLoggedIn()) {
                ShopUI.showToast('請先登入', 'error');
                return;
            }
            if (this.currentItemId && confirm('確定要刪除此商品嗎？')) {
                await ShopData.delete(this.currentItemId);
                ShopUI.hideModal('preview-modal');
                document.getElementById('preview-container').innerHTML = '';
                ShopUI.showToast('已刪除');
                await this.refresh();
            }
        });
        
        document.getElementById('preview-edit')?.addEventListener('click', async () => {
            if (!Auth.isLoggedIn()) {
                ShopUI.showToast('請先登入', 'error');
                return;
            }
            const item = await ShopData.getById(this.currentItemId);
            if (item) {
                this.editMode = true;
                this.populateEditForm(item);
                ShopUI.hideModal('preview-modal');
                ShopUI.showModal('product-modal');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ShopUI.hideModal('product-modal');
                ShopUI.hideModal('preview-modal');
            }
        });
    },
    
    async handleFormSubmit() {
        const form = document.getElementById('product-form');
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        data.imagePosition = parseInt(document.getElementById('product-image-position')?.value || 50);
        data.featured = document.getElementById('product-featured')?.checked || false;
        
        if (!data.name || !data.mainImage) {
            ShopUI.showToast('請填寫必要欄位', 'error');
            return;
        }
        
        if (this.editMode && this.currentItemId) {
            const updated = await ShopData.update(this.currentItemId, data);
            if (updated) {
                ShopUI.showToast('已更新');
            } else {
                ShopUI.showToast('更新失敗', 'error');
            }
        } else {
            const added = await ShopData.add(data);
            if (added) {
                ShopUI.showToast('已新增');
            } else {
                ShopUI.showToast('新增失敗', 'error');
            }
        }
        
        ShopUI.hideModal('product-modal');
        await this.refresh();
        this.editMode = false;
    },
    
    populateEditForm(item) {
        document.getElementById('product-modal-title').textContent = '編輯商品';
        document.getElementById('product-name').value = item.name;
        document.getElementById('product-price').value = item.price || '';
        document.getElementById('product-category').value = item.category;
        document.getElementById('product-main-image').value = item.main_image || '';
        document.getElementById('product-description').value = item.description || '';
        document.getElementById('product-link').value = item.link || '';
        document.getElementById('product-image-position').value = item.image_position || 50;
        document.getElementById('product-series').value = item.series || '';
        document.getElementById('product-featured').checked = item.featured || false;
        
        const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
        document.getElementById('product-images').value = (images || []).join('\n');
        
        this.currentItemId = item.id;
    },
    
    updateEditButtons(isLoggedIn) {
        const previewActions = document.querySelector('.preview-actions');
        const addBtn = document.getElementById('add-product-btn');
        
        if (previewActions) {
            previewActions.style.display = isLoggedIn ? 'flex' : 'none';
        }
        
        if (addBtn) {
            addBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Shop.init();
});