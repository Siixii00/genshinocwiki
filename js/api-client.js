const ApiClient = {
    baseUrl: null,
    
    async getCharacters() {
        return this.getFallbackCharacters();
    },
    
    async getCharacter(id) {
        const characters = await this.getFallbackCharacters();
        return characters.find(c => c.id === id) || null;
    },
    
    async addCharacter(character) {
        const characters = this.getFallbackCharacters();
        character.id = Date.now().toString();
        characters.push(character);
        this.saveToLocal('genshin_characters', characters);
        return character;
    },
    
    async updateCharacter(id, updates) {
        const characters = this.getFallbackCharacters();
        const index = characters.findIndex(c => c.id === id);
        if (index !== -1) {
            characters[index] = { ...characters[index], ...updates };
            this.saveToLocal('genshin_characters', characters);
            return characters[index];
        }
        return null;
    },
    
    async deleteCharacter(id) {
        let characters = this.getFallbackCharacters();
        characters = characters.filter(c => c.id !== id);
        this.saveToLocal('genshin_characters', characters);
        return { success: true };
    },
    
    async getGallery() {
        const local = localStorage.getItem('genshin_gallery');
        return local ? JSON.parse(local) : [];
    },
    
    async addGalleryItem(item) {
        const gallery = await this.getGallery();
        item.id = Date.now().toString();
        gallery.push(item);
        this.saveToLocal('genshin_gallery', gallery);
        return item;
    },
    
    async updateGalleryItem(id, updates) {
        const gallery = await this.getGallery();
        const index = gallery.findIndex(g => g.id === id);
        if (index !== -1) {
            gallery[index] = { ...gallery[index], ...updates };
            this.saveToLocal('genshin_gallery', gallery);
            return gallery[index];
        }
        return null;
    },
    
    async deleteGalleryItem(id) {
        let gallery = await this.getGallery();
        gallery = gallery.filter(g => g.id !== id);
        this.saveToLocal('genshin_gallery', gallery);
        return { success: true };
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
