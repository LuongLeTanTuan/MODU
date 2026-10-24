/* ===================================================================
   MODU PAGE 2 + PAGE 3 / INTERACTIVE 3D PRODUCT FLOW
   Keeps the existing Page 1 experience isolated and intact.
   =================================================================== */

(() => {
  'use strict';

  const COLORS = {
    mint:  { body: '#B7DCCF', polymer: '#9EC5B6', name: 'Sage Mint', image: 'assets/bottle-mint.png' },
    white: { body: '#F4F0EA', polymer: '#DDD8D0', name: 'Cloud White', image: 'assets/bottle-white.png' },
    pink:  { body: '#F4B8B4', polymer: '#DFA7A4', name: 'Blush Pink', image: 'assets/bottle-pink.png' },
    blue:  { body: '#82B9D2', polymer: '#6EA6BF', name: 'Sky Blue', image: 'assets/bottle-blue.png' },
    black: { body: '#33373B', polymer: '#272B2E', name: 'Obsidian', image: 'assets/bottle-black.png' }
  };

  const HANDLES = {
    mint:  { color: '#9EC5B6', name: 'Mint Loop' },
    white: { color: '#F4F0EA', name: 'Cloud White' },
    pink:  { color: '#F4B8B4', name: 'Blush Pink' },
    blue:  { color: '#82B9D2', name: 'Sky Blue' },
    black: { color: '#33373B', name: 'Obsidian' }
  };

  const FONTS = {
    modern:    { name: 'Modern', canvas: '700 86px "Be Vietnam Pro", Arial, sans-serif' },
    script:    { name: 'Script', canvas: 'italic 84px Georgia, serif' },
    editorial: { name: 'Editorial', canvas: '600 82px "Times New Roman", serif' },
    mono:      { name: 'Mono', canvas: '700 78px "Courier New", monospace' }
  };

  const CHARMS = {
    none:   { name: 'No charm', src: null },
    bear:   { name: 'Butter Bear', src: 'charm/charm-bear.png' },
    bow:    { name: 'Coquette Bow', src: 'charm/charm-bow.png' },
    clover: { name: 'Lucky Clover', src: 'charm/charm-clover.png' },
    heart:  { name: 'Cyber Heart', src: 'charm/charm-heart.png' }
  };

  const state = {
    color: 'mint',
    handle: 'mint',
    engraving: 'YOUR NAME',
    font: 'modern',
    charm: 'none',
    payment: 'qr',
    price: 459000
  };

  const instances = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  }

  function makeTextTexture(text, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = options.width || 1024;
    canvas.height = options.height || 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.color || '#1F4D44';
    ctx.font = options.font || '700 86px "Be Vietnam Pro", Arial, sans-serif';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + (options.offsetY || 0), canvas.width * 0.9);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }

  function replaceMaterialMap(material, texture) {
    if (material.map && material.map !== texture) material.map.dispose();
    material.map = texture;
    material.needsUpdate = true;
  }

  function buildBottle() {
    const root = new THREE.Group();
    root.name = 'MODU Bottle / Page Flow';

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.mint.body,
      roughness: 0.66,
      metalness: 0.04,
      clearcoat: 0.14,
      clearcoatRoughness: 0.6
    });

    const bodyPolymerMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.mint.polymer,
      roughness: 0.42,
      metalness: 0.0,
      clearcoat: 0.14,
      clearcoatRoughness: 0.52
    });

    const handleMaterial = new THREE.MeshPhysicalMaterial({
      color: HANDLES.mint.color,
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
    root.add(body);

    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.435, 0.012, 10, 72),
      bodyPolymerMaterial
    );
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.395;
    root.add(baseRing);

    const neckCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.385, 0.39, 0.14, 72, 1),
      bodyPolymerMaterial
    );
    neckCollar.position.y = 1.115;
    root.add(neckCollar);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.405, 0.405, 0.34, 96, 1),
      steelMaterial
    );
    lid.position.y = 1.33;
    root.add(lid);

    const lidTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.397, 0.397, 0.026, 96, 1),
      steelMaterial
    );
    lidTop.position.y = 1.513;
    root.add(lidTop);

    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.392, 0.012, 10, 72),
      darkSeamMaterial
    );
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
      handleMaterial
    );
    handle.name = 'handle-loop';
    root.add(handle);

    [-1, 1].forEach((side) => {
      const bracket = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.075, 0.12, 5, 14),
        handleMaterial
      );
      bracket.position.set(side * 0.43, 1.16, -0.012);
      bracket.rotation.z = side * 0.12;
      root.add(bracket);

      const pivot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.087, 0.087, 0.035, 48),
        steelMaterial
      );
      pivot.rotation.x = Math.PI / 2;
      pivot.position.set(side * 0.446, 1.17, 0.057);
      root.add(pivot);
    });

    const brandMaterial = new THREE.MeshBasicMaterial({
      map: makeTextTexture('MODU', {
        width: 768,
        height: 220,
        color: '#1E403A',
        font: '800 110px "Be Vietnam Pro", Arial, sans-serif'
      }),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const brand = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.135), brandMaterial);
    brand.position.set(0, -1.03, 0.501);
    brand.renderOrder = 4;
    root.add(brand);

    const engravingMaterial = new THREE.MeshBasicMaterial({
      map: makeTextTexture(state.engraving, { color: '#315B53', font: FONTS.modern.canvas }),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const engraving = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.18), engravingMaterial);
    engraving.position.set(0, -0.34, 0.502);
    engraving.renderOrder = 5;
    root.add(engraving);

    const shoulderHighlight = new THREE.Mesh(
      new THREE.TorusGeometry(0.447, 0.004, 6, 72),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.14 })
    );
    shoulderHighlight.rotation.x = Math.PI / 2;
    shoulderHighlight.position.y = 0.91;
    root.add(shoulderHighlight);

    const charmGroup = new THREE.Group();
    charmGroup.position.set(0.505, 1.08, 0.11);
    charmGroup.rotation.z = -0.13;
    charmGroup.visible = false;

    const charmRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.045, 0.009, 8, 28),
      steelMaterial
    );
    charmRing.position.set(0.02, 0.02, 0);
    charmGroup.add(charmRing);

    const charmMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const charmPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.31), charmMaterial);
    charmPlane.position.set(0.035, -0.18, 0.015);
    charmPlane.renderOrder = 8;
    charmGroup.add(charmPlane);
    root.add(charmGroup);

    root.rotation.y = -0.18;
    root.position.y = -0.12;

    return {
      root,
      bodyMaterial,
      bodyPolymerMaterial,
      handleMaterial,
      brandMaterial,
      engravingMaterial,
      charmGroup,
      charmMaterial
    };
  }

  function createBottleScene(canvas, stage, role) {
    if (!window.THREE || !window.WebGLRenderingContext) throw new Error('WebGL unavailable');

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.07;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
    camera.position.set(0, 0.34, 7.3);
    camera.lookAt(0, 0.32, 0);

    scene.add(new THREE.HemisphereLight(0xf8fbff, 0x6f8392, 1.55));

    const key = new THREE.DirectionalLight(0xfff5e8, 3.15);
    key.position.set(-3.4, 5.6, 5.4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xc4e8ff, 1.35);
    fill.position.set(4.1, 2.2, 4.6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xd8fff5, 2.0);
    rim.position.set(2.5, 4.0, -4.4);
    scene.add(rim);

    const model = buildBottle();
    scene.add(model.root);

    const instance = {
      canvas,
      stage,
      role,
      renderer,
      scene,
      camera,
      model,
      dragTarget: 0,
      dragRotation: 0,
      dragging: false,
      lastX: 0,
      resizeObserver: null,
      charmRequest: 0,
      resize() {
        const rect = stage.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      },
      setColor(key) {
        const data = COLORS[key];
        if (!data) return;
        model.bodyMaterial.color.set(data.body);
        model.bodyPolymerMaterial.color.set(data.polymer);
        const textColor = key === 'black' ? '#F3F7F5' : '#315B53';
        const brandColor = key === 'black' ? '#F4F7F5' : '#1E403A';
        replaceMaterialMap(model.brandMaterial, makeTextTexture('MODU', {
          width: 768,
          height: 220,
          color: brandColor,
          font: '800 110px "Be Vietnam Pro", Arial, sans-serif'
        }));
        this.updateEngraving(textColor);
      },
      setHandle(key) {
        const data = HANDLES[key];
        if (data) model.handleMaterial.color.set(data.color);
      },
      updateEngraving(forcedColor) {
        const text = (state.engraving || 'YOUR NAME').trim() || 'YOUR NAME';
        const color = forcedColor || (state.color === 'black' ? '#F3F7F5' : '#315B53');
        const font = (FONTS[state.font] || FONTS.modern).canvas;
        replaceMaterialMap(model.engravingMaterial, makeTextTexture(text.toUpperCase(), {
          color,
          font,
          width: 1152,
          height: 280
        }));
      },
      setCharm(key) {
        const data = CHARMS[key] || CHARMS.none;
        this.charmRequest += 1;
        const requestId = this.charmRequest;
        if (!data.src) {
          model.charmGroup.visible = false;
          if (model.charmMaterial.map) {
            model.charmMaterial.map.dispose();
            model.charmMaterial.map = null;
            model.charmMaterial.needsUpdate = true;
          }
          return;
        }

        const loader = new THREE.TextureLoader();
        loader.load(
          data.src,
          (texture) => {
            if (requestId !== this.charmRequest) {
              texture.dispose();
              return;
            }
            texture.colorSpace = THREE.SRGBColorSpace;
            replaceMaterialMap(model.charmMaterial, texture);
            model.charmGroup.visible = true;
          },
          undefined,
          () => {
            if (requestId === this.charmRequest) model.charmGroup.visible = false;
          }
        );
      },
      render(time) {
        const section = stage.closest('.product-flow-page');
        const rect = section ? section.getBoundingClientRect() : stage.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;

        const center = rect.top + rect.height * 0.5;
        const viewportCenter = window.innerHeight * 0.5;
        const scrollOffset = clamp((viewportCenter - center) / Math.max(window.innerHeight, 1), -1, 1);
        const seconds = time * 0.001;
        const idle = reduceMotion.matches || this.dragging ? 0 : Math.sin(seconds * 0.62 + (role === 'checkout' ? 1.2 : 0)) * 0.028;
        const baseTurn = role === 'checkout' ? 0.08 : -0.2;

        this.dragRotation += (this.dragTarget - this.dragRotation) * 0.09;
        model.root.rotation.y += (baseTurn + this.dragRotation + idle + scrollOffset * 0.22 - model.root.rotation.y) * 0.075;
        model.root.rotation.x += ((0.018 - scrollOffset * 0.045) - model.root.rotation.x) * 0.07;
        model.root.rotation.z += ((role === 'checkout' ? 0.012 : -0.018) + scrollOffset * 0.018 - model.root.rotation.z) * 0.065;
        model.root.position.y += ((-0.12 + scrollOffset * 0.06) - model.root.position.y) * 0.07;

        renderer.render(scene, camera);
      },
      dispose() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        renderer.dispose();
      }
    };

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      instance.dragging = true;
      instance.lastX = event.clientX;
      stage.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!instance.dragging) return;
      const delta = event.clientX - instance.lastX;
      instance.lastX = event.clientX;
      instance.dragTarget += delta * 0.009;
    };
    const stopDrag = (event) => {
      if (!instance.dragging) return;
      instance.dragging = false;
      if (event.pointerId != null && stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);
    stage.addEventListener('pointerleave', (event) => {
      if (event.buttons === 0) stopDrag(event);
    });

    instance.resizeObserver = new ResizeObserver(() => instance.resize());
    instance.resizeObserver.observe(stage);
    instance.resize();
    return instance;
  }

  function updateAllScenes() {
    instances.forEach((instance) => {
      instance.setColor(state.color);
      instance.setHandle(state.handle);
      instance.updateEngraving();
      instance.setCharm(state.charm);
    });
  }

  function syncCheckoutSummary() {
    const color = COLORS[state.color] || COLORS.mint;
    const handle = HANDLES[state.handle] || HANDLES.mint;
    const charm = CHARMS[state.charm] || CHARMS.none;
    const engraving = (state.engraving || '').trim() || 'YOUR NAME';

    const checkoutColor = document.getElementById('checkoutColor');
    const checkoutHandle = document.getElementById('checkoutHandle');
    const checkoutEngraving = document.getElementById('checkoutEngraving');
    const checkoutCharm = document.getElementById('checkoutCharm');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (checkoutColor) checkoutColor.textContent = color.name;
    if (checkoutHandle) checkoutHandle.textContent = handle.name;
    if (checkoutEngraving) checkoutEngraving.textContent = engraving;
    if (checkoutCharm) checkoutCharm.textContent = charm.name;
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(state.price);
  }

  function setColor(key, notify = true) {
    if (!COLORS[key]) return;
    state.color = key;
    const label = document.getElementById('flowColorName');
    if (label) label.textContent = COLORS[key].name;

    document.querySelectorAll('[data-flow-color]').forEach((button) => {
      const active = button.dataset.flowColor === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.flow-3d-fallback').forEach((image) => {
      image.src = COLORS[key].image;
      image.alt = `Bình MODU màu ${COLORS[key].name}`;
    });

    instances.forEach((instance) => instance.setColor(key));
    syncCheckoutSummary();

    if (notify) {
      window.dispatchEvent(new CustomEvent('modu3d:color', {
        detail: { color: key, source: 'product-flow' }
      }));
    }
  }

  function setHandle(key) {
    if (!HANDLES[key]) return;
    state.handle = key;
    const label = document.getElementById('flowHandleName');
    if (label) label.textContent = HANDLES[key].name;

    document.querySelectorAll('[data-flow-handle]').forEach((button) => {
      const active = button.dataset.flowHandle === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    instances.forEach((instance) => instance.setHandle(key));
    syncCheckoutSummary();
  }

  function setFont(key) {
    if (!FONTS[key]) return;
    state.font = key;
    document.querySelectorAll('[data-flow-font]').forEach((button) => {
      button.classList.toggle('active', button.dataset.flowFont === key);
    });
    instances.forEach((instance) => instance.updateEngraving());
  }

  function setCharm(key) {
    if (!CHARMS[key]) return;
    state.charm = key;
    const label = document.getElementById('flowCharmName');
    if (label) label.textContent = CHARMS[key].name;

    document.querySelectorAll('[data-flow-charm]').forEach((button) => {
      const active = button.dataset.flowCharm === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    instances.forEach((instance) => instance.setCharm(key));
    syncCheckoutSummary();
  }

  function bindUI() {
    document.querySelectorAll('[data-flow-color]').forEach((button) => {
      button.addEventListener('click', () => setColor(button.dataset.flowColor, true));
    });

    document.querySelectorAll('[data-flow-handle]').forEach((button) => {
      button.addEventListener('click', () => setHandle(button.dataset.flowHandle));
    });

    document.querySelectorAll('[data-flow-font]').forEach((button) => {
      button.addEventListener('click', () => setFont(button.dataset.flowFont));
    });

    document.querySelectorAll('[data-flow-charm]').forEach((button) => {
      button.addEventListener('click', () => setCharm(button.dataset.flowCharm));
    });

    const engravingInput = document.getElementById('flowEngraveInput');
    if (engravingInput) {
      engravingInput.addEventListener('input', () => {
        state.engraving = engravingInput.value.slice(0, 14);
        instances.forEach((instance) => instance.updateEngraving());
        syncCheckoutSummary();
      });
    }

    const addToCart = document.getElementById('flowAddToCart');
    const checkoutPage = document.getElementById('checkoutPage');
    if (addToCart && checkoutPage) {
      addToCart.addEventListener('click', () => {
        syncCheckoutSummary();
        checkoutPage.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      });
    }

    const backButton = document.getElementById('flowBackToCustomize');
    const personalizePage = document.getElementById('personalizePage');
    if (backButton && personalizePage) {
      backButton.addEventListener('click', () => {
        personalizePage.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      });
    }

    document.querySelectorAll('[data-flow-payment]').forEach((button) => {
      button.addEventListener('click', () => {
        state.payment = button.dataset.flowPayment;
        document.querySelectorAll('[data-flow-payment]').forEach((item) => {
          item.classList.toggle('active', item === button);
        });
      });
    });

    const payButton = document.getElementById('flowPayButton');
    const orderNote = document.getElementById('flowOrderNote');
    if (payButton && orderNote) {
      payButton.addEventListener('click', () => {
        const name = document.getElementById('checkoutName');
        const phone = document.getElementById('checkoutPhone');
        const address = document.getElementById('checkoutAddress');
        const missing = [name, phone, address].filter((input) => input && !input.value.trim());

        [name, phone, address].forEach((input) => input && input.classList.remove('is-invalid'));
        missing.forEach((input) => input.classList.add('is-invalid'));

        if (missing.length) {
          orderNote.textContent = 'Vui lòng nhập đủ thông tin giao hàng để tiếp tục bản demo.';
          orderNote.classList.remove('is-success');
          missing[0].focus();
          return;
        }

        orderNote.textContent = `Đơn demo đã sẵn sàng • ${state.payment.toUpperCase()} • ${formatPrice(state.price)}`;
        orderNote.classList.add('is-success');
        payButton.classList.add('is-complete');
        window.setTimeout(() => payButton.classList.remove('is-complete'), 900);
      });
    }

    window.addEventListener('modu3d:color', (event) => {
      const key = event.detail && event.detail.color;
      if (key && COLORS[key] && key !== state.color) setColor(key, false);
    });
  }

  function bindSectionReveal() {
    const sections = document.querySelectorAll('.product-flow-page');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.18 });

    sections.forEach((section) => observer.observe(section));
  }

  function tick(time) {
    instances.forEach((instance) => instance.render(time));
    animationFrame = window.requestAnimationFrame(tick);
  }

  function initScene(canvasId, stageId, role) {
    const canvas = document.getElementById(canvasId);
    const stage = document.getElementById(stageId);
    if (!canvas || !stage) return;

    try {
      const instance = createBottleScene(canvas, stage, role);
      instances.push(instance);
      stage.classList.add('is-3d-ready');
    } catch (error) {
      stage.classList.add('is-fallback');
      stage.dataset.webglError = error && error.message ? error.message : 'WebGL unavailable';
      console.warn(`[MODU ${role}] 3D fallback:`, error);
    }
  }

  function init() {
    if (!document.getElementById('personalizePage') && !document.getElementById('checkoutPage')) return;

    bindUI();
    bindSectionReveal();
    initScene('personalizeBottleCanvas', 'personalizeBottleStage', 'personalize');
    initScene('checkoutBottleCanvas', 'checkoutBottleStage', 'checkout');
    updateAllScenes();
    syncCheckoutSummary();

    const price = document.getElementById('flowPrice');
    if (price) price.textContent = formatPrice(state.price);

    if (instances.length) animationFrame = window.requestAnimationFrame(tick);

    window.addEventListener('pagehide', () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      instances.forEach((instance) => instance.dispose());
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
