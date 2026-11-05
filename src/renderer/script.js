'use strict';
console.log("script.js loaded successfully!");

let library = [], queue = [], queueIndex = -1, currentView = 'videos', hasTrack = false;
let isShuffle = false, isRepeat = false;
let currentFolderFilter = null;

// DOM Elements
const mainVideo      = document.getElementById('main-video');
const videoContainer = document.querySelector('.video-container');
const videoOverlay   = document.getElementById('video-overlay');

const trackTitle     = document.getElementById('track-title');
const trackArtist    = document.getElementById('track-artist');
const progressBar    = document.getElementById('progress-bar');
const progressFill   = document.getElementById('progress-fill');
const timeCur        = document.getElementById('time-cur');
const timeTotal      = document.getElementById('time-total');
const btnPlay        = document.getElementById('btn-play');
const iconPlay       = document.getElementById('icon-play');
const iconPause      = document.getElementById('icon-pause');
const libraryList    = document.getElementById('library-list');
const playerPanel    = document.getElementById('player-panel');
const trackInfo      = document.getElementById('track-info');

let trackInfoTimeout = null;

// Shuffle / Repeat / Volume Elements
const btnShuffle     = document.getElementById('btn-shuffle');
const btnRepeat      = document.getElementById('btn-repeat');
const btnVolume      = document.getElementById('btn-volume');
const iconVolUp      = document.getElementById('icon-vol-up');
const iconVolMute    = document.getElementById('icon-vol-mute');
const volumeBar      = document.getElementById('volume-bar');
const volumeFill     = document.getElementById('volume-fill');

// Settings & Controls Hiding Elements
const btnSettings       = document.getElementById('btn-settings');
const settingsModal     = document.getElementById('settings-modal');
const btnCloseSettings  = document.getElementById('btn-close-settings');
const resBtns           = document.querySelectorAll('[data-res]');
const appShell          = document.querySelector('.app-shell');
const sidebar           = document.querySelector('.sidebar');

// Immersive Mode States
let controlsTimeout;
let isMouseInControls = false;

// ── Boot / Initialization ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded fired!");
    
    try {
        const settings = await window.api.getSettings();
        let resolution = settings.resolution;
        if (!resolution) {
            const width = window.screen.width;
            resolution = width >= 3840 ? '4k' : width >= 2560 ? '1440p' : width >= 1920 ? '1080p' : '720p';
            await window.api.saveSettings({ resolution });
        }
        applyResolution(resolution);
        applyLanguage(settings.language);
    } catch (error) {
        console.error('[Settings]', error);
        applyLanguage('tr');
        document.getElementById('settings-error').classList.remove('hidden');
    }

    try {
        // Load library from local JSON cache instantly (sub-50ms startup!)
        const cached = await window.api.getCachedLibrary();
        console.log("Cached library retrieved on boot:", cached ? cached.length : 0);
        if (cached && cached.length) {
            library = cached;
            renderLibrary();
        }

        const saved = await window.api.getSavedFolder();
        console.log("Saved folder retrieved:", saved);
        if (saved && saved.trim()) {
            // Perform a delayed, non-blocking background sync so startup isn't lagged
            setTimeout(async () => {
                try {
                    console.log("[Boot] Starting background library sync...");
                    const tracks = await window.api.scanFolder(saved);
                    console.log("[Boot] Background scan completed. Found videos:", tracks ? tracks.length : 0);
                    if (tracks) {
                        // Compare loaded library with background scanned tracks
                        const currentPaths = new Set(library.map(t => t.path));
                        const scannedPaths = new Set(tracks.map(t => t.path));
                        let changed = currentPaths.size !== scannedPaths.size;
                        if (!changed) {
                            for (const t of tracks) {
                                if (!currentPaths.has(t.path)) {
                                    changed = true;
                                    break;
                                }
                            }
                        }
                        if (changed) {
                            console.log("[Boot] Library changes detected. Updating UI.");
                            library = tracks;
                            renderLibrary();
                        } else {
                            console.log("[Boot] No library changes detected. Sync done.");
                        }
                    }
                } catch (err) {
                    console.error('[Boot Background Sync]', err);
                }
            }, 1500);
        }
    } catch(e) { console.error('[Boot]', e); }
    
    // Setup Volume UI
    updateVolumeUI(mainVideo.volume);
    
    // Setup Hover Checkers for Controls Hiding
    sidebar.addEventListener('mouseenter', () => { isMouseInControls = true; resetControlsTimeout(); });
    sidebar.addEventListener('mouseleave', () => { isMouseInControls = false; resetControlsTimeout(); });
    playerPanel.addEventListener('mouseenter', () => { isMouseInControls = true; resetControlsTimeout(); });
    playerPanel.addEventListener('mouseleave', () => { isMouseInControls = false; resetControlsTimeout(); });
});

