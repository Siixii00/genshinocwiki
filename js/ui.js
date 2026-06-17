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
            'vaCn', 'vaJp', 'description', 'avatarPosition', 'avatarScale'
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
        
        const avatarPositionInput = document.getElementById('edit-avatar-position');
        if (avatarPositionInput) {
            avatarPositionInput.value = character.avatarPosition || '';
        }
        
        const avatarScaleInput = document.getElementById('edit-avatar-scale');
        if (avatarScaleInput) {
            avatarScaleInput.value = character.avatarScale || '';
        }
        
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
                'skill-normal-name': character.skills.normal?.name,
                'skill-normal-desc': character.skills.normal?.desc,
                'skill-normal-icon': character.skills.normal?.icon,
                'skill-elemental-name': character.skills.elemental?.name,
                'skill-elemental-desc': character.skills.elemental?.desc,
                'skill-elemental-icon': character.skills.elemental?.icon,
                'skill-burst-name': character.skills.burst?.name,
                'skill-burst-desc': character.skills.burst?.desc,
                'skill-burst-icon': character.skills.burst?.icon
            };
            
            Object.entries(skillFieldMap).forEach(([id, value]) => {
                const el = document.getElementById(`edit-${id}`);
                if (el) el.value = value || '';
            });
            
            const skillIconPreviews = {
                'skill-normal-icon-preview': character.skills.normal?.icon,
                'skill-elemental-icon-preview': character.skills.elemental?.icon,
                'skill-burst-icon-preview': character.skills.burst?.icon
            };
            
            Object.entries(skillIconPreviews).forEach(([id, url]) => {
                const el = document.getElementById(id);
                if (el) {
                    if (url) {
                        el.innerHTML = `<img src="${url}" alt="技能圖標">`;
                    } else {
                        el.innerHTML = '<span>圖標</span>';
                    }
                }
            });
            
            this.populateSkillTable('normal', character.skills.normal?.table);
            this.populateSkillTable('elemental', character.skills.elemental?.table);
            this.populateSkillTable('burst', character.skills.burst?.table);
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
        
        const modelTypeSelect = document.getElementById('edit-model-type');
        if (modelTypeSelect && character.model?.type) {
            modelTypeSelect.value = character.model.type;
        }
        
        const modelUrlInput = document.getElementById('edit-model-url');
        if (modelUrlInput && character.model?.url) {
            modelUrlInput.value = character.model.url;
        }
        
        const constellationImageInput = document.getElementById('edit-constellation-image');
        const constellationBgPreview = document.getElementById('constellation-bg-preview');
        const bgSettings = character.constellationBgSettings || { scale: 100, posX: 50, posY: 50, nodeSize: 80 };
        
        if (constellationImageInput) {
            constellationImageInput.value = character.constellationImage || '';
            if (constellationBgPreview) {
                if (character.constellationImage) {
                    constellationBgPreview.innerHTML = `<img src="${character.constellationImage}" alt="命之座底圖" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                } else {
                    constellationBgPreview.innerHTML = '<span>底圖</span>';
                }
            }
            
            const scaleInput = document.getElementById('edit-constellation-scale');
            const posXInput = document.getElementById('edit-constellation-pos-x');
            const posYInput = document.getElementById('edit-constellation-pos-y');
            const nodeSizeInput = document.getElementById('edit-constellation-node-size');
            const controlsDiv = document.getElementById('constellation-image-controls');
            
            if (scaleInput) scaleInput.value = bgSettings.scale || 100;
            if (posXInput) posXInput.value = bgSettings.posX || 50;
            if (posYInput) posYInput.value = bgSettings.posY || 50;
            if (nodeSizeInput) nodeSizeInput.value = bgSettings.nodeSize || 80;
            
            const scaleValue = document.getElementById('constellation-scale-value');
            if (scaleValue) scaleValue.textContent = `${bgSettings.scale || 100}%`;
            
            const nodeSizeValue = document.getElementById('constellation-node-size-value');
            if (nodeSizeValue) nodeSizeValue.textContent = `${bgSettings.nodeSize || 80}px`;
            
            if (controlsDiv) {
                controlsDiv.style.display = character.constellationImage ? 'flex' : 'none';
            }
            
            constellationImageInput.addEventListener('input', () => {
                const url = constellationImageInput.value.trim();
                if (url) {
                    constellationBgPreview.innerHTML = `<img src="${url}" alt="命之座底圖" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                    if (controlsDiv) controlsDiv.style.display = 'flex';
                } else {
                    constellationBgPreview.innerHTML = '<span>底圖</span>';
                    if (controlsDiv) controlsDiv.style.display = 'none';
                }
                this.initConstellationDragPreview();
            });
        }
        
        this.populateCustomImages(character.customImages || []);
        this.populateConstellationEdit(character.constellations);
        this.populatePassivesEdit(character.passives || []);
        this.populateVoiceEdit(character.voices?.normal || [], character.voices?.combat || []);
    },
    
    populateSkillTable(skillType, tableData) {
        const container = document.getElementById(`skill-${skillType}-table-container`);
        const clearBtn = document.getElementById(`clear-skill-${skillType}-table`);
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        
        if (!container) return;
        
        if (tableData && tableData.rows && tableData.rows.length > 0) {
            this.renderSkillTable(container, tableData, skillType);
            if (clearBtn) clearBtn.style.display = 'inline-flex';
            if (hiddenInput) hiddenInput.value = JSON.stringify(tableData);
        } else {
            container.innerHTML = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (hiddenInput) hiddenInput.value = '';
        }
    },
    
    renderSkillTable(container, tableData, skillType) {
        const { rows = [], headers = [] } = tableData;
        const rowCount = rows.length;
        const colCount = headers.length || (rows[0]?.length || 13);
        
        let html = '<div class="skill-table-container"><table class="skill-table">';
        
        if (headers.length > 0) {
            html += '<thead><tr>';
            headers.forEach((h, i) => {
                html += `<th><input type="text" value="${h}" data-skill="${skillType}" data-type="header" data-col="${i}" placeholder="標題"></th>`;
            });
            html += '</tr></thead>';
        }
        
        html += '<tbody>';
        rows.forEach((row, r) => {
            html += '<tr>';
            for (let c = 0; c < colCount; c++) {
                const val = row[c] || '';
                html += `<td><textarea data-skill="${skillType}" data-type="cell" data-row="${r}" data-col="${c}">${val}</textarea></td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        html += `
            <div class="skill-table-toolbar">
                <button type="button" class="btn btn-sm btn-secondary skill-format-btn" data-format="bold" title="粗體"><b>B</b></button>
                <button type="button" class="btn btn-sm btn-secondary skill-format-btn" data-format="italic" title="斜體"><i>I</i></button>
                <button type="button" class="btn btn-sm btn-secondary skill-format-btn" data-format="color" title="顏色">🎨</button>
                <input type="color" class="skill-color-picker" value="#ff0000" style="width:30px;height:30px;padding:0;border:none;cursor:pointer;">
            </div>
            <div class="skill-table-controls-row">
                <button type="button" class="btn btn-sm btn-secondary skill-table-action" data-action="addRow" data-skill="${skillType}">+ 新增列</button>
                <button type="button" class="btn btn-sm btn-secondary skill-table-action" data-action="addCol" data-skill="${skillType}">+ 新增欄</button>
                <button type="button" class="btn btn-sm btn-secondary skill-table-action" data-action="removeRow" data-skill="${skillType}">- 移除列</button>
                <button type="button" class="btn btn-sm btn-secondary skill-table-action" data-action="removeCol" data-skill="${skillType}">- 移除欄</button>
            </div>
        `;
        
        container.innerHTML = html;
        
        container.querySelectorAll('.skill-table textarea').forEach(input => {
            input.addEventListener('input', () => {
                const tableData = this.getCurrentSkillTableData(skillType);
                if (tableData) {
                    this.saveSkillTableData(skillType, tableData);
                }
            });
        });
        
        container.querySelectorAll('.skill-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activeTextarea = container.querySelector('.skill-table textarea:focus');
                if (!activeTextarea) return;
                
                const format = btn.dataset.format;
                const start = activeTextarea.selectionStart;
                const end = activeTextarea.selectionEnd;
                const text = activeTextarea.value;
                const selectedText = text.substring(start, end);
                
                if (format === 'bold') {
                    activeTextarea.value = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                } else if (format === 'italic') {
                    activeTextarea.value = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                } else if (format === 'color') {
                    const colorPicker = container.querySelector('.skill-color-picker');
                    const color = colorPicker?.value || '#ff0000';
                    activeTextarea.value = text.substring(0, start) + `[color:${color}]${selectedText}[/color]` + text.substring(end);
                }
                
                activeTextarea.dispatchEvent(new Event('input'));
            });
        });
        
        container.querySelector('.skill-color-picker')?.addEventListener('change', (e) => {
            const activeTextarea = container.querySelector('.skill-table textarea:focus');
            if (!activeTextarea) return;
            
            const start = activeTextarea.selectionStart;
            const end = activeTextarea.selectionEnd;
            const text = activeTextarea.value;
            const selectedText = text.substring(start, end);
            const color = e.target.value;
            
            activeTextarea.value = text.substring(0, start) + `[color:${color}]${selectedText}[/color]` + text.substring(end);
            activeTextarea.dispatchEvent(new Event('input'));
        });
        
        container.dispatchEvent(new CustomEvent('skillTableRendered', { bubbles: true }));
    },
    
    createDefaultSkillTable(skillType) {
        const defaultHeaders = ['等級', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
        const defaultRows = [
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '']
        ];
        return { headers: defaultHeaders, rows: defaultRows };
    },
    
    getCurrentSkillTableData(skillType) {
        const container = document.getElementById(`skill-${skillType}-table-container`);
        if (!container) return null;
        
        const table = container.querySelector('.skill-table');
        if (!table) return null;
        
        const headers = [];
        table.querySelectorAll('thead th input').forEach(input => {
            headers.push(input.value || '');
        });
        
        const rows = [];
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td textarea, td input').forEach(input => {
                row.push(input.value || '');
            });
            rows.push(row);
        });
        
        return { headers, rows };
    },
    
    addSkillTableRow(skillType) {
        console.log('[DEBUG] addSkillTableRow called for:', skillType);
        console.trace('[DEBUG] addSkillTableRow call stack');
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        let tableData = this.getCurrentSkillTableData(skillType) || (hiddenInput?.value ? JSON.parse(hiddenInput.value) : this.createDefaultSkillTable(skillType));
        const colCount = tableData.headers?.length || tableData.rows[0]?.length || 14;
        tableData.rows = tableData.rows || [];
        tableData.rows.push(new Array(colCount).fill(''));
        this.saveSkillTableData(skillType, tableData);
        this.renderSkillTable(document.getElementById(`skill-${skillType}-table-container`), tableData, skillType);
    },
    
    addSkillTableCol(skillType) {
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        let tableData = this.getCurrentSkillTableData(skillType) || (hiddenInput?.value ? JSON.parse(hiddenInput.value) : this.createDefaultSkillTable(skillType));
        tableData.headers = tableData.headers || [];
        tableData.headers.push('');
        tableData.rows = tableData.rows || [[]];
        tableData.rows.forEach(row => row.push(''));
        this.saveSkillTableData(skillType, tableData);
        this.renderSkillTable(document.getElementById(`skill-${skillType}-table-container`), tableData, skillType);
    },
    
    removeSkillTableRow(skillType) {
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        let tableData = this.getCurrentSkillTableData(skillType) || (hiddenInput?.value ? JSON.parse(hiddenInput.value) : this.createDefaultSkillTable(skillType));
        if (tableData.rows && tableData.rows.length > 1) {
            tableData.rows.pop();
            this.saveSkillTableData(skillType, tableData);
            this.renderSkillTable(document.getElementById(`skill-${skillType}-table-container`), tableData, skillType);
        }
    },
    
    removeSkillTableCol(skillType) {
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        let tableData = this.getCurrentSkillTableData(skillType) || (hiddenInput?.value ? JSON.parse(hiddenInput.value) : this.createDefaultSkillTable(skillType));
        if (tableData.headers && tableData.headers.length > 1) {
            tableData.headers.pop();
            tableData.rows?.forEach(row => row.pop());
            this.saveSkillTableData(skillType, tableData);
            this.renderSkillTable(document.getElementById(`skill-${skillType}-table-container`), tableData, skillType);
        }
    },
    
    saveSkillTableData(skillType, tableData) {
        const hiddenInput = document.getElementById(`skill-${skillType}-table-data`);
        if (hiddenInput) {
            hiddenInput.value = JSON.stringify(tableData);
        }
    },
    
    populateConstellationEdit(constellations) {
        const container = document.getElementById('constellation-edit-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const defaultPositions = [
            { x: 50, y: 10 },
            { x: 20, y: 30 },
            { x: 80, y: 30 },
            { x: 50, y: 50 },
            { x: 20, y: 70 },
            { x: 80, y: 70 }
        ];
        
        for (let i = 1; i <= 6; i++) {
            const c = constellations?.find(c => c.level === i) || { level: i, name: '', desc: '', icon: '', position: null };
            const pos = c.position || defaultPositions[i - 1];
            
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
                            <input type="text" id="constellation-icon-url-${i}" placeholder="圖床 URL (透明底)" value="${c.icon || ''}" class="constellation-icon-url">
                            <input type="hidden" id="constellation-icon-hidden-${i}" value="${c.icon || ''}" name="constellationIcon${i}">
                        </div>
                        <div class="constellation-edit-fields">
                            <div class="form-group">
                                <label>命之座名稱</label>
                                <input type="text" id="constellation-name-${i}" name="constellationName${i}" value="${c.name || ''}">
                            </div>
                            <div class="form-group">
                                <label>命之座描述</label>
                                <div class="text-format-toolbar">
                                    <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="bold" title="粗體"><b>B</b></button>
                                    <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="italic" title="斜體"><i>I</i></button>
                                    <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="color" title="顏色">🎨</button>
                                    <input type="color" class="text-color-picker" value="#ff0000" title="選擇顏色">
                                </div>
                                <textarea id="constellation-desc-${i}" name="constellationDesc${i}" rows="2" placeholder="支援 **粗體** *斜體* [color:#ff0000]顏色[/color]">${c.desc || ''}</textarea>
                            </div>
                        </div>
                        <input type="hidden" id="constellation-pos-hidden-${i}" value='${JSON.stringify(pos)}'>
                    </div>
                </div>
            `;
        }
        
        for (let i = 1; i <= 6; i++) {
            const iconUrlInput = document.getElementById(`constellation-icon-url-${i}`);
            const iconPreview = document.getElementById(`constellation-icon-${i}`);
            const iconHiddenInput = document.getElementById(`constellation-icon-hidden-${i}`);
            
            if (iconUrlInput && iconPreview && iconHiddenInput) {
                iconUrlInput.addEventListener('input', () => {
                    const url = iconUrlInput.value.trim();
                    iconHiddenInput.value = url;
                    if (url) {
                        iconPreview.innerHTML = `<img src="${url}" alt="命之座圖標" onerror="this.parentElement.innerHTML='<span>載入失敗</span>'">`;
                    } else {
                        iconPreview.innerHTML = '<span>圖標</span>';
                    }
                    this.updateDragPreviewIcon(i, url);
                });
            }
            
            const constellationItem = document.querySelector(`.constellation-edit-item[data-level="${i}"]`);
            const descTextarea = document.getElementById(`constellation-desc-${i}`);
            if (constellationItem && descTextarea) {
                this.setupTextFormatToolbar(constellationItem, descTextarea);
            }
        }
        
        this.initConstellationDragPreview();
    },
    
    initConstellationDragPreview() {
        const preview = document.getElementById('constellation-drag-preview');
        if (!preview) return;
        
        preview.innerHTML = '<svg class="constellation-drag-lines" id="constellation-drag-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>';
        
        const defaultPositions = [
            { x: 50, y: 15 },
            { x: 25, y: 35 },
            { x: 75, y: 35 },
            { x: 50, y: 55 },
            { x: 25, y: 80 },
            { x: 75, y: 80 }
        ];
        
        for (let i = 1; i <= 6; i++) {
            const posInput = document.getElementById(`constellation-pos-hidden-${i}`);
            const iconInput = document.getElementById(`constellation-icon-hidden-${i}`);
            
            let pos = defaultPositions[i - 1];
            if (posInput?.value) {
                try {
                    pos = JSON.parse(posInput.value);
                } catch (e) {}
            }
            
            const node = document.createElement('div');
            node.className = 'constellation-drag-node';
            node.dataset.level = i;
            node.id = `constellation-drag-node-${i}`;
            node.textContent = `C${i}`;
            node.style.left = `${pos.x}%`;
            node.style.top = `${pos.y}%`;
            node.style.transform = 'translate(-50%, -50%)';
            
            if (iconInput?.value) {
                node.innerHTML = `<img src="${iconInput.value}" alt="C${i}" onerror="this.parentElement.textContent='C${i}'">`;
            }
            
            node.addEventListener('mousedown', (e) => this.startDragNode(e, i));
            node.addEventListener('touchstart', (e) => this.startDragNode(e, i), { passive: false });
            
            preview.appendChild(node);
        }
        
        this.updateDragLines();
        this.updateBgPreviewSettings();
        
        const scaleInput = document.getElementById('edit-constellation-scale');
        const posXInput = document.getElementById('edit-constellation-pos-x');
        const posYInput = document.getElementById('edit-constellation-pos-y');
        const nodeSizeInput = document.getElementById('edit-constellation-node-size');
        
        if (scaleInput) {
            scaleInput.addEventListener('input', () => {
                const scaleValue = document.getElementById('constellation-scale-value');
                if (scaleValue) scaleValue.textContent = `${scaleInput.value}%`;
                this.updateBgPreviewSettings();
            });
        }
        
        if (posXInput) {
            posXInput.addEventListener('input', () => this.updateBgPreviewSettings());
        }
        
        if (posYInput) {
            posYInput.addEventListener('input', () => this.updateBgPreviewSettings());
        }
        
        if (nodeSizeInput) {
            nodeSizeInput.addEventListener('input', () => {
                const nodeSizeValue = document.getElementById('constellation-node-size-value');
                if (nodeSizeValue) nodeSizeValue.textContent = `${nodeSizeInput.value}px`;
                this.updateBgPreviewSettings();
            });
        }
        
        const bgInput = document.getElementById('edit-constellation-image');
        if (bgInput) {
            bgInput.addEventListener('input', () => this.updateBgPreviewSettings());
        }
    },
    
    updateBgPreviewSettings() {
        const preview = document.getElementById('constellation-drag-preview');
        const bgInput = document.getElementById('edit-constellation-image');
        const scaleInput = document.getElementById('edit-constellation-scale');
        const posXInput = document.getElementById('edit-constellation-pos-x');
        const posYInput = document.getElementById('edit-constellation-pos-y');
        const nodeSizeInput = document.getElementById('edit-constellation-node-size');
        
        if (!preview || !bgInput) return;
        
        const url = bgInput.value.trim();
        if (url) {
            const scale = scaleInput?.value || 100;
            const posX = posXInput?.value || 50;
            const posY = posYInput?.value || 50;
            
            preview.style.backgroundImage = `url(${url})`;
            preview.style.backgroundSize = `${scale}%`;
            preview.style.backgroundPosition = `${posX}% ${posY}%`;
            preview.classList.add('has-bg');
        } else {
            preview.style.backgroundImage = '';
            preview.classList.remove('has-bg');
        }
        
        const nodeSize = parseInt(nodeSizeInput?.value || 80);
        preview.querySelectorAll('.constellation-drag-node').forEach(node => {
            node.style.width = `${nodeSize}px`;
            node.style.height = `${nodeSize}px`;
        });
        
        this.saveBgSettings();
    },
    
    saveBgSettings() {
        const scaleInput = document.getElementById('edit-constellation-scale');
        const posXInput = document.getElementById('edit-constellation-pos-x');
        const posYInput = document.getElementById('edit-constellation-pos-y');
        const nodeSizeInput = document.getElementById('edit-constellation-node-size');
        const hiddenInput = document.getElementById('edit-constellation-bg-settings');
        
        if (!hiddenInput) return;
        
        const settings = {
            scale: parseInt(scaleInput?.value || 100),
            posX: parseInt(posXInput?.value || 50),
            posY: parseInt(posYInput?.value || 50),
            nodeSize: parseInt(nodeSizeInput?.value || 80)
        };
        
        hiddenInput.value = JSON.stringify(settings);
    },
    
    updateDragPreviewIcon(level, iconUrl) {
        const node = document.getElementById(`constellation-drag-node-${level}`);
        if (!node) return;
        
        if (iconUrl) {
            node.innerHTML = `<img src="${iconUrl}" alt="C${level}" onerror="this.parentElement.textContent='C${level}'">`;
        } else {
            node.textContent = `C${level}`;
        }
    },
    
    startDragNode(e, level) {
        e.preventDefault();
        const node = document.getElementById(`constellation-drag-node-${level}`);
        if (!node) return;
        
        node.classList.add('dragging');
        
        const preview = document.getElementById('constellation-drag-preview');
        const rect = preview.getBoundingClientRect();
        
        const isTouch = e.type === 'touchstart';
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;
        
        const onMove = (moveEvent) => {
            const mx = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const my = isTouch ? moveEvent.touches[0].clientY : moveEvent.clientY;
            
            let x = ((mx - rect.left) / rect.width) * 100;
            let y = ((my - rect.top) / rect.height) * 100;
            
            x = Math.max(5, Math.min(95, x));
            y = Math.max(5, Math.min(95, y));
            
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
            
            const posInput = document.getElementById(`constellation-pos-hidden-${level}`);
            if (posInput) {
                posInput.value = JSON.stringify({ x, y });
            }
            
            this.updateDragLines();
        };
        
        const onEnd = () => {
            node.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    },
    
    updateDragLines() {
        const svg = document.getElementById('constellation-drag-lines');
        if (!svg) return;
        
        svg.innerHTML = '';
        
        const connections = [
            [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
        ];
        
        connections.forEach(([from, to]) => {
            const fromNode = document.getElementById(`constellation-drag-node-${from}`);
            const toNode = document.getElementById(`constellation-drag-node-${to}`);
            if (!fromNode || !toNode) return;
            
            const fromLeft = parseFloat(fromNode.style.left);
            const fromTop = parseFloat(fromNode.style.top);
            const toLeft = parseFloat(toNode.style.left);
            const toTop = parseFloat(toNode.style.top);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromLeft);
            line.setAttribute('y1', fromTop);
            line.setAttribute('x2', toLeft);
            line.setAttribute('y2', toTop);
            svg.appendChild(line);
        });
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
    
    parseJSON(str) {
        if (!str) return null;
        if (typeof str === 'object') return str;
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
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
                desc: data.skillNormalDesc || '',
                icon: data.skillNormalIcon || null,
                table: this.parseJSON(data.skillNormalTable) || null
            },
            elemental: {
                name: data.skillElementalName || '',
                desc: data.skillElementalDesc || '',
                icon: data.skillElementalIcon || null,
                table: this.parseJSON(data.skillElementalTable) || null
            },
            burst: {
                name: data.skillBurstName || '',
                desc: data.skillBurstDesc || '',
                icon: data.skillBurstIcon || null,
                table: this.parseJSON(data.skillBurstTable) || null
            }
        };
        
        console.log('[DEBUG] getFormData skill tables:', {
            normalTable: data.skillNormalTable,
            elementalTable: data.skillElementalTable,
            burstTable: data.skillBurstTable,
            parsedNormal: data.skills.normal.table,
            parsedElemental: data.skills.elemental.table,
            parsedBurst: data.skills.burst.table
        });
        
        delete data.skillNormalName;
        delete data.skillNormalDesc;
        delete data.skillNormalIcon;
        delete data.skillNormalTable;
        delete data.skillElementalName;
        delete data.skillElementalDesc;
        delete data.skillElementalIcon;
        delete data.skillElementalTable;
        delete data.skillBurstName;
        delete data.skillBurstDesc;
        delete data.skillBurstIcon;
        delete data.skillBurstTable;
        
        data.constellations = [];
        for (let i = 1; i <= 6; i++) {
            const name = document.getElementById(`constellation-name-${i}`)?.value || '';
            const desc = document.getElementById(`constellation-desc-${i}`)?.value || '';
            const icon = document.getElementById(`constellation-icon-hidden-${i}`)?.value || '';
            const posInput = document.getElementById(`constellation-pos-hidden-${i}`)?.value || '';
            let position = null;
            if (posInput) {
                try {
                    position = JSON.parse(posInput);
                } catch (e) {
                    position = null;
                }
            }
            data.constellations.push({ level: i, name, desc, icon, position });
        }
        
        data.constellationImage = data.constellationImage || null;
        
        const bgSettingsInput = document.getElementById('edit-constellation-bg-settings');
        if (bgSettingsInput?.value) {
            try {
                data.constellationBgSettings = JSON.parse(bgSettingsInput.value);
            } catch (e) {
                data.constellationBgSettings = { scale: 100, posX: 50, posY: 50 };
            }
        } else {
            data.constellationBgSettings = { scale: 100, posX: 50, posY: 50 };
        }
        
        data.customImages = this.getCustomImagesData();
        
        data.passives = this.getPassivesData();
        
        console.log('[DEBUG] getFormData final data.passives:', data.passives);
        
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
        console.log('[DEBUG] populatePassivesEdit called with:', passives);
        console.trace('[DEBUG] populatePassivesEdit call stack');
        const container = document.getElementById('passives-list');
        if (!container) {
            console.error('[DEBUG] populatePassivesEdit: passives-list container not found!');
            return;
        }
        
        console.log('[DEBUG] populatePassivesEdit: container children before clear:', container.children.length);
        container.innerHTML = '';
        
        if (passives && passives.length > 0) {
            passives.forEach((p, index) => {
                this.addPassiveEditItem(p.name, p.desc, p.icon, index);
            });
        }
        console.log('[DEBUG] populatePassivesEdit: container children after:', container.children.length);
    },
    
    addPassiveEditItem(name = '', desc = '', icon = '', index = null) {
        console.log('[DEBUG] addPassiveEditItem called:', { name, desc, icon, index });
        const container = document.getElementById('passives-list');
        if (!container) {
            console.error('[DEBUG] passives-list container not found!');
            return;
        }
        
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
                        <div class="text-format-toolbar">
                            <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="bold" title="粗體"><b>B</b></button>
                            <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="italic" title="斜體"><i>I</i></button>
                            <button type="button" class="btn btn-sm btn-secondary text-format-btn" data-format="color" title="顏色">🎨</button>
                            <input type="color" class="text-color-picker" value="#ff0000" title="選擇顏色">
                        </div>
                        <textarea class="passive-desc-input" rows="2" placeholder="天賦描述 (支援 **粗體** *斜體* [color:#ff0000]顏色[/color])">${desc}</textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(itemDiv);
        console.log('[DEBUG] addPassiveEditItem appended, container children count:', container.children.length);
        
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
        
        const descTextarea = itemDiv.querySelector('.passive-desc-input');
        this.setupTextFormatToolbar(itemDiv, descTextarea);
    },
    
    setupTextFormatToolbar(container, textarea) {
        if (!textarea) return;
        
        container.querySelectorAll('.text-format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const selectedText = text.substring(start, end);
                
                if (format === 'bold') {
                    textarea.value = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                } else if (format === 'italic') {
                    textarea.value = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                } else if (format === 'color') {
                    const colorPicker = container.querySelector('.text-color-picker');
                    const color = colorPicker?.value || '#ff0000';
                    textarea.value = text.substring(0, start) + `[color:${color}]${selectedText}[/color]` + text.substring(end);
                }
                
                textarea.focus();
                textarea.dispatchEvent(new Event('input'));
            });
        });
        
        container.querySelector('.text-color-picker')?.addEventListener('input', (e) => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);
            
            if (selectedText) {
                textarea.value = text.substring(0, start) + `[color:${e.target.value}]${selectedText}[/color]` + text.substring(end);
                textarea.focus();
                textarea.dispatchEvent(new Event('input'));
            }
        });
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
        console.log('[DEBUG] getPassivesData result:', passives);
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
            artworkImg.src = character.images?.portrait || character.images?.artwork || character.images?.idcard || '';
        }
        
        const portraitImg = document.getElementById('portrait-image');
        if (portraitImg) {
            portraitImg.src = character.images?.idcard || character.images?.portrait || '';
            if (character.avatarPosition) {
                portraitImg.style.objectPosition = character.avatarPosition;
            }
            if (character.avatarScale) {
                portraitImg.style.transform = `scale(${character.avatarScale})`;
            }
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
            
            const normalIconEl = document.getElementById('skill-normal-icon');
            if (normalIconEl) {
                if (character.skills.normal?.icon) {
                    normalIconEl.innerHTML = `<img src="${character.skills.normal.icon}" alt="普通攻擊">`;
                } else {
                    normalIconEl.innerHTML = '';
                }
            }
            
            const elementalIconEl = document.getElementById('skill-elemental-icon');
            if (elementalIconEl) {
                if (character.skills.elemental?.icon) {
                    elementalIconEl.innerHTML = `<img src="${character.skills.elemental.icon}" alt="元素戰技">`;
                } else {
                    elementalIconEl.innerHTML = '';
                }
            }
            
            const burstIconEl = document.getElementById('skill-burst-icon');
            if (burstIconEl) {
                if (character.skills.burst?.icon) {
                    burstIconEl.innerHTML = `<img src="${character.skills.burst.icon}" alt="元素爆發">`;
                } else {
                    burstIconEl.innerHTML = '';
                }
            }
            
            this.renderSkillTableDisplay('normal', character.skills.normal?.table);
            this.renderSkillTableDisplay('elemental', character.skills.elemental?.table);
            this.renderSkillTableDisplay('burst', character.skills.burst?.table);
        }
        
        this.renderPassives(character.passives || []);
        this.renderConstellations(character);
        
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            const stories = character.stories || {};
            const storySections = [];
            
            if (stories.detail) {
                storySections.push(`<div class="story-section"><h4>角色詳細</h4><p>${stories.detail}</p></div>`);
            }
            if (stories.story1) {
                storySections.push(`<div class="story-section"><h4>角色故事1</h4><p>${stories.story1}</p></div>`);
            }
            if (stories.story2) {
                storySections.push(`<div class="story-section"><h4>角色故事2</h4><p>${stories.story2}</p></div>`);
            }
            if (stories.story3) {
                storySections.push(`<div class="story-section"><h4>角色故事3</h4><p>${stories.story3}</p></div>`);
            }
            if (stories.story4) {
                storySections.push(`<div class="story-section"><h4>角色故事4</h4><p>${stories.story4}</p></div>`);
            }
            if (stories.story5) {
                storySections.push(`<div class="story-section"><h4>角色故事5</h4><p>${stories.story5}</p></div>`);
            }
            if (stories.vision) {
                storySections.push(`<div class="story-section"><h4>神之眼</h4><p>${stories.vision}</p></div>`);
            }
            if (stories.extra) {
                storySections.push(`<div class="story-section"><h4>額外故事</h4><p>${stories.extra}</p></div>`);
            }
            
            storyContent.innerHTML = storySections.length > 0 
                ? storySections.join('') 
                : '<p class="empty-message">暫無故事資料</p>';
        }
        
        const modelContent = document.getElementById('model-content');
        if (modelContent) {
            if (character.model?.type && character.model?.url) {
                if (character.model.type === 'video') {
                    const videoUrl = character.model.url;
                    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
                    const bilibiliMatch = videoUrl.match(/bilibili\.com\/video\/(BV[^/?]+)/);
                    
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
                    } else if (bilibiliMatch) {
                        modelContent.innerHTML = `
                            <div class="model-video-wrapper">
                                <iframe 
                                    src="https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&autoplay=0" 
                                    frameborder="0" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        `;
                    } else {
                        modelContent.innerHTML = `
                            <div class="model-video-wrapper">
                                <video controls loop playsinline preload="auto" style="max-width: 100%; max-height: 500px;">
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
    
    renderSkillTableDisplay(skillType, tableData) {
        const container = document.getElementById(`skill-${skillType}-table-display`);
        if (!container) return;
        
        if (!tableData || !tableData.rows || tableData.rows.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const { rows = [], headers = [] } = tableData;
        
        const formatCell = (cell) => {
            let text = cell || '';
            console.log('[DEBUG] formatCell input:', JSON.stringify(text));
            text = text.replace(/\n/g, '<br>');
            text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
            text = text.replace(/\[color:(#[0-9a-fA-F]{6})\](.+?)\[\/color\]/g, '<span style="color:$1">$2</span>');
            console.log('[DEBUG] formatCell output:', text);
            return text;
        };
        
        let html = '<div class="skill-table-container"><table class="skill-table skill-table-readonly">';
        
        if (headers.length > 0) {
            html += '<thead><tr>';
            headers.forEach(h => {
                html += `<th>${h}</th>`;
            });
            html += '</tr></thead>';
        }
        
        html += '<tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${formatCell(cell)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        container.innerHTML = html;
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
    },
    
    formatText(text) {
        if (!text) return '';
        let result = text;
        result = result.replace(/\n/g, '<br>');
        result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
        result = result.replace(/\[color:(#[0-9a-fA-F]{6})\](.+?)\[\/color\]/g, '<span style="color:$1">$2</span>');
        return result;
    },
    
    renderPassives(passives) {
        const skillsPanel = document.getElementById('skills-panel');
        if (!skillsPanel) return;
        
        let passivesContainer = document.getElementById('passives-display');
        if (!passivesContainer) {
            passivesContainer = document.createElement('div');
            passivesContainer.id = 'passives-display';
            passivesContainer.className = 'passives-display';
            skillsPanel.querySelector('.skills-section')?.appendChild(passivesContainer);
        }
        
        if (!passives || passives.length === 0) {
            passivesContainer.innerHTML = '';
            return;
        }
        
        const validPassives = passives.filter(p => p.name || p.desc);
        
        if (validPassives.length === 0) {
            passivesContainer.innerHTML = '';
            return;
        }
        
        passivesContainer.innerHTML = validPassives.map((p, index) => `
            <div class="passive-card">
                <div class="passive-icon">
                    ${p.icon ? `<img src="${p.icon}" alt="${p.name}">` : ''}
                </div>
                <div class="passive-content">
                    <h4 class="passive-name">${p.name || `天賦 ${index + 1}`}</h4>
                    <p class="passive-desc">${this.formatText(p.desc) || '暫無資料'}</p>
                </div>
            </div>
        `).join('');
    },
    
    renderConstellations(character) {
        const constellationList = document.getElementById('constellation-list');
        if (!constellationList) return;
        
        const constellations = character.constellations || [];
        const element = character.element || 'geo';
        const constellationImage = character.constellationImage || null;
        const bgSettings = character.constellationBgSettings || { scale: 100, posX: 50, posY: 50, nodeSize: 80 };
        const nodeSize = bgSettings.nodeSize || 80;
        
        if (constellations.length === 0) {
            constellationList.innerHTML = '<p class="empty-message">暫無命之座資料</p>';
            return;
        }
        
        const defaultPositions = [
            { x: 50, y: 10 },
            { x: 20, y: 30 },
            { x: 80, y: 30 },
            { x: 50, y: 50 },
            { x: 20, y: 70 },
            { x: 80, y: 70 }
        ];
        
        const positions = constellations.map((c, i) => c.position || defaultPositions[i]);
        
        constellationList.className = 'constellation-display-container';
        constellationList.innerHTML = `
            <div class="constellation-image-section">
                <div class="constellation-image-wrapper" id="constellation-image-wrapper"></div>
            </div>
            <div class="constellation-table-section">
                <table class="constellation-table">
                    <thead>
                        <tr>
                            <th>圖標</th>
                            <th>層數</th>
                            <th>名稱</th>
                            <th>描述</th>
                        </tr>
                    </thead>
                    <tbody id="constellation-table-body">
                        ${constellations.map(c => `
                            <tr class="constellation-row" data-level="${c.level}">
                                <td class="constellation-table-icon">
                                    ${c.icon ? `<img src="${c.icon}" alt="${c.name}" class="constellation-icon-img">` : '<span class="constellation-icon-placeholder">C' + c.level + '</span>'}
                                </td>
                                <td class="constellation-table-level">C${c.level}</td>
                                <td class="constellation-table-name">${c.name || '-'}</td>
                                <td class="constellation-table-desc">${this.formatText(c.desc) || '暫無資料'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        const imageWrapper = document.getElementById('constellation-image-wrapper');
        
        if (constellationImage && imageWrapper) {
            imageWrapper.style.backgroundImage = `url(${constellationImage})`;
            imageWrapper.style.backgroundSize = `${bgSettings.scale}%`;
            imageWrapper.style.backgroundPosition = `${bgSettings.posX}% ${bgSettings.posY}%`;
            imageWrapper.style.backgroundRepeat = 'no-repeat';
        }
        
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.setAttribute('class', 'constellation-lines');
        svgLines.setAttribute('viewBox', '0 0 100 100');
        svgLines.setAttribute('preserveAspectRatio', 'none');
        
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]
        ];
        
        connections.forEach(([from, to]) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', positions[from].x);
            line.setAttribute('y1', positions[from].y);
            line.setAttribute('x2', positions[to].x);
            line.setAttribute('y2', positions[to].y);
            line.setAttribute('class', 'constellation-line');
            svgLines.appendChild(line);
        });
        
        if (imageWrapper) {
            imageWrapper.appendChild(svgLines);
        }
        
        constellations.forEach((c, index) => {
            const pos = positions[index];
            const node = document.createElement('div');
            node.className = 'constellation-node';
            node.dataset.element = element;
            node.dataset.level = c.level;
            node.dataset.index = index;
            node.style.left = `${pos.x}%`;
            node.style.top = `${pos.y}%`;
            node.style.transform = 'translate(-50%, -50%)';
            node.style.width = `${nodeSize}px`;
            node.style.height = `${nodeSize}px`;
            
            node.innerHTML = `
                <div class="constellation-node-glow"></div>
                <div class="constellation-node-inner">
                    <span class="constellation-node-text">C${c.level}</span>
                </div>
            `;
            
            node.addEventListener('click', () => {
                this.showConstellationDetail(c, element);
            });
            
            if (imageWrapper) {
                imageWrapper.appendChild(node);
            }
        });
        
        if (constellationImage && imageWrapper) {
            const sparkleContainer = document.createElement('div');
            sparkleContainer.className = 'constellation-sparkles';
            this.createSparkles(sparkleContainer, element);
            imageWrapper.appendChild(sparkleContainer);
        }
        
        this.createConstellationDetailModal();
    },
    
    createSparkles(container, element) {
        const colors = {
            pyro: '#FF4D4D',
            anemo: '#72E2C3',
            geo: '#F8BA4E',
            electro: '#AF8FE2',
            hydro: '#4CC9F0',
            cryo: '#99DFFF',
            dendro: '#A5C83B'
        };
        
        const color = colors[element] || colors.geo;
        
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'constellation-sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.background = color;
            sparkle.style.animationDelay = `${Math.random() * 3}s`;
            sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
            container.appendChild(sparkle);
        }
    },
    
    createSparkles(container, element) {
        const sparkleContainer = container.querySelector('.constellation-sparkles');
        if (!sparkleContainer) return;
        
        const colors = {
            pyro: '#FF4D4D',
            anemo: '#72E2C3',
            geo: '#F8BA4E',
            electro: '#AF8FE2',
            hydro: '#4CC9F0',
            cryo: '#99DFFF',
            dendro: '#A5C83B'
        };
        
        const color = colors[element] || colors.geo;
        
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'constellation-sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.background = color;
            sparkle.style.animationDelay = `${Math.random() * 3}s`;
            sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
            sparkleContainer.appendChild(sparkle);
        }
    },
    
    createConstellationDetailModal() {
        if (document.getElementById('constellation-detail-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'constellation-detail-modal';
        modal.className = 'constellation-detail-modal';
        modal.innerHTML = `
            <div class="constellation-detail-content">
                <button class="constellation-detail-close">&times;</button>
                <div class="constellation-detail-header">
                    <div class="constellation-detail-icon" id="constellation-detail-icon"></div>
                    <div class="constellation-detail-title">
                        <div class="constellation-detail-level" id="constellation-detail-level"></div>
                        <div class="constellation-detail-name" id="constellation-detail-name"></div>
                    </div>
                </div>
                <div class="constellation-detail-desc" id="constellation-detail-desc"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.constellation-detail-close')) {
                this.hideConstellationDetail();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideConstellationDetail();
            }
        });
    },
    
    showConstellationDetail(constellation, element) {
        const modal = document.getElementById('constellation-detail-modal');
        if (!modal) return;
        
        const iconEl = document.getElementById('constellation-detail-icon');
        const levelEl = document.getElementById('constellation-detail-level');
        const nameEl = document.getElementById('constellation-detail-name');
        const descEl = document.getElementById('constellation-detail-desc');
        
        if (iconEl) {
            iconEl.dataset.element = element;
            iconEl.innerHTML = constellation.icon 
                ? `<img src="${constellation.icon}" alt="${constellation.name}">`
                : '';
        }
        
        if (levelEl) {
            levelEl.textContent = `第 ${constellation.level} 層命之座`;
        }
        
        if (nameEl) {
            nameEl.textContent = constellation.name || '未命名';
        }
        
        if (descEl) {
            descEl.innerHTML = this.formatText(constellation.desc) || '暫無資料';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    hideConstellationDetail() {
        const modal = document.getElementById('constellation-detail-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    getDraftKey(characterId) {
        return `genshin_draft_${characterId}`;
    },
    
    saveDraft(characterId, formData) {
        try {
            localStorage.setItem(this.getDraftKey(characterId), JSON.stringify(formData));
            return true;
        } catch (e) {
            console.error('Error saving draft:', e);
            return false;
        }
    },
    
    loadDraft(characterId) {
        try {
            const draft = localStorage.getItem(this.getDraftKey(characterId));
            return draft ? JSON.parse(draft) : null;
        } catch (e) {
            console.error('Error loading draft:', e);
            return null;
        }
    },
    
    clearDraft(characterId) {
        localStorage.removeItem(this.getDraftKey(characterId));
    },
    
    hasDraft(characterId) {
        return localStorage.getItem(this.getDraftKey(characterId)) !== null;
    },
    
    setupDraftAutoSave(form, characterId) {
        if (this._draftInitialized) return;
        this._draftInitialized = true;
        
        const saveDraftHandler = () => {
            const formData = this.getFormData(form);
            this.saveDraft(characterId, formData);
        };
        
        form.addEventListener('input', saveDraftHandler);
        form.addEventListener('change', saveDraftHandler);
        
        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                const btn = e.target.closest('.skill-table-action');
                if (btn) {
                    const action = btn.dataset.action;
                    const skillType = btn.dataset.skill;
                    if (action === 'addRow') {
                        this.addSkillTableRow(skillType);
                    } else if (action === 'addCol') {
                        this.addSkillTableCol(skillType);
                    } else if (action === 'removeRow') {
                        this.removeSkillTableRow(skillType);
                    } else if (action === 'removeCol') {
                        this.removeSkillTableCol(skillType);
                    }
                    setTimeout(saveDraftHandler, 50);
                }
            });
            
            editModal.addEventListener('skillTableRendered', saveDraftHandler);
        }
        
        const containers = ['passives-list', 'normal-voice-edit-list', 'combat-voice-edit-list', 'custom-images-list'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.addEventListener('input', saveDraftHandler);
                container.addEventListener('change', saveDraftHandler);
            }
        });
        
        ['normal', 'elemental', 'burst'].forEach(skillType => {
            const tableContainer = document.getElementById(`skill-${skillType}-table-container`);
            if (tableContainer) {
                tableContainer.addEventListener('input', saveDraftHandler);
                tableContainer.addEventListener('change', saveDraftHandler);
            }
        });
        
        const addPassiveBtn = document.getElementById('add-passive-btn');
        if (addPassiveBtn) {
            addPassiveBtn.addEventListener('click', () => {
                setTimeout(saveDraftHandler, 100);
            });
        }
        
        const addNormalVoiceBtn = document.getElementById('add-normal-voice-btn');
        const addCombatVoiceBtn = document.getElementById('add-combat-voice-btn');
        if (addNormalVoiceBtn) {
            addNormalVoiceBtn.addEventListener('click', () => {
                setTimeout(saveDraftHandler, 100);
            });
        }
        if (addCombatVoiceBtn) {
            addCombatVoiceBtn.addEventListener('click', () => {
                setTimeout(saveDraftHandler, 100);
            });
        }
        
        const addCustomImageBtn = document.getElementById('add-custom-image-btn');
        if (addCustomImageBtn) {
            addCustomImageBtn.addEventListener('click', () => {
                setTimeout(saveDraftHandler, 100);
            });
        }
    },
    
    populateFormFromDraft(form, draft) {
        if (!draft) return false;
        
        const textFields = [
            'name', 'title', 'fullname', 'element', 'weapon', 'region', 'rarity',
            'gender', 'affiliation', 'constellation', 'vision', 'dish', 'birthday',
            'vaCn', 'vaJp', 'description', 'avatarPosition', 'avatarScale'
        ];
        
        textFields.forEach(field => {
            const input = form.elements[field];
            if (input && draft[field] !== undefined) {
                input.value = draft[field];
            }
        });
        
        const storyFields = [
            { id: 'edit-story-detail', key: 'stories', subkey: 'detail' },
            { id: 'edit-story-1', key: 'stories', subkey: 'story1' },
            { id: 'edit-story-2', key: 'stories', subkey: 'story2' },
            { id: 'edit-story-3', key: 'stories', subkey: 'story3' },
            { id: 'edit-story-4', key: 'stories', subkey: 'story4' },
            { id: 'edit-story-5', key: 'stories', subkey: 'story5' },
            { id: 'edit-story-vision', key: 'stories', subkey: 'vision' },
            { id: 'edit-story-extra', key: 'stories', subkey: 'extra' }
        ];
        
        storyFields.forEach(({ id, key, subkey }) => {
            const el = document.getElementById(id);
            if (el && draft[key] && draft[key][subkey]) {
                el.value = draft[key][subkey];
            }
        });
        
        if (draft.images) {
            const imageFields = {
                'artwork': draft.images.artwork,
                'portrait': draft.images.portrait,
                'avatar': draft.images.avatar,
                'idcard': draft.images.idcard
            };
            
            Object.entries(imageFields).forEach(([field, url]) => {
                const input = form.elements[field];
                if (input && url) {
                    input.value = url;
                }
            });
            
            const imagePreviewMap = {
                'edit-artwork-preview': draft.images.artwork,
                'edit-portrait-preview': draft.images.portrait,
                'edit-avatar-preview': draft.images.avatar,
                'edit-idcard-preview': draft.images.idcard
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
        }
        
        if (draft.skills) {
            const skillFieldMap = {
                'skill-normal-name': draft.skills.normal?.name,
                'skill-normal-desc': draft.skills.normal?.desc,
                'skill-normal-icon': draft.skills.normal?.icon,
                'skill-elemental-name': draft.skills.elemental?.name,
                'skill-elemental-desc': draft.skills.elemental?.desc,
                'skill-elemental-icon': draft.skills.elemental?.icon,
                'skill-burst-name': draft.skills.burst?.name,
                'skill-burst-desc': draft.skills.burst?.desc,
                'skill-burst-icon': draft.skills.burst?.icon
            };
            
            Object.entries(skillFieldMap).forEach(([id, value]) => {
                const el = document.getElementById(`edit-${id}`);
                if (el) el.value = value || '';
            });
            
            const skillIconPreviews = {
                'skill-normal-icon-preview': draft.skills.normal?.icon,
                'skill-elemental-icon-preview': draft.skills.elemental?.icon,
                'skill-burst-icon-preview': draft.skills.burst?.icon
            };
            
            Object.entries(skillIconPreviews).forEach(([id, url]) => {
                const el = document.getElementById(id);
                if (el) {
                    if (url) {
                        el.innerHTML = `<img src="${url}" alt="技能圖標">`;
                    } else {
                        el.innerHTML = '<span>圖標</span>';
                    }
                }
            });
            
            this.populateSkillTable('normal', draft.skills.normal?.table);
            this.populateSkillTable('elemental', draft.skills.elemental?.table);
            this.populateSkillTable('burst', draft.skills.burst?.table);
        }
        
        if (draft.model) {
            const modelTypeSelect = document.getElementById('edit-model-type');
            if (modelTypeSelect && draft.model.type) {
                modelTypeSelect.value = draft.model.type;
            }
            const modelUrlInput = document.getElementById('edit-model-url');
            if (modelUrlInput && draft.model.url) {
                modelUrlInput.value = draft.model.url;
            }
        }
        
        if (draft.constellationImage) {
            const constellationImageInput = document.getElementById('edit-constellation-image');
            const constellationBgPreview = document.getElementById('constellation-bg-preview');
            if (constellationImageInput) {
                constellationImageInput.value = draft.constellationImage;
            }
            if (constellationBgPreview) {
                constellationBgPreview.innerHTML = `<img src="${draft.constellationImage}" alt="命之座星座圖">`;
            }
        }
        
        if (draft.constellationBgSettings) {
            const scaleInput = document.getElementById('edit-constellation-scale');
            const posXInput = document.getElementById('edit-constellation-pos-x');
            const posYInput = document.getElementById('edit-constellation-pos-y');
            const controlsDiv = document.getElementById('constellation-image-controls');
            const scaleValue = document.getElementById('constellation-scale-value');
            
            if (scaleInput) scaleInput.value = draft.constellationBgSettings.scale || 100;
            if (posXInput) posXInput.value = draft.constellationBgSettings.posX || 50;
            if (posYInput) posYInput.value = draft.constellationBgSettings.posY || 50;
            if (scaleValue) scaleValue.textContent = `${draft.constellationBgSettings.scale || 100}%`;
            if (controlsDiv && draft.constellationImage) controlsDiv.style.display = 'flex';
        }
        
        this.populateCustomImages(draft.customImages || []);
        this.populateConstellationEdit(draft.constellations);
        this.populatePassivesEdit(draft.passives || []);
        this.populateVoiceEdit(draft.voices?.normal || [], draft.voices?.combat || []);
        
        return true;
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}