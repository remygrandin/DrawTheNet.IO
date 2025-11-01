const DB_NAME = 'DrawTheNetDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const MAX_AUTOSAVES = 100;

let db = null;

export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('isAutoSave', 'isAutoSave', { unique: false });
            }
        };
    });
}

export async function saveDocument(name, content, isAutoSave = false) {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const document = {
            name: name,
            content: content,
            timestamp: Date.now(),
            isAutoSave: isAutoSave
        };

        const request = objectStore.add(document);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function updateDocument(id, name, content) {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.get(id);

        request.onsuccess = () => {
            const document = request.result;
            document.name = name;
            document.content = content;
            document.timestamp = Date.now();

            const updateRequest = objectStore.put(document);
            updateRequest.onsuccess = () => resolve(updateRequest.result);
            updateRequest.onerror = () => reject(updateRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}

export async function getDocument(id) {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllDocuments() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteDocument(id) {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function clearAutoSaves() {
    if (!db) await initDB();

    const allDocs = await getAllDocuments();
    const autoSaves = allDocs.filter(doc => doc.isAutoSave);

    for (const doc of autoSaves) {
        await deleteDocument(doc.id);
    }
}

export async function getLatestAutoSave() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);

        // Get all documents and filter in JavaScript instead of using index
        const request = objectStore.getAll();

        request.onsuccess = () => {
            const allDocs = request.result;
            const autoSaves = allDocs.filter(doc => doc.isAutoSave === true);

            if (autoSaves.length > 0) {
                // Sort by timestamp descending and return the most recent
                autoSaves.sort((a, b) => b.timestamp - a.timestamp);
                resolve(autoSaves[0]);
            } else {
                resolve(null);
            }
        };

        request.onerror = () => reject(request.error);
    });
}

export async function getLatestAutoSaveContent() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
            const allDocs = request.result;
            const autoSaves = allDocs.filter(doc => doc.isAutoSave === true);
            
            if (autoSaves.length > 0) {
                autoSaves.sort((a, b) => b.timestamp - a.timestamp);
                resolve(autoSaves[0].content);
            } else {
                resolve(null);
            }
        };
        
        request.onerror = () => reject(request.error);
    });
}

export async function saveOrUpdateAutoSave(content, timestampString = null) {
    if (!db) await initDB();

    // Get all autosaves
    const allDocs = await getAllDocuments();
    const autoSaves = allDocs.filter(doc => doc.isAutoSave === true);
    
    // Sort by timestamp (oldest first)
    autoSaves.sort((a, b) => a.timestamp - b.timestamp);
    
    // If we have reached the limit, delete the oldest autosave
    if (autoSaves.length >= MAX_AUTOSAVES) {
        await deleteDocument(autoSaves[0].id);
    }
    
    // Create new autosave
    const name = timestampString ? `AutoSave ${timestampString}` : `AutoSave ${new Date().toISOString()}`;
    return saveDocument(name, content, true);
}
