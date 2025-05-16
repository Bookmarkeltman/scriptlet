const ownerEmail = "peanut20230@gmail.com";

function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);
    const userEmail = data.email;
    const profilePicture = data.picture;
    const userName = data.name;

    // Check if the user is the owner or an admin
    if (userEmail === ownerEmail) {
        // Show Admin Dashboard
        document.getElementById("admin-profile-picture").src = profilePicture;
        document.getElementById("admin-email").textContent = userEmail;
        document.getElementById("admin-name").textContent = userName;

        document.getElementById("admin-dashboard").classList.remove("hidden");
        document.getElementById("user-dashboard").classList.add("hidden");
    } else {
        // Show User Dashboard
        document.getElementById("user-profile-picture").src = profilePicture;
        document.getElementById("user-email").textContent = userEmail;
        document.getElementById("user-name").textContent = userName;

        document.getElementById("user-dashboard").classList.remove("hidden");
        document.getElementById("admin-dashboard").classList.add("hidden");
    }

    // Hide login button
    document.getElementById("google-login-container").classList.add("hidden");
}

// Logout and switch accounts
document.getElementById("logout-admin").onclick = logout;
document.getElementById("logout-user").onclick = logout;

function logout() {
    // Reset the UI
    document.getElementById("google-login-container").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("user-dashboard").classList.add("hidden");
}

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

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
        document.getElementById("google-login-container"),
        { theme: "dark", size: "medium" }
    );
};
