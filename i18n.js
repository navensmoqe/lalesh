// Shared copy for static UI, scene markers, and interaction status messages.
// Language changes update the existing scene without resetting the camera or tour.
export const messages = {
  ar: {
    pageTitle: 'معبد لالش · الوادي المقدّس',
    description: 'اكتشف جمال معبد لالش في شمال العراق في تجربة ثلاثية الأبعاد تفاعلية، بين ضوء النهار وسكينة الليل.',
    experience: 'تجربة معبد لالش ثلاثية الأبعاد',
    sceneHelp: 'مجسم معبد لالش. اسحب للتدوير، ومرر للتقريب. استخدم مفاتيح الأسهم للتدوير وعلامتي الجمع والطرح للتقريب.',
    home: 'معبد لالش، الصفحة الرئيسية', brand: 'لالش', sacredValley: 'الوادي المقدّس',
    headerIntro: 'رحلة في المكان والسكينة', info: 'معلومات', language: 'English', languageAction: 'Switch to English',
    location: 'شمال العراق', temple: 'معبد لالش', tagline: 'حيث يلتقي نور الحجر بسكينة الوادي',
    interpretation: 'تصوّر ثلاثي الأبعاد مستوحى من المكان', lighting: 'إضاءة المشهد', day: 'الوضع النهاري', night: 'الوضع الليلي',
    cameraTools: 'أدوات العرض', zoomIn: 'تقريب', zoomOut: 'إبعاد', reset: 'إعادة ضبط الكاميرا', fullscreen: 'ملء الشاشة', exitFullscreen: 'الخروج من ملء الشاشة',
    valleyStillness: 'سكينة الوادي', overview: 'منظور عام · لالش',
    desktopHint: 'اسحب للاستكشاف · مرّر للتقريب', mobileHint: 'اسحب للتدوير · باعد بإصبعين للتقريب',
    startTour: 'جولة تلقائية', stopTour: 'إيقاف الجولة', toggleLabels: 'إظهار/إخفاء التسميات', showLabels: 'إظهار التسميات', hideLabels: 'إخفاء التسميات',
    northDirection: 'اتجاه الشمال', north: 'ش', loadingTitle: 'يُضيء الوادي…', loadingDetail: 'لحظات وتبدأ رحلتك',
    errorTitle: 'تعذّر عرض المشهد', errorDetail: 'يتطلب المشهد متصفحاً يدعم WebGL 2. يرجى تحديث المتصفح وتفعيل تسريع الرسوم.', retry: 'إعادة المحاولة',
    closeInfo: 'إغلاق المعلومات', about: 'عن المكان', infoTitle: 'لالش، وادٍ مقدّس',
    infoMain: 'معبد لالش هو أقدس موقع ديني عند الإيزيديين، ويتميز بطرازه الروحي الفريد وأبراجه المخروطية الشهيرة.',
    infoLandscape: 'بين سفوح الجبال في شمال العراق، تتجاور القباب المضلّعة والساحات الحجرية في مشهد يسوده الهدوء.',
    infoNote: 'هذا العمل قراءة فنية مستوحاة من عمارة لالش وطبيعتها، وليس توثيقاً مساحياً أو إعادة بناء مطابقة للموقع.',
    explore: 'استكشف على مهل',
    help: 'اسحب لتدور حول المعبد، ومرّر لتقترب من التفاصيل. يمكنك اختيار جولة تلقائية أو الضغط على إحدى التسميات للاقتراب من موضعها. تدعم الكاميرا مفاتيح الأسهم و + و −، ومفتاح R لإعادة ضبطها.',
    unesco: 'لالش لدى اليونسكو', exportModel: 'تنزيل المجسّم',
    exportPreparing: 'جارٍ إعداد المجسّم…', exportReady: 'تم إعداد المعبد والساحة بصيغة GLB.', exportError: 'تعذّر إعداد الملف. حاول مرة أخرى.',
    tourStarted: 'بدأت الجولة التلقائية. اسحب المشهد أو اضغط إيقاف الجولة للتحكم بالكاميرا.',
    tourCompleted: 'اكتملت الجولة. يمكنك الآن استكشاف المعبد بحرية.', fullscreenHelp: 'يمكنك استخدام عرض الشاشة الكاملة من قائمة المتصفح.',
    mainTemple: 'المعبد الرئيسي', entrance: 'المدخل', courtyard: 'الساحة', conicalTower: 'البرج المخروطي', stonePath: 'الممر الحجري',
    detailView: 'تفاصيل من الوادي المقدّس', tourView: 'جولة في الوادي المقدّس',
    stoneArchitecture: 'عمارة الحجر', sacredDomes: 'القباب المقدّسة', mountains: 'بين الجبال', arcades: 'أروقة الساحة', threshold: 'عتبة المعبد', seconds: 'ث',
  },
  en: {
    pageTitle: 'Lalish Temple · The Sacred Valley',
    description: 'Explore Lalish Temple in Northern Iraq through an interactive 3D experience, from daylight to the stillness of night.',
    experience: 'Lalish Temple 3D experience',
    sceneHelp: '3D model of Lalish Temple. Drag to orbit and scroll to zoom. Use arrow keys to orbit and plus or minus to zoom.',
    home: 'Lalish Temple, home', brand: 'Lalish', sacredValley: 'The Sacred Valley',
    headerIntro: 'A journey into place and serenity', info: 'Information', language: 'العربية', languageAction: 'التبديل إلى العربية',
    location: 'Northern Iraq', temple: 'Lalish Temple', tagline: 'Where the glow of stone meets the valley’s stillness',
    interpretation: 'A 3D interpretation inspired by Lalish', lighting: 'Scene lighting', day: 'Day mode', night: 'Night mode',
    cameraTools: 'View controls', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset camera', fullscreen: 'Full screen', exitFullscreen: 'Exit full screen',
    valleyStillness: 'The valley’s stillness', overview: 'Overview · Lalish',
    desktopHint: 'Drag to explore · Scroll to zoom', mobileHint: 'Drag to orbit · Pinch to zoom',
    startTour: 'Guided tour', stopTour: 'Stop tour', toggleLabels: 'Show/hide labels', showLabels: 'Show labels', hideLabels: 'Hide labels',
    northDirection: 'North direction', north: 'N', loadingTitle: 'The valley awakens…', loadingDetail: 'Your journey begins in a moment',
    errorTitle: 'Unable to display the scene', errorDetail: 'This scene requires a browser with WebGL 2 support. Please update your browser and enable graphics acceleration.', retry: 'Try again',
    closeInfo: 'Close information', about: 'About the place', infoTitle: 'Lalish, a sacred valley',
    infoMain: 'Lalish Temple is the holiest religious site for the Yazidis, distinguished by its unique spiritual character and iconic conical towers.',
    infoLandscape: 'Among the mountain slopes of Northern Iraq, fluted domes and stone courtyards form a place of quiet beauty.',
    infoNote: 'This work is an artistic interpretation inspired by the architecture and landscape of Lalish, rather than a measured survey or an exact reconstruction.',
    explore: 'Explore at your own pace',
    help: 'Drag to orbit the temple and scroll to see its details. Start a guided tour or select a scene label to move closer. You can also use the arrow keys to orbit, + and − to zoom, and R to reset the camera.',
    unesco: 'Lalish at UNESCO', exportModel: 'Download model',
    exportPreparing: 'Preparing the model…', exportReady: 'The temple and courtyard GLB file is ready.', exportError: 'Unable to prepare the file. Please try again.',
    tourStarted: 'The guided tour has started. Drag the scene or select Stop tour to control the camera.',
    tourCompleted: 'The tour is complete. You can now explore the temple freely.', fullscreenHelp: 'You can use full-screen view from your browser menu.',
    mainTemple: 'Main temple', entrance: 'Entrance', courtyard: 'Courtyard', conicalTower: 'Conical tower', stonePath: 'Stone pathway',
    detailView: 'Details of the sacred valley', tourView: 'A tour of the sacred valley',
    stoneArchitecture: 'Stone architecture', sacredDomes: 'Sacred domes', mountains: 'Among the mountains', arcades: 'Courtyard arcades', threshold: 'Temple threshold', seconds: 's',
  },
};

