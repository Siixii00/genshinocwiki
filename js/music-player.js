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
    currentVideoId: null,
    autoPlayEnabled: true,
    
    defaultTracks: [
        {
            id: '1',
            title: '原神主題曲',
            type: 'youtube',
            url: 'https://www.youtube.com/watch?v=SO4pLjcTqew'
        }
    ],
    
    async init(tracks = []) {
        if (tracks.length > 0) {
            this.tracks = tracks;
        } else {
            await this.loadTracks();
        }
        this.volume = parseFloat(localStorage.getItem('genshin_music_volume')) || 0.5;
        this.position = JSON.parse(localStorage.getItem('genshin_music_position')) || null;
        this.autoPlayEnabled = localStorage.getItem('genshin_music_autoplay') !== 'false';
        this.render();
        this.bindEvents();
        this.bindAutoPlayToggle();
    },
    
    async loadTracks() {
        try {
            const response = await fetch('/api/music-tracks');
            if (response.ok) {
                const data = await response.json();
                this.tracks = data.tracks || this.defaultTracks;
            } else {
                const saved = localStorage.getItem('genshin_music_tracks');
                this.tracks = saved ? JSON.parse(saved) : this.defaultTracks;
            }
        } catch (e) {
            const saved = localStorage.getItem('genshin_music_tracks');
            this.tracks = saved ? JSON.parse(saved) : this.defaultTracks;
        }
    },
    
    async saveTracks() {
        localStorage.setItem('genshin_music_tracks', JSON.stringify(this.tracks));
        
        try {
            await fetch('/api/music-tracks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tracks: this.tracks })
            });
        } catch (e) {
            console.warn('Failed to save tracks to server');
        }
    },
    
    bindAutoPlayToggle() {
        const toggle = document.getElementById('music-autoplay-toggle');
        if (toggle) {
            toggle.checked = this.autoPlayEnabled;
            toggle.addEventListener('change', (e) => {
                this.autoPlayEnabled = e.target.checked;
                localStorage.setItem('genshin_music_autoplay', this.autoPlayEnabled);
            });
        }
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
                    
                    <div class="music-preview" id="music-preview" style="display: none;">
                        <img id="music-thumbnail" class="music-thumbnail" alt="Video thumbnail">
                        <button class="music-preview-play" id="music-preview-play">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                        <a id="music-youtube-link" class="music-youtube-link" target="_blank" rel="noopener">
                            在 YouTube 開啟
                        </a>
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
                <div class="track-info">
                    <span class="track-title">${track.title}</span>
                    <span class="track-type">${track.type}</span>
                </div>
                <div class="track-actions">
                    <button class="track-play-btn" data-action="play" title="播放">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button class="track-edit-btn" data-action="edit" title="編輯">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="track-delete-btn" data-action="delete" title="刪除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
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
                const title = prompt('請輸入音樂標題（留空則不自動加入播放清單）:');
                if (title && title.trim()) {
                    this.addTrack(title.trim(), url, source);
                }
            }
        });
        
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            localStorage.setItem('genshin_music_volume', this.volume);
        });
        
        document.getElementById('music-tracks-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            const item = e.target.closest('.music-track-item');
            
            if (btn && item) {
                const action = btn.dataset.action;
                const trackId = item.dataset.id;
                const track = this.tracks.find(t => t.id === trackId);
                
                if (action === 'play' && track) {
                    this.play(track.url, track.type);
                } else if (action === 'edit' && track) {
                    this.showEditDialog(track);
                } else if (action === 'delete') {
                    if (confirm('確定要刪除這首音樂嗎？')) {
                        this.removeTrack(trackId);
                    }
                }
            }
        });
        
        document.getElementById('music-preview-play')?.addEventListener('click', () => {
            if (this.currentVideoId) {
                this.playYouTube(this.currentVideoId, true);
            }
        });
    },
    
    showEditDialog(track) {
        const newTitle = prompt('音樂標題:', track.title);
        if (newTitle === null) return;
        
        const newUrl = prompt('音樂 URL:', track.url);
        if (newUrl === null) return;
        
        if (newTitle && newUrl) {
            this.editTrack(track.id, newTitle, newUrl);
        }
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
        const preview = document.getElementById('music-preview');
        if (!container) return;
        
        this.playerType = type;
        
        if (type === 'youtube') {
            const videoId = this.extractYouTubeId(url);
            if (videoId) {
                this.currentVideoId = videoId;
                this.showYouTubePreview(videoId);
            }
        } else if (type === 'soundcloud') {
            if (preview) preview.style.display = 'none';
            container.style.display = 'flex';
            this.isPlaying = true;
            container.innerHTML = `
                <iframe 
                    src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&volume=${this.volume}"
                    frameborder="0"
                ></iframe>
            `;
        }
    },
    
    showYouTubePreview(videoId) {
        const container = document.getElementById('music-embed');
        const preview = document.getElementById('music-preview');
        const thumbnail = document.getElementById('music-thumbnail');
        const link = document.getElementById('music-youtube-link');
        
        if (!preview || !thumbnail || !link) return;
        
        container.style.display = 'none';
        preview.style.display = 'block';
        
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        link.href = `https://www.youtube.com/watch?v=${videoId}`;
    },
    
    playYouTube(videoId, autoplay = false) {
        const container = document.getElementById('music-embed');
        const preview = document.getElementById('music-preview');
        if (!container) return;
        
        if (preview) preview.style.display = 'none';
        container.style.display = 'flex';
        this.isPlaying = true;
        
        container.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
            ></iframe>
        `;
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
        this.saveTracks();
    },
    
    removeTrack(id) {
        this.tracks = this.tracks.filter(t => t.id !== id);
        this.updateTrackList();
        this.saveTracks();
    },
    
    editTrack(id, newTitle, newUrl) {
        const track = this.tracks.find(t => t.id === id);
        if (track) {
            track.title = newTitle;
            track.url = newUrl;
            this.updateTrackList();
            this.saveTracks();
        }
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
