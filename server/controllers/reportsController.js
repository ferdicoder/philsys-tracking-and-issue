const crypto = require('node:crypto');

const {
  getUser,
  isAdmin,
  createReportRecord,
  getAllReports,
} = require('../services/reportServices');

function getContent(reportContent){
  if(!reportContent){
    const error = new Error('Blank Report');
    error.type = 'INPUT_REQUIRED';
    throw error;
  }

  const content = String(reportContent).trim();

  if(!content){
    const error = new Error('Blank Report');
    error.type = 'INPUT_REQUIRED';
    throw error;
  }
x``
  return content;
}

function getCurrentUser(req){
  const email = req?.user?.email;

  if(!email){
    const error = new Error('Unauthorized');
    error.type = 'UNAUTHORIZED';
    throw error;
  }

  return email;
}

async function createReport(req, res){
  try{
    const reportContent = getContent(req?.body?.reportContent);
    const email = getCurrentUser(req);
    const userId = await getUser(email);

    const report = await createReportRecord({
      reportId: crypto.randomUUID(),
      userId,
      reportContent,
      status: 'pending'
    });

    return res.status(201).json({ report });
  }catch(error){
    if(error.type === 'INPUT_REQUIRED') return res.status(400).json({ error: error.message });
    if(error.type === 'UNAUTHORIZED') return res.status(401).json({ error: error.message });
    if(error.type === 'NOT_FOUND') return res.status(404).json({ error: error.message });

    console.error('Create report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function viewReports(req, res){
  try{
    const email = getCurrentUser(req);
    const admin = await isAdmin(email);

    if(!admin) return res.status(403).json({ error: 'Forbidden' });

    const reports = await getAllReports();
    return res.status(200).json({ reports });
  }catch(error){
    if(error.type === 'UNAUTHORIZED') return res.status(401).json({ error: error.message });
    if(error.type === 'NOT_FOUND') return res.status(404).json({ error: error.message });

    console.error('View reports error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createReport, viewReports };