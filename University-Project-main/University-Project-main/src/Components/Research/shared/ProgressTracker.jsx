import React from 'react';
import { FaCheck } from 'react-icons/fa';

const ProgressTracker = ({ steps, onStepClick }) => {
  return (
    <div className="modern-progress-tracker">
      {steps.map((step, index) => (
        <div key={step.id} className="modern-step-container">
          <div
            className={`step-circle ${step.completed ? 'completed' : step.active ? 'active' : 'inactive'}`}
            onClick={() => onStepClick && onStepClick(step.id)}
            style={{ cursor: step.completed || step.active ? 'pointer' : 'default' }}
          >
            {step.completed ? <FaCheck /> : <span>{step.id}</span>}
          </div>
          <span className={`step-label ${step.active ? 'active' : step.completed ? 'completed' : ''}`}>
            {step.title}
          </span>
          {index < steps.length - 1 && <div className="modern-step-connector" />}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;


