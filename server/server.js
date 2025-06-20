// server/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5050; // Using the new, working port
const JWT_SECRET = 'your-super-secret-key-for-jwt';

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE ---
let users = {};
let tasks = {};
let manualEvents = {};
let grades = {}; // NEW: Storage for grades

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
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    if (users[username]) return res.status(400).json({ message: 'User already exists' });
    users[username] = { password, availability: [] };
    tasks[username] = [];
    manualEvents[username] = [];
    grades[username] = []; // Initialize grades for new user
    res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken, username });
});

// --- DATA & TASK ENDPOINTS ---
app.post('/user/availability', authenticateToken, (req, res) => {
    const { username } = req.user;
    const { availability } = req.body;
    if (!users[username]) return res.status(404).json({ message: 'User not found' });
    users[username].availability = availability;
    res.status(200).json({ message: 'Availability updated successfully.' });
});

app.get('/api/tasks', authenticateToken, (req, res) => { res.json(tasks[req.user.username] || []); });
app.get('/api/subjects', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username] || [];
    res.json([...new Set(userTasks.map(task => task.subject))]);
});
app.get('/api/events', authenticateToken, (req, res) => { res.json(manualEvents[req.user.username] || []); });

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { subject, startDate, deadline, hours } = req.body;
    const newTask = {
        id: Date.now(), subject, startDate, deadline, hours: parseInt(hours),
        createdAt: new Date().toISOString().split('T')[0],
        completed: false, dailyProgress: {}
    };
    tasks[req.user.username].push(newTask);
    res.status(201).json(newTask);
});

app.post('/api/events', authenticateToken, (req, res) => {
    const { name, date, startTime, endTime } = req.body;
    const newEvent = {
        id: `manual-${Date.now()}`, title: name, start: `${date}T${startTime}`, end: `${date}T${endTime}`,
        extendedProps: { type: 'manual' }, backgroundColor: '#f06595', borderColor: '#f06595'
    };
    manualEvents[req.user.username].push(newEvent);
    res.status(201).json(newEvent);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.id, 10);
    tasks[username] = (tasks[username] || []).filter(task => task.id !== taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
});

app.post('/api/tasks/:taskId/progress', authenticateToken, (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.taskId, 10);
    const { date, hours, completed } = req.body;
    const task = (tasks[username] || []).find(t => t.id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.dailyProgress[date] = completed ? hours : 0;
    res.status(200).json({ message: 'Progress updated.' });
});

// --- NEW GRADEBOOK ENDPOINTS ---
app.get('/api/grades', authenticateToken, (req, res) => {
    const { username } = req.user;
    res.json(grades[username] || []);
});
app.post('/api/grades', authenticateToken, (req, res) => {
    const { username } = req.user;
    const { topic, score, outOf } = req.body;
    if (!topic || !score || !outOf) return res.status(400).json({ message: 'All fields are required.' });
    const newGrade = {
        id: Date.now(),
        topic,
        score: parseFloat(score),
        outOf: parseFloat(outOf),
        date: new Date().toISOString()
    };
    if (!grades[username]) grades[username] = [];
    grades[username].push(newGrade);
    res.status(201).json(newGrade);
});


// --- THE ADAPTIVE SCHEDULER ---
app.get('/api/planner', authenticateToken, (req, res) => {
    const { username } = req.user;
    const userTasks = tasks[username] || [];
    const userManualEvents = manualEvents[username] || [];
    let availability = users[username]?.availability || [];

    if (availability.length === 0) {
        availability = [
            { day: 'Sunday', enabled: true }, { day: 'Monday', enabled: true },
            { day: 'Tuesday', enabled: true }, { day: 'Wednesday', enabled: true },
            { day: 'Thursday', enabled: true }, { day: 'Friday', enabled: true },
            { day: 'Saturday', enabled: true }
        ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let allCalendarEvents = [...userManualEvents];

    for (const task of userTasks) {
        const completedHours = Object.values(task.dailyProgress).reduce((a, b) => a + b, 0);
        const remainingHours = task.hours - completedHours;
        if (remainingHours <= 0) continue;

        const futureWorkDays = [];
        const deadline = new Date(task.deadline + 'T00:00:00');
        const taskStartDate = new Date(task.startDate + 'T00:00:00');
        deadline.setHours(23, 59, 59, 999);
        taskStartDate.setHours(0, 0, 0, 0);

        const schedulingStartDate = taskStartDate > today ? taskStartDate : today;
        let currentDay = new Date(schedulingStartDate);
        while (currentDay <= deadline) {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay.getDay()];
            if (availability.find(d => d.day === dayName)?.enabled) {
                futureWorkDays.push(new Date(currentDay));
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }

        const hoursPerDay = futureWorkDays.length > 0 ? remainingHours / futureWorkDays.length : 0;
        if (hoursPerDay <= 0) continue;

        futureWorkDays.forEach(workDay => {
            const dateString = workDay.toISOString().split('T')[0];
            allCalendarEvents.push({
                id: `task-${task.id}-${dateString}`,
                title: `${task.subject} (${hoursPerDay.toFixed(1)}hr)`,
                start: dateString, allDay: true, backgroundColor: '#748ffc',
                extendedProps: { type: 'task', taskId: task.id, date: dateString, hours: hoursPerDay, isComplete: false }
            });
        });

        const originalTaskCreateDate = new Date(task.createdAt + 'T00:00:00');
        let pastDay = new Date(originalTaskCreateDate);
        while (pastDay < today) {
            const dateString = pastDay.toISOString().split('T')[0];
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][pastDay.getDay()];
            if (availability.find(d => d.day === dayName)?.enabled) {
                const hoursDone = task.dailyProgress[dateString] || 0;
                allCalendarEvents.push({
                    id: `progress-${task.id}-${dateString}`,
                    title: `${task.subject}`, start: dateString, allDay: true, backgroundColor: hoursDone > 0 ? '#2f9e44' : '#ced4da',
                    extendedProps: { type: 'progress', taskId: task.id, date: dateString, hours: hoursPerDay, isComplete: hoursDone > 0 }
                });
            }
            pastDay.setDate(pastDay.getDate() + 1);
        }
    }
    res.json(allCalendarEvents);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));