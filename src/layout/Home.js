import React from "react";
import { useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();
  const resultData = location.state?.resultData;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/Logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "로그아웃 요청에 실패했습니다.");
        return; // 실패 시 이동하지 않음
      }
      window.location.replace("/"); // 성공 시에만 이동
    } catch (err) {
      alert("로그아웃 요청 중 오류가 발생했습니다.");
      // 실패 시 이동하지 않음
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Home</h2>

      <pre
        style={{
          background: "#f5f5f5",
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
