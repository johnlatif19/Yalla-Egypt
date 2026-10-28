import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { adminGetSettings, adminUpdateSettings, adminUploadImage } from '/assets/js/core/api.js';
import { initGuard, mountLogoutButton } from './guard.js';

let currentSettings = {};

function fillForm(settings) {
  currentSettings = settings || {};
  const form = document.getElementById('settings-form');
  if (!form) return;

  const map = {
    brandNameEn: settings.brandName?.en || '',
    brandNameAr: settings.brandName?.ar || '',
    contactEmail: settings.contact?.email || '',
    contactPhone: settings.contact?.phone || '',
    contactWhatsapp: settings.contact?.whatsapp || '',
    contactLocation: settings.contact?.location || '',
    guideName: settings.guide?.name || '',
    guideBioEn: settings.guide?.bio?.en || '',
    guideBioAr: settings.guide?.bio?.ar || '',
    guideLanguages: (settings.guide?.languages || []).join(', '),
    socialInstagram: settings.social?.instagram || '',
    socialFacebook: settings.social?.facebook || '',
    socialTiktok: settings.social?.tiktok || '',
    defaultCurrency: settings.currency?.default || '',
    seoTitleEn: settings.seo?.title?.en || '',
    seoTitleAr: settings.seo?.title?.ar || '',
    seoDescEn: settings.seo?.description?.en || '',
    seoDescAr: settings.seo?.description?.ar || ''
  };

  Object.entries(map).forEach(([name, value]) => {
    const input = form.elements.namedItem(name);
    if (input) input.value = value;
  });

  const photoWrapper = document.getElementById('guide-photo-preview');
  if (photoWrapper) {
    if (settings.guide?.photoUrl) {
      photoWrapper.innerHTML = `<img src="${settings.guide.photoUrl}" alt="">`;
    } else {
      photoWrapper.innerHTML = '';
    }
  }
}

function collectForm() {
  const form = document.getElementById('settings-form');
  const formData = new FormData(form);

  const languages = (formData.get('guideLanguages')?.toString() || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    brandName: {
      en: formData.get('brandNameEn')?.toString().trim() || '',
      ar: formData.get('brandNameAr')?.toString().trim() || ''
    },
    contact: {
      email: formData.get('contactEmail')?.toString().trim() || '',
      phone: formData.get('contactPhone')?.toString().trim() || '',
      whatsapp: formData.get('contactWhatsapp')?.toString().trim() || '',
      location: formData.get('contactLocation')?.toString().trim() || ''
    },
    guide: {
      name: formData.get('guideName')?.toString().trim() || '',
      bio: {
        en: formData.get('guideBioEn')?.toString().trim() || '',
        ar: formData.get('guideBioAr')?.toString().trim() || ''
      },
      languages,
      photoUrl: currentSettings.guide?.photoUrl || null
    },
    social: {
      instagram: formData.get('socialInstagram')?.toString().trim() || '',
      facebook: formData.get('socialFacebook')?.toString().trim() || '',
      tiktok: formData.get('socialTiktok')?.toString().trim() || ''
    },
    currency: {
      default: formData.get('defaultCurrency')?.toString().trim() || ''
    },
    seo: {
      title: {
        en: formData.get('seoTitleEn')?.toString().trim() || '',
        ar: formData.get('seoTitleAr')?.toString().trim() || ''
      },
      description: {
        en: formData.get('seoDescEn')?.toString().trim() || '',
        ar: formData.get('seoDescAr')?.toString().trim() || ''
      }
    }
  };
}

async function loadSettings() {
  try {
    const settings = await adminGetSettings();
    fillForm(settings);
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  mountLogoutButton();

  const user = await initGuard();
  if (!user) return;

  await loadSettings();

  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = collectForm();
      const saveBtn = document.getElementById('settings-save-btn');
      if (saveBtn) saveBtn.disabled = true;
      try {
        await adminUpdateSettings(payload);
        currentSettings = { ...currentSettings, ...payload };
        showToast(t('dashboard.savedSuccess'), 'success');
      } catch (error) {
        showToast(error.message || t('dashboard.saveError'), 'error');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  const photoInput = document.getElementById('guide-photo-input');
  const photoBtn = document.getElementById('guide-photo-btn');
  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', async () => {
      const file = photoInput.files?.[0];
      if (!file) return;
      try {
        const result = await adminUploadImage(file, { altEn: 'Guide portrait', altAr: 'صورة المرشد' });
        currentSettings.guide = currentSettings.guide || {};
        currentSettings.guide.photoUrl = result.secureUrl;
        const wrapper = document.getElementById('guide-photo-preview');
        if (wrapper) wrapper.innerHTML = `<img src="${result.secureUrl}" alt="">`;
        showToast(t('dashboard.uploadSuccess'), 'success');
      } catch (error) {
        showToast(error.message || t('dashboard.uploadError'), 'error');
      }
      photoInput.value = '';
    });
  }
}

init();