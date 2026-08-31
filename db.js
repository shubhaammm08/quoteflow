import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, getDocs, doc, setDoc, getDoc, query, orderBy, runTransaction, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.saveQuoteToCloud = async (quoteData) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user logged in to save quote");
            return false;
        }

        const quotesRef = collection(db, "users", user.uid, "quotes");
        
        // Add timestamp and status
        const dataToSave = {
            ...quoteData,
            status: quoteData.status || 'Draft',
            createdAt: new Date(),
        };

        const docRef = await addDoc(quotesRef, dataToSave);
        console.log("Quote saved with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
};

window.getUserQuotes = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const quotesRef = collection(db, "users", user.uid, "quotes");
        const q = query(quotesRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const quotes = [];
        querySnapshot.forEach((doc) => {
            quotes.push({ id: doc.id, ...doc.data() });
        });
        return quotes;
    } catch (e) {
        console.error("Error getting quotes: ", e);
        return [];
    }
};

window.saveUserSettings = async (settingsData) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { settings: settingsData }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error saving settings: ", e);
        return false;
    }
};

window.getUserSettings = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return docSnap.data().settings || null;
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting settings: ", e);
        return null;
    }
};

window.getNextQuoteNumber = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return '';

        const counterRef = doc(db, "users", user.uid, "metadata", "counter");
        let newCount = 1;

        await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                transaction.set(counterRef, { quoteCount: 1 });
            } else {
                newCount = counterDoc.data().quoteCount + 1;
                transaction.update(counterRef, { quoteCount: newCount });
            }
        });

        // Format to QF-001
        return `QF-${newCount.toString().padStart(3, '0')}`;
    } catch (e) {
        console.error("Error generating quote number: ", e);
        return `QF-${Math.floor(Math.random() * 1000)}`;
    }
};

window.deleteUserQuote = async (quoteId) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const quoteRef = doc(db, "users", user.uid, "quotes", quoteId);
        await deleteDoc(quoteRef);
        return true;
    } catch (e) {
        console.error("Error deleting quote: ", e);
        return false;
    }
};

window.updateQuoteStatus = async (quoteId, newStatus) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const quoteRef = doc(db, "users", user.uid, "quotes", quoteId);
        await setDoc(quoteRef, { status: newStatus }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error updating quote status: ", e);
        return false;
    }
};

window.saveCatalogItem = async (itemData) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const catalogRef = collection(db, "users", user.uid, "catalog");
        const docRef = await addDoc(catalogRef, {
            ...itemData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error saving catalog item: ", e);
        return false;
    }
};

window.getUserCatalog = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const catalogRef = collection(db, "users", user.uid, "catalog");
        const q = query(catalogRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const catalog = [];
        querySnapshot.forEach((doc) => {
            catalog.push({ id: doc.id, ...doc.data() });
        });
        return catalog;
    } catch (e) {
        console.error("Error getting catalog: ", e);
        return [];
    }
};

window.deleteCatalogItem = async (itemId) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const itemRef = doc(db, "users", user.uid, "catalog", itemId);
        await deleteDoc(itemRef);
        return true;
    } catch (e) {
        console.error("Error deleting catalog item: ", e);
        return false;
    }
};

window.saveClient = async (clientData) => {
    try {
        const user = auth.currentUser;
        if (!user || !clientData.companyName) return false;

        const clientsRef = collection(db, "users", user.uid, "clients");
        // Use companyName as a unique-ish way to query or just use the sanitized name as ID
        // To keep it simple, we use the company name in lowercase, stripped of weird characters as the doc ID
        const docId = clientData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!docId) return false;

        const docRef = doc(db, "users", user.uid, "clients", docId);
        await setDoc(docRef, {
            ...clientData,
            updatedAt: new Date()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error saving client details: ", e);
        return false;
    }
};

window.getUserClients = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const clientsRef = collection(db, "users", user.uid, "clients");
        const querySnapshot = await getDocs(clientsRef);
        
        const clients = [];
        querySnapshot.forEach((doc) => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        return clients;
    } catch (e) {
        console.error("Error getting clients: ", e);
        return [];
    }
};
