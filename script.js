// --- הגדרות ---
// !!! יש לערוך את שתי השורות הבאות !!!
const GITHUB_USERNAME = 'AMAARETS'; // החלף בשם המשתמש שלך בגיטהאב
const GITHUB_REPO = 'Blog'; // החלף בשם המאגר שלך

// --- קבועים ---
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/index`;
const CONTENT_URL_BASE = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/pages/`;

// --- אלמנטים מה-DOM ---
const navElement = document.getElementById('main-nav');
const contentElement = document.getElementById('content');

/**
 * פונקציה ראשית שנטענת עם עליית האתר
 */
document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
    handleRouting(); // טפל בטעינה ראשונית של הדף
    window.addEventListener('hashchange', handleRouting); // האזן לשינויים ב-URL
});

/**
 * טוען את תפריט הניווט באופן דינמי מהתיקייה /index
 */
async function loadNavigation() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`שגיאת רשת: ${response.statusText}`);
        }
        const files = await response.json();

        navElement.innerHTML = ''; // נקה את הודעת הטעינה

        // הוסף קישור "בית"
        const homeLink = createNavLink('בית', '#');
        navElement.appendChild(homeLink);

        files.forEach(file => {
            if (file.type === 'file') {
                const pageName = file.name.split('.')[0]; // הסר את הסיומת (למשל .txt)
                const link = createNavLink(pageName, `#${pageName}`);
                navElement.appendChild(link);
            }
        });

        updateActiveLink();

    } catch (error) {
        navElement.innerHTML = 'שגיאה בטעינת התפריט.';
        console.error('Error fetching navigation:', error);
    }
}

/**
 * יוצר אלמנט של קישור (<a>) עבור התפריט
 */
function createNavLink(text, href) {
    const link = document.createElement('a');
    link.textContent = text.charAt(0).toUpperCase() + text.slice(1); // אות ראשונה גדולה
    link.href = href;
    return link;
}

/**
 * מטפל בשינוי ה-URL (ה-hash) וטוען את התוכן המתאים
 */
function handleRouting() {
    const pageName = window.location.hash.substring(1); // קח את שם הדף מה-URL
    loadContent(pageName);
    updateActiveLink();
}

/**
 * טוען ומציג תוכן של דף מתיקיית /pages
 * @param {string} pageName - שם קובץ ה-Markdown (ללא סיומת)
 */
async function loadContent(pageName) {
    contentElement.innerHTML = '<div class="loader">טוען תוכן...</div>';

    if (!pageName) {
        contentElement.innerHTML = '<h2>ברוכים הבאים!</h2><p>זוהי הדגמה של אתר דינמי שמבוסס על קבצי Markdown בגיטהאב.</p><p>בחר דף מהתפריט כדי להתחיל.</p>';
        return;
    }

    try {
        const response = await fetch(`${CONTENT_URL_BASE}${pageName}.md`);
        if (!response.ok) {
            throw new Error('הקובץ לא נמצא (404)');
        }
        const markdown = await response.text();
        // המרת Markdown ל-HTML באמצעות ספריית marked
        contentElement.innerHTML = marked.parse(markdown);

    } catch (error) {
        contentElement.innerHTML = `<h2>שגיאה</h2><p>לא ניתן היה לטעון את הדף המבוקש: <strong>${pageName}</strong>.</p><p>ודא שהקובץ <code>${pageName}.md</code> קיים בתיקיית <code>/pages</code> ושהקובץ המקביל לו קיים בתיקיית <code>/index</code>.</p>`;
        console.error('Error fetching content:', error);
    }
}

/**
 * מעדכן את הקישור הפעיל בתפריט הניווט
 */
function updateActiveLink() {
    const currentHash = window.location.hash || '#';
    const links = navElement.querySelectorAll('a');
    links.forEach(link => {
        // התאמה מדוייקת של ה-hash. עבור דף הבית, ה-href הוא '#'
        if ((currentHash === '#' && link.hash === '') || link.hash === currentHash) {
             link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
