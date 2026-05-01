const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 10.5 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
  clubs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  announce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8A3 3 0 0 1 6 15"/></svg>',
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

const events = [
  { title: "AI Build Night", description: "A hands-on evening for shipping small AI tools with mentors from the tech club.", date: "May 6", time: "5:30 PM", sort: 6, type: "Club Event", host: "Pragya AI Club", club: "Pragya AI Club", location: "Innovation Studio", tags: ["AI", "Product"], colors: ["#233039", "#926d2f"] },
  { title: "Design Futures Salon", description: "A compact showcase of student work, critique circles, and portfolio conversations.", date: "May 8", time: "3:00 PM", sort: 8, type: "School Event", host: "School of Design", club: "Design Circle", location: "D Block Atrium", tags: ["Design"], colors: ["#2f4d57", "#d0a863"] },
  { title: "Founders Friday", description: "Early-stage student founders share prototypes, validation stories, and hiring needs.", date: "May 10", time: "4:00 PM", sort: 10, type: "Club Event", host: "RVU Entrepreneurship Cell", club: "E-Cell", location: "Seminar Hall 2", tags: ["Business", "Finance", "Product"], colors: ["#1f342d", "#c68d45"] },
  { title: "Moot Court Open House", description: "Introductory session for law students interested in research, debate, and competitions.", date: "May 14", time: "11:00 AM", sort: 14, type: "Faculty Event", host: "School of Law", club: "Law Society", location: "Law Block", tags: ["Law"], colors: ["#403436", "#d0a863"] },
  { title: "CineLab Weekend", description: "A two-day short film sprint covering concept, shoot, edit, and screening.", date: "May 18", time: "9:30 AM", sort: 18, type: "School Event", host: "Film Media School", club: "CineLab", location: "Media Lab", tags: ["Film", "Design"], colors: ["#233039", "#7b5e92"] },
  { title: "HealthTech Roundtable", description: "Students and faculty map small healthcare problems that can become semester projects.", date: "Apr 20", time: "2:00 PM", sort: -10, type: "Faculty Event", host: "Allied Healthcare", club: "Health Forum", location: "Room 204", tags: ["Healthcare", "AI"], colors: ["#2d5b57", "#d0a863"], past: true },
];

const clubs = [
  { name: "Pragya AI Club", category: "AI", school: "School of Computer Science and Engineering", description: "Applied AI projects, reading circles, and demo nights for curious builders.", join: "https://forms.gle/example-ai" },
  { name: "Design Circle", category: "Design", school: "School of Design and Innovation", description: "Studio critiques, product design jams, and portfolio development.", join: "https://forms.gle/example-design" },
  { name: "RVU E-Cell", category: "Business", school: "School of Business", description: "Founder talks, venture sprints, market research pods, and pitch practice.", join: "https://forms.gle/example-business" },
  { name: "CineLab", category: "Cultural", school: "School of Film Media and Creative Arts", description: "Film screenings, production teams, and collaborative storytelling projects.", join: "https://forms.gle/example-film" },
  { name: "Law Society", category: "Law", school: "School of Law", description: "Moot court preparation, policy discussions, and public-interest research.", join: "https://forms.gle/example-law" },
  { name: "Health Forum", category: "Healthcare", school: "School of Allied Healthcare", description: "Healthcare awareness, field visits, and interdisciplinary problem discovery.", join: "https://forms.gle/example-health" },
];

const announcements = [
  { title: "Recruitment open for Pragya AI Club", description: "Applications are open for project leads, research contributors, and event volunteers.", source: "Pragya AI Club", tag: "Recruitment", type: "Club", time: "Today" },
  { title: "Founders Friday registrations close soon", description: "Teams planning to demo should submit their prototype note by Thursday evening.", source: "RVU E-Cell", tag: "Update", type: "Club", time: "Yesterday" },
  { title: "Portfolio review slots released", description: "Design faculty office hours are open for second and third year students.", source: "School of Design", tag: "Notice", type: "Faculty", time: "May 1" },
  { title: "Moot Court orientation notice", description: "The orientation room has moved from Room 109 to the Law Block reading hall.", source: "School of Law", tag: "Notice", type: "Faculty", time: "Apr 30" },
];

