import React, { useState } from "react";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { ChevronDown } from "lucide-react";

export default function Download({ chartRef }) {
  const [open, setOpen] = useState(false);

  const downloadChart = async (format = "png") => {
    if (!chartRef.current) return;

    try {
      let dataUrl;
      if (format === "png") {
        dataUrl = await htmlToImage.toPng(chartRef.current);
      } else if (format === "jpeg") {
        dataUrl = await htmlToImage.toJpeg(chartRef.current, { quality: 0.95 });
      } else if (format === "svg") {
        dataUrl = await htmlToImage.toSvg(chartRef.current);
      }

      download(dataUrl, `chart.${format}`);
      setOpen(false); // close dropdown after download
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", marginTop: "1rem" }}>
      {/* Main Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          fontWeight: "600",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
      >
        Download Chart
        <ChevronDown style={{ marginLeft: "8px", width: "16px", height: "16px" }} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "8px",
            width: "160px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {["png", "jpeg", "svg"].map((format) => (
            <button
              key={format}
              onClick={() => downloadChart(format)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                fontSize: "14px",
                backgroundColor: "white",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
