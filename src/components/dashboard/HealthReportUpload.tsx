import { FileText, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HealthReportUpload = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Health Reports
        </CardTitle>
        <CardDescription>Upload your health reports and lab results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Health Reports</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your health reports here, or click to browse
          </p>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthReportUpload;
