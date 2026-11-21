const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const sampleResponses = [
  {
    'Full Name': 'Kothapally Krishna Teja',
    'Email Address': 'krishnateja@vjit.ac.in',
    'Phone Number': '8333871309',
    'Roll Number': '26911A04F5',
    'Year of Study': '1st Year',
    'Branch/Department': 'ECE',
    'Section': 'C',
    'Which domain/team do you prefer?': 'Technical (Team Terminal)',
    'Why do you want to join GDGoC?': 'To improve technical skills, gain practical experience, explore new technologies.',
    'Why are you interested in joining this particular domain?': 'Enjoy programming and app development, hands-on experience.',
    'Do you have any prior experience or knowledge related to your preferred domain?  If yes, specify.': 'Basic C programming and AI app development on Google AI Studio.',
    'Would you be open to working in another domain if required?': 'Yes',
    'How do you think you can contribute to GDGoC VJIT as a team member?  ': 'Active problem solving, teamwork and project collaboration.',
    'LinkedIn Profile URL (optional)': 'https://linkedin.com/in/krishna-teja',
    'GitHub Profile URL (optional)': 'https://github.com/krishna-teja',
    'Share links to any relevant profiles or portfolios (optional)': 'https://leetcode.com'
  },
  {
    'Full Name': 'Ananya Sphoorthi Kadali',
    'Email Address': 'sphoorthi@vjit.ac.in',
    'Phone Number': '9392936793',
    'Roll Number': '23911A6722',
    'Year of Study': '4th Year',
    'Branch/Department': 'CSE-DS',
    'Section': 'A',
    'Which domain/team do you prefer?': 'Event Management (Team EventOps)',
    'Why do you want to join GDGoC?': 'Connect with people and be part of the GDG network.',
    'Why are you interested in joining this particular domain?': 'Engage with people and manage the environment for GDG events.',
    'Do you have any prior experience or knowledge related to your preferred domain?  If yes, specify.': 'Organized college fests and workshops.',
    'Would you be open to working in another domain if required?': 'Yes',
    'How do you think you can contribute to GDGoC VJIT as a team member?  ': 'Creative event planning and logistics management.',
    'LinkedIn Profile URL (optional)': 'https://linkedin.com/in/ananya-sphoorthi',
    'GitHub Profile URL (optional)': '',
    'Share links to any relevant profiles or portfolios (optional)': ''
  },
  {
    'Full Name': 'Chittapur Harini',
    'Email Address': 'harinich@vjit.ac.in',
    'Phone Number': '7303718020',
    'Roll Number': '26911A0416',
    'Year of Study': '1st Year',
    'Branch/Department': 'ECE',
    'Section': 'A',
    'Which domain/team do you prefer?': 'Design (Team Pixelle)',
    'Why do you want to join GDGoC?': 'Express ideas visually and communicate effectively.',
    'Why are you interested in joining this particular domain?': 'Love visual presentation and Figma prototyping.',
    'Do you have any prior experience or knowledge related to your preferred domain?  If yes, specify.': 'Created posters and visual branding on Canva and Figma.',
    'Would you be open to working in another domain if required?': 'Yes',
    'How do you think you can contribute to GDGoC VJIT as a team member?  ': 'High quality social media banners and branding.',
    'LinkedIn Profile URL (optional)': 'https://linkedin.com/in/chittapur-harini',
    'GitHub Profile URL (optional)': '',
    'Share links to any relevant profiles or portfolios (optional)': 'https://behance.net/harini'
  },
  {
    'Full Name': 'Mannem Yashasvi',
    'Email Address': 'yashasvi@vjit.ac.in',
    'Phone Number': '9876543210',
    'Roll Number': '26911A0588',
    'Year of Study': '1st Year',
    'Branch/Department': 'CSE',
    'Section': 'B',
    'Which domain/team do you prefer?': 'Marketing (Team Marketron)',
    'Why do you want to join GDGoC?': 'Grow campus outreach and build active student community.',
    'Why are you interested in joining this particular domain?': 'Audience engagement, social media promotion and branding.',
    'Do you have any prior experience or knowledge related to your preferred domain?  If yes, specify.': 'Social media outreach campaign experience.',
    'Would you be open to working in another domain if required?': 'Yes',
    'How do you think you can contribute to GDGoC VJIT as a team member?  ': 'Campus promotion campaigns and storytelling.',
    'LinkedIn Profile URL (optional)': 'https://linkedin.com/in/mannem-yashasvi',
    'GitHub Profile URL (optional)': '',
    'Share links to any relevant profiles or portfolios (optional)': ''
  },
  {
    'Full Name': 'Lokshita Grace Nannepamula',
    'Email Address': 'grace@vjit.ac.in',
    'Phone Number': '8328417009',
    'Roll Number': '25911A67A5',
    'Year of Study': '2nd Year',
    'Branch/Department': 'CSE-DS',
    'Section': 'B',
    'Which domain/team do you prefer?': 'Production (Team Chitrakaar)',
    'Why do you want to join GDGoC?': 'Behind the scenes video editing and event capture.',
    'Why are you interested in joining this particular domain?': 'Video production, motion graphics, and audio/visual handling.',
    'Do you have any prior experience or knowledge related to your preferred domain?  If yes, specify.': 'Edited reels and event recaps for E-cell.',
    'Would you be open to working in another domain if required?': 'Yes',
    'How do you think you can contribute to GDGoC VJIT as a team member?  ': 'High quality video shoots, reels, and stage setup.',
    'LinkedIn Profile URL (optional)': 'https://linkedin.com/in/lokshita-grace',
    'GitHub Profile URL (optional)': 'https://github.com/LokshitaGrace',
    'Share links to any relevant profiles or portfolios (optional)': ''
  }
];

const samplesDir = path.join(__dirname, '..', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// 1. Create .xlsx file
const worksheet = xlsx.utils.json_to_sheet(sampleResponses);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Form Responses 1');
const xlsxPath = path.join(samplesDir, 'sample_google_forms_responses.xlsx');
xlsx.writeFile(workbook, xlsxPath);
console.log(`[Created Sample XLSX]: ${xlsxPath}`);

// 2. Create .csv file
const csvContent = xlsx.utils.sheet_to_csv(worksheet);
const csvPath = path.join(samplesDir, 'sample_google_forms_responses.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`[Created Sample CSV]: ${csvPath}`);
