const ApiClient = {
    baseUrl: '/api',
    
    async getCharacters() {
        try {
            const response = await fetch(`${this.baseUrl}/characters`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('API Error:', error);
            return this.getFallbackCharacters();
        }
    },
    
    async getCharacter(id) {
        const characters = await this.getCharacters();
        return characters.find(c => c.id === id) || null;
    },
    
    async addCharacter(character) {
        try {
            const response = await fetch(`${this.baseUrl}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(character)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async updateCharacter(id, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/characters`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async deleteCharacter(id) {
        try {
            const response = await fetch(`${this.baseUrl}/characters?id=${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false };
        }
    },
    
    async getGallery() {
        try {
            const response = await fetch(`${this.baseUrl}/gallery`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },
    
    async addGalleryItem(item) {
        try {
            const response = await fetch(`${this.baseUrl}/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async updateGalleryItem(id, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/gallery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    async deleteGalleryItem(id) {
        try {
            const response = await fetch(`${this.baseUrl}/gallery?id=${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false };
        }
    },
    
    getFallbackCharacters() {
        const local = localStorage.getItem('genshin_characters');
        if (local) return JSON.parse(local);
        
        return [
            {
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
                vaCn: '彭博',
                vaJp: '前野智昭',
                description: '璃月港往生堂客卿，知識淵博的紳士。',
                skills: {
                    normal: { name: '岩雨', description: '進行至多六段的長柄武器攻擊。' },
                    elemental: { name: '地心', description: '召喚岩脊造成岩元素傷害。' },
                    burst: { name: '天星', description: '降下巨大的隕石造成大量岩元素傷害。' }
                },
                story: '身份神秘的客卿，似乎對璃月的一切都瞭若指掌...'
            }
        ];
    },
    
    saveToLocal(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
}
