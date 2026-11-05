const fs = require('node:fs');
const path = require('node:path');

function createStorage(root) {
    const dataDir = path.join(root, 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    for (const name of ['library.ini', 'library.json', 'settings.json']) {
        const previous = path.join(root, name);
        const target = path.join(dataDir, name);
        if (!fs.existsSync(target) && fs.existsSync(previous)) fs.renameSync(previous, target);
    }
    const settingsPath = path.join(dataDir, 'settings.json');
    const defaults = { language: 'tr', resolution: null };
    function getSettings() {
        let saved = {};
        if (fs.existsSync(settingsPath)) {
            try { saved = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) || {}; }
            catch (error) { console.error('[Settings]', error.message); }
        }
        return {
            language: ['tr', 'en'].includes(saved.language) ? saved.language : defaults.language,
            resolution: ['720p', '1080p', '1440p', '4k'].includes(saved.resolution) ? saved.resolution : null
        };
    }
    function saveSettings(patch) {
        const settings = getSettings();
        if (['tr', 'en'].includes(patch?.language)) settings.language = patch.language;
        if (['720p', '1080p', '1440p', '4k'].includes(patch?.resolution)) settings.resolution = patch.resolution;
        const temporary = settingsPath + '.tmp';
        fs.writeFileSync(temporary, JSON.stringify(settings, null, 2) + '\n', 'utf8');
        fs.renameSync(temporary, settingsPath);
        return settings;
    }
    if (!fs.existsSync(settingsPath)) saveSettings(defaults);
    if (!fs.existsSync(path.join(dataDir, 'library.ini'))) fs.writeFileSync(path.join(dataDir, 'library.ini'), '[Settings]\nVideoFolder=\n');
    if (!fs.existsSync(path.join(dataDir, 'library.json'))) fs.writeFileSync(path.join(dataDir, 'library.json'), '[]\n');
    return { dataDir, getSettings, saveSettings };
}

module.exports = { createStorage };
