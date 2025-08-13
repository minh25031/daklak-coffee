"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload, Image, Video } from "lucide-react";

interface MediaUploadSectionProps {
  photoFiles: File[];
  videoFiles: File[];
  onPhotoFilesChange: (files: File[]) => void;
  onVideoFilesChange: (files: File[]) => void;
}

export default function MediaUploadSection({
  photoFiles,
  videoFiles,
  onPhotoFilesChange,
  onVideoFilesChange,
}: MediaUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'photo' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    if (type === 'photo' && imageFiles.length > 0) {
      onPhotoFilesChange([...photoFiles, ...imageFiles]);
    }
    if (type === 'video' && videoFiles.length > 0) {
      onVideoFilesChange([...videoFiles, ...videoFiles]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photoFiles.filter((_, i) => i !== index);
    onPhotoFilesChange(newPhotos);
  };

  const removeVideo = (index: number) => {
    const newVideos = videoFiles.filter((_, i) => i !== index);
    onVideoFilesChange(newVideos);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Photo Upload Section */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          <Image className="inline w-4 h-4 mr-1" />
          Ảnh minh hoạ (có thể chọn nhiều)
        </label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'photo')}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Kéo thả ảnh vào đây hoặc click để chọn
          </p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPhotoFilesChange(Array.from(e.target.files || []))}
            className="hidden"
            id="photo-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            Chọn ảnh
          </Button>
        </div>

        {/* Photo Preview */}
        {photoFiles.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Đã chọn {photoFiles.length} ảnh:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photoFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Upload Section */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          <Video className="inline w-4 h-4 mr-1" />
          Video minh hoạ (có thể chọn nhiều)
        </label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'video')}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Kéo thả video vào đây hoặc click để chọn
          </p>
          <Input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => onVideoFilesChange(Array.from(e.target.files || []))}
            className="hidden"
            id="video-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('video-upload')?.click()}
          >
            Chọn video
          </Button>
        </div>

        {/* Video Preview */}
        {videoFiles.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Đã chọn {videoFiles.length} video:</p>
            <div className="space-y-2">
              {videoFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Limits Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Giới hạn:</strong> Tối đa 10 files, tổng kích thước 50MB. 
          Ảnh sẽ được nén tự động để giảm kích thước.
        </p>
      </div>
    </div>
  );
}
