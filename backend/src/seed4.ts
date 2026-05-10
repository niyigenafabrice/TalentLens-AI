import mongoose from "mongoose";
import dotenv from "dotenv";
import Applicant from "./models/applicant.model";
import Job from "./models/job.model";

dotenv.config();

const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randN = (arr: any[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ["Alice","Bob","Claire","David","Eve","Fabrice","Gisele","Herve","Ines","Jules","Karen","Leon","Marie","Nathan","Olive","Patrick","Queen","Roger","Sandra","Thierry","Ursula","Victor","Wanda","Xavier","Yvonne","Zacharie","Amina","Bernard","Celestine","Dieudonne","Esperance","Fiston","Grace","Henry","Irene","Jean","Kagiso","Laeticia","Magali","Nelson","Oscar","Prudence","Richard","Serge","Therese","Umutoni","Valens","Winnie","Yves","Zephyrin","Aline","Blaise","Chantal","Denis","Emma","Flavia","Georges","Hortense","Isidore","Jeannette","Kigeli","Liliane","Martin","Noela","Odette","Pascal","Raissa","Sylvie","Tite","Uwase","Vianney","Wendy","Xaveria","Yolande","Zita"];

const lastNames = ["Uwimana","Nkurunziza","Mukamana","Habimana","Ishimwe","Ndayisenga","Umutoniwase","Kayitare","Mukandoli","Nzeyimana","Ineza","Nshimiyimana","Cyubahiro","Bizimana","Nyiramana","Mugabo","Mukeshimana","Gasana","Nyinawumuntu","Niyonzima","Ingabire","Muhire","Uwase","Nkusi","Hakizimana","Nsengimana","Uwineza","Twahirwa","Mukamurera","Nshimiyimana","Kayitesi","Niyonsenga","Uwamariya","Mugisha","Mukamwiza","Nzabonimpa","Murenzi","Uwingabire","Uwera","Niyongabo","Mugwaneza","Umubyeyi","Nkusi","Niyomwungeri","Uwingabire","Nyiransabimana","Ntwari","Hakizimana","Cyusa","Munezero"];

const usedEmails = new Set<string>();
const makePerson = () => {
  const first = rand(firstNames);
  const last = rand(lastNames);
  let email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,999)}@email.com`;
  while (usedEmails.has(email)) {
    email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,9999)}@email.com`;
  }
  usedEmails.add(email);
  const phone = `+25078${randInt(1000000,9999999)}`;
  return { name: `${first} ${last}`, fullName: `${first} ${last}`, email, phone };
};

const eduLevels = ["High School","Diploma","Bachelor Degree","BSc Computer Science","BSc Software Engineering","BSc Information Technology","MSc Computer Science","MSc Software Engineering","MBA","PhD"];
const allCerts: Record<string, string[]> = {
  tech: ["AWS Certified Developer","AWS Solutions Architect","AWS Certified DevOps Engineer","Google Cloud Professional","Docker Certified Associate","Certified Kubernetes Administrator","Meta Frontend Developer","Microsoft Azure Developer","Terraform Associate","Linux Foundation Certified","Google IT Support","IBM Full Stack Developer"],
  data: ["Google Data Analytics","AWS Machine Learning Specialty","TensorFlow Developer","IBM Data Science","Databricks Certified","Deep Learning Specialization","Google Professional Data Engineer","Cloudera Data Analyst"],
  design: ["Google UX Design Certificate","Figma Advanced Certification","Interaction Design Foundation","Adobe Certified Professional","UX Management Certification"],
  product: ["Certified Scrum Product Owner","Google Project Management","Product School Certification","Scrum Master Certified","Agile Coach Certification","Pragmatic Institute"],
  marketing: ["Google Digital Marketing","HubSpot Content Marketing","Meta Blueprint","HubSpot Marketing Hub","SEMrush SEO Certification","Google Analytics","Salesforce Marketing Cloud","HubSpot Email Marketing"],
  devops: ["AWS Certified DevOps Engineer","Certified Kubernetes Administrator","Terraform Associate","Google Cloud DevOps","AWS Solutions Architect Professional","HashiCorp Vault","Prometheus Certified","ArgoCD Certified"],
  finance: ["CPA Rwanda","ACCA","QuickBooks ProAdvisor","SAP Finance Module","CFA Level 1","CFA Level 2","Excel Advanced Certification"],
  hr: ["SHRM-CP","SHRM-SCP","CIPD Level 5","CIPD Level 7","Workday HCM","LinkedIn Recruiter Certification","HR Analytics Certificate","OD Practitioner"],
};

