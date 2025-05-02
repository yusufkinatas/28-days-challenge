import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { showMotivationalNotification } from './notifications';

function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      showMotivationalNotification();
    }, 3600000); // Show notification every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Welcome to the 28 Days Challenge!</h1>
      <p>Track your progress and build habits together.</p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
