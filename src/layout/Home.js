/* global BigInt */
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();
  const resultData = location.state?.resultData;
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  // userInfo 파싱
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userInfo")) || null;
    } catch {
      return null;
    }
  }, []);

  const accessToken = userInfo?.accessToken;

  // 상태 관리
  const [ticks, setTicks] = useState(null);
  const [payload, setPayload] = useState(null);

  // JWT 파싱 후 ticks 추출
  useEffect(() => {
    if (!accessToken) return;
    try {
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      setPayload(parsed);
      if (parsed?.Ticks) setTicks(parsed.Ticks);
    } catch (e) {
      console.error("JWT 파싱 실패", e);
    }
  }, [accessToken]);

  // Ticks → 만료 일시 Date 객체 반환 (UTC 기준)
  const ticksToUtcDate = (ticksStr) => {
    try {
      const ticks = BigInt(ticksStr);
      const epochTicks = BigInt("621355968000000000");
      const msSinceEpoch = (ticks - epochTicks) / BigInt(10000);
      return new Date(Number(msSinceEpoch));
    } catch {
      return null;
    }
  };

  // 남은 시간 업데이트
  useEffect(() => {
    if (!ticks) return;

    const updateRemain = () => {
      const expireDate = ticksToUtcDate(ticks);
    };

    updateRemain();
    const interval = setInterval(updateRemain, 1000);
    return () => clearInterval(interval);
  }, [ticks]);

  // Refresh Token 사용 토큰 갱신
  const handleRefreshToken = async () => {
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
        sessionStorage.setItem("userInfo", JSON.stringify(data));
        window.location.reload();
      } else {
        alert("세션이 만료되어 로그아웃됩니다.");
        sessionStorage.removeItem("userInfo");
        navigate("/login");
      }
    } catch {
      alert("토큰 갱신 중 오류 발생");
      sessionStorage.removeItem("userInfo");
      navigate("/login");
    }
  };

  // 로그아웃
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
      sessionStorage.removeItem("userInfo");
      navigate("/login");
    } catch {
      alert("API 요청 중 오류 발생");
    }
  };

  // Ticks → 만료 일시 포맷 (UTC 기준)
  const formatExpireDateUtc = (ticksStr) => {
    try {
      const ticks = BigInt(ticksStr);
      const epochTicks = BigInt("621355968000000000");
      const msSinceEpoch = (ticks - epochTicks) / BigInt(10000);
      const date = new Date(Number(msSinceEpoch));
      const pad = (n) => n.toString().padStart(2, "0");
      const year = date.getUTCFullYear();
      const month = pad(date.getUTCMonth() + 1);
      const day = pad(date.getUTCDate());
      const hours = pad(date.getUTCHours());
      const minutes = pad(date.getUTCMinutes());
      const seconds = pad(date.getUTCSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return "Invalid Ticks";
    }
  };

  // 남은 시간 계산 함수 (UTC 기준)
  const getRemainTextUtc = (ticksStr) => {
    try {
      const expireDate = ticksToUtcDate(ticksStr);
      if (!expireDate) return "";
      const now = new Date();
      const diffMs = expireDate.getTime() - now.getTime();
      if (diffMs <= 0) return "만료됨";
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600) - 9;
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      let result = "";
      if (days > 0) result += `${days}일 `;
      result += `${hours}시간 ${minutes}분 ${seconds}초`;
      return result;
    } catch {
      return "";
    }
  };

  // 만료 일시와 남은 시간 상태 추가
  const [expireDateStr, setExpireDateStr] = useState("");
  const [remainText, setRemainText] = useState("");

  useEffect(() => {
    if (!ticks) return;
    const updateExpireInfo = () => {
      setExpireDateStr(formatExpireDateUtc(ticks));
      setRemainText(getRemainTextUtc(ticks));
    };
    updateExpireInfo();
    const interval = setInterval(updateExpireInfo, 1000);
    return () => clearInterval(interval);
  }, [ticks]);

  // resultData 상태로 관리
  const [resultDataState, setResultDataState] = useState(resultData);

  // resultData 새로고침 함수
  const handleRefreshResultData = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/authentication`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResultDataState(data);
      } else {
        alert("데이터를 불러오지 못했습니다.");
      }
    } catch {
      alert("새로고침 중 오류 발생");
    }
  };

  const expiredRef = useRef(false);
  useEffect(() => {
    if (!ticks) return;
    let expireDate = ticksToUtcDate(ticks);
    if (expireDate) {
      expireDate = new Date(expireDate.getTime() - 9 * 60 * 60 * 1000); // 9시간 빼기
    }
    expiredRef.current = false; // ticks가 바뀌면 초기화
    const checkExpire = () => {
      if (expiredRef.current) return;
      const now = new Date();
      if (expireDate && now > expireDate) {
        expiredRef.current = true;
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        sessionStorage.removeItem("userInfo");
        navigate("/login");
      }
    };
    checkExpire();
    const interval = setInterval(checkExpire, 1000);
    return () => clearInterval(interval);
  }, [ticks, navigate]);

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
        {resultDataState
          ? JSON.stringify(resultDataState, null, 2).replace(/"/g, "")
          : "전달된 데이터가 없습니다."}
      </pre>
      <button
        style={{
          background: "#1976d2",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: "10px 18px",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 16,
          width: "100%",
        }}
        onClick={handleRefreshResultData}
      >
        새로고침
      </button>

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
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#888", fontWeight: 500, fontSize: 14 }}>
              만료 일시
            </div>
            <div style={{ color: "#1976d2", fontWeight: 500, fontSize: 16 }}>
              {expireDateStr}
            </div>
            <div
              style={{
                color: "#888",
                fontWeight: 500,
                fontSize: 14,
                marginTop: 8,
              }}
            >
              남은 시간
            </div>
            <div style={{ color: "#1976d2", fontWeight: 500, fontSize: 16 }}>
              {remainText}
            </div>
          </div>
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
