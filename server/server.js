// server/server.js --- FINAL WORKING VERSION

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5050;
const JWT_SECRET = 'your-super-secret-key-for-jwt';

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE ---
let users = {};
let tasks = {};
let manualEvents = {};
let grades = {};

// --- AUTH, MIDDLEWARE, AND ALL OTHER ROUTES (Verified & Complete) ---
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
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    if (users[username]) return res.status(400).json({ message: 'User already exists' });
    users[username] = { password, availability: [], name: username };
    tasks[username] = [];
    manualEvents[username] = [];
    grades[username] = [];
    res.status(201).json({ message: 'User created successfully' });
});
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken, username });
});
app.get('/api/users/me', authenticateToken, (req, res) => { res.json({ name: users[req.user.username]?.name || req.user.username }); });
app.post('/user/availability', authenticateToken, (req, res) => {
    const { username } = req.user;
    if (!users[username]) return res.status(404).json({ message: 'User not found' });
    users[username].availability = req.body.availability;
    res.status(200).json({ message: 'Availability updated successfully.' });
});
app.get('/api/tasks', authenticateToken, (req, res) => { res.json(tasks[req.user.username] || []); });
app.get('/api/events', authenticateToken, (req, res) => { res.json(manualEvents[req.user.username] || []); });
app.get('/api/subjects', authenticateToken, (req, res) => {
    const userTasks = tasks[req.user.username] || [];
    res.json([...new Set(userTasks.map(task => task.subject))]);
});
app.get('/api/grades', authenticateToken, (req, res) => { res.json(grades[req.user.username] || []); });
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
        extendedProps: { type: 'manual' }, color: '#f06595', backgroundColor: '#f06595', borderColor: '#f06595', display: 'block'
    };
    manualEvents[req.user.username].push(newEvent);
    res.status(201).json(newEvent);
});
app.post('/api/grades', authenticateToken, (req, res) => {
    const { topic, score, outOf } = req.body;
    const newGrade = { id: Date.now(), topic, score: parseFloat(score), outOf: parseFloat(outOf), date: new Date().toISOString() };
    grades[req.user.username].push(newGrade);
    res.status(201).json(newGrade);
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
    task.dailyProgress[date] = { hours, completed };
    res.status(200).json({ message: 'Progress updated.' });
});

app.get('/api/planner', authenticateToken, (req, res) => {
    const { username } = req.user;
    const userTasks = tasks[username] || [];
    const userManualEvents = manualEvents[username] || [];
    let availability = users[username]?.availability || [];

    if (availability.length === 0) {
        availability = [ { day: 'Sunday', enabled: true }, { day: 'Monday', enabled: true }, { day: 'Tuesday', enabled: true }, { day: 'Wednesday', enabled: true }, { day: 'Thursday', enabled: true }, { day: 'Friday', enabled: true }, { day: 'Saturday', enabled: true } ];
    }
    
    const todayString = new Date().toISOString().split('T')[0];
    let allCalendarEvents = [...userManualEvents];

    for (const task of userTasks) {
        // **FIX 1: Add a separate, dedicated event for the deadline day**
        allCalendarEvents.push({
            id: `deadline-${task.id}`,
            title: `Deadline: ${task.subject}`,
            start: task.deadline,
            allDay: true,
            backgroundColor: 'transparent',
            borderColor: '#e03131',
            textColor: '#e03131',
            extendedProps: { type: 'deadline' }
        });
        
        const completedHours = Object.values(task.dailyProgress).filter(p => p.completed).reduce((sum, p) => sum + p.hours, 0);
        const remainingHours = task.hours - completedHours;

        if (remainingHours <= 0) continue;

        const schedulingStartDateString = task.startDate > todayString ? task.startDate : todayString;
        
        const futureWorkDays = [];
        let dayIterator = new Date(schedulingStartDateString + 'T00:00:00Z');
        // **FIX 1 Cont'd: Stop iterating ONE DAY BEFORE the deadline**
        const deadlineDate = new Date(task.deadline + 'T00:00:00Z');
        const dayBeforeDeadline = new Date(deadlineDate);
        dayBeforeDeadline.setUTCDate(dayBeforeDeadline.getUTCDate() - 1);

        while (dayIterator <= dayBeforeDeadline) {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIterator.getUTCDay()];
            const dateStr = dayIterator.toISOString().split('T')[0];
            if (availability.find(d => d.day === dayName)?.enabled && !task.dailyProgress[dateStr]?.completed) {
                futureWorkDays.push(new Date(dayIterator));
            }
            dayIterator.setUTCDate(dayIterator.getUTCDate() + 1);
        }

        const hoursPerFutureDay = futureWorkDays.length > 0 ? remainingHours / futureWorkDays.length : 0;
        
        let loopDay = new Date(task.startDate + 'T00:00:00Z');
        while(loopDay <= dayBeforeDeadline) { // Also stop loop before deadline
            const dateString = loopDay.toISOString().split('T')[0];
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][loopDay.getUTCDay()];
            const isWorkDay = availability.find(d => d.day === dayName)?.enabled;

            if(isWorkDay) {
                let hoursForDisplay;
                let progressForDay = task.dailyProgress[dateString];
                
                if (dateString < todayString) {
                    hoursForDisplay = progressForDay?.hours || 0; 
                } else { 
                    if (progressForDay?.completed) {
                        hoursForDisplay = progressForDay.hours;
                    } else {
                        hoursForDisplay = hoursPerFutureDay;
                        if (progressForDay) {
                            progressForDay.hours = hoursForDisplay;
                        } else {
                            task.dailyProgress[dateString] = { hours: hoursForDisplay, completed: false };
                        }
                    }
                }
                
                progressForDay = task.dailyProgress[dateString];
                const isComplete = progressForDay?.completed || false;
                
                let backgroundColor = isComplete ? '#a7d8a9' : '#a9c1ff';
                if (!isComplete && dateString < todayString) {
                    backgroundColor = '#e9ecef';
                }

                allCalendarEvents.push({
                    id: `task-${task.id}-${dateString}`,
                    title: `${task.subject} (${hoursForDisplay.toFixed(1)}hr)`,
                    start: dateString,
                    allDay: true,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor,
                    extendedProps: {
                        type: 'task',
                        taskId: task.id,
                        date: dateString,
                        hours: hoursForDisplay,
                        isComplete: isComplete,
                    },
                });
            }
            loopDay.setUTCDate(loopDay.getUTCDate() + 1);
        }
    }
    res.json(allCalendarEvents);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));