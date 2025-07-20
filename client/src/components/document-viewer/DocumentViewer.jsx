import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download } from 'lucide-react';
import PDFViewer from './PDFViewer';

const DocumentViewer = ({ fileUrl, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <FileText className="w-12 h-12 text-gray-400" />
        <p className="mt-2 text-gray-500">No document available</p>
      </div>
    );
  }

  // Determine file type based on URL or filename
  const getFileType = () => {
    const url = fileUrl.toLowerCase();
    const name = fileName?.toLowerCase() || '';
    
    if (url.includes('.pdf') || name.endsWith('.pdf')) {
      return 'pdf';
    } else if (url.includes('.ppt') || name.endsWith('.ppt') || url.includes('.pptx') || name.endsWith('.pptx')) {
      return 'ppt';
    } else if (url.includes('.doc') || name.endsWith('.doc') || url.includes('.docx') || name.endsWith('.docx')) {
      return 'doc';
    } else {
      return 'unknown';
    }
  };

  const fileType = getFileType();

  const toggleViewer = () => {
    setIsOpen(!isOpen);
  };

  // Render appropriate viewer based on file type
  const renderViewer = () => {
    switch (fileType) {
      case 'pdf':
        return <PDFViewer fileUrl={fileUrl} fileName={fileName} />;
      case 'ppt':
      case 'doc':
      case 'unknown':
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-800 h-[300px]">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <p className="mb-4 text-center">
              {fileType === 'unknown' 
                ? "This file type cannot be previewed" 
                : `${fileType.toUpperCase()} files cannot be previewed directly`}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" />
            <span className="font-medium">{fileName || 'Document'}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleViewer} variant="outline" size="sm">
              View Document
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-1" />
                Download
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
            <h3 className="font-medium">{fileName || 'Document'}</h3>
            <Button onClick={toggleViewer} variant="outline" size="sm">
              Close
            </Button>
          </div>
          <div className="p-4">
            {renderViewer()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
