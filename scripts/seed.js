const fs = require('fs');
const path = require('path');
const dns = require('dns');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {}
}

const config = require('../src/config');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const Candidate = require('../src/models/Candidate');
const Evaluation = require('../src/models/Evaluation');
const TransferLog = require('../src/models/TransferLog');
const { generateCandidateId } = require('../src/utils/candidateIdGenerator');
const { mapRowToCandidateData } = require('../src/utils/columnMapper');
const { isValidEmail } = require('../src/services/importService');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected successfully.');

    // 1. Seed Admin
    const adminCode = config.defaultAdminCode || 'NEXUS-815';
    let admin = await Admin.findOne({ role: 'admin' });
    if (!admin) {
      admin = await Admin.create({
        name: 'GDGoC VJIT Organiser Core',
        accessCode: adminCode,
        role: 'admin'
      });
      console.log(`[Seed] Created Admin with access code: ${adminCode}`);
    } else {
      admin.accessCode = adminCode;
      await admin.save();
      console.log(`[Seed] Admin access code updated to: ${adminCode}`);
    }

    // 2. Seed the 5 Official GDGoC VJIT Team Leads
    const officialLeads = [
      {
        name: 'Lead Terminal (Technical)',
        accessCode: 'SYNTAX-409',
        assignedDomains: ['Technical (Team Terminal)']
      },
      {
        name: 'Lead EventOps (Event Management)',
        accessCode: 'SUMMIT-358',
        assignedDomains: ['Event Management (Team EventOps)']
      },
      {
        name: 'Lead Pixelle (Design)',
        accessCode: 'CANVAS-723',
        assignedDomains: ['Design (Team Pixelle)']
      },
      {
        name: 'Lead Marketron (Marketing)',
        accessCode: 'RADAR-614',
        assignedDomains: ['Marketing (Team Marketron)']
      },
      {
        name: 'Lead Chitrakaar (Production)',
        accessCode: 'FRAME-582',
        assignedDomains: ['Production (Team Chitrakaar)']
      }
    ];

    const seededLeads = [];
    for (const leadData of officialLeads) {
      let lead = await TeamLead.findOne({ name: leadData.name });
      if (!lead) {
        lead = await TeamLead.create(leadData);
        console.log(`[Seed] Created Team Lead: ${lead.name} [Access Code: ${leadData.accessCode}]`);
      } else {
        lead.assignedDomains = leadData.assignedDomains;
        lead.accessCode = leadData.accessCode;
        await lead.save();
        console.log(`[Seed] Team Lead '${lead.name}' updated.`);
      }
      seededLeads.push(lead);
    }

    // Clean up any old dummy team leads from prior runs
    await TeamLead.deleteMany({
      name: { $nin: officialLeads.map((l) => l.name) }
    });

    // 3. Seed Candidates from the Official Team Sheets
    const excelPath = path.join(__dirname, '../samples/GDGoC_2026-27_Recruitments_Working_Sheet.xlsx');

    if (fs.existsSync(excelPath)) {
      console.log(`[Seed] Reading official candidates spreadsheet: ${excelPath}`);
      const workbook = xlsx.readFile(excelPath);

      // Define the 5 team sheets and their canonical domain mapping
      const teamSheetConfigs = [
        { sheet: 'Technical', domain: 'Technical (Team Terminal)' },
        { sheet: 'Event Management', domain: 'Event Management (Team EventOps)' },
        { sheet: 'Marketing', domain: 'Marketing (Team Marketron)' },
        { sheet: 'Design', domain: 'Design (Team Pixelle)' },
        { sheet: 'Production', domain: 'Production (Team Chitrakaar)' }
      ];

      // Reset existing candidates to ensure an accurate 1:1 match with the spreadsheet
      await Candidate.deleteMany({});
      console.log('[Seed] Cleared existing candidate documents for fresh synchronization.');

      const candidatesToInsert = [];

      for (const { sheet, domain } of teamSheetConfigs) {
        if (!workbook.Sheets[sheet]) {
          console.warn(`[Seed] Warning: Sheet '${sheet}' not found in workbook.`);
          continue;
        }

        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], { defval: '' });
        console.log(`[Seed] Processing sheet '${sheet}': ${rows.length} rows.`);

        const matchingLead = seededLeads.find((l) =>
          l.assignedDomains?.some((d) => d.toLowerCase() === domain.toLowerCase())
        );

        for (const row of rows) {
          const mapped = mapRowToCandidateData(row);

          let email = (mapped.email || '').trim().toLowerCase();
          // Sanitize typos like missing .com
          if (email.endsWith('@gmail')) email += '.com';
          if (email.endsWith('@vjit.ac')) email += '.in';

          const rollNumber = (mapped.rollNumber || '').trim().toUpperCase();
          const preferredDomain = domain;

          if (!email || !rollNumber) {
            console.warn(`[Seed] Skipping invalid row in sheet ${sheet}:`, mapped);
            continue;
          }

          candidatesToInsert.push({
            candidateId: generateCandidateId(),
            name: (mapped.name || row['Full Name'] || '').trim(),
            email,
            phone: (mapped.phone || 'N/A').trim(),
            rollNumber,
            yearOfStudy: (mapped.yearOfStudy || '1st Year').trim(),
            branch: (mapped.branch || 'General').trim(),
            section: (mapped.section || '').trim(),
            preferredDomain,
            whyJoin: (mapped.whyJoin || '').trim(),
            whyDomain: (mapped.whyDomain || '').trim(),
            priorExperience: (mapped.priorExperience || '').trim(),
            openToOtherDomain: (mapped.openToOtherDomain || 'Yes').trim(),
            contribution: (mapped.contribution || '').trim(),
            linkedinUrl: (mapped.linkedinUrl || '').trim(),
            githubUrl: (mapped.githubUrl || '').trim(),
            portfolioUrl: (mapped.portfolioUrl || '').trim(),
            originalDomain: preferredDomain,
            currentDomain: preferredDomain,
            assignedLead: matchingLead ? matchingLead._id : null,
            shortlistStatus: 'PENDING',
            finalSelectionStatus: 'PENDING'
          });
        }
      }

      if (candidatesToInsert.length > 0) {
        const inserted = await Candidate.insertMany(candidatesToInsert);
        console.log(`[Seed] Successfully imported ${inserted.length} candidates from all 5 team sheets into MongoDB Atlas!`);
      }
    }

    console.log('[Seed] Seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
