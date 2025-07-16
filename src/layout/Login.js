import React, { useState } from "react";

function Login() {
  const [account, setAccunt] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!account || !password) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }
    setError("");
    alert(`로그인 시도: ${account}`);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={account}
          onChange={(e) => setAccunt(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default Login;
