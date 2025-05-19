// --------- FIREBASE CONFIG ---------
const firebaseConfig = {
  apiKey: "AIzaSyAYMjMNB1QZ62gNwUzTyFJiG8rFlzTeGSo",
  authDomain: "scriptlet-ee26a.firebaseapp.com",
  projectId: "scriptlet-ee26a",
  storageBucket: "scriptlet-ee26a.appspot.com",
  messagingSenderId: "517893830066",
  appId: "1:517893830066:web:90924f27226ef5da55a0ab",
  measurementId: "G-RSLERH0HHF"
};
// --------- END CONFIG ----------

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const OWNER_EMAIL = "peanut20230@gmail.com"; // Change to your owner email if needed

// Navigation
function showPage(page) {
  var pages = document.getElementsByClassName('page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('hidden');
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id !== 'page-' + page) pages[i].classList.add("hidden");
  }
}
document.querySelectorAll('#side-nav nav ul li a').forEach(link => {
  link.onclick = function(e) {
    e.preventDefault();
    const page = this.getAttribute('data-page');
    if (page) showPage(page);
  };
});

// Login/Logout
document.getElementById('login-btn').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};
document.getElementById('logout-admin').onclick = () => auth.signOut();
document.getElementById('logout-user').onclick = () => auth.signOut();

// On Auth state change
auth.onAuthStateChanged(async user => {
  if (user) {
    const email = user.email;
    const name = user.displayName;
    const picture = user.photoURL;
    let isAdmin = false, isOwner = false;

    if (email === OWNER_EMAIL) isOwner = isAdmin = true;
    else {
      // Check admin list in Firestore
      try {
        const doc = await db.collection('adminList').doc('admins').get();
        if (doc.exists && Array.isArray(doc.data().emails)) {
          isAdmin = doc.data().emails.includes(email);
        }
      } catch (e) { /* ignore */ }
    }

    // Show dashboards
    if (isAdmin) {
      document.getElementById("admin-profile-picture").src = picture;
      document.getElementById("admin-email").textContent = email;
      document.getElementById("admin-name").textContent = name;
      document.getElementById("admin-dashboard").classList.remove('hidden');
      document.getElementById("user-dashboard").classList.add('hidden');
      if (isOwner) document.getElementById("add-admin-section").classList.remove('hidden');
      else document.getElementById("add-admin-section").classList.add('hidden');
    } else {
      document.getElementById("user-profile-picture").src = picture;
      document.getElementById("user-email").textContent = email;
      document.getElementById("user-name").textContent = name;
      document.getElementById("user-dashboard").classList.remove('hidden');
      document.getElementById("admin-dashboard").classList.add('hidden');
      document.getElementById("add-admin-section").classList.add('hidden');
    }
    document.getElementById("login-container").classList.add("hidden");
  } else {
    // Not signed in
    document.getElementById("login-container").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("user-dashboard").classList.add("hidden");
    document.getElementById("add-admin-section").classList.add("hidden");
  }
});

// Owner: Add Admin
document.getElementById('add-admin-btn').onclick = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== OWNER_EMAIL) return alert("Only owner can add admins!");
  const email = prompt("Enter the email to add as admin:");
  if (!email) return;
  const docRef = db.collection('adminList').doc('admins');
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    let emails = [];
    if (doc.exists && Array.isArray(doc.data().emails)) emails = doc.data().emails;
    if (!emails.includes(email)) emails.push(email);
    transaction.set(docRef, { emails });
  });
  alert("Admin added!");
};

// Default page
showPage('home');
