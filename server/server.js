// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = a = require('jsonwebtoken');

const app = express();
const PORT = 5001; // Backend runs on a different port
const JWT_SECRET = 'your-super-secret-key-for-jwt'; // Use a .env file in a real app

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE (Replace with a real DB like PostgreSQL/MongoDB later) ---
let users = {}; // { username: { password: '...' } }
let tasks = {}; // { username: [ { id, subject, deadline, hours } ] }

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // No token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};
app.get('/api/test', (req, res) => {
    res.json({ message: 'Success! The backend test route is working!' });
});

// --- API ROUTES ---

// 1. Authentication
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users[username] = { password };
    tasks[username] = [];
    console.log('Users:', users);
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

// 2. Task Management (Protected Route)
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { subject, deadline, hours } = req.body;
    if (!subject || !deadline || !hours) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const newTask = { id: Date.now(), subject, deadline, hours: parseInt(hours), completed: false };
    tasks[req.user.username].push(newTask);
    console.log('Tasks for', req.user.username, ':', tasks[req.user.username]);
    res.status(201).json(newTask);
});

// 3. Planner Generation (Protected Route)
app.get('/api/planner', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username];
    
    // --- DYNAMIC SCHEDULER V1 (Simple Version) ---
    // This is the core logic you will enhance later.
    // For now, it just calculates days remaining and hours per day.
    
    const plan = userTasks.map(task => {
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Ensure at least 1 day
        const hoursPerDay = (task.hours / daysRemaining).toFixed(2);
        
        return {
            ...task,
            daysRemaining,
            hoursPerDay,
        };
    });
    
    // TODO: Implement the real adaptive scheduling algorithm here.
    // It should create a day-by-day schedule, handle overdue tasks,
    // and slot in revision sessions based on a forgetting curve model.
    
    res.json(plan);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});