let language = 'ar';
let numberFormat = new Intl.NumberFormat(language);
export const t = (key) => messages[language][key] ?? messages.ar[key] ?? key;
export const formatDuration = (seconds) => `${numberFormat.format(Math.max(0, Math.ceil(seconds)))} ${t('seconds')}`;

// Store each dynamic message's key so switching language also updates past status text.
export function setText(element, key) {
  const node = typeof element === 'string' ? document.getElementById(element) : element;
  node.dataset.i18n = key;
  node.textContent = t(key);
}

export function setLanguage(next) {
  language = next === 'en' ? 'en' : 'ar';
  numberFormat = new Intl.NumberFormat(language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('description');
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => { node.title = t(node.dataset.i18nTitle); });
  const button = document.getElementById('language-button');
  button.lang = language === 'ar' ? 'en' : 'ar';
  button.dir = language === 'ar' ? 'ltr' : 'rtl';
  try { localStorage.setItem('lalish-language', language); } catch { /* Storage may be unavailable for file://. */ }
  document.dispatchEvent(new Event('languagechange'));
}

export function initializeLanguage() {
  // Bind leaf text only; SVG icons and other child elements stay intact.
  const textBindings = {
    '#day-button > span': 'day', '#night-button > span': 'night',
    '#view-name': 'valleyStillness', '#view-detail': 'overview',
    '.desktop-hint': 'desktopHint', '.mobile-hint': 'mobileHint',
    '#tour-text': 'startTour', '#labels-button > span': 'showLabels', '.compass > span': 'north',
    '#loading > strong': 'loadingTitle', '#loading > span:last-child': 'loadingDetail',
    '#error-message > h2': 'errorTitle', '#error-detail': 'errorDetail', '#error-message > button': 'retry',
    '#info-panel > .eyebrow': 'about', '#info-title': 'infoTitle',
    '#info-panel > p:nth-of-type(1)': 'infoMain', '#info-panel > p:nth-of-type(2)': 'infoLandscape',
    '.info-note': 'infoNote', '#info-panel > h3': 'explore', '.help-copy': 'help',
    '#unesco-text': 'unesco', '#export-text': 'exportModel',
  };
  Object.entries(textBindings).forEach(([selector, key]) => { document.querySelector(selector).dataset.i18n = key; });
  const controlBindings = {
    'zoom-in': 'zoomIn', 'zoom-out': 'zoomOut', 'reset-button': 'reset',
    'fullscreen-button': 'fullscreen', 'close-info': 'closeInfo', 'labels-button': 'toggleLabels',
  };
  Object.entries(controlBindings).forEach(([id, key]) => {
    const node = document.getElementById(id);
    node.dataset.i18nAria = key;
    if (node.hasAttribute('title')) node.dataset.i18nTitle = key;
  });
  document.querySelector('.compass').dataset.i18nAria = 'northDirection';
  let saved = 'ar';
  try { saved = localStorage.getItem('lalish-language') || 'ar'; } catch { /* Arabic remains the default. */ }
  setLanguage(saved);
  document.getElementById('language-button').addEventListener('click', () => setLanguage(language === 'ar' ? 'en' : 'ar'));
}
