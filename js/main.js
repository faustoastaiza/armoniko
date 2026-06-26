/* =============================================
   LIVING BY ARMONIKO — Main JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ========== PROMO BAR ==========
  // Muestra "mejor precio garantizado". El botón × lo colapsa para esta sesión.
  // El 10% off está listo en HTML/CSS pero oculto — activar con Laura.
  const promoBar   = document.getElementById('promoBar');
  const promoClose = document.getElementById('promoBarClose');
  if (promoBar) {
    // Si ya fue cerrado en esta sesión no lo mostramos
    if (sessionStorage.getItem('promoByClosed')) {
      promoBar.classList.add('promo-bar--hidden');
    }
    if (promoClose) {
      promoClose.addEventListener('click', () => {
        promoBar.classList.add('promo-bar--hidden');
        sessionStorage.setItem('promoByClosed', '1');
      });
    }
  }

  // ========== HEADER SCROLL ==========
  const head = document.querySelector('.site-head');
  if (head) {
    const onScroll = () => {
      if (window.pageYOffset > 40) head.classList.add('scrolled');
      else head.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ========== HERO LOADED ==========
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('loaded'));

  // ========== SPLIT TEXT (estilo React Bits / GSAP SplitText) ==========
  // Split por caracteres: cada uno entra con opacity 0→1 + y:40→0, en stagger.
  // Réplica vanilla del componente SplitText (sin React/GSAP).
  document.querySelectorAll('[data-split-words]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);      // accesible: el lector lee el texto completo
    const words = text.split(/\s+/);
    let i = 0;
    el.innerHTML = words.map(word => {
      const chars = [...word].map(ch => {
        const delay = (0.3 + i * 0.04).toFixed(3);   // delay inicial 0.3s + stagger 40ms/char
        i++;
        return `<span class="split-char" style="animation-delay:${delay}s" aria-hidden="true">${ch}</span>`;
      }).join('');
      return `<span class="split-word">${chars}</span>`;
    }).join(' ');
  });

  // ========== SCROLL REVEAL ==========
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ========== COUNTER ==========
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const run = () => {
      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { run(); io2.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      io2.observe(el);
    } else { run(); }
  });

  // ========== FLATPICKR DATE PICKERS ==========
  // Initialized only if flatpickr loaded. Uses Spanish locale + minimal config.
  if (window.flatpickr) {
    const SPANISH = {
      weekdays: { shorthand: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
                  longhand: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'] },
      months:   { shorthand: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                  longhand: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'] },
      firstDayOfWeek: 1,
      rangeSeparator: ' al ',
      weekAbbreviation: 'Sem',
      scrollTitle: 'Scroll para cambiar',
      toggleTitle: 'Click para alternar',
      amPM: ['AM','PM']
    };

    document.querySelectorAll('[data-booking-form]').forEach(form => {
      const inEl  = form.querySelector('[data-booking-checkin]');
      const outEl = form.querySelector('[data-booking-checkout]');

      // Convert type=date to type=text so flatpickr can fully control it
      if (inEl) inEl.setAttribute('type', 'text');
      if (outEl) outEl.setAttribute('type', 'text');

      // Mañana como fecha por defecto del checkout
      const defaultCheckout = new Date(Date.now() + 86400000);

      const outPicker = outEl ? flatpickr(outEl, {
        locale: SPANISH,
        minDate: defaultCheckout,
        defaultDate: defaultCheckout,   // ← siempre pre-rellena con mañana
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'D, d M Y',
        disableMobile: false
      }) : null;

      if (inEl) {
        flatpickr(inEl, {
          locale: SPANISH,
          minDate: 'today',
          defaultDate: 'today',         // ← siempre pre-rellena con hoy
          dateFormat: 'Y-m-d',
          altInput: true,
          altFormat: 'D, d M Y',
          disableMobile: false,
          onChange: (selectedDates) => {
            if (selectedDates[0] && outPicker) {
              const next = new Date(selectedDates[0]);
              next.setDate(next.getDate() + 1);
              outPicker.set('minDate', next);
              if (outPicker.selectedDates[0] && outPicker.selectedDates[0] <= selectedDates[0]) {
                outPicker.setDate(next, true);
              }
            }
          }
        });
      }
    });
  }

  // ========== BOOKING FORM SUBMIT ==========
  document.querySelectorAll('[data-booking-form]').forEach(form => {
    const checkin = form.querySelector('[data-booking-checkin]');
    const checkout = form.querySelector('[data-booking-checkout]');
    const guests = form.querySelector('[data-booking-guests]');
    const btn = form.querySelector('[data-booking-submit]');

    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    // Set defaults if empty (works whether flatpickr is initialized or not)
    if (checkin && !checkin.value) checkin.value = fmt(today);
    if (checkout && !checkout.value) checkout.value = fmt(tomorrow);

    const submit = (e) => {
      e.preventDefault();
      const ci = checkin ? checkin.value : fmt(today);
      const co = checkout ? checkout.value : fmt(tomorrow);
      const g = guests ? guests.value : '2-0';
      const [adults, children] = g.split('-').map(Number);

      const params = new URLSearchParams();
      params.set('locale', 'es');
      params.set('currency', 'COP');
      params.set('checkInDate', ci);
      params.set('checkOutDate', co);
      params.set('items[0][adults]', adults || 2);
      params.set('items[0][children]', children || 0);
      params.set('items[0][infants]', 0);
      params.set('trackPage', 'yes');

      const url = `https://direct-book.com/properties/HotelLivingbyArmonikoDIRECT?${params.toString()}`;
      window.open(url, '_blank', 'noopener');
    };

    form.addEventListener('submit', submit);
    if (btn) btn.addEventListener('click', submit);
  });

  // ========== MOBILE MENU ==========
  const burger = document.querySelector('.hamburger');
  const mmenu = document.querySelector('.mobile-menu');
  if (burger && mmenu) {
    const toggle = () => {
      burger.classList.toggle('active');
      mmenu.classList.toggle('active');
      document.body.style.overflow = mmenu.classList.contains('active') ? 'hidden' : '';
    };
    const close = () => {
      burger.classList.remove('active');
      mmenu.classList.remove('active');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', toggle);
    // Botón × de cerrar dentro del overlay
    const closeBtn = mmenu.querySelector('.mobile-menu__close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    // Cerrar al tocar cualquier enlace
    mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mmenu.classList.contains('active')) close();
    });
  }

  // ========== SUITE SLIDERS (habitaciones.html) ==========
  // Slider con scroll-snap + dots + botones prev/next por cada .suite-slider
  document.querySelectorAll('[data-suite-slider]').forEach(slider => {
    const track    = slider.querySelector('.suite-slider__track');
    const slides   = slider.querySelectorAll('.suite-slider__track > img');
    const prev     = slider.querySelector('.suite-slider__btn--prev');
    const next     = slider.querySelector('.suite-slider__btn--next');
    const dotsWrap = slider.querySelector('.suite-slider__dots');
    if (!track || !slides.length) return;

    // Construir dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'suite-slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.suite-slider__dot');

    const goTo = (i) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
    };

    const currentIndex = () =>
      Math.round(track.scrollLeft / track.clientWidth);

    prev?.addEventListener('click', () => goTo(currentIndex() - 1));
    next?.addEventListener('click', () => goTo(currentIndex() + 1));

    // Sincronizar dots con scroll del usuario
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const i = currentIndex();
        dots.forEach((d, di) => d.classList.toggle('is-active', di === i));
      }, 80);
    }, { passive: true });
  });

  // ========== LIGHTBOX (suite sliders) ==========
  // Al hacer click en cualquier imagen de un .suite-slider, abre el lightbox
  // con la galería completa de ese slider y permite navegar prev/next.
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg     = lightbox.querySelector('.lightbox__img');
    const lbCap     = lightbox.querySelector('.lightbox__caption-text');
    const lbCount   = lightbox.querySelector('.lightbox__counter');
    const lbClose   = lightbox.querySelector('.lightbox__close');
    const lbPrev    = lightbox.querySelector('.lightbox__nav--prev');
    const lbNext    = lightbox.querySelector('.lightbox__nav--next');

    let lbGallery = [];   // [{src, alt}, ...]
    let lbIndex = 0;

    const renderLb = () => {
      const item = lbGallery[lbIndex];
      if (!item) return;
      // Pequeño fade-out → swap → fade-in
      lbImg.style.opacity = '0';
      const tmp = new Image();
      tmp.onload = () => {
        lbImg.src = item.src;
        lbImg.alt = item.alt || '';
        lbCap.textContent = item.alt || '';
        lbCount.textContent = `${lbIndex + 1} / ${lbGallery.length}`;
        requestAnimationFrame(() => { lbImg.style.opacity = '1'; });
      };
      tmp.src = item.src;
    };

    const openLb = (gallery, startIdx) => {
      lbGallery = gallery;
      lbIndex = startIdx;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      renderLb();
    };

    const closeLb = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    };

    const step = (dir) => {
      lbIndex = (lbIndex + dir + lbGallery.length) % lbGallery.length;
      renderLb();
    };

    // Conectar clicks a la galería interna de cada página de suite (.suite-gallery)
    document.querySelectorAll('.suite-gallery').forEach(gal => {
      const imgs = [...gal.querySelectorAll('.suite-gallery__slide img')];
      if (!imgs.length) return;
      const gallery = imgs.map(i => ({ src: i.src, alt: i.alt }));
      imgs.forEach((img, idx) => {
        img.addEventListener('click', () => openLb(gallery, idx));
      });
    });

    // Conectar clicks a la galería rail del home (.gallery-rail)
    document.querySelectorAll('[data-gallery-rail]').forEach(rail => {
      const items = [...rail.querySelectorAll('.gallery-item')];
      if (!items.length) return;
      const gallery = items.map(item => {
        const img = item.querySelector('img');
        return { src: img.src, alt: img.alt };
      });
      items.forEach((item, idx) => {
        item.addEventListener('click', (e) => {
          // No abrir lightbox si fue un drag (no un click real)
          if (rail.dataset.wasDragging === '1') {
            rail.dataset.wasDragging = '0';
            return;
          }
          openLb(gallery, idx);
        });
      });

      // ─── Drag-to-scroll horizontal en desktop ───
      let isDown = false, startX = 0, startScroll = 0, moved = 0;
      rail.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - rail.offsetLeft;
        startScroll = rail.scrollLeft;
        moved = 0;
      });
      rail.addEventListener('mouseleave', () => { isDown = false; });
      rail.addEventListener('mouseup', () => {
        isDown = false;
        // Si movió >5px lo marcamos como drag para evitar el lightbox
        rail.dataset.wasDragging = moved > 5 ? '1' : '0';
      });
      rail.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rail.offsetLeft;
        const walk = (x - startX) * 1.5;  // multiplicador para sentir más responsive
        rail.scrollLeft = startScroll - walk;
        moved = Math.abs(walk);
      });
    });

    // Controles
    lbClose.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', () => step(-1));
    lbNext.addEventListener('click', () => step(1));

    // Click fuera de la imagen / stage → cerrar
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLb();
    });

    // Teclas: ESC cierra, ← → navega
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape')    closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    // Swipe en móvil
    let touchX = 0;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // ========== ALIADOS — Filtros por categoría ==========
  const aliadosGrid = document.querySelector('[data-aliados-grid]');
  if (aliadosGrid) {
    const filters = document.querySelectorAll('.aliados-filter');
    // [data-category] matchea tanto .aliado-card (aliados) como .tour-card (tours)
    const cards   = aliadosGrid.querySelectorAll('[data-category]');
    const empty   = document.querySelector('[data-aliados-empty]');

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.filter;

        // Estado activo del botón
        filters.forEach(f => {
          f.classList.toggle('is-active', f === btn);
          f.setAttribute('aria-selected', f === btn ? 'true' : 'false');
        });

        // Filtrar cards con animación
        let visible = 0;
        cards.forEach(card => {
          const cat = card.dataset.category;
          const show = (target === 'all') || (cat === target);
          card.hidden = !show;
          if (show) visible++;
        });

        // Mensaje "vacío" si no hay coincidencias
        if (empty) empty.hidden = (visible > 0);
      });
    });
  }

  // ========== TOURS — Modal de detalle con datos completos ==========
  const tourModal = document.getElementById('tourModal');
  if (tourModal) {
    // Base de datos de los 16 tours (info informativa, sin contacto del proveedor)
    const TOURS = {
      'guatape': {
        category: 'Naturaleza · Día completo',
        title: 'Guatapé Tour',
        image: 'img/tours/guatape.jpg',
        duration: '8 a 10 horas',
        schedule: '8:00 a.m. — 6:30 p.m.',
        desc: 'Uno de los destinos más vibrantes de Colombia. Comienza en la Piedra del Peñol con vistas panorámicas, recorre las calles coloridas de zócalos y casas coloniales, y completa con un paseo por la represa rodeada de naturaleza.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Desayuno y almuerzo tradicional colombiano', 'Opción vegetariana y vegana', 'Visita a la Piedra del Peñol (entrada no incluida)', 'Paseo en bote por la represa', 'City Tour por Guatapé', 'Visita a la granja Alto del Chocho (alimentar llamas)']
      },
      'city-tour': {
        category: 'Cultura · Ciudad',
        title: 'City Tour Medellín',
        image: 'img/tours/city-tour.jpg',
        duration: '6 horas',
        schedule: '9:00 a.m. — 3:00 p.m.',
        desc: 'Explora la historia de Medellín a fondo: Centro Histórico, el arte urbano de la Comuna 13, vistas panorámicas desde el Metrocable, la arquitectura del Pueblito Paisa y el Parque de los Pies Descalzos. Cierra con almuerzo tradicional.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Almuerzo tradicional colombiano', 'Opción vegana y vegetariana', 'Metrocable con vista panorámica', 'Recorrido por la Comuna 13', 'Arte callejero y escaleras eléctricas', 'Pueblito Paisa', 'Centro Histórico']
      },
      'comuna-13': {
        category: 'Cultura · Arte urbano',
        title: 'Tour Comuna 13',
        image: 'img/tours/comuna-13.jpg',
        duration: '3 a 4 horas',
        schedule: '10:00 a.m. — 1:30 p.m. · 2:00 p.m. — 5:30 p.m.',
        desc: 'Símbolo de resiliencia e innovación en Medellín. Camina por calles llenas de grafitis inspiradores, siente la energía del hip-hop local, conoce las famosas escaleras eléctricas y disfruta vistas panorámicas con snack típico.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Relato social, político y cultural', 'Presentación de breakdance y rap', 'Recorrido por las escaleras eléctricas', 'Helado típico artesanal', 'Galerías comunitarias', 'Miradores panorámicos']
      },
      'cabalgata': {
        category: 'Aventura · Naturaleza',
        title: 'Paseo a Caballo',
        image: 'img/tours/cabalgata.jpg',
        duration: '4 horas',
        schedule: '10:00 a.m. — 2:00 p.m. · 2:00 p.m. — 6:00 p.m.',
        desc: 'Recorre las montañas que rodean Medellín por senderos entre paisajes verdes, valles y miradores. Conoce la importancia histórica de la cabalgata en la cultura paisa, fundamental para el transporte de café.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Ruta de 1h 30min a caballo por la montaña', 'Vista panorámica del valle', 'Snacks y bebidas tradicionales']
      },
      'football': {
        category: 'Vida local · Deporte',
        title: 'Football Tour',
        image: 'img/tours/football.jpg',
        duration: '6 horas',
        schedule: 'Sujeto a disponibilidad de partido',
        desc: 'Vive una experiencia futbolera donde el juego es más que un deporte: es una celebración de pasión. Recibe tu entrada y camiseta del equipo, píntate el rostro con los colores del club y vive la energía del estadio como un local.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Entradas al partido', 'Camiseta del equipo local', 'Introducción a la cultura del fútbol', 'Pintacaritas y sorpresas', 'Bebidas y licores tradicionales']
      },
      'cafe-corto': {
        category: 'Café · Experiencia corta',
        title: 'Coffee Experience',
        image: 'img/tours/cafe.jpg',
        duration: '3 horas',
        schedule: '9:30 a.m. — 12:30 p.m. · 2:00 p.m. — 5:00 p.m.',
        desc: 'Descubre los secretos detrás de una de las tazas de café más reconocidas del mundo. Camina por rutas ecológicas en cafetales, recoge granos, aprende a identificar etapas de maduración y cierra con una cata profesional.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Recorrido por cafetales en ruta ecológica', 'Cata de café']
      },
      'cafe-largo': {
        category: 'Café · Experiencia completa',
        title: 'Coffee Experience+',
        image: 'img/tours/cafe-plus.webp',
        duration: '5 horas 30 minutos',
        schedule: '9:30 a.m. — 3:30 p.m.',
        desc: 'Versión extendida del Coffee Experience. Caminata por cafetales, recolección, taller de catación con vestimenta típica cafetera, almuerzo tradicional en finca y souvenir para llevar el recuerdo a casa.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Introducción a la historia y cultura del café', 'Taller de catación', 'Recorrido por rutas ecológicas', 'Almuerzo tradicional colombiano', 'Opción vegetariana y vegana', 'Souvenir']
      },
      'atvs': {
        category: 'Aventura · Adrenalina',
        title: 'ATVs',
        image: 'img/tours/atvs.jpg',
        duration: '3 horas 30 minutos',
        schedule: 'Sujeto a disponibilidad',
        desc: 'Descubre paisajes espectaculares mientras manejas por caminos rurales. Diseñado para amantes de la aventura y la naturaleza, con la adrenalina de superar caminos increíbles sobre 4 ruedas.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Ruta de 1h 30min en cuatrimoto', 'Entrenamiento previo', 'Equipo de protección de calidad', 'Snacks']
      },
      'parapente': {
        category: 'Aventura · Vuelo libre',
        title: 'Parapente',
        image: 'img/tours/parapente.jpg',
        duration: '4 horas 30 minutos',
        schedule: '8:30 a.m. — 1:00 p.m.',
        desc: 'Experiencia inolvidable de parapente sobre Medellín y el Valle de Aburrá. Vuelo de 15 a 20 minutos con instructor certificado. Desde el cielo admirarás las montañas, los valles verdes y la Ciudad de la Eterna Primavera.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Vuelo de 15-20 min con instructor certificado', 'Vista panorámica de Medellín y el Valle de Aburrá', 'Equipo de seguridad', 'Desayuno', 'Opción vegana y vegetariana']
      },
      'green-connection': {
        category: 'Naturaleza · Senderismo',
        title: 'Green Connection',
        image: 'img/tours/green-connection.jpg',
        duration: '5 horas',
        schedule: '9:00 a.m. — 2:00 p.m.',
        desc: 'Reserva ecológica natural a solo 30 minutos de Medellín. Caminata por senderos entre vegetación cruzando arroyos hasta llegar a una cascada natural donde podrás darte un baño. No requiere experiencia previa.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Snack', 'Recorrido por parque natural', 'Información sobre flora y fauna local']
      },
      'santa-fe': {
        category: 'Cultura · Día completo',
        title: 'Santa Fe de Antioquia',
        image: 'img/tours/santa-fe.jpg',
        duration: '7 horas',
        schedule: '8:00 a.m. — 3:00 p.m.',
        desc: 'Viaja atrás en el tiempo a la cuna de la cultura paisa. Calles empedradas, arquitectura colonial, casas de grandes ventanales, la Basílica, el Puente de Occidente y cierre con piscina en finca tradicional.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Plaza principal Simón Bolívar', 'Parque de la Chica', 'Plazuela de Santa Bárbara', 'Basílica de Santa Fe', 'Iglesia de Santa Bárbara', 'Iglesia de Nuestra Señora de Chiquinquirá', 'Puente Colgante de Occidente', 'Finca tradicional con piscina', 'Almuerzo tradicional', 'Opción vegana y vegetariana']
      },
      'pub-crawl': {
        category: 'Vida local · Nightlife',
        title: 'Provenza Pub Crawl',
        image: 'img/tours/provenza.webp',
        duration: '2 horas 30 minutos',
        schedule: 'Jueves de 8:30 p.m. a 11:00 p.m.',
        desc: 'Explora la vida nocturna de Provenza, el corazón de la fiesta en Medellín. Recorrido por los bares y discotecas más populares, cada uno con su estilo. Conoce locales y turistas y vive la hospitalidad paisa de verdad.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Pre-drinks', 'Shots', 'Entrada a bares y clubs']
      },
      'miradores': {
        category: 'Cultura · Atardecer',
        title: 'Tour Miradores',
        image: 'img/tours/miradores.jpg',
        duration: '2 horas 30 minutos',
        schedule: '6:00 p.m. — 11:00 p.m.',
        desc: 'Recorrido espectacular por los miradores más impresionantes de la "Ciudad de la Eterna Primavera". Vistas inolvidables desde los puntos más altos, con historia y cultura compartida por nuestros guías.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Miradores', 'Snacks']
      },
      'frutas': {
        category: 'Cultura · Gastronomía local',
        title: 'Tour de Frutas',
        image: 'img/tours/frutas.jpg',
        duration: '3 horas',
        schedule: '10:00 a.m. — 1:00 p.m.',
        desc: 'Colombia tiene más de 400 variedades de frutas — muchas no existen en ningún otro lugar del mundo. Recorre la plaza de mercado, prueba el lulo, la guanábana, el chontaduro y habla con los comerciantes locales.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Recorrido por mercado agrícola local', 'Degustación de frutas de la región', 'Jugo natural']
      },
      'tiro': {
        category: 'Aventura · Adrenalina',
        title: 'Tour de Tiro',
        image: 'img/tours/tiro.jpg',
        duration: '4 horas',
        schedule: '9:30 a.m. — 1:30 p.m.',
        desc: 'Campo de tiro profesional con los más altos estándares de seguridad. Instructor bilingüe te enseña todo desde cero: postura, empuñadura y técnica. Práctica con pistola 9mm en modalidades libre y táctico.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Transporte ida y regreso', 'Práctica con pistola 9mm', 'Equipo completo de seguridad', 'Snacks y bebidas']
      },
      'bmw': {
        category: 'Aventura · Premium',
        title: 'BMW Tour',
        image: 'img/tours/bmw.jpg',
        duration: '8 horas 30 minutos',
        schedule: '9:00 a.m. — 5:30 p.m.',
        desc: 'Aventura premium sobre motos BMW de alto cilindraje por las rutas más escénicas de Antioquia. Miradores El Zarzal, San Vicente de Ferrer, Concepción (pueblo patrimonio), cascadas, tramo off-road y Guatapé con la Piedra del Peñol.',
        includes: ['Seguro de viaje', 'Guía profesional bilingüe', 'Moto BMW de alto cilindraje', 'Snacks y bebidas en el recorrido', 'Visita a cascadas naturales', 'Tramo off-road', 'Almuerzo tradicional', 'Opción vegana y vegetariana', 'Piedra del Peñol con parqueadero']
      }
    };

    const $img      = tourModal.querySelector('[data-modal-img], .tour-modal__img');
    const $cat      = tourModal.querySelector('[data-modal-category]');
    const $title    = tourModal.querySelector('[data-modal-title]');
    const $desc     = tourModal.querySelector('[data-modal-desc]');
    const $dur      = tourModal.querySelector('[data-modal-duration]');
    const $sched    = tourModal.querySelector('[data-modal-schedule]');
    const $includes = tourModal.querySelector('[data-modal-includes]');
    const $cta      = tourModal.querySelector('.tour-modal__body .btn--terra');
    const $close    = tourModal.querySelector('.tour-modal__close');

    const openTour = (slug) => {
      const t = TOURS[slug];
      if (!t) return;
      if ($img)      $img.src = t.image;
      if ($img)      $img.alt = t.title;
      if ($cat)      $cat.textContent = t.category;
      if ($title)    $title.textContent = t.title;
      if ($desc)     $desc.textContent = t.desc;
      if ($dur)      $dur.textContent = t.duration;
      if ($sched)    $sched.textContent = t.schedule;
      if ($includes) $includes.innerHTML = t.includes.map(i => `<li>${i}</li>`).join('');
      // Mensaje de WhatsApp contextual según el tour abierto
      if ($cta) $cta.href = 'https://wa.me/573011432786?text=' +
        encodeURIComponent('Hola, vi en su web el ' + t.title + ' y me gustaría tener más información.');
      tourModal.classList.add('is-open');
      tourModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tour-modal-open');
      // Reset scroll del body del modal
      const body = tourModal.querySelector('.tour-modal__body');
      if (body) body.scrollTop = 0;
    };

    const closeTour = () => {
      tourModal.classList.remove('is-open');
      tourModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tour-modal-open');
    };

    // Conectar clicks en botones "Ver detalles" y en toda la card
    document.querySelectorAll('[data-tour]').forEach(card => {
      card.addEventListener('click', (e) => {
        const slug = card.dataset.tour;
        if (slug) openTour(slug);
      });
    });

    $close?.addEventListener('click', closeTour);

    // Click fuera del panel cierra
    tourModal.addEventListener('click', (e) => {
      if (e.target === tourModal) closeTour();
    });

    // ESC cierra
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tourModal.classList.contains('is-open')) closeTour();
    });
  }

  // ========== SMOOTH ANCHORS ==========
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});

// ========== GOOGLE REVIEWS LOADER ==========
// Reads config from <div id="google-reviews" data-place-id="..." data-api-key="...">
// Uses the Google Maps JS SDK (Places library) for CORS-safe client-side calls.
// Falls back to statically rendered reviews if key/place-id are missing or request fails.
window.initGoogleReviews = function () {
  const root = document.getElementById('google-reviews');
  if (!root || !window.google || !google.maps || !google.maps.places) return;

  const placeId = root.dataset.placeId;
  if (!placeId) return;

  try {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      { placeId, fields: ['reviews','rating','user_ratings_total','url'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;
        renderGoogleReviews(root, place);
      }
    );
  } catch (err) {
    console.warn('Google Reviews load failed:', err);
  }
};

function renderGoogleReviews(root, place) {
  // Update rating block
  const score = root.querySelector('[data-gr-score]');
  const count = root.querySelector('[data-gr-count]');
  const starsEl = root.querySelector('[data-gr-stars]');
  const linkEl = root.querySelector('[data-gr-link]');

  if (score && place.rating) score.textContent = place.rating.toFixed(1);
  if (count && place.user_ratings_total) count.textContent = `${place.user_ratings_total} reseñas en Google`;
  if (starsEl && place.rating) starsEl.innerHTML = renderStars(place.rating);
  if (linkEl && place.url) linkEl.href = place.url;

  // Replace review cards — sorted: 5★ first, then by recency
  const track = root.querySelector('[data-gr-track]');
  const loading = root.querySelector('[data-gr-loading]');
  if (!track || !place.reviews || !place.reviews.length) return;

  const sorted = [...place.reviews].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const reviews = sorted.slice(0, 8);
  track.innerHTML = reviews.map(r => {
    const initial = (r.author_name || '?').charAt(0).toUpperCase();
    const avatar = r.profile_photo_url
      ? `<img src="${r.profile_photo_url}" alt="${escapeHtml(r.author_name)}" referrerpolicy="no-referrer">`
      : initial;
    return `
      <article class="review--google reveal visible">
        <svg class="review--google__gmark" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.2 8 3l5.7-5.7C34 7.1 29.3 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.5-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.4-2.4 4.5-4.5 5.9l6.2 5.2c-.4.4 6.6-4.9 6.6-15.2 0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        <header class="review--google__header">
          <div class="review--google__avatar">${avatar}</div>
          <div class="review--google__info">
            <p class="review--google__name">${escapeHtml(r.author_name || 'Huésped')}</p>
            <p class="review--google__date">${escapeHtml(r.relative_time_description || '')}</p>
          </div>
        </header>
        <div class="review--google__stars">${renderStars(r.rating || 5)}</div>
        <p class="review--google__text">${escapeHtml(r.text || '')}</p>
      </article>
    `;
  }).join('');

  if (loading) loading.remove();
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========== PHOTO GALLERY LIGHTBOX ==========
(function() {
  const images = [];
  let currentIndex = 0;
  let lb, lbImg, lbCounter, lbCaption;
  let touchStartX = 0;

  function buildLightbox() {
    if (document.getElementById('site-lightbox')) return;
    lb = document.createElement('div');
    lb.id = 'site-lightbox';
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
      <button class="lightbox__close" aria-label="Cerrar galería">
        <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Anterior">
        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Siguiente">
        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="lightbox__inner">
        <div class="lightbox__img-wrap">
          <img class="lightbox__img" alt="">
          <div class="lightbox__counter"></div>
        </div>
        <p class="lightbox__caption"></p>
      </div>`;
    document.body.appendChild(lb);
    lbImg      = lb.querySelector('.lightbox__img');
    lbCounter  = lb.querySelector('.lightbox__counter');
    lbCaption  = lb.querySelector('.lightbox__caption');

    lb.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => showImage(currentIndex - 1));
    lb.querySelector('.lightbox__nav--next').addEventListener('click', () => showImage(currentIndex + 1));

    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) showImage(currentIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });
  }

  function showImage(idx) {
    currentIndex = ((idx % images.length) + images.length) % images.length;
    lbImg.classList.remove('is-loaded');
    const item = images[currentIndex];
    lbImg.onload = () => lbImg.classList.add('is-loaded');
    lbImg.src = item.src;
    lbImg.alt = item.alt || '';
    lbCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    lbCaption.textContent = item.alt || '';
  }

  function openLightbox(idx) {
    buildLightbox();
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showImage(idx);
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.gallery-section');
    if (!section) return;
    const items = section.querySelectorAll('.gallery-item');
    items.forEach((item, idx) => {
      const img = item.querySelector('img');
      if (img) images.push({ src: img.src || img.dataset.src, alt: img.alt });
      item.addEventListener('click', () => openLightbox(idx));
    });
  });
})();

// ========== GALLERY CAROUSEL ==========
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const track    = document.getElementById('galleryTrack');
    const dotsWrap = document.getElementById('galleryDots');
    const prevBtn  = document.querySelector('.gallery-carousel-btn--prev');
    const nextBtn  = document.querySelector('.gallery-carousel-btn--next');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const slides = track.querySelectorAll('.gallery-section__slide');
    const total  = slides.length;
    let current  = 0;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gallery-carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Diapositiva ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function updateDots() {
      dotsWrap.querySelectorAll('.gallery-carousel-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
      });
    }

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch / drag support
    let dragStartX = 0, dragging = false, moved = false;

    track.addEventListener('mousedown', (e) => {
      dragStartX = e.clientX; dragging = true; moved = false;
      track.classList.add('is-dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - dragStartX) > 5) moved = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (moved) {
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
      }
    });

    track.addEventListener('touchstart', (e) => {
      dragStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = dragStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    }, { passive: true });
  });
})();

// ========== GOOGLE REVIEWS CAROUSEL ==========
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const scroll = document.querySelector('.google-reviews__scroll');
    if (!scroll) return;
    const track = scroll.querySelector('[data-gr-track]');
    if (!track) return;

    // Controls container (injected after the scroll wrapper)
    const controls = document.querySelector('.reviews-carousel-controls');
    if (!controls) return;

    const prevBtn = controls.querySelector('.reviews-carousel-btn--prev');
    const nextBtn = controls.querySelector('.reviews-carousel-btn--next');
    const dotsWrap = controls.querySelector('.reviews-carousel-dots');

    let cards = [];
    let current = 0;
    let perPage = 3;
    let maxIndex = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;
    let currentTranslate = 0;

    function getPerPage() {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }

    function getCardWidth() {
      const card = cards[0];
      if (!card) return 0;
      return card.offsetWidth + 16; // gap = 16px (var(--space-md) fallback)
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const d = document.createElement('button');
        d.className = 'reviews-carousel-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Ir a reseña ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.reviews-carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
    }

    function goTo(idx) {
      perPage = getPerPage();
      maxIndex = Math.max(0, cards.length - perPage);
      current = Math.min(Math.max(idx, 0), maxIndex);
      const translateX = -(current * getCardWidth());
      track.style.transform = `translateX(${translateX}px)`;
      currentTranslate = translateX;
      updateDots();
    }

    function init() {
      cards = Array.from(track.querySelectorAll('.review--google'));
      if (!cards.length) return;
      perPage = getPerPage();
      maxIndex = Math.max(0, cards.length - perPage);
      buildDots();

      if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

      // Drag support
      track.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartTranslate = currentTranslate;
        track.classList.add('is-dragging');
        e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const diff = e.clientX - dragStartX;
        track.style.transform = `translateX(${dragStartTranslate + diff}px)`;
      });
      window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');
        const diff = e.clientX - dragStartX;
        if (Math.abs(diff) > 60) goTo(current + (diff < 0 ? 1 : -1));
        else goTo(current);
      });

      // Touch
      track.addEventListener('touchstart', (e) => {
        dragStartX = e.touches[0].clientX;
        dragStartTranslate = currentTranslate;
      }, { passive: true });
      track.addEventListener('touchend', (e) => {
        const diff = dragStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 60) goTo(current + (diff > 0 ? 1 : -1));
      }, { passive: true });

      window.addEventListener('resize', () => goTo(current));
    }

    // Observe track changes (when API loads real reviews)
    const mo = new MutationObserver(() => { init(); });
    mo.observe(track, { childList: true });

    init();
  });
})();

// ========== GALLERY SLIDER ==========
class GallerySlider {
  constructor(el) {
    this.el = el;
    this.track = el.querySelector('.suite-gallery__track');
    this.slides = el.querySelectorAll('.suite-gallery__slide');
    this.dots = el.querySelector('.suite-gallery__dots');
    this.prev = el.querySelector('.suite-gallery__nav--prev');
    this.next = el.querySelector('.suite-gallery__nav--next');
    this.i = 0;
    this.n = this.slides.length;
    if (this.n <= 1) return;
    this.init();
  }
  init() {
    if (this.dots) {
      this.slides.forEach((_, idx) => {
        const d = document.createElement('button');
        d.className = 'suite-gallery__dot' + (idx === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Imagen ${idx + 1}`);
        d.addEventListener('click', () => this.go(idx));
        this.dots.appendChild(d);
      });
    }
    if (this.prev) this.prev.addEventListener('click', () => this.go(this.i - 1));
    if (this.next) this.next.addEventListener('click', () => this.go(this.i + 1));
    let startX = 0;
    this.track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    this.track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) this.go(this.i + (diff > 0 ? 1 : -1));
    }, { passive: true });
    this.timer = setInterval(() => this.go(this.i + 1), 6000);
    this.el.addEventListener('mouseenter', () => clearInterval(this.timer));
    this.el.addEventListener('mouseleave', () => this.timer = setInterval(() => this.go(this.i + 1), 6000));
  }
  go(idx) {
    this.i = ((idx % this.n) + this.n) % this.n;
    this.track.style.transform = `translateX(-${this.i * 100}%)`;
    if (this.dots) this.dots.querySelectorAll('.suite-gallery__dot').forEach((d, k) => d.classList.toggle('active', k === this.i));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.suite-gallery').forEach(el => new GallerySlider(el));
});
