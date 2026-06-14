const MusicPlayer = {
    isOpen: false,
    isPlaying: false,
    currentTrack: null,
    volume: 0.5,
    tracks: [],
    playerType: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    position: null,
    
    defaultTracks: [
        {
            id: '1',
            title: '原神主題曲',
            type: 'youtube',
            url: 'https://www.youtube.com/watch?v=SO4pLjcTqew'
        }
    ],
    
    init(tracks = []) {
        this.tracks = tracks.length > 0 ? tracks : this.defaultTracks;
        this.volume = parseFloat(localStorage.getItem('genshin_music_volume')) || 0.5;
        this.position = JSON.parse(localStorage.getItem('genshin_music_position')) || null;
        this.render();
        this.bindEvents();
    },
    
    render() {
        const existing = document.getElementById('music-player');
        if (existing) existing.remove();
        
        const player = document.createElement('div');
        player.id = 'music-player';
        player.className = 'music-player';
        
        if (this.position) {
            player.style.left = this.position.left;
            player.style.top = this.position.top;
            player.style.right = 'auto';
            player.style.bottom = 'auto';
        }
        
        player.innerHTML = `
            <button class="music-toggle-btn" id="music-toggle" title="音樂播放器">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
            </button>
            
            <div class="music-panel" id="music-panel">
                <div class="music-header">
                    <span class="music-title">音樂播放器</span>
                    <button class="music-close" id="music-close">&times;</button>
                </div>
                
                <div class="music-content">
                    <div class="music-embed-container" id="music-embed">
                        <div class="music-placeholder">
                            <span>選擇音樂開始播放</span>
                        </div>
                    </div>
                    
                    <div class="music-controls">
                        <select id="music-source-select" class="music-select">
                            <option value="">選擇來源</option>
                            <option value="youtube">YouTube</option>
                            <option value="soundcloud">SoundCloud</option>
                        </select>
                        
                        <input type="text" id="music-url-input" class="music-input" placeholder="輸入 URL...">
                        
                        <button class="music-play-btn" id="music-play-btn">播放</button>
                    </div>
                    
                    <div class="music-tracks">
                        <div class="music-tracks-header">
                            <span>播放清單</span>
                        </div>
                        <div class="music-tracks-list" id="music-tracks-list">
                            ${this.renderTrackList()}
                        </div>
                    </div>
                    
                    <div class="music-volume">
                        <span>音量</span>
                        <input type="range" id="music-volume" min="0" max="100" value="${this.volume * 100}" class="volume-slider">
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(player);
    },
    
    renderTrackList() {
        if (this.tracks.length === 0) {
            return '<div class="no-tracks">尚未加入任何音樂</div>';
        }
        
        return this.tracks.map(track => `
            <div class="music-track-item" data-id="${track.id}">
                <span class="track-title">${track.title}</span>
                <span class="track-type">${track.type}</span>
            </div>
        `).join('');
    },
    
    bindEvents() {
        const toggleBtn = document.getElementById('music-toggle');
        
        toggleBtn?.addEventListener('mousedown', (e) => this.startDrag(e));
        toggleBtn?.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());
        
        document.getElementById('music-toggle')?.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.toggle();
            }
        });
        document.getElementById('music-close')?.addEventListener('click', () => this.close());
        
        document.getElementById('music-play-btn')?.addEventListener('click', () => {
            const url = document.getElementById('music-url-input').value;
            const source = document.getElementById('music-source-select').value;
            if (url && source) {
                this.play(url, source);
            }
        });
        
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            localStorage.setItem('genshin_music_volume', this.volume);
        });
        
        document.getElementById('music-tracks-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.music-track-item');
            if (item) {
                const track = this.tracks.find(t => t.id === item.dataset.id);
                if (track) {
                    this.play(track.url, track.type);
                }
            }
        });
    },
    
    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('music-panel');
        const btn = document.getElementById('music-toggle');
        
        if (this.isOpen) {
            panel?.classList.add('active');
            btn?.classList.add('active');
        } else {
            panel?.classList.remove('active');
            btn?.classList.remove('active');
        }
    },
    
    close() {
        this.isOpen = false;
        document.getElementById('music-panel')?.classList.remove('active');
        document.getElementById('music-toggle')?.classList.remove('active');
    },
    
    play(url, type) {
        const container = document.getElementById('music-embed');
        if (!container) return;
        
        this.playerType = type;
        this.isPlaying = true;
        
        if (type === 'youtube') {
            const videoId = this.extractYouTubeId(url);
            if (videoId) {
                container.innerHTML = `
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&volume=${Math.round(this.volume * 100)}"
                        frameborder="0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen
                    ></iframe>
                `;
            }
        } else if (type === 'soundcloud') {
            container.innerHTML = `
                <iframe 
                    src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&volume=${this.volume}"
                    frameborder="0"
                ></iframe>
            `;
        }
    },
    
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    },
    
    stop() {
        this.isPlaying = false;
        const container = document.getElementById('music-embed');
        if (container) {
            container.innerHTML = '<div class="music-placeholder"><span>選擇音樂開始播放</span></div>';
        }
    },
    
    addTrack(title, url, type) {
        const track = {
            id: Date.now().toString(),
            title,
            url,
            type
        };
        this.tracks.push(track);
        this.updateTrackList();
    },
    
    updateTrackList() {
        const list = document.getElementById('music-tracks-list');
        if (list) {
            list.innerHTML = this.renderTrackList();
        }
    },
    
    startDrag(e) {
        const player = document.getElementById('music-player');
        if (!player) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = player.getBoundingClientRect();
        
        this.isDragging = false;
        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        this.dragStartTime = Date.now();
        this.dragStartPos = { x: clientX, y: clientY };
    },
    
    drag(e) {
        const player = document.getElementById('music-player');
        if (!player || this.dragOffset.x === 0 && this.dragOffset.y === 0) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const dx = Math.abs(clientX - this.dragStartPos.x);
        const dy = Math.abs(clientY - this.dragStartPos.y);
        
        if (dx > 5 || dy > 5) {
            this.isDragging = true;
        }
        
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        const newX = clientX - this.dragOffset.x;
        const newY = clientY - this.dragOffset.y;
        
        const maxX = window.innerWidth - player.offsetWidth;
        const maxY = window.innerHeight - player.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        player.style.left = clampedX + 'px';
        player.style.top = clampedY + 'px';
        player.style.right = 'auto';
        player.style.bottom = 'auto';
    },
    
    endDrag() {
        if (this.isDragging) {
            const player = document.getElementById('music-player');
            if (player) {
                this.position = {
                    left: player.style.left,
                    top: player.style.top
                };
                localStorage.setItem('genshin_music_position', JSON.stringify(this.position));
            }
        }
        
        this.dragOffset = { x: 0, y: 0 };
        setTimeout(() => {
            this.isDragging = false;
        }, 10);
    }
};

if (typeof window !== 'undefined') {
    window.MusicPlayer = MusicPlayer;
}
