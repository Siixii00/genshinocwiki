const DeviceDetect = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    },
    
    isTablet() {
        return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024);
    },
    
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },
    
    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    
    applyDeviceClass() {
        const deviceType = this.getDeviceType();
        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        document.body.classList.add(`device-${deviceType}`);
        
        if (this.isTouchDevice()) {
            document.body.classList.add('touch-device');
        }
        
        console.log(`Device detected: ${deviceType}, Screen: ${window.innerWidth}x${window.innerHeight}, Touch: ${this.isTouchDevice()}`);
    },
    
    init() {
        this.applyDeviceClass();
        
        window.addEventListener('resize', () => {
            this.applyDeviceClass();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.applyDeviceClass(), 100);
        });
    }
};

if (typeof window !== 'undefined') {
    window.DeviceDetect = DeviceDetect;
}