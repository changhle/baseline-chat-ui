import React, { useEffect, useRef } from "react";
import { Trash2, RefreshCw, FileText } from "lucide-react";
import MessageItem from "./MessageItem";
import LoadingIndicator from "./LoadingIndicator";

const ChatContainer = ({
  messages,
  isLoading,
  onClearChat,
  selectedPDF,
  onResetApp,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1 className="chat-title">Baseline</h1>
          {selectedPDF && (
            <div className="selected-pdf-info">
              <FileText size={16} />
              <span>{selectedPDF.name}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          {selectedPDF && (
            <button
              onClick={onResetApp}
              className="reset-button"
              title="다른 PDF 선택"
            >
              <RefreshCw size={16} />
              PDF 변경
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div>
              <h2>안녕하세요!</h2>
              {selectedPDF ? (
                <p>"{selectedPDF.name}" 문서에 대해 질문해주세요.</p>
              ) : (
                <p>무엇을 도와드릴까요?</p>
              )}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))
        )}

        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  );
};

export default ChatContainer;
