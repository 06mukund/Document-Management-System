import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function PDFViewer({ url }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;

    const container = containerRef.current;
    container.innerHTML = "";
    setError(null);
    setLoading(true);

    const loadPDF = async () => {
      try {
        console.log("Loading PDF from URL:", url);

        const loadingTask = getDocument(url);
        const pdf = await loadingTask.promise;

        console.log("PDF loaded, pages:", pdf.numPages);
        setLoading(false);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = "block";
          canvas.style.marginBottom = "8px";
          canvas.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

          container.appendChild(canvas);

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;
        }
      } catch (err) {
        console.error("PDF.js error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        setLoading(false);
        setError(err.message);
      }
    };

    loadPDF();
  }, [url]);

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <p style={{ color: "red" }}>PDF Error: {error}</p>
        <p style={{ color: "gray", fontSize: "12px" }}>URL: {url}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <p style={{ padding: "16px", color: "#666" }}>Loading PDF...</p>
      )}
      <div
        ref={containerRef}
        style={{ padding: "16px", backgroundColor: "#f3f4f6" }}
      />
    </div>
  );
}

export default PDFViewer;