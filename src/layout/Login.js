import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [account, setAccunt] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!account || !password) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }
    setError("");
    alert(`로그인 시도: ${account}`);
  };

  // 텍스트 버튼 스타일
  const textBtnStyle = {
    background: "none",
    border: "none",
    color: "#1976d2",
    cursor: "pointer",
    padding: 0,
    margin: "0 8px",
    fontSize: "15px",
    textDecoration: "underline",
  };
  const dividerStyle = {
    height: "18px",
    width: "1px",
    background: "#ccc",
    alignSelf: "center",
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <button
            type="button"
            style={textBtnStyle}
            onClick={() => navigate("/register")}
          >
            회원가입
          </button>
          <div style={dividerStyle} />
          <button
            type="button"
            style={textBtnStyle}
            onClick={() => alert("아이디 찾기 기능은 준비 중입니다.")}
          >
            아이디 찾기
          </button>
          <div style={dividerStyle} />
          <button
            type="button"
            style={textBtnStyle}
            onClick={() => alert("비밀번호 찾기 기능은 준비 중입니다.")}
          >
            비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
