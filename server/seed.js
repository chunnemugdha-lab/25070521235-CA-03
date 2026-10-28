require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Job = require("./models/Job");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freelance_gig_db";

const sampleGigs = [
  {
    title: "Campus Club Website Redesign (React + Vite)",
    description:
      "Our university Robotics & AI club needs a modern, responsive website to showcase ongoing projects, sponsor packages, and student registrations for the upcoming regional competition. You will work with existing brand assets and create 4 core pages (Home, Projects, Team, Contact).",
    category: "Web Development",
    jobType: "Freelance",
    locationType: "Remote",
    location: "Remote (University Campus)",
    budget: 15000,
    skills: ["React", "JavaScript", "HTML/CSS", "Git", "Responsive Design"],
    daysToDeadline: 25
  },
  {
    title: "Data Structures & Algorithms Peer Tutor (Python/C++)",
    description:
      "Seeking a 3rd or 4th year Computer Science student to conduct weekly 1-on-1 tutoring sessions for sophomore students tackling binary trees, graphs, sorting algorithms, and dynamic programming. Sessions will be 2 hours twice a week on campus.",
    category: "Tutoring & Academics",
    jobType: "Part-time",
    locationType: "On-Campus",
    location: "CS Building Library / Study Room 204",
    budget: 6500,
    skills: ["Python", "C++", "Data Structures", "Algorithms", "Mentoring"],
    daysToDeadline: 14
  },
  {
    title: "College Tech Fest Poster & Social Media Graphics Pack",
    description:
      "Design an eye-catching visual identity kit for our annual Inter-College Hackathon. Includes 1 main event poster (A3 print-ready), 5 Instagram carousel templates, and digital banners for LinkedIn and WhatsApp announcements.",
    category: "Design & Creative",
    jobType: "One-time Task",
    locationType: "Remote",
    location: "Remote",
    budget: 8000,
    skills: ["Figma", "Adobe Photoshop", "Illustrator", "Branding", "Typography"],
    daysToDeadline: 10
  },
  {
    title: "Technical Content Writer for Student Society Newsletter",
    description:
      "Write 3 engaging technical articles (800-1200 words each) covering AI tools for college productivity, Open Source contribution guides for beginners, and cybersecurity essentials. Clean markdown formatting required.",
    category: "Writing & Content",
    jobType: "Freelance",
    locationType: "Remote",
    location: "Remote",
    budget: 5000,
    skills: ["Technical Writing", "Markdown", "Research", "Copywriting"],
    daysToDeadline: 21
  },
  {
    title: "Campus Cultural Night Highlights & Reels Editor",
    description:
      "We have 4K raw footage from the college annual music and dance festival. Need a creative editor to craft a 2-minute cinematic after-movie plus 3 high-energy vertical reels with royalty-free music and captions.",
    category: "Video & Audio",
    jobType: "One-time Task",
    locationType: "Hybrid",
    location: "Campus Media Center / Remote",
    budget: 10000,
    skills: ["Adobe Premiere Pro", "CapCut", "Sound Design", "Color Grading"],
    daysToDeadline: 8
  },
  {
    title: "Campus Cafe Online Ordering Prototype (Node + Express)",
    description:
      "Build a lightweight REST API and admin dashboard prototype for students to pre-order sandwiches and coffee between class breaks to reduce canteen rush hour queues.",
    category: "Web Development",
    jobType: "Freelance",
    locationType: "Remote",
    location: "Remote",
    budget: 18000,
    skills: ["Node.js", "Express", "MongoDB", "REST APIs", "JavaScript"],
    daysToDeadline: 30
  },
  {
    title: "Academic Research & Bibliography Assistant",
    description:
      "Assist a faculty research team in literature review indexing for renewable energy systems. Format 60+ citations according to IEEE standards, check DOI references, and compile an annotated bibliography spreadsheet.",
    category: "Campus Services",
    jobType: "Part-time",
    locationType: "On-Campus",
    location: "Central Campus Library - Science Wing",
    budget: 4500,
    skills: ["Academic Research", "IEEE Citation", "Excel", "Data Entry"],
    daysToDeadline: 18
  },
  {
    title: "Social Media Community Manager for University Hackathon",
    description:
      "Manage social media engagement, answer candidate FAQs on Discord, post daily countdown stories, and coordinate live event coverage during our 36-hour hackathon weekend.",
    category: "Marketing & Social Media",
    jobType: "Part-time",
    locationType: "Hybrid",
    location: "Student Activity Center & Online",
    budget: 7500,
    skills: ["Social Media", "Community Management", "Discord", "Content Creation"],
    daysToDeadline: 15
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connection established.");

    // 1. Ensure a demo poster/student exists without overwriting existing data
    let demoPoster = await User.findOne({ email: "demoposter@campusgig.edu" });
    if (!demoPoster) {
      const hashedPassword = await bcrypt.hash("CampusGig2026!", 12);
      demoPoster = await User.create({
        name: "Campus Tech Society",
        email: "demoposter@campusgig.edu",
        password: hashedPassword,
        college: "University School of Technology",
        bio: "Official campus organization coordinating student freelance projects, hackathons, and technical workshops.",
        skills: ["Project Management", "Full-Stack Development", "Design"],
        role: "recruiter"
      });
      console.log("Created demo poster account: demoposter@campusgig.edu (Password: CampusGig2026!)");
    } else {
      console.log("Existing demo poster account found:", demoPoster.email);
    }

    // 2. Check if jobs already exist
    const existingCount = await Job.countDocuments();
    if (existingCount > 0) {
      console.log(`Notice: Database already contains ${existingCount} job postings.`);
      console.log("Preserving existing job postings. Seed completed without overwriting data.");
      process.exit(0);
    }

    // 3. Insert sample gigs
    const jobsToInsert = sampleGigs.map((gig) => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + gig.daysToDeadline);

      return {
        title: gig.title,
        description: gig.description,
        category: gig.category,
        jobType: gig.jobType,
        locationType: gig.locationType,
        location: gig.location,
        budget: gig.budget,
        skills: gig.skills,
        deadline,
        status: "Open",
        poster: demoPoster._id,
        applicantCount: 0
      };
    });

    await Job.insertMany(jobsToInsert);
    console.log(`Successfully seeded ${jobsToInsert.length} realistic student jobs!`);
    console.log("Database seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seed:", error);
    process.exit(1);
  }
}

seed();
