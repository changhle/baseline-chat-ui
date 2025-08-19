import React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';

const FilePreview = ({ file }) => {
  // Check if the file is an image based on its type or path
  const isImage = file.type
    ? file.type.startsWith('image/')
    : file.saved_path &&
      /\.(jpg|jpeg|png|gif)$/i.test(file.saved_path);

  // Determine the source of the image
  const imageSrc = file.data
    ? file.data
    : file.saved_path
    ? `http://localhost:5002/${file.saved_path}`
    : '';

  // Extract the file name
  const fileName = file.name || (file.saved_path ? file.saved_path.split('/').pop() : 'file');

  // Calculate file size, if available
  const fileSize = file.size ? `(${Math.round(file.size / 1024)}KB)` : '';

  return (
    <div className="file-preview">
      {isImage ? (
        <div className="image">
          <img src={imageSrc} alt={fileName} />
        </div>
      ) : (
        <div className="document">
          <FileText size={16} className="document-icon" />
          <div className="document-info">
            <div className="document-name">{fileName}</div>
            {fileSize && <div className="document-size">{fileSize}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
