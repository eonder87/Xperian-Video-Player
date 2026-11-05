<div align="center">

# 🎬 Xperian Video Player

**A cinematic, fullscreen video player for your local media library.**

**Yerel video arşiviniz için sinematik, tam ekran bir video oynatıcı.**

[🇬🇧 English](#english) · [🇹🇷 Türkçe](#türkçe)

[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/eonder87/Xperian-Video-Player)
![Electron](https://img.shields.io/badge/Electron-42-47848F?logo=electron&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.1-555555)

</div>

---

<a id="english"></a>

# 🇬🇧 English

## 🎞️ Overview

**Xperian Video Player** is an Electron-based desktop application designed to browse and play local videos through a dark, cinematic, fullscreen interface. It combines a video library, folder navigation, playback history, and familiar player controls in one Windows-focused application.

> **Development status:** The project is under development. Features and playback compatibility may change as the application evolves.

## ✨ Features

### 🖥️ Cinematic interface

- Dark, frameless, fullscreen application window.
- Dedicated video viewport with a loading indicator.
- Sidebar for navigating your media collection.
- Playback information and a bottom control panel.
- Adjustable interface scaling presets: **720p, 1080p, 1440p, and 4K**.

### 📚 Local video library

- Select a video folder and scan its subfolders recursively.
- Browse **Videos**, **Folders**, and **History** from the sidebar.
- Open an individual video file without selecting an entire library.
- Read available metadata (such as title and embedded artwork) from supported containers.
- Store the selected folder in `library.ini` and cache the scanned library in `library.json`.

### ⏯️ Playback controls

- Play and pause.
- Previous and next video.
- Shuffle and repeat controls.
- Seek through the playback timeline.
- Adjust volume and toggle mute.
- Stream local files using an internal `media://` protocol with byte-range support for seeking.

### 📦 Portable Windows build

- Electron-based desktop application.
- Windows **portable** packaging target configured with `electron-builder`.
- Configuration and library cache stored alongside the portable application, subject to folder write permissions.
- Single-instance behavior prevents multiple application windows from running independently.

## 🎥 Recognized video file extensions

| Extension | Container / format |
| --- | --- |
| `.mp4` | MP4 |
| `.webm` | WebM |
| `.ogv` | Ogg Video |
| `.mkv` | Matroska |
| `.avi` | AVI |
| `.mov` | QuickTime MOV |
| `.ts` | MPEG Transport Stream |
| `.m4v` | M4V |

> **Note:** These are the extensions accepted by the file picker and library scanner. Actual video and audio decoding depends on the codecs supported by the Electron/Chromium playback engine. Recognizing a container does not guarantee that every file using that extension will play.

## 🚀 Getting started

### Requirements

- Windows desktop environment.
- [Node.js](https://nodejs.org/) and npm to run from source or create a build.

### Run from source

```bash
git clone https://github.com/eonder87/Xperian-Video-Player.git
cd Xperian-Video-Player
npm install
npm start
```

### Build a portable executable

```bash
npm run build
```

The packaging configuration targets a portable Windows executable and writes build artifacts to `dist/`.

### Basic usage

1. Launch the application.
2. Use the **folder** button to select your video library, or the **add file** button to open a single video.
3. Browse the **Videos**, **Folders**, or **History** tabs.
4. Select a video and use the playback controls.
5. Open **Settings** to adjust the interface scale for your display.

## 🛠️ Technology

| Component | Purpose |
| --- | --- |
| Electron | Desktop application runtime |
| HTML, CSS, JavaScript | User interface |
| Node.js | Local file and application operations |
| `music-metadata` | Metadata extraction for selected file formats |
| `ini` | Local configuration handling |
| `electron-builder` | Portable Windows packaging |

## 📂 Configuration and data

| File / directory | Purpose |
| --- | --- |
| `src/main/` | Electron main-process code |
| `src/renderer/` | Video player interface |
| `library.ini` | Saved library folder path |
| `library.json` | Cached library entries and file paths |
| `temp/` | Temporary application data |
| `dist/` | Generated builds |

> **Privacy note:** `library.ini` and `library.json` can contain local file paths. Avoid committing personal library data to a public repository.

## 🔗 Project

- **Repository:** https://github.com/eonder87/Xperian-Video-Player
- **Author:** Xperian
- **Version in `package.json`:** 1.0.1

---

<a id="türkçe"></a>

# 🇹🇷 Türkçe

## 🎞️ Genel Bakış

**Xperian Video Player**, yerel videoları karanlık, sinematik ve tam ekran bir arayüz üzerinden görüntülemek ve oynatmak için geliştirilmiş Electron tabanlı bir masaüstü uygulamasıdır. Video kütüphanesini, klasör gezintisini, oynatma geçmişini ve alışıldık oynatıcı kontrollerini Windows odaklı tek bir uygulamada birleştirir.

> **Geliştirme durumu:** Proje geliştirilmektedir. Özellikler ve oynatma uyumluluğu uygulama geliştikçe değişebilir.

## ✨ Özellikler

### 🖥️ Sinematik arayüz

- Karanlık, çerçevesiz, tam ekran uygulama penceresi.
- Yükleme göstergesine sahip özel video görüntüleme alanı.
- Medya koleksiyonunda gezinmek için kenar çubuğu.
- Oynatma bilgileri ve alt kontrol paneli.
- Ayarlanabilir arayüz ölçeği seçenekleri: **720p, 1080p, 1440p ve 4K**.

### 📚 Yerel video kütüphanesi

- Video klasörü seçme ve alt klasörleri özyinelemeli tarama.
- Kenar çubuğundaki **Videolar**, **Klasörler** ve **Geçmiş** bölümlerinde gezinme.
- Tüm kütüphaneyi seçmeden tek bir video dosyası açma.
- Desteklenen kapsayıcılardan mevcut metadata bilgilerini (örneğin başlık ve gömülü kapak görseli) okuma.
- Seçilen klasörü `library.ini` dosyasında, taranan kütüphaneyi ise `library.json` önbelleğinde saklama.

### ⏯️ Oynatma kontrolleri

- Oynat ve duraklat.
- Önceki ve sonraki video.
- Karışık oynatma ve tekrar kontrolleri.
- İlerleme çubuğu üzerinden video içerisinde gezinme.
- Ses seviyesi ayarlama ve sessize alma.
- Video içerisinde ileri-geri sarmayı desteklemek için bayt aralıklı veri aktarımı sağlayan dahili `media://` protokolü.

### 📦 Taşınabilir Windows sürümü

- Electron tabanlı masaüstü uygulaması.
- `electron-builder` ile yapılandırılmış Windows **portable** paketleme hedefi.
- Klasör yazma izinlerine bağlı olarak, yapılandırma ve kütüphane önbelleğinin taşınabilir uygulamayla aynı dizinde tutulması.
- Aynı anda birden fazla bağımsız uygulama penceresinin çalışmasını önleyen tek örnek mekanizması.

## 🎥 Tanınan video dosyası uzantıları

| Uzantı | Kapsayıcı / biçim |
| --- | --- |
| `.mp4` | MP4 |
| `.webm` | WebM |
| `.ogv` | Ogg Video |
| `.mkv` | Matroska |
| `.avi` | AVI |
| `.mov` | QuickTime MOV |
| `.ts` | MPEG Transport Stream |
| `.m4v` | M4V |

> **Not:** Bunlar dosya seçici ve kütüphane tarayıcısının kabul ettiği uzantılardır. Gerçek video ve ses çözümleme desteği Electron/Chromium oynatma motorunun desteklediği codec'lere bağlıdır. Bir kapsayıcının tanınması, o uzantıya sahip her dosyanın oynatılacağını garanti etmez.

## 🚀 Başlangıç

### Gereksinimler

- Windows masaüstü ortamı.
- Kaynak koddan çalıştırmak veya paket oluşturmak için [Node.js](https://nodejs.org/) ve npm.

### Kaynak koddan çalıştırma

```bash
git clone https://github.com/eonder87/Xperian-Video-Player.git
cd Xperian-Video-Player
npm install
npm start
```

### Taşınabilir uygulama oluşturma

```bash
npm run build
```

Paketleme yapılandırması taşınabilir Windows uygulamasını hedefler ve oluşturulan dosyaları `dist/` dizinine kaydeder.

### Temel kullanım

1. Uygulamayı başlatın.
2. **Klasör** düğmesiyle video arşivinizi seçin veya **dosya ekleme** düğmesiyle tek bir video açın.
3. **Videolar**, **Klasörler** ve **Geçmiş** sekmelerinde gezinin.
4. Bir video seçip oynatma kontrollerini kullanın.
5. Ekranınıza uygun arayüz ölçeğini ayarlamak için **Ayarlar** bölümünü açın.

## 🛠️ Kullanılan teknolojiler

| Bileşen | Görev |
| --- | --- |
| Electron | Masaüstü uygulama altyapısı |
| HTML, CSS, JavaScript | Kullanıcı arayüzü |
| Node.js | Yerel dosya ve uygulama işlemleri |
| `music-metadata` | Seçili dosya biçimlerinden metadata okuma |
| `ini` | Yerel yapılandırma yönetimi |
| `electron-builder` | Taşınabilir Windows uygulaması oluşturma |

## 📂 Yapılandırma ve veriler

| Dosya / dizin | Görev |
| --- | --- |
| `src/main/` | Electron ana işlem kodu |
| `src/renderer/` | Video oynatıcı arayüzü |
| `library.ini` | Kaydedilen video kütüphanesi klasörü |
| `library.json` | Önbelleğe alınan kütüphane kayıtları ve dosya yolları |
| `temp/` | Geçici uygulama verileri |
| `dist/` | Oluşturulan uygulama paketleri |

> **Gizlilik notu:** `library.ini` ve `library.json` yerel dosya yolları içerebilir. Kişisel kütüphane verilerini herkese açık bir depoya göndermekten kaçının.

## 🔗 Proje

- **GitHub:** https://github.com/eonder87/Xperian-Video-Player
- **Geliştirici:** Xperian
- **`package.json` sürümü:** 1.0.1
