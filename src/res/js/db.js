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

export async function getLatestDocument() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
            const allDocs = request.result;
            
            if (allDocs.length > 0) {
                // Sort by timestamp descending and return the most recent
                allDocs.sort((a, b) => b.timestamp - a.timestamp);
                resolve(allDocs[0]);
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
    
    // Check if an autosave with the exact same content already exists
    const matchingAutoSave = autoSaves.find(doc => doc.content === content && doc.isAutoSave === true);
    
    if (matchingAutoSave) {
        // Update only the title and timestamp of the existing autosave
        const name = timestampString ? `AutoSave ${timestampString}` : `AutoSave ${new Date().toISOString()}`;
        return updateDocument(matchingAutoSave.id, name, content);
    }
    
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

export async function exportLibrary() {
    if (!db) await initDB();
    
    const allDocs = await getAllDocuments();
    
    // Create export object with metadata
    const exportData = {
        exportDate: new Date().toISOString(),
        version: DB_VERSION,
        documentCount: allDocs.length,
        documents: allDocs
    };
    
    return exportData;
}

export async function importLibrary(importData, replaceExisting = false) {
    if (!db) await initDB();
    
    // Validate import data
    if (!importData || !importData.documents || !Array.isArray(importData.documents)) {
        throw new Error('Invalid import data format');
    }
    
    // If replacing existing, clear all documents first
    if (replaceExisting) {
        const allDocs = await getAllDocuments();
        for (const doc of allDocs) {
            await deleteDocument(doc.id);
        }
    }
    
    // Get existing documents for duplicate detection
    const existingDocs = await getAllDocuments();
    
    // Import documents with duplicate detection
    let imported = 0;
    let skipped = 0;
    let updated = 0;
    
    for (const importDoc of importData.documents) {
        try {
            // Find duplicates based on name and content
            const duplicate = existingDocs.find(existingDoc => 
                existingDoc.name === importDoc.name && 
                existingDoc.content === importDoc.content
            );
            
            if (duplicate) {
                // Document with same name and content exists
                // Keep the most recent one (highest timestamp)
                if (importDoc.timestamp > duplicate.timestamp) {
                    // Import is newer, update the existing document
                    await updateDocument(duplicate.id, importDoc.name, importDoc.content);
                    // Update the existing doc in our array for further comparisons
                    const index = existingDocs.findIndex(d => d.id === duplicate.id);
                    if (index !== -1) {
                        existingDocs[index] = { ...duplicate, ...importDoc, id: duplicate.id };
                    }
                    updated++;
                } else {
                    // Existing is newer or same age, skip import
                    skipped++;
                }
            } else {
                // No duplicate found, add as new document
                const { id, ...docWithoutId } = importDoc;
                
                const newId = await new Promise((resolve, reject) => {
                    const transaction = db.transaction([STORE_NAME], 'readwrite');
                    const objectStore = transaction.objectStore(STORE_NAME);
                    
                    const request = objectStore.add(docWithoutId);
                    
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    request.onerror = () => {
                        reject(request.error);
                    };
                });
                
                // Add to existing docs for further comparisons
                existingDocs.push({ ...docWithoutId, id: newId });
                imported++;
            }
        } catch (error) {
            skipped++;
            console.error('Error importing document:', error);
        }
    }
    
    return { imported, updated, skipped, total: importData.documents.length };
}
