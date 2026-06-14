const UI = {
    renderCharacterCard(character) {
        const rarityClass = character.rarity === 5 ? 'rarity-5' : 'rarity-4';
        const elementName = CharacterData.getElementName(character.element);
        const portrait = character.portrait || character.avatar;
        const portraitHtml = portrait 
            ? `<img src="${portrait}" alt="${character.name}">`
            : `<div style="width:100%;height:100%;background:var(--color-bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:600;">${character.name[0]}</div>`;
        
        return `
            <article class="character-card ${rarityClass}" data-id="${character.id}">
                <div class="character-avatar">
                    <div class="avatar-ring">
                        ${portraitHtml}
                    </div>
                    <span class="element-icon" style="color: var(--element-${character.element});">${elementName}</span>
                </div>
                <h3 class="character-name">${character.name}</h3>
                <p class="character-element">${elementName} · ${CharacterData.getWeaponName(character.weapon)}</p>
            </article>
        `;
    },
    
    renderCharacterGrid(characters) {
        const grid = document.getElementById('character-grid');
        const count = document.getElementById('character-count');
        
        if (!grid) return;
        
        if (characters.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>沒有找到符合條件的角色</p>
                </div>
            `;
        } else {
            grid.innerHTML = characters.map(c => this.renderCharacterCard(c)).join('');
        }
        
        if (count) {
            count.textContent = `${characters.length} 位角色`;
        }
    },
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    showCharacterModal(editMode = false, character = null) {
        const modal = document.getElementById('character-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('character-form');
        
        if (!modal || !form) return;
        
        if (editMode && character) {
            title.textContent = '編輯角色';
            form.dataset.editId = character.id;
            this.populateForm(form, character);
        } else {
            title.textContent = '新增角色';
            delete form.dataset.editId;
            form.reset();
        }
        
        this.showModal('character-modal');
    },
    
    populateForm(form, character) {
        const textFields = [
            'name', 'title', 'fullname', 'element', 'weapon', 'region', 'rarity',
            'gender', 'affiliation', 'constellation', 'vision', 'dish', 'birthday',
            'vaCn', 'vaJp', 'description', 'story',
            'artwork', 'artwork2', 'portrait', 'avatar', 'extraImage1', 'extraImage2'
        ];
        
        textFields.forEach(field => {
            const input = form.elements[field];
            if (input && character[field] !== undefined) {
                input.value = character[field];
            }
        });
        
        if (character.skills) {
            const skillFieldMap = {
                'skillNormalName': character.skills.normal?.name,
                'skillNormalDesc': character.skills.normal?.description,
                'skillElementalName': character.skills.elemental?.name,
                'skillElementalDesc': character.skills.elemental?.description,
                'skillBurstName': character.skills.burst?.name,
                'skillBurstDesc': character.skills.burst?.description
            };
            
            Object.entries(skillFieldMap).forEach(([id, value]) => {
                const el = document.getElementById(`edit-${id}`);
                if (el) el.value = value || '';
            });
        }
        
        const imagePreviewMap = {
            'edit-artwork-preview': character.artwork,
            'edit-artwork2-preview': character.artwork2,
            'edit-portrait-preview': character.portrait || character.avatar,
            'edit-avatar-preview': character.avatar,
            'edit-extra1-preview': character.extraImage1,
            'edit-extra2-preview': character.extraImage2
        };
        
        Object.entries(imagePreviewMap).forEach(([id, url]) => {
            const el = document.getElementById(id);
            if (el && url) {
                el.innerHTML = `<img src="${url}" alt="預覽">`;
            }
        });
    },
    
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        if (data.rarity) {
            data.rarity = parseInt(data.rarity, 10);
        }
        
        data.skills = {
            normal: {
                name: data.skillNormalName || '',
                description: data.skillNormalDesc || ''
            },
            elemental: {
                name: data.skillElementalName || '',
                description: data.skillElementalDesc || ''
            },
            burst: {
                name: data.skillBurstName || '',
                description: data.skillBurstDesc || ''
            }
        };
        
        delete data.skillNormalName;
        delete data.skillNormalDesc;
        delete data.skillElementalName;
        delete data.skillElementalDesc;
        delete data.skillBurstName;
        delete data.skillBurstDesc;
        
        return data;
    },
    
    setupAvatarUpload() {
        const uploadBtn = document.getElementById('upload-avatar-btn');
        const fileInput = document.getElementById('char-avatar-file');
        const preview = document.getElementById('avatar-preview');
        const urlInput = document.getElementById('char-avatar');
        
        if (!uploadBtn || !fileInput || !preview || !urlInput) return;
        
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    urlInput.value = base64;
                    preview.innerHTML = `<img src="${base64}" alt="預覽">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url) {
                preview.innerHTML = `<img src="${url}" alt="預覽" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
            } else {
                preview.innerHTML = '<span>預覽</span>';
            }
        });
    },
    
    showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    updateDetailPage(character) {
        if (!character) return;
        
        document.title = `${character.name} - 原神角色 Wiki`;
        
        const artworkImg = document.getElementById('artwork-image');
        if (artworkImg) {
            artworkImg.src = character.artwork || '';
        }
        
        const portraitImg = document.getElementById('portrait-image');
        if (portraitImg) {
            portraitImg.src = character.portrait || character.avatar || '';
        }
        
        const galleryArtwork1 = document.getElementById('gallery-artwork-1');
        if (galleryArtwork1) {
            galleryArtwork1.src = character.artwork || '';
        }
        
        const galleryArtwork2 = document.getElementById('gallery-artwork-2');
        if (galleryArtwork2) {
            galleryArtwork2.src = character.artwork2 || '';
        }
        
        const galleryPortrait = document.getElementById('gallery-portrait');
        if (galleryPortrait) {
            galleryPortrait.src = character.portrait || character.avatar || '';
        }
        
        const galleryExtra1 = document.getElementById('gallery-extra-1');
        if (galleryExtra1) {
            galleryExtra1.src = character.extraImage1 || '';
        }
        
        const galleryExtra2 = document.getElementById('gallery-extra-2');
        if (galleryExtra2) {
            galleryExtra2.src = character.extraImage2 || '';
        }
        
        document.getElementById('char-name').textContent = character.name;
        document.getElementById('char-title').textContent = character.title || '';
        document.getElementById('char-description').textContent = character.description || '暫無介紹';
        
        const rarityStars = document.getElementById('rarity-stars');
        if (rarityStars) {
            rarityStars.textContent = character.rarity === 5 ? '★★★★★' : '★★★★';
            rarityStars.style.color = character.rarity === 5 ? '#D4AF37' : '#6B5B95';
        }
        
        const elementOverlay = document.getElementById('element-overlay');
        if (elementOverlay) {
            elementOverlay.textContent = CharacterData.getElementName(character.element);
            elementOverlay.style.background = `var(--element-${character.element})`;
            if (['anemo', 'geo', 'hydro', 'cryo', 'dendro'].includes(character.element)) {
                elementOverlay.style.color = 'var(--color-text-primary)';
            }
        }
        
        const infoFields = {
            'info-fullname': character.fullname,
            'info-affiliation': character.affiliation,
            'info-region': CharacterData.getRegionName(character.region),
            'info-element': CharacterData.getElementName(character.element),
            'info-weapon': CharacterData.getWeaponName(character.weapon),
            'info-gender': character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : character.gender || '-',
            'info-birthday': character.birthday,
            'info-constellation': character.constellation,
            'info-vision': character.vision,
            'info-dish': character.dish,
            'info-va-cn': character.vaCn,
            'info-va-jp': character.vaJp
        };
        
        Object.entries(infoFields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value || '-';
            }
        });
        
        if (character.skills) {
            document.getElementById('skill-normal-name').textContent = character.skills.normal?.name || '-';
            document.getElementById('skill-normal-desc').textContent = character.skills.normal?.description || '暫無資料';
            document.getElementById('skill-elemental-name').textContent = character.skills.elemental?.name || '-';
            document.getElementById('skill-elemental-desc').textContent = character.skills.elemental?.description || '暫無資料';
            document.getElementById('skill-burst-name').textContent = character.skills.burst?.name || '-';
            document.getElementById('skill-burst-desc').textContent = character.skills.burst?.description || '暫無資料';
        }
        
        const constellationList = document.getElementById('constellation-list');
        if (constellationList) {
            if (character.constellations && character.constellations.length > 0) {
                constellationList.innerHTML = character.constellations.map(c => `
                    <div class="constellation-card">
                        <span class="constellation-level">第${c.level}層</span>
                        <h4 class="constellation-name">${c.name}</h4>
                        <p class="constellation-desc">${c.desc}</p>
                    </div>
                `).join('');
            } else {
                constellationList.innerHTML = '<p class="empty-message">暫無命之座資料</p>';
            }
        }
        
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            storyContent.innerHTML = character.story ? `<p>${character.story}</p>` : '<p class="empty-message">暫無故事資料</p>';
        }
        
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            UI.populateForm(editForm, character);
        }
    },
    
    switchTab(tabName) {
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}