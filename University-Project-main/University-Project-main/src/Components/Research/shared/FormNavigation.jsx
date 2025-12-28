import React from 'react';

const FormNavigation = ({ onPrev, onSaveClose, onNext, prevText = 'GO BACK', nextText = 'NEXT STEP', showSaveClose = true, nextDisabled = false }) => {
  return (
    <div className="form-navigation nav-bottom">
      <button type="button" className="nav-button prev-button" onClick={onPrev}>
        {prevText}
      </button>
      <div style={{ display: 'flex', gap: '10px' }}>
        {showSaveClose && (
          <button type="button" className="nav-button save-button" onClick={onSaveClose}>
            SAVE & CLOSE
          </button>
        )}
        {onNext && (
          <button type="button" className="nav-button next-button" onClick={onNext} disabled={nextDisabled}>
            {nextText}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;


