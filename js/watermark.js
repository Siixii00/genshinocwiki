const Watermark = {
    enabled: true,
    watermarks: [],
    pageWatermarks: [],
    ipInfo: null,
    observer: null,
    
    async getIPInfo() {
        if (this.ipInfo) return this.ipInfo;
        
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.ipInfo = data.ip || 'Visitor';
            return this.ipInfo;
        } catch (e) {
            this.ipInfo = 'Visitor';
            return this.ipInfo;
        }
    },
    
    generateWatermarks(container, ipInfo, isPageWatermark = false) {
        const count = Math.floor(Math.random() * 4) + 7;
        const watermarks = [];
        
        for (let i = 0; i < count; i++) {
            const watermark = document.createElement('div');
            watermark.className = 'dynamic-watermark';
            watermark.textContent = ipInfo;
            watermark.style.cssText = `
                position: absolute;
                color: rgba(0, 0, 0, 0.15);
                font-size: ${Math.random() * 8 + 12}px;
                font-weight: 500;
                pointer-events: none;
                z-index: ${isPageWatermark ? '9999' : '10000'};
                white-space: nowrap;
                transform: rotate(-${Math.random() * 30 + 15}deg);
                user-select: none;
                top: ${Math.random() * 80 + 5}%;
                left: ${Math.random() * 80 + 5}%;
            `;
            watermarks.push(watermark);
            container.appendChild(watermark);
        }
        
        return watermarks;
    },
    
    generatePageWatermarks(container, ipInfo) {
        const count = Math.floor(Math.random() * 8) + 15;
        const watermarks = [];
        
        for (let i = 0; i < count; i++) {
            const watermark = document.createElement('div');
            watermark.className = 'page-watermark';
            watermark.textContent = ipInfo;
            watermark.style.cssText = `
                position: fixed;
                color: rgba(100, 100, 100, 0.25);
                font-size: ${Math.random() * 12 + 18}px;
                font-weight: 600;
                pointer-events: none;
                z-index: 9998;
                white-space: nowrap;
                transform: rotate(-${Math.random() * 50 + 15}deg);
                user-select: none;
                top: ${Math.random() * 85 + 5}%;
                left: ${Math.random() * 85 + 5}%;
                text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
            `;
            watermarks.push(watermark);
            container.appendChild(watermark);
        }
        
        return watermarks;
    },
    
    animateWatermarks(watermarkList, duration = 3000) {
        watermarkList.forEach((wm, index) => {
            const animDuration = duration + Math.random() * 2000;
            const delay = index * 200;
            
            setTimeout(() => {
                this.animateSingle(wm, animDuration);
            }, delay);
        });
    },
    
    animateSingle(element, duration) {
        if (!element) return;
        
        const startX = parseFloat(element.style.left);
        const startY = parseFloat(element.style.top);
        
        const animate = () => {
            if (!this.enabled || !element.parentElement) return;
            
            const newX = startX + (Math.random() - 0.5) * 5;
            const newY = startY + (Math.random() - 0.5) * 5;
            
            element.style.left = `${Math.max(5, Math.min(90, newX))}%`;
            element.style.top = `${Math.max(5, Math.min(90, newY))}%`;
            element.style.opacity = 0.25 + Math.random() * 0.1;
            
            setTimeout(() => animate(), duration);
        };
        
        animate();
    },
    
    clearWatermarks(watermarkList = this.watermarks) {
        watermarkList.forEach(wm => {
            if (wm.parentElement) {
                wm.parentElement.removeChild(wm);
            }
        });
        if (watermarkList === this.watermarks) {
            this.watermarks = [];
        }
    },
    
    clearPageWatermarks() {
        this.pageWatermarks.forEach(wm => {
            if (wm.parentElement) {
                wm.parentElement.removeChild(wm);
            }
        });
        this.pageWatermarks = [];
    },
    
    async showWatermark(container) {
        if (!this.enabled) return;
        
        this.clearWatermarks();
        
        const ipInfo = await this.getIPInfo();
        this.watermarks = this.generateWatermarks(container, ipInfo, false);
        this.animateWatermarks(this.watermarks);
    },
    
    hideWatermark() {
        this.clearWatermarks();
    },
    
    async showPageWatermark() {
        if (!this.enabled) return;
        
        this.clearPageWatermarks();
        
        const ipInfo = await this.getIPInfo();
        this.pageWatermarks = this.generatePageWatermarks(document.body, ipInfo);
        this.animatePageWatermarks();
    },
    
    hidePageWatermark() {
        this.clearPageWatermarks();
    },
    
    animatePageWatermarks() {
        this.pageWatermarks.forEach((wm, index) => {
            const duration = 4000 + Math.random() * 3000;
            const delay = index * 150;
            
            setTimeout(() => {
                this.animatePageSingle(wm, duration);
            }, delay);
        });
    },
    
    animatePageSingle(element, duration) {
        if (!element) return;
        
        const startX = parseFloat(element.style.left);
        const startY = parseFloat(element.style.top);
        const baseOpacity = 0.22;
        
        const animate = () => {
            if (!this.enabled || !element.parentElement) return;
            
            const newX = startX + (Math.random() - 0.5) * 10;
            const newY = startY + (Math.random() - 0.5) * 10;
            
            element.style.left = `${Math.max(3, Math.min(92, newX))}%`;
            element.style.top = `${Math.max(3, Math.min(92, newY))}%`;
            element.style.opacity = baseOpacity + Math.random() * 0.1;
            
            setTimeout(() => animate(), duration);
        };
        
        animate();
    },
    
    initPageWatermark() {
        this.showPageWatermark();
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.showPageWatermark();
            }
        });
        
        setInterval(() => {
            if (this.pageWatermarks.length === 0 && this.enabled) {
                this.showPageWatermark();
            }
        }, 10000);
    },
    
    init() {
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxContent = document.querySelector('.lightbox-content');
        
        if (lightboxModal && lightboxContent) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        const isActive = lightboxModal.classList.contains('active');
                        if (isActive) {
                            lightboxContent.style.position = 'relative';
                            this.showWatermark(lightboxContent);
                        } else {
                            this.hideWatermark();
                        }
                    }
                });
            });
            
            observer.observe(lightboxModal, { attributes: true });
        }
        
        const previewModal = document.getElementById('preview-modal');
        const previewContainer = document.getElementById('preview-container');
        
        if (previewModal && previewContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        const isActive = previewModal.classList.contains('active');
                        if (isActive) {
                            previewContainer.style.position = 'relative';
                            this.showWatermark(previewContainer);
                        } else {
                            this.hideWatermark();
                        }
                    }
                });
            });
            
            observer.observe(previewModal, { attributes: true });
        }
        
        this.initPageWatermark();
    }
};

if (typeof window !== 'undefined') {
    window.Watermark = Watermark;
}
