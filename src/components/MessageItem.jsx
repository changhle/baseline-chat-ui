import React from "react";
import { User, Bot } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import FilePreview from "./FilePreview";

const MessageItem = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`message-item ${isUser ? "user" : ""}`}>
      {/* Avatar */}
      <div
        className={`message-avatar ${
          isUser ? "user" : message.isError ? "error" : "assistant"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={`message-content ${isUser ? "user" : ""}`}>
        <div
          className={`message-bubble ${
            isUser ? "user" : message.isError ? "error" : "assistant"
          }`}
        >
          {/* Files */}
          {message.files && message.files.length > 0 && (
            <div className="file-previews">
              {message.files.map((file, index) => (
                <FilePreview key={index} file={file} />
              ))}
            </div>
          )}

          {/* Text Content */}
          {isUser ? (
            <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {message.content}
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Timestamp */}
        <div className={`message-timestamp ${isUser ? "user" : ""}`}>
          {message.timestamp?.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
