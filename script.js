// Sidebar and navigation logic
var ownerEmail = "peanut20230@gmail.com";
var sideNav = document.getElementById('side-nav');
var menuToggle = document.getElementById('menu-toggle');
var sidebarOverlay = document.getElementById('sidebar-overlay');

// Open sidebar
function openSidebar() {
    if (sideNav.className.indexOf('open') === -1) sideNav.className += ' open';
    if (sidebarOverlay.className.indexOf('open') === -1) sidebarOverlay.className += ' open';
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

// Simple page routing (no reload)
function showPage(page) {
    var pages = document.getElementsByClassName('page');
    for (var i = 0; i < pages.length; i++) pages[i].className = pages[i].className.replace(/\bhidden\b/g, '');
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].id !== 'page-' + page) {
            if (pages[i].className.indexOf('hidden') === -1) pages[i].className += " hidden";
        }
    }
}
// Handle navigation click
for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].onclick = (function(i) {
        return function(e) {
            e.preventDefault();
            var page = navLinks[i].getAttribute('data-page');
            if (page) showPage(page);
            if (window.innerWidth <= 900) closeSidebar();
        };
    })(i);
}

// Google Sign-In and dashboard
function handleCredentialResponse(response) {
    // If you have a backend, send response.credential to /login endpoint
    // If not, use parseJwt(response.credential);
    var data = parseJwt(response.credential);
    var userEmail = data.email;
    var profilePicture = data.picture;
    var userName = data.name;

    if (userEmail === ownerEmail) {
        document.getElementById("admin-profile-picture").src = profilePicture;
        document.getElementById("admin-email").textContent = userEmail;
        document.getElementById("admin-name").textContent = userName;
        document.getElementById("admin-dashboard").className = document.getElementById("admin-dashboard").className.replace(/\bhidden\b/g, '');
        if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
    } else {
        document.getElementById("user-profile-picture").src = profilePicture;
        document.getElementById("user-email").textContent = userEmail;
        document.getElementById("user-name").textContent = userName;
        document.getElementById("user-dashboard").className = document.getElementById("user-dashboard").className.replace(/\bhidden\b/g, '');
        if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
    }
    document.getElementById("google-login-container").className += " hidden";
}

function logout() {
    document.getElementById("google-login-container").className = document.getElementById("google-login-container").className.replace(/\bhidden\b/g, '');
    if (document.getElementById("admin-dashboard").className.indexOf('hidden') === -1) document.getElementById("admin-dashboard").className += " hidden";
    if (document.getElementById("user-dashboard").className.indexOf('hidden') === -1) document.getElementById("user-dashboard").className += " hidden";
}

window.onload = function () {
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
