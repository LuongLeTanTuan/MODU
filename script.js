/* ===================================================================
   MODU WATER BOTTLE - INTERACTION ENGINE
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const heroVisual = document.getElementById('heroVisual');
  const heroHandImg = document.getElementById('heroHandImg');
  const heroStudioImg = document.getElementById('heroStudioImg');
  const rippleStage = document.getElementById('rippleStage');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavPanel = document.getElementById('mobileNavPanel');

  const modeLifestyleBtn = document.getElementById('modeLifestyleBtn');
  const modeStudioBtn = document.getElementById('modeStudioBtn');

  const colorDots = document.querySelectorAll('.color-dot');
  const bottleItems = document.querySelectorAll('.bottle-item');

  // Customizer Modal Elements (Studio Customizer 2.0)
  const openCustomizerBtn = document.getElementById('openCustomizerBtn');
  const navCustomizeLink = document.getElementById('navCustomizeLink');
  const customizerModal = document.getElementById('customizerModal');
  const closeCustomizerBtn = document.getElementById('closeCustomizerBtn');
  const customizerPreviewCol = document.getElementById('customizerPreviewCol');
  const modalBottleDisplay = document.getElementById('modalBottleDisplay');
  const modalBottleImg = document.getElementById('modalBottleImg');
  const modalEngravePreview = document.getElementById('modalEngravePreview');
  const engraveTextContent = document.getElementById('engraveTextContent');
  const engraveIconPrefix = document.getElementById('engraveIconPrefix');
  const engraveIconSuffix = document.getElementById('engraveIconSuffix');
  const engraveInput = document.getElementById('engraveInput');
  const engraveCharCounter = document.getElementById('engraveCharCounter');
  const previewSilhouetteBadge = document.getElementById('previewSilhouetteBadge');
  const previewColorBadge = document.getElementById('previewColorBadge');
  const previewColorDot = document.getElementById('previewColorDot');
  const previewColorText = document.getElementById('previewColorText');
  const selectedColorName = document.getElementById('selectedColorName');
  const configPrice = document.getElementById('configPrice');
  const modalSummarySpec = document.getElementById('modalSummarySpec');
  const modalSummaryTotal = document.getElementById('modalSummaryTotal');
  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
  const modalCharmsSelector = document.getElementById('modalCharmsSelector');
  const modalSelectedCharmName = document.getElementById('modalSelectedCharmName');
  const linkCustomizerToBlindbox = document.getElementById('linkCustomizerToBlindbox');
  const modalBottleCharmAnchor = document.getElementById('modalBottleCharmAnchor');
  const modalAttachedCharmPendant = document.getElementById('modalAttachedCharmPendant');

  const silhouetteTabs = document.querySelectorAll('.silhouette-tab-btn');
  const modalSwatches2 = document.querySelectorAll('.modal-swatch-2');
  const fontChoiceCards = document.querySelectorAll('.font-choice-card');
  const iconChoiceBtns = document.querySelectorAll('.icon-choice-btn');
  const posChoiceCards = document.querySelectorAll('.pos-choice-card');
  const presetChips = document.querySelectorAll('.preset-chip');
  const iconPosToggleBtns = document.querySelectorAll('.btn-pos-toggle');

  // Cart Drawer Elements
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartDrawerCount = document.getElementById('cartDrawerCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');
  const toastNotice = document.getElementById('toastNotice');
  const toastText = document.getElementById('toastText');

  const bottleCols = document.querySelectorAll('.bottle-col');

  // Bottle Assets Map (5 signature colors)
  const bottleData = {
    mint: {
      name: 'Xanh Sage',
      img: 'assets/bottle-mint.png',
      img500: 'assets/bottle-mint-500.png',
      color: 'var(--color-mint)'
    },
    white: {
      name: 'Trắng Mây',
      img: 'assets/bottle-white.png',
      img500: 'assets/bottle-white-500.png',
      color: 'var(--color-white)'
    },
    pink: {
      name: 'Hồng Blush',
      img: 'assets/bottle-pink.png',
      img500: 'assets/bottle-pink-500.png',
      color: 'var(--color-pink)'
    },
    blue: {
      name: 'Xanh Sky',
      img: 'assets/bottle-blue.png',
      img500: 'assets/bottle-blue-500.png',
      color: '#82b9d2'
    },
    black: {
      name: 'Đen Obsidian',
      img: 'assets/bottle-black.png',
      img500: 'assets/bottle-black-500.png',
      color: 'var(--color-black)'
    }
  };

  // Laser Typography Styles
  const laserFontsData = {
    outfit: {
      id: 'outfit',
      name: 'Outfit Bold (Hiện đại)',
      cssClass: 'font-outfit'
    },
    dancing: {
      id: 'dancing',
      name: 'Chữ ký thanh lịch (Script)',
      cssClass: 'font-dancing'
    },
    bebas: {
      id: 'bebas',
      name: 'Thể thao năng động (Bebas)',
      cssClass: 'font-bebas'
    }
  };

  // Laser Glyphs & Symbols
  const laserIconsData = {
    none: { id: 'none', symbol: '', name: 'Không dùng icon' },
    heart: { id: 'heart', symbol: '♥', name: 'Trái tim' },
    star: { id: 'star', symbol: '★', name: 'Ngôi sao' },
    crown: { id: 'crown', symbol: '✦', name: 'Họa tiết sao' },
    leaf: { id: 'leaf', symbol: '●', name: 'Chấm tròn tối giản' }
  };

  // Studio Customizer 2.0 State
  let currentSilhouette = '750ml'; // '500ml' | '750ml'
  let currentPrice = 429000;       // 349000 for 500ml | 429000 for 750ml
  let currentColor = 'mint';
  let currentLaserFont = 'outfit'; // 'outfit' | 'dancing' | 'bebas'
  let currentLaserIcon = 'heart';  // 'none' | 'heart' | 'star' | 'crown' | 'leaf'
  let currentLaserIconPos = 'suffix'; // 'suffix' | 'prefix'
  let currentLaserPos = 'vertical';   // 'vertical' | 'horizontal'
  let currentEngraveText = 'ALEX';

  let cart = [
    {
      id: 'modu-default-01',
      name: 'Bình Giữ Nhiệt MODU Studio',
      silhouette: '750ml',
      silhouetteLabel: '750ml Có Quai Xách',
      color: 'Xanh Sage',
      colorKey: 'mint',
      price: 429000,
      img: 'assets/bottle-mint.png',
      engravingText: 'ALEX',
      engravingDisplay: 'ALEX ♥',
      fontName: 'Outfit Bold (Hiện đại)',
      fontId: 'outfit',
      iconName: 'Trái tim',
      iconSymbol: '♥',
      iconPosition: 'suffix',
      engravePosition: 'vertical',
      engravePositionLabel: 'Khắc dọc thân bình',
      charm: 'Charm Gấu Bơ Pastel',
      charmImg: 'charm/charm-bear.png',
      isCustomized: true
    }
  ];

  function formatPrice(value) {
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  }

  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavPanel.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNavPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -----------------------------------------------------------------
  // 1. Color Selection Logic
  // -----------------------------------------------------------------
  function selectColor(colorKey, switchMode = false) {
    if (!bottleData[colorKey]) return;
    currentColor = colorKey;

    // Update Explorer Card Columns
    bottleCols.forEach(b => {
      b.classList.toggle('active', b.dataset.color === colorKey);
    });

    // Update modal swatches if open
    modalSwatches2.forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.color === colorKey);
    });

    // Update images
    if (heroStudioImg) {
      heroStudioImg.src = bottleData[colorKey].img;
    }
    if (selectedColorName) {
      selectedColorName.textContent = bottleData[colorKey].name;
    }

    // Update Studio Preview Live
    updateStudioPreview();

    // If a user clicks a color other than mint, switch to Studio view so they can preview it!
    if (colorKey !== 'mint' || switchMode) {
      setHeroMode('studio');
    }

    showToast(`Đã chọn màu: ${bottleData[colorKey].name}`);
  }

  // Bind 5-Bottle Explorer Columns
  bottleCols.forEach(col => {
    col.addEventListener('click', () => {
      selectColor(col.dataset.color, true);
    });
  });

  // -----------------------------------------------------------------
  // 2. View Mode (Lifestyle Hand vs Studio 360)
  // -----------------------------------------------------------------
  function setHeroMode(mode) {
    if (mode === 'studio') {
      heroVisual.classList.add('mode-studio');
      if (modeStudioBtn) modeStudioBtn.classList.add('active');
      if (modeLifestyleBtn) modeLifestyleBtn.classList.remove('active');
    } else {
      heroVisual.classList.remove('mode-studio');
      if (modeLifestyleBtn) modeLifestyleBtn.classList.add('active');
      if (modeStudioBtn) modeStudioBtn.classList.remove('active');
    }
  }

  if (modeLifestyleBtn) modeLifestyleBtn.addEventListener('click', () => setHeroMode('lifestyle'));
  if (modeStudioBtn) modeStudioBtn.addEventListener('click', () => setHeroMode('studio'));

  // -----------------------------------------------------------------
  // 3. Subtle 3D Mouse Parallax on Hero Section
  // -----------------------------------------------------------------
  const heroSection = document.getElementById('heroSection');
  if (heroSection && window.innerWidth > 992) {
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    });

    function isDebugOpen() {
      const card = document.getElementById('debugCard');
      return card && card.classList.contains('open');
    }

    function animateParallax() {
      // Pause parallax while calibrating so user can tune position with absolute precision
      if (isDebugOpen()) {
        if (heroVisual) {
          heroVisual.style.transform = 'none';
        }
        requestAnimationFrame(animateParallax);
        return;
      }

      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (heroVisual) {
        heroVisual.style.transform = `translate3d(${currentX * -25}px, ${currentY * -15}px, 0) rotateY(${currentX * -4}deg)`;
      }
      if (rippleStage) {
        rippleStage.style.transform = `translate(calc(-50% + ${currentX * 35}px), calc(-50% + ${currentY * 20}px))`;
      }
      requestAnimationFrame(animateParallax);
    }
    animateParallax();
  }

  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // 8 REAL 3D MODU COLLECTIBLE CHARMS (Assets from folder charm/)
  // -----------------------------------------------------------------
  const charmsData = [
    {
      id: 'bear',
      name: 'Charm Gấu Bơ Pastel',
      shortName: 'Gấu Bơ',
      image: 'charm/charm-bear.png',
      rarity: 'rare',
      rarityLabel: 'Hiếm',
      vibe: 'Cute & Ấm Áp',
      desc: 'Gấu bơ màu pastel ngọt ngào, mang lại cảm giác bình yên và dễ thương trên từng ngụm nước hằng ngày.',
      weight: 15,
      dropRate: '15%'
    },
    {
      id: 'bow',
      name: 'Charm Nơ Coquette',
      shortName: 'Nơ Hồng',
      image: 'charm/charm-bow.png',
      rarity: 'common',
      rarityLabel: 'Phổ thông',
      vibe: 'Soft Girl & Nữ Tính',
      desc: 'Chiếc nơ ruy băng hồng pastel đính ngọc trai kiêu kỳ, điểm nhấn cực xinh cho outfit chuẩn aesthetic.',
      weight: 22,
      dropRate: '22%'
    },
    {
      id: 'clover',
      name: 'Charm Cỏ 4 Lá May Mắn',
      shortName: 'Cỏ 4 Lá',
      image: 'charm/charm-clover.png',
      rarity: 'rare',
      rarityLabel: 'Hiếm',
      vibe: 'Lucky & Hy Vọng',
      desc: 'Biểu tượng may mắn xanh emerald mint viền vàng, tiếp thêm năng lượng tích cực cho thi cử và mọi mục tiêu.',
      weight: 12,
      dropRate: '12%'
    },
    {
      id: 'coffee',
      name: 'Charm Cà Phê Chill',
      shortName: 'Cà Phê',
      image: 'charm/charm-coffee.png',
      rarity: 'common',
      rarityLabel: 'Phổ thông',
      vibe: 'Gen Z & Deadline Chill',
      desc: 'Ly cà phê kem béo nhỏ xinh nắp đậy ấm áp, tiếp thêm năng lượng tỉnh táo vượt mọi deadline.',
      weight: 20,
      dropRate: '20%'
    },
    {
      id: 'heart',
      name: 'Charm Trái Tim Y2K',
      shortName: 'Trái Tim',
      image: 'charm/charm-heart.png',
      rarity: 'rare',
      rarityLabel: 'Hiếm',
      vibe: 'Cyberpunk & Nổi Bật',
      desc: 'Trái tim giác cắt kim cương lấp lánh ánh hồng, phong cách retro thập niên 2000 cực chất và nổi bật.',
      weight: 8,
      dropRate: '8%'
    },
    {
      id: 'daisy',
      name: 'Charm Hoa Mặt Trời Daisy',
      shortName: 'Hoa Cúc',
      image: 'charm/charm-sunflower.png',
      rarity: 'common',
      rarityLabel: 'Phổ thông',
      vibe: 'Tươi Mới & Nắng Mai',
      desc: 'Bông hoa mặt trời vàng óng ngập tràn sức sống, lan tỏa tinh thần vui vẻ rạng rỡ mỗi ngày.',
      weight: 20,
      dropRate: '20%'
    },
    {
      id: 'cat',
      name: 'Charm Mèo Thần Tài May Mắn',
      shortName: 'Mèo Thần Tài',
      image: 'charm/charm-cat.png',
      rarity: 'rare',
      rarityLabel: 'Hiếm',
      vibe: 'Tài Lộc & Chữa Lành',
      desc: 'Chú mèo chiêu tài má phính vẫy tay may mắn, hộ mệnh ngọt ngào cho học tập, thi cử và công việc.',
      weight: 8,
      dropRate: '8%'
    },
    {
      id: 'diamond',
      name: 'Charm Kim Cương Lấp Lánh Secret',
      shortName: 'Kim Cương',
      image: 'charm/charm-diamond.png',
      rarity: 'secret',
      rarityLabel: 'Secret',
      vibe: 'Độc Bản & Tỏa Sáng',
      desc: 'VẬT PHẨM BÍ MẬT CỰC HIẾM VỚI TỈ LỆ CHỈ 5%! Giác cắt kim cương holographic đa sắc, tỏa hào quang rực rỡ.',
      weight: 5,
      dropRate: '5%'
    }
  ];

  // ===================================================================
  // 4. STUDIO CUSTOMIZER 2.0 INTERACTIVE ENGINE
  // ===================================================================

  // Customizer Selected Charm State
  let selectedCustomizerCharm = {
    id: 'mystery',
    name: 'Túi Mù Bí Mật (Ngẫu nhiên)',
    shortName: 'Túi Mù',
    rarityLabel: 'Bất ngờ',
    isMystery: true
  };

  function renderCustomizerCharmsSelector() {
    if (!modalCharmsSelector) return;
    modalCharmsSelector.innerHTML = '';

    // Pod 0: Minimalist Mystery Pouch option (Default)
    const mysteryPod = document.createElement('button');
    mysteryPod.type = 'button';
    mysteryPod.className = `modal-charm-pod ${selectedCustomizerCharm.id === 'mystery' ? 'active' : ''}`;
    mysteryPod.dataset.id = 'mystery';
    mysteryPod.setAttribute('aria-label', 'Tùy chọn túi mù bí mật ngẫu nhiên');
    mysteryPod.innerHTML = `
      <div class="charm-pod-preview">
        <svg class="charm-pod-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="10" width="22" height="24" rx="5" fill="#0f172a"/>
          <path d="M9 16h22" stroke="#d4fc39" stroke-width="1.8" stroke-dasharray="2 2"/>
          <circle cx="20" cy="24" r="5" fill="#1e293b" stroke="#334155" stroke-width="1"/>
          <text x="20" y="27" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" fill="#d4fc39" text-anchor="middle">?</text>
        </svg>
      </div>
      <span class="charm-pod-label">Túi Mù</span>
    `;
    mysteryPod.addEventListener('click', () => {
      selectCustomizerCharm({
        id: 'mystery',
        name: 'Túi Mù Bí Mật (Ngẫu nhiên)',
        shortName: 'Túi Mù',
        rarityLabel: 'Bất ngờ',
        isMystery: true
      });
    });
    modalCharmsSelector.appendChild(mysteryPod);

    // Pods 1-8: The 8 real 3D charms
    charmsData.forEach(charm => {
      const pod = document.createElement('button');
      pod.type = 'button';
      pod.className = `modal-charm-pod ${selectedCustomizerCharm.id === charm.id ? 'active' : ''}`;
      pod.dataset.id = charm.id;
      pod.setAttribute('aria-label', `Chọn ${charm.name}`);
      pod.innerHTML = `
        <div class="charm-pod-preview">
          <img src="${charm.image}" alt="${charm.shortName}" class="charm-pod-img" loading="lazy">
        </div>
        <span class="charm-pod-label">${charm.shortName}</span>
      `;
      pod.addEventListener('click', () => {
        selectCustomizerCharm(charm);
      });
      modalCharmsSelector.appendChild(pod);
    });

    // Pod 9: Option to have no charm attached
    const nonePod = document.createElement('button');
    nonePod.type = 'button';
    nonePod.className = `modal-charm-pod ${selectedCustomizerCharm.id === 'none' ? 'active' : ''}`;
    nonePod.dataset.id = 'none';
    nonePod.setAttribute('aria-label', 'Không đính kèm charm');
    nonePod.innerHTML = `
      <div class="charm-pod-preview">
        <span style="font-size: 1.4rem; color: #94a3b8;">∅</span>
      </div>
      <span class="charm-pod-label">Không charm</span>
    `;
    nonePod.addEventListener('click', () => {
      selectCustomizerCharm({
        id: 'none',
        name: 'Không đính kèm charm',
        shortName: 'Không',
        isNone: true
      });
    });
    modalCharmsSelector.appendChild(nonePod);
  }

  function selectCustomizerCharm(charm) {
    selectedCustomizerCharm = charm;

    if (modalCharmsSelector) {
      modalCharmsSelector.querySelectorAll('.modal-charm-pod').forEach(pod => {
        pod.classList.toggle('active', pod.dataset.id === charm.id);
      });
    }

    if (modalSelectedCharmName) {
      modalSelectedCharmName.textContent = charm.name;
    }

    updateStudioPreview();
  }

  function getFullLaserDisplayString() {
    const symbol = laserIconsData[currentLaserIcon] ? laserIconsData[currentLaserIcon].symbol : '';
    const cleanText = currentEngraveText.trim();
    const text = cleanText ? cleanText.toUpperCase() : 'ALEX';
    if (currentLaserIcon !== 'none' && symbol) {
      return currentLaserIconPos === 'prefix' ? `${symbol} ${text}` : `${text} ${symbol}`;
    }
    return text;
  }

  // -----------------------------------------------------------------
  // Real-Time Reactive Studio Preview Engine (60fps No Latency)
  // -----------------------------------------------------------------
  function updateStudioPreview() {
    const is500 = currentSilhouette === '500ml';
    const activeColorData = bottleData[currentColor] || bottleData.mint;
    const imgPath = is500 ? activeColorData.img500 : activeColorData.img;

    // 1. Update Bottle Silhouette & Color Image
    if (modalBottleImg) {
      modalBottleImg.src = imgPath;
    }

    if (modalBottleDisplay) {
      modalBottleDisplay.classList.toggle('is-500ml', is500);
    }

    // 2. Update Header Preview Badges
    if (previewSilhouetteBadge) {
      previewSilhouetteBadge.textContent = is500 ? '500ml Thon Gọn' : '750ml Có Quai Xách';
    }
    if (previewColorText) {
      previewColorText.textContent = activeColorData.name;
    }
    if (previewColorDot) {
      previewColorDot.style.backgroundColor = activeColorData.color;
    }
    if (selectedColorName) {
      selectedColorName.textContent = activeColorData.name;
    }

    // 3. Update Laser Engraving Overlay (Shader, Font, Icon, Position)
    const tone = currentColor === 'black' ? 'dark' : 'light';
    const fontObj = laserFontsData[currentLaserFont] || laserFontsData.outfit;
    const iconObj = laserIconsData[currentLaserIcon] || laserIconsData.heart;

    if (modalEngravePreview) {
      modalEngravePreview.setAttribute('data-color-tone', tone);
      modalEngravePreview.className = `engraving-live-preview pos-${currentLaserPos} ${fontObj.cssClass}`;

      const cleanText = currentEngraveText.trim();
      const displayText = cleanText ? cleanText.toUpperCase() : 'TÊN BẠN';

      if (engraveTextContent) {
        engraveTextContent.textContent = displayText;
      }

      if (engraveIconPrefix && engraveIconSuffix) {
        if (currentLaserIcon !== 'none' && iconObj.symbol) {
          if (currentLaserIconPos === 'prefix') {
            engraveIconPrefix.textContent = iconObj.symbol + ' ';
            engraveIconPrefix.style.display = 'inline';
            engraveIconSuffix.style.display = 'none';
          } else {
            engraveIconSuffix.textContent = ' ' + iconObj.symbol;
            engraveIconSuffix.style.display = 'inline';
            engraveIconPrefix.style.display = 'none';
          }
        } else {
          engraveIconPrefix.style.display = 'none';
          engraveIconSuffix.style.display = 'none';
        }
      }

      // Micro-animation shimmer
      modalEngravePreview.classList.remove('pulse-gleam');
      void modalEngravePreview.offsetWidth;
      modalEngravePreview.classList.add('pulse-gleam');
    }

    // 4. Update Attachable Charm Position
    if (modalBottleCharmAnchor) {
      modalBottleCharmAnchor.className = `bottle-charm-anchor modal-charm-anchor anchor-${is500 ? '500' : '750'}`;

      if (selectedCustomizerCharm && !selectedCustomizerCharm.isNone) {
        modalBottleCharmAnchor.style.display = 'flex';
        if (modalAttachedCharmPendant) {
          if (selectedCustomizerCharm.isMystery) {
            modalAttachedCharmPendant.innerHTML = `
              <svg class="charm-pod-svg" viewBox="0 0 40 40" fill="none" style="width: 32px; height: 32px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">
                <rect x="9" y="10" width="22" height="24" rx="5" fill="#0f172a"/>
                <path d="M9 16h22" stroke="#d4fc39" stroke-width="1.8" stroke-dasharray="2 2"/>
                <circle cx="20" cy="24" r="5" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                <text x="20" y="27" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" fill="#d4fc39" text-anchor="middle">?</text>
              </svg>
            `;
          } else {
            modalAttachedCharmPendant.innerHTML = `<img src="${selectedCustomizerCharm.image}" alt="${selectedCustomizerCharm.name}" class="pendant-real-img">`;
          }
        }
      } else {
        modalBottleCharmAnchor.style.display = 'none';
      }
    }

    // 5. Update Summary Bar & Live Price
    const fullLaser = getFullLaserDisplayString();
    if (modalSummarySpec) {
      const charmLabel = selectedCustomizerCharm ? (selectedCustomizerCharm.shortName || selectedCustomizerCharm.name) : 'Túi Mù';
      modalSummarySpec.textContent = `${is500 ? '500ml Thon Gọn' : '750ml Có Quai'} • ${activeColorData.name} • "${fullLaser}" • ${charmLabel}`;
    }
    if (modalSummaryTotal) {
      modalSummaryTotal.textContent = formatPrice(currentPrice);
    }
    if (configPrice) {
      configPrice.textContent = formatPrice(currentPrice);
    }
  }

  // -----------------------------------------------------------------
  // Customizer Modal Window Controls
  // -----------------------------------------------------------------
  function openCustomizer() {
    customizerModal.classList.add('open');
    customizerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateStudioPreview();
  }

  function closeCustomizer() {
    customizerModal.classList.remove('open');
    customizerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openCustomizerBtn) openCustomizerBtn.addEventListener('click', openCustomizer);
  if (navCustomizeLink) {
    navCustomizeLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCustomizer();
    });
  }
  if (closeCustomizerBtn) closeCustomizerBtn.addEventListener('click', closeCustomizer);

  customizerModal.addEventListener('click', (e) => {
    if (e.target === customizerModal) closeCustomizer();
  });

  if (linkCustomizerToBlindbox) {
    linkCustomizerToBlindbox.addEventListener('click', (e) => {
      e.preventDefault();
      closeCustomizer();
      const blindboxSec = document.getElementById('blindbox');
      if (blindboxSec) {
        blindboxSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // -----------------------------------------------------------------
  // BƯỚC 1: Chọn Form Dáng Bình (500ml Thon vs 750ml Quai)
  // -----------------------------------------------------------------
  silhouetteTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      silhouetteTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentSilhouette = tab.dataset.silhouette; // '500ml' or '750ml'
      currentPrice = parseInt(tab.dataset.price, 10); // 349000 or 429000

      updateStudioPreview();
      showToast(`Đã chọn: ${currentSilhouette === '500ml' ? '500ml Thon Gọn (349.000₫)' : '750ml Có Quai Xách (429.000₫)'}`);
    });
  });

  // -----------------------------------------------------------------
  // BƯỚC 2: Chọn Màu Sắc Pastel/Matte
  // -----------------------------------------------------------------
  modalSwatches2.forEach(swatch => {
    swatch.addEventListener('click', () => {
      selectColor(swatch.dataset.color);
    });
  });

  // -----------------------------------------------------------------
  // BƯỚC 3: Công cụ Khắc Tên Laser Chân Thực (Laser Studio)
  // -----------------------------------------------------------------
  // Live Input Text + Max 15 Char Counter
  if (engraveInput) {
    engraveInput.addEventListener('input', (e) => {
      const val = e.target.value.slice(0, 15);
      e.target.value = val;
      currentEngraveText = val;

      if (engraveCharCounter) {
        engraveCharCounter.textContent = `${val.length}/15`;
        if (val.length >= 15) {
          engraveCharCounter.style.color = '#ef4444';
        } else {
          engraveCharCounter.style.color = '#94a3b8';
        }
      }

      updateStudioPreview();
    });
  }

  // Preset Chips (ALEX, MODU, GO GREEN, STAY CHILL, HYDRATE)
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const preset = chip.dataset.text;
      if (engraveInput) {
        engraveInput.value = preset;
        currentEngraveText = preset;
        if (engraveCharCounter) {
          engraveCharCounter.textContent = `${preset.length}/15`;
        }
      }
      updateStudioPreview();
      showToast(`Đã áp dụng gợi ý: "${preset}"`);
    });
  });

  // Font Selection (Outfit Bold, Dancing Script, Bebas Neue)
  fontChoiceCards.forEach(card => {
    card.addEventListener('click', () => {
      fontChoiceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      currentLaserFont = card.dataset.font;
      updateStudioPreview();
      showToast(`Font laser: ${laserFontsData[currentLaserFont].name}`);
    });
  });

  // Icon Selection (None, Heart, Star, Crown, Leaf)
  iconChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconChoiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentLaserIcon = btn.dataset.icon;
      updateStudioPreview();
      showToast(`Biểu tượng laser: ${laserIconsData[currentLaserIcon].name}`);
    });
  });

  // Icon Position Toggle (Suffix vs Prefix)
  iconPosToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconPosToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentLaserIconPos = btn.dataset.iconPos; // 'suffix' or 'prefix'
      updateStudioPreview();
    });
  });

  // Engraving Position (Vertical Torso vs Horizontal Base)
  posChoiceCards.forEach(card => {
    card.addEventListener('click', () => {
      posChoiceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      currentLaserPos = card.dataset.pos; // 'vertical' or 'horizontal'
      updateStudioPreview();
      showToast(`Vị trí: ${currentLaserPos === 'vertical' ? 'Khắc dọc thân bình' : 'Khắc ngang đế bình'}`);
    });
  });

  // -----------------------------------------------------------------
  // ADD CUSTOMIZED BOTTLE TO SHOPPING BAG
  // -----------------------------------------------------------------
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      const is500 = currentSilhouette === '500ml';
      const laserDisplay = getFullLaserDisplayString();
      const activeColor = bottleData[currentColor] || bottleData.mint;
      const fontObj = laserFontsData[currentLaserFont] || laserFontsData.outfit;
      const iconObj = laserIconsData[currentLaserIcon] || laserIconsData.heart;

      // Pack complete customization object into Cart state
      const customItem = {
        id: `modu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: 'Bình Giữ Nhiệt MODU Studio',
        silhouette: currentSilhouette,
        silhouetteLabel: is500 ? '500ml Thon Gọn' : '750ml Có Quai Xách',
        color: activeColor.name,
        colorKey: currentColor,
        price: currentPrice,
        img: is500 ? activeColor.img500 : activeColor.img,
        engravingText: currentEngraveText.trim().toUpperCase() || 'ALEX',
        engravingDisplay: laserDisplay,
        fontName: fontObj.name,
        fontId: fontObj.id,
        iconName: iconObj.name,
        iconSymbol: iconObj.symbol,
        iconPosition: currentLaserIconPos,
        engravePosition: currentLaserPos,
        engravePositionLabel: currentLaserPos === 'vertical' ? 'Khắc dọc thân bình' : 'Khắc ngang đế bình',
        charm: selectedCustomizerCharm ? selectedCustomizerCharm.name : 'Túi Mù Bí Mật',
        charmImg: selectedCustomizerCharm && !selectedCustomizerCharm.isMystery && !selectedCustomizerCharm.isNone ? selectedCustomizerCharm.image : null,
        isCustomized: true
      };

      cart.push(customItem);
      updateCartUI();
      closeCustomizer();
      openCart();
      showToast(`Đã thêm MODU ${customItem.silhouetteLabel} (${customItem.color}) vào túi hàng`);
    });
  }

  // ===================================================================
  // SECTION PHÂN TẦNG KHÁCH HÀNG: CHOOSE YOUR VIBE LOGIC (A-R-T Model)
  // ===================================================================
  function applyVibePreset(presetKey) {
    if (presetKey === 'genz') {
      // 1. Silhouette: 500ml (349.000₫)
      currentSilhouette = '500ml';
      currentPrice = 349000;
      silhouetteTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.silhouette === '500ml');
      });

      // 2. Color: Pink (Hồng Blush)
      currentColor = 'pink';
      colorDots.forEach(d => d.classList.toggle('active', d.dataset.color === 'pink'));
      bottleItems.forEach(b => b.classList.toggle('active', b.dataset.color === 'pink'));
      modalSwatches2.forEach(s => s.classList.toggle('active', s.dataset.color === 'pink'));

      // 3. Laser: Dancing Script, Heart icon, 'MINH ANH'
      currentLaserFont = 'dancing';
      fontChoiceCards.forEach(c => c.classList.toggle('active', c.dataset.font === 'dancing'));

      currentLaserIcon = 'heart';
      iconChoiceBtns.forEach(b => b.classList.toggle('active', b.dataset.icon === 'heart'));

      currentLaserPos = 'vertical';
      posChoiceCards.forEach(c => c.classList.toggle('active', c.dataset.pos === 'vertical'));

      currentEngraveText = 'MINH ANH';
      if (engraveInput) {
        engraveInput.value = currentEngraveText;
      }
      if (engraveCharCounter) {
        engraveCharCounter.textContent = `${currentEngraveText.length}/15 ký tự`;
      }

      // 4. Charm: Nơ Coquette hoặc Gấu Bơ
      const targetCharm = charmsData.find(c => c.id === 'bow') || charmsData[0];
      if (targetCharm) {
        selectCustomizerCharm(targetCharm);
      }

      openCustomizer();
      updateStudioPreview();
      showToast('Đã nạp cấu hình Gen Z: 500ml Hồng Blush, chữ ký nghệ thuật, charm Nơ Coquette');
    } else if (presetKey === 'office') {
      // 1. Silhouette: 750ml (429.000₫)
      currentSilhouette = '750ml';
      currentPrice = 429000;
      silhouetteTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.silhouette === '750ml');
      });

      // 2. Color: Black (Đen Obsidian)
      currentColor = 'black';
      colorDots.forEach(d => d.classList.toggle('active', d.dataset.color === 'black'));
      bottleItems.forEach(b => b.classList.toggle('active', b.dataset.color === 'black'));
      modalSwatches2.forEach(s => s.classList.toggle('active', s.dataset.color === 'black'));

      // 3. Laser: Outfit Bold, Leaf icon (Go-Green), 'GO GREEN'
      currentLaserFont = 'outfit';
      fontChoiceCards.forEach(c => c.classList.toggle('active', c.dataset.font === 'outfit'));

      currentLaserIcon = 'leaf';
      iconChoiceBtns.forEach(b => b.classList.toggle('active', b.dataset.icon === 'leaf'));

      currentLaserPos = 'horizontal';
      posChoiceCards.forEach(c => c.classList.toggle('active', c.dataset.pos === 'horizontal'));

      currentEngraveText = 'GO GREEN';
      if (engraveInput) {
        engraveInput.value = currentEngraveText;
      }
      if (engraveCharCounter) {
        engraveCharCounter.textContent = `${currentEngraveText.length}/15 ký tự`;
      }

      // 4. Charm: Cà Phê Chill
      const targetCharm = charmsData.find(c => c.id === 'coffee') || charmsData[3];
      if (targetCharm) {
        selectCustomizerCharm(targetCharm);
      }

      openCustomizer();
      updateStudioPreview();
      showToast('Đã nạp cấu hình Minimal: 750ml Đen Obsidian, khắc laser đế bình, charm Cà Phê Chill');
    }
  }

  // Filter Tabs Event Listeners
  const vibeTabBtns = document.querySelectorAll('.vibe-tab-btn');
  const vibeCardGenz = document.getElementById('vibeCardGenz');
  const vibeCardOffice = document.getElementById('vibeCardOffice');
  const vibeCardsGrid = document.querySelector('.vibe-cards-grid');

  if (vibeTabBtns.length > 0) {
    vibeTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        vibeTabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const tab = btn.dataset.vibeTab; // 'all' | 'genz' | 'office'

        if (tab === 'all') {
          if (vibeCardGenz) vibeCardGenz.classList.remove('is-hidden');
          if (vibeCardOffice) vibeCardOffice.classList.remove('is-hidden');
          if (vibeCardsGrid) vibeCardsGrid.classList.remove('single-mode');
        } else if (tab === 'genz') {
          if (vibeCardGenz) vibeCardGenz.classList.remove('is-hidden');
          if (vibeCardOffice) vibeCardOffice.classList.add('is-hidden');
          if (vibeCardsGrid) vibeCardsGrid.classList.add('single-mode');
        } else if (tab === 'office') {
          if (vibeCardGenz) vibeCardGenz.classList.add('is-hidden');
          if (vibeCardOffice) vibeCardOffice.classList.remove('is-hidden');
          if (vibeCardsGrid) vibeCardsGrid.classList.add('single-mode');
        }
      });
    });
  }

  // Explore Buttons
  const btnExploreGenZ = document.getElementById('btnExploreGenZ');
  const btnExploreOffice = document.getElementById('btnExploreOffice');

  if (btnExploreGenZ) {
    btnExploreGenZ.addEventListener('click', () => {
      applyVibePreset('genz');
    });
  }

  if (btnExploreOffice) {
    btnExploreOffice.addEventListener('click', () => {
      applyVibePreset('office');
    });
  }

  window.openCustomizerWithPreset = applyVibePreset;

  // -----------------------------------------------------------------
  // 5. Shopping Cart Drawer
  // -----------------------------------------------------------------
  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function updateCartUI() {
    if (cartCountBadge) cartCountBadge.textContent = cart.length;
    if (cartDrawerCount) cartDrawerCount.textContent = cart.length;

    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';

      const silText = item.silhouetteLabel || item.size || '750ml Có Quai';
      const laserText = item.engravingDisplay || item.engraving || 'ALEX';
      const laserFont = item.fontName ? ` (${item.fontName} • ${item.engravePositionLabel || 'Khắc dọc'})` : '';
      const charmName = item.charm || 'Túi Mù Bí Mật';

      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-spec-tags-wrap">
            <div class="cart-spec-pill-row">
              <span class="cart-spec-pill">${silText}</span>
              <span class="cart-spec-pill">${item.color}</span>
            </div>
            ${laserText ? `
              <div class="cart-spec-laser">
                Khắc laser: <strong>"${laserText}"</strong>
                <small>${laserFont}</small>
              </div>
            ` : ''}
            ${charmName ? `
              <div class="cart-spec-charm">
                ${item.charmImg ? `<img src="${item.charmImg}" class="cart-charm-mini-img" alt="Charm">` : ''}
                <span>Charm: <strong>${charmName}</strong></span>
              </div>
            ` : ''}
          </div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <button class="cart-item-remove-btn" title="Xóa sản phẩm" aria-label="Xóa sản phẩm khỏi túi">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      `;

      itemEl.querySelector('.cart-item-remove-btn').addEventListener('click', () => {
        cart.splice(index, 1);
        updateCartUI();
        showToast('Đã xóa sản phẩm khỏi túi');
      });

      cartItemsList.appendChild(itemEl);
    });

    if (cartSubtotalAmount) {
      cartSubtotalAmount.textContent = formatPrice(total);
    }
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn.addEventListener('click', () => {
    showToast('Bước tiếp theo: kết nối Shopee, TikTok Shop hoặc cổng thanh toán.');
  });

  // -----------------------------------------------------------------
  // 6. Toast Notification Helper
  // -----------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    toastText.textContent = message;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  // Search button feedback
  const searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', () => {
    showToast('Gợi ý tìm kiếm: khắc tên, charm, hộp quà, bình pastel.');
  });

  // ===================================================================
  // 8. VIRTUAL BLIND BOX CHARM UNBOXING SIMULATOR
  // ===================================================================

  // State
  let unlockedCharms = new Set();
  let freeTries = 1;
  let isUnboxing = false;
  let currentWonCharm = null;
  let soundEnabled = true;

  // Web Audio API Synthesizer (Zero external dependencies)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playShakeSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // White noise buffer for pouch rustling
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  function playTearSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const bufferSize = audioCtx.sampleRate * 0.35;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Audio tear error:', e);
    }
  }

  function playWinChime(isSecret) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const notes = isSecret 
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5, E5, G5, C6, E6, G6
        : [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = isSecret ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.7);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.75);
      });
    } catch (e) {
      console.warn('Audio win error:', e);
    }
  }

  // -----------------------------------------------------------------
  // 60FPS Confetti Canvas Engine
  // -----------------------------------------------------------------
  const confettiCanvas = document.getElementById('blindboxConfettiCanvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    const parent = confettiCanvas.parentElement;
    if (parent) {
      confettiCanvas.width = parent.offsetWidth;
      confettiCanvas.height = parent.offsetHeight;
    }
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  const confettiColors = ['#d4fc39', '#38bdf8', '#fbbf24', '#f472b6', '#c084fc', '#ffffff', '#34d399'];

  function fireConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    resizeConfetti();
    const count = 120;
    const startX = confettiCanvas.width / 2;
    const startY = confettiCanvas.height * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 5;
      confettiParticles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 8 + 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 16,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1,
        life: 1
      });
    }

    if (!confettiAnimId) {
      runConfettiLoop();
    }
  }

  function runConfettiLoop() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air drag
      p.rotation += p.rotationSpeed;
      p.life -= 0.012;
      p.opacity = Math.max(0, p.life);

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = p.opacity;
      confettiCtx.fillStyle = p.color;

      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();

      if (p.life <= 0 || p.y > confettiCanvas.height + 20) {
        confettiParticles.splice(i, 1);
      }
    }

    if (confettiParticles.length > 0) {
      confettiAnimId = requestAnimationFrame(runConfettiLoop);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

  // -----------------------------------------------------------------
  // Render Charms Collection Grid
  // -----------------------------------------------------------------
  const charmsGrid = document.getElementById('charmsGrid');
  const collectionProgressFill = document.getElementById('collectionProgressFill');
  const collectionProgressText = document.getElementById('collectionProgressText');

  function renderCharmsCollection() {
    if (!charmsGrid) return;
    charmsGrid.innerHTML = '';

    charmsData.forEach((charm) => {
      const isUnlocked = unlockedCharms.has(charm.id);
      const isSecret = charm.rarity === 'secret';

      const card = document.createElement('div');
      card.className = `charm-card ${isUnlocked ? 'unlocked' : ''} ${isSecret ? 'is-secret' : ''}`;
      card.dataset.id = charm.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${charm.name}, độ hiếm: ${charm.rarityLabel}`);

      card.innerHTML = `
        <span class="charm-card-rarity rarity-${charm.rarity}">${charm.rarityLabel}</span>
        <div class="charm-icon-wrap">
          <img src="${charm.image}" alt="${charm.name}" class="charm-real-img" loading="lazy">
        </div>
        <div class="charm-card-name">${charm.name}</div>
        <div class="charm-card-drop">Tỷ lệ: ${charm.dropRate}</div>
        <div class="charm-card-status">
          ${isUnlocked ? '<span class="status-unlocked">Đã sưu tầm</span>' : '<span class="status-locked">Chưa mở</span>'}
        </div>
      `;

      card.addEventListener('click', () => {
        showCharmDetail(charm);
      });

      charmsGrid.appendChild(card);
    });

    updateProgressUI();
  }

  function updateProgressUI() {
    const total = charmsData.length;
    const count = unlockedCharms.size;
    const percent = Math.round((count / total) * 100);

    if (collectionProgressText) {
      collectionProgressText.textContent = `${count} / ${total} mẫu charm (${percent}%)`;
    }
    if (collectionProgressFill) {
      collectionProgressFill.style.width = `${percent}%`;
    }
  }

  // -----------------------------------------------------------------
  // Pick Winning Charm by Probability Weights
  // -----------------------------------------------------------------
  function pickRandomCharm() {
    const totalWeight = charmsData.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const charm of charmsData) {
      if (rand < charm.weight) {
        return charm;
      }
      rand -= charm.weight;
    }
    return charmsData[0];
  }

  // -----------------------------------------------------------------
  // Blind Box Interactive Elements
  // -----------------------------------------------------------------
  const mysteryBagWrap = document.getElementById('mysteryBagWrap');
  const mysteryBag = document.getElementById('mysteryBag');
  const shockwaveRing = document.getElementById('shockwaveRing');
  const bagRadialGlow = document.getElementById('bagRadialGlow');
  const sunburstRays = document.getElementById('sunburstRays');
  const bagTornFlap = document.getElementById('bagTornFlap');
  const bagLightBeam = document.getElementById('bagLightBeam');
  const revealedCharmFlyout = document.getElementById('revealedCharmFlyout');
  const charmFlyoutVisual = document.getElementById('charmFlyoutVisual');
  const btnUnboxPrimary = document.getElementById('btnUnboxPrimary');
  const btnUnboxText = document.getElementById('btnUnboxText');
  const freeTriesCount = document.getElementById('freeTriesCount');
  const btnRefillTries = document.getElementById('btnRefillTries');
  const blindboxSoundToggle = document.getElementById('blindboxSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundStatusText = document.getElementById('soundStatusText');

  // Result Modal Elements
  const unboxResultModal = document.getElementById('unboxResultModal');
  const closeUnboxModalBtn = document.getElementById('closeUnboxModalBtn');
  const resultRarityBadge = document.getElementById('resultRarityBadge');
  const resultCharmVisual = document.getElementById('resultCharmVisual');
  const resultCharmName = document.getElementById('resultCharmName');
  const resultCharmDesc = document.getElementById('resultCharmDesc');
  const resultVibePill = document.getElementById('resultVibePill');
  const btnAttachToBottle = document.getElementById('btnAttachToBottle');
  const btnSaveCharmToCart = document.getElementById('btnSaveCharmToCart');
  const btnUnboxAgain = document.getElementById('btnUnboxAgain');

  // Attached Bottle Charm Anchors
  const heroBottleCharmAnchor = document.getElementById('heroBottleCharmAnchor');
  const heroAttachedCharmPendant = document.getElementById('heroAttachedCharmPendant');
  const heroAttachedCharmTag = document.getElementById('heroAttachedCharmTag');

  // Sound Toggle
  if (blindboxSoundToggle) {
    blindboxSoundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      blindboxSoundToggle.classList.toggle('active', soundEnabled);
      if (soundStatusText) soundStatusText.textContent = soundEnabled ? 'BẬT' : 'TẮT';
      showToast(soundEnabled ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
    });
  }

  // Refill Tries Button
  if (btnRefillTries) {
    btnRefillTries.addEventListener('click', (e) => {
      e.stopPropagation();
      freeTries = Math.max(freeTries + 1, 1);
      updateTriesUI();
      showToast('Đã nạp thêm lượt thử miễn phí');
    });
  }

  function updateTriesUI() {
    if (freeTriesCount) {
      freeTriesCount.textContent = freeTries;
    }
    if (btnUnboxText) {
      if (freeTries > 0) {
        btnUnboxText.textContent = `XÉ TÚI MÙ NGAY (Còn ${freeTries} lần thử)`;
      } else {
        btnUnboxText.textContent = 'XÉ TÚI MÙ NGAY (Thử lại)';
      }
    }
  }

  // -----------------------------------------------------------------
  // Execute Unboxing Animation Sequence
  // -----------------------------------------------------------------
  function triggerUnboxing() {
    if (isUnboxing) return;
    initAudio();
    isUnboxing = true;

    if (freeTries > 0) {
      freeTries--;
    }
    updateTriesUI();

    // Disable CTA button state
    if (btnUnboxPrimary) {
      btnUnboxPrimary.disabled = true;
      if (btnUnboxText) btnUnboxText.textContent = 'ĐANG MỞ TÚI MÙ...';
    }

    // Step 1: Wiggle Shake (0.8s) + Shockwave Ring + Rattle Audio
    mysteryBag.classList.add('shake-wiggle');
    shockwaveRing.classList.remove('trigger');
    void shockwaveRing.offsetWidth; // force reflow
    shockwaveRing.classList.add('trigger');

    if (bagRadialGlow) bagRadialGlow.classList.add('shining');
    playShakeSound();

    // Secondary shake vibration pulse
    setTimeout(() => {
      playShakeSound();
    }, 400);

    // Step 2: Tear Open (at 800ms)
    setTimeout(() => {
      mysteryBag.classList.remove('shake-wiggle');

      // Tear flap fly
      if (bagTornFlap) bagTornFlap.classList.add('ripping');
      if (bagLightBeam) bagLightBeam.classList.add('blasting');
      playTearSound();

      // Confetti burst
      fireConfetti();

      // Step 3: Pick Winner Charm
      currentWonCharm = pickRandomCharm();
      unlockedCharms.add(currentWonCharm.id);
      renderCharmsCollection();

      // Step 4: Charm Flyout (at 1000ms)
      setTimeout(() => {
        if (charmFlyoutVisual) {
          charmFlyoutVisual.innerHTML = `<img src="${currentWonCharm.image}" alt="${currentWonCharm.name}" class="flyout-real-img">`;
        }
        if (revealedCharmFlyout) {
          revealedCharmFlyout.classList.add('fly-out');
        }
        if (sunburstRays) {
          sunburstRays.classList.add('active');
        }

        playWinChime(currentWonCharm.rarity === 'secret');

        // Step 5: Open Result Modal (at 1600ms)
        setTimeout(() => {
          openResultModal(currentWonCharm);
        }, 600);

      }, 200);

    }, 800);
  }

  // Bind unbox trigger to CTA and Mystery Bag
  if (btnUnboxPrimary) {
    btnUnboxPrimary.addEventListener('click', triggerUnboxing);
  }
  if (mysteryBagWrap) {
    mysteryBagWrap.addEventListener('click', triggerUnboxing);
  }

  // -----------------------------------------------------------------
  // Result Modal Operations
  // -----------------------------------------------------------------
  function openResultModal(charm) {
    if (!unboxResultModal) return;

    if (resultRarityBadge) {
      resultRarityBadge.textContent = charm.rarityLabel;
      resultRarityBadge.className = `result-badge-rarity rarity-${charm.rarity}`;
      if (charm.rarity === 'secret') {
        resultRarityBadge.style.background = 'linear-gradient(90deg, #f59e0b, #ec4899)';
        resultRarityBadge.style.color = '#ffffff';
      } else if (charm.rarity === 'rare') {
        resultRarityBadge.style.background = 'rgba(168, 85, 247, 0.25)';
        resultRarityBadge.style.color = '#d8b4fe';
      } else {
        resultRarityBadge.style.background = 'rgba(56, 189, 248, 0.25)';
        resultRarityBadge.style.color = '#7dd3fc';
      }
    }

    if (resultCharmVisual) {
      resultCharmVisual.innerHTML = `<img src="${charm.image}" alt="${charm.name}" class="result-real-img">`;
    }
    if (resultCharmName) {
      resultCharmName.textContent = charm.name;
    }
    if (resultCharmDesc) {
      resultCharmDesc.textContent = charm.desc;
    }
    if (resultVibePill) {
      resultVibePill.textContent = `Vibe: ${charm.vibe}`;
    }

    unboxResultModal.classList.add('open');
    unboxResultModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeResultModal() {
    if (!unboxResultModal) return;
    unboxResultModal.classList.remove('open');
    unboxResultModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeUnboxModalBtn) {
    closeUnboxModalBtn.addEventListener('click', () => {
      closeResultModal();
      resetBagStage();
    });
  }
  if (unboxResultModal) {
    unboxResultModal.addEventListener('click', (e) => {
      if (e.target === unboxResultModal) {
        closeResultModal();
        resetBagStage();
      }
    });
  }

  // Reset Stage for next unbox
  function resetBagStage() {
    isUnboxing = false;

    if (mysteryBag) mysteryBag.classList.remove('shake-wiggle');
    if (bagTornFlap) bagTornFlap.classList.remove('ripping');
    if (bagLightBeam) bagLightBeam.classList.remove('blasting');
    if (revealedCharmFlyout) revealedCharmFlyout.classList.remove('fly-out');
    if (sunburstRays) sunburstRays.classList.remove('active');
    if (bagRadialGlow) bagRadialGlow.classList.remove('shining');

    if (btnUnboxPrimary) {
      btnUnboxPrimary.disabled = false;
      if (btnUnboxText) {
        btnUnboxText.textContent = freeTries > 0 ? `XÉ TÚI MÙ NGAY (Còn ${freeTries} lần thử)` : 'XÉ TÚI MÙ TIẾP (Miễn phí)';
      }
    }
  }

  // -----------------------------------------------------------------
  // 3 Result Actions
  // -----------------------------------------------------------------
  // Action 1: Gắn thử charm lên bình MODU
  if (btnAttachToBottle) {
    btnAttachToBottle.addEventListener('click', () => {
      if (!currentWonCharm) return;

      // Update Hero bottle charm (accurately positioned on collar rivet)
      if (heroBottleCharmAnchor && heroAttachedCharmPendant) {
        heroAttachedCharmPendant.innerHTML = `<img src="${currentWonCharm.image}" alt="${currentWonCharm.name}" class="pendant-real-img">`;
        heroBottleCharmAnchor.style.display = 'flex';
      }

      // Update Customizer modal bottle charm
      selectCustomizerCharm(currentWonCharm);

      closeResultModal();
      resetBagStage();

      // Smooth scroll to hero section to view the pinned charm
      const heroSec = document.getElementById('heroSection');
      if (heroSec) {
        heroSec.scrollIntoView({ behavior: 'smooth' });
      }

      // If user is currently in lifestyle mode, switch to studio mode to make bottle clearly visible
      setHeroMode('studio');

      showToast(`Đã gắn "${currentWonCharm.name}" lên bình MODU`);
    });
  }

  // Action 2: Lưu charm này vào túi hàng (+39.000₫)
  if (btnSaveCharmToCart) {
    btnSaveCharmToCart.addEventListener('click', () => {
      if (!currentWonCharm) return;

      const charmCartItem = {
        name: currentWonCharm.name,
        color: currentWonCharm.rarityLabel,
        size: 'Phụ kiện charm độc quyền',
        price: 39000,
        img: currentWonCharm.image,
        engraving: 'SERIES 01'
      };

      cart.push(charmCartItem);
      updateCartUI();

      closeResultModal();
      resetBagStage();
      openCart();

      showToast(`Đã lưu ${currentWonCharm.name} (+39.000₫) vào túi hàng`);
    });
  }

  // Action 3: Khui lại túi khác (Thử vận may)
  if (btnUnboxAgain) {
    btnUnboxAgain.addEventListener('click', () => {
      closeResultModal();
      resetBagStage();
      freeTries = Math.max(freeTries, 1);
      updateTriesUI();
      showToast('Sẵn sàng khui túi mù tiếp theo');
    });
  }

  // Detail preview when clicking a card in the collection
  function showCharmDetail(charm) {
    currentWonCharm = charm;
    openResultModal(charm);
  }

  // -----------------------------------------------------------------
  // 3D Tilt Interaction on Blind Bag Stage (Desktop)
  // -----------------------------------------------------------------
  const blindbagInteractiveArea = document.getElementById('blindbagInteractiveArea');
  if (blindbagInteractiveArea && window.innerWidth > 992) {
    blindbagInteractiveArea.addEventListener('mousemove', (e) => {
      if (isUnboxing) return;
      const rect = blindbagInteractiveArea.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (mysteryBag) {
        mysteryBag.style.transform = `perspective(800px) rotateY(${x * 24}deg) rotateX(${y * -20}deg) translateY(-6px)`;
      }
    });

    blindbagInteractiveArea.addEventListener('mouseleave', () => {
      if (isUnboxing) return;
      if (mysteryBag) {
        mysteryBag.style.transform = '';
      }
    });
  }

  // Initialize Customizer Charm Selector & Collection Showcase
  renderCustomizerCharmsSelector();
  renderCharmsCollection();

  // -----------------------------------------------------------------
  // 7. Interactive Debug Calibration Panel
  // -----------------------------------------------------------------
  const debugToggleBtn = document.getElementById('debugToggleBtn');
  const debugCard = document.getElementById('debugCard');
  const debugCloseBtn = document.getElementById('debugCloseBtn');

  const inputRight = document.getElementById('inputRight');
  const inputBottom = document.getElementById('inputBottom');
  const inputWidth = document.getElementById('inputWidth');
  const inputHeight = document.getElementById('inputHeight');
  const inputRotate = document.getElementById('inputRotate');
  const inputScale = document.getElementById('inputScale');
  const inputRippleX = document.getElementById('inputRippleX');
  const inputRippleY = document.getElementById('inputRippleY');

  const valRight = document.getElementById('valRight');
  const valBottom = document.getElementById('valBottom');
  const valWidth = document.getElementById('valWidth');
  const valHeight = document.getElementById('valHeight');
  const valRotate = document.getElementById('valRotate');
  const valScale = document.getElementById('valScale');
  const valRippleX = document.getElementById('valRippleX');
  const valRippleY = document.getElementById('valRippleY');

  const debugCodeArea = document.getElementById('debugCodeArea');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const btnResetDebug = document.getElementById('btnResetDebug');

  if (false && debugToggleBtn && debugCard) {
    debugToggleBtn.addEventListener('click', () => {
      debugCard.classList.toggle('open');
      updateCalibrationLive();
    });

    if (debugCloseBtn) {
      debugCloseBtn.addEventListener('click', () => {
        debugCard.classList.remove('open');
      });
    }

    function updateCalibrationLive() {
      const r = isNaN(parseFloat(inputRight.value)) ? -1 : parseFloat(inputRight.value);
      const b = isNaN(parseFloat(inputBottom.value)) ? -4 : parseFloat(inputBottom.value);
      const w = isNaN(parseFloat(inputWidth.value)) ? 53.5 : parseFloat(inputWidth.value);
      const h = isNaN(parseFloat(inputHeight.value)) ? 96 : parseFloat(inputHeight.value);
      const rot = isNaN(parseFloat(inputRotate.value)) ? 0 : parseFloat(inputRotate.value);
      const sc = isNaN(parseFloat(inputScale.value)) ? 1 : parseFloat(inputScale.value);
      const rx = isNaN(parseFloat(inputRippleX.value)) ? 61 : parseFloat(inputRippleX.value);
      const ry = isNaN(parseFloat(inputRippleY.value)) ? 48 : parseFloat(inputRippleY.value);

      // Update text indicators
      if (valRight) valRight.textContent = `${r}vw`;
      if (valBottom) valBottom.textContent = `${b}vh`;
      if (valWidth) valWidth.textContent = `${w}vw`;
      if (valHeight) valHeight.textContent = `${h}vh`;
      if (valRotate) valRotate.textContent = `${rot}deg`;
      if (valScale) valScale.textContent = `${sc.toFixed(2)}x`;
      if (valRippleX) valRippleX.textContent = `${rx}%`;
      if (valRippleY) valRippleY.textContent = `${ry}%`;

      // Set CSS Variables on document root for instant reactive cascade
      document.documentElement.style.setProperty('--hand-right', `${r}vw`);
      document.documentElement.style.setProperty('--hand-bottom', `${b}vh`);
      document.documentElement.style.setProperty('--hand-width', `${w}vw`);
      document.documentElement.style.setProperty('--hand-height', `${h}vh`);
      document.documentElement.style.setProperty('--hand-rotate', `${rot}deg`);
      document.documentElement.style.setProperty('--hand-scale', `${sc}`);
      document.documentElement.style.setProperty('--ripple-left', `${rx}%`);
      document.documentElement.style.setProperty('--ripple-top', `${ry}%`);

      // Apply direct inline styles with important priority to override any animation or layout styles
      if (heroVisual) {
        heroVisual.style.setProperty('right', `${r}vw`, 'important');
        heroVisual.style.setProperty('bottom', `${b}vh`, 'important');
        heroVisual.style.setProperty('width', `${w}vw`, 'important');
        heroVisual.style.setProperty('height', `${h}vh`, 'important');
        heroVisual.style.setProperty('max-width', 'none', 'important');
        heroVisual.style.setProperty('transform', 'none', 'important');
      }

      if (heroHandImg) {
        heroHandImg.classList.add('calibrating');
        heroHandImg.style.setProperty('animation', 'none', 'important');
        heroHandImg.style.setProperty('transform-origin', '75% 85%', 'important');
        heroHandImg.style.setProperty('transform', `rotate(${rot}deg) scale(${sc})`, 'important');
      }

      if (rippleStage) {
        rippleStage.style.setProperty('left', `${rx}%`, 'important');
        rippleStage.style.setProperty('top', `${ry}%`, 'important');
      }

      // Generate CSS code snippet
      if (debugCodeArea) {
        const cssCode = `/* Vị trí chuẩn bạn vừa căn chỉnh */
