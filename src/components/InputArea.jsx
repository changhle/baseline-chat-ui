import React, { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X } from "lucide-react";
import FileUpload from "./FileUpload";

const InputArea = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || files.length > 0) && !isLoading) {
      onSendMessage(message.trim() || "파일을 첨부했습니다.", files);
      setMessage("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = useCallback((newFiles) => {
    if (!newFiles || newFiles.length === 0) return;

    const processedFiles = Array.from(newFiles).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      data: null,
      file: file,
      id: Date.now() + Math.random(), // 고유 ID 추가
    }));

    // 먼저 파일 목록에 추가
    setFiles((prev) => [...prev, ...processedFiles]);

    // 그 다음 base64로 변환
    processedFiles.forEach((fileObj) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, data: e.target.result } : f
          )
        );
      };
      reader.onerror = (e) => {
        console.error("파일 읽기 오류:", e);
        setFiles((prev) => prev.filter((f) => f.id !== fileObj.id));
      };
      reader.readAsDataURL(fileObj.file);
    });
  }, []);

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = [];
    if (e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        droppedFiles.push(e.dataTransfer.files[i]);
      }
    }

    if (droppedFiles.length > 0) {
      console.log("드롭된 파일:", droppedFiles);
      handleFileSelect(droppedFiles);
    }
  };

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData.items);
    const pastedFiles = [];

    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault();
      console.log("붙여넣기된 파일:", pastedFiles);
      handleFileSelect(pastedFiles);
    }
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div
      className={isDragOver ? "input-area drag-over" : "input-area"}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-overlay-text">파일을 여기에 드롭하세요</div>
        </div>
      )}

      {files.length > 0 && (
        <div className="file-uploads">
          {files.map((file, index) => (
            <div key={index} className="file-upload-item">
              <FileUpload file={file} />
              <button
                onClick={() => handleRemoveFile(index)}
                className="remove-file"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInput={handleTextareaResize}
            placeholder="메시지를 입력하세요... (파일은 드래그앤드롭 또는 Ctrl+V로 붙여넣기)"
            className="message-input"
            rows="1"
            disabled={isLoading}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,text/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files);
            }
          }}
          className="file-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="attach-button"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="submit"
          disabled={isLoading || (!message.trim() && files.length === 0)}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default InputArea;
