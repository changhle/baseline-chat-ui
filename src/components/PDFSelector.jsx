import React, { useState, useEffect } from 'react'
import { FileText, Upload, X } from 'lucide-react'

const PDFSelector = ({ onPDFSelect, onSkip }) => {
  const [selectedPDF, setSelectedPDF] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [localPDFs, setLocalPDFs] = useState([])

  // 로컬 PDF 파일들 목록 (실제로는 서버나 로컬 폴더에서 가져올 수 있음)
  useEffect(() => {
    // 예시 PDF 파일들 - 실제로는 public 폴더나 서버에서 가져와야 함
    const samplePDFs = [
      { id: 1, name: 'document1.pdf', size: '2.5MB', path: '/pdfs/document1.pdf' },
      { id: 2, name: 'report2024.pdf', size: '1.8MB', path: '/pdfs/report2024.pdf' },
      { id: 3, name: 'manual.pdf', size: '3.2MB', path: '/pdfs/manual.pdf' },
      { id: 4, name: 'presentation.pdf', size: '5.1MB', path: '/pdfs/presentation.pdf' }
    ]
    setLocalPDFs(samplePDFs)
  }, [])

  const handlePDFSelection = (pdf) => {
    setSelectedPDF(pdf)
  }

  const handleConfirmSelection = async () => {
    if (!selectedPDF) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 실제 파일을 fetch로 가져오기
      const response = await fetch(selectedPDF.path)
      if (!response.ok) {
        throw new Error('파일을 불러올 수 없습니다.')
      }

      const blob = await response.blob()
      const file = new File([blob], selectedPDF.name, { type: 'application/pdf' })

      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)

      // OpenAI Files API에 업로드
      const uploadedFile = await uploadToOpenAI(file)
      
      setUploadProgress(100)
      setTimeout(() => {
        onPDFSelect(uploadedFile, selectedPDF)
      }, 500)

    } catch (error) {
      console.error('PDF 업로드 오류:', error)
      alert('PDF 업로드 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadToOpenAI = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', 'assistants')

    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI 파일 업로드 실패')
    }

    return await response.json()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const uploadedFile = await uploadToOpenAI(file)
      
      setUploadProgress(100)
      setTimeout(() => {
        onPDFSelect(uploadedFile, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)}MB` })
      }, 500)

    } catch (error) {
      console.error('PDF 업로드 오류:', error)
      alert('PDF 업로드 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="pdf-selector-overlay">
      <div className="pdf-selector-modal">
        <div className="pdf-selector-header">
          <h2>PDF 문서 선택</h2>
          <p>대화할 PDF 문서를 선택하거나 업로드하세요</p>
          <button onClick={onSkip} className="skip-button">
            <X size={20} />
          </button>
        </div>

        {isUploading ? (
          <div className="upload-progress">
            <div className="upload-progress-bar">
              <div 
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>파일 업로드 중... {Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <>
            <div className="pdf-selector-content">
              <div className="local-pdfs">
                <h3>로컬 PDF 파일들</h3>
                <div className="pdf-list">
                  {localPDFs.map(pdf => (
                    <div 
                      key={pdf.id}
                      className={`pdf-item ${selectedPDF?.id === pdf.id ? 'selected' : ''}`}
                      onClick={() => handlePDFSelection(pdf)}
                    >
                      <FileText size={24} />
                      <div className="pdf-info">
                        <div className="pdf-name">{pdf.name}</div>
                        <div className="pdf-size">{pdf.size}</div>
                      </div>
                      {selectedPDF?.id === pdf.id && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="upload-section">
                <h3>또는 새 PDF 업로드</h3>
                <label className="upload-area">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="upload-input"
                  />
                  <Upload size={32} />
                  <span>PDF 파일을 선택하거나 드래그하세요</span>
                </label>
              </div>
            </div>

            <div className="pdf-selector-actions">
              <button 
                onClick={onSkip}
                className="skip-action-button"
              >
                건너뛰기
              </button>
              <button 
                onClick={handleConfirmSelection}
                disabled={!selectedPDF}
                className="confirm-button"
              >
                선택한 PDF로 대화하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PDFSelector