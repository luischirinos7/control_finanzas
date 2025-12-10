let db;

const DB_NAME = 'FinanzasDB';
const DB_VERSION = 1;

const STORES = {
    CATEGORIAS: 'categorias',
    MOVIMIENTOS: 'movimientos',
    PRESUPUESTOS: 'presupuestos'
};

document.addEventListener('DOMContentLoaded', function() {
    const solicitud = indexedDB.open(DB_NAME, DB_VERSION);
    
    solicitud.onerror = function(evento) {
        console.error('Error DB:', evento.target.error);
    };
    
    solicitud.onsuccess = function(evento) {
        db = evento.target.result;
        console.log('DB lista');
    };
    
    solicitud.onupgradeneeded = function(evento) {
        db = evento.target.result;
        
        if (!db.objectStoreNames.contains(STORES.CATEGORIAS)) {
            db.createObjectStore(STORES.CATEGORIAS, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
        }
        
        if (!db.objectStoreNames.contains(STORES.MOVIMIENTOS)) {
            db.createObjectStore(STORES.MOVIMIENTOS, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
        }
        
        if (!db.objectStoreNames.contains(STORES.PRESUPUESTOS)) {
            db.createObjectStore(STORES.PRESUPUESTOS, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
        }
    };
});