// client/src/features/report/ReportPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import './ReportPage.css';

const ReportPage = () => {
  const [grades, setGrades] = useState([]);
  const [topic, setTopic] = useState('');
  const [score, setScore] = useState('');
  const [outOf, setOutOf] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get('/grades');
        setGrades(response.data.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by most recent
      } catch (error) {
        console.error("Failed to fetch grades", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/grades', { topic, score, outOf });
      setGrades(currentGrades => [response.data, ...currentGrades]);
      setTopic('');
      setScore('');
      setOutOf('');
    } catch (error) {
      alert('Failed to add grade. Please check your inputs.');
    }
  };
  
  const calculateOverallAverage = () => {
    if (grades.length === 0) return 'N/A';
    const totalPercentage = grades.reduce((acc, grade) => acc + (grade.score / grade.outOf), 0);
    const average = (totalPercentage / grades.length) * 100;
    return `${average.toFixed(1)}%`;
  };

  return (
    <div className="card page-fade-in">
      <h2>Grade Report</h2>
      
      <div className="report-summary">
        <h3>Overall Average: {calculateOverallAverage()}</h3>
      </div>
      
      <div className="report-content">
        <div className="add-grade-form">
          <h3>Add a New Grade</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Topic or Exam Name" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <div className="score-inputs">
              <input type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} required min="0"/>
              <span>/</span>
              <input type="number" placeholder="Out of" value={outOf} onChange={(e) => setOutOf(e.target.value)} required min="1"/>
            </div>
            <button type="submit">Add Grade</button>
          </form>
        </div>

        <div className="grades-list">
          <h3>Recent Grades</h3>
          {isLoading ? <p>Loading...</p> : grades.length > 0 ? (
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
          ) : <p>No grades entered yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;