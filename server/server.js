// // server/server.js --- FINAL, COMPLETE, AND WORKING VERSION

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // --- INITIALIZATION ---
// const app = express();
// const PORT = 5050;
// const JWT_SECRET = 'your-super-secret-key-for-jwt';
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // --- MIDDLEWARE SETUP ---
// app.use(cors());
// app.use(bodyParser.json());

// // --- IN-MEMORY DATABASE ---
// let users = {};
// let tasks = {};
// let manualEvents = {};
// let grades = {};

// // --- AUTHENTICATION MIDDLEWARE DEFINITION ---
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null) return res.sendStatus(401);
//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// };

// // --- PUBLIC ROUTES (No Token Needed) ---
// app.post('/api/auth/signup', (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
//     if (users[username]) return res.status(400).json({ message: 'User already exists' });
//     users[username] = { password, availability: [], name: username };
//     tasks[username] = [];
//     manualEvents[username] = [];
//     grades[username] = [];
//     res.status(201).json({ message: 'User created successfully' });
// });

// app.post('/api/auth/login', (req, res) => {
//     const { username, password } = req.body;
//     const user = users[username];
//     if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
//     const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
//     res.json({ accessToken, username });
// });

// // --- PUBLIC GEMINI AI ROUTE ---
// // This is placed BEFORE the authentication middleware to bypass the token check.
// app.post('/api/gemini/query', async (req, res) => {
//     try {
//         const { prompt } = req.body;
//         if (!prompt) {
//             return res.status(400).json({ message: 'Prompt is required.' });
//         }
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
//         const fullPrompt = `You are a helpful study assistant. The user's question is: "${prompt}"`;

//         const result = await model.generateContent(fullPrompt);
//         const response = await result.response;
//         const text = response.text();
//         res.json({ reply: text });

//     } catch (error) {
//         console.error("--- ERROR IN PUBLIC /api/gemini/query ROUTE ---");
//         console.error(error);
//         res.status(500).json({ message: 'Failed to get a response from the AI.' });
//     }
// });


// // --- PROTECTED ROUTES (Token Required) ---
// // All routes below this line are protected by the authenticateToken middleware
// app.use(authenticateToken);

// app.get('/api/users/me', (req, res) => { res.json({ name: users[req.user.username]?.name || req.user.username }); });
// app.get('/api/availability', (req, res) => {
//     const { username } = req.user;
//     if (!users[username]) {
//         return res.status(404).json({ message: "User not found." });
//     }
    
//     // Send back the user's saved availability array, or an empty array if none exists
//     const availability = users[username].availability || [];
//     //console.log(`Fetched availability for ${username}`);
//     res.status(200).json(availability);
// });
// app.post('/api/availability', (req, res) => {
//     const { username } = req.user;
//     const { availability } = req.body;

//     if (!users[username]) {
//         return res.status(404).json({ message: "User not found." });
//     }
//     if (!availability) {
//         return res.status(400).json({ message: "Availability data is required." });
//     }

//     // Save the availability to the user's object in our "database"
//     users[username].availability = availability;

//     //console.log(`Updated availability for ${username}`);
//     res.status(200).json({ message: 'Availability saved successfully!' });
// });

// app.get('/api/tasks', (req, res) => { res.json(tasks[req.user.username] || []); });

// app.post('/api/tasks', (req, res) => {
//     const { subject, startDate, deadline, hours } = req.body;
//     const newTask = {
//         id: Date.now(), subject, startDate, deadline, hours: parseInt(hours),
//         createdAt: new Date().toISOString().split('T')[0],
//         completed: false, dailyProgress: {}
//     };
//     tasks[req.user.username].push(newTask);
//     res.status(201).json(newTask);
// });

// app.delete('/api/tasks/:id', (req, res) => {
//     const { username } = req.user;
//     const taskId = parseInt(req.params.id, 10);
//     tasks[username] = (tasks[username] || []).filter(task => task.id !== taskId);
//     res.status(200).json({ message: 'Task deleted successfully' });
// });

// app.post('/api/tasks/:taskId/progress', (req, res) => {
//     const { username } = req.user;
//     const taskId = parseInt(req.params.taskId, 10);
//     const { date, hours, completed } = req.body;
//     const task = (tasks[username] || []).find(t => t.id === taskId);
//     if (!task) return res.status(404).json({ message: 'Task not found' });
//     task.dailyProgress[date] = { hours, completed };
//     res.status(200).json({ message: 'Progress updated.' });
// });

// app.get('/api/events', (req, res) => { res.json(manualEvents[req.user.username] || []); });

