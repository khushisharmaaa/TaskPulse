const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');

const { addJobToMap,removeJobFromMap } = require('../scheduler/jobMap');

// POST /add-job
router.post('/add-job', async (req, res) => {
  try {
    const { name, type, timestamp, interval, payload } = req.body;

    // Create and save job in DB
    const job = new Job({ name, type, timestamp, interval, payload });
    await job.save();

    // Add to in-memory map
    addJobToMap(job);
   // req.flash('success_msg', `✅ Job "${job.name}" scheduled and running!`);
   // res.redirect('/dashboard');
    res.status(201).json({ message: 'Job scheduled successfully!', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule job' });
  }
});

router.post('/remove-job', async (req, res) => {
    try {
      const { name, timestamp } = req.body;
  
      if (!name || !timestamp) {
        return res.status(400).json({ error: '❌ name and timestamp are required' });
      }
  
      await removeJobFromMap(name, timestamp);
  
      res.status(200).json({ message: `✅ Job "${name}" at timestamp ${timestamp} removed.` });
    } catch (err) {
      console.error(`❌ Failed to remove job:`, err);
      res.status(500).json({ error: 'Failed to remove job' });
    }
  }); 


  router.post('/delete-job', async (req, res) => {
    try {
      const { name, timestamp } = req.body;
      console.log("🗑️ Delete request received for:", { name, timestamp });
  
      if (!name || !timestamp) {
        return res.status(400).json({ success: false, message: 'Missing name or timestamp' });
      }
  
      // Ensure timestamp is a number
      const ts = Number(timestamp);
  
      // Remove from in-memory scheduler (jobMap)
      await removeJobFromMap(name, ts);
  
      // Remove from database
      const result = await Job.deleteOne({ name, timestamp: ts });
      if (result.deletedCount === 0) {
        console.warn(`⚠️ No job found in DB with name "${name}" and timestamp ${ts}`);
      }
  
      // Respond with success
      res.json({ success: true, message: `Job "${name}" deleted successfully` });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
  });
  
module.exports = router;
