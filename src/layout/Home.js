/* global BigInt */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  // 1. 라우터 및 기본 정보 세팅
  const location = useLocation();
  const resultData = location.state?.resultData;
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
  const accessToken = userInfo?.accessToken;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  const navigate = useNavigate();

  // 2. 인증 토큰 파싱(JWT에서 payload 추출 및 Ticks 값 추출)
  let ticks = null;
  let payload = null;
  if (accessToken) {
    try {
      // JWT의 payload 부분을 base64 디코딩
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      payload = JSON.parse(jsonPayload);
      if (payload.Ticks) {
        ticks = payload.Ticks;
      }
    } catch (e) {
      // 파싱 실패 시 무시
    }
  }

  // 3. 남은 시간 계산 함수 (Ticks → 남은 시간 문자열)
  const getRemainText = (ticks) => {
    try {
      const getBigInt = (v) => {
        if (typeof BigInt !== "undefined") return BigInt(v);
        if (
          typeof window !== "undefined" &&
          typeof window.BigInt !== "undefined"
        )
          return window.BigInt(v);
        throw new Error("BigInt is not supported");
      };
      const ticksBigInt = getBigInt(ticks);
      const epochTicks = getBigInt("621355968000000000");
      const msSinceEpoch = Number(
        (ticksBigInt - epochTicks) / getBigInt(10000)
      );
      const now = new Date().getTime();
      const diffMs = msSinceEpoch - now;
      if (diffMs > 0) {
        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;
        return ` ${hours}시간 ${minutes}분 ${seconds}초`;
      } else {
        return "만료됨";
      }
    } catch {
      return "";
    }
  };

  // 4. 1초마다 남은 시간 갱신 (state 관리)
  const [ticksRemainText, setTicksRemainText] = useState(
    ticks ? getRemainText(ticks) : ""
  );
  useEffect(() => {
    if (!ticks) return;
    setTicksRemainText(getRemainText(ticks));
    const interval = setInterval(() => {
      setTicksRemainText(getRemainText(ticks));
    }, 1000);
    return () => clearInterval(interval);
  }, [ticks]);

  // 5. access token 갱신 함수 (refresh token 사용)
  const handleRefreshToken = async () => {
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    const refreshToken = userInfo?.refreshToken;
    if (!refreshToken) {
      alert("refresh token이 없습니다. 다시 로그인 해주세요.");
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/authentication/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("data : ", data);
        debugger;
        sessionStorage.setItem("userInfo", JSON.stringify(data));
        window.location.reload();
      } else {
        alert("세션이 만료되어 로그아웃됩니다.");
        sessionStorage.removeItem("userInfo");
        navigate("/login");
      }
    } catch (e) {
      alert("토큰 갱신 중 오류 발생");
      sessionStorage.removeItem("userInfo");
      navigate("/login");
    }
  };

  // 6. 로그아웃 함수
  const handleLogout = async () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmLogout) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/Logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        alert("로그아웃을 실패했습니다!");
        return;
      }
      navigate("/login");
    } catch (err) {
      alert("API 요청 중 오류 발생");
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Home</h2>

      <pre
        style={{
          background: "#f0f4fa",
          padding: 16,
          borderRadius: 8,
          width: 400,
          height: 200,
          overflow: "auto",
        }}
      >
        {resultData
          ? JSON.stringify(resultData, null, 2).replace(/\"/g, "")
          : "전달된 데이터가 없습니다."}
      </pre>
      {/* access token 정보 표시 */}
      {accessToken && payload && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#f0f4fa",
            borderRadius: 8,
            padding: "12px 20px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* 만료까지 남은 시간 강조 표시 */}
          {ticksRemainText && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#888",
                  fontWeight: 400,
                  marginBottom: 2,
                }}
              >
                만료까지 남은 시간
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: ticksRemainText.includes("만료")
                    ? "#d32f2f"
                    : "#1976d2",
                  letterSpacing: 1,
                }}
              >
                {ticksRemainText}
              </span>
            </div>
          )}
          {/* 토큰 갱신 버튼 */}
          <button
            style={{
              background: "#1976d2",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px 20px",
              fontSize: 15,
              borderRadius: 6,
              fontWeight: 500,
              transition: "background 0.2s",
              marginRight: 20,
            }}
            onClick={handleRefreshToken}
          >
            토큰 갱신
          </button>
        </div>
      )}
      <button
        style={{
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
          padding: 0,
          marginTop: 16,
          fontSize: 15,
          textDecoration: "underline",
        }}
        onClick={handleLogout}
      >
        로그아웃
      </button>
    </div>
  );
}

export default Home;
