import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError("아이디, 비밀번호, 이름을 모두 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          name,
          userGroup: 0,
        }),
      });
      const data = await response.json();
      // 요청 데이터와 응답값 콘솔 출력
      console.log("회원가입 요청 데이터:", {
        username,
        password,
        name,
        userGroup: 0,
      });
      console.log("회원가입 응답 데이터:", data);
      if (!response.ok) {
        setError(data.message || "회원가입 실패");
      } else {
        alert("회원가입 성공: " + data.message);
        // 예시: navigate("/login");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 텍스트 버튼 스타일 (Login.js와 동일)
  const textBtnStyle = {
    background: "none",
    border: "none",
    color: "#1976d2",
    cursor: "pointer",
    padding: 0,
    marginTop: 12,
    fontSize: "15px",
    textDecoration: "underline",
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
        <button type="submit" disabled={loading}>
          {loading ? "회원가입 중..." : "회원가입"}
        </button>
        <button
          type="button"
          style={textBtnStyle}
          onClick={() => navigate("/login")}
        >
          로그인
        </button>
      </form>
    </div>
  );
}

export default Register;