// app.post('/api/events', (req, res) => {
//     const { name, date, startTime, endTime } = req.body;
//     const newEvent = {
//         id: `manual-${Date.now()}`, title: name, start: `${date}T${startTime}`, end: `${date}T${endTime}`,
//         extendedProps: { type: 'manual' }, color: '#f06595', backgroundColor: '#f06595', borderColor: '#f06595', display: 'block'
//     };
//     manualEvents[req.user.username].push(newEvent);
//     res.status(201).json(newEvent);
// });

// app.get('/api/grades', (req, res) => { res.json(grades[req.user.username] || []); });

// app.post('/api/grades', (req, res) => {
//     // Add 'semester' to the destructured body
//     const { topic, score, outOf, semester } = req.body;
//     if (!semester) {
//         return res.status(400).json({ message: 'Semester is required.' });
//     }
//     const newGrade = { 
//         id: Date.now(), 
//         topic, 
//         semester, // <-- Save the semester
//         score: parseFloat(score), 
//         outOf: parseFloat(outOf), 
//         date: new Date().toISOString() 
//     };
//     grades[req.user.username].push(newGrade);
//     res.status(201).json(newGrade);
// });

// // In server/server.js

// app.get('/api/planner', (req, res) => {
//     const { username } = req.user;
//     const userTasks = tasks[username] || [];
//     const userManualEvents = manualEvents[username] || [];
    
//     // Use the saved availability from the user object
//     let availability = users[username]?.availability;

//     // If no availability is saved, create and use a default one
//     if (!availability || availability.length === 0) {
//         availability = [
//             { day: 'Sunday', startTime: '10:00', endTime: '14:00', enabled: true },
//             { day: 'Monday', startTime: '18:00', endTime: '20:00', enabled: true },
//             { day: 'Tuesday', startTime: '18:00', endTime: '20:00', enabled: true },
//             { day: 'Wednesday', startTime: '18:00', endTime: '20:00', enabled: true },
//             { day: 'Thursday', startTime: '18:00', endTime: '20:00', enabled: true },
//             { day: 'Friday', startTime: '17:00', endTime: '21:00', enabled: true },
//             { day: 'Saturday', startTime: '10:00', endTime: '14:00', enabled: true },
//         ];
//     }
    
//     let allCalendarEvents = [...userManualEvents];

//     for (const task of userTasks) {
//         allCalendarEvents.push({
//             id: `deadline-${task.id}`,
//             title: `Deadline: ${task.subject}`,
//             start: task.deadline,
//             allDay: true,
//             backgroundColor: 'transparent',
//             borderColor: '#e03131',
//             textColor: '#e03131',
//             classNames: ['deadline-event'],
//             extendedProps: { type: 'deadline' }
//         });
        
//         const completedHours = Object.values(task.dailyProgress).filter(p => p.completed).reduce((sum, p) => sum + p.hours, 0);
//         const remainingHours = task.hours - completedHours;

//         if (remainingHours <= 0) continue;

//         const todayString = new Date().toISOString().split('T')[0];
//         const schedulingStartDateString = task.startDate > todayString ? task.startDate : todayString;
        
//         const futureWorkDays = [];
//         let dayIterator = new Date(schedulingStartDateString + 'T00:00:00Z');
//         const deadlineDate = new Date(task.deadline + 'T00:00:00Z');
//         const dayBeforeDeadline = new Date(deadlineDate);
//         dayBeforeDeadline.setUTCDate(dayBeforeDeadline.getUTCDate() - 1);

//         while (dayIterator <= dayBeforeDeadline) {
//             const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIterator.getUTCDay()];
//             const dateStr = dayIterator.toISOString().split('T')[0];
//             const dayAvailability = availability.find(d => d.day === dayName);

//             if (dayAvailability?.enabled && !task.dailyProgress[dateStr]?.completed) {
//                 // We don't need to store the settings here, just the date
//                 futureWorkDays.push(new Date(dayIterator));
//             }
//             dayIterator.setUTCDate(dayIterator.getUTCDate() + 1);
//         }

//         const hoursPerFutureDay = futureWorkDays.length > 0 ? remainingHours / futureWorkDays.length : 0;
        
//         let loopDay = new Date(task.startDate + 'T00:00:00Z');
//         while(loopDay <= dayBeforeDeadline) {
//             const dateString = loopDay.toISOString().split('T')[0];
//             const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][loopDay.getUTCDay()];
//             const dayAvailability = availability.find(d => d.day === dayName);
//             const isWorkDay = dayAvailability?.enabled;

//             if(isWorkDay) {
//                 let hoursForDisplay;
//                 let progressForDay = task.dailyProgress[dateString];
                
//                 if (dateString < todayString) {
//                     hoursForDisplay = progressForDay?.hours || 0; 
//                 } else { 
//                     if (progressForDay?.completed) {
//                         hoursForDisplay = progressForDay.hours;
//                     } else {
//                         hoursForDisplay = hoursPerFutureDay;
//                         if (progressForDay) {
//                             progressForDay.hours = hoursForDisplay;
//                         } else {
//                             task.dailyProgress[dateString] = { hours: hoursForDisplay, completed: false };
//                         }
//                     }
//                 }
                
