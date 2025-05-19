// Compatible with ES5/Server Version 5!
var ownerEmail = "peanut20230@gmail.com";

// Sidebar for mobile/tablet
var sideNav = document.getElementById('side-nav');
var menuToggle = document.getElementById('menu-toggle');
var sidebarOverlay = document.getElementById('sidebar-overlay');

// Open sidebar
function openSidebar() {
    sideNav.className = sideNav.className.replace(/\bopen\b/g, '') + ' open';
    sidebarOverlay.className = sidebarOverlay.className.replace(/\bopen\b/g, '') + ' open';
}
// Close sidebar
function closeSidebar() {
    sideNav.className = sideNav.className.replace(/\bopen\b/g, '');
    sidebarOverlay.className = sidebarOverlay.className.replace(/\bopen\b/g, '');
}

if (menuToggle) {
    menuToggle.onclick = function(e) {
        e.stopPropagation();
        if (sideNav.className.indexOf('open') !== -1) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };
}
if (sidebarOverlay) {
    sidebarOverlay.onclick = function() {
        closeSidebar();
    };
}

// Optional: close sidebar on nav tap (mobile)
var navLinks = sideNav.getElementsByTagName('a');
for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].onclick = function() {
        if (window.innerWidth <= 900) closeSidebar();
    };
}

// Google Sign-In and dashboard
function handleCredentialResponse(response) {
    var data = parseJwt(response.credential);
    var userEmail = data.email;
    var profilePicture = data.picture;
    var userName = data.name;

    if (userEmail === ownerEmail) {
        document.getElementById("admin-profile-picture").src = profilePicture;
        document.getElementById("admin-email").textContent = userEmail;
        document.getElementById("admin-name").textContent = userName;
        document.getElementById("admin-dashboard").className = document.getElementById("admin-dashboard").className.replace(/\bhidden\b/g, '');
        document.getElementById("user-dashboard").className += " hidden";
    } else {
        document.getElementById("user-profile-picture").src = profilePicture;
        document.getElementById("user-email").textContent = userEmail;
        document.getElementById("user-name").textContent = userName;
        document.getElementById("user-dashboard").className = document.getElementById("user-dashboard").className.replace(/\bhidden\b/g, '');
        document.getElementById("admin-dashboard").className += " hidden";
    }
    document.getElementById("google-login-container").className += " hidden";
}

function logout() {
    document.getElementById("google-login-container").className = document.getElementById("google-login-container").className.replace(/\bhidden\b/g, '');
    document.getElementById("admin-dashboard").className += " hidden";
    document.getElementById("user-dashboard").className += " hidden";
}

window.onload = function () {
    // Google Sign-In
    google.accounts.id.initialize({
        client_id: "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("google-login-container"),
        { theme: "dark", size: "medium" }
    );
    // Logout buttons
    var logoutAdmin = document.getElementById("logout-admin");
    var logoutUser = document.getElementById("logout-user");
    if (logoutAdmin) logoutAdmin.onclick = logout;
    if (logoutUser) logoutUser.onclick = logout;
};

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        window.atob(base64)
            .split('')
            .map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
    return JSON.parse(jsonPayload);
}
