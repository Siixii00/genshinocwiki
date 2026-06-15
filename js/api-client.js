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
        const formatted = this.formatCharacter(updates);
        const result = await this.request('/api/characters', {
            method: 'PUT',
            body: JSON.stringify({ id, ...formatted })
        });
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
                    desc: c.skill_normal_desc || c.skillNormalDesc || null
                },
                elemental: {
                    name: c.skill_elemental_name || c.skillElementalName || null,
                    desc: c.skill_elemental_desc || c.skillElementalDesc || null
                },
                burst: {
                    name: c.skill_burst_name || c.skillBurstName || null,
                    desc: c.skill_burst_desc || c.skillBurstDesc || null
                }
            },
            constellations: this.parseJSON(c.constellations) || [],
            customImages: this.parseJSON(c.custom_images) || this.parseJSON(c.customImages) || [],
            passives: this.parseJSON(c.passives) || [],
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
            skillNormalName: char.skills?.normal?.name || char.skillNormalName || null,
            skillNormalDesc: char.skills?.normal?.desc || char.skillNormalDesc || null,
            skillElementalName: char.skills?.elemental?.name || char.skillElementalName || null,
            skillElementalDesc: char.skills?.elemental?.desc || char.skillElementalDesc || null,
            skillBurstName: char.skills?.burst?.name || char.skillBurstName || null,
            skillBurstDesc: char.skills?.burst?.desc || char.skillBurstDesc || null,
            constellations: Array.isArray(constellations) && constellations.length > 0 ? JSON.stringify(constellations) : null,
            customImages: Array.isArray(customImages) && customImages.length > 0 ? JSON.stringify(customImages) : null,
            normalVoices: Array.isArray(normalVoices) && normalVoices.length > 0 ? JSON.stringify(normalVoices) : null,
            combatVoices: Array.isArray(combatVoices) && combatVoices.length > 0 ? JSON.stringify(combatVoices) : null,
            passives: Array.isArray(passives) && passives.length > 0 ? JSON.stringify(passives) : null,
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
