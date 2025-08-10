const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

export const sendMessage = async (
  messages,
  assistantId = null,
  fileId = null
) => {
  if (!API_KEY) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  // 메시지를 OpenAI API 형식으로 변환
  const formattedMessages = messages.map((msg) => {
    if (msg.role === "user" && msg.files && msg.files.length > 0) {
      // 파일이 있는 경우 멀티모달 형식으로 변환
      const content = [{ type: "text", text: msg.content }];

      msg.files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          content.push({
            type: "image_url",
            image_url: {
              url: file.data,
            },
          });
        }
      });

      return {
        role: msg.role,
        content: content,
      };
    }

    return {
      role: msg.role,
      content: msg.content,
    };
  });

  const requestBody = {
    model: "gpt-4o",
    messages: formattedMessages,
    max_tokens: 2000,
    temperature: 0.7,
  };

  // PDF 파일이 있는 경우 시스템 메시지 추가
  if (fileId) {
    requestBody.messages.unshift({
      role: "system",
      content: `당신은 업로드된 PDF 문서(파일 ID: ${fileId})에 대해 질문에 답하는 도우미입니다. 문서의 내용을 바탕으로 정확하고 유용한 답변을 제공하세요.`,
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

// OpenAI Files API에 파일 업로드
export const uploadFileToOpenAI = async (file) => {
  if (!API_KEY) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "assistants");

  try {
    const response = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI 파일 업로드 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("OpenAI File Upload Error:", error);
    throw error;
  }
};

// 파일 정보 조회
export const getFileInfo = async (fileId) => {
  if (!API_KEY) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  try {
    const response = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "파일 정보 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("OpenAI File Info Error:", error);
    throw error;
  }
};
