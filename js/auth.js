const Auth = {
    config: {
        clientId: null,
        adminEmails: [],
        twoFactorEnabled: true,
        totpSecret: null
    },
    
    user: null,
    is2FAVerified: false,
    
    async init(config = {}) {
        this.config = { ...this.config, ...config };
        this.loadSession();
        this.setupGoogleSDK();
        await this.loadTOTPSecret();
    },
    
    async loadTOTPSecret() {
        try {
            const response = await fetch('/api/2fa');
            const data = await response.json();
            if (data.secret) {
                this.config.totpSecret = data.secret;
            }
        } catch (e) {
            console.warn('Failed to load TOTP secret from server, using localStorage fallback');
            const secret = localStorage.getItem('genshin_totp_secret');
            if (secret) {
                this.config.totpSecret = secret;
            }
        }
    },
    
    async saveTOTPSecret(secret) {
        localStorage.setItem('genshin_totp_secret', secret);
        
        try {
            await fetch('/api/2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret })
            });
        } catch (e) {
            console.warn('Failed to save TOTP secret to server');
        }
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
            
            if (!this.config.totpSecret) {
                this.showTOTPSetup();
            } else {
                this.showTOTPVerify();
            }
            
            const input = document.getElementById('twofa-code');
            if (input) input.focus();
        }
    },
    
    async showTOTPSetup() {
        const secret = await this.generateTOTPSecret();
        this.config.totpSecret = secret;
        
        const title = document.querySelector('#twofa-modal h3');
        const desc = document.querySelector('#twofa-modal p');
        
        if (title) title.textContent = '設定二階段驗證';
        if (desc) desc.textContent = '請用 Google Authenticator 掃描 QR Code';
        
        const qrContainer = document.getElementById('twofa-qrcode');
        if (qrContainer) {
            qrContainer.style.display = 'flex';
            qrContainer.style.justifyContent = 'center';
            qrContainer.style.alignItems = 'center';
            qrContainer.style.padding = '16px';
            this.generateQRCode(secret);
        }
        
        const secretDisplay = document.getElementById('twofa-secret-display');
        if (secretDisplay) {
            secretDisplay.style.display = 'block';
            secretDisplay.style.textAlign = 'center';
            secretDisplay.textContent = `密鑰: ${secret}`;
        }
    },
    
    showTOTPVerify() {
        const title = document.querySelector('#twofa-modal h3');
        const desc = document.querySelector('#twofa-modal p');
        
        if (title) title.textContent = '二階段驗證';
        if (desc) desc.textContent = '請輸入 Google Authenticator 的 6 位數驗證碼';
        
        const qrContainer = document.getElementById('twofa-qrcode');
        if (qrContainer) qrContainer.style.display = 'none';
        
        const secretDisplay = document.getElementById('twofa-secret-display');
        if (secretDisplay) secretDisplay.style.display = 'none';
    },
    
    async generateTOTPSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 16; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        await this.saveTOTPSecret(secret);
        return secret;
    },
    
    generateQRCode(secret) {
        const qrContainer = document.getElementById('twofa-qrcode');
        if (!qrContainer) return;
        
        const email = encodeURIComponent(this.user?.email || 'admin');
        const issuer = encodeURIComponent('GenshinWiki');
        const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;
        
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}" alt="QR Code" style="background: white; padding: 16px; border-radius: 8px;">`;
    },
    
    async verify2FA(code) {
        if (!this.config.totpSecret) {
            return false;
        }
        
        try {
            const validTOTP = await this.generateTOTP(this.config.totpSecret);
            const prevTOTP = await this.generateTOTP(this.config.totpSecret, -1);
            
            if (code === validTOTP || code === prevTOTP) {
                await this.saveTOTPSecret(this.config.totpSecret);
                this.is2FAVerified = true;
                this.hide2FADialog();
                this.onLoginSuccess();
                return true;
            }
        } catch (e) {
            console.error('TOTP verification error:', e);
        }
        
        this.showToast('驗證碼錯誤', 'error');
        return false;
    },
    
    async generateTOTP(secret, offset = 0) {
        const key = await this.base32ToKey(secret);
        const time = Math.floor(Date.now() / 1000 / 30) + offset;
        const timeBuffer = new ArrayBuffer(8);
        const timeView = new DataView(timeBuffer);
        timeView.setUint32(4, time, false);
        
        const hmacBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            timeBuffer
        );
        
        const hmac = new Uint8Array(hmacBuffer);
        const offsetVal = hmac[hmac.length - 1] & 0x0f;
        
        const code = (
            ((hmac[offsetVal] & 0x7f) << 24) |
            ((hmac[offsetVal + 1] & 0xff) << 16) |
            ((hmac[offsetVal + 2] & 0xff) << 8) |
            (hmac[offsetVal + 3] & 0xff)
        ) % 1000000;
        
        return code.toString().padStart(6, '0');
    },
    
    async base32ToKey(base32) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        
        for (let i = 0; i < base32.length; i++) {
            const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }
        
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }
        
        const keyBuffer = new Uint8Array(bytes).buffer;
        
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );
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
