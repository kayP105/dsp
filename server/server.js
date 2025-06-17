// server/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'your-super-secret-key-for-jwt';

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE ---
let users = {};
let tasks = {};

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users[username] = {
      password,
      availability: { '0': 2, '1': 2, '2': 2, '3': 2, '4': 2, '5': 4, '6': 4 }
    };
    tasks[username] = [];
    res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken, username });
});

// --- DATA ROUTES (Protected) ---

app.post('/user/availability', authenticateToken, (req, res) => {
    const { username } = req.user;
    const { availability } = req.body;
    if (!users[username]) return res.status(404).json({ message: 'User not found' });
    
    users[username].availability = availability;
    res.status(200).json({ message: 'Availability updated successfully.' });
});

app.get('/api/subjects', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username] || [];
    const subjectSet = new Set(userTasks.map(task => task.subject));
    const uniqueSubjects = [...subjectSet];
    res.json(uniqueSubjects);
});

// --- TASK MANAGEMENT ROUTES ---

// GET Master Task List (for the sidebar)
app.get('/api/tasks', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username] || [];
    res.json(userTasks);
});

// CREATE a new Master Task
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { subject, deadline, hours } = req.body;
    if (!subject || !deadline || !hours) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const newTask = { id: Date.now(), subject, deadline, hours: parseInt(hours), completed: false };
    tasks[req.user.username].push(newTask);
    res.status(201).json(newTask);
});

// DELETE a Master Task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.id, 10);
    const userTasks = tasks[username] || [];
    const taskIndex = userTasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    userTasks.splice(taskIndex, 1);
    tasks[username] = userTasks;
    res.status(200).json({ message: 'Task deleted successfully' });
});

// GET Scheduled Plan (for the calendar)
app.get('/api/planner', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username] || [];
    const availability = users[req.user.username]?.availability || { '0':2, '1':2, '2':2, '3':2, '4':2, '5':4, '6':4 };
    const studyBlocks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of userTasks) {
        if (task.completed) continue;
        const deadline = new Date(task.deadline);
        let hoursToSchedule = task.hours;
        const daysRemaining = Math.ceil((deadline - today) / (1000 * 3600 * 24));

        for (let i = 0; i < daysRemaining && hoursToSchedule > 0; i++) {
            const currentDay = new Date(today);
            currentDay.setDate(today.getDate() + i);
            const dayOfWeek = currentDay.getDay();
            const availableHoursToday = availability[dayOfWeek] || 0;
            
            if (availableHoursToday > 0) {
                const hoursForThisBlock = Math.min(hoursToSchedule, availableHoursToday);
                const blockStart = new Date(currentDay);
                blockStart.setHours(9, 0, 0, 0); 
                const blockEnd = new Date(blockStart);
                blockEnd.setHours(blockStart.getHours() + hoursForThisBlock);

                studyBlocks.push({
                    id: `${task.id}-${i}`,
                    title: `${task.subject} (${hoursForThisBlock.toFixed(1)}hr session)`,
                    start: blockStart.toISOString(),
                    end: blockEnd.toISOString(),
                    backgroundColor: '#748ffc',
                    borderColor: '#748ffc',
                    extendedProps: { taskId: task.id } // <-- CRITICAL: Links block to master task
                });
                hoursToSchedule -= hoursForThisBlock;
            }
        }
    }
    res.json(studyBlocks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});