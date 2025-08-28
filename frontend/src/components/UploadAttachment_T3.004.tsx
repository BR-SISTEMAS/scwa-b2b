/**
 * [S3][T3.004] - Upload Attachment Component
 * Componente para upload de arquivos com drag-and-drop e preview
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface UploadAttachmentProps {
  conversationId: string;
  onUploadComplete?: (attachment: AttachmentData) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number;
  accept?: string[];
  multiple?: boolean;
}

interface AttachmentData {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

export function UploadAttachment_T3004({
  conversationId,
  onUploadComplete,
  onUploadError,
  maxSize = 50 * 1024 * 1024, // 50MB default
  accept,
  multiple = true,
}: UploadAttachmentProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Determine file type from MIME
  const getFileType = (mimetype: string): AttachmentData['type'] => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'document';
    return 'other';
  };

  // Get icon for file type
  const getFileIcon = (type: AttachmentData['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'document': return <FileText className="w-8 h-8 text-red-500" />;
      case 'audio': return <Music className="w-8 h-8 text-purple-500" />;
      case 'video': return <Video className="w-8 h-8 text-green-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload single file
  const uploadFile = async (file: FileWithPreview, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    formData.append('type', getFileType(file.type));

    // Update file status
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 } : f
    ));

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, uploadProgress: progress } : f
          ));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, uploadStatus: 'success', uploadProgress: 100 } : f
          ));
          
          if (onUploadComplete) {
            onUploadComplete(response);
          }
          
          toast.success(`${file.name} uploaded successfully`);
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = new Error(`Failed to upload ${file.name}`);
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, uploadStatus: 'error', uploadError: error.message } : f
        ));
        
        if (onUploadError) {
          onUploadError(error);
        }
        
        toast.error(`Failed to upload ${file.name}`);
      });

      // Send request
      xhr.open('POST', '/api/attachments/upload');
      xhr.send(formData);
      
    } catch (error) {
      const err = error as Error;
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploadStatus: 'error', uploadError: err.message } : f
      ));
      
      if (onUploadError) {
        onUploadError(err);
      }
      
      toast.error(`Failed to upload ${file.name}: ${err.message}`);
    }
  };

  // Upload all files
  const uploadFiles = async () => {
    setIsUploading(true);
    
    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.uploadStatus !== 'success') {
        await uploadFile(file, i);
      }
    }
    
    setIsUploading(false);
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke preview URL if exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add preview URLs for images
    const filesWithPreview = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      fileWithPreview.uploadStatus = 'pending';
      return fileWithPreview;
    });
    
    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple,
    accept: accept ? { 'custom/*': accept } : undefined,
  });

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50 dark:border-gray-700'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        {isDragActive ? (
          <p className="text-sm text-primary">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Selected files ({files.length})</h3>
            {files.some(f => f.uploadStatus === 'pending') && (
              <Button
                size="sm"
                onClick={uploadFiles}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            )}
          </div>

          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-3">
                {/* File preview or icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(getFileType(file.type))
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Upload progress */}
                  {file.uploadStatus === 'uploading' && file.uploadProgress !== undefined && (
                    <Progress value={file.uploadProgress} className="mt-1 h-1" />
                  )}

                  {/* Upload status */}
                  {file.uploadStatus === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {file.uploadError || 'Upload failed'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {file.uploadStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : file.uploadStatus === 'uploading' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
