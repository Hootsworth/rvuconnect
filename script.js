const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 10.5 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
  clubs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  announce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8A3 3 0 0 1 6 15"/></svg>',
  admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="M9 12l2 2 4-5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>',
};

const schools = [
  "School of Computer Science and Engineering",
  "School of Law",
  "School of Liberal Arts and Sciences",
  "School of Economics and Public Policy",
  "School of Continuing Education",
  "School of Allied Healthcare",
  "School of Film Media and Creative Arts",
  "School of Design and Innovation",
  "School of Business",
];

const interests = ["AI", "Web Development", "Design", "Business", "Finance", "Marketing", "Product", "Film", "Law", "Healthcare"];

const events = [];
const clubs = [];
const announcements = [];
const projects = [];

const state = {
  route: "home",
  authed: false,
  dataLoaded: false,
  dataLoading: false,
  authUser: null,
  loginOpen: false,
  authMode: "signin",
  authEmail: "",
  authPassword: "",
  hostRequests: [],
  moderationFlags: [],
  onboardingStep: "role",
  role: null,
  createOpen: false,
  selectedClubSlug: null,
  adminScope: "school",
  adminTab: "requests",
  clubDraft: {
    name: "",
    category: "",
    school: schools[0],
    tagline: "",
    description: "",
    founderName: "",
    founderEmail: "",
    facultyAdvisorName: "",
    facultyAdvisorEmail: "",
    currentPresidentName: "",
    currentPresidentEmail: "",
    joinLink: "",
    registrationOpen: false,
  },
  user: {
    name: "",
    school: schools[0],
    year: "1",
    interests: [],
  },
  host: {
    type: "Club Core",
    clubSlug: "",
    school: schools[0],
    roleTitle: "Core Member",
    name: "",
    category: "",
    description: "",
    email: "",
    joinLink: "",
    approver: "Current president",
    approvedBy: "Super Admin",
    approved: false,
  },
  filters: {
    eventType: "All",
    clubCategory: "All",
    clubSchool: "All",
    announcementType: "All",
    projectTag: "All",
  },
  allUsers: [],
  allEvents: [],
  allAnnouncements: [],
  allClubs: [],
  allSchools: [],
  savedItems: [],
  followedClubs: [],
  rsvps: [],
  myApplications: [],
  siteSettings: [],
};

const app = document.querySelector("#app");

function defaultClubDraft() {
  return {
    name: "",
    category: "",
    school: schools[0],
    tagline: "",
    description: "",
    founderName: "",
    founderEmail: "",
    facultyAdvisorName: "",
    facultyAdvisorEmail: "",
    currentPresidentName: "",
    currentPresidentEmail: "",
    joinLink: "",
    registrationOpen: false,
  };
}

function replaceCollection(target, values) {
  target.splice(0, target.length, ...values);
}

function icon(name) {
  return icons[name] || "";
}

function isClubCore() {
  return state.role === "club-core";
}

function isSchoolRep() {
  return state.role === "school-rep";
}

function isSuperAdmin() {
  return state.role === "admin";
}

function canHost() {
  return (isClubCore() || isSchoolRep()) && state.host.approved;
}

function roleLabel() {
  if (isSuperAdmin()) return "Super admin";
  if (isClubCore()) return state.host.approved ? "Club core" : "Club pending";
  if (isSchoolRep()) return state.host.approved ? "School rep" : "School pending";
  return "Student";
}

function activeClub() {
  return clubs.find((item) => item.slug === state.host.clubSlug || item.id === state.host.clubSlug) || clubs[0] || {
    id: "",
    slug: "",
    name: "No club selected",
    category: "Club",
    school: state.host.school,
    tagline: "Create or approve clubs in Firestore to enable club controls.",
    description: "No approved club records are available yet.",
    doing: "Waiting for club data.",
    highlights: [],
    registrationOpen: false,
    join: "",
  };
}

function isAllowedRvuEmail(email) {
  return typeof email === "string" && email.trim().toLowerCase().endsWith("@rvu.edu.in");
}

function render() {
  app.innerHTML = state.authed ? renderAppShell() : renderLanding();
  bindEvents();
}