const projects = [
  { title: "Campus Lost-and-Found Assistant", description: "Build a lightweight web app that logs lost items and routes verified claims to admins.", skills: ["Web Development", "Design"], tags: ["Web", "Product"], status: "Open", expiry: "May 20", score: 24 },
  { title: "AI Notes Summarizer for Lectures", description: "Prototype an upload flow that creates structured summaries and revision cards.", skills: ["AI", "Web Development"], tags: ["AI", "Web"], status: "Open", expiry: "May 24", score: 31 },
  { title: "Student Finance Starter Kit", description: "Create a beginner-friendly guide and calculator for budgeting across a semester.", skills: ["Finance", "Design"], tags: ["Finance", "Business"], status: "Open", expiry: "May 28", score: 18 },
  { title: "Short Film Sound Crew", description: "Looking for sound design collaborators for a 6-minute campus short film.", skills: ["Film"], tags: ["Film"], status: "Closed", expiry: "Apr 27", score: 12 },
];

const state = {
  route: "home",
  authed: false,
  onboardingStep: "role",
  role: null,
  createOpen: false,
  user: {
    name: "Aditya",
    school: schools[0],
    year: "2",
    interests: ["AI", "Design", "Product"],
  },
  host: {
    type: "Club",
    name: "RVU Product Guild",
    category: "Product",
    description: "A campus group for product thinking, launches, and practical workshops.",
    email: "product.guild@rvu.edu",
    approved: false,
  },
  filters: {
    eventType: "All",
    clubCategory: "All",
    clubSchool: "All",
    announcementType: "All",
    projectTag: "All",
  },
};

const app = document.querySelector("#app");

function icon(name) {
  return icons[name] || "";
}

function render() {
  app.innerHTML = state.authed ? renderAppShell() : renderLanding();
  bindEvents();
}

