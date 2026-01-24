document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        document.getElementById('loading').innerText = "錯誤：未指定國家代碼 (Missing Slug)";
        return;
    }

    fetch('static/data.json')
        .then(res => {
            if (!res.ok) throw new Error("API Error");
            return res.json();
        })
        .then(globalData => {
            const countryData = globalData[slug];
            if (!countryData) {
                document.getElementById('loading').innerText = "找不到該國家的資料: " + slug;
                return;
            }
            renderPage(slug, countryData);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('loading').innerText = "資料載入失敗，請確認 static/data.json 是否存在";
        });
});

function renderPage(slug, data) {
    // 1. 設定標題
    const displayName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    document.getElementById('page-title').innerText = displayName;
    document.title = `${displayName} - Country Profile`;

    // 2. [Row 1] 國旗
    const flagContainer = document.getElementById('flag-container');
    if (data.features && data.features['Flags'] && data.features['Flags'].length > 0) {
        const flagImg = data.features['Flags'][0];
        let src = flagImg.original_url || flagImg.local_path;
        if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
        flagContainer.innerHTML = `<img src="${src}" class="country-flag-img" alt="Flag" referrerpolicy="no-referrer">`;
    }

    // 3. [Row 1] Header 資訊 (徽章)
    const badgesContainer = document.getElementById('info-badges-container');
    const headerFields = [
        { key: 'Currencies', icon: '💰', label: 'Currency' },
        { key: 'Phonenumbers', icon: '📞', label: 'Phone' },
        { key: 'Domains', icon: '🌐', label: 'Domain' },
        { key: 'Drivingside', icon: '🚗', label: 'Drive' },
        { key: 'Snow', icon: '❄️', label: 'Snow' },
        { key: 'Lines', icon: '🛣️', label: 'Lines' }
    ];

    // 清空並重新渲染徽章
    if (badgesContainer) {
        badgesContainer.innerHTML = '';
        headerFields.forEach(field => {
            if (data.metadata && data.metadata[field.key]) {
                const meta = data.metadata[field.key];
                let val = Array.isArray(meta.value) ? meta.value.join(", ") : meta.value;
                
                if (val && val !== "nothing") {
                    const badge = document.createElement('div');
                    badge.className = 'badge-item';
                    badge.innerHTML = `
                        <span class="badge-icon">${field.icon}</span>
                        <span class="badge-value">${val}</span>
                    `;
                    badgesContainer.appendChild(badge);
                }
            }
        });
    }

    // 4. [Row 2] 語言 (Language) - 獨立渲染
    renderLanguageSection(data.metadata);

    // 5. [Row 3] 街道後綴 (Street Suffix) - 獨立渲染
    renderStreetSuffixes(data.metadata);

    // 6. [Row 4] Camera & Years
    renderInfoSection('CameraGens', 'camera-section', 'camera-value', data.metadata);
    renderInfoSection('Years', 'years-section', 'years-value', data.metadata);

    // 7. [Features] 圖片特徵 (使用固定容器分發邏輯)
    if (data.features) {
        renderFixedFeatures(data.features);
    }

    // 顯示內容
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content-area').style.display = 'block';
}

// [渲染] 語言區塊
function renderLanguageSection(metadata) {
    const langSection = document.getElementById('language-section');
    const nameTag = document.getElementById('language-name-tag');
    const charsDisplay = document.getElementById('special-chars-value');
    const descBox = document.getElementById('language-desc-value');

    if (!metadata) return;

    // 取得資料
    const languages = metadata['Languages'] ? metadata['Languages'].value : null;
    const chars = metadata['SpecialCharacters'] ? metadata['SpecialCharacters'].value : null;
    const desc = metadata['LanguageDescription'] ? metadata['LanguageDescription'].value : null;

    // 如果沒有語言資料，隱藏區塊
    if (!languages || languages === "nothing") {
        return; 
    }

    langSection.classList.remove('hidden');

    // 1. 設定語言名稱
    nameTag.innerText = languages;

    // 2. 設定特殊字符 (如果沒有或為 "-"，顯示 "None")
    charsDisplay.innerText = (chars && chars !== "-" && chars !== "nothing") ? chars : "No special characters";
    
    // 3. 設定說明 (如果有)
    if (desc && desc !== "nothing") {
        descBox.innerText = desc;
        descBox.classList.remove('hidden');
    }
}

