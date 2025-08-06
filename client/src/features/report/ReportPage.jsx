// client/src/features/report/ReportPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import './ReportPage.css';

// Import chart components
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components Chart.js needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Reusable Accordion Component for each Semester ---
const SemesterSection = ({ semesterName, grades }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  const calculateSemesterAverage = () => {
    if (!grades || grades.length === 0) return 'N/A';
    const totalPercentage = grades.reduce((acc, grade) => acc + (grade.score / grade.outOf), 0);
    const average = (totalPercentage / grades.length) * 100;
    return `${average.toFixed(1)}%`;
  };
  
  const chartData = {
    labels: grades.map(g => g.topic),
    datasets: [
      {
        label: 'Percentage (%)',
        data: grades.map(g => (g.score / g.outOf) * 100),
        backgroundColor: 'rgba(132, 94, 247, 0.6)',
        borderColor: 'rgba(132, 94, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Makes it a horizontal bar chart, better for long topic names
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + "%" }
      },
    },
  };

  return (
    <div className="semester-accordion">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{semesterName}</h3>
        <span>Average: {calculateSemesterAverage()}</span>
        <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="accordion-content">
          <div className="semester-details-grid">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(grade => (
                    <tr key={grade.id}>
                      <td>{grade.topic}</td>
                      <td>{grade.score} / {grade.outOf}</td>
                      <td>{((grade.score / grade.outOf) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-container">
              <Bar options={chartOptions} data={chartData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main Report Page Component ---
const ReportPage = () => {
  const [grades, setGrades] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [topic, setTopic] = useState('');
  const [semester, setSemester] = useState('');
  const [score, setScore] = useState('');
  const [outOf, setOutOf] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get('/grades');
        setGrades(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) { console.error("Failed to fetch grades", error); } 
      finally { setIsLoading(false); }
    };
    fetchGrades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/grades', { topic, semester, score, outOf });
      setGrades(currentGrades => [response.data, ...currentGrades].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setTopic('');
      setScore('');
      setOutOf('');
      setShowAddForm(false); // Hide form after submitting
    } catch (error) { alert('Failed to add grade.'); }
  };

  const gradesBySemester = useMemo(() => {
    return grades.reduce((acc, grade) => {
      const sem = grade.semester || 'Uncategorized';
      if (!acc[sem]) { acc[sem] = []; }
      acc[sem].push(grade);
      return acc;
    }, {});
  }, [grades]);
  
  const calculateOverallAverage = () => {
    if (grades.length === 0) return 'N/A';
    const totalPercentage = grades.reduce((acc, grade) => acc + (grade.score / grade.outOf), 0);
    const average = (totalPercentage / grades.length) * 100;
    return `${average.toFixed(1)}%`;
  };

  return (
    <div className="card page-fade-in report-page-layout">
      <div className="report-main-header">
        <h2>Grade Report</h2>
        <button className="add-grade-button" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Grade'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-grade-form-popup">
          <form onSubmit={handleSubmit}>
            <h3>Add a New Grade</h3>
            <input type="text" placeholder="Semester (e.g., 'Fall 2024')" value={semester} onChange={(e) => setSemester(e.target.value)} required />
            <input type="text" placeholder="Topic or Exam Name" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <div className="score-inputs">
              <input type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} required min="0"/>
              <span>/</span>
              <input type="number" placeholder="Out of" value={outOf} onChange={(e) => setOutOf(e.target.value)} required min="1"/>
            </div>
            <button type="submit">Save Grade</button>
          </form>
        </div>
      )}
      
      <div className="report-summary">
        <h3>Overall Average: {calculateOverallAverage()}</h3>
      </div>
      
      <div className="semesters-container">
        {isLoading ? <p>Loading reports...</p> : Object.keys(gradesBySemester).length > 0 ? (
          Object.entries(gradesBySemester).map(([sem, semGrades]) => (
            <SemesterSection key={sem} semesterName={sem} grades={semGrades} />
          ))
        ) : (
          <p className="no-grades-message">No grades entered yet. Click "+ Add Grade" to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ReportPage;