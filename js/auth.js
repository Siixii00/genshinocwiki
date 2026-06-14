const Auth = {
    config: {
        clientId: null,
        adminEmails: [],
        twoFactorEnabled: true,
        totpSecret: null
    },
    
    user: null,
    is2FAVerified: false,
    
    init(config = {}) {
        this.config = { ...this.config, ...config };
        this.loadSession();
        this.setupGoogleSDK();
        this.loadTOTPSecret();
    },
    
    loadTOTPSecret() {
        const secret = localStorage.getItem('genshin_totp_secret');
        if (secret) {
            this.config.totpSecret = secret;
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
    
    showTOTPSetup() {
        const secret = this.generateTOTPSecret();
        this.config.totpSecret = secret;
        
        const title = document.querySelector('#twofa-modal h3');
        const desc = document.querySelector('#twofa-modal p');
        
        if (title) title.textContent = '設定二階段驗證';
        if (desc) desc.textContent = '請用 Google Authenticator 扫描 QR Code';
        
        const qrContainer = document.getElementById('twofa-qrcode');
        if (qrContainer) {
            qrContainer.style.display = 'block';
            this.generateQRCode(secret);
        }
        
        const secretDisplay = document.getElementById('twofa-secret-display');
        if (secretDisplay) {
            secretDisplay.style.display = 'block';
            secretDisplay.textContent = `密鑰: ${secret}`;
        }
    },
    
    showTOTPVerify() {
        const title = document.querySelector('#twofa-modal h3');
        const desc = document.querySelector('#twofa-modal p');
        
        if (title) title.textContent = '二階段驗證';
        if (desc) desc.textContent = '請輸入 Google Authenticator 的 6位數驗證碼';
        
        const qrContainer = document.getElementById('twofa-qrcode');
        if (qrContainer) qrContainer.style.display = 'none';
        
        const secretDisplay = document.getElementById('twofa-secret-display');
        if (secretDisplay) secretDisplay.style.display = 'none';
    },
    
    generateTOTPSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 16; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        localStorage.setItem('genshin_totp_secret', secret);
        return secret;
    },
    
    generateQRCode(secret) {
        const qrContainer = document.getElementById('twofa-qrcode');
        if (!qrContainer) return;
        
        const email = this.user?.email || 'admin';
        const issuer = 'GenshinWiki';
        const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;
        
        const encodedUrl = encodeURIComponent(otpauthUrl);
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}" alt="QR Code">`;
    },
    
    verify2FA(code) {
        if (!this.config.totpSecret) {
            return false;
        }
        
        const validTOTP = this.generateTOTP(this.config.totpSecret);
        const prevTOTP = this.generateTOTP(this.config.totpSecret, -1);
        
        if (code === validTOTP || code === prevTOTP) {
            localStorage.setItem('genshin_totp_secret', this.config.totpSecret);
            this.is2FAVerified = true;
            this.hide2FADialog();
            this.onLoginSuccess();
            return true;
        }
        
        this.showToast('驗證碼錯誤', 'error');
        return false;
    },
    
    generateTOTP(secret, offset = 0) {
        const key = this.base32ToHex(secret);
        const time = Math.floor((Date.now() / 1000) + (offset * 30));
        const timeHex = this.leftPad(time.toString(16), 16, '0');
        
        const timeBytes = this.hexToBytes(timeHex);
        const keyBytes = this.hexToBytes(key);
        
        const hmac = this.hmacSha1(keyBytes, timeBytes);
        const offsetHex = hmac[hmac.length - 1] & 0x0f;
        
        const codeHex = (
            ((hmac[offsetHex] & 0x7f) << 24) |
            ((hmac[offsetHex + 1] & 0xff) << 16) |
            ((hmac[offsetHex + 2] & 0xff) << 8) |
            (hmac[offsetHex + 3] & 0xff)
        ).toString();
        
        const code = parseInt(codeHex, 10);
        return (code % 1000000).toString().padStart(6, '0');
    },
    
    base32ToHex(base32) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let hex = '';
        
        for (let i = 0; i < base32.length; i++) {
            const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
            bits += this.leftPad(val.toString(2), 5, '0');
        }
        
        for (let i = 0; i + 4 <= bits.length; i += 4) {
            const chunk = bits.substr(i, 4);
            hex += parseInt(chunk, 2).toString(16);
        }
        
        return hex;
    },
    
    hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return bytes;
    },
    
    hmacSha1(keyBytes, messageBytes) {
        const blockSize = 64;
        const hashSize = 20;
        
        let key = keyBytes.slice();
        if (key.length > blockSize) {
            key = this.sha1(key);
        }
        if (key.length < blockSize) {
            key = key.concat(Array(blockSize - key.length).fill(0));
        }
        
        const oKeyPad = key.map(b => b ^ 0x5c);
        const iKeyPad = key.map(b => b ^ 0x36);
        
        const innerHash = this.sha1(iKeyPad.concat(messageBytes));
        return this.sha1(oKeyPad.concat(innerHash));
    },
    
    sha1(bytes) {
        const h0 = 0x67452301;
        const h1 = 0xEFCDAB89;
        const h2 = 0x98BADCFE;
        const h3 = 0x10325476;
        const h4 = 0xC3D2E1F0;
        
        const ml = bytes.length * 8;
        bytes.push(0x80);
        
        while ((bytes.length % 64) !== 56) {
            bytes.push(0);
        }
        
        const mlBytes = [];
        for (let i = 7; i >= 0; i--) {
            mlBytes.push((ml >>> (i * 8)) & 0xff);
        }
        bytes = bytes.concat(mlBytes);
        
        for (let i = 0; i < bytes.length; i += 64) {
            const chunk = bytes.slice(i, i + 64);
            
            const w = [];
            for (let j = 0; j < 16; j++) {
                w[j] = (chunk[j * 4] << 24) | (chunk[j * 4 + 1] << 16) | (chunk[j * 4 + 2] << 8) | chunk[j * 4 + 3];
            }
            for (let j = 16; j < 80; j++) {
                w[j] = this.leftRotate(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            
            let a = h0, b = h1, c = h2, d = h3, e = h4;
            
            for (let j = 0; j < 80; j++) {
                let f, k;
                
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                } else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                } else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                
                const temp = (this.leftRotate(a, 5) + f + e + k + w[j]) & 0xffffffff;
                e = d;
                d = c;
                c = this.leftRotate(b, 30);
                b = a;
                a = temp;
            }
            
            h0 = (h0 + a) & 0xffffffff;
            h1 = (h1 + b) & 0xffffffff;
            h2 = (h2 + c) & 0xffffffff;
            h3 = (h3 + d) & 0xffffffff;
            h4 = (h4 + e) & 0xffffffff;
        }
        
        return [
            (h0 >> 24) & 0xff, (h0 >> 16) & 0xff, (h0 >> 8) & 0xff, h0 & 0xff,
            (h1 >> 24) & 0xff, (h1 >> 16) & 0xff, (h1 >> 8) & 0xff, h1 & 0xff,
            (h2 >> 24) & 0xff, (h2 >> 16) & 0xff, (h2 >> 8) & 0xff, h2 & 0xff,
            (h3 >> 24) & 0xff, (h3 >> 16) & 0xff, (h3 >> 8) & 0xff, h3 & 0xff,
            (h4 >> 24) & 0xff, (h4 >> 16) & 0xff, (h4 >> 8) & 0xff, h4 & 0xff
        ];
    },
    
    leftRotate(value, shift) {
        return ((value << shift) | (value >>> (32 - shift))) & 0xffffffff;
    },
    
    leftPad(str, len, pad) {
        if (str.length >= len) return str;
        return Array(len - str.length + 1).join(pad) + str;
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
