const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getSavedFolder: ()       => ipcRenderer.invoke('get-saved-folder'),
    selectFolder:   ()       => ipcRenderer.invoke('select-folder'),
    selectFile:     ()       => ipcRenderer.invoke('select-file'),
    scanFolder:     (folder) => ipcRenderer.invoke('scan-folder', folder),
    getCachedLibrary: ()     => ipcRenderer.invoke('get-cached-library'),
    saveLibraryCache: (tracks) => ipcRenderer.invoke('save-library-cache', tracks),
    exitApp:        ()       => ipcRenderer.invoke('exit-app'),
    setZoom:        (factor) => webFrame.setZoomFactor(factor)
});
