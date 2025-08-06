// server/server.js --- FINAL, COMPLETE, AND WORKING VERSION

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- INITIALIZATION ---
const app = express();
const PORT = 5050;
const JWT_SECRET = 'your-super-secret-key-for-jwt';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE ---
let users = {};
let tasks = {};
let manualEvents = {};
let grades = {};

// --- AUTHENTICATION MIDDLEWARE DEFINITION ---
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

// --- PUBLIC ROUTES (No Token Needed) ---
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

// --- PUBLIC GEMINI AI ROUTE ---
// This is placed BEFORE the authentication middleware to bypass the token check.
app.post('/api/gemini/query', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required.' });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const fullPrompt = `You are a helpful study assistant. The user's question is: "${prompt}"`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });

    } catch (error) {
        console.error("--- ERROR IN PUBLIC /api/gemini/query ROUTE ---");
        console.error(error);
        res.status(500).json({ message: 'Failed to get a response from the AI.' });
    }
});


// --- PROTECTED ROUTES (Token Required) ---
// All routes below this line are protected by the authenticateToken middleware
app.use(authenticateToken);

app.get('/api/users/me', (req, res) => { res.json({ name: users[req.user.username]?.name || req.user.username }); });
app.get('/api/availability', (req, res) => {
    const { username } = req.user;
    if (!users[username]) {
        return res.status(404).json({ message: "User not found." });
    }
    
    // Send back the user's saved availability array, or an empty array if none exists
    const availability = users[username].availability || [];
    //console.log(`Fetched availability for ${username}`);
    res.status(200).json(availability);
});
app.post('/api/availability', (req, res) => {
    const { username } = req.user;
    const { availability } = req.body;

    if (!users[username]) {
        return res.status(404).json({ message: "User not found." });
    }
    if (!availability) {
        return res.status(400).json({ message: "Availability data is required." });
    }

    // Save the availability to the user's object in our "database"
    users[username].availability = availability;

    //console.log(`Updated availability for ${username}`);
    res.status(200).json({ message: 'Availability saved successfully!' });
});

app.get('/api/tasks', (req, res) => { res.json(tasks[req.user.username] || []); });

app.post('/api/tasks', (req, res) => {
    const { subject, startDate, deadline, hours } = req.body;
    const newTask = {
        id: Date.now(), subject, startDate, deadline, hours: parseInt(hours),
        createdAt: new Date().toISOString().split('T')[0],
        completed: false, dailyProgress: {}
    };
    tasks[req.user.username].push(newTask);
    res.status(201).json(newTask);
});

app.delete('/api/tasks/:id', (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.id, 10);
    tasks[username] = (tasks[username] || []).filter(task => task.id !== taskId);
    res.status(200).json({ message: 'Task deleted successfully' });
});

app.post('/api/tasks/:taskId/progress', (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.taskId, 10);
    const { date, hours, completed } = req.body;
    const task = (tasks[username] || []).find(t => t.id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.dailyProgress[date] = { hours, completed };
    res.status(200).json({ message: 'Progress updated.' });
});

app.get('/api/events', (req, res) => { res.json(manualEvents[req.user.username] || []); });

app.post('/api/events', (req, res) => {
    const { name, date, startTime, endTime } = req.body;
    const newEvent = {
        id: `manual-${Date.now()}`, title: name, start: `${date}T${startTime}`, end: `${date}T${endTime}`,
        extendedProps: { type: 'manual' }, color: '#f06595', backgroundColor: '#f06595', borderColor: '#f06595', display: 'block'
    };
    manualEvents[req.user.username].push(newEvent);
    res.status(201).json(newEvent);
});

app.get('/api/grades', (req, res) => { res.json(grades[req.user.username] || []); });

app.post('/api/grades', (req, res) => {
    // Add 'semester' to the destructured body
    const { topic, score, outOf, semester } = req.body;
    if (!semester) {
        return res.status(400).json({ message: 'Semester is required.' });
    }
    const newGrade = { 
        id: Date.now(), 
        topic, 
        semester, // <-- Save the semester
        score: parseFloat(score), 
        outOf: parseFloat(outOf), 
        date: new Date().toISOString() 
    };
    grades[req.user.username].push(newGrade);
    res.status(201).json(newGrade);
});

// In server/server.js

app.get('/api/planner', (req, res) => {
    const { username } = req.user;
    const userTasks = tasks[username] || [];
    const userManualEvents = manualEvents[username] || [];
    
    // Use the saved availability from the user object
    let availability = users[username]?.availability;

    // If no availability is saved, create and use a default one
    if (!availability || availability.length === 0) {
        availability = [
            { day: 'Sunday', startTime: '10:00', endTime: '14:00', enabled: true },
            { day: 'Monday', startTime: '18:00', endTime: '20:00', enabled: true },
            { day: 'Tuesday', startTime: '18:00', endTime: '20:00', enabled: true },
            { day: 'Wednesday', startTime: '18:00', endTime: '20:00', enabled: true },
            { day: 'Thursday', startTime: '18:00', endTime: '20:00', enabled: true },
            { day: 'Friday', startTime: '17:00', endTime: '21:00', enabled: true },
            { day: 'Saturday', startTime: '10:00', endTime: '14:00', enabled: true },
        ];
    }
    
    let allCalendarEvents = [...userManualEvents];

    for (const task of userTasks) {
        allCalendarEvents.push({
            id: `deadline-${task.id}`,
            title: `Deadline: ${task.subject}`,
            start: task.deadline,
            allDay: true,
            backgroundColor: 'transparent',
            borderColor: '#e03131',
            textColor: '#e03131',
            classNames: ['deadline-event'],
            extendedProps: { type: 'deadline' }
        });
        
        const completedHours = Object.values(task.dailyProgress).filter(p => p.completed).reduce((sum, p) => sum + p.hours, 0);
        const remainingHours = task.hours - completedHours;

        if (remainingHours <= 0) continue;

        const todayString = new Date().toISOString().split('T')[0];
        const schedulingStartDateString = task.startDate > todayString ? task.startDate : todayString;
        
        const futureWorkDays = [];
        let dayIterator = new Date(schedulingStartDateString + 'T00:00:00Z');
        const deadlineDate = new Date(task.deadline + 'T00:00:00Z');
        const dayBeforeDeadline = new Date(deadlineDate);
        dayBeforeDeadline.setUTCDate(dayBeforeDeadline.getUTCDate() - 1);

        while (dayIterator <= dayBeforeDeadline) {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIterator.getUTCDay()];
            const dateStr = dayIterator.toISOString().split('T')[0];
            const dayAvailability = availability.find(d => d.day === dayName);

            if (dayAvailability?.enabled && !task.dailyProgress[dateStr]?.completed) {
                // We don't need to store the settings here, just the date
                futureWorkDays.push(new Date(dayIterator));
            }
            dayIterator.setUTCDate(dayIterator.getUTCDate() + 1);
        }

        const hoursPerFutureDay = futureWorkDays.length > 0 ? remainingHours / futureWorkDays.length : 0;
        
        let loopDay = new Date(task.startDate + 'T00:00:00Z');
        while(loopDay <= dayBeforeDeadline) {
            const dateString = loopDay.toISOString().split('T')[0];
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][loopDay.getUTCDay()];
            const dayAvailability = availability.find(d => d.day === dayName);
            const isWorkDay = dayAvailability?.enabled;

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
                
                if (hoursForDisplay <= 0) continue;

                progressForDay = task.dailyProgress[dateString];
                const isComplete = progressForDay?.completed || false;
                
                let backgroundColor = isComplete ? '#a7d8a9' : '#a9c1ff';
                if (!isComplete && dateString < todayString) {
                    backgroundColor = '#e9ecef';
                }

                const eventStart = new Date(`${dateString}T${dayAvailability.startTime}:00`);
                // Ensure end time calculation is robust
                const eventEnd = new Date(eventStart.getTime() + (hoursForDisplay * 60 * 60 * 1000));

                allCalendarEvents.push({
                    id: `task-${task.id}-${dateString}`,
                    title: `${task.subject} (${hoursForDisplay.toFixed(1)}hr)`,
                    start: eventStart.toISOString(),
                    end: eventEnd.toISOString(),
                    allDay: false,
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

// --- SERVER START ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));