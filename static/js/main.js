// 1. 國家名稱對照表 (Slug -> ISO 代碼)
const SLUG_TO_ISO = {
    "afghanistan": "AF", "aland": "AX", "albania": "AL", "algeria": "DZ", "american-samoa": "AS", "andorra": "AD", "angola": "AO", "antigua-and-barbuda": "AG", "argentina": "AR", "armenia": "AM", "australia": "AU", "austria": "AT", "azerbaijan": "AZ",
    "bahamas": "BS", "bahrain": "BH", "bangladesh": "BD", "barbados": "BB", "belarus": "BY", "belgium": "BE", "belize": "BZ", "benin": "BJ", "bermuda": "BM", "bhutan": "BT", "bolivia": "BO", "bosnia-and-herzegovina": "BA", "botswana": "BW", "brazil": "BR", "british-indian-ocean-territory": "IO", "brunei": "BN", "bulgaria": "BG", "burkina-faso": "BF", "burundi": "BI",
    "cabo-verde": "CV", "cambodia": "KH", "cameroon": "CM", "canada": "CA", "central-african-republic": "CF", "chad": "TD", "chile": "CL", "china": "CN", "christmas-island": "CX", "cocos-islands": "CC", "colombia": "CO", "comoros": "KM", "costa-rica": "CR", "côte-d’ivoire": "CI", "cote-divoire": "CI", "croatia": "HR", "cuba": "CU", "curacao": "CW", "cyprus": "CY", "czech-republic": "CZ",
    "democratic-republic-of-the-congo": "CD", "denmark": "DK", "djibouti": "DJ", "dominica": "DM", "dominican-republic": "DO",
    "ecuador": "EC", "egypt": "EG", "el-salvador": "SV", "equatorial-guinea": "GQ", "eritrea": "ER", "estonia": "EE", "eswatini": "SZ", "ethiopia": "ET",
    "falkland-islands": "FK", "faroe-islands": "FO", "fiji": "FJ", "finland": "FI", "france": "FR", "french-guiana": "GF",
    "gabon": "GA", "gambia": "GM", "georgia": "GE", "germany": "DE", "ghana": "GH", "gibraltar": "GI", "greece": "GR", "greenland": "GL", "grenada": "GD", "guam": "GU", "guatemala": "GT", "guinea": "GN", "guinea-bissau": "GW", "guyana": "GY",
    "haiti": "HT", "honduras": "HN", "hong-kong": "HK", "hungary": "HU",
    "iceland": "IS", "india": "IN", "indonesia": "ID", "iran": "IR", "iraq": "IQ", "ireland": "IE", "isle-of-man": "IM", "israel": "IL", "italy": "IT",
    "jamaica": "JM", "japan": "JP", "jersey": "JE", "jordan": "JO",
    "kazakhstan": "KZ", "kenya": "KE", "kiribati": "KI", "kosovo": "XK", "kuwait": "KW", "kyrgyzstan": "KG",
    "laos": "LA", "latvia": "LV", "lebanon": "LB", "lesotho": "LS", "liberia": "LR", "libya": "LY", "liechtenstein": "LI", "lithuania": "LT", "luxembourg": "LU",
    "macao": "MO", "madagascar": "MG", "malawi": "MW", "malaysia": "MY", "maldives": "MV", "mali": "ML", "malta": "MT", "marshall-islands": "MH", "martinique": "MQ", "mauritania": "MR", "mauritius": "MU", "mexico": "MX", "micronesia": "FM", "moldova": "MD", "monaco": "MC", "mongolia": "MN", "montenegro": "ME", "morocco": "MA", "mozambique": "MZ", "myanmar": "MM",
    "namibia": "NA", "nauru": "NR", "nepal": "NP", "netherlands": "NL", "new-zealand": "NZ", "nicaragua": "NI", "niger": "NE", "nigeria": "NG", "north-korea": "KP", "north-macedonia": "MK", "northern-mariana-islands": "MP", "norway": "NO",
    "oman": "OM",
    "pakistan": "PK", "palau": "PW", "palestine": "PS", "panama": "PA", "papua-new-guinea": "PG", "paraguay": "PY", "peru": "PE", "philippines": "PH", "pitcairn-islands": "PN", "poland": "PL", "portugal": "PT", "puerto-rico": "PR",
    "qatar": "QA",
    "republic-of-the-congo": "CG", "reunion": "RE", "romania": "RO", "russia": "RU", "rwanda": "RW",
    "saint-kitts-and-nevis": "KN", "saint-lucia": "LC", "saint-pierre-and-miquelon": "PM", "saint-vincent-and-the-grenadines": "VC", "samoa": "WS", "san-marino": "SM", "sao-tome-and-principe": "ST", "saudi-arabia": "SA", "senegal": "SN", "serbia": "RS", "seychelles": "SC", "sierra-leone": "SL", "singapore": "SG", "slovakia": "SK", "slovenia": "SI", "solomon-islands": "SB", "somalia": "SO", "south-africa": "ZA", "south-georgia-and-the-south-sandwich-islands": "GS", "south-korea": "KR", "south-sudan": "SS", "spain": "ES", "sri-lanka": "LK", "sudan": "SD", "suriname": "SR", "svalbard-and-jan-mayen": "SJ", "sweden": "SE", "switzerland": "CH", "syria": "SY",
    "taiwan": "TW", "tajikistan": "TJ", "tanzania": "TZ", "thailand": "TH", "timor-leste": "TL", "togo": "TG", "tonga": "TO", "trinidad-and-tobago": "TT", "tunisia": "TN", "turkey": "TR", "turkmenistan": "TM", "tuvalu": "TV",
    "uganda": "UG", "ukraine": "UA", "united-arab-emirates": "AE", "united-kingdom": "GB", "united-states": "US", "united-states-virgin-islands": "VI", "uruguay": "UY", "uzbekistan": "UZ",
    "vanuatu": "VU", "vatican-city": "VA", "venezuela": "VE", "vietnam": "VN",
    "western-sahara": "EH",
    "yemen": "YE",
    "zambia": "ZM", "zimbabwe": "ZW"
};