// ── Folder & File Selection ──────────────────────────────────────────────────
document.getElementById('btn-folder').addEventListener('click', async () => {
    try {
        const folder = await window.api.selectFolder();
        if (!folder) return;
        const tracks = await window.api.scanFolder(folder);
        if (tracks) { 
            library = tracks; 
            currentFolderFilter = null;
            renderLibrary(); 
        }
    } catch(e) { console.error(e); }
});

document.getElementById('btn-file').addEventListener('click', async () => {
    try {
        const track = await window.api.selectFile();
        if (!track) return;
        if (!library.find(t => t.path === track.path)) {
            library.push(track);
            await window.api.saveLibraryCache(library);
        }
        renderLibrary();
        queue = [track]; 
        queueIndex = 0; 
        playTrack(track);
    } catch(e) { console.error(e); }
});

document.getElementById('btn-exit').addEventListener('click', () => window.api.exitApp());

// ── Sidebar Tabs ──────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentView = tab.dataset.view;
        currentFolderFilter = null; // reset drill down on view switch
        renderLibrary();
    });
});

// ── Render Library list ───────────────────────────────────────────────────────
function renderLibrary() {
    libraryList.innerHTML = '';
    
    if (!library.length && currentView !== 'history') { 
        libraryList.innerHTML = '<div class="empty-msg">' + t('empty') + '</div>';
        return; 
    }

    if (currentView === 'videos') {
        // Tüm Videolar
        library.forEach((t, i) => {
            addItem(t.artwork, t.title, getParentFolder(t.path), () => { 
                queue = [...library]; 
                queueIndex = i; 
                playTrack(queue[i]); 
            });
        });
    } else if (currentView === 'folders') {
        // Klasörler: Drill down ve Klasör isimlerine göre otomatik gruplama
        if (currentFolderFilter === null) {
            const grouped = groupVideosByFolder(library);
            if (grouped.size === 0) {
                libraryList.innerHTML = '<div class="empty-msg">' + t('noFolders') + '</div>';
                return;
            }
            grouped.forEach((videos, folderName) => {
                addItem(null, folderName, t('videoCount').replace('{count}', videos.length), () => {
                    currentFolderFilter = folderName;
                    renderLibrary();
                });
            });
        } else {
            // Drill down mode: list videos inside filtered folder
            // Back item
            addBackItem(t('back'), () => {
                currentFolderFilter = null;
                renderLibrary();
            });
            
            const filteredVideos = library.filter(t => getParentFolder(t.path) === currentFolderFilter);
            filteredVideos.forEach((t, i) => {
                addItem(t.artwork, t.title, "Video", () => {
                    queue = filteredVideos;
                    queueIndex = i;
                    playTrack(queue[i]);
                });
            });
        }
    } else if (currentView === 'history') {
        // Geçmiş: Son izlenenler
        const history = getHistory();
        if (!history.length) {
            libraryList.innerHTML = '<div class="empty-msg">' + t('emptyHistory') + '</div>';
            return;
        }
        history.forEach((t, i) => {
            addItem(t.artwork, t.title, getParentFolder(t.path), () => {
                queue = history;
                queueIndex = i;
                playTrack(queue[i]);
            });
        });
    }
}

// ── Path Helpers ──────────────────────────────────────────────────────────────
function getParentFolder(filePath) {
    if (!filePath) return t('unknownFolder');
    const parts = filePath.split(/[\\/]/);
    return parts.length > 1 ? parts[parts.length - 2] : 'Video';
}

