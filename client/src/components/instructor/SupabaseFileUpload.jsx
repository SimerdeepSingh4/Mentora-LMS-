import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, CheckCircle2, X } from "lucide-react";

const SupabaseFileUpload = ({ 
  onFileUpload, 
  fileType = "document", // "document", "video", "image"
  label = "Upload File",
  bucket = "mentora",
  folder = "lectures",
  maxSize = 50, // in MB
  acceptedFormats = ".pdf,.doc,.docx,.ppt,.pptx"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Determine accepted MIME types based on fileType
  const getMimeTypes = () => {
    switch (fileType) {
      case "document":
        return "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "video":
        return "video/mp4,video/webm,video/ogg";
      case "image":
        return "image/jpeg,image/png,image/gif,image/webp";
      default:
        return "";
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast.error(`File size should be less than ${maxSize}MB!`);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Import the uploadFile function dynamically
      const { uploadFile } = await import('@/utils/supabase');
      
      // Upload the file to Supabase
      const fileUrl = await uploadFile(file, bucket, folder);
      
      // Set the uploaded file info
      const fileInfo = {
        name: file.name,
        size: fileSizeInMB.toFixed(2),
        type: file.type,
        url: fileUrl
      };
      
      setUploadedFile(fileInfo);
      
      // Call the callback function with the file URL
      if (onFileUpload) {
        onFileUpload(fileUrl, fileInfo);
      }
      
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      
      // Handle errors
      let errorMessage = "Failed to upload file. Please try again.";
      
      if (error.statusCode === 413) {
        errorMessage = "File size too large. Please upload a smaller file.";
      } else if (error.statusCode === 400) {
        errorMessage = "Invalid file format or storage bucket not found.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (onFileUpload) {
      onFileUpload(null, null);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload" className="text-sm font-medium">
          {label}
        </Label>
        <div className="mt-1">
          {!uploadedFile ? (
            <div className="flex items-center gap-4">
              <Input
                type="file"
                id="file-upload"
                accept={getMimeTypes()}
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && (
                <div className="flex items-center text-blue-600">
                  <span className="animate-spin mr-2">⟳</span> Uploading...
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{uploadedFile.size} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  asChild
                >
                  <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                    <Upload className="w-4 h-4" /> View
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  onClick={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Max file size: {maxSize}MB. Accepted formats: {acceptedFormats}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseFileUpload;