// 反向對照表 (ISO -> Slug)
const ISO_TO_SLUG = Object.fromEntries(Object.entries(SLUG_TO_ISO).map(([k, v]) => [v, k]));

let globalData = {};
let featureDataCache = {}; 
let currentSelectedFeature = null; // 用來追蹤目前是否有選取特徵

/* ==========================================================
   [修正版] 全域佈局調整函式
   ========================================================== */
window.adjustTooltipLayout = function(imgElement) {
    const container = imgElement.closest('.popup-gallery.preview-mode');
    if (!container) return;

    requestAnimationFrame(() => {
        const boxes = Array.from(container.querySelectorAll('.popup-img-box.small'));
        const moreTextDiv = container.querySelector('.more-count-indicator');
        const totalImages = parseInt(container.dataset.totalImages || 0);

        const MAX_HEIGHT = 350; 
        const TEXT_BUFFER = 28; 
        
        let currentAccumulatedHeight = 0;
        let visibleCount = 0;

        boxes.forEach(b => b.style.display = 'flex');

        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const h = box.getBoundingClientRect().height;
            
            if (h < 5) {
                visibleCount++;
                continue; 
            }

            const gap = (visibleCount > 0) ? 6 : 0;
            const nextHeight = currentAccumulatedHeight + gap + h;
            const isLastImage = (i === totalImages - 1);
            const limit = isLastImage ? MAX_HEIGHT : (MAX_HEIGHT - TEXT_BUFFER);

            if (nextHeight <= limit) {
                currentAccumulatedHeight = nextHeight;
                visibleCount++;
            } else {
                box.style.display = 'none';
            }
        }

        if (moreTextDiv) {
            const remaining = totalImages - visibleCount;
            if (remaining > 0) {
                moreTextDiv.innerText = `+ ${remaining} more`;
                moreTextDiv.style.display = 'block';
            } else {
                moreTextDiv.style.display = 'none';
            }
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    createResultModal();
    setupSidebarInteractions();

    fetch('static/data.json')
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => {
            console.log(`成功載入資料，共 ${Object.keys(data).length} 筆`);
            globalData = data;
            
            if(typeof simplemaps_worldmap !== 'undefined'){
                if (typeof simplemaps_worldmap.disable_urls === 'function') {
                    simplemaps_worldmap.disable_urls();
                }

                if (!simplemaps_worldmap.hooks) simplemaps_worldmap.hooks = {};
                
                // [修改] 點擊事件：增加 No Coverage 攔截邏輯
                simplemaps_worldmap.hooks.click_state = function (id) {
                    const slug = ISO_TO_SLUG[id];
                    const countryData = globalData[slug];

                    // 1. [新增] 檢查覆蓋狀態，如果是 No Coverage 則禁止點擊
                    let coverageStatus = "No Coverage";
                    if (countryData && countryData.metadata && countryData.metadata.Coverage) {
                        const val = countryData.metadata.Coverage.value;
                        coverageStatus = Array.isArray(val) ? val[0] : val;
                    }
                    if (coverageStatus === "No Coverage") {
                        console.log("No Coverage, click blocked.");
                        return; // 直接結束，不執行任何動作
                    }

                    // 2. 正常點擊邏輯
                    // 情境 A：如果有快取資料 (代表該國家有目前選取的特徵) -> 顯示彈窗
                    if (featureDataCache[id]) {
                        const modal = document.getElementById('result-modal');
                        const modalBody = document.getElementById('result-modal-body');
                        const modalTitleLink = document.getElementById('result-modal-title-link'); 
                        
                        if (modal && modalBody) {
                            const stateName = simplemaps_worldmap_mapdata.state_specific[id]?.name || id;
                            modalTitleLink.innerText = stateName + " ↗"; 
                            
                            if (slug) {
                                modalTitleLink.href = `country.html?slug=${slug}`;
                                modalTitleLink.target = "_blank"; 
                                modalTitleLink.style.pointerEvents = "auto";
                                modalTitleLink.style.textDecoration = "underline";
                            } else {
                                modalTitleLink.href = "#";
                                modalTitleLink.style.pointerEvents = "none";
                                modalTitleLink.style.textDecoration = "none";
                            }

                            modalBody.innerHTML = featureDataCache[id];
                            modal.style.display = 'flex';
                        }
                    } 
                    // 情境 B：沒有快取資料 (跳轉到國家頁面)
                    else {
                        if (slug) {
                            window.open(`country.html?slug=${slug}`, '_blank');
                        } else {
                            console.warn("無法找到該 ISO 代碼對應的國家資料:", id);
                        }
                    }
                };

                // 載入後立即更新一次地圖
                updateMap(null);

                simplemaps_worldmap.load();
            }
        })
        .catch(err => {
            console.error("載入失敗:", err);
        });
});

