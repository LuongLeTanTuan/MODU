/**
 * MODU About Page Interactive Controller
 * Handles dynamic color previews, mobile drawer toggles, and micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Quick Search Bar with Morphicons Morphing
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
            window.location.href = `index.html#page-personalize`;
          }
        }
      });
    }

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

  // Mobile Nav Drawer Toggle with Morphicons Morphing
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavPanel = document.getElementById('mobileNavPanel');

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

  // Interactive Color Palette Switcher
  const colorData = {
    mint: {
      name: 'Mint Green',
      tag: 'Xanh Bạc Hà • Tươi Mới & Cân Bằng',
      desc: 'Sắc xanh pastel êm dịu, lấy cảm hứng từ những lá bạc hà trong sương sớm. Mang đến cảm giác tươi mới, thanh lọc tâm trí và năng lượng tích cực cho ngày làm việc hay học tập hiệu quả.',
      image: 'assets/bottle-mint.png',
      badge: 'Bestseller'
    },
    white: {
      name: 'Cream White',
      tag: 'Trắng Kem • Tối Giản & Thuần Khiết',
      desc: 'Tông màu trắng ngà thanh lịch với ánh ấm nhẹ nhàng theo phong cách Scandinavian Minimalist. Dễ dàng phối cùng bất kỳ trang phục hay không gian làm việc hiện đại nào.',
      image: 'assets/bottle-white.png',
      badge: 'Classic Minimal'
    },
    pink: {
      name: 'Blush Pink',
      tag: 'Hồng Phấn • Ngọt Ngào & Tinh Tế',
      desc: 'Gam hồng pastel ấm áp, trẻ trung và tràn đầy năng lượng ngọt ngào. Lựa chọn hoàn hảo cho những ai yêu thích vẻ đẹp nữ tính, hiện đại và yêu đời.',
      image: 'assets/bottle-pink.png',
      badge: 'Trending Vibe'
    },
    blue: {
      name: 'Sky Blue',
      tag: 'Xanh Mây Trời • Tự Do & Phóng Khoáng',
      desc: 'Màu xanh của bầu trời mùa hè trong vắt, khơi gợi cảm hứng tự do khám phá và những chuyến hành trình mới. Mang lại sự bình yên và mát lành trong từng ngụm nước.',
      image: 'assets/bottle-blue.png',
      badge: 'Outdoor Ready'
    },
    black: {
      name: 'Obsidian Black',
      tag: 'Đen Nhám • Mạnh Mẽ & Độc Bản',
      desc: 'Sắc đen nhám matte huyền bí, đĩnh đạc và mang đậm phong cách futuristic. Thích hợp cho phòng gym, văn phòng chuyên nghiệp hoặc phong cách street-style cá tính.',
      image: 'assets/bottle-black.png',
      badge: 'Iconic Matte'
    }
  };

  const swatchButtons = document.querySelectorAll('.color-swatch-btn');
  const stageImg = document.getElementById('aboutColorStageImg');
  const colorNameEl = document.getElementById('activeColorName');
  const colorTagEl = document.getElementById('activeColorTag');
  const colorDescEl = document.getElementById('activeColorDesc');

  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const colorKey = btn.getAttribute('data-color');
      const data = colorData[colorKey];
      if (!data) return;

      // Update active state
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Smooth image transition
      if (stageImg) {
        stageImg.style.opacity = '0';
        stageImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
          stageImg.src = data.image;
          stageImg.alt = `Bình MODU màu ${data.name}`;
          stageImg.style.opacity = '1';
          stageImg.style.transform = 'scale(1)';
        }, 200);
      }

      if (colorNameEl) colorNameEl.textContent = data.name;
      if (colorTagEl) colorTagEl.textContent = data.tag;
      if (colorDescEl) colorDescEl.textContent = data.desc;
    });
  });

  // Newsletter Submit Feedback
  const newsletterBtn = document.getElementById('btnAboutNewsletter');
  const newsletterInput = document.getElementById('aboutNewsletterInput');
  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
      const val = newsletterInput.value.trim();
      if (val && val.includes('@')) {
        newsletterBtn.textContent = 'Đã Đăng Ký ✓';
        newsletterBtn.style.backgroundColor = '#d4fc39';
        newsletterInput.value = '';
        setTimeout(() => {
          newsletterBtn.textContent = 'Đăng Ký';
        }, 3000);
      } else {
        alert('Vui lòng nhập địa chỉ email hợp lệ!');
      }
    });
  }
});
