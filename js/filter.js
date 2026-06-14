const Filter = {
    state: {
        search: '',
        elements: [],
        weapons: [],
        regions: []
    },
    
    elements: [],
    weapons: [],
    regions: [],
    
    init() {
        this.elements = [];
        this.weapons = [];
        this.regions = [];
        this.state = {
            search: '',
            elements: [],
            weapons: [],
            regions: []
        };
    },
    
    setSearch(value) {
        this.state.search = value;
        this.notifyChange();
    },
    
    toggleElement(element) {
        const index = this.state.elements.indexOf(element);
        if (index === -1) {
            this.state.elements.push(element);
        } else {
            this.state.elements.splice(index, 1);
        }
        this.notifyChange();
    },
    
    toggleWeapon(weapon) {
        const index = this.state.weapons.indexOf(weapon);
        if (index === -1) {
            this.state.weapons.push(weapon);
        } else {
            this.state.weapons.splice(index, 1);
        }
        this.notifyChange();
    },
    
    toggleRegion(region) {
        const index = this.state.regions.indexOf(region);
        if (index === -1) {
            this.state.regions.push(region);
        } else {
            this.state.regions.splice(index, 1);
        }
        this.notifyChange();
    },
    
    reset() {
        this.state = {
            search: '',
            elements: [],
            weapons: [],
            regions: []
        };
        this.notifyChange();
    },
    
    getFilters() {
        return { ...this.state };
    },
    
    hasActiveFilters() {
        return !!(this.state.search || 
            this.state.elements.length > 0 || 
            this.state.weapons.length > 0 || 
            this.state.regions.length > 0);
    },
    
    onChange: null,
    
    notifyChange() {
        if (this.onChange && typeof this.onChange === 'function') {
            this.onChange(this.getFilters());
        }
    },
    
    bindEvents() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.setSearch(e.target.value);
                }, 300);
            });
        }
        
        const elementFilters = document.getElementById('element-filters');
        if (elementFilters) {
            elementFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (btn) {
                    btn.classList.toggle('active');
                    this.toggleElement(btn.dataset.element);
                }
            });
        }
        
        const weaponFilters = document.getElementById('weapon-filters');
        if (weaponFilters) {
            weaponFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (btn) {
                    btn.classList.toggle('active');
                    this.toggleWeapon(btn.dataset.weapon);
                }
            });
        }
        
        const regionFilters = document.getElementById('region-filters');
        if (regionFilters) {
            regionFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (btn) {
                    btn.classList.toggle('active');
                    this.toggleRegion(btn.dataset.region);
                }
            });
        }
        
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
                this.updateUI();
            });
        }
    },
    
    updateUI() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = this.state.search;
        }
        
        document.querySelectorAll('#element-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', this.state.elements.includes(btn.dataset.element));
        });
        
        document.querySelectorAll('#weapon-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', this.state.weapons.includes(btn.dataset.weapon));
        });
        
        document.querySelectorAll('#region-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', this.state.regions.includes(btn.dataset.region));
        });
    }
};

if (typeof window !== 'undefined') {
    window.Filter = Filter;
}