//                 if (hoursForDisplay <= 0) continue;

//                 progressForDay = task.dailyProgress[dateString];
//                 const isComplete = progressForDay?.completed || false;
                
//                 let backgroundColor = isComplete ? '#a7d8a9' : '#a9c1ff';
//                 if (!isComplete && dateString < todayString) {
//                     backgroundColor = '#e9ecef';
//                 }

//                 const eventStart = new Date(`${dateString}T${dayAvailability.startTime}:00`);
//                 // Ensure end time calculation is robust
//                 const eventEnd = new Date(eventStart.getTime() + (hoursForDisplay * 60 * 60 * 1000));

//                 allCalendarEvents.push({
//                     id: `task-${task.id}-${dateString}`,
//                     title: `${task.subject} (${hoursForDisplay.toFixed(1)}hr)`,
//                     start: eventStart.toISOString(),
//                     end: eventEnd.toISOString(),
//                     allDay: false,
//                     backgroundColor: backgroundColor,
//                     borderColor: backgroundColor,
//                     extendedProps: {
//                         type: 'task',
//                         taskId: task.id,
//                         date: dateString,
//                         hours: hoursForDisplay,
//                         isComplete: isComplete,
//                     },
//                 });
//             }
//             loopDay.setUTCDate(loopDay.getUTCDate() + 1);
//         }
//     }
//     res.json(allCalendarEvents);
// });

// // --- SERVER START ---
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// server/server.js --- FINAL, COMPLETE, AND WORKING VERSION with MongoDB Atlas

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose'); // NEW: Mongoose for MongoDB

// NEW: Load the Mongoose Models
const User = require('./models/User');
const Task = require('./models/Task');
const ManualEvent = require('./models/ManualEvent');
const Grade = require('./models/Grade');

// --- INITIALIZATION ---
const app = express();
const PORT = 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-jwt';
const MONGO_URI = process.env.MONGO_URI; // Get URI from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- MONGODB CONNECTION SETUP ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE (REMOVED/COMMENTED OUT) ---
/*
let users = {};
let tasks = {};
let manualEvents = {};
let grades = {};
*/

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

app.post('/api/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        
        // 1. Create the User Document
        const newUser = new User({ username, password, name: username, availability: [] });
        await newUser.save();
        
        // 2. Initialize the four collections for the new user
        // This ensures a document exists for all future pushes
        await Task.create({ username, tasks: [] });
        await ManualEvent.create({ username, events: [] });
        await Grade.create({ username, grades: [] });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
        
        const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken, username });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- PUBLIC GEMINI AI ROUTE (Remains the same as it doesn't touch local state/DB) ---
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
app.use(authenticateToken);

app.get('/api/users/me', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        res.json({ name: user?.name || req.user.username });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user data.' });
    }
});

// --- AVAILABILITY ROUTES ---
app.get('/api/availability', async (req, res) => {
    const { username } = req.user;
    try {
        const user = await User.findOne({ username }).select('availability');
        if (!user) return res.status(404).json({ message: "User not found." });
        
        const availability = user.availability || [];
        res.status(200).json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch availability.' });
    }
});

app.post('/api/availability', async (req, res) => {
    const { username } = req.user;
    const { availability } = req.body;

    if (!availability) return res.status(400).json({ message: "Availability data is required." });

    try {
        const result = await User.findOneAndUpdate(
            { username },
            { $set: { availability: availability } },
            { new: true }
        );

        if (!result) return res.status(404).json({ message: "User not found." });
        res.status(200).json({ message: 'Availability saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save availability.' });
    }
});

