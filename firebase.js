import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc as firestoreDeleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAo6Ah7dLSOav1qBkHVphkI8BOdzYypHZU",
  authDomain: "rvuconnect-26c39.firebaseapp.com",
  projectId: "rvuconnect-26c39",
  storageBucket: "rvuconnect-26c39.firebasestorage.app",
  messagingSenderId: "303032234483",
  appId: "1:303032234483:web:2391fcdd5cd5d1d9466286",
  measurementId: "G-1G6Z0B4SY0",
};

const RVU_EMAIL_DOMAIN = "@rvu.edu";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = await analyticsIsSupported().then((supported) => supported ? getAnalytics(app) : null);

function isRvuEmail(email) {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(RVU_EMAIL_DOMAIN);
}

async function requireRvuUser(user) {
  if (!user?.email || !isRvuEmail(user.email)) {
    await signOut(auth);
    throw new Error("Only @rvu.edu accounts can use RVU Connect.");
  }
  return user;
}

async function signInWithEmailPassword(email, password) {
  if (!isRvuEmail(email)) throw new Error("Use your @rvu.edu email address.");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return requireRvuUser(result.user);
}

async function createEmailPasswordAccount(email, password) {
  if (!isRvuEmail(email)) throw new Error("Use your @rvu.edu email address.");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return requireRvuUser(result.user);
}

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: "rvu.edu", prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return requireRvuUser(result.user);
}

onAuthStateChanged(auth, (user) => {
  window.dispatchEvent(new CustomEvent("rvu-auth-user", { detail: user }));
});

function rows(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, slug: item.id, ...item.data() }));
}

async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

  const profile = {
    email: user.email,
    name: user.displayName || user.email.split("@")[0],
    role: "student",
    interests: [],
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { id: user.uid, ...profile };
}

async function saveUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function loadCampusData({ superAdmin = false } = {}) {
  const [clubsSnap, eventsSnap, announcementsSnap, projectsSnap] = await Promise.all([
    getDocs(query(collection(db, "clubs"), where("status", "==", "approved"))),
    getDocs(query(collection(db, "events"), where("status", "==", "published"))),
    getDocs(query(collection(db, "announcements"), where("status", "==", "published"))),
    getDocs(collection(db, "projects")),
  ]);

  const data = {
    clubs: rows(clubsSnap),
    events: rows(eventsSnap),
    announcements: rows(announcementsSnap),
    projects: rows(projectsSnap),
    hostRequests: [],
    moderationFlags: [],
    allUsers: [],
    allEvents: [],
    allAnnouncements: [],
    allClubs: [],
  };

  if (superAdmin) {
    const [requestsSnap, flagsSnap, usersSnap, allEventsSnap, allAnnouncementsSnap, allClubsSnap] = await Promise.all([
      getDocs(collection(db, "hostRequests")),
      getDocs(collection(db, "moderationFlags")),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "events")),
      getDocs(collection(db, "announcements")),
      getDocs(collection(db, "clubs")),
    ]);
    data.hostRequests = rows(requestsSnap);
    data.moderationFlags = rows(flagsSnap);
    data.allUsers = rows(usersSnap);
    data.allEvents = rows(allEventsSnap);
    data.allAnnouncements = rows(allAnnouncementsSnap);
    data.allClubs = rows(allClubsSnap);
  }

  return data;
}

async function submitHostRequest(payload) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before submitting a host request.");
  const request = {
    ...payload,
    uid: user.uid,
    email: user.email,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "hostRequests"), request);

  if (payload.type == "clubCore" && payload.clubId) {
    await setDoc(doc(db, "clubs", payload.clubId, "coreMembers", user.uid), {
      email: user.email,
      name: payload.name,
      role: payload.roleTitle || "core",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  if (payload.type == "schoolRepresentative" && payload.schoolId) {
    await setDoc(doc(db, "schools", payload.schoolId, "representatives", user.uid), {
      email: user.email,
      name: payload.name,
      role: payload.roleTitle || "representative",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return ref.id;
}

async function updateClubRegistration(clubId, registrationOpen) {
  await updateDoc(doc(db, "clubs", clubId), {
    registrationOpen,
    updatedAt: serverTimestamp(),
  });
}

async function updateHostRequestStatus(requestId, status) {
  const ref = doc(db, "hostRequests", requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Host request not found.");
  const request = snap.data();
  await updateDoc(ref, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: auth.currentUser?.uid,
    updatedAt: serverTimestamp(),
  });

  if (request.type == "clubCore" && request.clubId && request.uid) {
    await updateDoc(doc(db, "clubs", request.clubId, "coreMembers", request.uid), {
      status,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", request.uid), {
      role: status == "approved" ? "clubCore" : "student",
      clubId: request.clubId,
      roleTitle: request.roleTitle || "Core Member",
      hostName: request.name || "",
      hostApproved: status == "approved",
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
  }

  if (request.type == "schoolRepresentative" && request.schoolId && request.uid) {
    await updateDoc(doc(db, "schools", request.schoolId, "representatives", request.uid), {
      status,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", request.uid), {
      role: status == "approved" ? "schoolRepresentative" : "student",
      schoolScope: request.schoolId,
      roleTitle: request.roleTitle || "Representative",
      hostName: request.name || "",
      hostApproved: status == "approved",
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
  }
}

async function createEvent(payload) {
  const ref = await addDoc(collection(db, "events"), {
    ...payload,
    status: payload.status || "published",
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

async function createAnnouncement(payload) {
  const ref = await addDoc(collection(db, "announcements"), {
    ...payload,
    status: payload.status || "published",
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/* ── Admin CRUD operations ── */

async function updateUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: serverTimestamp(),
  });
}

async function createClub(payload) {
  const ref = await addDoc(collection(db, "clubs"), {
    ...payload,
    status: payload.status || "approved",
    registrationOpen: payload.registrationOpen || false,
    highlights: payload.highlights || [],
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

async function updateClub(clubId, data) {
  await updateDoc(doc(db, "clubs", clubId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function deleteDocument(collectionName, docId) {
  await firestoreDeleteDoc(doc(db, collectionName, docId));
}

async function updateEventStatus(eventId, status) {
  await updateDoc(doc(db, "events", eventId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

async function updateAnnouncementStatus(announcementId, status) {
  await updateDoc(doc(db, "announcements", announcementId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

window.RVUFirebase = {
  app,
  auth,
  db,
  analytics,
  createEmailPasswordAccount,
  createAnnouncement,
  createClub,
  createEvent,
  deleteDocument,
  ensureUserProfile,
  isRvuEmail,
  loadCampusData,
  saveUserProfile,
  signInWithEmailPassword,
  submitHostRequest,
  updateAnnouncementStatus,
  updateClub,
  updateClubRegistration,
  updateEventStatus,
  updateHostRequestStatus,
  updateUserRole,
  signInWithGoogle,
  signOut: () => signOut(auth),
};
