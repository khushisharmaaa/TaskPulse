const Job = require('../models/jobModel');

// Global in-memory map: Map<timestamp, [job]>
const jobMap = new Map();

// Add a single job to the map
function addJobToMap(job) {
  const ts = job.timestamp;
  if (!ts) {
    console.error("❌ Tried to add job with no timestamp:", job);
    return;
  }

  // If timestamp already has jobs, push it, otherwise create a new array
  if (!jobMap.has(ts)) jobMap.set(ts, []);
  jobMap.get(ts).push(job);
}

// Load all future jobs from DB at startup
async function loadJobsFromDB() {
  const now = Math.floor(Date.now() / 1000); // Current epoch in seconds
  const futureJobs = await Job.find({ timestamp: { $gte: now } });

  futureJobs.forEach(job => {
    addJobToMap(job);
    console.log(`📦 Loaded job: ${job.name} scheduled at ${job.timestamp}`);
  });

  console.log(`✅ Total ${futureJobs.length} jobs loaded into jobMap.`);
}

// Remove a job from the map after execution
//const Job = require('../models/jobModel'); // Assuming the Job model is in this path

async function removeJobFromMap(name, timestamp) {
  if (!name || !timestamp) {
    console.error('❌ Name and timestamp are required.');
    return;
  }

  if (jobMap.has(timestamp)) {
    const jobs = jobMap.get(timestamp);
    const updatedJobs = jobs.filter(job => job.name !== name);

    if (updatedJobs.length === 0) {
      jobMap.delete(timestamp);
      console.log(`✅ All jobs at timestamp ${timestamp} removed from map.`);
    } else {
      jobMap.set(timestamp, updatedJobs);
      console.log(`✅ Job "${name}" removed from timestamp ${timestamp} in map.`);
    }
  } else {
    console.log(`ℹ️ No jobs found at timestamp ${timestamp} in jobMap, proceeding with DB deletion.`);
  }

  // Remove from DB (already handled in route, but keeping logic clear)
  try {
    const result = await Job.deleteOne({ name, timestamp });
    if (result.deletedCount > 0) {
      console.log(`✅ Job "${name}" removed from the database.`);
    } else {
      console.warn(`⚠️ No job found in DB with name "${name}" and timestamp ${timestamp}.`);
    }
  } catch (err) {
    console.error(`❌ Error removing job from DB: ${err.message}`);
  }
}

  


// Reschedule recurring job
function rescheduleJob(job) {
    const { timestamp, interval, type, _id } = job;
  
    if (type === 'recurring' && interval) {
      const newTimestamp = timestamp + interval;
  
      // ✅ Convert to plain object and fully remove _id
      let newJob = job.toObject ? job.toObject() : JSON.parse(JSON.stringify(job));
      delete newJob._id;
      newJob.timestamp = newTimestamp;
  
      // Optional: remove old job from in-memory map
      removeJobFromMap(_id, timestamp);
  
      // ✅ Add to in-memory map
      addJobToMap(newJob);
  
      // ✅ Save new job to DB
      Job.create(newJob)
        .then(savedJob => {
          console.log(`🔁 Rescheduled job "${savedJob.name}" to timestamp ${newTimestamp}`);
        })
        .catch(err => {
          console.error(`❌ Failed to save rescheduled job "${newJob.name}":`, err);
        });
    }
  }
  
  

// Exported stuff
module.exports = {
  jobMap,
  addJobToMap,
  loadJobsFromDB,
  removeJobFromMap,
  rescheduleJob
};
