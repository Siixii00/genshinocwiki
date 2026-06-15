const UI = {
    renderCharacterCard(character) {
        const rarityClass = character.rarity === 5 ? 'rarity-5' : 'rarity-4';
        const elementName = CharacterData.getElementName(character.element);
        const idcard = character.images?.idcard || character.idcard;
        const portrait = character.images?.portrait || character.portrait;
        const cardImage = idcard || portrait;
        const cardImageHtml = cardImage
            ? `<img src="${cardImage}" alt="${character.name}">`
            : `<div style="width:100%;height:100%;background:var(--color-bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:600;">${character.name[0]}</div>`;
        
        return `
            <article class="character-card ${rarityClass}" data-id="${character.id}">
                <div class="character-avatar">
                    <div class="avatar-ring">
                        ${cardImageHtml}
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
        
        if (!characters || !Array.isArray(characters)) {
            characters = [];
        }
        
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
            'vaCn', 'vaJp', 'description'
        ];
        
        textFields.forEach(field => {
            const input = form.elements[field];
            if (input && character[field] !== undefined) {
                input.value = character[field];
            }
        });
        
        const storyFields = [
            { id: 'edit-story-detail', value: character.stories?.detail || character.storyDetail },
            { id: 'edit-story-1', value: character.stories?.story1 || character.story1 },
            { id: 'edit-story-2', value: character.stories?.story2 || character.story2 },
            { id: 'edit-story-3', value: character.stories?.story3 || character.story3 },
            { id: 'edit-story-4', value: character.stories?.story4 || character.story4 },
            { id: 'edit-story-5', value: character.stories?.story5 || character.story5 },
            { id: 'edit-story-vision', value: character.stories?.vision || character.storyVision },
            { id: 'edit-story-extra', value: character.stories?.extra || character.storyExtra }
        ];
        
        storyFields.forEach(({ id, value }) => {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        });
        
        const imageFields = {
            'artwork': character.images?.artwork,
            'portrait': character.images?.portrait,
            'avatar': character.images?.avatar,
            'idcard': character.images?.idcard
        };
        
        Object.entries(imageFields).forEach(([field, url]) => {
            const input = form.elements[field];
            if (input && url) {
                input.value = url;
            }
        });
        
        if (character.skills) {
            const skillFieldMap = {
                'skillNormalName': character.skills.normal?.name,
                'skillNormalDesc': character.skills.normal?.desc,
                'skillElementalName': character.skills.elemental?.name,
                'skillElementalDesc': character.skills.elemental?.desc,
                'skillBurstName': character.skills.burst?.name,
                'skillBurstDesc': character.skills.burst?.desc
            };
            
            Object.entries(skillFieldMap).forEach(([id, value]) => {
                const el = document.getElementById(`edit-${id}`);
                if (el) el.value = value || '';
            });
        }
        
        const imagePreviewMap = {
            'edit-artwork-preview': character.images?.artwork,
            'edit-portrait-preview': character.images?.portrait,
            'edit-avatar-preview': character.images?.avatar,
            'edit-idcard-preview': character.images?.idcard
        };
        
        Object.entries(imagePreviewMap).forEach(([id, url]) => {
            const el = document.getElementById(id);
            if (el) {
                if (url) {
                    el.innerHTML = `<img src="${url}" alt="預覽">`;
                } else {
                    const label = el.closest('.image-upload-item')?.querySelector('span')?.textContent || '預覽';
                    el.innerHTML = `<span>${label}</span>`;
                }
            }
        });
        
        this.populateCustomImages(character.customImages || []);
        this.populateConstellationEdit(character.constellations);
        this.populatePassivesEdit(character.passives || []);
        this.populateVoiceEdit(character.voices?.normal || [], character.voices?.combat || []);
    },
    
    populateConstellationEdit(constellations) {
        const container = document.getElementById('constellation-edit-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 1; i <= 6; i++) {
            const c = constellations?.find(c => c.level === i) || { level: i, name: '', desc: '', icon: '' };
            container.innerHTML += `
                <div class="constellation-edit-item" data-level="${i}">
                    <div class="constellation-edit-header">
                        <span class="constellation-edit-level">第${i}層</span>
                    </div>
                    <div class="constellation-edit-body">
                        <div class="constellation-icon-upload">
                            <div class="constellation-icon-preview" id="constellation-icon-${i}">
                                ${c.icon ? `<img src="${c.icon}" alt="命之座圖標">` : '<span>圖標</span>'}
                            </div>
                            <input type="text" id="constellation-icon-url-${i}" placeholder="圖標 URL" value="${c.icon || ''}" class="constellation-icon-url">
                            <input type="hidden" id="constellation-icon-hidden-${i}" value="${c.icon || ''}" name="constellationIcon${i}">
                        </div>
                        <div class="constellation-edit-fields">
                            <div class="form-group">
                                <label>命之座名稱</label>
                                <input type="text" id="constellation-name-${i}" name="constellationName${i}" value="${c.name || ''}">
                            </div>
                            <div class="form-group">
                                <label>命之座描述</label>
                                <textarea id="constellation-desc-${i}" name="constellationDesc${i}" rows="2">${c.desc || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        for (let i = 1; i <= 6; i++) {
            const urlInput = document.getElementById(`constellation-icon-url-${i}`);
            const preview = document.getElementById(`constellation-icon-${i}`);
            const hiddenInput = document.getElementById(`constellation-icon-hidden-${i}`);
            
            if (urlInput && preview && hiddenInput) {
                urlInput.addEventListener('input', () => {
                    const url = urlInput.value.trim();
                    hiddenInput.value = url;
                    if (url) {
                        preview.innerHTML = `<img src="${url}" alt="命之座圖標" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                    } else {
                        preview.innerHTML = '<span>圖標</span>';
                    }
                });
            }
        }
    },
    
    populateVoiceEdit(normalVoices, combatVoices) {
        const normalContainer = document.getElementById('normal-voice-edit-list');
        const combatContainer = document.getElementById('combat-voice-edit-list');
        
        if (normalContainer) {
            normalContainer.innerHTML = '';
            if (normalVoices && normalVoices.length > 0) {
                normalVoices.forEach((voice, index) => {
                    this.addVoiceEditItem(normalContainer, voice.title, voice.content, voice.audioUrl, index, 'normal');
                });
            }
        }
        
        if (combatContainer) {
            combatContainer.innerHTML = '';
            if (combatVoices && combatVoices.length > 0) {
                combatVoices.forEach((voice, index) => {
                    this.addVoiceEditItem(combatContainer, voice.title, voice.content, voice.audioUrl, index, 'combat');
                });
            }
        }
    },
    
    addVoiceEditItem(container, title = '', content = '', audioUrl = '', index = null, type = 'normal') {
        if (!container) return;
        
        const itemIndex = index !== null ? index : container.children.length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'voice-edit-item';
        itemDiv.dataset.index = itemIndex;
        itemDiv.dataset.type = type;
        
        itemDiv.innerHTML = `
            <div class="voice-edit-header">
                <input type="text" class="voice-title-input" value="${title}" placeholder="語音標題">
                <button type="button" class="btn btn-sm btn-danger remove-voice-btn">刪除</button>
            </div>
            <div class="voice-edit-body">
                <div class="form-group">
                    <label>語音內容</label>
                    <textarea class="voice-content-input" rows="2" placeholder="語音文字內容">${content}</textarea>
                </div>
                <div class="form-group">
                    <label>音檔 URL（選填）</label>
                    <input type="text" class="voice-audio-input" value="${audioUrl}" placeholder="MP3 URL">
                </div>
            </div>
        `;
        
        container.appendChild(itemDiv);
        
        const removeBtn = itemDiv.querySelector('.remove-voice-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => itemDiv.remove());
        }
    },
    
    getVoicesData(type) {
        const container = document.getElementById(`${type}-voice-edit-list`);
        if (!container) return [];
        
        const voices = [];
        container.querySelectorAll('.voice-edit-item').forEach(item => {
            const title = item.querySelector('.voice-title-input')?.value || '';
            const content = item.querySelector('.voice-content-input')?.value || '';
            const audioUrl = item.querySelector('.voice-audio-input')?.value || '';
            if (title || content) {
                voices.push({ title, content, audioUrl });
            }
        });
        return voices;
    },
    
    populateCustomImages(customImages) {
        const container = document.getElementById('custom-images-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (customImages && customImages.length > 0) {
            customImages.forEach((img, index) => {
                this.addCustomImageItem(img.title, img.images || [], index);
            });
        }
    },
    
    addCustomImageItem(title = '', images = [], index = null) {
        const container = document.getElementById('custom-images-list');
        if (!container) return;
        
        const itemIndex = index !== null ? index : container.children.length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'custom-image-item';
        itemDiv.dataset.index = itemIndex;
        
        let imagesHtml = '';
        if (images.length > 0) {
            images.forEach((url, imgIndex) => {
                imagesHtml += `
                    <div class="custom-image-entry" data-img-index="${imgIndex}">
                        <input type="text" class="custom-image-url" value="${url}" placeholder="圖片 URL">
                        <button type="button" class="btn btn-sm btn-danger remove-custom-image-btn">移除</button>
                    </div>
                `;
            });
        }
        
        itemDiv.innerHTML = `
            <div class="custom-image-header">
                <input type="text" class="custom-image-title" value="${title}" placeholder="標題（例如：活動圖片、網頁活動等）">
                <button type="button" class="btn btn-sm btn-danger remove-custom-section-btn">刪除區塊</button>
            </div>
            <div class="custom-image-entries">
                ${imagesHtml || `
                    <div class="custom-image-entry" data-img-index="0">
                        <input type="text" class="custom-image-url" value="" placeholder="圖片 URL">
                        <button type="button" class="btn btn-sm btn-danger remove-custom-image-btn">移除</button>
                    </div>
                `}
            </div>
            <button type="button" class="btn btn-sm btn-secondary add-custom-image-entry-btn">+ 新增圖片</button>
        `;
        
        container.appendChild(itemDiv);
        this.bindCustomImageEvents(itemDiv);
    },
    
    bindCustomImageEvents(itemDiv) {
        const removeSectionBtn = itemDiv.querySelector('.remove-custom-section-btn');
        if (removeSectionBtn) {
            removeSectionBtn.addEventListener('click', () => itemDiv.remove());
        }
        
        const addImageBtn = itemDiv.querySelector('.add-custom-image-entry-btn');
        if (addImageBtn) {
            addImageBtn.addEventListener('click', () => {
                const entriesContainer = itemDiv.querySelector('.custom-image-entries');
                const newIndex = entriesContainer.children.length;
                const entryDiv = document.createElement('div');
                entryDiv.className = 'custom-image-entry';
                entryDiv.dataset.imgIndex = newIndex;
                entryDiv.innerHTML = `
                    <input type="text" class="custom-image-url" value="" placeholder="圖片 URL">
                    <button type="button" class="btn btn-sm btn-danger remove-custom-image-btn">移除</button>
                `;
                entriesContainer.appendChild(entryDiv);
                this.bindCustomImageEntryEvents(entryDiv);
            });
        }
        
        itemDiv.querySelectorAll('.custom-image-entry').forEach(entry => {
            this.bindCustomImageEntryEvents(entry);
        });
    },
    
    bindCustomImageEntryEvents(entryDiv) {
        const removeBtn = entryDiv.querySelector('.remove-custom-image-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => entryDiv.remove());
        }
    },
    
    getCustomImagesData() {
        const container = document.getElementById('custom-images-list');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.custom-image-item').forEach(itemDiv => {
            const title = itemDiv.querySelector('.custom-image-title')?.value || '';
            const images = [];
            itemDiv.querySelectorAll('.custom-image-url').forEach(input => {
                const url = input.value.trim();
                if (url) images.push(url);
            });
            if (title || images.length > 0) {
                items.push({ title, images });
            }
        });
        return items;
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
                desc: data.skillNormalDesc || ''
            },
            elemental: {
                name: data.skillElementalName || '',
                desc: data.skillElementalDesc || ''
            },
            burst: {
                name: data.skillBurstName || '',
                desc: data.skillBurstDesc || ''
            }
        };
        
        delete data.skillNormalName;
        delete data.skillNormalDesc;
        delete data.skillElementalName;
        delete data.skillElementalDesc;
        delete data.skillBurstName;
        delete data.skillBurstDesc;
        
        data.constellations = [];
        for (let i = 1; i <= 6; i++) {
            const name = document.getElementById(`constellation-name-${i}`)?.value || '';
            const desc = document.getElementById(`constellation-desc-${i}`)?.value || '';
            const icon = document.getElementById(`constellation-icon-hidden-${i}`)?.value || '';
            data.constellations.push({ level: i, name, desc, icon });
        }
        
        data.customImages = this.getCustomImagesData();
        
        data.passives = this.getPassivesData();
        
        data.voices = {
            normal: this.getVoicesData('normal'),
            combat: this.getVoicesData('combat')
        };
        
        data.images = {
            artwork: data.artwork || null,
            portrait: data.portrait || null,
            avatar: data.avatar || null,
            idcard: data.idcard || null
        };
        
        data.model = {
            type: data.modelType || null,
            url: data.modelUrl || null
        };
        
        data.stories = {
            detail: data.storyDetail || null,
            story1: data.story1 || null,
            story2: data.story2 || null,
            story3: data.story3 || null,
            story4: data.story4 || null,
            story5: data.story5 || null,
            vision: data.storyVision || null,
            extra: data.storyExtra || null
        };
        
        delete data.artwork;
        delete data.portrait;
        delete data.avatar;
        delete data.idcard;
        delete data.modelType;
        delete data.modelUrl;
        delete data.storyDetail;
        delete data.story1;
        delete data.story2;
        delete data.story3;
        delete data.story4;
        delete data.story5;
        delete data.storyVision;
        delete data.storyExtra;
        
        return data;
    },
    
    populatePassivesEdit(passives) {
        const container = document.getElementById('passives-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (passives && passives.length > 0) {
            passives.forEach((p, index) => {
                this.addPassiveEditItem(p.name, p.desc, p.icon, index);
            });
        }
    },
    
    addPassiveEditItem(name = '', desc = '', icon = '', index = null) {
        const container = document.getElementById('passives-list');
        if (!container) return;
        
        const itemIndex = index !== null ? index : container.children.length;
        if (itemIndex >= 7) return;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'passive-edit-item';
        itemDiv.dataset.index = itemIndex;
        
        itemDiv.innerHTML = `
            <div class="passive-edit-header">
                <span class="passive-number">天賦 ${itemIndex + 1}</span>
                <button type="button" class="btn btn-sm btn-danger remove-passive-btn">刪除</button>
            </div>
            <div class="passive-edit-body">
                <div class="passive-icon-upload">
                    <div class="passive-icon-preview" id="passive-icon-preview-${itemIndex}">
                        ${icon ? `<img src="${icon}" alt="天賦圖標">` : '<span>圖標</span>'}
                    </div>
                    <input type="text" class="passive-icon-url" placeholder="圖標 URL" value="${icon}">
                </div>
                <div class="passive-edit-fields">
                    <div class="form-group">
                        <label>天賦名稱</label>
                        <input type="text" class="passive-name-input" value="${name}" placeholder="天賦名稱">
                    </div>
                    <div class="form-group">
                        <label>天賦描述</label>
                        <textarea class="passive-desc-input" rows="2" placeholder="天賦描述">${desc}</textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(itemDiv);
        
        const removeBtn = itemDiv.querySelector('.remove-passive-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                itemDiv.remove();
                this.renumberPassives();
            });
        }
        
        const iconUrlInput = itemDiv.querySelector('.passive-icon-url');
        const iconPreview = itemDiv.querySelector('.passive-icon-preview');
        if (iconUrlInput && iconPreview) {
            iconUrlInput.addEventListener('input', () => {
                const url = iconUrlInput.value.trim();
                if (url) {
                    iconPreview.innerHTML = `<img src="${url}" alt="天賦圖標" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                } else {
                    iconPreview.innerHTML = '<span>圖標</span>';
                }
            });
        }
    },
    
    renumberPassives() {
        const container = document.getElementById('passives-list');
        if (!container) return;
        
        container.querySelectorAll('.passive-edit-item').forEach((item, index) => {
            item.dataset.index = index;
            const numberSpan = item.querySelector('.passive-number');
            if (numberSpan) {
                numberSpan.textContent = `天賦 ${index + 1}`;
            }
            const iconPreview = item.querySelector('.passive-icon-preview');
            if (iconPreview) {
                iconPreview.id = `passive-icon-preview-${index}`;
            }
        });
    },
    
    getPassivesData() {
        const container = document.getElementById('passives-list');
        if (!container) return [];
        
        const passives = [];
        container.querySelectorAll('.passive-edit-item').forEach(item => {
            const name = item.querySelector('.passive-name-input')?.value || '';
            const desc = item.querySelector('.passive-desc-input')?.value || '';
            const icon = item.querySelector('.passive-icon-url')?.value || '';
            if (name || desc) {
                passives.push({ name, desc, icon });
            }
        });
        return passives;
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
            artworkImg.src = character.images?.idcard || character.images?.portrait || character.images?.artwork || '';
        }
        
        const portraitImg = document.getElementById('portrait-image');
        if (portraitImg) {
            portraitImg.src = character.images?.portrait || character.images?.idcard || '';
        }
        
        const galleryArtwork = document.getElementById('gallery-artwork');
        if (galleryArtwork) {
            galleryArtwork.src = character.images?.artwork || '';
        }
        
        const galleryPortrait = document.getElementById('gallery-portrait');
        if (galleryPortrait) {
            galleryPortrait.src = character.images?.portrait || '';
        }
        
        const galleryIdcard = document.getElementById('gallery-idcard');
        if (galleryIdcard) {
            galleryIdcard.src = character.images?.idcard || '';
        }
        
        this.setupGalleryLightbox(character);
        
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
            'info-va-cn': character.va?.cn,
            'info-va-jp': character.va?.jp
        };
        
        Object.entries(infoFields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value || '-';
            }
        });
        
        if (character.skills) {
            document.getElementById('skill-normal-name').textContent = character.skills.normal?.name || '-';
            document.getElementById('skill-normal-desc').textContent = character.skills.normal?.desc || '暫無資料';
            document.getElementById('skill-elemental-name').textContent = character.skills.elemental?.name || '-';
            document.getElementById('skill-elemental-desc').textContent = character.skills.elemental?.desc || '暫無資料';
            document.getElementById('skill-burst-name').textContent = character.skills.burst?.name || '-';
            document.getElementById('skill-burst-desc').textContent = character.skills.burst?.desc || '暫無資料';
        }
        
        const constellationList = document.getElementById('constellation-list');
        if (constellationList) {
            if (character.constellations && character.constellations.length > 0) {
                constellationList.innerHTML = character.constellations.map(c => `
                    <div class="constellation-card">
                        ${c.icon ? `<div class="constellation-icon"><img src="${c.icon}" alt="${c.name}"></div>` : ''}
                        <span class="constellation-level">第${c.level}層</span>
                        <h4 class="constellation-name">${c.name || '-'}</h4>
                        <p class="constellation-desc">${c.desc || '暫無資料'}</p>
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
        
        const modelContent = document.getElementById('model-content');
        if (modelContent) {
            if (character.model?.type && character.model?.url) {
                if (character.model.type === 'video') {
                    const videoUrl = character.model.url;
                    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
                    if (youtubeMatch) {
                        modelContent.innerHTML = `
                            <div class="model-video-wrapper">
                                <iframe 
                                    src="https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&loop=1&playlist=${youtubeMatch[1]}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        `;
                    } else {
                        modelContent.innerHTML = `
                            <div class="model-video-wrapper">
                                <video controls loop muted playsinline>
                                    <source src="${videoUrl}" type="video/mp4">
                                    <source src="${videoUrl}" type="video/webm">
                                    <source src="${videoUrl}" type="video/ogg">
                                    您的瀏覽器不支援影片播放
                                </video>
                            </div>
                        `;
                    }
                } else if (character.model.type === 'gif' || character.model.type === 'image') {
                    modelContent.innerHTML = `
                        <div class="model-image-wrapper">
                            <img src="${character.model.url}" alt="模型展示">
                        </div>
                    `;
                } else {
                    modelContent.innerHTML = '<p class="empty-message">暫無模型展示資料</p>';
                }
            } else {
                modelContent.innerHTML = '<p class="empty-message">暫無模型展示資料</p>';
            }
        }
        
        this.hideEmptyInfoRows(character);
        this.renderVoices(character.voices?.normal || [], character.voices?.combat || []);
        
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            UI.populateForm(editForm, character);
        }
    },
    
    hideEmptyInfoRows(character) {
        const rowMap = {
            'info-fullname': character.fullname,
            'info-affiliation': character.affiliation,
            'info-birthday': character.birthday,
            'info-constellation': character.constellation,
            'info-vision': character.vision,
            'info-dish': character.dish,
            'info-va-cn': character.va?.cn,
            'info-va-jp': character.va?.jp
        };
        
        Object.entries(rowMap).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                const row = el.closest('tr');
                if (row) {
                    row.style.display = value ? '' : 'none';
                }
            }
        });
        
        if (!character.images?.idcard) {
            const idcardItem = document.getElementById('gallery-idcard')?.closest('.gallery-item');
            if (idcardItem) idcardItem.style.display = 'none';
        }
        
        this.renderCustomGallery(character.customImages || []);
    },
    
    renderCustomGallery(customImages) {
        const container = document.getElementById('custom-gallery-section');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!customImages || customImages.length === 0) return;
        
        customImages.forEach(section => {
            if (!section.images || section.images.length === 0) return;
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'gallery-section';
            sectionDiv.innerHTML = `
                <h3>${section.title || '其他圖片'}</h3>
                <div class="gallery-grid">
                    ${section.images.map(url => `
                        <div class="gallery-item">
                            <img src="${url}" alt="${section.title || '圖片'}">
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(sectionDiv);
        });
    },
    
    renderVoices(normalVoices, combatVoices) {
        const normalContainer = document.getElementById('normal-voice-list');
        const combatContainer = document.getElementById('combat-voice-list');
        
        if (normalContainer) {
            if (normalVoices && normalVoices.length > 0) {
                normalContainer.innerHTML = normalVoices.map(v => this.renderVoiceItem(v)).join('');
            } else {
                normalContainer.innerHTML = '<p class="empty-message">暫無語音資料</p>';
            }
        }
        
        if (combatContainer) {
            if (combatVoices && combatVoices.length > 0) {
                combatContainer.innerHTML = combatVoices.map(v => this.renderVoiceItem(v)).join('');
            } else {
                combatContainer.innerHTML = '<p class="empty-message">暫無語音資料</p>';
            }
        }
    },
    
    renderVoiceItem(voice) {
        const audioHtml = voice.audioUrl ? `
            <div class="voice-audio">
                <audio controls src="${voice.audioUrl}">您的瀏覽器不支援音訊播放</audio>
            </div>
        ` : '';
        
        return `
            <div class="voice-item">
                <div class="voice-info">
                    <h4 class="voice-title">${voice.title || '未命名'}</h4>
                    <p class="voice-content">${voice.content || ''}</p>
                </div>
                ${audioHtml}
            </div>
        `;
    },
    
    switchTab(tabName) {
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    },
    
    setupGalleryLightbox(character) {
        const galleryImages = [
            { id: 'gallery-artwork', url: character.images?.artwork },
            { id: 'gallery-portrait', url: character.images?.portrait },
            { id: 'gallery-idcard', url: character.images?.idcard },
            { id: 'artwork-image', url: character.images?.idcard || character.images?.artwork }
        ];
        
        galleryImages.forEach(({ id, url }) => {
            const img = document.getElementById(id);
            if (img && url) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    this.showLightbox(url);
                });
            }
        });
        
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxClose = document.getElementById('lightbox-close');
        
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    this.hideLightbox();
                }
            });
        }
        
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                this.hideLightbox();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLightbox();
            }
        });
    },
    
    showLightbox(url) {
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxImage = document.getElementById('lightbox-image');
        
        if (lightboxModal && lightboxImage && url) {
            lightboxImage.src = url;
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideLightbox() {
        const lightboxModal = document.getElementById('lightbox-modal');
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}