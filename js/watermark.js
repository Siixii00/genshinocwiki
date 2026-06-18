const Watermark = {
    enabled: true,
    watermarks: [],
    observer: null,
    
    async getIPInfo() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || 'Unknown';
        } catch (e) {
            return 'Visitor';
        }
    },
    
    generateWatermarks(container, ipInfo) {
        const count = Math.floor(Math.random() * 4) + 7;
        const watermarks = [];
        
        for (let i = 0; i < count; i++) {
            const watermark = document.createElement('div');
            watermark.className = 'dynamic-watermark';
            watermark.textContent = ipInfo;
            watermark.style.cssText = `
                position: absolute;
                color: rgba(0, 0, 0, 0.3);
                font-size: ${Math.random() * 8 + 12}px;
                font-weight: 500;
                pointer-events: none;
                z-index: 10000;
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
    
    animateWatermarks() {
        this.watermarks.forEach((wm, index) => {
            const duration = 3000 + Math.random() * 2000;
            const delay = index * 200;
            
            setTimeout(() => {
                this.animateSingle(wm, duration);
            }, delay);
        });
    },
    
    animateSingle(element, duration) {
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
    
    clearWatermarks() {
        this.watermarks.forEach(wm => {
            if (wm.parentElement) {
                wm.parentElement.removeChild(wm);
            }
        });
        this.watermarks = [];
    },
    
    async showWatermark(container) {
        if (!this.enabled) return;
        
        this.clearWatermarks();
        
        const ipInfo = await this.getIPInfo();
        this.watermarks = this.generateWatermarks(container, ipInfo);
        this.animateWatermarks();
    },
    
    hideWatermark() {
        this.clearWatermarks();
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
    }
};

if (typeof window !== 'undefined') {
    window.Watermark = Watermark;
}
