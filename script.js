/* ===================================================================
   MODU WATER BOTTLE - 3-PAGE INTERACTIVE ENGINE
   Showcase (Page 1) • Personalize Studio (Page 2) • Checkout (Page 3)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ===================================================================
     1. STATE MANAGEMENT
     =================================================================== */
  const state = {
    color: 'mint',
    lid: 'mint',
    engraving: 'Olivia',
    hasHeart: true,
    font: 'brittany',
    charm: 'daisy',
    price: 34.00,
    address: '123 Sunny Lane, San Diego, CA',
    paymentMethod: 'visa',
    cartCount: 1
  };

  const ASSETS = {
    bottles: {
      mint: 'assets/bottle-mint.png',
      white: 'assets/bottle-white.png',
      pink: 'assets/bottle-pink.png',
      blue: 'assets/bottle-blue.png',
      black: 'assets/bottle-black.png'
    },
    lids: {
      mint: 'assets/lids/lid-mint.png',
      white: 'assets/lids/lid-white.png',
      pink: 'assets/lids/lid-pink.png',
      blue: 'assets/lids/lid-blue.png',
      black: 'assets/lids/lid-black.png'
    },
    charms: {
      daisy: 'assets/charms/charm_daisy_hanging.png',
      heart: 'assets/charms/hanging_heart.png',
      letter_m: 'assets/charms/hanging_letter_m.png',
      smiley: 'assets/charms/hanging_smiley.png',
      blue_flower: 'assets/charms/hanging_blue_flower.png'
    },
    names: {
      colors: {
        mint: 'Xanh bạc hà',
        white: 'Trắng kem',
        pink: 'Hồng phấn',
        blue: 'Xanh trời',
        black: 'Đen nhám'
      },
      lids: {
        mint: 'Quai xanh bạc hà',
        white: 'Quai trắng kem',
        pink: 'Quai hồng phấn',
        blue: 'Quai xanh trời',
        black: 'Quai đen nhám'
      },
      charms: {
        daisy: 'Hoa cúc',
        heart: 'Trái tim hồng',
        letter_m: 'Chữ M bạc',
        smiley: 'Mặt cười',
        blue_flower: 'Hoa cúc xanh'
      }
    }
  };

  /* ===================================================================
     2. DOM ELEMENTS
     =================================================================== */
  // Page 1 Elements
  const heroHandImg = document.getElementById('heroHandImg');
  const heroStudioImg = document.getElementById('heroStudioImg');
  const heroColorCols = document.querySelectorAll('.color-explorer-card .bottle-col');
  const heroCustomizeCtaBtn = document.getElementById('heroCustomizeCtaBtn');

  // Page 2 Elements
  const interactiveBottleWrapper = document.getElementById('interactiveBottleWrapper');
  const interactiveBottleBody = document.getElementById('interactiveBottleBody');
  const interactiveBottleLid = document.getElementById('interactiveBottleLid');
  const liveEngraveText = document.getElementById('liveEngraveText');
  const hangingCharmImg = document.getElementById('hangingCharmImg');
  const engraveTextPath2 = document.getElementById('engraveTextPath2');
  const checkoutEngraveTextPath = document.getElementById('checkoutEngraveTextPath');
  const liveEngraveHeartWrap = document.getElementById('liveEngraveHeartWrap');
  const checkoutEngraveHeartWrap = document.getElementById('checkoutEngraveHeartWrap');
  const toggleHeartStroke = document.getElementById('toggleHeartStroke');

  const step1ColorName = document.getElementById('step1ColorName');
  const step2LidName = document.getElementById('step2LidName');
  const step3EngraveName = document.getElementById('step3EngraveName');
  const step4CharmName = document.getElementById('step4CharmName');

  const swatchBtns = document.querySelectorAll('.swatch-btn');
  const lidThumbBtns = document.querySelectorAll('.lid-thumb-btn');
  const inputEngrave = document.getElementById('inputEngrave');
  const engraveCounterBadge = document.getElementById('engraveCounterBadge');
  const fontBtns = document.querySelectorAll('.font-btn');
  const charmBtns = document.querySelectorAll('.charm-btn');
  const btnAddToCart = document.getElementById('btnAddToCart');
  const btnPersonalizeScrollToConfig = document.getElementById('btnPersonalizeScrollToConfig');

  // Page 3 Elements
  const checkoutBottleWrapper = document.getElementById('checkoutBottleWrapper');
  const checkoutBottleBody = document.getElementById('checkoutBottleBody');
  const checkoutBottleLid = document.getElementById('checkoutBottleLid');
  const checkoutEngraveText = document.getElementById('checkoutEngraveText');
  const checkoutCharmImg = document.getElementById('checkoutCharmImg');

  const summaryThumbImg = document.getElementById('summaryThumbImg');
  const summaryColorsSpec = document.getElementById('summaryColorsSpec');
  const summaryDetailsSpec = document.getElementById('summaryDetailsSpec');
  const btnEditCustomization = document.getElementById('btnEditCustomization');
  const btnCheckoutPayNowTrigger = document.getElementById('btnCheckoutPayNowTrigger');
  const btnFinalPayNow = document.getElementById('btnFinalPayNow');
  const finalTotalAmount = document.getElementById('finalTotalAmount');

  // Shipping & Payment Rows
  const shippingAddressRow = document.getElementById('shippingAddressRow');
  const shippingAddressValue = document.getElementById('shippingAddressValue');
  const paymentMethodBtns = document.querySelectorAll('.btn-payment-method');

  // Modals & Navigation
  const addressModalOverlay = document.getElementById('addressModalOverlay');
  const addressInput = document.getElementById('addressInput');
  const btnCloseAddressModal = document.getElementById('btnCloseAddressModal');
  const btnCancelAddress = document.getElementById('btnCancelAddress');
  const btnSaveAddress = document.getElementById('btnSaveAddress');

  const successModalOverlay = document.getElementById('successModalOverlay');
  const successOrderNum = document.getElementById('successOrderNum');
  const successBottleImg = document.getElementById('successBottleImg');
  const successBottleTag = document.getElementById('successBottleTag');
  const btnNewCustomization = document.getElementById('btnNewCustomization');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // Side Page Indicator
  const sideDots = document.querySelectorAll('.side-dot');
  const pageSections = document.querySelectorAll('.page-section');

  // Cart Drawer
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartDrawerCount = document.getElementById('cartDrawerCount');
  const cartItemThumb = document.getElementById('cartItemThumb');
  const cartItemSpec = document.getElementById('cartItemSpec');
  const btnDrawerCheckout = document.getElementById('btnDrawerCheckout');
  const toastNotice = document.getElementById('toastNotice');
  const toastText = document.getElementById('toastText');

  // Mobile Menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavPanel = document.getElementById('mobileNavPanel');

  /* ===================================================================
     3. SYNCHRONIZATION & RENDER PIPELINE
     =================================================================== */
  function renderAll() {
    const bottleSrc = ASSETS.bottles[state.color] || ASSETS.bottles.mint;
    const lidSrc = ASSETS.lids[state.lid] || ASSETS.lids.mint;
    const charmSrc = ASSETS.charms[state.charm] || ASSETS.charms.daisy;
    const engraveVal = state.engraving || '';
    const isDark = state.color === 'black';

    // --- Page 2 Updates ---
    if (interactiveBottleBody) interactiveBottleBody.src = bottleSrc;
    if (interactiveBottleLid) interactiveBottleLid.src = lidSrc;
    if (interactiveBottleWrapper) {
      interactiveBottleWrapper.classList.toggle('dark-bottle', isDark);
    }

    if (engraveTextPath2) {
      engraveTextPath2.textContent = engraveVal;
    }
    if (liveEngraveText) {
      liveEngraveText.className = `live-engrave-overlay font-${state.font}`;
    }
    if (liveEngraveHeartWrap) {
      liveEngraveHeartWrap.classList.toggle('hidden', !state.hasHeart);
    }

    if (hangingCharmImg) hangingCharmImg.src = charmSrc;

    if (step1ColorName) step1ColorName.textContent = ASSETS.names.colors[state.color] || 'Xanh bạc hà';
    if (step3EngraveName) step3EngraveName.textContent = engraveVal ? `${engraveVal}${state.hasHeart ? ' ♡' : ''}` : 'Chưa có';
    if (step4CharmName) step4CharmName.textContent = ASSETS.names.charms[state.charm] || 'Chưa có';

    // --- Page 3 Updates ---
    if (checkoutBottleBody) checkoutBottleBody.src = bottleSrc;
    if (checkoutBottleLid) checkoutBottleLid.src = lidSrc;
    if (checkoutBottleWrapper) {
      checkoutBottleWrapper.classList.toggle('dark-bottle', isDark);
    }

    if (checkoutEngraveTextPath) {
      checkoutEngraveTextPath.textContent = engraveVal;
    }
    if (checkoutEngraveText) {
      checkoutEngraveText.className = `live-engrave-overlay font-${state.font}`;
    }
    if (checkoutEngraveHeartWrap) {
      checkoutEngraveHeartWrap.classList.toggle('hidden', !state.hasHeart);
    }

    if (checkoutCharmImg) checkoutCharmImg.src = charmSrc;

    // Order Summary Card in Page 3
    if (summaryThumbImg) summaryThumbImg.src = bottleSrc;
    if (summaryColorsSpec) {
      summaryColorsSpec.textContent = `${ASSETS.names.colors[state.color]}`;
    }
    if (summaryDetailsSpec) {
      const charmLabel = ASSETS.names.charms[state.charm] ? `${ASSETS.names.charms[state.charm]}` : 'Không có phụ kiện';
      summaryDetailsSpec.textContent = `${engraveVal} / ${charmLabel}`;
    }

    // Cart Drawer Update
    if (cartItemThumb) cartItemThumb.src = bottleSrc;
    if (cartItemSpec) {
      cartItemSpec.textContent = `${ASSETS.names.colors[state.color]} • ${engraveVal}${state.hasHeart ? ' ♡' : ''} • ${ASSETS.names.charms[state.charm]}`;
    }

    // Active button states
    swatchBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === state.color);
    });

    lidThumbBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lid === state.lid);
    });

    fontBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === state.font);
    });

    charmBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.charm === state.charm);
    });
  }

  /* ===================================================================
     4. PAGE 1: HERO COLOR EXPLORER INTERACTIONS
     =================================================================== */
  heroColorCols.forEach(col => {
    col.addEventListener('click', () => {
      const colorKey = col.dataset.color;
      if (!colorKey) return;

      heroColorCols.forEach(c => c.classList.remove('active'));
      col.classList.add('active');

      state.color = colorKey;
      state.lid = colorKey; // matching lid loop default

      // Switch Page 1 lifestyle hand to studio bottle if non-mint
      if (colorKey !== 'mint' && heroStudioImg && heroHandImg) {
        heroHandImg.style.display = 'none';
        heroStudioImg.style.display = 'block';
        heroStudioImg.src = ASSETS.bottles[colorKey];
      } else if (heroHandImg && heroStudioImg) {
        heroHandImg.style.display = 'block';
        heroStudioImg.style.display = 'none';
      }

      renderAll();
      showToast(`Đã chọn ${ASSETS.names.colors[colorKey]}`);
    });
  });

  /* ===================================================================
     5. PAGE 2: PERSONALIZATION CONTROLS
     =================================================================== */
  // Step 1: Color Swatches
  swatchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.color;
      if (!c) return;
      state.color = c;
      state.lid = c; // loop syncs with bottle color by default
      renderAll();
      showToast(`Màu bình: ${ASSETS.names.colors[c]}`);
    });
  });

  // Step 2: Lid Thumbnails
  lidThumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const l = btn.dataset.lid;
      if (!l) return;
      state.lid = l;
      renderAll();
      showToast(`Nắp & quai: ${ASSETS.names.lids[l]}`);
    });
  });

  // Step 2: Laser Engraving, Character Counter & Heart Stroke Toggle
  if (inputEngrave) {
    inputEngrave.addEventListener('input', (e) => {
      let val = e.target.value;
      if (val.length > 16) {
        val = val.slice(0, 16);
        e.target.value = val;
      }
      // If user typed heart symbol, automatically extract it to standalone heart
      if (val.includes('♡') || val.includes('❤') || val.includes('<3')) {
        val = val.replace(/[♡❤]|<3/g, '').trim();
        state.hasHeart = true;
        if (toggleHeartStroke) toggleHeartStroke.checked = true;
      }
      state.engraving = val;
      if (engraveCounterBadge) {
        engraveCounterBadge.textContent = `${val.length}/16`;
      }
      renderAll();
    });
  }

  if (toggleHeartStroke) {
    toggleHeartStroke.addEventListener('change', (e) => {
      state.hasHeart = e.target.checked;
      renderAll();
      if (window.Morphicons) {
        window.Morphicons.morphElement('#heartTogglePath', state.hasHeart ? 'Heart' : 'Sparkles', 'bouncy');
      }
      showToast(state.hasHeart ? 'Đã thêm biểu tượng trái tim' : 'Đã bỏ biểu tượng trái tim');
    });
  }

  // Font Style Buttons
  fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.font;
      if (!f) return;
      state.font = f;
      renderAll();
    });
  });

  // Step 4: Charm Buttons
  charmBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.dataset.charm;
      if (!ch) return;
      state.charm = ch;
      renderAll();
      showToast(`Phụ kiện: ${ASSETS.names.charms[ch]}`);
    });
  });

  // Scroll to customizer card on Page 2
  if (btnPersonalizeScrollToConfig) {
    btnPersonalizeScrollToConfig.addEventListener('click', () => {
      const card = document.getElementById('customizerPanelCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Add to Cart Button (Page 2) -> Adds to Cart & Smooth Scrolls to Page 3
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      state.cartCount++;
      if (cartCountBadge) {
        cartCountBadge.textContent = state.cartCount;
        cartCountBadge.classList.add('pop');
        setTimeout(() => cartCountBadge.classList.remove('pop'), 350);
      }
      if (cartDrawerCount) cartDrawerCount.textContent = state.cartCount;
      
      // Morphicons spring physics: morph addCart button icon & cart navbar icon to Check, then revert
      if (window.Morphicons) {
        window.Morphicons.morphElement('#addCartBtnIconPath', 'Check', 'bouncy');
        window.Morphicons.morphElement('#cartIconPath', 'Check', 'bouncy');
        setTimeout(() => {
          window.Morphicons.morphElement('#addCartBtnIconPath', 'ShoppingBag', 'snappy');
          window.Morphicons.morphElement('#cartIconPath', 'ShoppingBag', 'snappy');
        }, 1200);
      }

      showToast('Đã thêm bình MODU! Chuyển đến thanh toán...');
      
      // Auto smooth scroll to Page 3
      const checkoutPage = document.getElementById('page-checkout');
      if (checkoutPage) {
        setTimeout(() => {
          checkoutPage.scrollIntoView({ behavior: 'smooth' });
        }, 380);
      }
    });
  }

  /* ===================================================================
     6. PAGE 3: CHECKOUT & PAYMENT FLOW
     =================================================================== */
  // Edit Button in Order Summary -> Smooth Scroll back to Page 2
  if (btnEditCustomization) {
    btnEditCustomization.addEventListener('click', () => {
      if (window.Morphicons) {
        window.Morphicons.morphElement('#editBtnIconPath', 'Check', 'bouncy');
        setTimeout(() => {
          window.Morphicons.morphElement('#editBtnIconPath', 'Pencil', 'snappy');
        }, 1000);
      }
      const personalizePage = document.getElementById('page-personalize');
      if (personalizePage) {
        personalizePage.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Left CTA button on Page 3
  if (btnCheckoutPayNowTrigger) {
    btnCheckoutPayNowTrigger.addEventListener('click', () => {
      if (btnFinalPayNow) btnFinalPayNow.click();
    });
  }

  // Payment Method Selection
  paymentMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      paymentMethodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.paymentMethod = btn.dataset.method || 'visa';
      showToast(`Cách thanh toán: ${btn.dataset.method.toUpperCase()}`);
    });
  });

  // Edit Shipping Address Modal Trigger
  if (shippingAddressRow) {
    shippingAddressRow.addEventListener('click', () => {
      if (addressModalOverlay) {
        addressModalOverlay.classList.add('open');
        if (addressInput) {
          addressInput.value = state.address;
          addressInput.focus();
        }
      }
    });
  }

  function closeAddressModal() {
    if (addressModalOverlay) addressModalOverlay.classList.remove('open');
  }

  if (btnCloseAddressModal) btnCloseAddressModal.addEventListener('click', closeAddressModal);
  if (btnCancelAddress) btnCancelAddress.addEventListener('click', closeAddressModal);
  if (btnSaveAddress) {
    btnSaveAddress.addEventListener('click', () => {
      if (addressInput && addressInput.value.trim()) {
        state.address = addressInput.value.trim();
        if (shippingAddressValue) shippingAddressValue.textContent = state.address;
        showToast('Đã cập nhật địa chỉ!');
      }
      closeAddressModal();
    });
  }

  // Final Pay Now Button -> Triggers Success Celebration Modal
  if (btnFinalPayNow) {
    btnFinalPayNow.addEventListener('click', () => {
      if (window.Morphicons) {
        window.Morphicons.morphElement('#payNowBtnIconPath', 'Check', 'bouncy');
      }

      // Generate random order number
      const orderNum = Math.floor(10000 + Math.random() * 90000);
      if (successOrderNum) successOrderNum.textContent = orderNum;

      if (successBottleImg) {
        successBottleImg.src = ASSETS.bottles[state.color] || ASSETS.bottles.mint;
      }
      if (successBottleTag) {
        successBottleTag.textContent = `${state.engraving || 'MODU'} • ${ASSETS.names.charms[state.charm] || 'Phụ kiện'}`;
      }

      if (successModalOverlay) {
        successModalOverlay.classList.add('open');
        triggerConfettiCelebration();
      }
    });
  }

  if (btnNewCustomization) {
    btnNewCustomization.addEventListener('click', () => {
      if (successModalOverlay) successModalOverlay.classList.remove('open');
      const heroPage = document.getElementById('page-hero');
      if (heroPage) heroPage.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ===================================================================
     7. SCROLL-SPY & SIDE PAGE NAVIGATION DOTS (01, 02, 03)
     =================================================================== */
  function updateActivePageDot() {
    const scrollPos = window.scrollY + window.innerHeight * 0.4;
    pageSections.forEach((sec, idx) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        sideDots.forEach(d => d.classList.remove('active'));
        if (sideDots[idx]) sideDots[idx].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActivePageDot, { passive: true });

  sideDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href');
      const targetSec = document.querySelector(targetId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ===================================================================
     8. SHOPPING CART DRAWER & TOAST NOTIFICATION
     =================================================================== */
  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
    }
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (btnDrawerCheckout) {
    btnDrawerCheckout.addEventListener('click', () => {
      closeCart();
      const checkoutPage = document.getElementById('page-checkout');
      if (checkoutPage) checkoutPage.scrollIntoView({ behavior: 'smooth' });
    });
  }

  let toastTimer;
  function showToast(msg) {
    if (!toastNotice || !toastText) return;
    toastText.textContent = msg;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2400);
  }

  // Search flyout bar with Morphicons Morphing
  const searchBtn = document.getElementById('searchBtn');
  const searchBar = document.getElementById('navSearchBar');
  const searchInput = document.getElementById('navSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  let isSearchActive = false;

  if (searchBtn && searchBar) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSearchActive = !isSearchActive;
      searchBar.classList.toggle('open', isSearchActive);
      searchBar.setAttribute('aria-hidden', (!isSearchActive).toString());
      if (window.Morphicons) {
        window.Morphicons.morphElement('#searchIconPath', isSearchActive ? 'X' : 'Search', 'bouncy');
      }
      if (isSearchActive && searchInput) {
        setTimeout(() => searchInput.focus(), 150);
      }
    });

    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (searchInput.value) {
          searchInput.value = '';
          searchInput.focus();
        } else {
          isSearchActive = false;
          searchBar.classList.remove('open');
          searchBar.setAttribute('aria-hidden', 'true');
          if (window.Morphicons) {
            window.Morphicons.morphElement('#searchIconPath', 'Search', 'snappy');
          }
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          isSearchActive = false;
          searchBar.classList.remove('open');
          searchBar.setAttribute('aria-hidden', 'true');
          if (window.Morphicons) {
            window.Morphicons.morphElement('#searchIconPath', 'Search', 'snappy');
          }
        } else if (e.key === 'Enter') {
          const val = searchInput.value.toLowerCase().trim();
          if (val) {
            showToast(`Tìm kiếm: "${val}"`);
            const targetColor = ['mint', 'sage', 'blush', 'cloud', 'lavender', 'slate'].find(c => val.includes(c));
            if (targetColor) {
              selectColor(targetColor);
              const studio = document.getElementById('page-personalize');
              if (studio) studio.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    }

    // Close search on click outside
    document.addEventListener('click', (e) => {
      if (isSearchActive && !searchBar.contains(e.target) && !searchBtn.contains(e.target)) {
        isSearchActive = false;
        searchBar.classList.remove('open');
        searchBar.setAttribute('aria-hidden', 'true');
        if (window.Morphicons) {
          window.Morphicons.morphElement('#searchIconPath', 'Search', 'snappy');
        }
      }
    });
  }

  // Mobile navigation with Morphicons Morphing
  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavPanel.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
      if (window.Morphicons) {
        window.Morphicons.morphElement('#mobileMenuPath', isOpen ? 'X' : 'Menu', 'bouncy');
      }
    });

    mobileNavPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (window.Morphicons) {
          window.Morphicons.morphElement('#mobileMenuPath', 'Menu', 'snappy');
        }
      });
    });
  }

  /* ===================================================================
     9. 60FPS CONFETTI ANIMATION ON ORDER SUCCESS
     =================================================================== */
  function triggerConfettiCelebration() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    const width = confettiCanvas.width = confettiCanvas.parentElement.offsetWidth;
    const height = confettiCanvas.height = confettiCanvas.parentElement.offsetHeight;

    const particles = [];
    const colors = ['#d4fc39', '#82b9d2', '#f4b8b4', '#9ec5b6', '#ffffff'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    renderConfetti();
  }

  // Newsletter form submission
  const btnNewsletter = document.getElementById('btnNewsletter');
  const newsletterInput = document.getElementById('newsletterInput');
  if (btnNewsletter && newsletterInput) {
    btnNewsletter.addEventListener('click', () => {
      const email = newsletterInput.value.trim();
      if (email && email.includes('@')) {
        showToast('Cảm ơn bạn đã đăng ký nhận bản tin MODU!');
        newsletterInput.value = '';
      } else {
        showToast('Vui lòng nhập địa chỉ email hợp lệ.');
      }
    });
  }

  /* ===================================================================
     10. INITIALIZATION
     =================================================================== */
  renderAll();
  updateActivePageDot();

});
