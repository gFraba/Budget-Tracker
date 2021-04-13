let db;
// request budget db
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    // object store pending
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
    // transaction on pending db with readwrite access
    const transaction = db.transaction("pending", "readwrite");

    // access pending object store
    const store = transaction.objectStore("pending");

    // record to store with add method.
    store.add(record);
}

function checkDatabase() {
    // open transaction on pending db
    const transaction = db.transaction("pending", "readwrite");

    // access pending object store
    const store = transaction.objectStore("pending");
    // get all records from store
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    // on success, open a transaction to pending db
                    const transaction = db.transaction("pending", "readwrite");

                    // access pending object store
                    const store = transaction.objectStore("pending");

                    // clear all items in store
                    store.clear();
                });
        }
    };
}

// listen for connection
window.addEventListener('online', checkDatabase);