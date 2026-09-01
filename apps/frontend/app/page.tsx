"use client";

import dynamic from "next/dynamic";
import Header from "./component/Header";

const Map = dynamic(() => import("./component/Map"), { ssr: false });

export default function Home() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eaf4ff",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "500px",
            backgroundColor: "#ffffff",
            border: "3px solid #1e6fd9",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Map />
        </div>
      </main>
    </>
  );
}

