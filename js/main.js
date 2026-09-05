/**
 * PoConuts — B2B Export Portal Main Application Logic
 * Persistent Localization, Interactive Container Calculator,
 * Mobile Drawer, and B2B RFQ Form Handler
 */

(function () {
  'use strict';

  // --- 1. Language & State Management ---
  const DEFAULT_LANG = 'en';
  let currentLang = localStorage.getItem('poconuts_lang') || DEFAULT_LANG;

  function initLanguage() {
    if (!translations[currentLang]) {
      currentLang = DEFAULT_LANG;
    }
    setLanguage(currentLang, false);

    // Attach listeners to all language switcher buttons across desktop & mobile
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        if (lang && (lang === 'en' || lang === 'vi')) {
          setLanguage(lang, true);
        }
      });
    });
  }

  function setLanguage(lang, persist = true) {
    if (!translations[lang]) return;
    currentLang = lang;
    if (persist) {
      localStorage.setItem('poconuts_lang', lang);
    }
    document.documentElement.lang = lang;

    // Update active class on switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const dict = translations[lang];

    // Update text content / HTML
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Update input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update document title if present
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n-title');
    if (titleKey && dict[titleKey]) {
      document.title = dict[titleKey];
    }

    // Refresh calculator outputs if present
    if (typeof updateCalculator === 'function') {
      updateCalculator();
    }
  }

  // --- 2. Mobile Drawer Navigation ---
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.mobile-drawer-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');

    if (!toggleBtn || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Close on navigation click inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // --- 3. Interactive Container & Volume Calculator ---
  function initCalculator() {
    const containerSelect = document.getElementById('calc-container');
    const packingSelect = document.getElementById('calc-packing');
    if (!containerSelect || !packingSelect) return;

    containerSelect.addEventListener('change', updateCalculator);
    packingSelect.addEventListener('change', updateCalculator);

    const applyBtn = document.getElementById('calc-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const estText = getCalculatorSummary();
        const volumeInput = document.getElementById('form-volume');
        const packingInput = document.getElementById('form-packaging');
        const quoteSection = document.getElementById('inquiry') || document.getElementById('rfq-form');

        if (volumeInput) {
          volumeInput.value = estText.volumeText;
        }
        if (packingInput && packingSelect) {
          packingInput.value = packingSelect.value;
        }
        if (quoteSection) {
          quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    updateCalculator();
  }

  function updateCalculator() {
    const containerSelect = document.getElementById('calc-container');
    const packingSelect = document.getElementById('calc-packing');
    if (!containerSelect || !packingSelect) return;

    const containerType = containerSelect.value; // '40hc' | '20gp'
    const packingType = packingSelect.value; // 'mesh50' | 'mesh25' | 'carton25'

    let totalNuts = 46000;
    let avgWeightKg = 0.45; // 450 grams standard average

    if (containerType === '40hc') {
      totalNuts = packingType === 'mesh50' ? 46000 : (packingType === 'mesh25' ? 45000 : 42000);
    } else {
      // 20ft Reefer
      totalNuts = packingType === 'mesh50' ? 22000 : (packingType === 'mesh25' ? 21500 : 20000);
    }

    const grossWeightMt = ((totalNuts * avgWeightKg * 1.05) / 1000).toFixed(1); // includes packaging tare
    let totalPackages = 0;

    if (packingType === 'mesh50') {
      totalPackages = Math.round(totalNuts / 50);
    } else {
      totalPackages = Math.round(totalNuts / 25);
    }

    const elNuts = document.getElementById('calc-res-nuts');
    const elWeight = document.getElementById('calc-res-weight');
    const elBags = document.getElementById('calc-res-bags');

    if (elNuts) elNuts.textContent = totalNuts.toLocaleString() + (currentLang === 'vi' ? ' quả' : ' nuts');
    if (elWeight) elWeight.textContent = `~${grossWeightMt} MT (${grossWeightMt * 1000} kg)`;
    if (elBags) {
      const unit = (packingType === 'carton25') 
        ? (currentLang === 'vi' ? ' thùng' : ' cartons')
        : (currentLang === 'vi' ? ' bao lưới' : ' mesh bags');
      elBags.textContent = totalPackages.toLocaleString() + unit;
    }
  }

  function getCalculatorSummary() {
    const containerSelect = document.getElementById('calc-container');
    const is40 = containerSelect ? containerSelect.value === '40hc' : true;
    if (currentLang === 'vi') {
      return {
        volumeText: is40 ? "1 Container 40ft HC Reefer (~46.000 quả / ~22 tấn)" : "1 Container 20ft Reefer (~22.000 quả / ~11 tấn)"
      };
    } else {
      return {
        volumeText: is40 ? "1 x 40ft High-Cube Reefer Container (~46,000 nuts / ~22 MT)" : "1 x 20ft Standard Reefer Container (~22,000 nuts / ~11 MT)"
      };
    }
  }

  // --- 4. B2B RFQ Form Submission & Mock CRM Webhook ---
  function initQuoteForm() {
    const form = document.getElementById('b2b-rfq-form');
    if (!form) return;

    // Quick Country Selection Pills
    const countryPills = document.querySelectorAll('.country-pill');
    const countrySelect = document.getElementById('form-country');
    countryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        countryPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const val = e.currentTarget.getAttribute('data-val');
        if (countrySelect && val) {
          countrySelect.value = val;
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = translations[currentLang]?.formSubmitting || 'Submitting...';
      }

      // Collect B2B inquiry payload
      const refCode = 'PCN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const payload = {
        referenceId: refCode,
        timestamp: new Date().toISOString(),
        language: currentLang,
        company: document.getElementById('form-company')?.value || '',
        contactName: document.getElementById('form-contact-name')?.value || '',
        email: document.getElementById('form-email')?.value || '',
        phone: document.getElementById('form-phone')?.value || '',
        country: document.getElementById('form-country')?.value || '',
        portOfDischarge: document.getElementById('form-port')?.value || '',
        productInterest: document.getElementById('form-product')?.value || '',
        packaging: document.getElementById('form-packaging')?.value || '',
        volume: document.getElementById('form-volume')?.value || '',
        incoterm: document.getElementById('form-incoterm')?.value || '',
        message: document.getElementById('form-message')?.value || ''
      };

      console.info('[PoConuts B2B Export Gateway] Inbound RFQ Payload:', payload);

      // Email dispatch to gggaravind@gmail.com & akcvarun@gmail.com
      const emailPayload = {
        _subject: `[PoConuts B2B Inquiry] ${payload.company} (${payload.country}) - ${payload.referenceId}`,
        _cc: 'akcvarun@gmail.com',
        _template: 'table',
        _captcha: 'false',
        'Reference ID': payload.referenceId,
        'Company Name': payload.company,
        'Contact Person': payload.contactName,
        'Email Address': payload.email,
        'Phone / WhatsApp': payload.phone,
        'Destination Country': payload.country,
        'Port of Discharge (POD)': payload.portOfDischarge || 'To be confirmed',
        'Product Interest': payload.productInterest,
        'Packaging Preference': payload.packaging,
        'Estimated Volume': payload.volume,
        'Requested Incoterm': payload.incoterm,
        'Buyer Specifications / Notes': payload.message || 'None provided',
        'Timestamp (UTC)': payload.timestamp,
        'Language Selected': payload.language.toUpperCase()
      };

      fetch('https://formsubmit.co/ajax/gggaravind@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      })
      .then(res => res.json())
      .then(data => {
        console.info('[PoConuts Email Gateway Success]:', data);
      })
      .catch(err => {
        console.warn('[PoConuts Email Gateway Warning]:', err);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Hide form and display high-trust B2B confirmation modal
        form.style.display = 'none';
        const successBox = document.getElementById('inquiry-success');
        const refDisplay = document.getElementById('inquiry-ref-id');
        if (refDisplay) {
          refDisplay.textContent = refCode;
        }
        if (successBox) {
          successBox.classList.add('active');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Store latest RFQ in sessionStorage for optional summary export
        sessionStorage.setItem('last_poconuts_rfq', JSON.stringify(payload));
      });
    });

    // Reset button to submit new inquiry
    const resetBtn = document.getElementById('btn-reset-inquiry');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.style.display = 'block';
        const successBox = document.getElementById('inquiry-success');
        if (successBox) successBox.classList.remove('active');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Download/Save summary button
    const saveSummaryBtn = document.getElementById('btn-save-summary');
    if (saveSummaryBtn) {
      saveSummaryBtn.addEventListener('click', () => {
        const raw = sessionStorage.getItem('last_poconuts_rfq');
        if (!raw) return;
        const data = JSON.parse(raw);
        const text = `=====================================================
POCONUTS EXPORT DESK — B2B INQUIRY SUMMARY
Direct Sourcing: Pollachi, Tamil Nadu, India
=====================================================
Reference ID:       ${data.referenceId}
Date / Time:        ${data.timestamp}
Company:            ${data.company}
Contact Person:     ${data.contactName}
Email:              ${data.email}
Phone / WhatsApp:   ${data.phone}
Destination Country:${data.country}
Discharge Port:     ${data.portOfDischarge || 'To be specified'}
Product:            ${data.productInterest}
Packaging:          ${data.packaging}
Estimated Volume:   ${data.volume}
Trade Terms:        ${data.incoterm}
Notes / Reqmts:     ${data.message || 'None'}
=====================================================
Standard Specs: Semi-Husked Mature Coconuts, 450g avg (400-550g).
HS Code: 0801 19 10 (India DGFT ITC-HS Schedule).
Cultivation: Naturally grown pesticide-free; formal organic cert in progress.
Official Desk: export@poconuts.com | Pollachi, Tamil Nadu, India
=====================================================`;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PoConuts-Inquiry-${data.referenceId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  }

  // --- 5. Print Technical Datasheet Helper ---
  function initPrintHelper() {
    const printBtns = document.querySelectorAll('.btn-print-specs');
    printBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.print();
      });
    });
  }

  // --- Document Ready Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initMobileNav();
    initCalculator();
    initQuoteForm();
    initPrintHelper();
  });

})();
