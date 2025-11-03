
export type Startup = { id:string; name:string; location:string; industry:string; submittedOn:string; stage:string; status:string; challengeSlug:string }

export const challenges = [
  { slug:'face-liveness', title:'Face Liveness Detection - SITAA' },
  { slug:'contactless-fingerprint', title:'Contactless Fingerprint Authentication - SITAA' },
  { slug:'presentation-attack', title:'Presentation Attack Detection - SITAA' },
]

export const todoItems = [
  { id:1, challenge:'Face Liveness Detection', challengeSlug:'face-liveness', entity:'Startups', stage:'Proposal', status:'Proposal received' },
  { id:2, challenge:'Contactless Fingerprint Authentication', challengeSlug:'contactless-fingerprint', entity:'Startups', stage:'Proposal', status:'Documents pending' },
  { id:3, challenge:'Presentation Attack Detection', challengeSlug:'presentation-attack', entity:'Academia', stage:'Proposal', status:'Proposal received' },
]

export const startups: Startup[] = [
  { id:'fld-1', name:'Predulive Labs', location:'Basti', industry:'Deep Tech', submittedOn:'2025-05-03', stage:'Screening', status:'SCREENING', challengeSlug:'face-liveness' },
  { id:'fld-2', name:'TanPrish Dynamics Private Limited', location:'Kanpur', industry:'MedTech', submittedOn:'2025-05-03', stage:'Screening', status:'SCREENING', challengeSlug:'face-liveness' },
  { id:'fld-3', name:'SafeYourWeb', location:'Thane', industry:'Security Solutions', submittedOn:'2025-05-02', stage:'Screening', status:'SCREENING', challengeSlug:'face-liveness' },
  { id:'cfp-1', name:'SenseID', location:'Delhi', industry:'Biometrics', submittedOn:'2025-05-03', stage:'Screening', status:'SCREENING', challengeSlug:'contactless-fingerprint' },
  { id:'pad-1', name:'BioAI Labs', location:'Pune', industry:'AI', submittedOn:'2025-05-01', stage:'Screening', status:'SCREENING', challengeSlug:'presentation-attack' },
]

export function getStartupsForChallenge(slug:string){ return startups.filter(s=>s.challengeSlug===slug) }

export const historyItems = [
  { id:1, year:2025, challenge:'Face Liveness Detection', type:'Startup', entity:'Startups', stage:'Proposal', status:'Proposal reviewed' },
  { id:2, year:2025, challenge:'Contactless Fingerprint Authentication', type:'Startup', entity:'Startups', stage:'Pilot', status:'Under review' },
  { id:3, year:2024, challenge:'Presentation Attack Detection', type:'Academia', entity:'Academia', stage:'Proposal', status:'Shortlisted' },
]

export const participationData = [
  { name:'Face Liveness', value:128 },
  { name:'Contactless Fingerprint', value:96 },
  { name:'Presentation Attack', value:64 },
]

export const monthlyData = [
  { month:'Jan', submissions:12 },
  { month:'Feb', submissions:18 },
  { month:'Mar', submissions:22 },
  { month:'Apr', submissions:15 },
  { month:'May', submissions:28 },
]

export type Criterion = { id:string; label:string; max:number }
export type CriterionGroup = { title:string; items:Criterion[] }

export const reviewCriteria: CriterionGroup[] = [
  { title:'Proposal', items:[
    { id:'alignment', label:'Alignment to UIDAI problem statement', max:10 },
    { id:'clarity', label:'Clarity of objectives and OKRs', max:10 },
    { id:'planning', label:'Comprehensive project planning', max:5 },
    { id:'completeness', label:'Completeness of proposal', max:5 },
  ]},
  { title:'Technology', items:[
    { id:'innovation', label:'Innovativeness / uniqueness', max:5 },
    { id:'emerging', label:'Use of deeptech / emerging tech', max:5 },
    { id:'architecture', label:'Technology architecture & design', max:10 },
    { id:'trl', label:'Current TRL and roadmap', max:10 },
  ]},
  { title:'Team', items:[
    { id:'experience', label:'Founders & team experience', max:5 },
    { id:'mitigation', label:'Challenges & mitigation strategy', max:5 },
    { id:'domain', label:'Prior exposure to relevant domain', max:5 },
  ]},
  { title:'Integration', items:[
    { id:'feasibility', label:'Feasibility with existing systems', max:5 },
    { id:'scalability', label:'Scalability of proposed solution', max:5 },
    { id:'security', label:'Security of proposed solution', max:5 },
    { id:'ux', label:'Proposed user experience', max:5 },
  ]},
]
// --- My Reviews (assigned & completed) ----------------------
export type ReviewItem = {
  id: string;                 // startup id you already use in /review/[id]
  challengeSlug: string;
  challenge: string;
  startup: string;
  stage: string;
  assignedOn: string;         // ISO date
  status: "Assigned" | "In Progress" | "Submitted" | "Scored";
  score?: number;             // present for completed items
};

export const myAssignedReviews: ReviewItem[] = [
  {
    id: "fld-1",
    challengeSlug: "face-liveness",
    challenge: "Face Liveness Detection - SITAA",
    startup: "Predulive Labs",
    stage: "Screening",
    assignedOn: "2025-05-03",
    status: "Assigned"
  },
  {
    id: "cfp-1",
    challengeSlug: "contactless-fingerprint",
    challenge: "Contactless Fingerprint Authentication - SITAA",
    startup: "SenseID",
    stage: "Screening",
    assignedOn: "2025-05-03",
    status: "In Progress"
  },
  {
    id: "fld-2",
    challengeSlug: "face-liveness",
    challenge: "Face Liveness Detection - SITAA",
    startup: "TanPrish Dynamics Pvt Ltd",
    stage: "Screening",
    assignedOn: "2025-05-03",
    status: "Assigned"
  }
];

export const myCompletedReviews: ReviewItem[] = [
  {
    id: "pad-1",
    challengeSlug: "presentation-attack",
    challenge: "Presentation Attack Detection - SITAA",
    startup: "BioAI Labs",
    stage: "Screening",
    assignedOn: "2025-05-01",
    status: "Scored",
    score: 72
  },
  {
    id: "fld-3",
    challengeSlug: "face-liveness",
    challenge: "Face Liveness Detection - SITAA",
    startup: "SafeYourWeb",
    stage: "Screening",
    assignedOn: "2025-05-02",
    status: "Submitted",
    score: 64
  }
];

