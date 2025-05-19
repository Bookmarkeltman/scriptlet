// Sidebar and navigation from previous code remain the same...

var ownerEmail = "peanut20230@gmail.com";

// On page load, check login state
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
    var logoutAdmin = document.getElementById("logout-admin");
    var logoutUser = document.getElementById("logout-user");
    if (logoutAdmin) logoutAdmin.onclick = logout;
    if (logoutUser) logoutUser.onclick = logout;
    showPage('home');
};

function checkLoginState() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/whoami');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (data.loggedIn) {
                showDashboard(data.user.email, data.user.name, data.user.picture);
            } else {
                showLoggedOut();
            }
        }
    };
    xhr.send();
}

function handleCredentialResponse(response) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            showDashboard(data.user.email, data.user.name, data.user.picture);
        } else {
            alert('Login failed');
        }
    };
    xhr.send(JSON.stringify({ credential: response.credential }));
}

function showDashboard(email, name, picture) {
    if (email === ownerEmail) {
        document.getElementById("admin-profile-picture").src = picture;
        document.getElementById("admin-email").textContent = email;
        document.getElementById("admin-name").textContent = name;
        document.getElementById("admin-dashboard").className = document.getElementById("admin-dashboard").className.replace(/\bhidden\b/g, '');
        if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
    } else {
        document.getElementById("user-profile-picture").src = picture;
        document.getElementById("user-email").textContent = email;
        document.getElementById("user-name").textContent = name;
        document.getElementById("user-dashboard").className = document.getElementById("user-dashboard").className.replace(/\bhidden\b/g, '');
        if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
    }
    document.getElementById("google-login-container").className += " hidden";
}

function showLoggedOut() {
    document.getElementById("google-login-container").className = document.getElementById("google-login-container").className.replace(/\bhidden\b/g, '');
    if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
    if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
}

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/logout');
    xhr.onload = function() {
        showLoggedOut();
    };
    xhr.send();
}

// ...Sidebar/mobile nav and showPage() functions as before...
