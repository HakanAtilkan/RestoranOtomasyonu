import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoginPage from './LoginPage';
import './styles.css';

function Root() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <App currentUser={user} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

