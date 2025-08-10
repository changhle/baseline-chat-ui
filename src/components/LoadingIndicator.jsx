import React from 'react'
import { Bot } from 'lucide-react'

const LoadingIndicator = () => {
  return (
    <div className="loading-indicator">
      <div className="loading-avatar">
        <Bot size={16} />
      </div>
      <div className="loading-content">
        <div className="loading-bubble">
          <div className="loading-dots">
            <div className="loading-dots-animation">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <span className="loading-text">생각하고 있어요...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingIndicator