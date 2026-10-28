const http = require("http");

async function runTests() {
  console.log("==================================================");
  console.log("CampusGig Automated End-to-End Comprehensive Test");
  console.log("==================================================");

  const serverProcess = require("child_process").spawn("node", ["server.js"], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (d) => process.stdout.write("[SERVER] " + d));
  serverProcess.stderr.on("data", (d) => process.stderr.write("[SERVER-ERR] " + d));

  // Allow server time to connect to MongoDB and start
  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    // Helper for requests
    async function apiCall(endpoint, method = "GET", body = null, cookie = null) {
      const headers = { "Content-Type": "application/json" };
      if (cookie) headers["cookie"] = cookie;
      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`http://localhost:5000${endpoint}`, opts);
      const setCookie = res.headers.get("set-cookie");
      let data = {};
      try {
        data = await res.json();
      } catch (e) {}
      return { status: res.status, data, cookie: setCookie || cookie };
    }

    // 1. Health check
    console.log("\n[TEST 1] Server Health Check (GET /)");
    let res = await apiCall("/");
    console.log("-> Status:", res.status, "API status:", res.data.status);
    if (res.status !== 200 || res.data.status !== "online") throw new Error("Health check failed");

    // 2. Platform stats
    console.log("\n[TEST 2] Platform Stats (GET /api/jobs/stats)");
    res = await apiCall("/api/jobs/stats");
    console.log("-> Total jobs in DB:", res.data.totalJobs, "Categories:", res.data.categoryCount);
    if (res.status !== 200 || typeof res.data.totalJobs !== "number") throw new Error("Stats failed");

    // 3. Browse jobs & filtering
    console.log("\n[TEST 3] Browse & Filter Jobs (GET /api/jobs)");
    res = await apiCall("/api/jobs?limit=5");
    console.log("-> Returned jobs count:", res.data.jobs?.length);
    if (res.status !== 200 || !res.data.jobs || res.data.jobs.length === 0) throw new Error("Browse jobs failed");

    // Filter by category
    const filterCatRes = await apiCall("/api/jobs?category=Web Development");
    console.log("-> Web Development category jobs count:", filterCatRes.data.jobs?.length);
    if (filterCatRes.status !== 200) throw new Error("Category filter failed");

    // 4. Registration validation (bad password length)
    console.log("\n[TEST 4] Registration Short Password Rejection (<8 chars)");
    res = await apiCall("/api/auth/register", "POST", {
      name: "Short Pwd",
      email: "short@campusgig.edu",
      password: "123"
    });
    console.log("-> Status:", res.status, "Message:", res.data.message);
    if (res.status !== 400) throw new Error("Short password was not rejected with 400");

    // 5. Register Student 1
    console.log("\n[TEST 5] Student 1 Registration with bcrypt");
    const timestamp = Date.now();
    const student1Email = `student1_${timestamp}@university.edu`;
    const reg1 = await apiCall("/api/auth/register", "POST", {
      name: "Rohan Verma",
      email: student1Email,
      password: "Password123!",
      college: "University Institute of Technology",
      bio: "Full Stack Developer looking for campus gigs",
      skills: ["React", "Node.js", "Express"]
    });
    console.log("-> Status:", reg1.status, "Session cookie created:", !!reg1.cookie);
    if (reg1.status !== 201 || !reg1.cookie) throw new Error("Student 1 registration failed");

    // 6. Duplicate Email Rejection
    console.log("\n[TEST 6] Duplicate Email Registration Rejection");
    const dupRes = await apiCall("/api/auth/register", "POST", {
      name: "Imposter Rohan",
      email: student1Email,
      password: "Password123!"
    });
    console.log("-> Status:", dupRes.status, "Message:", dupRes.data.message);
    if (dupRes.status !== 409) throw new Error("Duplicate registration was not rejected with 409");

    // 7. Verify session (/api/auth/me) for Student 1
    console.log("\n[TEST 7] Session Verification (GET /api/auth/me)");
    const meRes = await apiCall("/api/auth/me", "GET", null, reg1.cookie);
    console.log("-> Status:", meRes.status, "Authenticated email:", meRes.data.user?.email);
    if (meRes.status !== 200 || meRes.data.user?.email !== student1Email) throw new Error("Session check failed");

    // 8. Update Profile (/api/auth/profile)
    console.log("\n[TEST 8] Profile Update (PUT /api/auth/profile)");
    const profRes = await apiCall(
      "/api/auth/profile",
      "PUT",
      {
        college: "University School of Advanced Computing",
        bio: "Updated bio: Building full-stack apps with React 19 and Express",
        skills: ["React", "Node.js", "MongoDB", "Express", "REST APIs"],
        phone: "+91 9876543210"
      },
      reg1.cookie
    );
    console.log("-> Status:", profRes.status, "Updated college:", profRes.data.user?.college);
    if (profRes.status !== 200 || profRes.data.user?.college !== "University School of Advanced Computing") {
      throw new Error("Profile update failed");
    }

    // 9. Student 1 Creates a New Job Post
    console.log("\n[TEST 9] Create Job Post (POST /api/jobs)");
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20);

    const newJobRes = await apiCall(
      "/api/jobs",
      "POST",
      {
        title: `Peer Tutoring in Web Engineering ${timestamp}`,
        description: "Looking for an experienced student to guide juniors through MERN stack course labs and debugging.",
        category: "Tutoring & Academics",
        jobType: "Part-time",
        locationType: "On-Campus",
        location: "Computer Lab 4",
        budget: 7000,
        skills: ["React", "Node.js", "MongoDB"],
        deadline: deadline.toISOString()
      },
      reg1.cookie
    );
    console.log("-> Status:", newJobRes.status, "Created Job ID:", newJobRes.data.job?._id);
    if (newJobRes.status !== 201 || !newJobRes.data.job?._id) throw new Error("Create job failed");
    const createdJobId = newJobRes.data.job._id;

    // 10. Student 1 Edits Their Own Job Post
    console.log("\n[TEST 10] Edit Own Job Post (PUT /api/jobs/:id)");
    const editRes = await apiCall(
      `/api/jobs/${createdJobId}`,
      "PUT",
      {
        budget: 8500,
        title: `Updated: Peer Tutoring in Web Engineering ${timestamp}`
      },
      reg1.cookie
    );
    console.log("-> Status:", editRes.status, "Updated budget:", editRes.data.job?.budget);
    if (editRes.status !== 200 || editRes.data.job?.budget !== 8500) throw new Error("Edit job failed");

    // 11. Register Student 2
    console.log("\n[TEST 11] Register Student 2 (Applicant)");
    const student2Email = `student2_${timestamp}@university.edu`;
    const reg2 = await apiCall("/api/auth/register", "POST", {
      name: "Priya Sharma",
      email: student2Email,
      password: "Password123!",
      college: "School of Engineering",
      skills: ["React", "Teaching"]
    });
    console.log("-> Student 2 Status:", reg2.status, "Cookie:", !!reg2.cookie);
    if (reg2.status !== 201 || !reg2.cookie) throw new Error("Student 2 registration failed");

    // 12. Unauthorized Edit Attempt (Student 2 attempts to edit Student 1's job)
    console.log("\n[TEST 12] Unauthorized Edit Enforcement (Student 2 editing Student 1's job)");
    const unauthEditRes = await apiCall(
      `/api/jobs/${createdJobId}`,
      "PUT",
      { budget: 100 },
      reg2.cookie
    );
    console.log("-> Status:", unauthEditRes.status, "Message:", unauthEditRes.data.message);
    if (unauthEditRes.status !== 403) throw new Error("Unauthorized edit was not blocked with 403");

    // 13. Student 1 attempts to apply to their OWN job
    console.log("\n[TEST 13] Prevent Applying to Own Job");
    const selfApplyRes = await apiCall(
      "/api/applications",
      "POST",
      {
        jobId: createdJobId,
        coverLetter: "I want to apply to my own job.",
        proposedRate: 8500
      },
      reg1.cookie
    );
    console.log("-> Status:", selfApplyRes.status, "Message:", selfApplyRes.data.message);
    if (selfApplyRes.status !== 400) throw new Error("Self-application was not blocked with 400");

    // 14. Student 2 Applies to Student 1's Job
    console.log("\n[TEST 14] Student 2 Submits Application to Student 1's Job");
    const applyRes = await apiCall(
      "/api/applications",
      "POST",
      {
        jobId: createdJobId,
        coverLetter: "Hello Rohan! I scored an A+ in Web Engineering last semester and have TA experience. Would love to assist!",
        proposedRate: 8500
      },
      reg2.cookie
    );
    console.log("-> Status:", applyRes.status, "Message:", applyRes.data.message);
    if (applyRes.status !== 201 || !applyRes.data.application?._id) throw new Error("Application failed");
    const applicationId = applyRes.data.application._id;

    // 15. Student 2 attempts Duplicate Application
    console.log("\n[TEST 15] Duplicate Application Rejection");
    const dupApplyRes = await apiCall(
      "/api/applications",
      "POST",
      {
        jobId: createdJobId,
        coverLetter: "Applying second time.",
        proposedRate: 8500
      },
      reg2.cookie
    );
    console.log("-> Status:", dupApplyRes.status, "Message:", dupApplyRes.data.message);
    if (dupApplyRes.status !== 409) throw new Error("Duplicate application was not rejected with 409");

    // 16. Student 2 checks My Applications
    console.log("\n[TEST 16] Student 2 Checks My Applications");
    const student2Apps = await apiCall("/api/applications/my-applications", "GET", null, reg2.cookie);
    console.log("-> Applications count:", student2Apps.data.applications?.length, "Current status:", student2Apps.data.applications?.[0]?.status);
    if (student2Apps.status !== 200 || student2Apps.data.applications?.length < 1) throw new Error("My applications check failed");

    // 17. Student 1 views applicants for their job
    console.log("\n[TEST 17] Job Owner Views Applicants for Posted Gig");
    const applicantsRes = await apiCall(`/api/applications/job/${createdJobId}`, "GET", null, reg1.cookie);
    console.log("-> Applicants count for job:", applicantsRes.data.applicants?.length);
    if (applicantsRes.status !== 200 || applicantsRes.data.applicants?.length !== 1) throw new Error("Get applicants failed");
    console.log("-> Applicant Name:", applicantsRes.data.applicants[0].applicant?.name);

    // 18. Student 1 updates applicant status to "Accepted"
    console.log("\n[TEST 18] Job Owner Updates Application Status to 'Accepted'");
    const statusUpdateRes = await apiCall(
      `/api/applications/${applicationId}/status`,
      "PATCH",
      { status: "Accepted" },
      reg1.cookie
    );
    console.log("-> Status:", statusUpdateRes.status, "New status in DB:", statusUpdateRes.data.application?.status);
    if (statusUpdateRes.status !== 200 || statusUpdateRes.data.application?.status !== "Accepted") {
      throw new Error("Update status failed");
    }

    // 19. Student 2 verifies updated status is now "Accepted"
    console.log("\n[TEST 19] Student 2 Verifies Status Changed to 'Accepted'");
    const updatedAppsRes = await apiCall("/api/applications/my-applications", "GET", null, reg2.cookie);
    const updatedApp = updatedAppsRes.data.applications?.find((a) => a._id === applicationId);
    console.log("-> Verified Status:", updatedApp?.status);
    if (updatedApp?.status !== "Accepted") throw new Error("Status was not updated in student view");

    // 20. Bad login test
    console.log("\n[TEST 20] Login with Incorrect Password Rejection");
    const badLogin = await apiCall("/api/auth/login", "POST", {
      email: student1Email,
      password: "WrongPassword!"
    });
    console.log("-> Status:", badLogin.status, "Message:", badLogin.data.message);
    if (badLogin.status !== 401) throw new Error("Bad login was not rejected with 401");

    // 21. Good login test
    console.log("\n[TEST 21] Login with Correct Credentials");
    const goodLogin = await apiCall("/api/auth/login", "POST", {
      email: student1Email,
      password: "Password123!"
    });
    console.log("-> Status:", goodLogin.status, "User Name:", goodLogin.data.user?.name);
    if (goodLogin.status !== 200 || !goodLogin.data.user) throw new Error("Valid login failed");

    // 22. Logout
    console.log("\n[TEST 22] Logout Session Invalidation");
    const logoutRes = await apiCall("/api/auth/logout", "POST", null, goodLogin.cookie);
    console.log("-> Status:", logoutRes.status, "Message:", logoutRes.data.message);
    const afterLogoutMe = await apiCall("/api/auth/me", "GET", null, goodLogin.cookie);
    console.log("-> After logout /api/auth/me status:", afterLogoutMe.status);
    if (afterLogoutMe.status !== 401) throw new Error("Session remained active after logout");

    console.log("\n==================================================");
    console.log("ALL 22 END-TO-END SYSTEM INTEGRATION TESTS PASSED!");
    console.log("==================================================\n");
  } finally {
    serverProcess.kill();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
