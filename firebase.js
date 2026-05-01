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

const RVU_EMAIL_DOMAIN = "@rvu.edu.in";

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
    throw new Error("Only @rvu.edu.in accounts can use RVU Connect.");
  }
  return user;
}

async function signInWithEmailPassword(email, password) {
  if (!isRvuEmail(email)) throw new Error("Use your @rvu.edu.in email address.");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return requireRvuUser(result.user);
}

async function createEmailPasswordAccount(email, password) {
  if (!isRvuEmail(email)) throw new Error("Use your @rvu.edu.in email address.");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return requireRvuUser(result.user);
}

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: "rvu.edu.in", prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return requireRvuUser(result.user);
}

onAuthStateChanged(auth, (user) => {
  window.dispatchEvent(new CustomEvent("rvu-auth-user", { detail: user }));
});

function rows(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, slug: item.id, ...item.data() }));
}

async function rowsOrEmpty(label, promise) {
  try {
    return rows(await promise);
  } catch (error) {
    if (error?.code !== "permission-denied") {
      console.warn(`RVU Connect could not load ${label}:`, error);
    }
    return [];
  }
}

async function hasSuperAdminGrant(user) {
  if (!user?.uid || !user?.email) return false;
  const email = user.email.trim();
  const [uidGrant, emailGrant] = await Promise.all([
    getDoc(doc(db, "superAdmins", user.uid)).catch(() => null),
    getDoc(doc(db, "superAdmins", email)).catch(() => null),
  ]);
  return Boolean(uidGrant?.exists() || emailGrant?.exists());
}

async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const superAdmin = await hasSuperAdminGrant(user);
  if (snap.exists()) {
    const profile = { id: snap.id, ...snap.data() };
    return superAdmin ? { ...profile, role: "superAdmin" } : profile;
  }

  const profile = {
    email: user.email,
    name: user.displayName || user.email.split("@")[0],
    role: "student",
    interests: [],
    onboardingComplete: superAdmin,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { id: user.uid, ...profile, role: superAdmin ? "superAdmin" : "student" };
}

