const ApiClient = {
    baseUrl: '',
    
    init() {
        this.baseUrl = window.location.origin;
    },
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async getCharacters() {
        const data = await this.request('/api/characters');
        return data ? data.map(c => this.parseCharacter(c)) : this.getFallbackCharacters();
    },
    
    async getCharacter(id) {
        const characters = await this.getCharacters();
        return characters.find(c => c.id === id) || null;
    },
    
    async addCharacter(character) {
        const formatted = this.formatCharacter(character);
        const result = await this.request('/api/characters', {
            method: 'POST',
            body: JSON.stringify(formatted)
        });
        return result ? this.parseCharacter(result) : null;
    },
    
    async updateCharacter(id, updates) {
        console.log('[DEBUG] updateCharacter called with id:', id, 'updates:', updates);
        const formatted = this.formatCharacter(updates);
        console.log('[DEBUG] updateCharacter formatted:', formatted);
        const payload = { id, ...formatted };
        console.log('[DEBUG] updateCharacter payload passives:', payload.passives);
        const result = await this.request('/api/characters', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        console.log('[DEBUG] updateCharacter result:', result);
        return result ? this.parseCharacter(result) : null;
    },
    
    async deleteCharacter(id) {
        const result = await this.request(`/api/characters?id=${id}`, {
            method: 'DELETE'
        });
        return result || { success: false };
    },
    
    async getGallery() {
        const data = await this.request('/api/gallery');
        return data || [];
    },
    
    async addGalleryItem(item) {
        const result = await this.request('/api/gallery', {
            method: 'POST',
            body: JSON.stringify(item)
        });
        return result;
    },
    
    async updateGalleryItem(id, updates) {
        const result = await this.request('/api/gallery', {
            method: 'PUT',
            body: JSON.stringify({ id, ...updates })
        });
        return result;
    },
    
    async deleteGalleryItem(id) {
        const result = await this.request(`/api/gallery?id=${id}`, {
            method: 'DELETE'
        });
        return result || { success: false };
    },
    
    parseCharacter(c) {
        console.log('[DEBUG] parseCharacter called for:', c?.name, 'id:', c?.id);
        console.trace('[DEBUG] parseCharacter call stack');
        return {
            id: c.id,
            name: c.name,
            title: c.title || null,
            fullname: c.fullname || null,
            element: c.element,
            weapon: c.weapon,
            region: c.region,
            rarity: c.rarity,
            gender: c.gender || null,
            affiliation: c.affiliation || null,
            birthday: c.birthday || null,
            constellation: c.constellation || null,
            vision: c.vision || null,
            dish: c.dish || null,
            description: c.description || null,
            avatarPosition: c.avatar_position || c.avatarPosition || null,
            avatarScale: c.avatar_scale || c.avatarScale || null,
            va: {
                cn: c.va_cn || c.vaCn || null,
                jp: c.va_jp || c.vaJp || null
            },
            images: {
                artwork: c.artwork || null,
                portrait: c.portrait || null,
                avatar: c.avatar || null,
                idcard: c.gacha_image || null
            },
            model: {
                type: c.model_type || c.modelType || null,
                url: c.model_url || c.modelUrl || null
            },
            skills: {
                normal: {
                    name: c.skill_normal_name || c.skillNormalName || null,
                    desc: c.skill_normal_desc || c.skillNormalDesc || null,
                    icon: c.skill_normal_icon || c.skillNormalIcon || null,
                    table: this.parseJSON(c.skill_normal_table || c.skillNormalTable) || null
                },
                elemental: {
                    name: c.skill_elemental_name || c.skillElementalName || null,
                    desc: c.skill_elemental_desc || c.skillElementalDesc || null,
                    icon: c.skill_elemental_icon || c.skillElementalIcon || null,
                    table: this.parseJSON(c.skill_elemental_table || c.skillElementalTable) || null
                },
                burst: {
                    name: c.skill_burst_name || c.skillBurstName || null,
                    desc: c.skill_burst_desc || c.skillBurstDesc || null,
                    icon: c.skill_burst_icon || c.skillBurstIcon || null,
                    table: this.parseJSON(c.skill_burst_table || c.skillBurstTable) || null
                }
            },
            stories: {
                detail: c.story_detail || c.storyDetail || null,
                story1: c.story_1 || c.story1 || null,
                story2: c.story_2 || c.story2 || null,
                story3: c.story_3 || c.story3 || null,
                story4: c.story_4 || c.story4 || null,
                story5: c.story_5 || c.story5 || null,
                vision: c.story_vision || c.storyVision || null,
                extra: c.story_extra || c.storyExtra || null
            },
            constellations: this.parseJSON(c.constellations) || [],
            constellationImage: c.constellation_image || c.constellationImage || null,
            constellationBgSettings: this.parseJSON(c.constellation_bg_settings || c.constellationBgSettings) || null,
            customImages: this.parseJSON(c.custom_images) || this.parseJSON(c.customImages) || [],
            passives: (() => {
                const parsed = this.parseJSON(c.passives);
                console.log('[DEBUG] parseCharacter passives raw:', c.passives);
                console.log('[DEBUG] parseCharacter passives parsed:', parsed);
                return parsed || [];
            })(),
            voices: {
                normal: this.parseJSON(c.normal_voices) || this.parseJSON(c.normalVoices) || [],
                combat: this.parseJSON(c.combat_voices) || this.parseJSON(c.combatVoices) || []
            }
        };
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
    
    formatCharacter(char) {
        const constellations = char.constellations || [];
        const customImages = char.customImages || [];
        const normalVoices = char.voices?.normal || char.normalVoices || [];
        const combatVoices = char.voices?.combat || char.combatVoices || [];
        const passives = char.passives || [];
        
        return {
            name: char.name,
            title: char.title || null,
            fullname: char.fullname || null,
            element: char.element,
            weapon: char.weapon,
            region: char.region,
            rarity: parseInt(char.rarity) || null,
            gender: char.gender || null,
            affiliation: char.affiliation || null,
            birthday: char.birthday || null,
            constellation: char.constellation || null,
            vision: char.vision || null,
            dish: char.dish || null,
            description: char.description || null,
            vaCn: char.va?.cn || char.vaCn || null,
            vaJp: char.va?.jp || char.vaJp || null,
            artwork: char.images?.artwork || char.artwork || null,
            portrait: char.images?.portrait || char.portrait || null,
            avatar: char.images?.avatar || char.avatar || null,
            gachaImage: char.images?.idcard || char.idcard || null,
            avatarPosition: char.avatarPosition || null,
            avatarScale: char.avatarScale || null,
            skillNormalName: char.skills?.normal?.name || char.skillNormalName || null,
            skillNormalDesc: char.skills?.normal?.desc || char.skillNormalDesc || null,
            skillNormalIcon: char.skills?.normal?.icon || char.skillNormalIcon || null,
            skillNormalTable: char.skills?.normal?.table ? JSON.stringify(char.skills.normal.table) : null,
            skillElementalName: char.skills?.elemental?.name || char.skillElementalName || null,
            skillElementalDesc: char.skills?.elemental?.desc || char.skillElementalDesc || null,
            skillElementalIcon: char.skills?.elemental?.icon || char.skillElementalIcon || null,
            skillElementalTable: char.skills?.elemental?.table ? JSON.stringify(char.skills.elemental.table) : null,
            skillBurstName: char.skills?.burst?.name || char.skillBurstName || null,
            skillBurstDesc: char.skills?.burst?.desc || char.skillBurstDesc || null,
            skillBurstIcon: char.skills?.burst?.icon || char.skillBurstIcon || null,
            skillBurstTable: char.skills?.burst?.table ? JSON.stringify(char.skills.burst.table) : null,
            storyDetail: char.stories?.detail || char.storyDetail || null,
            story1: char.stories?.story1 || char.story1 || null,
            story2: char.stories?.story2 || char.story2 || null,
            story3: char.stories?.story3 || char.story3 || null,
            story4: char.stories?.story4 || char.story4 || null,
            story5: char.stories?.story5 || char.story5 || null,
            storyVision: char.stories?.vision || char.storyVision || null,
            storyExtra: char.stories?.extra || char.storyExtra || null,
            constellations: Array.isArray(constellations) && constellations.length > 0 ? JSON.stringify(constellations) : null,
            constellationImage: char.constellationImage || null,
            constellationBgSettings: char.constellationBgSettings ? JSON.stringify(char.constellationBgSettings) : null,
            customImages: Array.isArray(customImages) && customImages.length > 0 ? JSON.stringify(customImages) : null,
            normalVoices: Array.isArray(normalVoices) && normalVoices.length > 0 ? JSON.stringify(normalVoices) : null,
            combatVoices: Array.isArray(combatVoices) && combatVoices.length > 0 ? JSON.stringify(combatVoices) : null,
            passives: (() => {
                const passives = char.passives || [];
                const result = Array.isArray(passives) && passives.length > 0 ? JSON.stringify(passives) : null;
                console.log('[DEBUG] formatCharacter passives:', passives, '-> JSON:', result);
                return result;
            })(),
            modelType: char.model?.type || char.modelType || null,
            modelUrl: char.model?.url || char.modelUrl || null
        };
    },
    
    getFallbackCharacters() {
        return [{
            id: '1',
            name: '鍾離',
            title: '塵世閒遊',
            fullname: '摩拉克斯',
            element: 'geo',
            weapon: 'polearm',
            region: 'liyue',
            rarity: 5,
            vision: '岩',
            affiliation: '往生堂',
            constellation: '岩王帝君座',
            birthday: '12月31日',
            va: { cn: '彭博', jp: '前野智昭' },
            description: '璃月港往生堂客卿，知識淵博的紳士。',
            skills: {
                normal: { name: '岩雨', desc: '進行至多六段的長柄武器攻擊。' },
                elemental: { name: '地心', desc: '召喚岩脊造成岩元素傷害。' },
                burst: { name: '天星', desc: '降下巨大的隕石造成大量岩元素傷害。' }
            },
            constellations: [
                { level: 1, name: '岩者，六合引之為骨', desc: '地心可同時存在兩座岩脊。' }
            ],
            voices: { normal: [], combat: [] }
        }];
    }
};

if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
    ApiClient.init();
}