const allProjects: Record<string, string[]> = {
  tech: ["E-commerce platform with 10k users","Real-time chat application","HR Management System","Banking dashboard","Food delivery platform","School management system","Hospital management system","Online voting platform","SaaS subscription platform","Mobile API backend","CRM system for SMEs","Job board platform","Budget tracker app","Payment gateway integration","Loan management system","Inventory management system","Social media clone","Task management tool","Blog platform with CMS","API for mobile app"],
  data: ["Customer churn prediction model","NLP sentiment analysis tool","Sales forecasting system","Housing price prediction","Image classification using CNN","Object detection in production","Recommendation engine for 5M users","AutoML pipeline","Demand forecasting system","Customer segmentation analysis","Real-time fraud detection","A/B testing analysis framework","Dashboard for business analytics","Text classification pipeline"],
  design: ["Design system with 80 components","Mobile app redesign +60% engagement","UX audit for e-commerce","Branding for 3 startups","Mobile app mockup for NGO","Redesigned onboarding flow -50% drop-off","End-to-end fintech app design","User research report for portal","Webflow site 10k monthly visitors","10+ client websites","Healthcare app UI","Travel booking app prototype"],
  product: ["Launched fintech app 50k users","Reduced onboarding drop-off 40%","Platform with 200k users","Grew revenue 35% through features","A/B testing framework +25% conversion","Mobile wallet product","E-commerce checkout redesign","Analytics dashboard for company","0 to 100k users product launch","Feature roadmap for SaaS tool","User research for 3 products"],
  marketing: ["Grew organic traffic 200% in 6 months","Social campaign 500k reach","Email campaign 35% open rate","Rebranding +80% recognition","Demand gen 1000+ leads/month","Grew Instagram 2k to 30k followers","Influencer campaign 1M impressions","PPC campaigns ROI 3x","Content strategy doubling traffic","SEO: 15 keywords on page 1"],
  devops: ["Zero-downtime deployment pipeline","Auto-scaling saving 40% costs","Monitoring for 20 microservices","Migrated 10 servers to cloud","CI/CD pipeline for dev team","Multi-cloud infra for 10M users","Kubernetes cluster 500 pods","Disaster recovery 15min RTO","IaC migration using Terraform","Global infra for 15 countries","Security-hardened Kubernetes cluster","Cost optimization saving $500k/year"],
  finance: ["Automated payroll system","Annual financial statements for 3 companies","Audit prep $10M revenue company","3-year financial model for board","25% cost reduction through analysis","Financial model for startup valuation","Monthly MIS reports for management","Filed taxes for 20+ companies","IPO preparation for regional bank","Secured $5M Series A financing"],
  hr: ["Hired 50+ employees in 2 years","Onboarding program -30% time-to-productivity","Built HR department from scratch","Reduced turnover 45% in 2 years","HRIS for 300-person company","Employee engagement survey and action plan","Payroll migration to new system","Sourced 30 tech candidates in 3 months","DEI program +60% diversity metrics","HR transformation for 500-person org"],
};

