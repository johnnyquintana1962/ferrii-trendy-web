// LocalStorage Cleanup Utility
// Run this once to remove old LocalStorage data and ensure Firebase is the single source of truth

export const cleanupLocalStorage = () => {
    const keysToRemove = [
        'ferrii-trendy-products',
        'ferrii-trendy-settings',
        'ferrii_trendy_settings',
        'FERRII_TRENDY_DATABASE'
    ];

    let removedCount = 0;

    keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            removedCount++;
            console.log(`✅ Removed: ${key}`);
        }
    });

    if (removedCount > 0) {
        console.log(`\n🧹 Cleanup complete: ${removedCount} items removed from LocalStorage`);
        console.log('🔥 Firebase is now the single source of truth');
    } else {
        console.log('✨ LocalStorage already clean');
    }

    return removedCount;
};

// Auto-run cleanup on import (one-time)
if (typeof window !== 'undefined') {
    const hasRunCleanup = sessionStorage.getItem('firebase_cleanup_done');
    if (!hasRunCleanup) {
        cleanupLocalStorage();
        sessionStorage.setItem('firebase_cleanup_done', 'true');
    }
}