function renderAtTop() {
  render();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

async function syncFirebaseData() {
  if (!window.RVUFirebase || !state.authUser) return;
  state.dataLoading = true;
  render();
  const profile = await window.RVUFirebase.ensureUserProfile(state.authUser);
  const roleMap = {
    superAdmin: "admin",
    clubCore: "club-core",
    schoolRepresentative: "school-rep",
    student: "student",
  };
  state.role = roleMap[profile.role] || "student";
  state.user.name = profile.name || state.authUser.displayName || state.user.name;
  state.user.school = profile.school || state.user.school;
  state.user.year = profile.year || state.user.year;
  state.user.interests = profile.interests || state.user.interests;
  if (profile.clubId) state.host.clubSlug = profile.clubId;
  if (profile.schoolScope) state.host.school = profile.schoolScope;
  if (profile.roleTitle) state.host.roleTitle = profile.roleTitle;
  if (profile.hostName) state.host.name = profile.hostName;
  if (profile.hostApproved !== undefined) state.host.approved = profile.hostApproved;
  if (profile.role === "superAdmin" || profile.onboardingComplete) {
    state.onboardingStep = null;
  } else if (!state.onboardingStep) {
    state.onboardingStep = "role";
  }
  const data = await window.RVUFirebase.loadCampusData({ superAdmin: state.role === "admin" });
  replaceCollection(clubs, data.clubs);
  replaceCollection(events, data.events.map(normalizeEvent));
  replaceCollection(announcements, data.announcements);
  replaceCollection(projects, data.projects);
  state.hostRequests = data.hostRequests || [];
  state.moderationFlags = data.moderationFlags || [];
  state.allUsers = data.allUsers || [];
  state.allEvents = data.allEvents || [];
  state.allAnnouncements = data.allAnnouncements || [];
  state.allClubs = data.allClubs || [];
  state.allSchools = data.allSchools || [];
  state.savedItems = data.savedItems || [];
  state.followedClubs = data.followedClubs || [];
  state.rsvps = data.rsvps || [];
  state.myApplications = data.myApplications || [];
  state.siteSettings = data.siteSettings || [];
  if (profile.role !== "superAdmin" && data.clubAccess) {
    state.role = "club-core";
    state.host.clubSlug = data.clubAccess.club.id;
    state.host.school = data.clubAccess.club.school || state.host.school;
    state.host.roleTitle = data.clubAccess.member.role || "core";
    state.host.name = data.clubAccess.member.name || data.clubAccess.club.name;
    state.host.approved = true;
    state.onboardingStep = null;
  }
  state.dataLoaded = true;
  state.dataLoading = false;
}

function normalizeEvent(event) {
  const eventDate = event.date || event.displayDate || "";
  return {
    colors: ["#233039", "#926d2f"],
    tags: [],
    sort: 999,
    ...event,
    date: eventDate,
    past: event.past || false,
  };
}

async function enterAuthenticatedApp(user) {
  if (!user) {
    window.alert("Authentication required. Please sign in with your RVU email.");
    return;
  }
  state.authed = true;
  state.authUser = user;
  if (user.displayName) state.user.name = user.displayName;
  try {
    await syncFirebaseData();
    if (isSuperAdmin() && !window.location.pathname.endsWith("/admin.html")) {
      window.location.href = "./admin.html";
      return;
    }
  } catch (error) {
    state.dataLoading = false;
    window.alert(error.message || "Could not load Firebase data.");
  }
  renderAtTop();
}

async function handleSignOut() {
  if (!window.RVUFirebase) return;
  try {
    await window.RVUFirebase.signOut();
    state.authed = false;
    state.authUser = null;
    state.role = null;
    state.dataLoaded = false;
    state.onboardingStep = "role";
    state.route = "home";
    state.user = { name: "", school: schools[0], year: "1", interests: [] };
    state.allUsers = [];
    state.allEvents = [];
    state.allAnnouncements = [];
    state.allClubs = [];
    renderAtTop();
  } catch (error) {
    window.alert(error.message || "Sign-out failed.");
  }
}

async function startFirebaseLogin(mode = "google") {
  if (!window.RVUFirebase) {
    window.alert("Firebase is still loading. Please wait a moment and try again.");
    return;
  }

  try {
    if (mode === "password") {
      const email = state.authEmail.trim();
      const password = state.authPassword;
      if (!email || !password) throw new Error("Enter your RVU email and password.");
      const user = state.authMode === "signup"
        ? await window.RVUFirebase.createEmailPasswordAccount(email, password)
        : await window.RVUFirebase.signInWithEmailPassword(email, password);
      await enterAuthenticatedApp(user);
      state.loginOpen = false;
      state.authPassword = "";
      return;
    }
    const user = await window.RVUFirebase.signInWithGoogle();
    await enterAuthenticatedApp(user);
    state.loginOpen = false;
  } catch (error) {
    window.alert(error.message || "Firebase sign-in failed.");
  }
}

async function createFirebaseEvent() {
  if (!window.RVUFirebase) return;
  if (!canHost() && !isSuperAdmin()) {
    window.alert("You need an approved club core or school representative role to create events.");
    return;
  }
  const title = window.prompt("Event title");
  if (!title) return;
  const description = window.prompt("Short description") || "";
  const date = window.prompt("Display date, e.g. May 12") || "";
  const time = window.prompt("Time, e.g. 5:30 PM") || "";
  const location = window.prompt("Location") || "";
  const club = activeClub();
  const payload = isClubCore()
    ? {
        title,
        description,
        date,
        time,
        location,
        hostType: "club",
        clubId: club.id || club.slug,
        club: club.name,
        host: club.name,
        type: "Club Event",
        tags: [club.category].filter(Boolean),
      }
    : {
        title,
        description,
        date,
        time,
        location,
        hostType: "school",
        schoolId: state.host.school,
        host: state.host.school,
        type: "School Event",
        tags: [],
      };
  await window.RVUFirebase.createEvent(payload);
  await syncFirebaseData();
  state.createOpen = false;
}

async function createFirebaseAnnouncement() {
  if (!window.RVUFirebase) return;
  if (!canHost() && !isSuperAdmin()) {
    window.alert("You need an approved club core or school representative role to create announcements.");
    return;
  }
  const title = window.prompt("Announcement title");
  if (!title) return;
  const description = window.prompt("Short description") || "";
  const tag = window.prompt("Tag, e.g. Recruitment, Notice, Update") || "Update";
  const club = activeClub();
  const payload = isClubCore()
    ? {
        title,
        description,
        tag,
        sourceType: "club",
        clubId: club.id || club.slug,
        source: club.name,
        type: "Club",
        time: "Just now",
      }
    : {
        title,
        description,
        tag,
        sourceType: "school",
        schoolId: state.host.school,
        source: state.host.school,
        type: "Faculty",
        time: "Just now",
      };
  await window.RVUFirebase.createAnnouncement(payload);
  await syncFirebaseData();
  state.createOpen = false;
}

function renderLanding() {
  return `
    <main class="hero">
      <div class="hero-grid-bg" aria-hidden="true"></div>
      <div class="hero-nav">
        ${brandLockup("large")}
        <span class="hero-badge">For RV University</span>
      </div>
      <section class="hero-content">
        <p class="eyebrow">Campus operating system</p>
        <h1>Everything happening at RVU. In one place.</h1>
        <p>Events, clubs, announcements, and student projects presented with the clarity of a modern campus command center.</p>
        <div class="hero-actions">
          <button class="btn gold" data-action="open-login">Continue with RVU Email</button>
          <button class="btn ghost" data-action="login-google">Continue with Google</button>
        </div>
      </section>
      <section class="hero-peek" aria-label="Campus highlights">
        <div class="peek-tile"><strong>This week</strong>Live events from Firestore</div>
        <div class="peek-tile"><strong>Important</strong>Published notices only</div>
        <div class="peek-tile"><strong>Projects</strong>Verified student posts</div>
        <div class="peek-tile"><strong>Hosts</strong>Approved clubs and schools</div>
      </section>
      <footer class="site-footer hero-footer"><span>powered by iterium</span></footer>
      ${state.loginOpen ? renderAuthModal() : ""}
    </main>
  `;
}

function renderAuthModal() {
  return `
    <div class="modal-layer">
      <section class="modal auth-modal">
        <p class="eyebrow">RVU account</p>
        <h2>${state.authMode === "signup" ? "Create account" : "Sign in"}</h2>
        <p>Use your RVU email and password. Role selection happens after authentication.</p>
        <div class="auth-switch">
          <button class="${state.authMode === "signin" ? "active" : ""}" data-action="auth-mode" data-mode="signin">Sign in</button>
          <button class="${state.authMode === "signup" ? "active" : ""}" data-action="auth-mode" data-mode="signup">Create</button>
        </div>
        <div class="form-grid">
          ${inputField("authEmail", "RVU Email", state.authEmail, "email")}
          ${inputField("authPassword", "Password", state.authPassword, "password")}
        </div>
        <div class="auth-actions">
          <button class="btn gold" data-action="login-password">${state.authMode === "signup" ? "Create account" : "Sign in"}</button>
          <button class="btn secondary" data-action="login-google">Use Google</button>
          <button class="btn ghost" data-action="close-login">Cancel</button>
        </div>
      </section>
    </div>
  `;
}

function renderAppShell() {
  return `
    <div class="shell">
      <header class="topbar">
        ${brandLockup()}
        <nav class="desktop-nav" aria-label="Primary navigation">
          ${navButtons(false)}
        </nav>
        <div class="top-actions">
          ${canHost() || isSuperAdmin() ? createButton() : ""}
          <button class="role-pill" type="button" aria-label="Current role">${roleLabel()}</button>
          <button class="btn ghost sign-out-btn" data-action="sign-out" aria-label="Sign out">Sign out</button>
        </div>
      </header>
      ${renderTicker()}
      <main class="main">
        ${renderRoute()}
      </main>
      ${renderFooter()}
      <nav class="bottom-nav" aria-label="Primary navigation">
        ${navButtons(true)}
      </nav>
      ${state.onboardingStep ? renderOnboarding() : ""}
    </div>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <span>powered by iterium</span>
    </footer>
  `;
}

function renderTicker() {
  const items = ["THIS WEEK AT RVU", "AI BUILD NIGHT", "CLUB RECRUITMENT", "PROJECT COLLABORATION", "IMPORTANT UPDATES"];
  const ticker = [...items, ...items].map((item) => `<span>${item}</span>`).join("");
  return `<div class="ticker" aria-hidden="true"><div>${ticker}</div></div>`;
}

function brandLockup() {
  const sizeClass = arguments[0] === "large" ? " large" : "";
  return `
    <div class="brand-lockup${sizeClass}">
      <img class="brand-logo" src="./assets/rv-university-logo-gold.png" alt="RV University" />
      <div class="brand-copy">
        <strong>RVU Connect</strong>
      </div>
    </div>
  `;
}

function navButtons(withIcons) {
  const items = [
    ["home", "Home", "home"],
    ["events", "Events", "calendar"],
    ["clubs", "Clubs", "clubs"],
    ["projects", "Projects", "projects"],
    ["announcements", withIcons ? "Updates" : "Announcements", "announce"],
  ];
  if (isClubCore() || isSchoolRep() || isSuperAdmin()) {
    items.push(["admin", "Admin", "admin"]);
  }
  return items.map(([route, label, iconName]) => `
    <button class="${withIcons ? "nav-item" : ""} ${state.route === route ? "active" : ""}" data-route="${route}">
      ${withIcons ? icon(iconName) : ""}<span>${label}</span>
    </button>
  `).join("");
}

function createButton() {
  return `
    <div class="create-wrap">
      <button class="btn" data-action="toggle-create">${icon("plus")} Create</button>
      ${state.createOpen ? `
        <div class="create-menu">
          <button data-action="create-event">Create Event</button>
          <button data-action="create-announcement">Create Announcement</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderRoute() {
  if (state.dataLoading) return renderLoadingState();
  if (state.route === "admin-create-club") return renderCreateClubPage();
  if (state.route === "events") return renderEvents();
  if (state.route === "clubs") return renderClubs();
  if (state.route === "projects") return renderProjects();
  if (state.route === "announcements") return renderAnnouncements();
  if (state.route === "admin") return renderAdminConsole();
  return renderHome();
}

function renderLoadingState() {
  return `
    <section class="page-head">
      ${sectionLabel("00", "Firebase")}
      <h1>Loading campus data</h1>
      <p>RVU Connect is syncing your profile, events, clubs, announcements, and project data from Firestore.</p>
    </section>
  `;
}

function renderEmptyState(title, copy, action = "") {
  return `
    <article class="card announcement empty-state">
      <h3>${title}</h3>
      <p>${copy}</p>
      ${action}
    </article>
  `;
}

function renderHome() {
  const upcoming = events.filter((event) => !event.past).sort((a, b) => a.sort - b.sort).slice(0, 5);
  const personalized = [...events, ...projects].filter((item) => (item.tags || []).some((tag) => state.user.interests.includes(tag) || state.user.interests.includes(tag.replace("Web", "Web Development")))).slice(0, 4);
  const nextEvent = upcoming[0];
  return `
    <section class="page-head dashboard-head">
      <div>
        ${sectionLabel("01", "Curated dashboard")}
        <h1>Welcome to RVU Connect</h1>
        <p>Upcoming events, project opportunities, and priority updates arranged for action, not endless scrolling.</p>
      </div>
      <div class="campus-metrics" aria-label="Campus activity summary">
        <span><strong>${events.filter((event) => !event.past).length}</strong> live events</span>
        <span><strong>${clubs.length}</strong> approved clubs</span>
        <span><strong>${announcements.length}</strong> updates</span>
      </div>
    </section>
    <div class="home-layout">
      <div>
        ${nextEvent ? `<section class="spotlight">
          <div>
            <span class="tag gold">Next up</span>
            <h2>${nextEvent.title}</h2>
            <p>${nextEvent.description}</p>
          </div>
          <div class="spotlight-date">
            <strong>${nextEvent.date}</strong>
            <span>${nextEvent.time || ""}</span>
          </div>
        </section>` : `<section class="section">${renderEmptyState("No live events yet", "Published events from Firestore will appear here once approved club core or school representatives create them.")}</section>`}
        <section class="section">
          <div class="section-title"><h2>This Week at RVU</h2><span>Soonest first</span></div>
          ${upcoming.length ? `<div class="grid event-grid">${upcoming.map(renderEventCard).join("")}</div>` : renderEmptyState("No upcoming events", "Events with status published will appear here.")}
        </section>
        <section class="section">
          <div class="section-title"><h2>Personalized For You</h2><span>${state.user.interests.join(", ")}</span></div>
          ${personalized.length ? `<div class="grid event-grid">${personalized.map(renderPersonalCard).join("")}</div>` : renderEmptyState("Nothing personalized yet", "Add interests and publish matching events or projects in Firestore.")}
        </section>
      </div>
      <aside>
        <section class="section">
          <div class="section-title"><h2>Important Updates</h2><span>High priority</span></div>
          ${announcements.length ? `<div class="updates">${announcements.slice(0, 3).map(renderUpdate).join("")}</div>` : renderEmptyState("No announcements yet", "Published announcements from clubs and schools will appear here.")}
        </section>
        <section class="section">
          <div class="section-title"><h2>Quick Access</h2></div>
          <div class="grid quick-grid">
            ${quickCard("events", "Events", "Browse campus programming", "calendar")}
            ${quickCard("clubs", "Clubs", "Find approved hosts", "clubs")}
            ${quickCard("projects", "Projects", "Join student teams", "projects")}
            ${quickCard("announcements", "Announcements", "Read structured updates", "announce")}
          </div>
        </section>
        <section class="section">
          <div class="section-title"><h2>My Campus</h2><span>Saved and applied</span></div>
          <div class="updates">
            ${state.followedClubs.slice(0, 2).map((item) => `<article class="update-item"><h3>${escapeHtml(item.clubName || "Followed club")}</h3><p>Club followed for personalized updates.</p></article>`).join("")}
            ${state.rsvps.slice(0, 2).map((item) => `<article class="update-item"><h3>${escapeHtml(item.title || "RSVP")}</h3><p>${escapeHtml(item.status || "going")} RSVP stored.</p></article>`).join("")}
            ${state.myApplications.slice(0, 2).map((item) => `<article class="update-item"><h3>${escapeHtml(item.title || "Project application")}</h3><p>Status: ${escapeHtml(item.status || "pending")}</p></article>`).join("")}
            ${!state.followedClubs.length && !state.rsvps.length && !state.myApplications.length ? renderEmptyState("No personal activity yet", "Follow clubs, RSVP to events, save content, or apply to projects.") : ""}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function renderEvents() {
  const filtered = events.filter((event) => state.filters.eventType === "All" || event.type === state.filters.eventType);
  const upcoming = filtered.filter((event) => !event.past).sort((a, b) => a.sort - b.sort);
  const past = filtered.filter((event) => event.past);
  return `
    <section class="page-head">
      ${sectionLabel("02", "Events system")}
      <h1>Events</h1>
      <p>Centralized discovery for club, faculty, and school events. Past events stay archived instead of disappearing.</p>
    </section>
    <div class="filters">
      ${selectField("eventType", "Type", ["All", "Club Event", "Faculty Event", "School Event"], state.filters.eventType)}
      ${selectField("club", "Club", ["All", ...clubs.map((club) => club.name)], "All")}
      ${selectField("date", "Date", ["All upcoming", "This week", "This month"], "All upcoming")}
    </div>
    <section class="section">
      <div class="section-title"><h2>Upcoming</h2><span>${upcoming.length} events</span></div>
      ${upcoming.length ? `<div class="grid event-grid">${upcoming.map(renderEventCard).join("")}</div>` : renderEmptyState("No upcoming events", "When approved hosts create published events in Firestore, they will appear here.")}
    </section>
    <section class="section">
      <div class="section-title"><h2>Past Events</h2><span>Archived</span></div>
      ${past.length ? `<div class="grid event-grid">${past.map(renderEventCard).join("")}</div>` : renderEmptyState("No archived events", "Past events will stay visible after their date has passed.")}
    </section>
  `;
}

function renderClubs() {
  if (state.selectedClubSlug) return renderClubDetail();
  const filtered = clubs.filter((club) =>
    (state.filters.clubCategory === "All" || club.category === state.filters.clubCategory) &&
    (state.filters.clubSchool === "All" || club.school === state.filters.clubSchool)
  );
  return `
    <section class="page-head">
      ${sectionLabel("03", "Approved hosts only")}
      <h1>Clubs</h1>
      <p>Here are the approved clubs that exist on RVU Connect. Tap into a club to see what they do, what they have hosted, and whether registrations are open.</p>
    </section>
    <div class="filters">
      ${selectField("clubCategory", "Category", ["All", ...unique(clubs.map((club) => club.category))], state.filters.clubCategory)}
      ${selectField("clubSchool", "School", ["All", ...unique(clubs.map((club) => club.school))], state.filters.clubSchool)}
    </div>
    ${filtered.length ? `<div class="grid club-grid">${filtered.map(renderClubCard).join("")}</div>` : renderEmptyState("No approved clubs yet", "Create approved club documents in Firestore or approve club host requests to populate this directory.")}
  `;
}

function renderClubDetail() {
  const club = clubs.find((item) => item.slug === state.selectedClubSlug) || clubs[0];
  if (!club) return renderClubs();
  const clubEvents = events.filter((event) => event.club === club.name || event.host === club.name);
  const upcoming = clubEvents.filter((event) => !event.past);
  const past = clubEvents.filter((event) => event.past);
  return `
    <section class="club-detail-hero">
      <button class="back-link" data-action="back-to-clubs">Back to all clubs</button>
      <div class="club-detail-mark">${club.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
      <div>
        ${sectionLabel("03", club.category)}
        <h1>${club.name}</h1>
        <p>${club.tagline}</p>
      </div>
      <div class="club-detail-meta">
        <span>${club.school}</span>
        <span>${clubEvents.length} campus ${clubEvents.length === 1 ? "event" : "events"}</span>
        <span>${club.registrationOpen ? "Registration open" : "Registration closed"}</span>
      </div>
    </section>
    <section class="club-detail-layout">
      <article class="club-panel club-about">
        <span class="section-num">About</span>
        <h2>What they do</h2>
        <p>${club.description}</p>
      </article>
      <article class="club-panel club-now">
        <span class="section-num">Now</span>
        <h2>Currently active on</h2>
        <p>${club.doing}</p>
      </article>
      <article class="club-panel">
        <span class="section-num">Record</span>
        <h2>What they have done</h2>
        <div class="club-highlights">
          ${(club.highlights || []).length ? club.highlights.map((item) => `<span>${item}</span>`).join("") : `<span>No highlights published yet</span>`}
        </div>
      </article>
      <article class="club-panel club-join-panel">
        <span class="section-num">Join</span>
        <h2>${club.registrationOpen ? "Registrations are open" : "Registrations are closed"}</h2>
        <p>${club.registrationOpen ? "This club is currently accepting new members through its registration form." : "This club is visible on RVU Connect, but it is not accepting new registrations right now."}</p>
        ${club.registrationOpen ? `<button class="btn gold" data-action="toast" data-message="Join link: ${club.join}">Open join link</button>` : `<span class="tag">No active join link</span>`}
      </article>
    </section>
    <section class="section">
      <div class="section-title"><h2>Club events</h2><span>${clubEvents.length ? "Hosted by club" : "No events yet"}</span></div>
      ${clubEvents.length ? `<div class="grid event-grid">${clubEvents.map(renderEventCard).join("")}</div>` : renderEmptyState("No events listed yet", "When this club posts published events, they will appear here.")}
    </section>
  `;
}

function renderProjects() {
  const tags = unique(projects.flatMap((project) => project.tags || []));
  const filtered = projects.filter((project) => state.filters.projectTag === "All" || (project.tags || []).includes(state.filters.projectTag));
  return `
    <section class="page-head">
      ${sectionLabel("04", "Student collaboration")}
      <h1>Projects</h1>
      <p>Reddit-inspired structure without heavy discussion threads: clear skill needs, status, expiry, and application flow.</p>
    </section>
    <div class="filters">
      ${selectField("projectTag", "Tag", ["All", ...tags], state.filters.projectTag)}
      ${selectField("status", "Status", ["All", "Open", "Closed"], "All")}
    </div>
    ${filtered.length ? `<div class="grid project-grid">${filtered.map(renderProjectCard).join("")}</div>` : renderEmptyState("No projects yet", "Verified users can create project posts in Firestore.")}
  `;
}

function renderAnnouncements() {
  const filtered = announcements.filter((item) => state.filters.announcementType === "All" || item.type === state.filters.announcementType);
  return `
    <section class="page-head">
      ${sectionLabel("05", "Structured updates")}
      <h1>Announcements</h1>
      <p>Posts for recruitment, notices, registration updates, and internal information. No comments, upvotes, or social clutter.</p>
    </section>
    <div class="filters">
      ${selectField("announcementType", "Source Type", ["All", "Club", "Faculty"], state.filters.announcementType)}
      ${selectField("announcementTag", "Tag", ["All", "Recruitment", "Notice", "Update"], "All")}
    </div>
    ${filtered.length ? `<div class="updates">${filtered.map(renderAnnouncement).join("")}</div>` : renderEmptyState("No announcements yet", "Approved clubs and school representatives can publish structured updates.")}
  `;
}

function sectionLabel(number, label) {
  return `
    <div class="section-label">
      <span class="section-num">${number}</span>
      <span class="eyebrow">${label}</span>
    </div>
  `;
}

function renderAdminConsole() {
  if (!isClubCore() && !isSchoolRep() && !isSuperAdmin()) return renderRestrictedAdmin();
  if ((isClubCore() || isSchoolRep()) && !state.host.approved) return renderPendingAdminAccess();
  if (isSuperAdmin()) return renderSuperAdminDashboard();
  const dashboard = isClubCore() ? renderClubAdmin() : renderSchoolAdmin();
  return `
    <section class="page-head admin-head">
      ${sectionLabel("06", "Control rooms")}
      <h1>${isClubCore() ? "Club Core Dashboard" : "School Representative Dashboard"}</h1>
      <p>Your controls are scoped to the organization your approved representative record grants. This dashboard cannot change your role.</p>
    </section>
    ${dashboard}
  `;
}

function renderSuperAdminDashboard() {
  return `
    <section class="page-head admin-head">
      ${sectionLabel("06", "Platform authority")}
      <h1>Super Admin Dashboard</h1>
      <p>Super admin access is granted by the Firestore user role or a locked superAdmins credential document. From here you review representative requests, moderate content, and maintain platform registries.</p>
    </section>
    ${renderSuperAdmin()}
  `;
}

function renderCreateClubPage() {
  if (!isSuperAdmin()) return renderRestrictedAdmin();
  const draft = state.clubDraft;
  return `
    <section class="page-head admin-head">
      ${sectionLabel("06A", "Club creation")}
      <h1>Create a club</h1>
      <p>Create the public club profile, founding record, faculty advisor, and first president in one place. The founder is preserved as a permanent core member.</p>
      <div class="project-actions">
        <button class="btn secondary" data-action="admin-back-to-clubs">Back to clubs</button>
      </div>
    </section>
    <section class="admin-workspace">
      <article class="admin-card wide">
        <span class="section-num">Profile</span>
        <h2>Club identity</h2>
        <div class="form-grid two">
          ${clubInputField("name", "Club name", draft.name)}
          ${clubInputField("category", "Category", draft.category, "Tech, AI, Cultural...")}
          ${clubSelectField("school", "School", schools, draft.school)}
          ${clubInputField("tagline", "Small tagline", draft.tagline)}
        </div>
        <div class="form-grid">
          ${clubTextArea("description", "Description", draft.description)}
          ${clubInputField("joinLink", "Join / registration link", draft.joinLink)}
        </div>
      </article>
      <article class="admin-card wide">
        <span class="section-num">People</span>
        <h2>Founding roles</h2>
        <div class="form-grid two">
          ${clubInputField("founderName", "Founder name", draft.founderName)}
          ${clubInputField("founderEmail", "Founder RVU email", draft.founderEmail, "name@rvu.edu.in", "email")}
          ${clubInputField("facultyAdvisorName", "Faculty advisor name", draft.facultyAdvisorName)}
          ${clubInputField("facultyAdvisorEmail", "Faculty advisor RVU email", draft.facultyAdvisorEmail, "name@rvu.edu.in", "email")}
          ${clubInputField("currentPresidentName", "Current president name", draft.currentPresidentName)}
          ${clubInputField("currentPresidentEmail", "Current president RVU email", draft.currentPresidentEmail, "name@rvu.edu.in", "email")}
        </div>
        <label class="check-row">
          <input type="checkbox" data-club-check="registrationOpen" ${draft.registrationOpen ? "checked" : ""} />
          <span>Open registrations immediately</span>
        </label>
        <div class="project-actions">
          <button class="btn gold" data-action="admin-submit-club">Create club</button>
          <button class="btn secondary" data-action="admin-reset-club-form">Clear form</button>
        </div>
      </article>
    </section>
  `;
}

function renderRestrictedAdmin() {
  return `
    <section class="page-head admin-head">
      ${sectionLabel("06", "Restricted")}
      <h1>Admin access</h1>
      <p>Admin screens are only available when your Firestore profile or approved representative record grants access. Students cannot switch themselves into admin roles from the client.</p>
    </section>
  `;
}

function renderPendingAdminAccess() {
  return `
    <section class="page-head admin-head">
      ${sectionLabel("06", "Pending verification")}
      <h1>${isClubCore() ? "Club core request" : "School representative request"}</h1>
      <p>${isClubCore() ? `${activeClub().name} core access must be approved by the current president or a super admin before event hosting is enabled.` : `${state.host.school} representative access must be approved by a super admin before school controls are enabled.`}</p>
    </section>
    <section class="admin-workspace">
      <div class="admin-summary">
        <span><strong>Pending</strong> access state</span>
        <span><strong>${isClubCore() ? activeClub().name : "School"}</strong> scope</span>
        <span><strong>${state.host.approver}</strong> approver route</span>
      </div>
      <div class="admin-board">
        <article class="admin-card wide">
          <span class="section-num">Request</span>
          <h2>${state.host.roleTitle}</h2>
          <p>${state.host.description}</p>
          <div class="admin-checklist">
            <span>Cannot create events until approved</span>
            <span>Cannot post announcements until approved</span>
            <span>Can be approved by ${isClubCore() ? "the club president or super admin" : "super admin"}</span>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderSchoolAdmin() {
  const schoolName = isSuperAdmin() ? "All schools" : state.host.school;
  const schoolEvents = events.filter((event) => event.type === "School Event" || event.type === "Faculty Event");
  return `
    <section class="admin-workspace">
      <div class="admin-summary">
        <span><strong>${isSuperAdmin() ? schools.length : "1"}</strong> ${isSuperAdmin() ? "schools" : "school scope"}</span>
        <span><strong>${schoolEvents.length}</strong> school/faculty events</span>
        <span><strong>${state.host.approved || isSuperAdmin() ? "Enabled" : "Locked"}</strong> school posting</span>
      </div>
      <div class="admin-board">
        <article class="admin-card wide">
          <span class="section-num">Scope</span>
          <h2>${schoolName}</h2>
          <p>School representatives can post school events, faculty announcements, registration links, and notices only for the school they are verified under.</p>
          <div class="project-actions">
            <button class="btn gold" data-action="create-event">Create school event</button>
            <button class="btn secondary" data-action="create-announcement">Create school notice</button>
          </div>
        </article>
        <article class="admin-card">
          <span class="section-num">Links</span>
          <h2>Official links</h2>
          <div class="admin-checklist">
            <span>Primary link: ${state.host.joinLink || "No link configured"}</span>
            <span>Visible on school notices and school events</span>
            <span>Editable only by approved school representatives</span>
          </div>
        </article>
        <article class="admin-card">
          <span class="section-num">Notice</span>
          <h2>School announcements</h2>
          ${announcements.filter((item) => item.sourceType === "school" || item.type === "Faculty").slice(0, 3).map((item) => adminRow(item.title, `${item.source || "School"} · ${item.tag || "Update"}`, ["Edit", "Archive"])).join("") || renderEmptyState("No school announcements", "Published school announcements will appear here.")}
        </article>
        <article class="admin-card">
          <span class="section-num">Events</span>
          <h2>Event controls</h2>
          ${schoolEvents.slice(0, 3).map((event) => adminRow(event.title, `${event.host || "School"} · ${event.date || ""} · ${event.location || ""}`, ["Edit", "Archive"])).join("") || renderEmptyState("No school events", "Create a school event to see it here.")}
        </article>
        <article class="admin-card">
          <span class="section-num">Rules</span>
          <h2>Representative limits</h2>
          <div class="admin-checklist">
            <span>Post only for the verified school</span>
            <span>Show or hide official registration and resource links</span>
            <span>Primary link: ${state.host.joinLink || "No link configured"}</span>
            <span>Cannot approve club core members</span>
            <span>Escalate moderation issues to Super Admin</span>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderClubAdmin() {
  const club = isSuperAdmin() ? activeClub() : activeClub();
  const clubEvents = events.filter((event) => event.club === club.name || event.host === club.name);
  const clubAnnouncements = announcements.filter((item) => item.clubId === club.id || item.clubId === club.slug || item.source === club.name);
  const canManageCore = isSuperAdmin() || ["president", "owner"].includes((state.host.roleTitle || "").toLowerCase());
  return `
    <section class="admin-workspace">
      <div class="admin-summary">
        <span><strong>${clubEvents.length}</strong> club events</span>
        <span><strong>${club.registrationOpen ? "Open" : "Closed"}</strong> registration</span>
        <span><strong>${state.host.roleTitle}</strong> your role</span>
      </div>
      <div class="admin-board">
        <article class="admin-card wide">
          <span class="section-num">Club</span>
          <h2>${club.name}</h2>
          <p>Only approved core members can host events, publish announcements, and control the links shown for ${club.name}.</p>
          <div class="project-actions">
            <button class="btn gold" data-action="create-event">Create club event</button>
            <button class="btn secondary" data-action="create-announcement">Create update</button>
            <button class="btn gold" data-action="toggle-registration" data-club="${club.slug}">${club.registrationOpen ? "Close registration" : "Open registration"}</button>
            <button class="btn secondary" data-action="toast" data-message="Link visibility controls are ready for ${club.name}.">Manage links</button>
          </div>
        </article>
        <article class="admin-card">
          <span class="section-num">Links</span>
          <h2>Visible links</h2>
          <div class="admin-checklist">
            <span>Join link: ${state.host.joinLink || club.join || "No link configured"}</span>
            <span>Registration state: ${club.registrationOpen ? "Open" : "Closed"}</span>
            <span>Shown only on this club's public profile</span>
          </div>
        </article>
        <article class="admin-card">
          <span class="section-num">Host</span>
          <h2>Club posting</h2>
          ${[...clubEvents.map((event) => ({ title: event.title, meta: `Event · ${event.date || ""}` })), ...clubAnnouncements.map((item) => ({ title: item.title, meta: `Announcement · ${item.tag || "Update"}` }))].slice(0, 4).map((item) => adminRow(item.title, item.meta, ["Edit", "Archive"])).join("") || renderEmptyState("No club posts", "Create an event or announcement to manage it here.")}
        </article>
        <article class="admin-card">
          <span class="section-num">Core</span>
          <h2>Core approval</h2>
          ${canManageCore ? `<div class="project-actions" style="margin-bottom:18px">
            <button class="btn gold" data-action="club-update-leadership" data-docid="${club.id || club.slug}">Update leadership</button>
            <button class="btn gold" data-action="club-assign-core" data-docid="${club.id || club.slug}">Assign core role</button>
            <button class="btn secondary" data-action="club-remove-core" data-docid="${club.id || club.slug}">Remove core role</button>
          </div>` : ""}
          ${state.hostRequests.filter((item) => item.type === "clubCore" && item.clubId === (club.id || club.slug)).map((item) => adminRow(item.name || item.email, `${item.roleTitle || "Core"} · ${item.status}`, ["Accept", "Waitlist"])).join("") || renderEmptyState("No core requests", "Club core requests will appear here after students apply.")}
        </article>
        <article class="admin-card">
          <span class="section-num">Limits</span>
          <h2>Permission boundary</h2>
          <div class="admin-checklist">
            <span>Can host only for ${club.name}</span>
            <span>Can edit this club profile and visible links</span>
            <span>Primary join link: ${state.host.joinLink || club.join}</span>
            <span>Can approve core only if president-level access is granted</span>
            <span>Cannot post for another club or school</span>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderSuperAdmin() {
  const tabs = [
    ["requests", "Requests", state.hostRequests.length],
    ["users", "Users", state.allUsers.length],
    ["schools", "Schools", state.allSchools.length || schools.length],
    ["clubs", "Clubs", state.allClubs.length],
    ["events", "Events", state.allEvents.length],
    ["announcements", "Notices", state.allAnnouncements.length],
    ["projects", "Projects", projects.length],
    ["moderation", "Flags", state.moderationFlags.length],
  ];

  const tabBar = `
    <div class="admin-tabs">
      ${tabs.map(([key, label, count]) => `
        <button class="${state.adminTab === key ? "active" : ""}" data-action="admin-tab" data-tab="${key}">
          ${label} <small>(${count})</small>
        </button>
      `).join("")}
    </div>
  `;

  let content = "";

  if (state.adminTab === "requests") {
    const pending = state.hostRequests.filter((r) => r.status === "pending");
    const resolved = state.hostRequests.filter((r) => r.status !== "pending");
    content = `
      <article class="admin-card wide">
        <span class="section-num">Pending</span>
        <h2>Pending Requests</h2>
        ${pending.length ? pending.map((item) =>
          adminRow(item.name || item.email, `${item.type} · ${item.roleTitle || "Representative"} · ${item.email}`, ["Approve", "Reject"], "host", item.id)
        ).join("") : renderEmptyState("No pending requests", "Club core and school representative requests will appear here.")}
      </article>
      <article class="admin-card">
        <span class="section-num">History</span>
        <h2>Resolved</h2>
        ${resolved.length ? resolved.map((item) =>
          `<div class="admin-row"><div><strong>${item.name || item.email}</strong><span>${item.type} · ${item.status}</span></div></div>`
        ).join("") : renderEmptyState("No history", "Resolved requests will appear here.")}
      </article>
    `;
  }

  if (state.adminTab === "users") {
    const roleLabels = { superAdmin: "Super Admin", clubCore: "Club Core", schoolRepresentative: "School Rep", student: "Student" };
    content = `
      <article class="admin-card wide">
        <span class="section-num">Directory</span>
        <h2>All Users</h2>
        <p>User roles are managed in Firestore. Super admin role can only be set directly in the database.</p>
        ${state.allUsers.length ? state.allUsers.map((u) => `
          <div class="admin-row">
            <div>
              <strong>${u.name || u.email || u.id}</strong>
              <span>${u.email || "No email"} · ${roleLabels[u.role] || u.role || "student"} · ${u.school || "No school"}</span>
            </div>
            <div class="admin-row-actions">
              <button class="role-indicator">${roleLabels[u.role] || u.role || "student"}</button>
            </div>
          </div>
        `).join("") : renderEmptyState("No users yet", "Users will appear here after they sign in.")}
      </article>
    `;
  }

  if (state.adminTab === "clubs") {
    content = `
      <article class="admin-card wide">
        <span class="section-num">Registry</span>
        <h2>All Clubs</h2>
        <div class="project-actions" style="margin-bottom:18px">
          <button class="btn gold" data-action="admin-create-club">Create new club</button>
        </div>
        ${state.allClubs.length ? state.allClubs.map((c) => `
          <div class="admin-row">
            <div>
              <strong>${c.name}</strong>
              <span>${c.category || "General"} · ${c.school || "RVU"} · President: ${c.currentPresidentEmail || "Not set"} · Advisor: ${c.facultyAdvisorName || c.facultyAdvisorEmail || "Not set"} · Founder: ${c.founderEmail || "Not set"}</span>
            </div>
            <div class="admin-row-actions">
              <button data-action="admin-update-club-leadership" data-docid="${c.id}">Leadership</button>
              <button data-action="admin-assign-core" data-docid="${c.id}">Assign core</button>
              <button data-action="admin-remove-core" data-docid="${c.id}">Remove core</button>
              <button data-action="admin-delete-club" data-docid="${c.id}">Delete</button>
            </div>
          </div>
        `).join("") : renderEmptyState("No clubs", "Create a club to get started.")}
      </article>
    `;
  }

  if (state.adminTab === "schools") {
    const schoolRows = state.allSchools.length
      ? state.allSchools
      : schools.map((name) => ({ id: name, name, status: "seeded", description: "Default RVU school option" }));
    content = `
      <article class="admin-card wide">
        <span class="section-num">Registry</span>
        <h2>School Management</h2>
        <div class="project-actions" style="margin-bottom:18px">
          <button class="btn gold" data-action="admin-create-school">Create school</button>
        </div>
        ${schoolRows.map((school) => `
          <div class="admin-row">
            <div>
              <strong>${school.name}</strong>
              <span>${school.shortName || "RVU"} · ${school.description || "School workspace"} · Status: ${school.status || "active"}</span>
            </div>
            <div class="admin-row-actions">
              ${school.status === "seeded" ? "" : `<button data-action="admin-delete-school" data-docid="${school.id}">Delete</button>`}
            </div>
          </div>
        `).join("")}
      </article>
    `;
  }

  if (state.adminTab === "events") {
    content = `
      <article class="admin-card wide">
        <span class="section-num">All</span>
        <h2>Event Management</h2>
        <div class="project-actions" style="margin-bottom:18px">
          <button class="btn gold" data-action="admin-create-event">Create event</button>
        </div>
        ${state.allEvents.length ? state.allEvents.map((e) => `
          <div class="admin-row">
            <div>
              <strong>${e.title}</strong>
              <span>${e.host || e.club || "RVU"} · ${e.date || "No date"} · Status: ${e.status || "unknown"}</span>
            </div>
            <div class="admin-row-actions">
              ${e.status === "published"
                ? `<button data-action="admin-unpublish-event" data-docid="${e.id}">Unpublish</button>`
                : `<button data-action="admin-publish-event" data-docid="${e.id}">Publish</button>`}
              <button data-action="admin-delete-event" data-docid="${e.id}">Delete</button>
            </div>
          </div>
        `).join("") : renderEmptyState("No events", "Events will appear here when created.")}
      </article>
    `;
  }

  if (state.adminTab === "announcements") {
    content = `
      <article class="admin-card wide">
        <span class="section-num">All</span>
        <h2>Announcement Management</h2>
        <div class="project-actions" style="margin-bottom:18px">
          <button class="btn gold" data-action="admin-create-announcement">Create notice</button>
        </div>
        ${state.allAnnouncements.length ? state.allAnnouncements.map((a) => `
          <div class="admin-row">
            <div>
              <strong>${a.title}</strong>
              <span>${a.source || "RVU"} · ${a.tag || "Update"} · Status: ${a.status || "unknown"}</span>
            </div>
            <div class="admin-row-actions">
              ${a.status === "published"
                ? `<button data-action="admin-unpublish-announcement" data-docid="${a.id}">Unpublish</button>`
                : ""}
              <button data-action="admin-delete-announcement" data-docid="${a.id}">Delete</button>
            </div>
          </div>
        `).join("") : renderEmptyState("No announcements", "Announcements will appear here when created.")}
      </article>
    `;
  }

  if (state.adminTab === "projects") {
    content = `
      <article class="admin-card wide">
        <span class="section-num">All</span>
        <h2>Project Management</h2>
        <div class="project-actions" style="margin-bottom:18px">
          <button class="btn gold" data-action="admin-create-project">Create project</button>
        </div>
        ${projects.length ? projects.map((p) => `
          <div class="admin-row">
            <div>
              <strong>${p.title}</strong>
              <span>${(p.tags || []).join(", ") || "No tags"} · Status: ${p.status || "open"} · Owner: ${p.ownerId || "Super admin"}</span>
            </div>
            <div class="admin-row-actions">
              <button data-action="admin-delete-project" data-docid="${p.id}">Delete</button>
            </div>
          </div>
        `).join("") : renderEmptyState("No projects", "Create a project or wait for verified users to post.")}
      </article>
    `;
  }

  if (state.adminTab === "moderation") {
    content = `
      <article class="admin-card wide">
        <span class="section-num">Quality</span>
        <h2>Moderation Flags</h2>
        ${state.moderationFlags.length ? state.moderationFlags.map((item) =>
          `<div class="admin-row"><div><strong>${item.title || item.reason || "Flag"}</strong><span>${item.collection || "Content"} · ${item.status || "Open"}</span></div></div>`
        ).join("") : renderEmptyState("No moderation flags", "User-created moderation flags will appear here.")}
      </article>
    `;
  }

  return `
    <section class="admin-workspace">
      <div class="admin-summary">
        <span><strong>${state.hostRequests.filter((r) => r.status === "pending").length}</strong> pending requests</span>
        <span><strong>${state.allUsers.length}</strong> registered users</span>
        <span><strong>${state.allClubs.length}</strong> total clubs</span>
      </div>
      ${tabBar}
      <div class="admin-board">
        ${content}
      </div>
    </section>
  `;
}

function adminRow(title, meta, actions, mode = "generic", id = "") {
  return `
    <div class="admin-row">
      <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span></div>
      <div class="admin-row-actions">
        ${actions.map((action) => {
          const dataAction = mode === "host" && action === "Approve" ? "approve-host" : mode === "host" && action === "Reject" ? "reject-host" : "toast";
          return `<button data-action="${dataAction}" data-request="${id}" data-message="${action}: ${escapeHtml(title)}">${action}</button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderEventCard(event) {
  const colors = event.colors || ["#233039", "#926d2f"];
  const date = escapeHtml(event.date || "TBA");
  const dateParts = date.split(" ");
  const tags = event.tags || [];
  return `
    <article class="card event-card">
      <div class="poster" style="--poster-a:${colors[0]};--poster-b:${colors[1]}">
        <strong>${dateParts[0]}<br>${dateParts[1] || ""}</strong>
        <span>${escapeHtml(event.type || "Event")}</span>
      </div>
      <div class="card-body">
        <div class="meta"><span>${date} · ${escapeHtml(event.time || "Time TBA")}</span><span>${escapeHtml(event.location || "Location TBA")}</span></div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description || "")}</p>
        <div class="chip-grid">${tags.map((tag) => `<span class="tag gold">${escapeHtml(tag)}</span>`).join("")}<span class="tag">${escapeHtml(event.host || "RVU")}</span></div>
        <div class="project-actions">
          <button class="btn gold" data-action="rsvp-event" data-docid="${event.id}" data-title="${escapeHtml(event.title)}">RSVP</button>
          <button class="btn secondary" data-action="save-item" data-kind="event" data-docid="${event.id}" data-title="${escapeHtml(event.title)}">Save</button>
          <button class="btn secondary" data-action="calendar-event" data-docid="${event.id}">Calendar</button>
          <button class="btn secondary" data-action="flag-content" data-kind="events" data-docid="${event.id}" data-title="${escapeHtml(event.title)}">Report</button>
        </div>
      </div>
    </article>
  `;
}

function renderPersonalCard(item) {
  if (item.time) return renderEventCard(item);
  return renderProjectCard(item);
}

function renderUpdate(item) {
  return `
    <article class="update-item">
      <div class="meta"><span class="tag gold">${escapeHtml(item.tag || "Update")}</span><span>${escapeHtml(item.source || "RVU")}</span><span>${escapeHtml(item.time || "")}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description || "")}</p>
      <div class="project-actions">
        <button class="btn secondary" data-action="save-item" data-kind="announcement" data-docid="${item.id}" data-title="${escapeHtml(item.title)}">Save</button>
        <button class="btn secondary" data-action="flag-content" data-kind="announcements" data-docid="${item.id}" data-title="${escapeHtml(item.title)}">Report</button>
      </div>
    </article>
  `;
}

function quickCard(route, title, copy, iconName) {
  return `<button class="quick-card" data-route="${route}">${icon(iconName)}<span><strong>${title}</strong><br>${copy}</span></button>`;
}

function renderClubCard(club) {
  const clubEvents = events.filter((event) => event.club === club.name || event.host === club.name).length;
  return `
    <article class="card club-card" data-club-card="${club.slug || club.id}">
      <div class="club-top">
        <div class="avatar">${escapeHtml(club.name.split(" ").map((word) => word[0]).slice(0, 2).join(""))}</div>
        <div><h3>${escapeHtml(club.name)}</h3><span class="tag gold">${escapeHtml(club.category || "Club")}</span></div>
      </div>
      <p>${escapeHtml(club.tagline || club.description || "")}</p>
      <div class="meta"><span>${escapeHtml(club.school || "RVU")}</span><span>${clubEvents} events</span><span>${club.registrationOpen ? "Open" : "Closed"}</span></div>
      <div class="project-actions">
        <button class="btn secondary" data-action="open-club" data-club="${club.slug || club.id}">View club</button>
        <button class="btn gold" data-action="follow-club" data-docid="${club.id || club.slug}" data-title="${escapeHtml(club.name)}">Follow</button>
      </div>
    </article>
  `;
}

function renderProjectCard(project) {
  const status = project.status || "Open";
  const skills = project.skills || [];
  return `
    <article class="card project-card">
      <div class="project-rail"><button data-action="save-item" data-kind="project" data-docid="${project.id}" data-title="${escapeHtml(project.title)}">${icon("bookmark")}</button><span>${project.score || 0}</span></div>
      <div class="card-body">
        <div class="meta"><span class="status ${status.toLowerCase()}">${escapeHtml(status)}</span><span>Expires ${escapeHtml(project.expiry || "TBA")}</span></div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description || "")}</p>
        <div class="chip-grid">${skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
        <div class="project-actions">
          <button class="btn gold" data-action="apply-project" data-docid="${project.id}" data-title="${escapeHtml(project.title)}">Apply</button>
          <button class="btn secondary" data-action="save-item" data-kind="project" data-docid="${project.id}" data-title="${escapeHtml(project.title)}">Save</button>
          <button class="btn secondary" data-action="flag-content" data-kind="projects" data-docid="${project.id}" data-title="${escapeHtml(project.title)}">Report</button>
        </div>
      </div>
    </article>
  `;
}

function renderAnnouncement(item) {
  return `
    <article class="card announcement">
      <div class="meta"><span class="tag gold">${escapeHtml(item.tag || "Update")}</span><span>${escapeHtml(item.source || "RVU")}</span><span>${escapeHtml(item.time || "")}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description || "")}</p>
    </article>
  `;
}

/* renderAdminPanel removed — superseded by renderSuperAdmin */

function renderOnboarding() {
  if (state.onboardingStep === "role") {
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Onboarding</p>
          <h2>How will you use RVU Connect?</h2>
          <p>Choose the mode that matches your campus role.</p>
          <div class="choice-grid">
            <button class="choice" data-onboard-role="student"><strong>Student</strong>Discover events, explore clubs, and join projects.</button>
            <button class="choice" data-onboard-role="club-core"><strong>Club core</strong>Represent a club, manage links, and host club events after approval.</button>
            <button class="choice" data-onboard-role="school-rep"><strong>School representative</strong>Post school events, faculty notices, and official school links after approval.</button>
          </div>
        </section>
      </div>
    `;
  }
  if (state.onboardingStep === "student-info") {
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Student profile</p>
          <h2>Basic information</h2>
          <div class="form-grid two">
            ${inputField("studentName", "Name", state.user.name)}
            ${selectField("studentYear", "Year", ["1", "2", "3", "4"], state.user.year)}
          </div>
          ${selectField("studentSchool", "School", schools, state.user.school)}
          <button class="btn gold" data-action="next-interests">Continue</button>
        </section>
      </div>
    `;
  }
  if (state.onboardingStep === "student-interests") {
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Personalization</p>
          <h2>Select your interests</h2>
          <div class="chip-grid">${interests.map((interest) => `<button class="chip ${state.user.interests.includes(interest) ? "active" : ""}" data-interest="${interest}">${interest}</button>`).join("")}</div>
          <button class="btn gold" data-action="finish-student">Explore your campus</button>
        </section>
      </div>
    `;
  }
  if (state.onboardingStep === "host-info") {
    const isClubRequest = state._onboardingIntent === "club-core";
    const clubOptions = clubs.length ? clubs.map((club) => club.name) : ["No approved clubs available"];
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">${isClubRequest ? "Club core request" : "School representative request"}</p>
          <h2>${isClubRequest ? "Which club are you core in?" : "Which school do you represent?"}</h2>
          <div class="form-grid two">
            ${isClubRequest ? selectField("hostClub", "Club", clubOptions, activeClub().name) : selectField("hostSchool", "School", schools, state.host.school)}
            ${inputField("hostRoleTitle", "Role", state.host.roleTitle)}
          </div>
          <div class="form-grid">
            ${inputField("hostName", isClubRequest ? "Core display name" : "Office / representative name", state.host.name)}
            ${inputField("hostEmail", "Contact Email", state.host.email)}
            ${isClubRequest ? selectField("hostApprover", "Approval route", ["Current president", "Super Admin"], state.host.approver) : selectField("hostApprover", "Approval route", ["Super Admin"], "Super Admin")}
            <div class="field"><label>Description</label><textarea data-input="hostDescription">${state.host.description}</textarea></div>
            ${inputField("hostJoin", "Join Link optional", state.host.joinLink)}
          </div>
          <button class="btn gold" data-action="submit-host">Submit for review</button>
        </section>
      </div>
    `;
  }
  if (state.onboardingStep === "host-review") {
    const isClubRequest = state._onboardingIntent === "club-core";
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Approval state</p>
          <h2>Your request is under review.</h2>
          <p>Until approved, this account cannot post events or announcements. ${isClubRequest ? "Club core can be approved by the current president or a super admin." : "School representatives are approved by a super admin."}</p>
          <div class="approval"><strong>${state.host.name}</strong><br>${state.host.type} · ${isClubRequest ? activeClub().name : state.host.school}</div>
          <button class="btn gold" data-action="close-onboarding">Continue to campus</button>
        </section>
      </div>
    `;
  }
  return "";
}

function selectField(name, label, options, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <select data-filter="${name}">
        ${options.map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </div>
  `;
}

function inputField(name, label, value, type = "text") {
  return `
    <div class="field">
      <label>${label}</label>
      <input data-input="${name}" type="${type}" value="${value}" />
    </div>
  `;
}

function clubInputField(name, label, value, placeholder = "", type = "text") {
  return `
    <div class="field">
      <label>${label}</label>
      <input data-club-input="${name}" type="${type}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder)}" />
    </div>
  `;
}

function clubSelectField(name, label, options, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <select data-club-input="${name}">
        ${options.map((option) => `<option ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function clubTextArea(name, label, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <textarea data-club-input="${name}">${escapeHtml(value || "")}</textarea>
    </div>
  `;
}

function unique(values) {
  return [...new Set(values)];
}

function escapeHtml(str) {
  if (typeof str !== "string") return str == null ? "" : String(str);
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function validateClubDraft() {
  const required = [
    ["name", "Club name"],
    ["category", "Category"],
    ["school", "School"],
    ["description", "Description"],
    ["founderName", "Founder name"],
    ["founderEmail", "Founder RVU email"],
    ["facultyAdvisorName", "Faculty advisor name"],
    ["facultyAdvisorEmail", "Faculty advisor RVU email"],
    ["currentPresidentName", "Current president name"],
    ["currentPresidentEmail", "Current president RVU email"],
  ];
  const missing = required.find(([key]) => !String(state.clubDraft[key] || "").trim());
  if (missing) return `${missing[1]} is required.`;
  const emails = [
    ["founderEmail", "Founder email"],
    ["facultyAdvisorEmail", "Faculty advisor email"],
    ["currentPresidentEmail", "Current president email"],
  ];
  const invalid = emails.find(([key]) => !isAllowedRvuEmail(state.clubDraft[key]));
  if (invalid) return `${invalid[1]} must end with @rvu.edu.in.`;
  return "";
}

function bindEvents() {
  if (!window.rvuAuthListenersBound) {
    window.rvuAuthListenersBound = true;
    window.addEventListener("rvu-auth-user", (event) => {
      if (event.detail && !state.authed) {
        enterAuthenticatedApp(event.detail).catch((error) => {
          window.alert(error.message || "Could not complete sign-in.");
        });
      }
    });
    window.addEventListener("rvu-auth-error", (event) => {
      if (event.detail) window.alert(event.detail);
    });
    if (window.RVUFirebase?.auth?.currentUser && !state.authed) {
      enterAuthenticatedApp(window.RVUFirebase.auth.currentUser).catch((error) => {
        window.alert(error.message || "Could not restore session.");
      });
    }
  }

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.route;
      if (state.route !== "clubs") state.selectedClubSlug = null;
      state.createOpen = false;
      renderAtTop();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, button.dataset).catch((error) => {
        window.alert(error.message || "Action failed.");
      });
    });
  });

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("change", () => {
      if (state.filters[field.dataset.filter] !== undefined) {
        state.filters[field.dataset.filter] = field.value;
      }
      if (field.dataset.filter === "studentSchool") state.user.school = field.value;
      if (field.dataset.filter === "studentYear") state.user.year = field.value;
      if (field.dataset.filter === "hostClub") {
        const club = clubs.find((item) => item.name === field.value);
        if (club) {
          state.host.clubSlug = club.slug;
          state.host.name = club.name;
          state.host.category = club.category;
          state.host.school = club.school;
        }
      }
      if (field.dataset.filter === "hostSchool") state.host.school = field.value;
      if (field.dataset.filter === "hostApprover") state.host.approver = field.value;
      render();
    });
  });

  document.querySelectorAll("[data-input]").forEach((field) => {
    field.addEventListener("input", () => {
      const key = field.dataset.input;
      if (key === "authEmail") state.authEmail = field.value;
      if (key === "authPassword") state.authPassword = field.value;
      if (key === "studentName") state.user.name = field.value;
      if (key === "hostName") state.host.name = field.value;
      if (key === "hostEmail") state.host.email = field.value;
      if (key === "hostRoleTitle") state.host.roleTitle = field.value;
      if (key === "hostDescription") state.host.description = field.value;
      if (key === "hostJoin") state.host.joinLink = field.value;
    });
  });

  document.querySelectorAll("[data-club-input]").forEach((field) => {
    field.addEventListener("input", () => {
      state.clubDraft[field.dataset.clubInput] = field.value;
    });
    field.addEventListener("change", () => {
      state.clubDraft[field.dataset.clubInput] = field.value;
    });
  });

  document.querySelectorAll("[data-club-check]").forEach((field) => {
    field.addEventListener("change", () => {
      state.clubDraft[field.dataset.clubCheck] = field.checked;
    });
  });

  document.querySelectorAll("[data-onboard-role]").forEach((button) => {
    button.addEventListener("click", () => {
      const intent = button.dataset.onboardRole;
      if (intent === "student") {
        state.onboardingStep = "student-info";
      }
      if (intent === "club-core") {
        const club = activeClub();
        state.host.type = "Club Core";
        state.host.name = club.name;
        state.host.category = club.category;
        state.host.school = club.school;
        state.host.approver = "Current president";
        state.host.approved = false;
        state.adminScope = "club";
        state.onboardingStep = "host-info";
        state._onboardingIntent = "club-core";
      }
      if (intent === "school-rep") {
        state.host.type = "School Representative";
        state.host.name = `${state.host.school} Office`;
        state.host.category = "School";
        state.host.approver = "Super Admin";
        state.host.approved = false;
        state.adminScope = "school";
        state.onboardingStep = "host-info";
        state._onboardingIntent = "school-rep";
      }
      render();
    });
  });

  document.querySelectorAll("[data-interest]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.interest;
      state.user.interests = state.user.interests.includes(value)
        ? state.user.interests.filter((interest) => interest !== value)
        : [...state.user.interests, value];
      render();
    });
  });
}

