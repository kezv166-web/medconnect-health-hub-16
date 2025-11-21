import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PrescriptionUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      toast({
        title: "Prescription Uploaded",
        description: `${imageFiles.length} file(s) uploaded successfully. Processing...`,
      });
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload image files only (PNG, JPG, etc.)",
      variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Prescription
        </CardTitle>
        <CardDescription>
          Upload a photo of your prescription or enter details manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${
              isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileInput}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag and drop prescription images here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse your files
              </p>
            </div>

            <label htmlFor="file-upload">
              <Button 
                type="button" 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </label>

            <p className="text-xs text-muted-foreground mt-2">
              Supports: PNG, JPG, JPEG (Max 10MB per file)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionUpload;