const profiles: Record<string, any> = {
  tech: {
    positions: ["Junior Developer","Software Developer","Frontend Developer","Backend Engineer","Full Stack Developer","Software Engineer","Mid-level Engineer","Senior Software Engineer","Lead Engineer","Principal Engineer"],
    skillPool: ["React","Node.js","TypeScript","MongoDB","AWS","Docker","Kubernetes","GraphQL","Vue.js","Angular","Python","Redis","PostgreSQL","Git","CI/CD","Spring Boot","PHP","Laravel","Flutter","Java"],
    requiredSkills: ["React","Node.js","TypeScript","MongoDB","AWS"],
    certPool: allCerts.tech,
    projectPool: allProjects.tech,
  },
  product: {
    positions: ["Project Coordinator","Junior PM","Associate PM","Product Coordinator","Product Manager","Senior PM","Head of Product","VP Product","Chief Product Officer","Product Lead"],
    skillPool: ["Product Strategy","Agile","User Research","Roadmapping","Stakeholder Management","Jira","A/B Testing","SQL","Mixpanel","Figma","Amplitude","Confluence","OKRs","Scrum"],
    requiredSkills: ["Product Strategy","Agile","User Research","Roadmapping","Stakeholder Management"],
    certPool: allCerts.product,
    projectPool: allProjects.product,
  },
  design: {
    positions: ["Intern Designer","Junior UI Designer","Graphic Designer","Freelance Designer","UI Designer","UX Designer","UI/UX Designer","Product Designer","Senior UX Designer","Head of Design"],
    skillPool: ["Figma","User Research","Prototyping","Design Systems","Adobe XD","Webflow","Sketch","InVision","Zeplin","Framer","Usability Testing","Motion Design"],
    requiredSkills: ["Figma","User Research","Prototyping","Design Systems","Adobe XD"],
    certPool: allCerts.design,
    projectPool: allProjects.design,
  },
  devops: {
    positions: ["Cloud Support Engineer","Junior DevOps","Systems Administrator","Infrastructure Engineer","DevOps Engineer","Cloud Engineer","Senior DevOps Engineer","Staff Engineer","Principal DevOps","VP Infrastructure"],
    skillPool: ["AWS","Docker","Kubernetes","Terraform","CI/CD","Linux","Python","Ansible","Prometheus","Grafana","Vault","ArgoCD","Helm","Bash"],
    requiredSkills: ["AWS","Docker","Kubernetes","Terraform","CI/CD","Linux"],
    certPool: allCerts.devops,
    projectPool: allProjects.devops,
  },
  marketing: {
    positions: ["Marketing Intern","Marketing Assistant","Social Media Coordinator","Marketing Coordinator","SEO Specialist","Digital Marketing Specialist","Social Media Manager","Growth Marketer","Marketing Manager","Head of Marketing"],
    skillPool: ["Digital Marketing","SEO","Content Strategy","Social Media","Google Analytics","PPC","Email Marketing","CRM","Copywriting","Brand Strategy","Influencer Marketing"],
    requiredSkills: ["Digital Marketing","SEO","Content Strategy","Social Media","Google Analytics"],
    certPool: allCerts.marketing,
    projectPool: allProjects.marketing,
  },
  data: {
    positions: ["Data Intern","Junior Data Analyst","Data Analyst","Business Analyst","Data Scientist","ML Engineer","Senior Data Scientist","Lead Data Scientist","Head of Data","Chief Data Officer"],
    skillPool: ["Python","Machine Learning","PostgreSQL","Docker","AWS","TensorFlow","PyTorch","Spark","Airflow","Pandas","Scikit-learn","SQL","R","Tableau"],
    requiredSkills: ["Python","Machine Learning","PostgreSQL","Docker","AWS"],
    certPool: allCerts.data,
    projectPool: allProjects.data,
  },
  finance: {
    positions: ["Finance Intern","Finance Assistant","Accounts Clerk","Finance Analyst","Accountant","Tax Officer","Finance Officer","Senior Finance Officer","Finance Manager","CFO"],
    skillPool: ["Accounting","Financial Reporting","Excel","QuickBooks","Budgeting","SAP","Financial Modeling","Tax Compliance","Investor Relations","IFRS"],
    requiredSkills: ["Accounting","Financial Reporting","Excel","QuickBooks","Budgeting"],
    certPool: allCerts.finance,
    projectPool: allProjects.finance,
  },
  hr: {
    positions: ["HR Intern","HR Assistant","Recruitment Coordinator","HR Coordinator","HR Officer","Talent Acquisition Specialist","HR Generalist","HR Business Partner","HR Manager","HR Director"],
    skillPool: ["Recruitment","Onboarding","Employee Relations","HR Policies","Payroll","Performance Management","L&D","HRIS","Organizational Design","Compensation","Employer Branding"],
    requiredSkills: ["Recruitment","Onboarding","Employee Relations","HR Policies","Payroll"],
    certPool: allCerts.hr,
    projectPool: allProjects.hr,
  },
};

const detectCategory = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("devops") || t.includes("infrastructure") || t.includes("cloud")) return "devops";
  if (t.includes("software") || t.includes("developer") || t.includes("frontend") || t.includes("backend") || t.includes("fullstack") || t.includes("full stack") || t.includes("engineer")) return "tech";
  if (t.includes("product manager") || t.includes("product owner")) return "product";
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) return "design";
  if (t.includes("marketing")) return "marketing";
  if (t.includes("data scientist") || t.includes("data science") || t.includes("machine learning") || t.includes("ml engineer")) return "data";
  if (t.includes("finance") || t.includes("accountant") || t.includes("financial")) return "finance";
  if (t.includes("hr") || t.includes("human resource") || t.includes("talent") || t.includes("recruitment")) return "hr";
  return "tech";
};

