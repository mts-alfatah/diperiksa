/**
 * DIPERIKSA - Code Protection Script
 * This script provides a basic level of protection against casual code inspection.
 * Note: No client-side protection is 100% foolproof.
 */

// Disable Right-Click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
}, false);

// Disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Disable F12 (Inspect Element)
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+I (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
}, false);

// Optional: DevTools detection (simple version)
let devtoolsOpened = false;
const threshold = 160;
const devtoolsChecker = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
        if (!devtoolsOpened) {
            console.log('%cSTOP!', 'color: red; font-family: sans-serif; font-size: 4.5em; font-weight: bolder; text-shadow: #000 1px 1px;');
            console.log('%cIni adalah area pengembang. Jangan menyalin kode atau menjalankan perintah apa pun di sini.', 'font-size: 1.5em;');
            devtoolsOpened = true;
        }
    } else {
        devtoolsOpened = false;
    }
};

setInterval(devtoolsChecker, 1000);