// [渲染] 街道後綴區塊
function renderStreetSuffixes(metadata) {
    if (!metadata || !metadata['Streetsuffix']) return;

    const info = metadata['Streetsuffix'];
    const container = document.getElementById('suffix-value');
    const section = document.getElementById('suffix-section');
    
    if (!info.value || info.value === "nothing" || (Array.isArray(info.value) && info.value[0] === "nothing")) {
        return; 
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    let suffixes = Array.isArray(info.value) ? info.value : [info.value];

    suffixes.forEach(itemStr => {
        // 嘗試解析格式: "Name (Translation) [Language]"
        const match = itemStr.match(/^(.*?)\s\((.*?)\)\s\[(.*?)\]$/);
        const card = document.createElement('div');
        card.className = 'suffix-card';

        if (match) {
            card.innerHTML = `
                <div class="suffix-native">${match[1]}</div>
                <div class="suffix-trans">${match[2]}</div>
                <div class="suffix-lang">${match[3]}</div>
            `;
        } else {
            // 如果格式不符，直接顯示原始字串
            card.innerHTML = `<div class="suffix-native" style="font-size:1.2rem;">${itemStr}</div>`;
        }
        container.appendChild(card);
    });
}

// [渲染] 通用資訊區塊 (Camera, Years)
function renderInfoSection(key, sectionId, valueId, metadata) {
    if (!metadata || !metadata[key]) return;
    const info = metadata[key];
    let val = Array.isArray(info.value) ? info.value.join(", ") : info.value;
    if (val && val !== "nothing") {
        document.getElementById(valueId).innerText = val;
        document.getElementById(sectionId).classList.remove('hidden');
    }
}

// [功能] 開啟 Lightbox
function openLightbox(src) {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    box.style.display = 'flex';
}

document.getElementById('lightbox').addEventListener('click', function() {
    this.style.display = 'none';
});

// [核心] 將特徵圖片分發到 HTML 固定容器
function renderFixedFeatures(features) {
    // 定義分類與對應的特徵 Keys (需與 index.html 的側邊欄邏輯一致)
    const categories = [
        {
            id: 'infrastructure', 
            keys: ['Lines', 'Sidewalks', 'Bollards', 'Trafficlights', 'Utilitypoles', 'Postboxes']
        },
        {
            id: 'signs',
            // Signs 通常有很多種，這裡使用過濾邏輯：所有以 'Signs_' 開頭的 key
            filter: (key) => key.startsWith('Signs_')
        },
        {
            id: 'urban',
            keys: ['Architecture', 'Housenumbers', 'Licenseplates', 'Flags', 'Companies_beer', 'Companies_gasstations', 'Companies_post']
        },
        {
            id: 'nature',
            keys: ['Nature', 'Sceneries', 'Snow', 'Rifts']
        },
        {
            id: 'vehicles',
            // 包含 Followcars 與所有 Googlevehicles_ 開頭的 key
            filter: (key) => key === 'Followcars' || key.startsWith('Googlevehicles_')
        }
    ];

    // 遍歷每個分類進行渲染
    categories.forEach(cat => {
        const container = document.getElementById(`container-${cat.id}`);
        const group = document.getElementById(`group-${cat.id}`);
        
        if (!container || !group) return;

        // 清空容器 (避免重複渲染)
        container.innerHTML = '';
        let hasContent = false;

        // 1. 找出該分類下所有需要顯示的 Feature Keys
        let targetKeys = [];
        if (cat.keys) {
            targetKeys = cat.keys;
        } else if (cat.filter) {
            targetKeys = Object.keys(features).filter(cat.filter);
        }

        // 2. 遍歷 Keys，若資料存在則建立圖片
        targetKeys.forEach(key => {
            if (features[key] && features[key].length > 0) {
                hasContent = true;
                
                // 為了顯示美觀，我們將 Feature Key 轉為易讀標題 (例如: "Signs_stop" -> "Signs Stop")
                const displayTitle = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

                // 呼叫輔助函式建立圖片卡片
                features[key].forEach(imgData => {
                    const item = createGalleryItem(imgData, displayTitle); 
                    container.appendChild(item);
                });
            }
        });

        // 3. 如果該分類有內容，則顯示整個區塊；否則保持隱藏 (HTML 中預設為 hidden)
        if (hasContent) {
            group.classList.remove('hidden');
        } else {
            group.classList.add('hidden');
        }
    });
}

const ERROR_IMAGE_URL = 'static/images/error_placeholder.png';
// [輔助] 建立單張圖片卡片 DOM
function createGalleryItem(imgData, captionTitle) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    // 1. 只使用外部連結
    const targetSrc = imgData.original_url; 

    const img = document.createElement('img');
    img.src = targetSrc;
    img.alt = imgData.alt_description || captionTitle;
    img.loading = "lazy";

    // 2. 錯誤處理：如果外部連結掛了，顯示錯誤佔位圖
    img.onerror = function() {
        // 防止錯誤圖也掛掉造成無窮迴圈
        if (this.src !== window.location.origin + '/' + ERROR_IMAGE_URL) {
            console.warn(`圖片載入失敗: ${targetSrc}，切換至錯誤圖。`);
            this.src = ERROR_IMAGE_URL;
            this.classList.add('img-error'); // 可用 CSS 調整樣式(例如變灰)
            // 圖片失效時，可以移除點擊放大功能，避免打開是破圖
            this.onclick = null; 
        }
    };

    // 只有載入成功時才允許點擊放大
    img.onload = () => {
        img.onclick = () => openLightbox(img.src);
    };

    // 建立說明文字
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.innerText = imgData.alt_description || captionTitle; 

    item.appendChild(img);
    item.appendChild(caption);

    return item;
}