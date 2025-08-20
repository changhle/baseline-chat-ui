import { useState } from "react";

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://chlee.postech.ac.kr:5002/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.answer) {
      setAnswer(data.answer);
    } else {
      setAnswer("오류: " + (data.error || "알 수 없음"));
    }
  }

  return (
    <div>
      <h2>PDF 업로드 & GPT 요약 (file_id 참조)</h2>
      <input type="file" onChange={handleUpload} accept="application/pdf" />
      {loading && <p>분석 중...</p>}
      {answer && <div style={{ whiteSpace: "pre-wrap" }}>{answer}</div>}
    </div>
  );
}
