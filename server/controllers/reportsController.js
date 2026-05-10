const crypto = require('node:crypto');

const {
  getUser,
  isAdmin,
  createReportRecord,
  getAllReports,
  updateReportStatus,
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

  return content;
}

function getType(reportType){
  const value = String(reportType || '').trim().toLowerCase();
  if (!value) {
    const error = new Error('Report type is required');
    error.type = 'INPUT_REQUIRED';
    throw error;
  }

  if (value !== 'follow' && value !== 'concern') {
    const error = new Error('Invalid report type');
    error.type = 'INPUT_REQUIRED';
    throw error;
  }

  return value;
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
    const reportType = getType(req?.body?.reportType);
    const email = getCurrentUser(req);
    const userId = await getUser(email);

    const report = await createReportRecord({
      reportId: crypto.randomUUID(),
      userId,
      reportContent,
      status: 'pending',
      type: reportType
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

async function updateReport(req, res){
  try{
    const email = getCurrentUser(req);
    const admin = await isAdmin(email);

    if(!admin) return res.status(403).json({ error: 'Forbidden' });

    const reportId = String(req?.params?.reportId || '').trim();
    if(!reportId){
      return res.status(400).json({ error: 'Report ID is required' });
    }

    const status = String(req?.body?.status || '').trim().toLowerCase();
    if(!status){
      return res.status(400).json({ error: 'Status is required' });
    }

    const allowedStatuses = new Set(['pending', 'reviewed']);
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await updateReportStatus(reportId, status);
    if(!updated){
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({ report: updated });
  }catch(error){
    if(error.type === 'UNAUTHORIZED') return res.status(401).json({ error: error.message });
    if(error.type === 'NOT_FOUND') return res.status(404).json({ error: error.message });

    console.error('Update report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createReport, viewReports, updateReport };