import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

const FilePreview = ({ file }) => {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="file-preview">
      {isImage ? (
        <div className="image">
          <img src={file.data} alt={file.name} />
          {/* <div className="image-label">{file.name}</div> */}
        </div>
      ) : (
        <div className="document">
          <FileText size={16} className="document-icon" />
          <div className="document-info">
            <div className="document-name">{file.name}</div>
            <div className="document-size">
              ({Math.round(file.size / 1024)}KB)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