async function updateClubLeadershipFromPrompt(clubId, club = {}) {
  const currentPresidentName = window.prompt("Current president name", club.currentPresidentName || "");
  if (currentPresidentName == null) return;
  const currentPresidentEmail = window.prompt("Current president RVU email (@rvu.edu.in)", club.currentPresidentEmail || "");
  if (!isAllowedRvuEmail(currentPresidentEmail)) return window.alert("Current president email must end with @rvu.edu.in.");
  const facultyAdvisorName = window.prompt("Faculty advisor name", club.facultyAdvisorName || "");
  if (facultyAdvisorName == null) return;
  const facultyAdvisorEmail = window.prompt("Faculty advisor RVU email (@rvu.edu.in)", club.facultyAdvisorEmail || "");
  if (!isAllowedRvuEmail(facultyAdvisorEmail)) return window.alert("Faculty advisor email must end with @rvu.edu.in.");

  await window.RVUFirebase.updateClubLeadership(clubId, {
    currentPresidentName,
    currentPresidentEmail,
    facultyAdvisorName,
    facultyAdvisorEmail,
  });
  await window.RVUFirebase.assignClubCoreRole(clubId, {
    email: currentPresidentEmail,
    name: currentPresidentName || currentPresidentEmail,
    role: "president",
  });
  await window.RVUFirebase.assignClubCoreRole(clubId, {
    email: facultyAdvisorEmail,
    name: facultyAdvisorName || facultyAdvisorEmail,
    role: "facultyAdvisor",
  });
  await syncFirebaseData();
}

