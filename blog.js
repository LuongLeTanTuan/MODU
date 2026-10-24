// Shared navigation and Morphicons behavior for the static journal and article pages.
(() => {
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
            const articles = document.querySelectorAll('.post-card');
            articles.forEach(card => {
              const text = card.textContent.toLowerCase();
              card.style.display = text.includes(val) ? '' : 'none';
            });
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

  // Mobile navigation with Morphicons Morphing
  const button = document.getElementById('mobileMenuBtn');
  const panel = document.getElementById('mobileNavPanel');
  if (!button || !panel) return;
  const setOpen = open => {
    panel.classList.toggle('open', open);
    button.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng');
    if (window.Morphicons) {
      window.Morphicons.morphElement('#mobileMenuPath', open ? 'X' : 'Menu', 'bouncy');
    }
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!panel.contains(event.target) && !button.contains(event.target)) setOpen(false);
  });

  // Newsletter feedback across all blog pages
  [
    { btnId: 'btnBlogNewsletter', inputId: 'blogNewsletterInput' },
    { btnId: 'btnArticleNewsletter', inputId: 'articleNewsletterInput' }
  ].forEach(({ btnId, inputId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (btn && input) {
      btn.addEventListener('click', () => {
        const email = input.value.trim();
        if (email && email.includes('@')) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<span>Đã Đăng Ký ✓</span>';
          btn.style.backgroundColor = '#bfee1a';
          input.value = '';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.backgroundColor = '';
          }, 3500);
        } else {
          alert('Vui lòng nhập địa chỉ email hợp lệ!');
        }
      });
    }
  });
})();