function groupVideosByFolder(arr) {
    const map = new Map();
    arr.forEach(item => {
        const folder = getParentFolder(item.path);
        if (!map.has(folder)) map.set(folder, []);
        map.get(folder).push(item);
    });
    return map;
}

// ── Library List Elements ─────────────────────────────────────────────────────
function addItem(artwork, title, sub, onClick) {
    const el = document.createElement('div'); 
    el.className = 'lib-item';
    
    // Video icon or artwork thumbnail
    const img = document.createElement('div'); 
    img.className = 'lib-art';
    img.style.display = 'flex';
    img.style.alignItems = 'center';
    img.style.justifyContent = 'center';
    img.style.background = 'rgba(255, 255, 255, 0.03)';
    img.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    
    if (artwork) {
        const pic = document.createElement('img');
        pic.src = artwork;
        pic.style.width = '100%';
        pic.style.height = '100%';
        pic.style.objectFit = 'cover';
        pic.style.borderRadius = '6px';
        img.appendChild(pic);
    } else {
        // Sleek vector video icon
        img.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`;
    }
    
    const info = document.createElement('div'); 
    info.className = 'lib-info';
    
    const t = document.createElement('div'); 
    t.className = 'lib-title'; 
    t.textContent = title;
    
    const s = document.createElement('div'); 
    s.className = 'lib-sub'; 
    s.textContent = sub;
    
    info.append(t, s); 
    el.append(img, info);
    el.addEventListener('click', onClick);
    libraryList.appendChild(el);
}

function addBackItem(title, onClick) {
    const el = document.createElement('div');
    el.className = 'lib-item back-item';
    el.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    el.style.paddingBottom = '12px';
    el.style.marginBottom = '8px';
    
    const info = document.createElement('div');
    info.className = 'lib-info';
    
    const t = document.createElement('div');
    t.className = 'lib-title';
    t.textContent = title;
    t.style.fontWeight = '600';
    t.style.color = 'var(--c-accent)';
    
    info.append(t);
    el.append(info);
    el.addEventListener('click', onClick);
    libraryList.appendChild(el);
}

// ── Playback Engine ───────────────────────────────────────────────────────────
function playTrack(track) {
    if (!track) return;
    hasTrack = true;
    
    // Secure media streaming url
    const streamUrl = 'media:///' + track.path.replace(/\\/g, '/');
    mainVideo.src = streamUrl;

    const parentFolder = getParentFolder(track.path);
    trackTitle.textContent  = track.title || t('unknownTrack');
    trackArtist.textContent = parentFolder || '—';

    playerPanel.classList.add('revealed');
    
    // Oynatılan video'ya dair yazıyı 3 saniye gösterip kaybetme logic'i
    trackInfo.classList.add('revealed');
    clearTimeout(trackInfoTimeout);
    trackInfoTimeout = setTimeout(() => {
        trackInfo.classList.remove('revealed');
    }, 3000);

    mainVideo.load();
    
    mainVideo.play()
        .then(() => {
            setPlayState(true);
            addToHistory(track);
            
            // Smart Resume: check saved watched time
            const resumeProgress = localStorage.getItem(`resume_progress_${track.path}`);
            if (resumeProgress) {
                const time = parseFloat(resumeProgress);
                // Only resume if watched more than 5 seconds and not near end
                if (time > 5) {
                    mainVideo.currentTime = time;
                    showNotification(t('resuming'));
                }
            }
        })
        .catch(e => { 
            console.error('[Play Failed]', e); 
            setPlayState(false); 
        });
}

function setPlayState(playing) {
    btnPlay.title = t(playing ? 'pause' : 'play');
    btnPlay.setAttribute('aria-label', btnPlay.title);
    if (playing) {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
    } else {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
    }
}

function togglePlay() {
    if (!hasTrack) return;
    if (mainVideo.paused) {
        mainVideo.play().catch(console.error);
    } else {
        mainVideo.pause();
    }
}

btnPlay.addEventListener('click', togglePlay);
mainVideo.addEventListener('click', togglePlay); // direct screen tap toggle

// Synchronization and controls timeout triggers
mainVideo.addEventListener('play', () => {
    setPlayState(true);
    resetControlsTimeout();
});

mainVideo.addEventListener('pause', () => {
    setPlayState(false);
    // Reveal UI and reset cursor immediately on pause
    appShell.classList.remove('hide-controls');
    clearTimeout(controlsTimeout);
});

// Buffer/Loading States
mainVideo.addEventListener('waiting', () => {
    videoOverlay.classList.remove('hidden');
});
mainVideo.addEventListener('playing', () => {
    videoOverlay.classList.add('hidden');
});
mainVideo.addEventListener('loadstart', () => {
    videoOverlay.classList.remove('hidden');
});
mainVideo.addEventListener('canplay', () => {
    videoOverlay.classList.add('hidden');
});

// Skip Prev
document.getElementById('btn-prev').addEventListener('click', () => {
    if (!queue.length) return;
    if (isShuffle) {
        playRandomTrack();
    } else {
        queueIndex = (queueIndex - 1 + queue.length) % queue.length;
        playTrack(queue[queueIndex]);
    }
});

// Skip Next
document.getElementById('btn-next').addEventListener('click', () => {
    if (!queue.length) return;
    if (isShuffle) {
        playRandomTrack();
    } else {
        queueIndex = (queueIndex + 1) % queue.length;
        playTrack(queue[queueIndex]);
    }
});

// Shuffle Toggle
btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
    showNotification(isShuffle ? t('shuffleOn') : t('shuffleOff'));
});

// Repeat Toggle
btnRepeat.addEventListener('click', () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
    showNotification(isRepeat ? t('repeatOn') : t('repeatOff'));
});

// Volume & Mute Toggle
btnVolume.addEventListener('click', () => {
    mainVideo.muted = !mainVideo.muted;
    if (mainVideo.muted) {
        updateVolumeUI(0);
    } else {
        updateVolumeUI(mainVideo.volume);
    }
});

// Volume Slider adjustment
volumeBar.addEventListener('click', e => {
    const r = volumeBar.getBoundingClientRect();
    let vol = (e.clientX - r.left) / r.width;
    vol = Math.max(0, Math.min(1, vol));
    mainVideo.volume = vol;
    mainVideo.muted = false;
    updateVolumeUI(vol);
});

function updateVolumeUI(vol) {
    volumeFill.style.width = (vol * 100) + '%';
    if (vol === 0 || mainVideo.muted) {
        iconVolUp.classList.add('hidden');
        iconVolMute.classList.remove('hidden');
    } else {
        iconVolUp.classList.remove('hidden');
        iconVolMute.classList.add('hidden');
    }
}

// Playback ended trigger
mainVideo.addEventListener('ended', () => {
    if (isRepeat) {
        mainVideo.currentTime = 0;
        mainVideo.play().catch(console.error);
    } else if (isShuffle) {
        playRandomTrack();
    } else {
        const n = queueIndex + 1;
        if (n < queue.length) {
            queueIndex = n;
            playTrack(queue[n]);
        } else {
            setPlayState(false);
        }
    }
});

// Shuffle Helper
function playRandomTrack() {
    if (queue.length <= 1) {
        playTrack(queue[0]);
        return;
    }
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * queue.length);
    } while (newIndex === queueIndex);
    queueIndex = newIndex;
    playTrack(queue[queueIndex]);
}

// ── Progress Bar & Resume Playback Track ───────────────────────────────────────
mainVideo.addEventListener('timeupdate', () => {
    if (!mainVideo.duration || isNaN(mainVideo.duration)) return;
    
    // Sync UI elements
    progressFill.style.width = (mainVideo.currentTime / mainVideo.duration * 100) + '%';
    timeCur.textContent   = fmt(mainVideo.currentTime);
    timeTotal.textContent = fmt(mainVideo.duration);
    
    // Smart Resume: Save watched progress periodically
    if (hasTrack && queue[queueIndex]) {
        const currentPath = queue[queueIndex].path;
        // Don't save if near the end (remaining duration < 5s)
        if (mainVideo.duration - mainVideo.currentTime > 5) {
            localStorage.setItem(`resume_progress_${currentPath}`, mainVideo.currentTime.toString());
        } else {
            localStorage.removeItem(`resume_progress_${currentPath}`);
        }
    }
});

progressBar.addEventListener('click', e => {
    if (!mainVideo.duration || isNaN(mainVideo.duration)) return;
    const r = progressBar.getBoundingClientRect();
    const seekTime = ((e.clientX - r.left) / r.width) * mainVideo.duration;
    mainVideo.currentTime = seekTime;
});

function fmt(s) {
    if(isNaN(s)) return '0:00';
    return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

// ── Immersive Idle Cinema Mode (Controls Auto-Hiding) ──────────────────────────
function resetControlsTimeout() {
    // Show UI controls instantly
    appShell.classList.remove('hide-controls');
    
    clearTimeout(controlsTimeout);
    
    // Setup controls fadeout only if:
    // 1) Video is playing
    // 2) Mouse is NOT inside controls panels (sidebar/panel)
    // 3) Settings modal is closed
    const isSettingsOpen = !settingsModal.classList.contains('hidden');
    if (hasTrack && !mainVideo.paused && !isMouseInControls && !isSettingsOpen) {
        controlsTimeout = setTimeout(() => {
            appShell.classList.add('hide-controls');
        }, 3000); // 3 seconds idle trigger
    }
}

window.addEventListener('mousemove', resetControlsTimeout);
window.addEventListener('mousedown', resetControlsTimeout);
window.addEventListener('keydown', resetControlsTimeout);

// ── History (LocalStorage Cache) ──────────────────────────────────────────────
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('video_history')) || [];
    } catch (e) {
        return [];
    }
}

function addToHistory(track) {
    let history = getHistory();
    // Strip duplicate entries
    history = history.filter(t => t.path !== track.path);
    // Unshift to top of historical queue
    history.unshift(track);
    // Max capacity 15 entries
    if (history.length > 15) history.pop();
    localStorage.setItem('video_history', JSON.stringify(history));
}

// ── Toast Notifications ───────────────────────────────────────────────────────
function showNotification(text) {
    let toast = document.getElementById('video-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'video-toast';
        toast.style.cssText = `
            position: absolute;
            bottom: 24px;
            left: 24px;
            background: rgba(10, 10, 15, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 10px 18px;
            border-radius: 8px;
            color: #ffffff;
            font-size: 0.85rem;
            font-weight: 500;
            z-index: 999;
            backdrop-filter: blur(12px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            pointer-events: none;
            transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(12px);
            opacity: 0;
        `;
        videoContainer.appendChild(toast);
    }
    toast.textContent = text;
    
    // Trigger slide-up fade-in animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 30);
    
    // Clean timeout fades
    if (toast.fadeTimeout) clearTimeout(toast.fadeTimeout);
    toast.fadeTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
    }, 2800);
}

// ── Settings & Resolution Scaling ─────────────────────────────────────────────
btnSettings.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    appShell.classList.remove('hide-controls'); // Ensure UI stays visible
    clearTimeout(controlsTimeout);
});

btnCloseSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    resetControlsTimeout();
});

settingsModal.addEventListener('click', e => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
        resetControlsTimeout();
    }
});

resBtns.forEach(btn => {
    btn.addEventListener('click', () => persistSettings({ resolution: btn.dataset.res }));
});

function applyResolution(res) {
    let factor = 1.0;
    if (res === '720p') factor = 0.75;
    if (res === '1080p') factor = 1.0;
    if (res === '1440p') factor = 1.3333;
    if (res === '4k') factor = 2.0;

    if (window.api && window.api.setZoom) {
        window.api.setZoom(factor);
    }
    
    resBtns.forEach(b => {
        if (b.dataset.res === res) b.classList.add('active');
        else b.classList.remove('active');
    });
}

// Save before applying so a failed write leaves the last saved preference active.
let settingsWrite = Promise.resolve();
function persistSettings(patch) {
    settingsWrite = settingsWrite.then(async () => {
        try {
            const settings = await window.api.saveSettings(patch);
            applyResolution(settings.resolution);
            applyLanguage(settings.language);
            document.getElementById('settings-error').classList.add('hidden');
        } catch (error) {
            console.error('[Settings]', error);
            document.getElementById('settings-error').classList.remove('hidden');
        }
    });
    return settingsWrite;
}
document.querySelectorAll('[data-language]').forEach(btn => {
    btn.addEventListener('click', () => persistSettings({ language: btn.dataset.language }));
});
