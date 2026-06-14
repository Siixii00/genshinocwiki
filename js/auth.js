const Auth = {
    config: {
        clientId: null,
        adminEmails: [],
        twoFactorEnabled: true
    },
    
    user: null,
    is2FAVerified: false,
    
    init(config = {}) {
        this.config = { ...this.config, ...config };
        this.loadSession();
        this.setupGoogleSDK();
    },
    
    setupGoogleSDK() {
        if (!this.config.clientId) {
            console.warn('Google Client ID not configured');
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = () => {
            google.accounts.id.initialize({
                client_id: this.config.clientId,
                callback: this.handleCredentialResponse.bind(this)
            });
        };
    },
    
    handleCredentialResponse(response) {
        const payload = this.parseJWT(response.credential);
        if (!payload) {
            this.showToast('登入失敗', 'error');
            return;
        }
        
        this.user = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            token: response.credential
        };
        
        if (!this.isAdmin()) {
            this.user = null;
            this.showToast('您沒有管理員權限', 'error');
            return;
        }
        
        this.saveSession();
        
        if (this.config.twoFactorEnabled) {
            this.show2FADialog();
        } else {
            this.onLoginSuccess();
        }
    },
    
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },
    
    isAdmin() {
        if (!this.user) return false;
        return this.config.adminEmails.includes(this.user.email);
    },
    
    show2FADialog() {
        const modal = document.getElementById('twofa-modal');
        if (modal) {
            modal.classList.add('active');
            const input = document.getElementById('twofa-code');
            if (input) input.focus();
        }
    },
    
    verify2FA(code) {
        const validCode = localStorage.getItem('genshin_2fa_code') || '123456';
        
        if (code === validCode) {
            this.is2FAVerified = true;
            this.hide2FADialog();
            this.onLoginSuccess();
            return true;
        }
        
        this.showToast('驗證碼錯誤', 'error');
        return false;
    },
    
    hide2FADialog() {
        const modal = document.getElementById('twofa-modal');
        if (modal) modal.classList.remove('active');
    },
    
    onLoginSuccess() {
        this.showToast('登入成功', 'success');
        this.updateUI();
        document.body.classList.add('edit-mode');
        
        const event = new CustomEvent('auth:login', { detail: this.user });
        document.dispatchEvent(event);
    },
    
    login() {
        if (!this.config.clientId) {
            this.showToast('請先設定 Google Client ID', 'error');
            return;
        }
        
        google.accounts.id.prompt();
    },
    
    logout() {
        this.user = null;
        this.is2FAVerified = false;
        this.clearSession();
        this.updateUI();
        document.body.classList.remove('edit-mode');
        
        const event = new CustomEvent('auth:logout');
        document.dispatchEvent(event);
        this.showToast('已登出', 'success');
    },
    
    saveSession() {
        const session = {
            user: this.user,
            is2FAVerified: this.is2FAVerified,
            timestamp: Date.now()
        };
        sessionStorage.setItem('genshin_auth', JSON.stringify(session));
    },
    
    loadSession() {
        const saved = sessionStorage.getItem('genshin_auth');
        if (!saved) return;
        
        try {
            const session = JSON.parse(saved);
            if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
                this.clearSession();
                return;
            }
            
            this.user = session.user;
            this.is2FAVerified = session.is2FAVerified;
            
            if (this.isAdmin() && this.is2FAVerified) {
                document.body.classList.add('edit-mode');
            }
        } catch (e) {
            this.clearSession();
        }
    },
    
    clearSession() {
        sessionStorage.removeItem('genshin_auth');
    },
    
    isLoggedIn() {
        return this.user !== null && this.is2FAVerified;
    },
    
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        
        if (this.isLoggedIn()) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (userInfo) {
                userInfo.style.display = 'flex';
                userInfo.innerHTML = `
                    <img src="${this.user.picture}" alt="${this.user.name}" class="user-avatar">
                    <span>${this.user.name}</span>
                `;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
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
    }
};

if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
