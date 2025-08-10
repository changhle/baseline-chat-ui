import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [uid, setUid] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uid.trim()) {
      onLogin(uid.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>실험자 번호 입력</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="실험자 번호를 입력하세요..."
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="login-input"
            autoFocus
          />
          <button type="submit" className="login-button">
            확인
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
