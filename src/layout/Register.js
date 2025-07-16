import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError("아이디, 비밀번호, 이름을 모두 입력하세요.");
      return;
    }
    setError("");
    alert(`회원가입 시도: ${username}, ${name}`);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2>회원가입</h2>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">회원가입</button>
        <button
          type="button"
          className="login-btn"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/login")}
        >
          로그인
        </button>
      </form>
    </div>
  );
}

export default Register;
