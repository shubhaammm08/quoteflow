import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Global listener to check auth state across the app
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/login.html';
    
    if (user) {
        console.log("User is authenticated:", user.email);
        
        // If they are on the login page, redirect them to the app
        if (isLoginPage) {
            window.location.href = 'QuoteFlow_AI_Quotation_Builder.html';
        }
        
        // Update user profile picture in header and main profile if it exists
        const updateProfileImages = (url) => {
            document.querySelectorAll('#user-profile-img, #main-profile-img').forEach(img => {
                img.src = url;
            });
        };

        const getProfileUrl = (userObj) => {
            if (userObj.photoURL) return userObj.photoURL;
            const name = userObj.displayName || userObj.email || 'User';
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128&bold=true`;
        };

        updateProfileImages(getProfileUrl(user));
        
        // Firebase Auth caches the photoURL. If it was updated recently, 
        // the cache might still have the old one. We silently reload the user to get the latest.
        user.reload().then(() => {
            if (auth.currentUser) {
                updateProfileImages(getProfileUrl(auth.currentUser));
            }
        }).catch(e => console.error("Profile reload failed", e));

    } else {
        console.log("User is not authenticated");
        
        // If they are NOT on the login page, redirect them to login
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

window.logoutUser = () => {
    signOut(auth).then(() => {
        console.log("Signed out");
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
};
