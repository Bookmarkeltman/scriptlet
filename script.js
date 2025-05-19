const ownerEmail = "peanut20230@gmail.com";

// Debug menu logic
let debugMenuVisible = false;

// Create debug menu element
const debugMenu = document.createElement("div");
debugMenu.id = "debug-menu";
debugMenu.innerHTML = `
    <h3>Debug Menu</h3>
    <pre id="debug-info"></pre>
    <button id="close-debug">Close</button>
`;
debugMenu.style.display = "none";
document.body.appendChild(debugMenu);

function showDebugMenu() {
    debugMenu.style.display = "block";
    debugMenuVisible = true;
    updateDebugInfo();
}

function hideDebugMenu() {
    debugMenu.style.display = "none";
    debugMenuVisible = false;
}

function updateDebugInfo() {
    let debugInfo = `
Location: ${window.location.href}
User Agent: ${navigator.userAgent}
Screen Size: ${window.innerWidth} x ${window.innerHeight}
Login Status: ${
        document.getElementById("admin-dashboard")?.classList.contains("hidden") &&
        document.getElementById("user-dashboard")?.classList.contains("hidden")
            ? "Not logged in"
            : (document.getElementById("admin-dashboard")?.classList.contains("hidden")
                ? "User"
                : "Admin")
    }
`;
    document.getElementById("debug-info").textContent = debugInfo;
}

// Toggle debug menu with 2 + Delete
let key2Pressed = false;
document.addEventListener("keydown", function(e) {
    if (e.key === "2") key2Pressed = true;
    if (key2Pressed && (e.key === "Delete" || e.key === "Del")) {
        debugMenuVisible ? hideDebugMenu() : showDebugMenu();
        key2Pressed = false;
    }
});
document.addEventListener("keyup", function(e) {
    if (e.key === "2") key2Pressed = false;
});

// Close button in debug menu
document.getElementById("close-debug").onclick = hideDebugMenu;

// --- Google Auth & Dashboard Logic ---
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
