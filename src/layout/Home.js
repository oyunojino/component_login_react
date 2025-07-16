import React from "react";
import { useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();
  const resultData = location.state?.resultData;

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
        onClick={() => window.location.replace("/")}
      >
        로그아웃
      </button>
    </div>
  );
}

export default Home;