function setupSidebarInteractions() {
    const sidebar = document.getElementById('sidebar-content');
    
    sidebar.addEventListener('change', (e) => {
        if (e.target.name === 'feature_select') {
            const featureValue = e.target.value;
            document.querySelectorAll('.feature-item').forEach(el => el.classList.remove('active'));
            e.target.closest('.feature-item').classList.add('active');
            
            updateMap(featureValue);
        }
    });

    const headerTitle = document.querySelector('.sidebar .header h2');
    if (headerTitle) {
        headerTitle.addEventListener('click', () => {
            console.log("重置地圖：取消所有特徵選取");
            const radios = document.querySelectorAll('input[name="feature_select"]');
            radios.forEach(r => r.checked = false);
            document.querySelectorAll('.feature-item').forEach(el => el.classList.remove('active'));
            updateMap(null);
        });
    }
}

function updateMap(selectedFeature) {
    console.log("切換特徵:", selectedFeature);
    currentSelectedFeature = selectedFeature;

    if (typeof simplemaps_worldmap_mapdata === 'undefined') return;

    // 清除舊狀態
    featureDataCache = {}; 
    for (const iso in simplemaps_worldmap_mapdata.state_specific) {
        const state = simplemaps_worldmap_mapdata.state_specific[iso];
        if (state) {
            delete state.description;
            delete state.color;
            delete state.hover_color;
            delete state.class;
        }
    }

    let matchCount = 0;
    const PRELOAD_LIMIT = 5; 

    // 遍歷所有國家
    for (const [slug, iso] of Object.entries(SLUG_TO_ISO)) {
        const countryData = globalData[slug];
        
        if (!simplemaps_worldmap_mapdata.state_specific[iso]) {
            simplemaps_worldmap_mapdata.state_specific[iso] = {};
        }
        const stateObj = simplemaps_worldmap_mapdata.state_specific[iso];

        // 1. 取得 Coverage 狀態
        let coverageStatus = "No Coverage";
        if (countryData && countryData.metadata && countryData.metadata.Coverage) {
            const val = countryData.metadata.Coverage.value;
            coverageStatus = Array.isArray(val) ? val[0] : val;
        }

        if (coverageStatus === "No Coverage") {
            stateObj.description = '<div style="margin-top:5px; color:#999; font-style:italic; font-size:12px;">No Coverage</div>';
            continue;
        }

        if (!selectedFeature) {
            let statusColor = "#333";
            if(coverageStatus.includes("Rare")) statusColor = "#d9534f";
            else statusColor = "#28a745";

            stateObj.description = `<div style="margin-top:5px; font-weight:bold; color:${statusColor};">${coverageStatus}</div>`;
            continue;
        }

        // 3. 有選特徵 且 有覆蓋
        let hasMatch = false;
        let previewHtml = null; 
        let fullHtml = null;
        const ERROR_PLACEHOLDER = 'static/images/error_placeholder.png'; // 確保這張圖存在
        
        if (countryData) {
            // A. 處理圖片特徵
            if (countryData.features && countryData.features[selectedFeature]) {
                const images = countryData.features[selectedFeature];
                
                if (images.length > 0) {
                    hasMatch = true;

                    // 1. 完整版
                    fullHtml = `<div class="popup-gallery full-mode">`;
                    images.forEach(img => {
                        let src = img.original_url;
                        // [修正]：只有當它"不是" http 開頭 且 "不是" / 開頭時，才補上 /
                        if (!src.startsWith('http') && !src.startsWith('/')) {
                            src = '/' + src;
                        }

                        fullHtml += `
                            <div class="popup-img-box large">
                                <img src="${src}" 
                                    alt="${img.alt_description || ''}" 
                                    loading="lazy"
                                    onerror="this.onerror=null; this.src='${ERROR_PLACEHOLDER}';">
                                <div style="font-size:12px; margin-top:4px; color:#555;">
                                    ${img.alt_description || ''}
                                </div>
                            </div>`;
                    });
                    fullHtml += `</div>`;

                    // 2. 預覽版
                    previewHtml = `<div class="popup-gallery preview-mode" data-total-images="${images.length}">`;
                    images.slice(0, PRELOAD_LIMIT).forEach(img => {
                        let src = img.original_url;
                        // [修正]：同樣的邏輯
                        if (!src.startsWith('http') && !src.startsWith('/')) {
                            src = '/' + src;
                        }

                        previewHtml += `
                            <div class="popup-img-box small">
                                <img src="${src}" 
                                    onload="window.adjustTooltipLayout(this)" 
                                    onerror="this.onerror=null; this.src='${ERROR_PLACEHOLDER}'; window.adjustTooltipLayout(this);"
                                    alt="${img.alt_description || ''}">
                            </div>`;
                    });
                    previewHtml += `<div class="more-count-indicator" style="display:none;"></div>`;
                    previewHtml += `</div>`;
                }
            }
            // B. 處理文字特徵
            else if (countryData.metadata && countryData.metadata[selectedFeature]) {
                const meta = countryData.metadata[selectedFeature];
                let valStr = Array.isArray(meta.value) ? meta.value.join(", ") : meta.value;
                if (valStr && valStr !== "nothing") {
                    hasMatch = true;
                    fullHtml = `<div class="popup-text-content"><strong>${valStr}</strong><br></div>`;
                    previewHtml = fullHtml;
                }
            }
        }

        if (hasMatch) {
            matchCount++;
            featureDataCache[iso] = fullHtml;
            stateObj.description = previewHtml;
            stateObj.color = "#ff5722"; 
            stateObj.hover_color = "#e64a19";
        } else {
            stateObj.description = '<div style="margin-top:5px; color:#999; font-style:italic; font-size:12px;">No Info.</div>';
        }
    }
    
    console.log(`地圖更新完成，共有 ${matchCount} 個國家顯示該特徵。`);
    
    if(typeof simplemaps_worldmap !== 'undefined'){
        simplemaps_worldmap.refresh();
    }
}

function createResultModal() {
    if (document.getElementById('result-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'result-modal';
    modal.className = 'custom-modal-overlay';
    
    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h3>
                    <a id="result-modal-title-link" href="#" style="color: #333; text-decoration: none;">Country Name</a>
                </h3>
                <span class="custom-modal-close">&times;</span>
            </div>
            <div id="result-modal-body" class="custom-modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.custom-modal-close');
    const closeAction = () => { modal.style.display = 'none'; };
    
    closeBtn.addEventListener('click', closeAction);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAction();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeAction();
        }
    });
}