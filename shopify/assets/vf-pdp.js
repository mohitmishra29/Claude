/*
  Vettofit PDP · v1.0 · vanilla JS, loaded with `defer`. No dependencies.

  One instance per [data-vf-pdp] root. Event model (replaces NM v6.1's click + pointerup +
  touchend + document-capture shields, which could add an item twice):
    - Add to cart  → the form's `submit` event (button click, Enter key, sticky button → requestSubmit)
    - Buy now      → one `click` listener
    - every action → a single in-flight lock (this.busy)
  `click` already fires once for mouse, touch, pen and keyboard, so nothing else is needed.
*/
(() => {
  'use strict';

  if (window.VfPdp) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  const mqFine = window.matchMedia('(pointer: fine)');
  const scrollBehavior = () => (mqReduce.matches ? 'auto' : 'smooth');
  const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1200));

  const parseJSON = (el) => {
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (err) {
      console.warn('[vf-pdp] invalid JSON payload', err);
      return null;
    }
  };

  class VfPdp {
    constructor(root) {
      this.root = root;
      this.data = parseJSON($('[data-vf-data]', root));
      if (!this.data) return;
      this.labels = this.data.labels || {};
      this.variants = parseJSON($('[data-vf-variants]', root)) || [];
      this.form = $('[data-vf-form]', root);
      this.idField = $('[data-vf-id]', root);
      this.planInput = $('[data-vf-selling-plan]', root);
      this.planSelect = $('[data-vf-plan-select]', root);
      this.qtyInput = $('[data-vf-qty-input]', root);
      this.live = $('[data-vf-live]', root);
      this.busy = false;
      this.inCart = new Map();
      this.cartFetchedAt = 0;
      this.calc = () => {};

      const initialId = Number(this.idField ? this.idField.value : 0);
      this.variant = this.variants.find((v) => v.id === initialId) || this.variants[0] || null;

      this.initGallery();
      this.initLightbox();
      this.initOptions();
      this.initQty();
      this.initActions();
      this.initSticky();
      this.initStickyBuyBox();
      this.initFaq();
      this.initDose();
      this.initPincode();
      this.initPairs();
      this.initCartSync();

      this.update();
      if (this.variant) this.track('view_item', this.ecommerce(this.variant, this.qty()));
    }

    /* ── Gallery ─────────────────────────────────────────────────────── */
    initGallery() {
      const g = $('[data-vf-gallery]', this.root);
      if (!g) return;
      this.track_ = $('[data-vf-track]', g);
      this.slides = $$('[data-vf-slide]', g);
      this.thumbs = $$('[data-vf-thumb]', g);
      this.thumbList = $('[data-vf-thumbs]', g);
      this.dots = $$('[data-vf-dot]', g);
      this.counter = $('[data-vf-counter]', g);
      this.index = 0;
      if (!this.track_ || this.slides.length < 2) return;

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting && en.intersectionRatio >= 0.6) this.setActive(this.slides.indexOf(en.target));
            });
          },
          { root: this.track_, threshold: [0.6] }
        );
        this.slides.forEach((s) => io.observe(s));
      }
      this.thumbs.forEach((t, i) => t.addEventListener('click', () => this.goTo(i)));
      const prev = $('[data-vf-prev]', g);
      const next = $('[data-vf-next]', g);
      if (prev) prev.addEventListener('click', () => this.goTo(this.index - 1));
      if (next) next.addEventListener('click', () => this.goTo(this.index + 1));
      this.track_.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.goTo(this.index + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.goTo(this.index - 1); }
      });
    }

    goTo(i) {
      if (!this.slides || !this.slides.length || !this.track_) return;
      const n = this.slides.length;
      const idx = ((i % n) + n) % n;
      this.track_.scrollTo({ left: this.slides[idx].offsetLeft, behavior: scrollBehavior() });
      this.setActive(idx);
    }

    setActive(i) {
      if (i < 0 || !this.slides) return;
      this.index = i;
      this.thumbs.forEach((t, j) => (j === i ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
      this.dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
      if (this.counter) this.counter.textContent = `${i + 1} / ${this.slides.length}`;
      this.slides.forEach((s, j) => {
        if (j !== i) $$('video', s).forEach((v) => v.pause());
      });
      // keep the active thumb in view inside its own scroller (never scroll the page)
      const t = this.thumbs[i];
      const list = this.thumbList;
      if (t && list && list.offsetParent) {
        const tr = t.getBoundingClientRect();
        const lr = list.getBoundingClientRect();
        if (list.scrollHeight > list.clientHeight + 1) list.scrollTop += tr.top - lr.top - (lr.height - tr.height) / 2;
        else if (list.scrollWidth > list.clientWidth + 1) list.scrollLeft += tr.left - lr.left - (lr.width - tr.width) / 2;
      }
    }

    goToMedia(mediaId) {
      if (!mediaId || !this.slides) return;
      const i = this.slides.findIndex((s) => Number(s.dataset.mediaId) === Number(mediaId));
      if (i > -1 && i !== this.index) this.goTo(i);
    }

    /* ── Lightbox (native <dialog>) ──────────────────────────────────── */
    initLightbox() {
      const dialog = $('[data-vf-lightbox]', this.root);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      this.dialog = dialog;
      this.lbTrack = $('[data-vf-lb-track]', dialog);
      this.lbSlides = $$('[data-vf-lb-slide]', dialog);
      this.lbCounter = $('[data-vf-lb-counter]', dialog);
      this.lbIndex = 0;

      this.root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-vf-zoom-open]');
        if (btn && this.root.contains(btn)) this.openLightbox(Number(btn.dataset.vfZoomOpen) || 0, btn);
      });
      const close = $('[data-vf-lb-close]', dialog);
      if (close) close.addEventListener('click', () => dialog.close());
      const prev = $('[data-vf-lb-prev]', dialog);
      const next = $('[data-vf-lb-next]', dialog);
      if (prev) prev.addEventListener('click', () => this.lbGoTo(this.lbIndex - 1));
      if (next) next.addEventListener('click', () => this.lbGoTo(this.lbIndex + 1));
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') this.lbGoTo(this.lbIndex + 1);
        if (e.key === 'ArrowLeft') this.lbGoTo(this.lbIndex - 1);
      });
      dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('vf-scroll-lock');
        this.lbSlides.forEach((s) => s.classList.remove('is-zoomed'));
        if (this.lbReturn && typeof this.lbReturn.focus === 'function') this.lbReturn.focus();
      });

      if ('IntersectionObserver' in window && this.lbTrack) {
        const io = new IntersectionObserver(
          (entries) => entries.forEach((en) => {
            if (en.isIntersecting && en.intersectionRatio >= 0.6) this.setLbActive(this.lbSlides.indexOf(en.target));
          }),
          { root: this.lbTrack, threshold: [0.6] }
        );
        this.lbSlides.forEach((s) => io.observe(s));
      }

      // Click-to-zoom with pointer panning on fine pointers; touch devices use native pinch-zoom.
      this.lbSlides.forEach((slide) => {
        const img = $('img', slide);
        if (!img) return;
        const pan = (e) => {
          const r = slide.getBoundingClientRect();
          img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        };
        img.addEventListener('click', (e) => {
          if (!mqFine.matches) return;
          slide.classList.toggle('is-zoomed');
          pan(e);
        });
        slide.addEventListener('pointermove', (e) => {
          if (slide.classList.contains('is-zoomed')) pan(e);
        });
      });
    }

    openLightbox(i, trigger) {
      if (!this.dialog) return;
      this.lbReturn = trigger || document.activeElement;
      document.documentElement.classList.add('vf-scroll-lock');
      this.dialog.showModal();
      const slide = this.lbSlides[i];
      if (slide && this.lbTrack) this.lbTrack.scrollLeft = slide.offsetLeft;
      this.setLbActive(i);
    }

    lbGoTo(i) {
      if (!this.lbSlides || !this.lbSlides.length) return;
      const n = this.lbSlides.length;
      const idx = ((i % n) + n) % n;
      this.lbSlides.forEach((s) => s.classList.remove('is-zoomed'));
      this.lbTrack.scrollTo({ left: this.lbSlides[idx].offsetLeft, behavior: scrollBehavior() });
      this.setLbActive(idx);
    }

    setLbActive(i) {
      if (i < 0) return;
      this.lbIndex = i;
      if (this.lbCounter) this.lbCounter.textContent = `${i + 1} / ${this.lbSlides.length}`;
    }

    /* ── Variant options + purchase option ───────────────────────────── */
    initOptions() {
      this.optInputs = $$('[data-vf-opt]', this.root);
      this.root.addEventListener('change', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.matches('[data-vf-opt]')) {
          this.variant = this.findVariant(this.selectedOptions());
          this.update({ variantChanged: true });
        } else if (t.matches('[data-vf-purchase]') || t.matches('[data-vf-plan-select]')) {
          this.update();
        }
      });
    }

    selectedOptions() {
      const count = this.data.optionCount || 0;
      const out = [];
      for (let i = 0; i < count; i += 1) {
        const el = $(`[data-vf-opt="${i}"]:checked`, this.root);
        out.push(el ? el.value : null);
      }
      return out;
    }

    findVariant(selected) {
      if (!selected.length) return this.variants[0] || null;
      return this.variants.find((v) => v.options.every((o, i) => o === selected[i])) || null;
    }

    planId() {
      if (!this.planSelect) return null;
      const chosen = $('[data-vf-purchase]:checked', this.root);
      if (!chosen || chosen.value !== 'subscribe') return null;
      return this.planSelect.value || null;
    }

    activePrice() {
      const v = this.variant;
      if (!v) return null;
      const pid = this.planId();
      const alloc = pid && v.plans ? v.plans[pid] : null;
      if (alloc) {
        const compare = alloc.compare > alloc.price ? alloc.compare : v.compare > alloc.price ? v.compare : 0;
        const compareFmt = alloc.compare > alloc.price ? v.price_fmt : v.compare_fmt;
        return { price: alloc.price, fmt: alloc.price_fmt, compare, compareFmt, plan: pid };
      }
      return { price: v.price, fmt: v.price_fmt, compare: v.compare > v.price ? v.compare : 0, compareFmt: v.compare_fmt, plan: null };
    }

    /* Single render pass for everything that depends on variant / plan / cart state */
    update({ variantChanged = false } = {}) {
      const v = this.variant;
      const root = this.root;

      if (v && this.idField && String(this.idField.value) !== String(v.id)) {
        this.idField.value = String(v.id);
        this.idField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (variantChanged && v) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('variant', v.id);
          window.history.replaceState(window.history.state, '', url.toString());
        } catch (_) { /* noop */ }
        this.goToMedia(v.media_id);
        document.dispatchEvent(new CustomEvent('vf:variant:change', { detail: { sectionId: this.data.sectionId, variant: v } }));
      }

      // selected-value labels
      const selected = this.selectedOptions();
      $$('[data-vf-selected]', root).forEach((el) => {
        const val = selected[Number(el.dataset.vfSelected)];
        if (val) el.textContent = val;
      });

      // option availability (multi-option products): text + shape, never colour alone
      if ((this.data.optionCount || 0) > 1) {
        this.optInputs.forEach((input) => {
          const i = Number(input.dataset.vfOpt);
          const probe = selected.slice();
          probe[i] = input.value;
          const matches = this.variants.filter((x) => x.options.every((o, j) => o === probe[j]));
          const state = !matches.length ? 'none' : matches.some((x) => x.available) ? 'ok' : 'oos';
          const label = input.closest('.vf-optbtn');
          if (!label) return;
          label.dataset.state = state;
          const sr = $('[data-vf-optstate]', label);
          if (sr) sr.textContent = state === 'oos' ? this.labels.optionOos : state === 'none' ? this.labels.optionNone : '';
        });
      }

      // price block
      const p = this.activePrice();
      if (p) {
        const priceEl = $('[data-vf-price]', root);
        if (priceEl) priceEl.textContent = p.fmt;
        const cmpWrap = $('[data-vf-compare-wrap]', root);
        const cmp = $('[data-vf-compare]', root);
        const showCmp = Boolean(p.compare) && Boolean(cmpWrap) && cmpWrap.dataset.vfAllow !== 'false';
        if (cmpWrap) cmpWrap.hidden = !showCmp;
        if (cmp && showCmp) cmp.textContent = p.compareFmt;
        const lbl = $('[data-vf-price-label]', root);
        if (lbl) lbl.textContent = showCmp ? this.labels.salePrice : this.labels.price;
        this.setText('[data-vf-unit]', p.plan ? '' : v.unit_fmt);
        this.setText('[data-vf-perday]', p.plan ? '' : v.perday_fmt);
        $$('[data-vf-sticky-price]', root).forEach((el) => (el.textContent = p.fmt));
      }

      // purchase option rows
      if (v && this.planSelect) {
        const onetime = $('[data-vf-onetime-price]', root);
        if (onetime) onetime.textContent = v.price_fmt;
        const pid = this.planSelect.value;
        const alloc = v.plans ? v.plans[pid] : null;
        const subPrice = $('[data-vf-sub-price]', root);
        if (subPrice) subPrice.textContent = alloc ? alloc.price_fmt : '';
        const save = $('[data-vf-sub-save]', root);
        if (save) {
          const pct = alloc && v.price > alloc.price ? Math.round((1 - alloc.price / v.price) * 100) : 0;
          save.hidden = pct <= 0;
          save.textContent = pct > 0 ? `${this.labels.save} ${pct}%` : '';
        }
        const sub = this.planId();
        if (this.planInput) this.planInput.value = sub && alloc ? sub : '';
        const detail = $('[data-vf-plan-detail]', root);
        if (detail) detail.hidden = !sub;
      }

      // sticky variant label
      $$('[data-vf-sticky-variant]', root).forEach((el) => {
        el.textContent = v && v.title !== 'Default Title' ? v.title : '';
      });

      this.applyAvailability();
    }

    setText(sel, text) {
      const el = $(sel, this.root);
      if (!el) return;
      el.textContent = text || '';
      el.hidden = !text;
    }

    remaining(v) {
      const max = Number(this.data.maxPerVariant) || 0;
      if (!max || !v) return Infinity;
      return Math.max(0, max - (this.inCart.get(v.id) || 0));
    }

    applyAvailability() {
      const v = this.variant;
      const available = Boolean(v && v.available);
      const remaining = this.remaining(v);
      const limited = available && remaining <= 0;
      const label = !v ? this.labels.unavailable : !available ? this.labels.oos : limited ? this.labels.limitButton : this.labels.add;

      [this.addBtn, this.stickyAdd].forEach((btn) => {
        if (!btn) return;
        btn.disabled = !available || limited || (this.busy && btn.getAttribute('aria-busy') !== 'true');
        const l = $('[data-vf-add-label]', btn);
        if (l) l.textContent = label;
      });
      [this.buyBtn, this.stickyBuy].forEach((btn) => {
        if (!btn) return;
        btn.hidden = !available;
        btn.disabled = limited || (this.busy && btn.getAttribute('aria-busy') !== 'true');
      });

      const oos = $('[data-vf-oos]', this.root);
      if (oos) oos.hidden = available || !v;
      const lim = $('[data-vf-limit]', this.root);
      if (lim) lim.hidden = !limited;

      // quantity bounds
      if (this.qtyInput) {
        const max = Number.isFinite(remaining) ? Math.max(1, remaining) : 99;
        this.qtyInput.max = String(max);
        const q = Math.min(max, Math.max(1, parseInt(this.qtyInput.value, 10) || 1));
        if (String(q) !== this.qtyInput.value) this.qtyInput.value = String(q);
        if (this.qtyDec) this.qtyDec.disabled = q <= 1;
        if (this.qtyInc) this.qtyInc.disabled = q >= max || limited;
      }
    }

    /* ── Quantity ────────────────────────────────────────────────────── */
    initQty() {
      if (!this.qtyInput) return;
      this.qtyDec = $('[data-vf-qty-dec]', this.root);
      this.qtyInc = $('[data-vf-qty-inc]', this.root);
      const step = (d) => {
        this.qtyInput.value = String((parseInt(this.qtyInput.value, 10) || 1) + d);
        this.applyAvailability();
      };
      if (this.qtyDec) this.qtyDec.addEventListener('click', () => step(-1));
      if (this.qtyInc) this.qtyInc.addEventListener('click', () => step(1));
      this.qtyInput.addEventListener('change', () => this.applyAvailability());
    }

    qty() {
      return Math.max(1, parseInt(this.qtyInput ? this.qtyInput.value : '1', 10) || 1);
    }

    /* ── Cart state (per-variant cap) ────────────────────────────────── */
    initCartSync() {
      if (!Number(this.data.maxPerVariant)) return;
      idle(() => this.refreshCart(), { timeout: 3000 });
      window.addEventListener('pageshow', (e) => { if (e.persisted) this.refreshCart(); });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.cartFetchedAt = 0;
      });
      // Dawn-family themes: mark stale whenever the theme's cart changes (drawer edits/removals)
      try {
        if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.cartUpdate) {
          // eslint-disable-next-line no-undef
          subscribe(PUB_SUB_EVENTS.cartUpdate, (ev) => {
            if (!ev || ev.source !== 'vf-pdp') this.cartFetchedAt = 0;
          });
        }
      } catch (_) { /* theme without pub/sub */ }
    }

    async refreshCart() {
      try {
        const res = await fetch(this.data.cartJsUrl, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const cart = await res.json();
        this.inCart.clear();
        (cart.items || []).forEach((it) => this.inCart.set(it.variant_id, (this.inCart.get(it.variant_id) || 0) + it.quantity));
        this.cartFetchedAt = Date.now();
        this.applyAvailability();
      } catch (_) { /* offline: keep last known state */ }
    }

    async ensureCart(maxAge) {
      if (!Number(this.data.maxPerVariant)) return;
      if (Date.now() - this.cartFetchedAt > maxAge) await this.refreshCart();
    }

    /* ── Actions ─────────────────────────────────────────────────────── */
    initActions() {
      this.addBtn = $('[data-vf-add]', this.root);
      this.buyBtn = $('[data-vf-buy]', this.root);
      this.stickyAdd = $('[data-vf-sticky-add]', this.root);
      this.stickyBuy = $('[data-vf-sticky-buy]', this.root);

      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.add({ trigger: e.submitter || this.addBtn });
        });
      }
      if (this.buyBtn) this.buyBtn.addEventListener('click', () => this.add({ trigger: this.buyBtn, checkout: true }));
      if (this.stickyAdd) this.stickyAdd.addEventListener('click', () => this.add({ trigger: this.stickyAdd }));
      if (this.stickyBuy) this.stickyBuy.addEventListener('click', () => this.add({ trigger: this.stickyBuy, checkout: true }));

      this.root.addEventListener('click', (e) => {
        const quick = e.target.closest('[data-vf-quick-add]');
        if (quick && this.root.contains(quick)) {
          this.add({ trigger: quick, only: [{ id: Number(quick.dataset.vfQuickAdd), quantity: 1 }] });
          return;
        }
        const both = e.target.closest('[data-vf-add-both]');
        if (both && this.root.contains(both)) {
          this.add({ trigger: both, extra: [{ id: Number(both.dataset.vfAddBoth), quantity: 1 }], message: this.labels.addedBoth });
        }
      });
    }

    async add({ trigger = null, checkout = false, only = null, extra = [], message = null } = {}) {
      if (this.busy) return;
      const v = this.variant;
      if (!only && (!v || !v.available)) return;

      this.setBusy(true, trigger);
      this.clearMessages();
      try {
        let items = only;
        if (!items) {
          await this.ensureCart(10000);
          const remaining = this.remaining(v);
          if (remaining <= 0) {
            this.applyAvailability();
            this.say($('[data-vf-limit] p', this.root)?.textContent || '');
            return;
          }
          const main = { id: v.id, quantity: Math.min(this.qty(), remaining) };
          const pid = this.activePrice()?.plan;
          if (pid) main.selling_plan = Number(pid);
          items = [main, ...extra];
        }

        const cartEl = checkout ? null : this.themeCart();
        const body = { items };
        if (!checkout) {
          body.sections = this.sectionIds(cartEl).join(',');
          body.sections_url = window.location.pathname;
        }
        const res = await fetch(this.data.cartAddUrl, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(body),
        });
        let data = {};
        try { data = await res.json(); } catch (_) { /* empty body */ }
        if (!res.ok) throw new Error(data.description || data.message || this.labels.error);

        items.forEach((it) => this.inCart.set(it.id, (this.inCart.get(it.id) || 0) + it.quantity));
        this.trackAdd(items);

        if (checkout) {
          this.track('begin_checkout', this.ecommerce(v, items[0].quantity));
          this.goToCheckout();
          return;
        }
        this.renderCart(cartEl, data, trigger);
        this.showStatus(message || this.labels.added, trigger);
      } catch (err) {
        this.showError((err && err.message) || this.labels.error, trigger);
      } finally {
        this.setBusy(false, trigger);
      }
    }

    setBusy(state, trigger) {
      this.busy = state;
      if (trigger) {
        if (state) trigger.setAttribute('aria-busy', 'true');
        else trigger.removeAttribute('aria-busy');
      }
      if (state) this.say(this.labels.adding);
      this.applyAvailability();
    }

    themeCart() {
      return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    }

    sectionIds(cartEl) {
      try {
        if (cartEl && typeof cartEl.getSectionsToRender === 'function') {
          const ids = cartEl.getSectionsToRender().map((s) => s.id).filter(Boolean);
          if (ids.length) return ids.slice(0, 5);
        }
      } catch (_) { /* fall through */ }
      return ['cart-drawer', 'cart-icon-bubble', 'cart-notification-product', 'cart-notification-button'];
    }

    renderCart(cartEl, data, trigger) {
      // Shape the multi-item response like a single /cart/add.js response, which Dawn expects.
      const first = (data.items && data.items[0]) || data;
      const state = Object.assign({}, first, { sections: data.sections || {} });

      if (cartEl && typeof cartEl.renderContents === 'function') {
        try {
          cartEl.classList.remove('is-empty');
          if (typeof cartEl.setActiveElement === 'function') cartEl.setActiveElement(trigger || document.activeElement);
          cartEl.renderContents(state);
          this.publishCart(state);
          return;
        } catch (err) {
          console.warn('[vf-pdp] theme cart render failed, using fallback', err);
        }
      }

      // Fallback: swap known section HTML in place (preserves NM v6.1 behaviour)
      const parser = new DOMParser();
      Object.entries(state.sections || {}).forEach(([id, html]) => {
        if (!html) return;
        const doc = parser.parseFromString(html, 'text/html');
        const fresh = doc.getElementById(`shopify-section-${id}`);
        const wrapper = document.getElementById(`shopify-section-${id}`);
        if (wrapper && fresh) { wrapper.innerHTML = fresh.innerHTML; return; }
        if (id === 'cart-icon-bubble') {
          const bubble = document.getElementById('cart-icon-bubble');
          if (bubble && fresh) bubble.innerHTML = fresh.innerHTML;
        }
        if (id === 'cart-drawer') {
          const drawer = document.querySelector('cart-drawer');
          const inner = doc.querySelector('cart-drawer');
          if (drawer && inner) {
            drawer.innerHTML = inner.innerHTML;
            drawer.classList.remove('is-empty');
            if (typeof drawer.open === 'function') drawer.open();
          }
        }
      });
      this.publishCart(state);
    }

    publishCart(state) {
      try {
        if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.cartUpdate) {
          // eslint-disable-next-line no-undef
          publish(PUB_SUB_EVENTS.cartUpdate, { source: 'vf-pdp', productVariantId: this.variant && this.variant.id, cartData: state });
        }
      } catch (_) { /* theme without pub/sub */ }
      document.dispatchEvent(new CustomEvent('vf:cart:added', { detail: { sectionId: this.data.sectionId, cart: state } }));
    }

    goToCheckout() {
      if (this.data.checkoutMode === 'url') {
        const root = this.data.rootUrl.endsWith('/') ? this.data.rootUrl : `${this.data.rootUrl}/`;
        window.location.assign(`${root}checkout`);
        return;
      }
      // Hand off through the theme's checkout button so Razorpay Magic Checkout (or any
      // checkout app that intercepts [name="checkout"]) takes over; otherwise /cart → checkout.
      const btn = $('[data-vf-checkout-submit]', this.root);
      if (btn) btn.click();
      else window.location.assign('/checkout');
    }

    /* ── Messages ────────────────────────────────────────────────────── */
    say(text) {
      if (!this.live) return;
      this.live.textContent = '';
      window.requestAnimationFrame(() => { this.live.textContent = text || ''; });
    }

    clearMessages() {
      const err = $('[data-vf-error]', this.root);
      if (err) err.hidden = true;
      const ok = $('[data-vf-status]', this.root);
      if (ok) ok.hidden = true;
    }

    showStatus(text, trigger) {
      const ok = $('[data-vf-status]', this.root);
      if (ok) {
        $('[data-vf-status-text]', ok).textContent = text;
        ok.hidden = false;
      }
      this.say(text);
      if (trigger && !this.isInBuyBox(trigger)) this.toast(text);
    }

    showError(text, trigger) {
      const err = $('[data-vf-error]', this.root);
      if (err) {
        $('[data-vf-error-text]', err).textContent = text;
        err.hidden = false;
      }
      if (trigger && !this.isInBuyBox(trigger)) this.toast(text);
    }

    isInBuyBox(el) {
      const box = $('[data-vf-buybox]', this.root);
      return Boolean(box && box.contains(el));
    }

    toast(text) {
      const t = $('[data-vf-toast]', this.root);
      if (!t) return;
      t.textContent = text;
      t.classList.add('is-visible');
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => t.classList.remove('is-visible'), 3200);
    }

    /* ── Sticky purchase bar (< 1024px) ──────────────────────────────── */
    initSticky() {
      this.sticky = $('[data-vf-sticky]', this.root);
      const anchor = $('[data-vf-cta-anchor]', this.root);
      if (!this.sticky || !anchor || !('IntersectionObserver' in window)) return;
      let past = false;
      const apply = () => {
        const show = past && !mqDesktop.matches;
        this.sticky.classList.toggle('is-visible', show);
        if (show) {
          this.sticky.removeAttribute('inert');
          this.sticky.removeAttribute('aria-hidden');
        } else {
          this.sticky.setAttribute('inert', '');
          this.sticky.setAttribute('aria-hidden', 'true');
        }
      };
      new IntersectionObserver(([en]) => {
        past = !en.isIntersecting && en.boundingClientRect.top < 0;
        apply();
      }).observe(anchor);
      mqDesktop.addEventListener('change', apply);
    }

    /* ── Sticky buy box (≥ 1024px): if taller than the viewport, pin its bottom edge instead ── */
    initStickyBuyBox() {
      const box = $('[data-vf-buybox]', this.root);
      if (!box || !('ResizeObserver' in window)) return;
      const set = () => {
        const offset = parseFloat(getComputedStyle(this.root).getPropertyValue('--vf-sticky-top')) || 24;
        const top = Math.min(offset, window.innerHeight - box.offsetHeight - 24);
        box.style.setProperty('--vf-buy-top', `${Math.round(top)}px`);
      };
      new ResizeObserver(set).observe(box);
      window.addEventListener('resize', set, { passive: true });
      set();
    }

    /* ── FAQ expand / collapse all ───────────────────────────────────── */
    initFaq() {
      this.root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-vf-faq-all]');
        if (!b || !this.root.contains(b)) return;
        const open = b.dataset.vfFaqAll === 'open';
        const faq = b.closest('[data-vf-faq]');
        if (faq) $$('details', faq).forEach((d) => { d.open = open; });
      });
    }

    /* ── Dosage: species switch + weight calculator (progressive enhancement) ── */
    initDose() {
      const wrap = $('[data-vf-howto]', this.root);
      if (!wrap) return;
      const tables = $$('[data-vf-dose-table]', wrap);
      const sw = $('[data-vf-dose-switch]', wrap);
      if (sw && tables.length > 1) {
        sw.hidden = false;
        const sync = () => {
          const val = ($('input:checked', sw) || {}).value || '0';
          tables.forEach((t) => { t.hidden = t.dataset.vfDoseTable !== val; });
          this.calc();
        };
        sw.addEventListener('change', sync);
        sync();
      }
      const form = $('[data-vf-calc]', wrap);
      if (!form || !tables.length) return;
      form.hidden = false;
      const input = $('input', form);
      const out = $('[data-vf-calc-out]', form);
      this.calc = () => {
        const w = parseFloat(String(input.value).replace(',', '.'));
        const table = tables.find((t) => !t.hidden) || tables[0];
        const rows = $$('tbody tr', table);
        $$('tbody tr[data-active]', wrap).forEach((r) => r.removeAttribute('data-active'));
        if (!Number.isFinite(w) || w <= 0) { out.textContent = ''; return; }
        const row = rows.find((r) => {
          const min = parseFloat(r.dataset.min || '0') || 0;
          const max = r.dataset.max === '' || r.dataset.max === undefined ? Infinity : parseFloat(r.dataset.max);
          return (min === 0 ? w >= 0 : w > min) && w <= max;
        });
        if (row) {
          row.setAttribute('data-active', '');
          out.textContent = `${this.labels.dosePrefix} ${w} kg: ${$('td', row).textContent.trim()}`;
        } else {
          out.textContent = this.labels.doseNone;
        }
      };
      form.addEventListener('input', () => this.calc());
      form.addEventListener('submit', (e) => { e.preventDefault(); this.calc(); });
    }

    /* ── Pincode serviceability (only when an endpoint is configured) ── */
    initPincode() {
      const form = $('[data-vf-pincode]', this.root);
      if (!form) return;
      const input = $('input', form);
      const out = $('[data-vf-pincode-out]', form);
      try {
        const saved = window.localStorage.getItem('vf:pincode');
        if (saved && input) input.value = saved;
      } catch (_) { /* storage blocked */ }
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = input.value.trim();
        if (!/^[1-9][0-9]{5}$/.test(pin)) {
          input.setAttribute('aria-invalid', 'true');
          out.textContent = this.labels.pinInvalid;
          return;
        }
        input.removeAttribute('aria-invalid');
        out.textContent = this.labels.pinChecking;
        try { window.localStorage.setItem('vf:pincode', pin); } catch (_) { /* storage blocked */ }
        try {
          const url = new URL(form.dataset.endpoint, window.location.origin);
          url.searchParams.set('pincode', pin);
          if (this.variant) url.searchParams.set('variant', this.variant.id);
          const res = await fetch(url.toString(), { credentials: 'same-origin', headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error('bad status');
          const d = await res.json();
          out.textContent = d.message || (d.serviceable ? this.labels.pinOk : this.labels.pinNo);
        } catch (_) {
          out.textContent = this.labels.pinError;
        }
      });
    }

    /* ── Pairs well with: complementary recommendations fallback ────── */
    initPairs() {
      const wrap = $('[data-vf-pairs][data-auto="true"]', this.root);
      const sentinel = $('[data-vf-pairs-sentinel]', this.root);
      if (!wrap || !sentinel || !('IntersectionObserver' in window)) return;
      const list = $('[data-vf-pairs-list]', wrap);
      const load = async () => {
        try {
          const url = new URL(this.data.recsUrl, window.location.origin);
          url.searchParams.set('product_id', this.data.productId);
          url.searchParams.set('limit', wrap.dataset.limit || '3');
          url.searchParams.set('intent', 'complementary');
          const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
          if (!res.ok) return;
          const d = await res.json();
          const products = (d.products || []).filter((p) => p.available && p.id !== this.data.productId);
          if (!products.length) return;
          products.forEach((p) => {
            const card = this.pairCard(p);
            if (card) list.appendChild(card);
          });
          wrap.hidden = false;
        } catch (_) { /* recommendations unavailable: zone stays hidden */ }
      };
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { io.disconnect(); load(); }
      }, { rootMargin: '600px 0px' });
      io.observe(sentinel);
    }

    pairCard(p) {
      const variant = (p.variants || []).find((x) => x.available);
      if (!variant) return null;
      const el = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
      };
      const li = el('li');
      const card = el('article', 'vf-pcard');
      const media = el('a', 'vf-pcard__media');
      media.href = p.url;
      media.tabIndex = -1;
      media.setAttribute('aria-hidden', 'true');
      if (p.featured_image) {
        const img = el('img', 'vf-pcard__img');
        try {
          const src = new URL(p.featured_image, window.location.href);
          src.searchParams.set('width', '480');
          img.src = src.toString();
        } catch (_) { img.src = p.featured_image; }
        img.alt = '';
        img.loading = 'lazy';
        img.width = 480;
        img.height = 480;
        media.appendChild(img);
      }
      const body = el('div', 'vf-pcard__body');
      const h = el('h3', 'vf-pcard__title');
      const a = el('a', null, p.title);
      a.href = p.url;
      h.appendChild(a);
      const price = el('p', 'vf-pcard__price', this.money(variant.price != null ? variant.price : p.price));
      const btn = el('button', 'vf-btn vf-btn--secondary vf-btn--sm vf-pcard__add', 'Add to cart');
      btn.type = 'button';
      btn.dataset.vfQuickAdd = String(variant.id);
      btn.setAttribute('aria-label', `Add ${p.title} to cart`);
      body.append(h, price, btn);
      card.append(media, body);
      li.appendChild(card);
      return li;
    }

    money(cents) {
      const value = Number(cents) / 100;
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en-IN', {
          style: 'currency',
          currency: this.data.currency || 'INR',
          maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
        }).format(value);
      } catch (_) {
        return value.toFixed(2);
      }
    }

    /* ── Analytics (GA4 ecommerce shape → dataLayer + Shopify custom pixel event) ── */
    ecommerce(v, quantity) {
      const p = this.activePrice() || { price: v.price };
      const price = p.price / 100;
      return {
        currency: this.data.currency,
        value: Number((price * quantity).toFixed(2)),
        items: [{
          item_id: v.sku || String(v.id),
          item_name: this.data.title,
          item_brand: this.data.brand,
          item_category: this.data.type || undefined,
          item_variant: v.title !== 'Default Title' ? v.title : undefined,
          price,
          quantity,
        }],
      };
    }

    trackAdd(items) {
      const v = this.variant;
      const mainItem = v ? items.find((it) => it.id === v.id) : null;
      if (mainItem) this.track('add_to_cart', this.ecommerce(v, mainItem.quantity));
    }

    track(event, ecommerce) {
      if (!this.data.analytics || !ecommerce) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event, ecommerce });
      try {
        if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === 'function') {
          window.Shopify.analytics.publish(`vf_${event}`, ecommerce);
        }
      } catch (_) { /* pixel API unavailable */ }
    }
  }

  const init = (scope = document) => {
    const roots = scope.matches && scope.matches('[data-vf-pdp]') ? [scope] : $$('[data-vf-pdp]', scope);
    roots.forEach((root) => {
      if (!root.vfPdp) root.vfPdp = new VfPdp(root);
    });
  };

  window.VfPdp = VfPdp;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
