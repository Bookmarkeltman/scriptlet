const ownerEmail = "peanut20230@gmail.com";

// --- SIDEBAR MOBILE LOGIC ---
const sideNav = document.getElementById('side-nav');
const menuToggle = document.getElementById('menu-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// Open sidebar
function openSidebar() {
    sideNav.classList.add('open');
    sidebarOverlay.classList.add('open');
}

// Close sidebar
function closeSidebar() {
    sideNav.classList.remove('open');
    sidebarOverlay.classList.remove('open');
}

// Toggle on hamburger tap
menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (sideNav.classList.contains('open')) closeSidebar();
    else openSidebar();
});
// Close sidebar when tapping overlay
sidebarOverlay.addEventListener('click', closeSidebar);

// Optional: close sidebar on nav tap (mobile)
sideNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
    });
});

// --- GOOGLE LOGIN LOGIC ---
function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);
    const userEmail = data.email;
    const profilePicture = data.picture;
    const userName = data.name;

    if (userEmail === ownerEmail) {
        document.getElementById("admin-profile-picture").src = profilePicture;
        document.getElementById("admin-email").textContent = userEmail;
        document.getElementById("admin-name").textContent = userName;
        document.getElementById("admin-dashboard").classList.remove("hidden");
        document.getElementById("user-dashboard").classList.add("hidden");
    } else {
        document.getElementById("user-profile-picture").src = profilePicture;
        document.getElementById("user-email").textContent = userEmail;
        document.getElementById("user-name").textContent = userName;
        document.getElementById("user-dashboard").classList.remove("hidden");
        document.getElementById("admin-dashboard").classList.add("hidden");
    }
    document.getElementById("google-login-container").classList.add("hidden");
}

function logout() {
    document.getElementById("google-login-container").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("user-dashboard").classList.add("hidden");
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
        document.getElementById("google-login-container"),
        { theme: "dark", size: "medium" }
    );
    // Bind logout buttons if they exist
    const logoutAdmin = document.getElementById("logout-admin");
    const logoutUser = document.getElementById("logout-user");
    if (logoutAdmin) logoutAdmin.onclick = logout;
    if (logoutUser) logoutUser.onclick = logout;
};

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}