// --- TASK ROUTES ---
app.get('/api/tasks', async (req, res) => {
    try {
        const taskDoc = await Task.findOne({ username: req.user.username });
        res.json(taskDoc?.tasks || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks.' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { username } = req.user;
    const { subject, startDate, deadline, hours } = req.body;
    
    const newTask = {
        id: Date.now(), 
        subject, 
        startDate, 
        deadline, 
        hours: parseInt(hours),
        createdAt: new Date().toISOString().split('T')[0],
        completed: false, 
        dailyProgress: {}
    };

    try {
        const result = await Task.findOneAndUpdate(
            { username },
            { $push: { tasks: newTask } }, // $push adds the item to the array
            { new: true, upsert: true }
        );
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create task.' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.id, 10);
    
    try {
        await Task.findOneAndUpdate(
            { username },
            { $pull: { tasks: { id: taskId } } } // $pull removes the item from the array
        );
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete task.' });
    }
});

app.post('/api/tasks/:taskId/progress', async (req, res) => {
    const { username } = req.user;
    const taskId = parseInt(req.params.taskId, 10);
    const { date, hours, completed } = req.body;
    
    try {
        const updateField = `tasks.$[t].dailyProgress.${date}`;
        
        const result = await Task.findOneAndUpdate(
            { username, 'tasks.id': taskId },
            { 
                $set: { 
                    [updateField]: { hours, completed } 
                } 
            },
            {
                arrayFilters: [ { 't.id': taskId } ], // target the specific task in the array
                new: true
            }
        );

        if (!result) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Progress updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update progress.' });
    }
});

// --- EVENT ROUTES ---
app.get('/api/events', async (req, res) => {
    try {
        const eventDoc = await ManualEvent.findOne({ username: req.user.username });
        res.json(eventDoc?.events || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch events.' });
    }
});

app.post('/api/events', async (req, res) => {
    const { username } = req.user;
    const { name, date, startTime, endTime } = req.body;
    
    const newEvent = {
        id: `manual-${Date.now()}`, 
        title: name, 
        start: `${date}T${startTime}`, 
        end: `${date}T${endTime}`,
        extendedProps: { type: 'manual' }, 
        color: '#f06595', 
        backgroundColor: '#f06595', 
        borderColor: '#f06595', 
        display: 'block'
    };

    try {
        await ManualEvent.findOneAndUpdate(
            { username },
            { $push: { events: newEvent } },
            { new: true, upsert: true }
        );
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create event.' });
    }
});

// --- GRADE ROUTES ---
app.get('/api/grades', async (req, res) => {
    try {
        const gradeDoc = await Grade.findOne({ username: req.user.username });
        res.json(gradeDoc?.grades || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch grades.' });
    }
});

app.post('/api/grades', async (req, res) => {
    const { username } = req.user;
    const { topic, score, outOf, semester } = req.body;
    if (!semester) {
        return res.status(400).json({ message: 'Semester is required.' });
    }
    
    const newGrade = { 
        id: Date.now(), 
        topic, 
        semester, 
        score: parseFloat(score), 
        outOf: parseFloat(outOf), 
        date: new Date().toISOString() 
    };

    try {
        await Grade.findOneAndUpdate(
            { username },
            { $push: { grades: newGrade } },
            { new: true, upsert: true }
        );
        res.status(201).json(newGrade);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create grade.' });
    }
});

// --- PLANNER ROUTE (Requires fetching data from multiple models) ---

app.get('/api/planner', async (req, res) => {
    const { username } = req.user;
    
    try {
        // Fetch all required data in parallel for efficiency
        const [userDoc, taskDoc, eventDoc] = await Promise.all([
            User.findOne({ username }).select('availability').lean(),
            Task.findOne({ username }).lean(),
            ManualEvent.findOne({ username }).lean()
        ]);

        const userTasks = taskDoc?.tasks || [];
        const userManualEvents = eventDoc?.events || [];
        let availability = userDoc?.availability;

        // --- Original Availability Default Logic (Kept for consistency) ---
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
            
            // Note: task.dailyProgress is a Mongoose Map object, convert it to standard JS object
            const dailyProgress = task.dailyProgress ? (task.dailyProgress instanceof Map ? Object.fromEntries(task.dailyProgress) : task.dailyProgress) : {};

            const completedHours = Object.values(dailyProgress).filter(p => p.completed).reduce((sum, p) => sum + p.hours, 0);
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

                if (dayAvailability?.enabled && !dailyProgress[dateStr]?.completed) {
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
                    let progressForDay = dailyProgress[dateString];
                    
                    if (dateString < todayString) {
                        hoursForDisplay = progressForDay?.hours || 0; 
                    } else { 
                        if (progressForDay?.completed) {
                            hoursForDisplay = progressForDay.hours;
                        } else {
                            hoursForDisplay = hoursPerFutureDay;
                            // NOTE: We do NOT update the DB here, only the dailyProgress object used for *this request*
                            if (!progressForDay) {
                                progressForDay = { hours: hoursForDisplay, completed: false };
                            }
                        }
                    }
                    
                    if (hoursForDisplay <= 0) continue;

                    const isComplete = progressForDay?.completed || false;
                    
                    let backgroundColor = isComplete ? '#a7d8a9' : '#a9c1ff';
                    if (!isComplete && dateString < todayString) {
                        backgroundColor = '#e9ecef';
                    }

                    const eventStart = new Date(`${dateString}T${dayAvailability.startTime}:00`);
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
    } catch (error) {
        console.error("Planner route error:", error);
        res.status(500).json({ message: 'Failed to generate planner data.' });
    }
});
 
// --- SERVER START ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));// server/server.js --- FINAL, COMPLETE, AND WORKING VERSION with MongoDB Atlas

