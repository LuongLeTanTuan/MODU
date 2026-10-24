/**
 * MODU Blog Comment System & Persistent Database Engine
 * Powered by IndexedDB with synchronized LocalStorage mirror.
 */

(function () {
  'use strict';

  const DB_NAME = 'ModuBlogCommentDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'comments';
  const LS_KEY = 'modu_blog_comments_store_v1';

  // Realistic seed comments answering customer questions for each article
  const SEED_COMMENTS = {
    'binh-giu-nhiet-modu-theo-yeu-cau': [
      {
        id: 'seed-1-1',
        name: 'Ngọc Mai',
        email: 'ngocmai.design@gmail.com',
        content: 'Bình 500ml và 750ml thì mẫu nào vừa khay để cốc trên ô tô vậy shop? Mình muốn đặt một chiếc màu xanh bạc hà mang đi làm.',
        createdAt: '2026-09-28T09:15:00Z',
        isAdmin: false
      },
      {
        id: 'seed-1-2',
        name: 'MODU Support Team',
        email: 'hello@modubottles.com',
        content: 'Chào bạn Mai! Cả 2 phiên bản 500ml và 750ml của MODU đều được vát đáy thon gọn theo tiêu chuẩn đường kính 7.2cm, vừa vặn hoàn hảo với 99% hộc để cốc trên ô tô và ngăn hông balo nhé ạ!',
        createdAt: '2026-09-28T09:40:00Z',
        isAdmin: true
      },
      {
        id: 'seed-1-3',
        name: 'Hoàng Long',
        email: 'longhoang.tech@gmail.com',
        content: 'Khâu tự custom trên web mượt và trực quan thật sự, phối màu nắp tự đồng bộ theo thân nhìn rất tối giản và sang.',
        createdAt: '2026-10-01T14:20:00Z',
        isAdmin: false
      }
    ],
    'binh-giu-nhiet-khac-ten-theo-yeu-cau': [
      {
        id: 'seed-2-1',
        name: 'Thanh Thảo',
        email: 'thao.thanh99@gmail.com',
        content: 'Font Brittany Signature nhìn xinh xỉu! Cho mình hỏi tên có dấu tiếng Việt như "Nguyễn Thảo" lên bình có bị lỗi font không shop?',
        createdAt: '2026-09-25T11:00:00Z',
        isAdmin: false
      },
      {
        id: 'seed-2-2',
        name: 'MODU Master Engraver',
        email: 'engraving@modubottles.com',
        content: 'Chào Thảo! MODU đã tinh chỉnh bộ ký tự Brittany Signature với độ cong +4% ôm nhẹ theo thân bình và hỗ trợ đầy đủ 100% dấu tiếng Việt chuẩn thẩm mỹ. Bạn gõ tên có dấu trong Studio là xem được bản khắc mô phỏng ngay nhé!',
        createdAt: '2026-09-25T11:25:00Z',
        isAdmin: true
      },
      {
        id: 'seed-2-3',
        name: 'Bảo Anh',
        email: 'baoanh.vlog@gmail.com',
        content: 'Nét trái tim riêng ở dưới tên nhìn tinh tế hơn hẳn việc chèn icon emoji thông thường. Bố cục rộng tầm 35-40% thân bình vừa vặn, không bị to thô.',
        createdAt: '2026-10-02T16:30:00Z',
        isAdmin: false
      }
    ],
    'set-qua-tang-binh-giu-nhiet-ca-nhan-hoa-inox-316': [
      {
        id: 'seed-3-1',
        name: 'Khánh Linh',
        email: 'linhkhanh.hn@gmail.com',
        content: 'Set quà sinh nhật có kèm thiệp viết tay theo yêu cầu không bạn? Mình muốn gửi tặng bạn thân ở xa.',
        createdAt: '2026-09-20T10:10:00Z',
        isAdmin: false
      },
      {
        id: 'seed-3-2',
        name: 'MODU Gifting Team',
        email: 'gift@modubottles.com',
        content: 'Chào Khánh Linh! MODU luôn gửi kèm hộp quà cứng nam châm cao cấp, giấy rơm lót lụa và thiệp viết tay ép kim vàng. Bạn chỉ cần ghi chú lời chúc khi đặt hàng, đội ngũ MODU sẽ nắn nót viết thay bạn nhé!',
        createdAt: '2026-09-20T10:35:00Z',
        isAdmin: true
      }
    ],
    'bat-trend-decor-binh-giu-nhiet-voi-tui-mu-charm-modu': [
      {
        id: 'seed-4-1',
        name: 'Phương Uyên',
        email: 'uyen.phuong@gmail.com',
        content: 'Mình khui được charm Secret Diamond lấp lánh cực xinh! Treo lên quai bình đi học ai cũng hỏi mua ở đâu luôn.',
        createdAt: '2026-09-22T13:45:00Z',
        isAdmin: false
      },
      {
        id: 'seed-4-2',
        name: 'Đức Huy',
        email: 'duchuy.97@gmail.com',
        content: 'Charm có bị gỉ sét khi rửa bình không shop? Có tháo rời ra được không?',
        createdAt: '2026-09-29T15:10:00Z',
        isAdmin: false
      },
      {
        id: 'seed-4-3',
        name: 'MODU Support Team',
        email: 'hello@modubottles.com',
        content: 'Chào Đức Huy! Khóa charm là dạng móc càng cua hợp kim cao cấp chống oxy hóa. Tuy nhiên khi vệ sinh bình, bạn nên tháo charm ra bằng một thao tác bấm nhẹ để phụ kiện luôn sáng bóng như mới nhé!',
        createdAt: '2026-09-29T15:30:00Z',
        isAdmin: true
      }
    ],
    'inox-316-la-gi-so-sanh-inox-316-va-304': [
      {
        id: 'seed-5-1',
        name: 'Bác sĩ Minh Đức',
        email: 'dr.minhduc@gmail.com',
        content: 'Đúng là inox 316 có 2-3% Molybdenum kháng rỗ bề mặt clo và axit hữu cơ tốt hơn hẳn inox 304 thường. Dùng đựng nước ấm uống thuốc hay nước ép lâu dài an tâm tuyệt đối.',
        createdAt: '2026-09-18T08:20:00Z',
        isAdmin: false
      },
      {
        id: 'seed-5-2',
        name: 'Thúy Hằng',
        email: 'thuyhang.hr@gmail.com',
        content: 'Bình có khắc chữ inox 316 dưới đáy ruột bình không shop ơi?',
        createdAt: '2026-09-27T17:05:00Z',
        isAdmin: false
      },
      {
        id: 'seed-5-3',
        name: 'MODU QC Lab',
        email: 'qc@modubottles.com',
        content: 'Chào Thúy Hằng! Mọi sản phẩm bình giữ nhiệt MODU đều được dập chìm ký hiệu chuẩn y tế SUS 316 trực tiếp tại đáy lòng bình để khách hàng dễ dàng kiểm chứng chất lượng ạ.',
        createdAt: '2026-09-27T17:25:00Z',
        isAdmin: true
      }
    ],
    'cach-ve-sinh-va-khu-mui-binh-giu-nhiet': [
      {
        id: 'seed-6-1',
        name: 'Lan Hương',
        email: 'lanhuong.ktt@gmail.com',
        content: 'Mình vừa áp dụng mẹo ngâm baking soda với chanh theo bài viết, bình mới khui hộp thơm tho sạch bong kin kít luôn!',
        createdAt: '2026-09-24T19:30:00Z',
        isAdmin: false
      },
      {
        id: 'seed-6-2',
        name: 'Quang Minh',
        email: 'minh.quang92@gmail.com',
        content: 'Gioăng cao su ở nắp bình có tháo ra rửa riêng được không shop?',
        createdAt: '2026-10-01T09:12:00Z',
        isAdmin: false
      },
      {
        id: 'seed-6-3',
        name: 'MODU Support Team',
        email: 'hello@modubottles.com',
        content: 'Chào Quang Minh! Gioăng silicone của MODU có rãnh gờ thông minh, bạn có thể dùng đầu tăm hoặc thìa nhỏ khều nhẹ để tháo ra vệ sinh rồi lắp lại khít 100% chống rò rỉ nhé!',
        createdAt: '2026-10-01T09:30:00Z',
        isAdmin: true
      }
    ],
    'binh-giu-nhiet-giu-nong-lanh-duoc-bao-lau': [
      {
        id: 'seed-7-1',
        name: 'Tuấn Khải',
        email: 'khai.tuan@gmail.com',
        content: 'Test thực tế hôm qua: bỏ đá bi vào lúc 8h sáng mang đi dã ngoại, đến 20h tối mở ra đá vẫn còn hơn nửa bình. Khả năng giữ nhiệt 24 giờ đỉnh thật sự.',
        createdAt: '2026-09-26T21:00:00Z',
        isAdmin: false
      },
      {
        id: 'seed-7-2',
        name: 'Thanh Nhã',
        email: 'nha.thanh@gmail.com',
        content: 'Đựng nước nóng 80-90 độ thì thân bình bên ngoài có bị nóng tay không bạn?',
        createdAt: '2026-10-02T14:15:00Z',
        isAdmin: false
      },
      {
        id: 'seed-7-3',
        name: 'MODU Technical Team',
        email: 'tech@modubottles.com',
        content: 'Chào Thanh Nhã! Nhờ kết cấu chân không 2 lớp phủ đồng phản xạ nhiệt, lớp vỏ ngoài hoàn toàn cách nhiệt với bên trong. Bạn đựng nước sôi 100 độ thì cầm bên ngoài vẫn mát rượi và không bao giờ bị đọng mồ hôi nước nhé!',
        createdAt: '2026-10-02T14:35:00Z',
        isAdmin: true
      }
    ],
    'co-nen-dung-binh-giu-nhiet-dung-ca-phe-nuoc-cam': [
      {
        id: 'seed-8-1',
        name: 'Hữu Phước',
        email: 'phuoc.huu.arch@gmail.com',
        content: 'Mình nghiện cà phê muối đá, đựng trong bình MODU mang đến văn phòng uống từ sáng tới chiều vẫn chuẩn vị thơm béo, không hề bị ám mùi khét kim loại.',
        createdAt: '2026-09-23T11:40:00Z',
        isAdmin: false
      },
      {
        id: 'seed-8-2',
        name: 'Mỹ Duyên',
        email: 'duyen.my@gmail.com',
        content: 'Đựng nước cam vắt để cả buổi có sợ bị đắng hay biến chất không shop?',
        createdAt: '2026-09-30T10:20:00Z',
        isAdmin: false
      },
      {
        id: 'seed-8-3',
        name: 'MODU Lab Nutritionist',
        email: 'nutrition@modubottles.com',
        content: 'Chào Mỹ Duyên! Nước cam giữ lạnh trong lòng bình inox 316 kín khí sẽ giữ trọn vẹn Vitamin C và độ tươi ngon. Tuy nhiên bạn nên uống hết trong vòng 6-8 tiếng và tránh để qua đêm để hương vị ngon nhất nhé!',
        createdAt: '2026-09-30T10:45:00Z',
        isAdmin: true
      }
    ],
    'qua-tang-doanh-nghiep-binh-giu-nhiet-in-logo': [
      {
        id: 'seed-9-1',
        name: 'Anh Vũ (CEO TechNova)',
        email: 'vu.hoang@technova.vn',
        content: 'Công ty mình vừa đặt 120 bình MODU đen nhám và trắng kem khắc logo doanh nghiệp kèm tên từng nhân viên cho dịp Year End Party. Các bạn làm rất chỉn chu, laser sắc nét từng chi tiết nhỏ!',
        createdAt: '2026-09-21T16:15:00Z',
        isAdmin: false
      },
      {
        id: 'seed-9-2',
        name: 'Ngọc Diệp',
        email: 'diep.nguyen@vinatex.com',
        content: 'Đơn vị mình cần làm mẫu thử 2 chiếc trước khi đặt số lượng lớn 500 cái thì liên hệ quy trình thế nào vậy MODU?',
        createdAt: '2026-10-03T08:50:00Z',
        isAdmin: false
      },
      {
        id: 'seed-9-3',
        name: 'MODU Corporate Sales',
        email: 'b2b@modubottles.com',
        content: 'Chào chị Diệp! Đội ngũ B2B của MODU sẽ hỗ trợ dựng bản vẽ 3D mockup miễn phí trong 2 giờ và gia công gửi mẫu thực tế tận nơi trong 24-48 giờ ạ. Bạn check email hoặc hotline 1900-MODU để bên em hỗ trợ ngay nhé!',
        createdAt: '2026-10-03T09:10:00Z',
        isAdmin: true
      }
    ],
    'cach-bao-quan-lop-son-va-chu-khac-laser': [
      {
        id: 'seed-10-1',
        name: 'Kim Ngân',
        email: 'ngan.kim@gmail.com',
        content: 'Lớp sơn tĩnh điện mịn như nhung của MODU cầm thích tay dã man. Dùng cả tháng nay nhét balo chung chìa khóa mà không thấy trầy xước gì!',
        createdAt: '2026-09-25T14:30:00Z',
        isAdmin: false
      },
      {
        id: 'seed-10-2',
        name: 'Trọng Nghĩa',
        email: 'nghia.trong@gmail.com',
        content: 'Bình này có cho vào máy rửa bát được không bạn ơi?',
        createdAt: '2026-10-02T18:00:00Z',
        isAdmin: false
      },
      {
        id: 'seed-10-3',
        name: 'MODU Care Team',
        email: 'care@modubottles.com',
        content: 'Chào Trọng Nghĩa! Để lớp sơn pastel nhám mịn và độ sáng của nét khắc laser bền bỉ qua nhiều năm, MODU khuyên bạn nên rửa tay bằng bọt biển hoặc cọ mềm nhé. Nhiệt độ sấy khô quá cao của máy rửa bát có thể làm giảm tuổi thọ lớp sơn ạ.',
        createdAt: '2026-10-02T18:20:00Z',
        isAdmin: true
      }
    ]
  };

  // Helper: Open or create IndexedDB
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_slug', 'postSlug', { unique: false });
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => resolve(null); // fallback gracefully
    });
  }

  // Helper: Read all comments for a postSlug
  async function getCommentsForSlug(db, slug) {
    let list = [];

    // 1. Try IndexedDB
    if (db) {
      try {
        list = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const index = store.index('by_slug');
          const req = index.getAll(slug);
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      } catch (err) {
        list = [];
      }
    }

    // 2. Fallback / Merge with LocalStorage
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const allLs = JSON.parse(raw);
        const lsForSlug = allLs[slug] || [];
        const existingIds = new Set(list.map((c) => c.id));
        for (const c of lsForSlug) {
          if (!existingIds.has(c.id)) {
            list.push(c);
          }
        }
      }
    } catch (e) {}

    // 3. If still empty, load seed comments and persist them
    if (!list || list.length === 0) {
      const seeds = SEED_COMMENTS[slug] || [];
      for (const s of seeds) {
        const commentObj = {
          ...s,
          postSlug: slug
        };
        await saveCommentToDB(db, commentObj);
        list.push(commentObj);
      }
    }

    // Sort by createdAt ascending
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return list;
  }

  // Helper: Save single comment
  async function saveCommentToDB(db, comment) {
    // 1. IndexedDB
    if (db) {
      try {
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(comment);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        });
      } catch (e) {}
    }

    // 2. LocalStorage
    try {
      let raw = localStorage.getItem(LS_KEY);
      let data = raw ? JSON.parse(raw) : {};
      if (!data[comment.postSlug]) data[comment.postSlug] = [];
      // avoid duplicates
      if (!data[comment.postSlug].some((c) => c.id === comment.id)) {
        data[comment.postSlug].push(comment);
      }
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  // Format relative or friendly date
  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } catch (e) {
      return 'Vừa xong';
    }
  }

  // Generate color palette based on name
  function getAvatarColor(name) {
    const colors = [
      '#617B78', '#5b8a72', '#215375', '#3d7280', '#56706b',
      '#47697a', '#3f685c', '#2c5966', '#4a7566'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Render a comment card HTML
  function renderCommentItem(comment) {
    const initial = (comment.name || 'U').charAt(0).toUpperCase();
    const bgColor = comment.isAdmin ? '#215375' : getAvatarColor(comment.name);
    const dateFormatted = formatDate(comment.createdAt);

    return `
      <div class="comment-item ${comment.isAdmin ? 'is-admin-reply' : ''}" id="comment-${comment.id}">
        <div class="comment-avatar" style="background-color: ${bgColor}">
          ${comment.isAdmin ? '★' : initial}
        </div>
        <div class="comment-body">
          <div class="comment-meta-row">
            <span class="comment-author-name">${escapeHTML(comment.name)}</span>
            ${comment.isAdmin ? '<span class="admin-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Quản trị viên MODU</span>' : '<span class="verified-buyer-badge">Khách hàng quan tâm</span>'}
            <time class="comment-time" datetime="${comment.createdAt}">${dateFormatted}</time>
          </div>
          <div class="comment-content-text">
            ${escapeHTML(comment.content)}
          </div>
        </div>
      </div>
    `;
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Show Toast Message
  function showCommentToast(msg) {
    let toast = document.getElementById('commentToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'commentToast';
      toast.className = 'comment-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${msg}</span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Main Initialize function
  async function initComments() {
    const section = document.getElementById('commentsSection');
    if (!section) return;

    const slug = section.dataset.slug;
    if (!slug) return;

    const db = await openDatabase();
    const listEl = document.getElementById('commentsList');
    const badgeEl = section.querySelector('.comment-count-badge');
    const form = document.getElementById('blogCommentForm');
    const nameInput = document.getElementById('commentAuthorName');
    const emailInput = document.getElementById('commentAuthorEmail');
    const contentInput = document.getElementById('commentAuthorText');

    // Load and render initial comments
    const comments = await getCommentsForSlug(db, slug);
    if (badgeEl) badgeEl.textContent = comments.length;

    if (listEl) {
      if (comments.length === 0) {
        listEl.innerHTML = '<div class="no-comments-yet">Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!</div>';
      } else {
        listEl.innerHTML = comments.map(renderCommentItem).join('');
      }
    }

    // Form submit handler
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = (nameInput.value || '').trim();
        const email = (emailInput.value || '').trim();
        const content = (contentInput.value || '').trim();

        if (name.length < 2) {
          alert('Vui lòng nhập họ và tên của bạn (tối thiểu 2 ký tự).');
          nameInput.focus();
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Vui lòng nhập địa chỉ Gmail hoặc Email hợp lệ để nhận phản hồi từ MODU.');
          emailInput.focus();
          return;
        }

        if (content.length < 3) {
          alert('Vui lòng nhập nội dung bình luận hoặc thắc mắc của bạn.');
          contentInput.focus();
          return;
        }

        const submitBtn = document.getElementById('btnSubmitComment');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('loading');
        }

        const newComment = {
          id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          postSlug: slug,
          name: name,
          email: email,
          content: content,
          createdAt: new Date().toISOString(),
          isAdmin: false
        };

        // Save to DB
        await saveCommentToDB(db, newComment);

        // Append to list
        if (listEl) {
          const emptyPlaceholder = listEl.querySelector('.no-comments-yet');
          if (emptyPlaceholder) emptyPlaceholder.remove();

          const temp = document.createElement('div');
          temp.innerHTML = renderCommentItem(newComment);
          const newEl = temp.firstElementChild;
          newEl.classList.add('new-comment-highlight');
          listEl.appendChild(newEl);

          // Scroll smoothly to the new comment
          setTimeout(() => {
            newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);
        }

        // Update count badge
        if (badgeEl) {
          const currentCount = parseInt(badgeEl.textContent || '0', 10);
          badgeEl.textContent = currentCount + 1;
        }

        // Reset form
        contentInput.value = '';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }

        showCommentToast('Cảm ơn ' + name + '! Bình luận đã được lưu vào cơ sở dữ liệu thành công.');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComments);
  } else {
    initComments();
  }
})();
