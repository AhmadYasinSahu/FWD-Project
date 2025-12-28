import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">Applications</h2>
        
        <div className="table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Download Document</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Application ID</td>
                <td>Download Document</td>
                <td>Status</td>
                <td>Date</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 