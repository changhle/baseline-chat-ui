import React, { useState, useRef } from "react";
import ChatContainer from "./components/ChatContainer";
import InputArea from "./components/InputArea";
import Login from "./components/Login";
import { sendMessage } from "./services/openai";
import "./App.css";

function App() {
  const [uid, setUid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const logConversationToServer = async (userMessage, assistantResponse, currentUid) => {
    const formData = new FormData();
    const payload = {
      uid: currentUid,
      user_message: {
        role: 'user',
        content: userMessage.content,
        timestamp: userMessage.timestamp.toISOString(),
      },
      assistant_message: {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
      },
    };
    formData.append('payload', JSON.stringify(payload));

    if (userMessage.files && userMessage.files.length > 0) {
      userMessage.files.forEach(fileObject => {
        if (fileObject && fileObject.file) {
          formData.append('files', fileObject.file);
        }
      });
    }

    try {
      await fetch("http://chlee.postech.ac.kr:5002/log", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error('Failed to log conversation:', error);
    }
  };

  const handleSendMessage = async (content, files = []) => {
    const userMessage = {
      role: "user",
      content,
      files,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendMessage(newMessages);
      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await logConversationToServer(userMessage, response, uid);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleLogin = async (enteredUid) => {
    setUid(enteredUid);
    setIsLoading(true);
    try {
      const response = await fetch(`http://chlee.postech.ac.kr:5002/history/${enteredUid}`);
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      const historyLogs = await response.json();
      
      const formattedMessages = historyLogs.flatMap(log => [
        {
          role: 'user',
          content: log.user_message.content,
          timestamp: new Date(log.user_message.timestamp),
          files: log.files || [],
        },
        {
          role: 'assistant',
          content: log.assistant_message.content,
          timestamp: new Date(log.assistant_message.timestamp),
        }
      ]);

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!uid) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onClearChat={clearChat}
      />
      <InputArea ref={inputRef} onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;
