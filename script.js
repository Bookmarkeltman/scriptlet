var ownerEmail = "peanut20230@gmail.com";
var adminList = [ownerEmail];

// Page load: check login state
window.onload = function () {
    checkLoginState();

    google.accounts.id.initialize({
        client_id: "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("google-login-container"),
        { theme: "dark", size: "medium" }
    );
    document.getElementById("logout-admin").onclick = switchAccount;
    document.getElementById("logout-user").onclick = switchAccount;
    document.getElementById("add-admin-btn").onclick = addAdmin;
    showPage('home');
};

function checkLoginState() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/whoami');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            adminList = data.admins || [ownerEmail];
            if (data.loggedIn) {
                showDashboard(data.user.email, data.user.name, data.user.picture, data.isAdmin, data.isOwner);
            } else {
                showLoggedOut();
            }
        }
    };
    xhr.send();
}

function handleCredentialResponse(response) {
    // Use backend for login
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            checkLoginState();
        } else {
            alert('Login failed');
        }
    };
    xhr.send(JSON.stringify({ credential: response.credential }));
}

function showDashboard(email, name, picture, isAdmin, isOwner) {
    if (isAdmin) {
        document.getElementById("admin-profile-picture").src = picture;
        document.getElementById("admin-email").textContent = email;
        document.getElementById("admin-name").textContent = name;
        document.getElementById("admin-dashboard").className = document.getElementById("admin-dashboard").className.replace(/\bhidden\b/g, '');
        if (isOwner) {
            document.getElementById("add-admin-section").classList.remove('hidden');
        } else {
            document.getElementById("add-admin-section").classList.add('hidden');
        }
        if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
    } else {
        document.getElementById("user-profile-picture").src = picture;
        document.getElementById("user-email").textContent = email;
        document.getElementById("user-name").textContent = name;
        document.getElementById("user-dashboard").className = document.getElementById("user-dashboard").className.replace(/\bhidden\b/g, '');
        if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
        document.getElementById("add-admin-section").classList.add('hidden');
    }
    document.getElementById("google-login-container").className += " hidden";
}

function showLoggedOut() {
    document.getElementById("google-login-container").className = document.getElementById("google-login-container").className.replace(/\bhidden\b/g, '');
    if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
    if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
    document.getElementById("add-admin-section").classList.add('hidden');
}

// "Switch Account" and logout: clear session and re-show Google prompt
function switchAccount() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/logout');
    xhr.onload = function() {
        // Google One Tap prompt will reappear after logout
        showLoggedOut();
        google.accounts.id.prompt();
    };
    xhr.send();
}

// Owner: Add Admin
function addAdmin() {
    var email = prompt("Enter the email to add as admin:");
    if (!email) return;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/add-admin');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("Admin added!");
            checkLoginState();
        } else {
            alert("Failed to add admin: " + xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({ email: email }));
}
