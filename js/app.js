const App = {
    config: {
        googleClientId: '807013160344-7u52pcr2s2cplmck6jdq0nija2nu0dks.apps.googleusercontent.com',
        adminEmails: ['yaninlin@gmail.com'],
        twoFactorEnabled: true
    },
    
    async init() {
        if (typeof DeviceDetect !== 'undefined') {
            DeviceDetect.init();
        }
        
        if (typeof Auth !== 'undefined') {
            await Auth.init({
                clientId: this.config.googleClientId,
                adminEmails: this.config.adminEmails,
                twoFactorEnabled: this.config.twoFactorEnabled
            });
            this.bindAuthEvents();
        }
        
        if (typeof MusicPlayer !== 'undefined') {
            MusicPlayer.init();
        }
        
        await CharacterData.init();
        Filter.init();
        Filter.bindEvents();
        
        Filter.onChange = (filters) => {
            this.refreshCharacterList(filters);
        };
        
        this.setupAllImageUploads();
        this.bindModalEvents();
        this.bindPassiveButton();
        this.bindCharacterGridEvents();
        await this.refreshCharacterList();
    },
    
    bindAuthEvents() {
        document.getElementById('login-btn')?.addEventListener('click', () => {
            Auth.login();
        });
        
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            Auth.logout();
        });
        
        document.getElementById('twofa-submit')?.addEventListener('click', () => {
            const code = document.getElementById('twofa-code').value;
            Auth.verify2FA(code);
        });
        
        document.getElementById('twofa-code')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = document.getElementById('twofa-code').value;
                Auth.verify2FA(code);
            }
        });
        
        document.addEventListener('auth:login', () => {
            this.refreshCharacterList(Filter.getFilters());
        });
        
        document.addEventListener('auth:logout', () => {
            this.refreshCharacterList(Filter.getFilters());
        });
    },
    
    async refreshCharacterList(filters = {}) {
        const characters = await CharacterData.filter(filters);
        UI.renderCharacterGrid(characters);
    },
    
    setupAllImageUploads() {
        const uploadFields = ['artwork', 'gacha-image', 'portrait', 'avatar'];
        
        uploadFields.forEach(field => {
            const btn = document.getElementById(`upload-${field}-btn`);
            const fileInput = document.getElementById(`char-${field}-file`);
            const hiddenInput = document.getElementById(`char-${field}`);
            const preview = document.getElementById(`char-${field}-preview`);
            
            if (btn && fileInput && hiddenInput && preview) {
                btn.addEventListener('click', () => {
                    fileInput.click();
                });
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target.result;
                            hiddenInput.value = base64;
                            preview.innerHTML = `<img src="${base64}" alt="預覽">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    },
    
    bindModalEvents() {
        const addBtn = document.getElementById('add-character-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!Auth.isLoggedIn()) {
                    Auth.showToast('請先登入', 'error');
                    return;
                }
                UI.showCharacterModal();
            });
        }
        
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                UI.hideModal('character-modal');
            });
        }
        
        const formCancel = document.getElementById('form-cancel');
        if (formCancel) {
            formCancel.addEventListener('click', () => {
                UI.hideModal('character-modal');
            });
        }
        
        const modal = document.getElementById('character-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.hideModal('character-modal');
                }
            });
        }
        
        const characterForm = document.getElementById('character-form');
        if (characterForm) {
            characterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!Auth.isLoggedIn()) {
                    Auth.showToast('請先登入', 'error');
                    return;
                }
                
                const formData = UI.getFormData(characterForm);
                
                if (characterForm.dataset.editId) {
                    const updated = await CharacterData.update(characterForm.dataset.editId, formData);
                    if (updated) {
                        UI.showToast('角色已更新');
                        await this.refreshCharacterList(Filter.getFilters());
                    } else {
                        UI.showToast('更新失敗', 'error');
                    }
                } else {
                    const added = await CharacterData.add(formData);
                    if (added) {
                        UI.showToast('角色已新增');
                        await this.refreshCharacterList(Filter.getFilters());
                    } else {
                        UI.showToast('新增失敗', 'error');
                    }
                }
                
                UI.hideModal('character-modal');
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.hideModal('character-modal');
            }
        });
    },
    
    bindCharacterGridEvents() {
        const grid = document.getElementById('character-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.character-card');
                if (card && card.dataset.id) {
                    this.navigateToDetail(card.dataset.id);
                }
            });
        }
    },
    
    navigateToDetail(id) {
        window.location.href = `character.html?id=${id}`;
    },
    
    handleEdit(character) {
        if (!Auth.isLoggedIn()) {
            Auth.showToast('請先登入', 'error');
            return;
        }
        UI.showCharacterModal(true, character);
    },
    
    handleDelete(id) {
        if (!Auth.isLoggedIn()) {
            Auth.showToast('請先登入', 'error');
            return;
        }
        if (confirm('確定要刪除這個角色嗎？')) {
            if (CharacterData.delete(id)) {
                UI.showToast('角色已刪除');
                window.location.href = 'index.html';
            } else {
                UI.showToast('刪除失敗', 'error');
            }
        }
    },
    
    bindPassiveButton() {
        const addPassiveBtn = document.getElementById('add-passive-btn');
        if (addPassiveBtn) {
            addPassiveBtn.addEventListener('click', () => {
                UI.addPassiveEditItem('', '', '');
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

if (typeof window !== 'undefined') {
    window.App = App;
}