const express = require('express');
const path = require('path');
const connectDB = require('./db');
const mongoose = require('mongoose');
const jobRoutes = require('./routes/jobRoutes');
const Job = require('./models/jobModel');
const http = require('http');
const { Server } = require('socket.io');
const worker = require('./scheduler/worker');
const { jobMap, loadJobsFromDB } = require('./scheduler/jobMap');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Initialize worker with io
const { addToQueue, executeJob, startWorker } = worker(io);

// Pass addToQueue to scheduler
const { startScheduler } = require('./scheduler/scheduler')(addToQueue);

const PORT = process.env.PORT || 3000;

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});


app.get('/', (req, res) => {
  res.render('index', { title: 'Job Scheduler - Home' });
});

app.get('/dashboard', async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const jobs = await Job.find({ timestamp: { $gte: currentTime } }).sort({ timestamp: 1 });
    res.render('dashboard', { 
      title: 'Dashboard', 
      jobs,
      currentTime
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).render('dashboard', { 
      title: 'Dashboard', 
      jobs: [],
      error: 'Failed to fetch jobs'
    });
  }
});

app.get('/add-job', (req, res) => {
  res.render('addJob', { title: 'Add New Job' });
});

app.get('/job-list', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ timestamp: 1 });
    res.render('jobList', { 
      title: 'All Jobs', 
      jobs
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).render('jobList', { 
      title: 'All Jobs', 
      jobs: [],
      error: 'Failed to fetch jobs'
    });
  }
});


app.get('/delete-all-jobs', (req, res) => {
  res.render('deleteAllConfirmation', { title: 'Delete All Jobs' });
});


app.post('/api/delete-all-jobs', async (req, res) => {
  try {
    await Job.deleteMany({}); 
    console.log('✅ All jobs deleted, bro!');
    jobMap.clear(); 
    res.status(200).send('All jobs deleted');
  } catch (err) {
    console.error('❌ Error deleting all jobs:', err);
    res.status(500).send('Error deleting jobs');
  }
});


app.use('/api', jobRoutes);


connectDB()
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await loadJobsFromDB();
    startScheduler();
    startWorker();
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB:', err);
  });