const generateApplicant = (jobId: any, category: string, level: number) => {
  const p = profiles[category];
  const person = makePerson();
  const positionIndex = Math.min(level, p.positions.length - 1);
  const position = p.positions[positionIndex];

  const expMap: Record<number, [number, number]> = {
    0: [0, 0], 1: [0, 1], 2: [1, 2], 3: [2, 3], 4: [3, 4],
    5: [3, 4], 6: [4, 6], 7: [5, 7], 8: [6, 9], 9: [8, 12],
  };
  const [minExp, maxExp] = expMap[level] || [0, 1];
  const yearsOfExperience = randInt(minExp, maxExp);

  const eduByLevel: Record<number, string[]> = {
    0: ["High School", "Diploma"],
    1: ["Diploma", "Bachelor Degree"],
    2: ["Bachelor Degree", "BSc Computer Science"],
    3: ["Bachelor Degree", "BSc Computer Science", "BSc Software Engineering"],
    4: ["BSc Computer Science", "BSc Software Engineering", "BSc Information Technology"],
    5: ["BSc Computer Science", "BSc Software Engineering"],
    6: ["BSc Computer Science", "MSc Computer Science", "MBA"],
    7: ["MSc Computer Science", "MBA"],
    8: ["MSc Computer Science", "MBA", "PhD"],
    9: ["MBA", "PhD"],
  };
  const educationLevel = rand(eduByLevel[level] || ["Bachelor Degree"]);

  const numSkills = Math.max(1, Math.min(level + 1, p.skillPool.length));
  const skillsFromRequired = randN(p.requiredSkills, Math.min(level, p.requiredSkills.length));
  const extraSkills = randN(p.skillPool.filter((s: string) => !skillsFromRequired.includes(s)), Math.max(0, numSkills - skillsFromRequired.length));
  const skills = [...new Set([...skillsFromRequired, ...extraSkills])];

  const numCerts = level >= 8 ? randInt(3, 4) : level >= 6 ? randInt(2, 3) : level >= 4 ? randInt(1, 2) : level >= 2 ? randInt(0, 1) : 0;
  const certifications = randN(p.certPool, numCerts);

  const numProjects = level >= 7 ? randInt(3, 4) : level >= 4 ? randInt(2, 3) : level >= 2 ? randInt(1, 2) : randInt(0, 1);
  const projects = randN(p.projectPool, numProjects);

  const summaries = [
    `${position} with ${yearsOfExperience} year${yearsOfExperience !== 1 ? "s" : ""} of experience looking to grow in a new role.`,
    `Passionate ${position.toLowerCase()} with hands-on experience in ${skills.slice(0,2).join(" and ")}.`,
    `Dedicated professional with ${yearsOfExperience > 0 ? yearsOfExperience + " years" : "internship"} experience in ${skills[0] || "the field"}.`,
    `${educationLevel} graduate with strong ${skills.slice(0,2).join(" and ")} skills seeking to contribute to a growing team.`,
    `Results-driven ${position.toLowerCase()} experienced in ${skills.slice(0,3).join(", ")}.`,
  ];

  return {
    ...person,
    currentPosition: position,
    jobTitle: position,
    yearsOfExperience,
    experienceYears: yearsOfExperience,
    educationLevel,
    summary: rand(summaries),
    skills,
    certifications,
    projects,
    githubUrl: (category === "tech" || category === "devops" || category === "data") && level >= 3 ? `https://github.com/${person.name.split(" ")[0].toLowerCase()}` : "",
    portfolioUrl: (category === "design" || category === "marketing" || category === "product") && level >= 5 ? `https://${person.name.split(" ")[0].toLowerCase()}.${category}.io` : "",
    jobId,
    source: "external",
    status: "submitted",
  };
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    const jobs = await Job.find({});
    if (jobs.length === 0) {
      console.log("No jobs found. Please create jobs first.");
      process.exit(1);
    }

    console.log(`Found ${jobs.length} jobs:`);
    jobs.forEach(j => console.log(`  - ${j.title}`));

    await Applicant.deleteMany({});
    console.log("Cleared existing applicants");

    const APPLICANTS_PER_JOB = 30;
    const allApplicants: any[] = [];

    for (const job of jobs) {
      const category = detectCategory(job.title);
      console.log(`Generating ${APPLICANTS_PER_JOB} applicants for: ${job.title} (category: ${category})`);

      for (let i = 0; i < APPLICANTS_PER_JOB; i++) {
        const level = Math.floor((i / APPLICANTS_PER_JOB) * 10);
        allApplicants.push(generateApplicant(job._id, category, level));
      }
    }

    await Applicant.insertMany(allApplicants);
    console.log(`\nDone! Created ${allApplicants.length} applicants across ${jobs.length} jobs`);
    console.log(`That is ${APPLICANTS_PER_JOB} applicants per job.`);
    console.log(`Each job has a full mix from intern-level to executive-level candidates.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
