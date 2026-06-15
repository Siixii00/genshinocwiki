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
        return data || this.getFallbackCharacters();
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
        return result;
    },
    
    async updateCharacter(id, updates) {
        const formatted = this.formatCharacter(updates);
        const result = await this.request('/api/characters', {
            method: 'PUT',
            body: JSON.stringify({ id, ...formatted })
        });
        return result;
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
    
    formatCharacter(char) {
        return {
            name: char.name,
            title: char.title || null,
            fullname: char.fullname || null,
            element: char.element,
            weapon: char.weapon,
            region: char.region,
            rarity: parseInt(char.rarity),
            gender: char.gender || null,
            affiliation: char.affiliation || null,
            birthday: char.birthday || null,
            constellation: char.constellation || null,
            vision: char.vision || null,
            dish: char.dish || null,
            description: char.description || null,
            story: char.story || null,
            va: {
                cn: char.vaCn || null,
                jp: char.vaJp || null
            },
            images: {
                artwork: char.artwork || null,
                portrait: char.portrait || null,
                avatar: char.avatar || null,
                idcard: char.idcard || null
            },
            model: {
                type: char.modelType || null,
                url: char.modelUrl || null
            },
            skills: {
                normal: {
                    name: char.skillNormalName || null,
                    desc: char.skillNormalDesc || null
                },
                elemental: {
                    name: char.skillElementalName || null,
                    desc: char.skillElementalDesc || null
                },
                burst: {
                    name: char.skillBurstName || null,
                    desc: char.skillBurstDesc || null
                }
            },
            constellations: char.constellations || [],
            customImages: char.customImages || [],
            voices: {
                normal: char.normalVoices || [],
                combat: char.combatVoices || []
            }
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
            va_cn: '彭博',
            va_jp: '前野智昭',
            description: '璃月港往生堂客卿，知識淵博的紳士。',
            skill_normal_name: '岩雨',
            skill_normal_desc: '進行至多六段的長柄武器攻擊。',
            skill_elemental_name: '地心',
            skill_elemental_desc: '召喚岩脊造成岩元素傷害。',
            skill_burst_name: '天星',
            skill_burst_desc: '降下巨大的隕石造成大量岩元素傷害。',
            story: '身份神秘的客卿，似乎對璃月的一切都瞭若指掌...'
        }];
    }
};

if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
    ApiClient.init();
}