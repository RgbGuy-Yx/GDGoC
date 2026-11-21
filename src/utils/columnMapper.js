/**
 * Normalizes header strings for flexible matching against Google Form exports.
 * Removes special chars, extra whitespace, and converts to lowercase.
 */
const normalizeHeader = (header) => {
  if (!header || typeof header !== 'string') return '';
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Mapping definitions with normalized patterns
 */
const FIELD_PATTERNS = {
  name: [
    'fullname',
    'name',
    'studentname',
    'candidatename',
    'applicantname'
  ],
  email: [
    'emailid',
    'email',
    'emailaddress',
    'username',
    'studentemail'
  ],
  phone: [
    'phoneno',
    'phone',
    'phonenumber',
    'contactnumber',
    'mobilenumber',
    'whatsappnumber',
    'contact'
  ],
  rollNumber: [
    'rollnumber',
    'rollno',
    'hallticketnumber',
    'htno',
    'hallticket',
    'roll'
  ],
  yearOfStudy: [
    'yearofstudy',
    'year',
    'currentyear',
    'whichyearareyoustudyingin',
    'studyyear'
  ],
  branch: [
    'branchdepartment',
    'branch',
    'department',
    'stream',
    'course'
  ],
  section: [
    'section',
    'sec',
    'classsection'
  ],
  preferredDomain: [
    'whichdomainteamdoyouprefer',
    'preferreddomainteam',
    'preferreddomain',
    'domain',
    'whichdomainareyouapplyingfor',
    'preferredteam',
    'domainpreference',
    'targetdomain'
  ],
  whyJoin: [
    'whydoyouwanttojoingdgoc',
    'whydoyouwanttojoingdgocvjit',
    'whygdgoc',
    'whyjoingdgoc',
    'whyjoinus',
    'whyjoin'
  ],
  whyDomain: [
    'whyareyouinterestedinjoiningthisparticulardomain',
    'whyareyouinterestedinthisparticulardomain',
    'whyareyouinterestedinthisdomain',
    'whythisdomain',
    'whyinterestedinthisdomain',
    'whydomain'
  ],
  priorExperience: [
    'doyouhaveanypriorexperienceorknowledgerelatedtoyourpreferreddomainifyesspecify',
    'priorexperienceorknowledge',
    'priorexperience',
    'experience',
    'pastexperience',
    'priorknowledge'
  ],
  openToOtherDomain: [
    'wouldyoubeopentoworkinginanotherdomainifrequired',
    'opentoanotherdomain',
    'areyouopentoanotherdomain',
    'opentootherdomains',
    'opentootherdomain',
    'opentoworkinginanotherdomain'
  ],
  contribution: [
    'howdoyouthinkyoucancontributetogdgocvjitasateammember',
    'howcanyoucontributetogdgocvjit',
    'howcanyoucontribute',
    'howwillyoucontribute',
    'contribution',
    'contributiontogdgoc'
  ],
  linkedinUrl: [
    'linkedinprofileurloptional',
    'linkedinurl',
    'linkedin',
    'linkedinprofile',
    'linkedinlink'
  ],
  githubUrl: [
    'githubprofileurloptional',
    'githuburl',
    'github',
    'githubprofile',
    'githublink'
  ],
  portfolioUrl: [
    'sharelinkstoanyrelevantprofilesorportfoliosoptionalegleetcodehackerrankpersonalportfoliofigmabehanceetc',
    'sharelinkstoanyrelevantprofilesorportfolios',
    'otherportfoliolinks',
    'portfoliolinks',
    'portfolio',
    'portfoliourl',
    'website',
    'otherlinks',
    'resumelink',
    'resume'
  ]
};

/**
 * Maps a single row object (with raw column keys) to the normalized candidate schema keys
 */
const mapRowToCandidateData = (rawRow) => {
  const mapped = {};
  const rawKeys = Object.keys(rawRow);

  for (const rawKey of rawKeys) {
    const normalizedKey = normalizeHeader(rawKey);
    const rawVal = rawRow[rawKey];
    const val = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';

    for (const [targetField, patterns] of Object.entries(FIELD_PATTERNS)) {
      if (mapped[targetField]) continue; // already mapped

      const isMatch = patterns.some((p) => normalizedKey === p || normalizedKey.includes(p));
      if (isMatch) {
        mapped[targetField] = val;
        break;
      }
    }
  }

  return mapped;
};

module.exports = {
  normalizeHeader,
  mapRowToCandidateData,
  FIELD_PATTERNS
};