async function saveUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function loadCampusData({ superAdmin = false } = {}) {
  const [clubsRows, eventRows, announcementRows, projectRows] = await Promise.all([
    rowsOrEmpty("approved clubs", getDocs(query(collection(db, "clubs"), where("status", "==", "approved")))),
    rowsOrEmpty("published events", getDocs(query(collection(db, "events"), where("status", "==", "published")))),
    rowsOrEmpty("published announcements", getDocs(query(collection(db, "announcements"), where("status", "==", "published")))),
    rowsOrEmpty("projects", getDocs(collection(db, "projects"))),
  ]);

  const data = {
    clubs: clubsRows,
    events: eventRows,
    announcements: announcementRows,
    projects: projectRows,
    hostRequests: [],
    moderationFlags: [],
    allUsers: [],
    allEvents: [],
    allAnnouncements: [],
    allClubs: [],
    allSchools: [],
    clubAccess: null,
  };

  if (auth.currentUser?.email) {
    const email = auth.currentUser.email;
    const memberDocs = await Promise.all(data.clubs.map(async (club) => {
      const memberSnap = await getDoc(doc(db, "clubs", club.id, "coreMembers", email));
      return memberSnap.exists() ? { club, member: { id: memberSnap.id, ...memberSnap.data() } } : null;
    }));
    data.clubAccess = memberDocs.find((entry) => entry?.member?.status === "approved") || null;
  }

  if (superAdmin) {
    const [requestsRows, flagsRows, userRows, allEventRows, allAnnouncementRows, allClubRows, allSchoolRows] = await Promise.all([
      rowsOrEmpty("host requests", getDocs(collection(db, "hostRequests"))),
      rowsOrEmpty("moderation flags", getDocs(collection(db, "moderationFlags"))),
      rowsOrEmpty("users", getDocs(collection(db, "users"))),
      rowsOrEmpty("all events", getDocs(collection(db, "events"))),
      rowsOrEmpty("all announcements", getDocs(collection(db, "announcements"))),
      rowsOrEmpty("all clubs", getDocs(collection(db, "clubs"))),
      rowsOrEmpty("all schools", getDocs(collection(db, "schools"))),
    ]);
    data.hostRequests = requestsRows;
    data.moderationFlags = flagsRows;
    data.allUsers = userRows;
    data.allEvents = allEventRows;
    data.allAnnouncements = allAnnouncementRows;
    data.allClubs = allClubRows;
    data.allSchools = allSchoolRows;
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
    await setDoc(doc(db, "clubs", payload.clubId, "coreMembers", user.email), {
      uid: user.uid,
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
    await updateDoc(doc(db, "clubs", request.clubId, "coreMembers", request.email), {
      uid: request.uid,
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

async function createProject(payload) {
  const ref = await addDoc(collection(db, "projects"), {
    ...payload,
    status: payload.status || "open",
    ownerId: auth.currentUser?.uid,
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
  const founderEmail = payload.founderEmail?.trim().toLowerCase();
  const facultyAdvisorEmail = payload.facultyAdvisorEmail?.trim().toLowerCase();
  const currentPresidentEmail = payload.currentPresidentEmail?.trim().toLowerCase();
  const ref = await addDoc(collection(db, "clubs"), {
    ...payload,
    founderEmail,
    facultyAdvisorEmail,
    currentPresidentEmail,
    status: payload.status || "approved",
    registrationOpen: payload.registrationOpen || false,
    highlights: payload.highlights || [],
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const foundingMembers = [
    { email: currentPresidentEmail, name: payload.currentPresidentName || "Current President", role: "president", permanent: false },
    { email: founderEmail, name: payload.founderName || "Founder", role: "founder", permanent: true },
    { email: facultyAdvisorEmail, name: payload.facultyAdvisorName || "Faculty Advisor", role: "facultyAdvisor", permanent: false },
  ].filter((member, index, list) =>
    member.email && list.findIndex((candidate) => candidate.email === member.email) === index
  );

  await Promise.all(foundingMembers.map((member) => setDoc(doc(db, "clubs", ref.id, "coreMembers", member.email), {
    ...member,
    status: "approved",
    assignedBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));

  return ref.id;
}

async function createSchool(payload) {
  const ref = await addDoc(collection(db, "schools"), {
    ...payload,
    status: payload.status || "active",
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

async function assignClubCoreRole(clubId, { email, name, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role || "core";
  await setDoc(doc(db, "clubs", clubId, "coreMembers", normalizedEmail), {
    email: normalizedEmail,
    name: name || email,
    role: normalizedRole,
    status: "approved",
    assignedBy: auth.currentUser?.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (normalizedRole.toLowerCase() === "president") {
    await updateClubLeadership(clubId, {
      currentPresidentEmail: normalizedEmail,
      currentPresidentName: name || email,
    });
  }
}

async function removeClubCoreRole(clubId, email) {
  await firestoreDeleteDoc(doc(db, "clubs", clubId, "coreMembers", email.trim().toLowerCase()));
}

async function updateClubLeadership(clubId, data) {
  const updates = {};
  if (data.currentPresidentName !== undefined) updates.currentPresidentName = data.currentPresidentName;
  if (data.currentPresidentEmail !== undefined) updates.currentPresidentEmail = data.currentPresidentEmail.trim().toLowerCase();
  if (data.facultyAdvisorName !== undefined) updates.facultyAdvisorName = data.facultyAdvisorName;
  if (data.facultyAdvisorEmail !== undefined) updates.facultyAdvisorEmail = data.facultyAdvisorEmail.trim().toLowerCase();
  await updateDoc(doc(db, "clubs", clubId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
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
  assignClubCoreRole,
  createEmailPasswordAccount,
  createAnnouncement,
  createClub,
  createEvent,
  createProject,
  createSchool,
  deleteDocument,
  ensureUserProfile,
  isRvuEmail,
  loadCampusData,
  saveUserProfile,
  signInWithEmailPassword,
  submitHostRequest,
  updateAnnouncementStatus,
  updateClub,
  updateClubLeadership,
  updateClubRegistration,
  updateEventStatus,
  updateHostRequestStatus,
  updateUserRole,
  removeClubCoreRole,
  signInWithGoogle,
  signOut: () => signOut(auth),
};