.hero-visual-container {
  right: ${r}vw;
  bottom: ${b}vh;
  width: ${w}vw;
  height: ${h}vh;
}

.hero-hand-image {
  transform: rotate(${rot}deg) scale(${sc});
}

.ripple-stage {
  left: ${rx}%;
  top: ${ry}%;
}`;
        debugCodeArea.value = cssCode;
      }
    }

    // Attach input & change listeners for live response
    [
      inputRight, inputBottom, inputWidth, inputHeight,
      inputRotate, inputScale, inputRippleX, inputRippleY
    ].forEach(input => {
      if (input) {
        input.addEventListener('input', updateCalibrationLive);
        input.addEventListener('change', updateCalibrationLive);
      }
    });

    // Copy Code button
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        debugCodeArea.select();
        navigator.clipboard.writeText(debugCodeArea.value).then(() => {
          showToast('Đã sao chép mã CSS');
        }).catch(() => {
          document.execCommand('copy');
          showToast('Đã sao chép mã CSS');
        });
      });
    }

    // Reset Defaults
    if (btnResetDebug) {
      btnResetDebug.addEventListener('click', () => {
        inputRight.value = 0;
        inputBottom.value = -8.5;
        inputWidth.value = 51.5;
        inputHeight.value = 101;
        inputRotate.value = -10.5;
        inputScale.value = 1.06;
        inputRippleX.value = 69;
        inputRippleY.value = 48;
        updateCalibrationLive();
        showToast('Đã đặt lại thông số chuẩn bạn đã căn chỉnh');
      });
    }

    // Initialize calibration output
    updateCalibrationLive();
  }

  // Initialize
  updateCartUI();
});
