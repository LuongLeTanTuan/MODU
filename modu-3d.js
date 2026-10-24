(function () {
  'use strict';

  const THREE = window.THREE;
  const section = document.getElementById('customize');
  const stage = document.getElementById('modu3dStage');
  const canvas = document.getElementById('moduBottleCanvas');
  if (!section || !stage || !canvas) return;

  const fallback = document.getElementById('modu3dFallback');
  const reviewMapStripped = new URLSearchParams(window.location.search).get('strip') === '1';
  const titleEl = document.getElementById('customize3dTitle');
  const descEl = document.getElementById('modu3dDesc');
  const indexEl = document.getElementById('modu3dStepIndex');
  const labelEl = document.getElementById('modu3dStepLabel');
  const progressEl = document.getElementById('modu3dProgress');
  const colorNameEl = document.getElementById('modu3dColorName');
  const copyEl = section.querySelector('.journey-3d-copy');
  const auraA = section.querySelector('.aura-a');
  const auraB = section.querySelector('.aura-b');
  const orbitA = section.querySelector('.orbit-a');
  const orbitB = section.querySelector('.orbit-b');
  const swatches = Array.from(section.querySelectorAll('[data-modu3d-color]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const COLORS = {
    mint:  { hex: '#B7DCCF', polymer: '#92BEAF', name: 'Xanh Sage', image: 'assets/bottle-mint.png' },
    white: { hex: '#F4F0EA', polymer: '#DCD8D1', name: 'Trắng Mây', image: 'assets/bottle-white.png' },
    pink:  { hex: '#F4B8B4', polymer: '#D99592', name: 'Hồng Blush', image: 'assets/bottle-pink.png' },
    blue:  { hex: '#82B9D2', polymer: '#6598B0', name: 'Xanh Sky', image: 'assets/bottle-blue.png' },
    black: { hex: '#33373B', polymer: '#1F2427', name: 'Đen Obsidian', image: 'assets/bottle-black.png' }
  };

  const CHAPTERS = [
    {
      label: 'FORM',
      title: 'Một dáng bình.<br>Rất nhiều phiên bản của bạn.',
      desc: 'Xoay để ngắm từng góc của MODU. Mỗi chuyển động được giữ nhẹ để hình khối, quai cầm và lớp hoàn thiện matte luôn là tâm điểm.'
    },
    {
      label: 'COLOR',
      title: 'Chọn màu chạm<br>đúng cá tính.',
      desc: 'Năm gam màu được cân để đi cùng outfit mỗi ngày. Chạm vào bảng màu để đổi vật liệu trên mô hình 3D ngay tức thì.'
    },
    {
      label: 'DETAIL',
      title: 'Khắc tên. Gắn charm.<br>Biến MODU thành của riêng bạn.',
      desc: 'Một dòng chữ nhỏ, một charm đúng mood, hay chỉ một màu bạn thích. Những chi tiết vừa đủ để chiếc bình mang dấu ấn riêng.'
    },
    {
      label: 'YOUR MODU',
      title: 'Từ ý tưởng<br>đến chiếc bình của bạn.',
      desc: 'Mở Studio Customizer để chọn form, màu, kiểu khắc và charm. Bản phối của bạn được giữ đồng bộ với lựa chọn màu ở đây.'
    }
  ];

  let renderer;
  let scene;
  let camera;
  let bottleRoot;
  let bodyMaterial;
  let polymerMaterial;
  let labelMaterial;
  let keyLight;
  let rimLight;
  let currentColor = 'mint';
  let scrollProgress = 0;
  let currentStep = 0;
  let dragRotation = 0;
  let targetDragRotation = 0;
  let isDragging = false;
  let lastPointerX = 0;
  let frameId = 0;
  let resizeObserver;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function createSoftShadowTexture() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(28, 43, 35, 0.24)');
    gradient.addColorStop(0.34, 'rgba(28, 43, 35, 0.13)');
    gradient.addColorStop(0.72, 'rgba(28, 43, 35, 0.045)');
    gradient.addColorStop(1, 'rgba(28, 43, 35, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(shadowCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  function mixKeyframes(values, progress) {
    const last = values.length - 1;
    const scaled = clamp(progress, 0, 0.999999) * last;
    const index = Math.floor(scaled);
    const t = smoothstep(scaled - index);
    return lerp(values[index], values[Math.min(index + 1, last)], t);
  }

  function buildBottle() {
    const root = new THREE.Group();
    root.name = 'MODU Bottle / web presentation';

    bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.mint.hex,
      roughness: 0.66,
      metalness: 0.04,
      clearcoat: 0.14,
      clearcoatRoughness: 0.6
    });

    polymerMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.mint.polymer,
      roughness: 0.4,
      metalness: 0.0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.5
    });

    const steelMaterial = new THREE.MeshPhysicalMaterial({
      color: '#BFC1C0',
      roughness: 0.24,
      metalness: 0.92,
      clearcoat: 0.16,
      clearcoatRoughness: 0.3
    });

    const darkSeamMaterial = new THREE.MeshStandardMaterial({
      color: '#1E2525',
      roughness: 0.5,
      metalness: 0.08
    });

    const profile = [
      [0.425, -1.42], [0.468, -1.39], [0.492, -1.31], [0.5, -1.18],
      [0.5, 0.62], [0.495, 0.78], [0.475, 0.9], [0.438, 0.99],
      [0.39, 1.055], [0.368, 1.08]
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const bodyGeometry = new THREE.LatheGeometry(profile, 72);
    bodyGeometry.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.name = 'body-shell';
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.435, 0.012, 10, 72),
      polymerMaterial
    );
    baseRing.name = 'base-ring';
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.395;
    baseRing.castShadow = true;
    root.add(baseRing);

    const neckCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.385, 0.39, 0.14, 72, 1),
      polymerMaterial
    );
    neckCollar.name = 'neck-collar';
    neckCollar.position.y = 1.115;
    neckCollar.castShadow = true;
    root.add(neckCollar);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.405, 0.405, 0.34, 96, 1),
      steelMaterial
    );
    lid.name = 'stainless-lid';
    lid.position.y = 1.33;
    lid.castShadow = true;
    lid.receiveShadow = true;
    root.add(lid);

    const lidTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.397, 0.397, 0.026, 96, 1),
      steelMaterial
    );
    lidTop.position.y = 1.513;
    lidTop.castShadow = true;
    root.add(lidTop);

    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.392, 0.012, 10, 72),
      darkSeamMaterial
    );
    seam.name = 'lid-seam';
    seam.rotation.x = Math.PI / 2;
    seam.position.y = 1.16;
    root.add(seam);

    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.405, 1.17, -0.012),
      new THREE.Vector3(-0.48, 1.39, -0.04),
      new THREE.Vector3(-0.425, 1.67, -0.06),
      new THREE.Vector3(-0.27, 1.84, -0.07),
      new THREE.Vector3(0, 1.9, -0.075),
      new THREE.Vector3(0.27, 1.84, -0.07),
      new THREE.Vector3(0.425, 1.67, -0.06),
      new THREE.Vector3(0.48, 1.39, -0.04),
      new THREE.Vector3(0.405, 1.17, -0.012)
    ]);
    const handle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 96, 0.074, 16, false),
      polymerMaterial
    );
    handle.name = 'handle-loop';
    handle.castShadow = true;
    root.add(handle);

    [-1, 1].forEach((side) => {
      const bracket = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.12, 5, 14), polymerMaterial);
      bracket.name = side < 0 ? 'anchor-left' : 'anchor-right';
      bracket.position.set(side * 0.43, 1.16, -0.012);
      bracket.rotation.z = side * 0.12;
      bracket.castShadow = true;
      root.add(bracket);

      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.035, 48), steelMaterial);
      pivot.name = side < 0 ? 'pivot-left' : 'pivot-right';
      pivot.rotation.x = Math.PI / 2;
      pivot.position.set(side * 0.446, 1.17, 0.057);
      pivot.castShadow = true;
      root.add(pivot);
    });

    if (!reviewMapStripped) {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 160;
      const context = labelCanvas.getContext('2d');
      context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      context.fillStyle = 'rgba(28,64,58,0.94)';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '700 78px Arial, sans-serif';
      context.letterSpacing = '8px';
      context.fillText('MODU', labelCanvas.width / 2, labelCanvas.height / 2 + 3);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      labelTexture.anisotropy = 4;
      labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.135), labelMaterial);
      label.name = 'brand-mark';
      label.position.set(0, -1.03, 0.501);
      label.renderOrder = 5;
      root.add(label);
    }

    const shoulderHighlight = new THREE.Mesh(
      new THREE.TorusGeometry(0.447, 0.004, 6, 72),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.16 })
    );
    shoulderHighlight.rotation.x = Math.PI / 2;
    shoulderHighlight.position.y = 0.91;
    root.add(shoulderHighlight);

    root.rotation.y = -0.18;
    root.position.y = -0.12;
    return root;
  }

  function initThree() {
    if (!THREE || !window.WebGLRenderingContext) throw new Error('WebGL unavailable');

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
    camera.position.set(0, 0.42, 8.05);
    camera.lookAt(0, 0.42, 0);

    scene.add(new THREE.HemisphereLight(0xf7f3ea, 0x748078, 1.45));

    keyLight = new THREE.DirectionalLight(0xfff2df, 3.25);
    keyLight.position.set(-3.8, 5.8, 5.2);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fill = new THREE.DirectionalLight(0xbcd8e2, 1.2);
    fill.position.set(4.2, 2.4, 4.4);
    scene.add(fill);

    rimLight = new THREE.DirectionalLight(0xd6fff0, 2.15);
    rimLight.position.set(2.4, 4.4, -4.2);
    scene.add(rimLight);

    const warmBounce = new THREE.PointLight(0xffd9bf, 9.5, 8, 2);
    warmBounce.position.set(-2.2, -1.3, 2.2);
    scene.add(warmBounce);

    bottleRoot = buildBottle();
    scene.add(bottleRoot);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      reviewMapStripped
        ? new THREE.MeshBasicMaterial({ color: '#8f948f', transparent: true, depthWrite: false, opacity: 0.12, toneMapped: false })
        : new THREE.MeshBasicMaterial({
            map: createSoftShadowTexture(),
            transparent: true,
            depthWrite: false,
            opacity: 0.72,
            toneMapped: false
          })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.34;
    shadow.position.z = 0.08;
    shadow.scale.set(1.0, 0.34, 1);
    scene.add(shadow);

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
  }

  function resize() {
    if (!renderer || !camera) return;
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateChapter(step) {
    if (step === currentStep && titleEl.dataset.ready === '1') return;
    currentStep = step;
    const chapter = CHAPTERS[step];
    if (!chapter) return;

    copyEl.classList.add('is-switching');
    window.setTimeout(() => {
      indexEl.textContent = String(step + 1).padStart(2, '0');
      labelEl.textContent = chapter.label;
      titleEl.innerHTML = chapter.title;
      descEl.textContent = chapter.desc;
      titleEl.dataset.ready = '1';
      copyEl.classList.remove('is-switching');
    }, reduceMotion.matches ? 0 : 110);
  }

  function setColor(colorKey, notify) {
    const data = COLORS[colorKey];
    if (!data) return;
    currentColor = colorKey;

    if (bodyMaterial) bodyMaterial.color.set(data.hex);
    if (polymerMaterial) polymerMaterial.color.set(data.polymer);
    if (colorNameEl) colorNameEl.textContent = data.name;
    if (fallback) {
      fallback.src = data.image;
      fallback.alt = `Bình MODU màu ${data.name}`;
    }

    swatches.forEach((button) => {
      const active = button.dataset.modu3dColor === colorKey;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    section.style.setProperty('--journey-accent', data.hex);

    if (notify) {
      window.dispatchEvent(new CustomEvent('modu3d:color', { detail: { color: colorKey } }));
    }
  }

  function updateScroll() {
    if (reduceMotion.matches) {
      scrollProgress = 0;
      if (progressEl) progressEl.style.transform = 'scaleX(1)';
      updateChapter(0);
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
    scrollProgress = clamp(-rect.top / scrollable, 0, 1);
    const step = Math.min(3, Math.floor(clamp(scrollProgress * 4 + 0.035, 0, 3.999)));
    updateChapter(step);

    if (progressEl) progressEl.style.transform = `scaleX(${scrollProgress})`;

    const orbitTurn = scrollProgress * 180;
    if (orbitA) orbitA.style.transform = `translate(-50%, -50%) rotate(${orbitTurn - 12}deg) scale(${1 + scrollProgress * 0.08})`;
    if (orbitB) orbitB.style.transform = `translate(-50%, -50%) rotate(${-orbitTurn * 0.75 + 16}deg) scale(${1.04 - scrollProgress * 0.06})`;
    if (auraA) auraA.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(scrollProgress * Math.PI) * 0.12})`;
    if (auraB) auraB.style.transform = `translate(-42%, -46%) scale(${0.82 + scrollProgress * 0.18})`;
  }

  function bindInteractions() {
    swatches.forEach((button) => {
      button.addEventListener('click', () => setColor(button.dataset.modu3dColor, true));
    });

    stage.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      isDragging = true;
      lastPointerX = event.clientX;
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      const delta = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      targetDragRotation += delta * 0.009;
    });

    function stopDrag(event) {
      if (!isDragging) return;
      isDragging = false;
      if (event.pointerId != null && stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    }
    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);
    stage.addEventListener('pointerleave', (event) => { if (event.buttons === 0) stopDrag(event); });

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    reduceMotion.addEventListener('change', updateScroll);
  }

  function animate(time) {
    if (!renderer || !scene || !camera || !bottleRoot) return;
    const seconds = time * 0.001;
    const p = scrollProgress;

    const rotationY = mixKeyframes([-0.2, 0.72, 1.95, 3.2, 6.18], p);
    const rotationX = mixKeyframes([0.025, -0.035, 0.07, -0.02, 0.02], p);
    const scale = mixKeyframes([1.0, 1.04, 1.11, 1.03, 1.0], p);
    const y = mixKeyframes([-0.12, -0.03, 0.06, -0.04, -0.12], p);
    const x = mixKeyframes([0.02, -0.04, 0.08, -0.03, 0.02], p);

    dragRotation += (targetDragRotation - dragRotation) * 0.09;
    const idle = reduceMotion.matches || isDragging ? 0 : Math.sin(seconds * 0.72) * 0.025;

    bottleRoot.rotation.y += (rotationY + dragRotation + idle - bottleRoot.rotation.y) * 0.075;
    bottleRoot.rotation.x += (rotationX - bottleRoot.rotation.x) * 0.065;
    bottleRoot.scale.x += (scale - bottleRoot.scale.x) * 0.07;
    bottleRoot.scale.y += (scale - bottleRoot.scale.y) * 0.07;
    bottleRoot.scale.z += (scale - bottleRoot.scale.z) * 0.07;
    bottleRoot.position.x += (x - bottleRoot.position.x) * 0.07;
    bottleRoot.position.y += (y - bottleRoot.position.y) * 0.07;

    keyLight.position.x = -3.8 + Math.sin(p * Math.PI * 1.4) * 1.4;
    rimLight.position.x = 2.4 - p * 1.3;
    rimLight.intensity = 1.9 + Math.sin(p * Math.PI) * 0.75;

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  window.addEventListener('modu3d:color', (event) => {
    const colorKey = event.detail && event.detail.color;
    if (colorKey && COLORS[colorKey] && colorKey !== currentColor) {
      setColor(colorKey, false);
    }
  });

  function showFallback(error) {
    stage.classList.add('is-fallback');
    stage.dataset.webglError = error && error.message ? error.message : 'WebGL unavailable';
    if (fallback) fallback.style.display = 'block';
  }

  try {
    initThree();
    bindInteractions();
    setColor('mint', false);
    updateChapter(0);
    updateScroll();
    frameId = window.requestAnimationFrame(animate);
  } catch (error) {
    console.warn('[MODU 3D] Falling back to product image:', error);
    bindInteractions();
    setColor('mint', false);
    updateChapter(0);
    updateScroll();
    showFallback(error);
  }

  window.addEventListener('pagehide', () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    if (resizeObserver) resizeObserver.disconnect();
    if (renderer) renderer.dispose();
  }, { once: true });
})();