async function handleAction(action, dataset) {
  if (action === "open-login") {
    state.loginOpen = true;
  }
  if (action === "close-login") {
    state.loginOpen = false;
    state.authPassword = "";
  }
  if (action === "auth-mode") {
    state.authMode = dataset.mode;
  }
  if (action === "login-google") {
    startFirebaseLogin("google");
    return;
  }
  if (action === "login-password") {
    startFirebaseLogin("password");
    return;
  }
  if (action === "preview") {
    window.alert("Preview mode is disabled now that Firebase auth is connected. Use RVU email sign-in.");
    return;
  }
  if (action === "next-interests") {
    state.onboardingStep = "student-interests";
  }
  if (action === "finish-student") {
    if (window.RVUFirebase && state.authUser) {
      await window.RVUFirebase.saveUserProfile(state.authUser.uid, {
        name: state.user.name,
        school: state.user.school,
        year: state.user.year,
        interests: state.user.interests,
        onboardingComplete: true,
      });
    }
    state.onboardingStep = null;
    state.route = "home";
  }
  if (action === "submit-host") {
    const isClubIntent = state._onboardingIntent === "club-core";
    const isSchoolIntent = state._onboardingIntent === "school-rep";
    if (isClubIntent && !activeClub().id && !activeClub().slug) {
      window.alert("No approved club exists in Firestore yet. Ask a super admin to create the club first.");
      return;
    }
    if (window.RVUFirebase) {
      await window.RVUFirebase.submitHostRequest({
        type: isClubIntent ? "clubCore" : "schoolRepresentative",
        clubId: isClubIntent ? state.host.clubSlug : null,
        schoolId: isSchoolIntent ? state.host.school : null,
        name: state.host.name,
        roleTitle: state.host.roleTitle,
        description: state.host.description,
        joinLink: state.host.joinLink,
        approver: state.host.approver,
      });
    }
    state.host.approved = false;
    state.onboardingStep = "host-review";
    state.route = "home";
  }
  if (action === "host-review") {
    state.onboardingStep = "host-review";
  }
  if (action === "close-onboarding") {
    state.onboardingStep = null;
    if (isClubCore() || isSchoolRep()) state.route = "admin";
  }
  if (action === "toggle-create") {
    state.createOpen = !state.createOpen;
  }
  if (action === "create-event") {
    await createFirebaseEvent();
  }
  if (action === "create-announcement") {
    await createFirebaseAnnouncement();
  }
  if (action === "open-club") {
    state.route = "clubs";
    state.selectedClubSlug = dataset.club;
  }
  if (action === "back-to-clubs") {
    state.selectedClubSlug = null;
  }
  if (action === "toggle-registration") {
    const club = clubs.find((item) => item.slug === dataset.club);
    if (club) {
      const nextValue = !club.registrationOpen;
      if (window.RVUFirebase) await window.RVUFirebase.updateClubRegistration(club.id || club.slug, nextValue);
      club.registrationOpen = nextValue;
    }
  }
  if (action === "approve-host") {
    if (window.RVUFirebase && dataset.request) {
      await window.RVUFirebase.updateHostRequestStatus(dataset.request, "approved");
      await syncFirebaseData();
    }
  }
  if (action === "reject-host") {
    if (window.RVUFirebase && dataset.request) {
      await window.RVUFirebase.updateHostRequestStatus(dataset.request, "rejected");
      await syncFirebaseData();
    }
  }
  if (action === "sign-out") {
    await handleSignOut();
    return;
  }
  if (action === "admin-tab") {
    state.adminTab = dataset.tab || "requests";
  }
  if (action === "admin-create-club") {
    if (!isSuperAdmin()) return;
    state.clubDraft = defaultClubDraft();
    state.route = "admin-create-club";
    renderAtTop();
    return;
  }
  if (action === "admin-back-to-clubs") {
    state.route = "admin";
    state.adminTab = "clubs";
    renderAtTop();
    return;
  }
  if (action === "admin-reset-club-form") {
    state.clubDraft = defaultClubDraft();
    render();
    return;
  }
  if (action === "admin-submit-club") {
    if (!window.RVUFirebase || !isSuperAdmin()) return;
    const error = validateClubDraft();
    if (error) return window.alert(error);
    const draft = { ...state.clubDraft };
    await window.RVUFirebase.createClub({
      ...draft,
      name: draft.name.trim(),
      category: draft.category.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      founderName: draft.founderName.trim(),
      founderEmail: draft.founderEmail.trim(),
      facultyAdvisorName: draft.facultyAdvisorName.trim(),
      facultyAdvisorEmail: draft.facultyAdvisorEmail.trim(),
      currentPresidentName: draft.currentPresidentName.trim(),
      currentPresidentEmail: draft.currentPresidentEmail.trim(),
      join: draft.joinLink.trim(),
      joinLink: draft.joinLink.trim(),
    });
    state.clubDraft = defaultClubDraft();
    state.route = "admin";
    state.adminTab = "clubs";
    await syncFirebaseData();
    renderAtTop();
    return;
  }
  if (action === "admin-create-school") {
    if (!window.RVUFirebase || !isSuperAdmin()) return;
    const name = window.prompt("School name");
    if (!name) return;
    const shortName = window.prompt("Short name (optional)") || "";
    const description = window.prompt("Description") || "";
    const leadEmail = window.prompt("Lead/admin RVU email optional (@rvu.edu.in)") || "";
    if (leadEmail && !isAllowedRvuEmail(leadEmail)) return window.alert("Lead email must end with @rvu.edu.in.");
    await window.RVUFirebase.createSchool({
      name,
      shortName,
      description,
      leadEmail,
    });
    await syncFirebaseData();
  }
  if (action === "admin-delete-school") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    if (!window.confirm("Delete this school record?")) return;
    await window.RVUFirebase.deleteDocument("schools", dataset.docid);
    await syncFirebaseData();
  }
  if (action === "admin-assign-core") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    const email = window.prompt("Core member RVU email (@rvu.edu.in)");
    if (!isAllowedRvuEmail(email)) return window.alert("Core email must end with @rvu.edu.in.");
    const name = window.prompt("Core member name") || email;
    const role = window.prompt("Core role (e.g. designLead, eventsLead, treasurer)") || "core";
    await window.RVUFirebase.assignClubCoreRole(dataset.docid, { email, name, role });
    await syncFirebaseData();
  }
  if (action === "admin-update-club-leadership") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    const club = state.allClubs.find((item) => item.id === dataset.docid) || {};
    await updateClubLeadershipFromPrompt(dataset.docid, club);
  }
  if (action === "club-update-leadership") {
    if (!window.RVUFirebase || !dataset.docid) return;
    const club = activeClub();
    await updateClubLeadershipFromPrompt(dataset.docid, club);
  }
  if (action === "club-assign-core") {
    if (!window.RVUFirebase || !dataset.docid) return;
    const email = window.prompt("Core member RVU email (@rvu.edu.in)");
    if (!isAllowedRvuEmail(email)) return window.alert("Core email must end with @rvu.edu.in.");
    const name = window.prompt("Core member name") || email;
    const role = window.prompt("Core role (e.g. eventsLead, designLead, treasurer)") || "core";
    await window.RVUFirebase.assignClubCoreRole(dataset.docid, { email, name, role });
    await syncFirebaseData();
  }
  if (action === "admin-remove-core") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    const email = window.prompt("Core member email to remove");
    if (!email) return;
    if (!window.confirm(`Remove ${email} from this club core?`)) return;
    await window.RVUFirebase.removeClubCoreRole(dataset.docid, email);
    await syncFirebaseData();
  }
  if (action === "club-remove-core") {
    if (!window.RVUFirebase || !dataset.docid) return;
    const email = window.prompt("Core member email to remove");
    if (!email) return;
    if (!window.confirm(`Remove ${email} from this club core?`)) return;
    await window.RVUFirebase.removeClubCoreRole(dataset.docid, email);
    await syncFirebaseData();
  }
  if (action === "admin-delete-club") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    if (!window.confirm("Delete this club? This cannot be undone.")) return;
    await window.RVUFirebase.deleteDocument("clubs", dataset.docid);
    await syncFirebaseData();
  }
  if (action === "admin-create-event") {
    if (!window.RVUFirebase || !isSuperAdmin()) return;
    const title = window.prompt("Event title");
    if (!title) return;
    const description = window.prompt("Description") || "";
    const date = window.prompt("Display date") || "";
    const time = window.prompt("Time") || "";
    const location = window.prompt("Location") || "";
    const host = window.prompt("Host/source") || "RVU";
    await window.RVUFirebase.createEvent({
      title,
      description,
      date,
      time,
      location,
      host,
      type: window.prompt("Type: Club Event, Faculty Event, School Event") || "School Event",
      hostType: "admin",
      tags: [],
      status: "published",
    });
    await syncFirebaseData();
  }
  if (action === "admin-create-announcement") {
    if (!window.RVUFirebase || !isSuperAdmin()) return;
    const title = window.prompt("Announcement title");
    if (!title) return;
    await window.RVUFirebase.createAnnouncement({
      title,
      description: window.prompt("Description") || "",
      source: window.prompt("Source") || "RVU",
      tag: window.prompt("Tag") || "Notice",
      type: "Faculty",
      sourceType: "admin",
      time: "Just now",
      status: "published",
    });
    await syncFirebaseData();
  }
  if (action === "admin-create-project") {
    if (!window.RVUFirebase || !isSuperAdmin()) return;
    const title = window.prompt("Project title");
    if (!title) return;
    const tags = (window.prompt("Tags comma separated") || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    const skills = (window.prompt("Skills required comma separated") || "").split(",").map((skill) => skill.trim()).filter(Boolean);
    await window.RVUFirebase.createProject({
      title,
      description: window.prompt("Description") || "",
      tags,
      skills,
      expiry: window.prompt("Expiry date") || "",
      score: 0,
      status: "open",
    });
    await syncFirebaseData();
  }
  if (action === "admin-unpublish-event") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    await window.RVUFirebase.updateEventStatus(dataset.docid, "draft");
    await syncFirebaseData();
  }
  if (action === "admin-publish-event") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    await window.RVUFirebase.updateEventStatus(dataset.docid, "published");
    await syncFirebaseData();
  }
  if (action === "admin-unpublish-announcement") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    await window.RVUFirebase.updateAnnouncementStatus(dataset.docid, "draft");
    await syncFirebaseData();
  }
  if (action === "admin-delete-event") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    if (!window.confirm("Delete this event permanently?")) return;
    await window.RVUFirebase.deleteDocument("events", dataset.docid);
    await syncFirebaseData();
  }
  if (action === "admin-delete-announcement") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    if (!window.confirm("Delete this announcement permanently?")) return;
    await window.RVUFirebase.deleteDocument("announcements", dataset.docid);
    await syncFirebaseData();
  }
  if (action === "admin-delete-project") {
    if (!window.RVUFirebase || !isSuperAdmin() || !dataset.docid) return;
    if (!window.confirm("Delete this project permanently?")) return;
    await window.RVUFirebase.deleteDocument("projects", dataset.docid);
    await syncFirebaseData();
  }
  if (action === "save-item") {
    if (!window.RVUFirebase || !dataset.docid) return;
    await window.RVUFirebase.saveItem({
      itemId: dataset.docid,
      type: dataset.kind || "item",
      title: dataset.title || "",
    });
    await syncFirebaseData();
    window.alert("Saved to your campus dashboard.");
  }
  if (action === "follow-club") {
    if (!window.RVUFirebase || !dataset.docid) return;
    await window.RVUFirebase.followClub(dataset.docid, dataset.title || "");
    await syncFirebaseData();
    window.alert("Club followed.");
  }
  if (action === "rsvp-event") {
    if (!window.RVUFirebase || !dataset.docid) return;
    await window.RVUFirebase.rsvpEvent(dataset.docid, { title: dataset.title || "", status: "going" });
    await syncFirebaseData();
    window.alert("RSVP saved.");
  }
  if (action === "apply-project") {
    if (!window.RVUFirebase || !dataset.docid) return;
    const note = window.prompt("Short application note optional") || "";
    await window.RVUFirebase.applyToProject(dataset.docid, {
      title: dataset.title || "",
      name: state.user.name || state.authUser?.displayName || "",
      note,
    });
    await syncFirebaseData();
    window.alert("Application submitted.");
  }
  if (action === "flag-content") {
    if (!window.RVUFirebase || !dataset.docid) return;
    const reason = window.prompt("Why are you reporting this?");
    if (!reason) return;
    await window.RVUFirebase.flagContent({
      collection: dataset.kind || "content",
      targetId: dataset.docid,
      title: dataset.title || "",
      reason,
    });
    window.alert("Report sent to Super Admin.");
  }
  if (action === "calendar-event") {
    const event = events.find((item) => item.id === dataset.docid);
    if (!event) return;
    const details = encodeURIComponent(event.description || "");
    const text = encodeURIComponent(event.title || "RVU Event");
    const location = encodeURIComponent(event.location || "RV University");
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`, "_blank", "noopener");
  }
  if (action === "toast") {
    window.alert(dataset.message || "Done");
  }
  renderAtTop();
}

render();
