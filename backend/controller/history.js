const fs = require('fs');
const path = require('path');

// Use process.cwd() for executable compatibility
const dataDir = path.join(process.cwd(), 'data');
const historyFilePath = path.join(dataDir, 'history.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let writeQueue = [];
let isWriting = false;

const readHistory = () => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const data = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { stats: { totalMailsSent: 0, successfullyEnrolled: 0, pendingEnrollment: 0 }, history: [] };
  }
};

const writeHistory = (data) => {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing history:', error);
  }
};

const processQueue = async () => {
  if (isWriting || writeQueue.length === 0) return;
  isWriting = true;
  
  try {
    const operations = [...writeQueue];
    writeQueue = [];
    
    const data = readHistory();
    
    operations.forEach(op => {
      if (op.type === 'addMail') {
        data.stats.totalMailsSent++;
        data.stats.pendingEnrollment++;
        data.history.push({
          userId: op.userId,
          name: op.name,
          email: op.email,
          mailSentAt: new Date().toISOString(),
          status: 'pending'
        });
      } else if (op.type === 'markSuccess') {
        const user = data.history.find(h => h.userId === op.userId && h.status === 'pending');
        if (user) {
          user.status = 'success';
          data.stats.pendingEnrollment--;
          data.stats.successfullyEnrolled++;
        }
      }
    });
    
    writeHistory(data);
  } finally {
    isWriting = false;
    if (writeQueue.length > 0) {
      setTimeout(processQueue, 100);
    }
  }
};

const addMailSent = (userId, name, email) => {
  writeQueue.push({ type: 'addMail', userId, name, email });
  processQueue();
};

const markEnrollmentSuccess = (userId) => {
  writeQueue.push({ type: 'markSuccess', userId });
  processQueue();
};

const getHistory = (req, res) => {
  try {
    const { limit = 100, offset = 0, search } = req.query;
    const data = readHistory();
    
    let filteredHistory = data.history;
    
    // Apply search filter if search term is provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredHistory = data.history.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower)
      );
    }
    
    const sortedHistory = filteredHistory.sort((a, b) => 
      new Date(b.mailSentAt) - new Date(a.mailSentAt)
    );
    
    const paginatedHistory = sortedHistory
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      stats: data.stats,
      history: paginatedHistory,
      total: filteredHistory.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

module.exports = { addMailSent, markEnrollmentSuccess, getHistory };
