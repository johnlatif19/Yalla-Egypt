import 'dotenv/config';
import admin from 'firebase-admin';
import { env } from '../server/config/env.js';

function initFirebase() {
  if (admin.apps.length) return admin.firestore();
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    })
  });
  return admin.firestore();
}

const SAMPLE_TOURS = [
  {
    slug: 'giza-pyramids-tour',
    title: {
      en: 'Giza Pyramids and Sphinx',
      ar: 'أهرامات الجيزة وأبو الهول'
    },
    shortDescription: {
      en: 'A full-day visit to the Giza plateau, the Sphinx, and the Egyptian Museum.',
      ar: 'زيارة يوم كامل لهضبة الجيزة وأبو الهول والمتحف المصري.'
    },
    description: {
      en: 'Spend the day exploring the most recognized monuments in Egypt. The visit covers the Great Pyramid, the Sphinx, and the Egyptian Museum in Tahrir. The pace is adjusted to what you want to spend time on.',
      ar: 'اقضِ اليوم في استكشاف أشهر الآثار في مصر. تشمل الزيارة الهرم الأكبر وأبو الهول والمتحف المصري في التحرير. يتم تعديل الإيقاع حسب ما تريد قضاء الوقت فيه.'
    },
    duration: 'full-day',
    location: 'Giza, Cairo',
    category: 'historical',
    price: 120,
    currency: 'USD',
    coverImage: null,
    included: [
      { en: 'Private guide throughout the day', ar: 'مرشد خاص طوال اليوم' },
      { en: 'Air-conditioned transport', ar: 'مواصلات مكيفة' }
    ],
    excluded: [
      { en: 'Entrance fees to sites', ar: 'رسوم الدخول للمواقع' },
      { en: 'Meals and drinks', ar: 'الوجبات والمشروبات' }
    ],
    itinerary: [
      { en: 'Morning pickup from your hotel', ar: 'الالتقاط صباحاً من فندقك' },
      { en: 'Visit the Great Pyramid and Sphinx', ar: 'زيارة الهرم الأكبر وأبو الهول' },
      { en: 'Lunch break at a local restaurant', ar: 'استراحة غداء في مطعم محلي' },
      { en: 'Egyptian Museum in the afternoon', ar: 'المتحف المصري بعد الظهر' }
    ],
    meetingPoint: 'Hotel lobby in Cairo or Giza',
    availabilityNotes: 'Available daily except Fridays',
    cancellationPolicy: 'Free cancellation up to 48 hours before the tour.',
    faq: [
      { question: { en: 'Are entrance fees included?', ar: 'هل رسوم الدخول مشمولة؟' }, answer: { en: 'No, entrance fees are paid separately on site.', ar: 'لا، رسوم الدخول تُدفع منفصلة في الموقع.' } }
    ],
    published: true,
    featured: true
  },
  {
    slug: 'islamic-cairo-walking-tour',
    title: {
      en: 'Islamic Cairo Walking Tour',
      ar: 'جولة مشي في القاهرة الإسلامية'
    },
    shortDescription: {
      en: 'A guided walk through the historic streets of Islamic Cairo.',
      ar: 'جولة مشي مرشدة في شوارع القاهرة الإسلامية التاريخية.'
    },
    description: {
      en: 'Walk through the alleys of historic Cairo, from Khan el-Khalili to the mosques and madrasas of the old city. The tour focuses on everyday life, architecture, and the layered history of the area.',
      ar: 'تجوّل في أزقة القاهرة التاريخية، من خان الخليلي إلى المساجد والمدارس في المدينة القديمة. تركز الجولة على الحياة اليومية والعمارة والتاريخ المتراكم للمنطقة.'
    },
    duration: 'half-day',
    location: 'Cairo',
    category: 'cultural',
    price: 60,
    currency: 'USD',
    coverImage: null,
    included: [
      { en: 'Local guide', ar: 'مرشد محلي' }
    ],
    excluded: [
      { en: 'Food and drinks', ar: 'الطعام والمشروبات' }
    ],
    itinerary: [
      { en: 'Meet at Khan el-Khalili entrance', ar: 'اللقاء عند مدخل خان الخليلي' },
      { en: 'Walk through the old city', ar: 'المشي في المدينة القديمة' },
      { en: 'Stop at Al-Azhar and surrounding streets', ar: 'التوقف عند الأزهر والشوارع المحيطة' }
    ],
    meetingPoint: 'Khan el-Khalili main entrance',
    availabilityNotes: 'Available Tuesday to Sunday',
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    published: true,
    featured: true
  },
  {
    slug: 'nile-dinner-cruise',
    title: {
      en: 'Nile Dinner Cruise',
      ar: 'رحلة عشاء على النيل'
    },
    shortDescription: {
      en: 'An evening on the Nile with dinner and live music.',
      ar: 'أمسية على النيل مع العشاء والموسيقى الحية.'
    },
    description: {
      en: 'A relaxed evening on the Nile. The cruise includes dinner, live music, and views of the Cairo skyline from the river.',
      ar: 'أمسية هادئة على النيل. تشمل الرحلة العشاء والموسيقى الحية وإطلالات على أفق القاهرة من النهر.'
    },
    duration: 'half-day',
    location: 'Cairo',
    category: 'nile',
    price: 45,
    currency: 'USD',
    coverImage: null,
    included: [
      { en: 'Dinner buffet', ar: 'بوفيه عشاء' },
      { en: 'Live music show', ar: 'عرض موسيقى حية' }
    ],
    excluded: [
      { en: 'Hotel transfers', ar: 'التوصيل من وإلى الفندق' }
    ],
    itinerary: [
      { en: 'Boarding at the Nile dock', ar: 'الصعود من رصيف النيل' },
      { en: 'Dinner and live show', ar: 'العشاء والعرض الحي' }
    ],
    meetingPoint: 'Nile dock, Zamalek',
    availabilityNotes: 'Daily except Mondays',
    cancellationPolicy: 'Free cancellation up to 24 hours before the tour.',
    faq: [],
    published: true,
    featured: false
  }
];

