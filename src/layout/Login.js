import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [account, setAccunt] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!account || !password) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account,
          password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "로그인 실패");
      } else {
        const data = await response.json();
        // 요청에 사용된 값과 응답값 콘솔 출력
        // console.log("로그인 요청 데이터:", { account, password });
        // console.log("로그인 응답 데이터:", data);

        const userInfo = data;
        // userInfo를 sessionStorage에 저장
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));

        // 로그인 성공 시 받아온 데이터로 요청 (Bearer 토큰 사용)
        try {
          const response = await fetch(`${API_BASE_URL}/api/authentication`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const resultData = await response.json();
          // console.log("/api/authentication 응답 데이터:", resultData);
          navigate("/home", { state: { resultData } });
        } catch (aaaErr) {
          console.error("/api/authentication 요청 실패:", aaaErr);
        }
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
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
