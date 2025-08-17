import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateProgressAfterEvaluation } from '@/lib/api/processingBatchProgress';
import { AppToast } from '@/components/ui/AppToast';
import { Calendar, Upload, X } from 'lucide-react';

interface UpdateAfterEvaluationFormProps {
  batchId: string;
  failedStageInfo: {
    stageId: number;
    stageName: string;
    failureDetails: string;
    recommendations?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateAfterEvaluationForm({
  batchId,
  failedStageInfo,
  isOpen,
  onClose,
  onSuccess
}: UpdateAfterEvaluationFormProps) {
  const [form, setForm] = useState({
    progressDate: new Date().toISOString().split('T')[0],
    outputQuantity: 0,
    outputUnit: 'kg',
    parameterName: '',
    parameterValue: '',
    unit: '',
    recordedAt: new Date().toISOString(),
  });
  const [parameters, setParameters] = useState<Array<{
    parameterName: string;
    parameterValue: string;
    unit: string;
    recordedAt: string;
  }>>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'outputQuantity' ? Number(value) : value,
    }));
  };

  const handlePhotoFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files]);
    }
  };

  const handleVideoFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setVideoFiles(prev => [...prev, ...files]);
    }
  };

  const removePhotoFile = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideoFile = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.outputQuantity <= 0) {
      AppToast.error('Vui lòng nhập khối lượng đầu ra hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // Tạo parameters array từ form và parameters state
      const allParameters = [];
      
      // Thêm single parameter nếu có
      if (form.parameterName && form.parameterValue) {
        allParameters.push({
          parameterName: form.parameterName,
          parameterValue: form.parameterValue,
          unit: form.unit,
          recordedAt: form.recordedAt,
        });
      }
      
      // Thêm multiple parameters
      allParameters.push(...parameters);
      
      const payload = {
        ...form,
        parametersJson: allParameters.length > 0 ? JSON.stringify(allParameters) : undefined,
        photoFiles,
        videoFiles,
      };

      await updateProgressAfterEvaluation(batchId, payload);
      
      AppToast.success('Cập nhật tiến trình thành công!');
      onSuccess();
      onClose();
      
      // Reset form
      setForm({
        progressDate: new Date().toISOString().split('T')[0],
        outputQuantity: 0,
        outputUnit: 'kg',
        parameterName: '',
        parameterValue: '',
        unit: '',
        recordedAt: new Date().toISOString(),
      });
      setParameters([]);
      setPhotoFiles([]);
      setVideoFiles([]);
    } catch (error: any) {
      console.error('Error updating progress after evaluation:', error);
      AppToast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tiến trình');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-800">
            Cập nhật tiến trình sau đánh giá
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin stage bị fail */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">🔧 Công đoạn cần cải thiện</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-medium">Công đoạn:</span>
                <span className="text-red-800 font-semibold">{failedStageInfo.stageName}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-medium">Vấn đề:</span>
                <span className="text-red-700">{failedStageInfo.failureDetails}</span>
              </div>
              {failedStageInfo.recommendations && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-medium">Khuyến nghị:</span>
                  <span className="text-red-700">{failedStageInfo.recommendations}</span>
                </div>
              )}
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                💡 <strong>Hướng dẫn:</strong> Vui lòng cải thiện công đoạn này theo khuyến nghị của chuyên gia và cập nhật lại tiến trình.
              </p>
            </div>
          </div>

          {/* Ngày cập nhật */}
          <div className="space-y-2">
            <Label htmlFor="progressDate" className="text-sm font-medium">
              Ngày cập nhật <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="progressDate"
                name="progressDate"
                type="date"
                value={form.progressDate}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Khối lượng đầu ra */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outputQuantity" className="text-sm font-medium">
                Khối lượng đầu ra <span className="text-red-500">*</span>
              </Label>
              <Input
                id="outputQuantity"
                name="outputQuantity"
                type="number"
                step="0.01"
                value={form.outputQuantity}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputUnit" className="text-sm font-medium">
                Đơn vị
              </Label>
              <select
                id="outputUnit"
                name="outputUnit"
                value={form.outputUnit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="tấn">tấn</option>
              </select>
            </div>
          </div>

                     {/* Thông số kỹ thuật */}
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h4 className="font-medium text-gray-900">Thông số kỹ thuật (tùy chọn)</h4>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => setParameters(prev => [...prev, {
                   parameterName: '',
                   parameterValue: '',
                   unit: '',
                   recordedAt: new Date().toISOString(),
                 }])}
               >
                 + Thêm thông số
               </Button>
             </div>
             
             {/* Single parameter */}
             <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="parameterName" className="text-sm font-medium">
                   Tên thông số
                 </Label>
                 <Input
                   id="parameterName"
                   name="parameterName"
                   value={form.parameterName}
                   onChange={handleChange}
                   placeholder="Ví dụ: Nhiệt độ"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="parameterValue" className="text-sm font-medium">
                   Giá trị
                 </Label>
                 <Input
                   id="parameterValue"
                   name="parameterValue"
                   value={form.parameterValue}
                   onChange={handleChange}
                   placeholder="Ví dụ: 25"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="unit" className="text-sm font-medium">
                   Đơn vị
                 </Label>
                 <Input
                   id="unit"
                   name="unit"
                   value={form.unit}
                   onChange={handleChange}
                   placeholder="Ví dụ: °C"
                 />
               </div>
             </div>
             
             {/* Multiple parameters */}
             {parameters.map((param, index) => (
               <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                 <div className="flex items-center justify-between">
                   <h5 className="font-medium text-gray-700">Thông số {index + 1}</h5>
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => setParameters(prev => prev.filter((_, i) => i !== index))}
                     className="text-red-600 hover:text-red-700"
                   >
                     <X className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Tên thông số</Label>
                     <Input
                       value={param.parameterName}
                       onChange={(e) => setParameters(prev => prev.map((p, i) => 
                         i === index ? { ...p, parameterName: e.target.value } : p
                       ))}
                       placeholder="Ví dụ: Nhiệt độ"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Giá trị</Label>
                     <Input
                       value={param.parameterValue}
                       onChange={(e) => setParameters(prev => prev.map((p, i) => 
                         i === index ? { ...p, parameterValue: e.target.value } : p
                       ))}
                       placeholder="Ví dụ: 25"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Đơn vị</Label>
                     <Input
                       value={param.unit}
                       onChange={(e) => setParameters(prev => prev.map((p, i) => 
                         i === index ? { ...p, unit: e.target.value } : p
                       ))}
                       placeholder="Ví dụ: °C"
                     />
                   </div>
                 </div>
               </div>
             ))}
           </div>

          {/* Upload hình ảnh */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Hình ảnh (tùy chọn)</h4>
            <div className="space-y-2">
              <Label htmlFor="photoFiles" className="text-sm font-medium">
                Chọn hình ảnh
              </Label>
              <Input
                id="photoFiles"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoFilesChange}
                className="cursor-pointer"
              />
            </div>
            {photoFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhotoFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload video */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Video (tùy chọn)</h4>
            <div className="space-y-2">
              <Label htmlFor="videoFiles" className="text-sm font-medium">
                Chọn video
              </Label>
              <Input
                id="videoFiles"
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoFilesChange}
                className="cursor-pointer"
              />
            </div>
            {videoFiles.length > 0 && (
              <div className="space-y-2">
                {videoFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVideoFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật tiến trình'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
