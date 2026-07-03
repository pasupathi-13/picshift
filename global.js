/**
 * PicShift - Global UI & App Shell Script
 * Dynamic Navigation, Mobile Bottom Sheet, Search Filtering & Dark Mode
 */

(function () {
    // 1. Initialize Dark Mode immediately to prevent flashing
    const savedTheme = localStorage.getItem('picshift-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('dark-mode');
        });
    }

    // Navigation and Footer data structures
    const toolsData = {
        converters: [
            { name: 'WebP to PNG', url: 'webp-to-png.html', icon: 'fas fa-image' },
            { name: 'Image to WebP', url: 'to-webp.html', icon: 'fas fa-exchange-alt' },
            { name: 'Image to Base64', url: 'to-base64.html', icon: 'fas fa-code' },
            { name: 'Base64 to Image', url: 'base64-to-image.html', icon: 'fas fa-file-code' }
        ],
        enhancers: [
            { name: 'Image to HD', url: 'image-to-hd.html', icon: 'fas fa-star' },
            { name: 'Blur Effect', url: 'blur.html', icon: 'fas fa-tint' },
            { name: 'Brightness', url: 'brightness.html', icon: 'fas fa-sun' },
            { name: 'Grayscale', url: 'grayscale.html', icon: 'fas fa-adjust' }
        ],
        pdf: [
            { name: 'Image to PDF', url: 'image-to-pdf.html', icon: 'fas fa-file-pdf' },
            { name: 'PDF to Image', url: 'pdf-to-image.html', icon: 'fas fa-file-image' }
        ],
        utilities: [
            { name: 'Rotate Image', url: 'rotate.html', icon: 'fas fa-undo-alt' },
            { name: 'Add Watermark', url: 'watermark.html', icon: 'fas fa-watermark' },
            { name: 'PNG to JPG', url: 'png-to-jpg.html', icon: 'fas fa-file-image' }
        ]
    };

    // Helper to get active page filename
    const getActivePage = () => {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'index.html';
    };

    const activePage = getActivePage();

    // DOM rendering on load
    document.addEventListener('DOMContentLoaded', () => {
        // Run cleanups on any pre-existing nav or footer elements (static ones from original HTML)
        const oldNavs = document.querySelectorAll('nav, .navbar, .nav-desktop, .nav-mobile');
        oldNavs.forEach(nav => nav.remove());
        
        const oldFooters = document.querySelectorAll('footer, .footer');
        oldFooters.forEach(footer => footer.remove());

        // Get the page title to display in mobile header
        let pageDisplayTitle = 'PicShift';
        if (activePage !== 'index.html' && activePage !== '') {
            const h1Element = document.querySelector('h1');
            if (h1Element) {
                pageDisplayTitle = h1Element.textContent.trim();
            } else {
                // fallback to filename prettifying
                const nameWithoutExt = activePage.replace('.html', '').replace(/-/g, ' ');
                pageDisplayTitle = nameWithoutExt.replace(/\b\w/g, c => c.toUpperCase());
            }
        }

        // Render Desktop Header
        renderDesktopHeader();

        // Render Mobile Top Header & Bottom Tab Bar
        renderMobileAppShell(pageDisplayTitle);

        // Render Footer
        renderFooter();

        // Initialize Theme Toggle functionality
        initThemeToggle();

        // Initialize Mobile Bottom Sheet
        initBottomSheet();
    });

    // --- RENDER DESKTOP HEADER ---
    function renderDesktopHeader() {
        const header = document.createElement('nav');
        header.className = 'nav-desktop';
        
        const isHomeActive = activePage === 'index.html' || activePage === '' ? 'active' : '';
        const isCompressActive = activePage === 'compress-image.html' ? 'active' : '';
        const isResizeActive = activePage === 'resize-image.html' ? 'active' : '';
        const isCropActive = activePage === 'crop-image.html' ? 'active' : '';
        const isJpgPngActive = activePage === 'jpg-to-png.html' ? 'active' : '';

        // Generate dropdown categories
        let dropdownHtml = '';
        
        // Category headers and mappings
        const categories = {
            'converters': 'Converters',
            'enhancers': 'Enhancers',
            'pdf': 'PDF Tools',
            'utilities': 'Utilities'
        };

        for (const [key, label] of Object.entries(categories)) {
            dropdownHtml += `
                <div class="dropdown-category">
                    <h4>${label}</h4>
            `;
            toolsData[key].forEach(tool => {
                const activeClass = activePage === tool.url ? 'style="color: var(--primary-main);"' : '';
                dropdownHtml += `<a href="${tool.url}" ${activeClass}><i class="${tool.icon}"></i> ${tool.name}</a>`;
            });
            dropdownHtml += `</div>`;
        }

        header.innerHTML = `
            <div class="nav-container">
                <a href="index.html" class="logo">
                    <i class="fas fa-crop-alt"></i>
                    <span>PicShift</span>
                </a>
                <ul class="nav-links-container">
                    <li class="nav-link-item"><a href="index.html" class="${isHomeActive}">Home</a></li>
                    <li class="nav-link-item"><a href="compress-image.html" class="${isCompressActive}">Compress</a></li>
                    <li class="nav-link-item"><a href="resize-image.html" class="${isResizeActive}">Resize</a></li>
                    <li class="nav-link-item"><a href="crop-image.html" class="${isCropActive}">Crop</a></li>
                    <li class="nav-link-item"><a href="jpg-to-png.html" class="${isJpgPngActive}">JPG to PNG</a></li>
                    <li class="nav-link-item dropdown">
                        <a href="#">More Tools <i class="fas fa-chevron-down chevron"></i></a>
                        <div class="dropdown-menu">
                            <div class="dropdown-grid">
                                ${dropdownHtml}
                            </div>
                        </div>
                    </li>
                    <li>
                        <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle Theme">
                            <i class="fas ${document.documentElement.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'}"></i>
                        </button>
                    </li>
                </ul>
            </div>
        `;
        
        document.body.insertBefore(header, document.body.firstChild);
    }

    // --- RENDER MOBILE APP SHELL ---
    function renderMobileAppShell(pageTitle) {
        // 1. Mobile top bar
        const mobileTop = document.createElement('div');
        mobileTop.className = 'nav-mobile-top';
        mobileTop.innerHTML = `
            <a href="index.html" class="logo">
                <i class="fas fa-crop-alt"></i>
                <span style="font-size: 1.15rem;">PicShift</span>
            </a>
            <span class="mobile-page-title">${pageTitle.length > 20 ? pageTitle.substring(0, 18) + '...' : pageTitle}</span>
            <button class="theme-toggle-btn" id="themeToggleBtnMobile" style="margin-left: 0; width: 34px; height: 34px;">
                <i class="fas ${document.documentElement.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
        `;

        // 2. Bottom nav bar
        const bottomNav = document.createElement('div');
        bottomNav.className = 'bottom-nav';
        
        const isHome = activePage === 'index.html' || activePage === '' ? 'active' : '';
        const isCompress = activePage === 'compress-image.html' ? 'active' : '';
        const isResize = activePage === 'resize-image.html' ? 'active' : '';
        const isCrop = activePage === 'crop-image.html' ? 'active' : '';

        bottomNav.innerHTML = `
            <button class="bottom-nav-item ${isHome}" onclick="location.href='index.html'">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </button>
            <button class="bottom-nav-item ${isCompress}" onclick="location.href='compress-image.html'">
                <i class="fas fa-compress-alt"></i>
                <span>Compress</span>
            </button>
            <button class="bottom-nav-item ${isResize}" onclick="location.href='resize-image.html'">
                <i class="fas fa-expand-alt"></i>
                <span>Resize</span>
            </button>
            <button class="bottom-nav-item ${isCrop}" onclick="location.href='crop-image.html'">
                <i class="fas fa-crop"></i>
                <span>Crop</span>
            </button>
            <button class="bottom-nav-item" id="mobileMoreBtn">
                <i class="fas fa-th-large"></i>
                <span>More</span>
            </button>
        `;

        // 3. Bottom Sheet Modal
        const bottomSheetOverlay = document.createElement('div');
        bottomSheetOverlay.className = 'bottom-sheet-overlay';
        bottomSheetOverlay.id = 'bottomSheetOverlay';

        let bottomSheetHtml = '';
        const categories = {
            'converters': 'Converters',
            'enhancers': 'Enhancers',
            'pdf': 'PDF Tools',
            'utilities': 'Utilities'
        };

        for (const [key, label] of Object.entries(categories)) {
            bottomSheetHtml += `
                <div class="bottom-sheet-category" data-category="${key}">
                    <div class="bottom-sheet-category-title">${label}</div>
                    <div class="bottom-sheet-links">
            `;
            toolsData[key].forEach(tool => {
                bottomSheetHtml += `
                    <a href="${tool.url}" class="bottom-sheet-link-item" data-name="${tool.name.toLowerCase()}">
                        <i class="${tool.icon}"></i>
                        <span>${tool.name}</span>
                    </a>
                `;
            });
            bottomSheetHtml += `
                    </div>
                </div>
            `;
        }

        const bottomSheet = document.createElement('div');
        bottomSheet.className = 'bottom-sheet';
        bottomSheet.id = 'bottomSheet';
        bottomSheet.innerHTML = `
            <div class="bottom-sheet-header">
                <div class="bottom-sheet-drag-handle"></div>
                <div class="bottom-sheet-title-row">
                    <span class="bottom-sheet-title">All Tools</span>
                    <button class="bottom-sheet-close-btn" id="bottomSheetCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="bottom-sheet-search">
                    <div class="bottom-sheet-search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="bottomSheetSearchInput" placeholder="Search converters, enhancers, PDF..." autocomplete="off">
                    </div>
                </div>
            </div>
            <div class="bottom-sheet-content">
                <div class="bottom-sheet-grid" id="bottomSheetGrid">
                    ${bottomSheetHtml}
                </div>
            </div>
        `;

        // Inject them
        const firstNav = document.querySelector('.nav-desktop');
        if (firstNav) {
            document.body.insertBefore(mobileTop, firstNav.nextSibling);
        } else {
            document.body.insertBefore(mobileTop, document.body.firstChild);
        }
        
        document.body.appendChild(bottomNav);
        document.body.appendChild(bottomSheetOverlay);
        document.body.appendChild(bottomSheet);
    }

    // --- RENDER FOOTER ---
    function renderFooter() {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = `
            <div class="footer-container">
                <ul class="footer-links">
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="contact.html">Contact</a></li>
                    <li><a href="privacy-policy.html">Privacy Policy</a></li>
                    <li><a href="terms.html">Terms of Service</a></li>
                </ul>
                <div class="footer-bottom">
                    <p>&copy; 2026 PicShift | A product of VaultKit Technologies. All processing done locally in your browser.</p>
                    <p style="margin-top: 0.4rem; font-size: 0.72rem; color: var(--text-tertiary);">100% Free • No Registration • No Upload • Private & Secure</p>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    }

    // --- THEME TOGGLE ---
    function initThemeToggle() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        const toggleBtnMobile = document.getElementById('themeToggleBtnMobile');

        const toggleAction = () => {
            const isDark = document.body.classList.toggle('dark-mode');
            document.documentElement.classList.toggle('dark-mode', isDark);
            localStorage.setItem('picshift-theme', isDark ? 'dark' : 'light');
            
            // Update icons
            const iconClass = isDark ? 'fa-sun' : 'fa-moon';
            if (toggleBtn) toggleBtn.querySelector('i').className = `fas ${iconClass}`;
            if (toggleBtnMobile) toggleBtnMobile.querySelector('i').className = `fas ${iconClass}`;
        };

        if (toggleBtn) toggleBtn.addEventListener('click', toggleAction);
        if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleAction);
    }

    // --- MOBILE BOTTOM SHEET DRAWER ---
    function initBottomSheet() {
        const moreBtn = document.getElementById('mobileMoreBtn');
        const overlay = document.getElementById('bottomSheetOverlay');
        const sheet = document.getElementById('bottomSheet');
        const closeBtn = document.getElementById('bottomSheetCloseBtn');
        const searchInput = document.getElementById('bottomSheetSearchInput');

        if (!moreBtn || !overlay || !sheet || !closeBtn) return;

        const openSheet = () => {
            overlay.classList.add('active');
            sheet.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent background scroll
            setTimeout(() => searchInput.focus(), 150);
        };

        const closeSheet = () => {
            overlay.classList.remove('active');
            sheet.classList.remove('active');
            document.body.style.overflow = '';
            searchInput.value = '';
            filterBottomSheetTools('');
        };

        moreBtn.addEventListener('click', openSheet);
        overlay.addEventListener('click', closeSheet);
        closeBtn.addEventListener('click', closeSheet);

        // Close on swipe/drag down gesture (simple emulation)
        let touchStartY = 0;
        sheet.querySelector('.bottom-sheet-drag-handle').addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        sheet.querySelector('.bottom-sheet-drag-handle').addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            if (currentY - touchStartY > 50) {
                closeSheet();
            }
        });

        // Search filtering logic in Bottom Sheet
        searchInput.addEventListener('input', (e) => {
            filterBottomSheetTools(e.target.value.toLowerCase().trim());
        });

        function filterBottomSheetTools(term) {
            const items = sheet.querySelectorAll('.bottom-sheet-link-item');
            const categories = sheet.querySelectorAll('.bottom-sheet-category');
            
            let visibleCount = 0;

            items.forEach(item => {
                const name = item.getAttribute('data-name');
                if (name.includes(term) || term === '') {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Hide categories with no visible tools
            categories.forEach(cat => {
                const catItems = cat.querySelectorAll('.bottom-sheet-link-item');
                let hasVisible = false;
                catItems.forEach(item => {
                    if (item.style.display !== 'none') hasVisible = true;
                });
                cat.style.display = hasVisible ? 'block' : 'none';
            });

            // No results handling inside bottom sheet
            let noResMsg = sheet.querySelector('.bottom-sheet-no-results');
            if (visibleCount === 0 && term !== '') {
                if (!noResMsg) {
                    noResMsg = document.createElement('div');
                    noResMsg.className = 'bottom-sheet-no-results';
                    noResMsg.style.textAlign = 'center';
                    noResMsg.style.padding = '2rem 1rem';
                    noResMsg.style.color = 'var(--text-tertiary)';
                    noResMsg.innerHTML = `<i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i> No tools matched "${term}"`;
                    sheet.querySelector('.bottom-sheet-content').appendChild(noResMsg);
                }
                noResMsg.style.display = 'block';
            } else if (noResMsg) {
                noResMsg.style.display = 'none';
            }
        }
    }
})();
