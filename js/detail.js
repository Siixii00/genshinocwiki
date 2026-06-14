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
        this.setupAllImageUploads();
        this.bindEvents();
    },
    
    setupAllImageUploads() {
        const uploadConfigs = [
            { btnClass: 'upload-btn', prefix: 'edit-artwork' },
            { btnClass: 'upload-btn', prefix: 'edit-artwork2' },
            { btnClass: 'upload-btn', prefix: 'edit-portrait' },
            { btnClass: 'upload-btn', prefix: 'edit-avatar' },
            { btnClass: 'upload-btn', prefix: 'edit-extra1' },
            { btnClass: 'upload-btn', prefix: 'edit-extra2' }
        ];
        
        document.querySelectorAll('.upload-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const fileInput = document.getElementById(`${target}-file`);
                if (fileInput) fileInput.click();
            });
        });
        
        ['artwork', 'artwork2', 'portrait', 'avatar', 'extra1', 'extra2'].forEach(field => {
            const fileInput = document.getElementById(`edit-${field}-file`);
            const hiddenInput = document.getElementById(`edit-${field}`);
            const preview = document.getElementById(`edit-${field}-preview`);
            
            if (fileInput && hiddenInput && preview) {
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
    
    bindEvents() {
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                UI.switchTab(tab.dataset.tab);
            });
        });
        
        const editBtn = document.getElementById('edit-character-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.showEditModal();
            });
        }
        
        const deleteBtn = document.getElementById('delete-character-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
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
        const character = await CharacterData.getById(this.currentCharacterId);
        if (!character) return;
        
        const form = document.getElementById('edit-form');
        if (form) {
            UI.populateForm(form, character);
        }
        
        UI.showModal('edit-modal');
    },
    
    handleEditSubmit: async function(form) {
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