function renderAtTop() {
  render();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function renderLanding() {
  return `
    <main class="hero">
      <div class="hero-nav">
        ${brandLockup("large")}
        <span class="hero-badge">For RV University</span>
      </div>
      <section class="hero-content">
        <p class="eyebrow">Campus operating system</p>
        <h1>Everything happening at RVU. In one place.</h1>
        <p>Events, clubs, announcements, and student projects presented with the clarity of a modern campus command center.</p>
        <div class="hero-actions">
          <button class="btn gold" data-action="login">${icon("mail")} Continue with RVU Email</button>
          <button class="btn ghost" data-action="preview">Preview campus dashboard</button>
        </div>
      </section>
      <section class="hero-peek" aria-label="Campus highlights">
        <div class="peek-tile"><strong>This week</strong>3 upcoming campus events</div>
        <div class="peek-tile"><strong>Important</strong>Recruitment and notices</div>
        <div class="peek-tile"><strong>Projects</strong>Open teams seeking skills</div>
        <div class="peek-tile"><strong>Hosts</strong>Clubs and faculty in one place</div>
      </section>
    </main>
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
          ${state.role === "host" ? createButton() : ""}
          <button class="role-pill" data-action="switch-role">${state.role === "host" ? (state.host.approved ? "Host approved" : "Host pending") : state.role === "admin" ? "Super admin" : "Student"}</button>
        </div>
      </header>
      <main class="main">
        ${renderRoute()}
      </main>
      <nav class="bottom-nav" aria-label="Primary navigation">
        ${navButtons(true)}
      </nav>
      ${state.onboardingStep ? renderOnboarding() : ""}
    </div>
  `;
}

function brandLockup() {
  const sizeClass = arguments[0] === "large" ? " large" : "";
  return `
    <div class="brand-lockup${sizeClass}">
      <img class="brand-logo" src="./assets/rv-university-logo-gold.png" alt="RV University" />
      <div class="brand-copy">
        <strong>RVU Connect</strong>
        <small>Go, change the world</small>
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
  return items.map(([route, label, iconName]) => `
    <button class="${withIcons ? "nav-item" : ""} ${state.route === route ? "active" : ""}" data-route="${route}">
      ${withIcons ? icon(iconName) : ""}<span>${label}</span>
    </button>
  `).join("");
}

function createButton() {
  if (!state.host.approved) {
    return `<button class="btn secondary" data-action="host-review">Under review</button>`;
  }
  return `
    <div class="create-wrap">
      <button class="btn" data-action="toggle-create">${icon("plus")} Create</button>
      ${state.createOpen ? `
        <div class="create-menu">
          <button data-action="toast" data-message="Create Event flow is ready for approved hosts.">Create Event</button>
          <button data-action="toast" data-message="Create Announcement flow is ready for approved hosts.">Create Announcement</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderRoute() {
  if (state.route === "events") return renderEvents();
  if (state.route === "clubs") return renderClubs();
  if (state.route === "projects") return renderProjects();
  if (state.route === "announcements") return renderAnnouncements();
  return renderHome();
}

function renderHome() {
  const upcoming = events.filter((event) => !event.past).sort((a, b) => a.sort - b.sort).slice(0, 5);
  const personalized = [...events, ...projects].filter((item) => (item.tags || []).some((tag) => state.user.interests.includes(tag) || state.user.interests.includes(tag.replace("Web", "Web Development")))).slice(0, 4);
  return `
    <section class="page-head dashboard-head">
      <div>
        <p class="eyebrow">Curated dashboard</p>
        <h1>Welcome to RVU Connect</h1>
        <p>Upcoming events, project opportunities, and priority updates arranged for action, not endless scrolling.</p>
      </div>
      <div class="campus-metrics" aria-label="Campus activity summary">
        <span><strong>5</strong> live events</span>
        <span><strong>6</strong> approved clubs</span>
        <span><strong>3</strong> urgent updates</span>
      </div>
    </section>
    <div class="home-layout">
      <div>
        <section class="spotlight">
          <div>
            <span class="tag gold">Next up</span>
            <h2>${upcoming[0].title}</h2>
            <p>${upcoming[0].description}</p>
          </div>
          <div class="spotlight-date">
            <strong>${upcoming[0].date}</strong>
            <span>${upcoming[0].time}</span>
          </div>
        </section>
        <section class="section">
          <div class="section-title"><h2>This Week at RVU</h2><span>Nearest date first</span></div>
          <div class="grid event-grid">${upcoming.map(renderEventCard).join("")}</div>
        </section>
        <section class="section">
          <div class="section-title"><h2>Personalized For You</h2><span>${state.user.interests.join(", ")}</span></div>
          <div class="grid event-grid">${personalized.map(renderPersonalCard).join("")}</div>
        </section>
      </div>
      <aside>
        <section class="section">
          <div class="section-title"><h2>Important Updates</h2><span>High priority</span></div>
          <div class="updates">${announcements.slice(0, 3).map(renderUpdate).join("")}</div>
        </section>
        ${state.role === "admin" ? renderAdminPanel() : ""}
        <section class="section">
          <div class="section-title"><h2>Quick Access</h2></div>
          <div class="grid quick-grid">
            ${quickCard("events", "Events", "Browse campus programming", "calendar")}
            ${quickCard("clubs", "Clubs", "Find approved hosts", "clubs")}
            ${quickCard("projects", "Projects", "Join student teams", "projects")}
            ${quickCard("announcements", "Announcements", "Read structured updates", "announce")}
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
      <p class="eyebrow">Events system</p>
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
      <div class="grid event-grid">${upcoming.map(renderEventCard).join("")}</div>
    </section>
    <section class="section">
      <div class="section-title"><h2>Past Events</h2><span>Archived</span></div>
      <div class="grid event-grid">${past.map(renderEventCard).join("")}</div>
    </section>
  `;
}

function renderClubs() {
  const filtered = clubs.filter((club) =>
    (state.filters.clubCategory === "All" || club.category === state.filters.clubCategory) &&
    (state.filters.clubSchool === "All" || club.school === state.filters.clubSchool)
  );
  return `
    <section class="page-head">
      <p class="eyebrow">Approved hosts only</p>
      <h1>Clubs</h1>
      <p>A clean directory of campus groups, their focus areas, upcoming events, and join links.</p>
    </section>
    <div class="filters">
      ${selectField("clubCategory", "Category", ["All", ...unique(clubs.map((club) => club.category))], state.filters.clubCategory)}
      ${selectField("clubSchool", "School", ["All", ...unique(clubs.map((club) => club.school))], state.filters.clubSchool)}
    </div>
    <div class="grid club-grid">${filtered.map(renderClubCard).join("")}</div>
  `;
}

function renderProjects() {
  const tags = unique(projects.flatMap((project) => project.tags));
  const filtered = projects.filter((project) => state.filters.projectTag === "All" || project.tags.includes(state.filters.projectTag));
  return `
    <section class="page-head">
      <p class="eyebrow">Student collaboration</p>
      <h1>Projects</h1>
      <p>Reddit-inspired structure without heavy discussion threads: clear skill needs, status, expiry, and application flow.</p>
    </section>
    <div class="filters">
      ${selectField("projectTag", "Tag", ["All", ...tags], state.filters.projectTag)}
      ${selectField("status", "Status", ["All", "Open", "Closed"], "All")}
    </div>
    <div class="grid project-grid">${filtered.map(renderProjectCard).join("")}</div>
  `;
}

function renderAnnouncements() {
  const filtered = announcements.filter((item) => state.filters.announcementType === "All" || item.type === state.filters.announcementType);
  return `
    <section class="page-head">
      <p class="eyebrow">Structured updates</p>
      <h1>Announcements</h1>
      <p>Posts for recruitment, notices, registration updates, and internal information. No comments, upvotes, or social clutter.</p>
    </section>
    <div class="filters">
      ${selectField("announcementType", "Source Type", ["All", "Club", "Faculty"], state.filters.announcementType)}
      ${selectField("announcementTag", "Tag", ["All", "Recruitment", "Notice", "Update"], "All")}
    </div>
    <div class="updates">${filtered.map(renderAnnouncement).join("")}</div>
  `;
}

function renderEventCard(event) {
  return `
    <article class="card event-card">
      <div class="poster" style="--poster-a:${event.colors[0]};--poster-b:${event.colors[1]}">
        <strong>${event.date.split(" ")[0]}<br>${event.date.split(" ")[1] || ""}</strong>
        <span>${event.type}</span>
      </div>
      <div class="card-body">
        <div class="meta"><span>${event.date} · ${event.time}</span><span>${event.location}</span></div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="chip-grid">${event.tags.map((tag) => `<span class="tag gold">${tag}</span>`).join("")}<span class="tag">${event.host}</span></div>
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
      <div class="meta"><span class="tag gold">${item.tag}</span><span>${item.source}</span><span>${item.time}</span></div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `;
}

function quickCard(route, title, copy, iconName) {
  return `<button class="quick-card" data-route="${route}">${icon(iconName)}<span><strong>${title}</strong><br>${copy}</span></button>`;
}

function renderClubCard(club) {
  const clubEvents = events.filter((event) => event.club === club.name || event.host === club.name).length;
  return `
    <article class="card club-card">
      <div class="club-top">
        <div class="avatar">${club.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
        <div><h3>${club.name}</h3><span class="tag gold">${club.category}</span></div>
      </div>
      <p>${club.description}</p>
      <div class="meta"><span>${club.school}</span><span>${clubEvents} events</span></div>
      <button class="btn secondary" data-action="toast" data-message="Join link: ${club.join}">Join link</button>
    </article>
  `;
}

function renderProjectCard(project) {
  return `
    <article class="card project-card">
      <div class="project-rail"><button data-action="toast" data-message="Bookmark saved">${icon("bookmark")}</button><span>${project.score}</span></div>
      <div class="card-body">
        <div class="meta"><span class="status ${project.status.toLowerCase()}">${project.status}</span><span>Expires ${project.expiry}</span></div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="chip-grid">${project.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}</div>
        <div class="project-actions">
          <button class="btn gold" data-action="toast" data-message="Application stored for ${project.title}.">Apply</button>
          <button class="btn secondary" data-action="toast" data-message="Project bookmarked.">Save</button>
        </div>
      </div>
    </article>
  `;
}

function renderAnnouncement(item) {
  return `
    <article class="card announcement">
      <div class="meta"><span class="tag gold">${item.tag}</span><span>${item.source}</span><span>${item.time}</span></div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `;
}

function renderAdminPanel() {
  return `
    <section class="section admin-panel">
      <div>
        <h2>Host Approval Queue</h2>
        <p>Super admins approve or reject hosts before they can publish events and announcements.</p>
      </div>
      <div class="request-row">
        <strong>${state.host.name}</strong>
        <span>${state.host.type} · ${state.host.category} · ${state.host.email}</span>
        <div class="project-actions">
          <button class="btn gold" data-action="approve-host">Approve</button>
          <button class="btn ghost" data-action="reject-host">Reject</button>
        </div>
      </div>
    </section>
  `;
}

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
            <button class="choice" data-onboard-role="host"><strong>Host</strong>Create events, post announcements, and build presence.</button>
            <button class="choice" data-onboard-role="admin"><strong>Super Admin</strong>Approve hosts, moderate activity, and maintain quality.</button>
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
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Host request</p>
          <h2>Tell us about your host profile</h2>
          <div class="form-grid two">
            ${selectField("hostType", "Host Type", ["Club", "Faculty"], state.host.type)}
            ${selectField("hostCategory", "Category", ["Tech", "AI", "Product", "Business", "Cultural"], state.host.category)}
          </div>
          <div class="form-grid">
            ${inputField("hostName", "Name", state.host.name)}
            ${inputField("hostEmail", "Contact Email", state.host.email)}
            <div class="field"><label>Description</label><textarea data-input="hostDescription">${state.host.description}</textarea></div>
            ${inputField("hostJoin", "Join Link optional", "")}
          </div>
          <button class="btn gold" data-action="submit-host">Submit for review</button>
        </section>
      </div>
    `;
  }
  if (state.onboardingStep === "host-review") {
    return `
      <div class="modal-layer">
        <section class="modal">
          <p class="eyebrow">Approval state</p>
          <h2>Your request is under review.</h2>
          <p>Until approved, this host account cannot post events or announcements.</p>
          <div class="approval"><strong>${state.host.name}</strong><br>${state.host.type} · ${state.host.category}</div>
          <button class="btn gold" data-action="close-onboarding">View dashboard</button>
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

function inputField(name, label, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <input data-input="${name}" value="${value}" />
    </div>
  `;
}

function unique(values) {
  return [...new Set(values)];
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.route;
      state.createOpen = false;
      renderAtTop();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset));
  });

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("change", () => {
      if (state.filters[field.dataset.filter] !== undefined) {
        state.filters[field.dataset.filter] = field.value;
      }
      if (field.dataset.filter === "studentSchool") state.user.school = field.value;
      if (field.dataset.filter === "studentYear") state.user.year = field.value;
      if (field.dataset.filter === "hostType") state.host.type = field.value;
      if (field.dataset.filter === "hostCategory") state.host.category = field.value;
      render();
    });
  });

  document.querySelectorAll("[data-input]").forEach((field) => {
    field.addEventListener("input", () => {
      const key = field.dataset.input;
      if (key === "studentName") state.user.name = field.value;
      if (key === "hostName") state.host.name = field.value;
      if (key === "hostEmail") state.host.email = field.value;
      if (key === "hostDescription") state.host.description = field.value;
    });
  });

  document.querySelectorAll("[data-onboard-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.onboardRole;
      if (state.role === "student") state.onboardingStep = "student-info";
      if (state.role === "host") state.onboardingStep = "host-info";
      if (state.role === "admin") state.onboardingStep = null;
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

function handleAction(action, dataset) {
  if (action === "login") {
    state.authed = true;
    state.onboardingStep = "role";
  }
  if (action === "preview") {
    state.authed = true;
    state.role = "student";
    state.onboardingStep = null;
  }
  if (action === "switch-role") {
    state.onboardingStep = "role";
  }
  if (action === "next-interests") {
    state.onboardingStep = "student-interests";
  }
  if (action === "finish-student") {
    state.onboardingStep = null;
    state.route = "home";
  }
  if (action === "submit-host") {
    state.host.approved = false;
    state.onboardingStep = "host-review";
    state.route = "home";
  }
  if (action === "host-review") {
    state.onboardingStep = "host-review";
  }
  if (action === "close-onboarding") {
    state.onboardingStep = null;
  }
  if (action === "toggle-create") {
    state.createOpen = !state.createOpen;
  }
  if (action === "approve-host") {
    state.host.approved = true;
    state.role = "host";
  }
  if (action === "reject-host") {
    state.host.approved = false;
    window.alert("Host request rejected. Posting remains restricted.");
  }
  if (action === "toast") {
    window.alert(dataset.message || "Done");
  }
  renderAtTop();
}

render();
