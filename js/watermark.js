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
        const count = Math.floor(Math.random() * 6) + 10;
        const watermarks = [];
        
        for (let i = 0; i < count; i++) {
            const watermark = document.createElement('div');
            watermark.className = 'page-watermark';
            watermark.textContent = ipInfo;
            watermark.style.cssText = `
                position: fixed;
                color: rgba(128, 128, 128, 0.08);
                font-size: ${Math.random() * 10 + 14}px;
                font-weight: 500;
                pointer-events: none;
                z-index: 9998;
                white-space: nowrap;
                transform: rotate(-${Math.random() * 40 + 20}deg);
                user-select: none;
                top: ${Math.random() * 90 + 5}%;
                left: ${Math.random() * 90 + 5}%;
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
        this.animateWatermarks(this.pageWatermarks, 5000);
    },
    
    hidePageWatermark() {
        this.clearPageWatermarks();
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