const SAMPLE_SETTINGS = {
  brandName: { en: 'Yalla Egypt', ar: 'يلا مصر' },
  contact: {
    email: 'hello@yalla-egypt.com',
    phone: '+20 100 000 0000',
    whatsapp: '+20 100 000 0000',
    location: 'Cairo, Egypt'
  },
  guide: {
    name: 'Your guide',
    bio: {
      en: 'A personal Egyptian guide with experience leading small groups through the country. The tours are designed around what you want to see, not around a fixed script.',
      ar: 'مرشد مصري شخصي لديه خبرة في قيادة مجموعات صغيرة عبر البلاد. صُممت الجولات حول ما تريد رؤيته، لا حول نص ثابت.'
    },
    languages: ['English', 'Arabic'],
    specialties: ['Historical sites', 'Cultural tours', 'Custom itineraries'],
    photoUrl: null
  },
  social: {
    instagram: '',
    facebook: '',
    tiktok: ''
  },
  currency: { default: 'USD' },
  seo: {
    title: { en: 'Yalla Egypt — Personal Egyptian tour guide', ar: 'يلا مصر — مرشد سياحي مصري شخصي' },
    description: { en: 'Tours led personally by an Egyptian guide.', ar: 'جولات يقودها مرشد مصري شخصياً.' }
  },
  experiences: [
    {
      title: { en: 'Historical sightseeing', ar: 'زيارات تاريخية' },
      description: { en: 'Pyramids, temples, and museums.', ar: 'الأهرامات والمعابد والمتاحف.' },
      imageUrl: ''
    },
    {
      title: { en: 'Cultural visits', ar: 'زيارات ثقافية' },
      description: { en: 'Markets, mosques, and old neighborhoods.', ar: 'الأسواق والمساجد والأحياء القديمة.' },
      imageUrl: ''
    },
    {
      title: { en: 'Nile experiences', ar: 'تجارب على النيل' },
      description: { en: 'Felucca rides and dinner cruises.', ar: 'جولات الفلوكة ورحلات العشاء.' },
      imageUrl: ''
    },
    {
      title: { en: 'Local food', ar: 'الطعام المحلي' },
      description: { en: 'Street food and home-style meals.', ar: 'طعام الشارع والوجبات المنزلية.' },
      imageUrl: ''
    },
    {
      title: { en: 'Custom itineraries', ar: 'برامج مخصصة' },
      description: { en: 'Tours designed around your interests.', ar: 'جولات مصممة حسب اهتماماتك.' },
      imageUrl: ''
    },
    {
      title: { en: 'Day trips', ar: 'رحلات يومية' },
      description: { en: 'Alexandria, Fayoum, and beyond.', ar: 'الإسكندرية والفيوم وما هو أبعد.' },
      imageUrl: ''
    }
  ]
};

async function seedTours(db) {
  const existing = await db.collection('tours').limit(1).get();
  if (!existing.empty) {
    console.log('Tours collection already has data — skipping tour seed.');
    return;
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  for (const tour of SAMPLE_TOURS) {
    const ref = db.collection('tours').doc();
    await ref.set({
      ...tour,
      createdAt: now,
      updatedAt: now
    });
    console.log(`Created tour: ${tour.slug}`);
  }
}

async function seedSettings(db) {
  const docRef = db.collection('settings').doc('site');
  const doc = await docRef.get();
  if (doc.exists) {
    console.log('Settings document already exists — skipping settings seed.');
    return;
  }

  await docRef.set({
    ...SAMPLE_SETTINGS,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Created settings document.');
}

async function main() {
  const db = initFirebase();
  console.log('Seeding Firestore...');
  await seedTours(db);
  await seedSettings(db);
  console.log('Done.');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});