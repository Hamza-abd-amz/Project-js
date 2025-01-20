// Open a connection to the IndexedDB
const request = indexedDB.open('hospitalDB', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    const userStore = db.createObjectStore('users', { keyPath: 'username' });
    userStore.createIndex('username', 'username', { unique: true });
};

request.onsuccess = function(event) {
    const db = event.target.result;

    function addUser(username, password, type) {
        const transaction = db.transaction(['users'], 'readwrite');
        const userStore = transaction.objectStore('users');
        const user = { username, password, type };
        userStore.add(user);
    }

    function getUser(username, callback) {
        const transaction = db.transaction(['users'], 'readonly');
        const userStore = transaction.objectStore('users');
        const request = userStore.get(username);
        request.onsuccess = function(event) {
            callback(event.target.result);
        };
    }

    function showLogin() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    }

    function showSignup() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    }

    function login() {
        const loginType = document.getElementById('login-type').value;
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (loginType === 'admin') {
            const adminPassword = 'reda123'; // Mot de passe administrateur
            if (password === adminPassword) {
                window.location.href = 'hospital-admin-master/SitePages/dashboard.html'; // Redirection vers le tableau de bord
            } else {
                alert('Incorrect admin password.');
            }
        } else {
            getUser(username, function(user) {
                if (user && user.password === password && user.type === 'patient') {
                    alert('Patient login successful!');
                    window.location.href = 'doclab-master/index.html';
                } else {
                    alert('Incorrect username or password.');
                }
            });
        }
    }

    function signup() {
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        addUser(username, password, 'patient');
        alert('Sign up successful! You can now login.');
        showLogin();
    }

    // Expose functions to the global scope
    window.showLogin = showLogin;
    window.showSignup = showSignup;
    window.login = login;
    window.signup = signup;
};

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};
