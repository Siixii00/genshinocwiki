const DetailPage = {
    currentCharacterId: null,
    
    async init() {
        await CharacterData.init();
        
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCharacterId = urlParams.get('id');
        
        if (!this.currentCharacterId) {
            window.location.href = 'index.html';
            return;
        }
        
        const character = await CharacterData.getById(this.currentCharacterId);
        
        if (!character) {
            UI.showToast('找不到該角色', 'error');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }
        
        UI.updateDetailPage(character);
        this.setupContentProtection();
        this.setupAllImageUploads();
        this.bindEvents();
        this.updateEditButtons();
    },
    
    setupContentProtection() {
        if (!Auth.isLoggedIn()) {
            document.addEventListener('contextmenu', (e) => e.preventDefault());
            document.addEventListener('selectstart', (e) => e.preventDefault());
            document.addEventListener('copy', (e) => e.preventDefault());
            document.addEventListener('cut', (e) => e.preventDefault());
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            
            document.querySelectorAll('img').forEach(img => {
                img.setAttribute('draggable', 'false');
                img.setAttribute('oncontextmenu', 'return false;');
            });
        }
    },
    
    updateEditButtons() {
        const isLoggedIn = Auth.isLoggedIn();
        const editBtn = document.getElementById('edit-character-btn');
        const deleteBtn = document.getElementById('delete-character-btn');
        
        if (editBtn) {
            editBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        }
        if (deleteBtn) {
            deleteBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        }
    },
    
    setupAllImageUploads() {
        const imageFields = [
            { input: 'edit-artwork', preview: 'edit-artwork-preview' },
            { input: 'edit-portrait', preview: 'edit-portrait-preview' },
            { input: 'edit-avatar', preview: 'edit-avatar-preview' },
            { input: 'edit-idcard', preview: 'edit-idcard-preview' }
        ];
        
        imageFields.forEach(({ input, preview }) => {
            const inputEl = document.getElementById(input);
            const previewEl = document.getElementById(preview);
            
            if (inputEl && previewEl) {
                inputEl.addEventListener('input', () => {
                    const url = inputEl.value.trim();
                    if (url) {
                        previewEl.innerHTML = `<img src="${url}" alt="預覽" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                    } else {
                        const label = previewEl.closest('.image-upload-item').querySelector('span')?.textContent || '預覽';
                        previewEl.innerHTML = `<span>${label}</span>`;
                    }
                });
            }
        });
        
        const addCustomBtn = document.getElementById('add-custom-image-btn');
        if (addCustomBtn) {
            addCustomBtn.addEventListener('click', () => {
                UI.addCustomImageItem('', []);
            });
        }
        
        const addPassiveBtn = document.getElementById('add-passive-btn');
        if (addPassiveBtn) {
            addPassiveBtn.addEventListener('click', () => {
                UI.addPassiveEditItem('', '', '');
            });
        }
        
        const addNormalVoiceBtn = document.getElementById('add-normal-voice-btn');
        if (addNormalVoiceBtn) {
            addNormalVoiceBtn.addEventListener('click', () => {
                const container = document.getElementById('normal-voice-edit-list');
                UI.addVoiceEditItem(container, '', '', '');
            });
        }
        
        const addCombatVoiceBtn = document.getElementById('add-combat-voice-btn');
        if (addCombatVoiceBtn) {
            addCombatVoiceBtn.addEventListener('click', () => {
                const container = document.getElementById('combat-voice-edit-list');
                UI.addVoiceEditItem(container, '', '', '');
            });
        }
    },
    
    bindEvents() {
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                UI.switchTab(tab.dataset.tab);
            });
        });
        
        const editBtn = document.getElementById('edit-character-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (!Auth.isLoggedIn()) {
                    UI.showToast('請先登入', 'error');
                    return;
                }
                this.showEditModal();
            });
        }
        
        const deleteBtn = document.getElementById('delete-character-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (!Auth.isLoggedIn()) {
                    UI.showToast('請先登入', 'error');
                    return;
                }
                this.handleDelete();
            });
        }
        
        const editModalClose = document.getElementById('edit-modal-close');
        if (editModalClose) {
            editModalClose.addEventListener('click', () => {
                UI.hideModal('edit-modal');
            });
        }
        
        const editCancel = document.getElementById('edit-cancel');
        if (editCancel) {
            editCancel.addEventListener('click', () => {
                UI.hideModal('edit-modal');
            });
        }
        
        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    UI.hideModal('edit-modal');
                }
            });
        }
        
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditSubmit(editForm);
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.hideModal('edit-modal');
            }
        });
    },
    
    showEditModal: async function() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('請先登入並完成二階段驗證', 'error');
            return;
        }
        
        const character = await CharacterData.getById(this.currentCharacterId);
        if (!character) return;
        
        const form = document.getElementById('edit-form');
        if (form) {
            UI.populateForm(form, character);
        }
        
        UI.showModal('edit-modal');
    },
    
    handleEditSubmit: async function(form) {
        if (!Auth.isLoggedIn()) {
            UI.showToast('請先登入', 'error');
            return;
        }
        
        const formData = UI.getFormData(form);
        const id = this.currentCharacterId;
        
        const updated = await CharacterData.update(id, formData);
        
        if (updated) {
            UI.showToast('角色已更新');
            UI.updateDetailPage(updated);
            UI.hideModal('edit-modal');
        } else {
            UI.showToast('更新失敗', 'error');
        }
    },
    
    handleDelete: async function() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('請先登入', 'error');
            return;
        }
        
        if (confirm('確定要刪除這個角色嗎？此操作無法恢復。')) {
            const deleted = await CharacterData.delete(this.currentCharacterId);
            
            if (deleted) {
                UI.showToast('角色已刪除');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                UI.showToast('刪除失敗', 'error');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DetailPage.init();
});

if (typeof window !== 'undefined') {
    window.DetailPage = DetailPage;
}
