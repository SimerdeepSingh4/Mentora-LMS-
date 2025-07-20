import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Maximize, Minimize } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import './document-viewer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try opening it in a new tab.');
    setIsLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : 'relative'}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {pageNumber} of {numPages || '--'}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className={`overflow-auto border rounded-lg ${isFullscreen ? 'flex-1' : 'h-[500px]'}`}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Skeleton className="h-[400px] w-full" />
            <p className="mt-4 text-sm text-gray-500">Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in New Tab
              </a>
            </Button>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="flex justify-center p-4"><Skeleton className="h-[400px] w-full" /></div>}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md"
            scale={isFullscreen ? 1.5 : 1}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
