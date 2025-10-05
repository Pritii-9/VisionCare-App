import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Eye,
  FileImage,
  Camera,
  AlertCircle,
  History,
  Download,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi'; // <--- NEW HOOK IMPORT

// --- Type Definitions for API Data ---
interface ScannerStats {
  imagesUploadedToday: number;
  totalUploads: number;
  pendingProcessing: number;
  averageUploadTime: number; // Mocked or calculated on backend
}

interface UploadRecord {
  _id: string;
  patientName: string;
  patientId: string;
  filename: string;
  upload_time: string; // ISO date string
  file_size: string;
  status: string;
  ai_result: {
    status: string;
    prediction: string;
    probability: number;
  }
}

interface PendingScan {
  _id: string;
  patientName: string;
  patientId: string;
  datetime: string; // ISO date string
  type: string;
  status: string;
}
// --- Component Start ---

const ScannerDashboard = () => {
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // For simulation
  const { toast } = useToast();

  // --- API Data Fetching ---
  const { data: statsData, isLoading: statsLoading } = useApi<ScannerStats>('/stats', {
    imagesUploadedToday: 0,
    totalUploads: 0,
    pendingProcessing: 0,
    averageUploadTime: 0,
  });

  const { data: uploadHistory, isLoading: historyLoading, refetch: refetchHistory } = useApi<UploadRecord[]>('/images/history', []);

  const { data: pendingScans, isLoading: scansLoading, refetch: refetchScans } = useApi<PendingScan[]>('/appointments/today', []);

  // --- Handlers ---

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      const isDicom = file.name.toLowerCase().endsWith('.dcm');

      if (!validTypes.includes(file.type) && !isDicom) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format. Please use JPG, PNG, or DICOM files.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setUploadQueue(prev => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (!selectedPatientId) {
      toast({
        title: "Patient ID required",
        description: "Please select a patient before uploading images.",
        variant: "destructive",
      });
      return;
    }

    if (uploadQueue.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let successfulUploads = 0;
    const totalFiles = uploadQueue.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = uploadQueue[i];
        const formData = new FormData();
        formData.append('patientId', selectedPatientId);
        formData.append('file', file);

        const response = await fetch('http://localhost:5000/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          successfulUploads++;
          setUploadProgress(((i + 1) / totalFiles) * 100);
          toast({
            title: `File ${i + 1}/${totalFiles} Uploaded`,
            description: `${file.name} uploaded. AI status: ${result.aiResult.status}.`,
          });
        } else {
          toast({
            title: `Upload Failed for ${file.name}`,
            description: result.message || "An unknown error occurred.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Batch Upload Complete",
        description: `${successfulUploads} of ${totalFiles} image(s) uploaded successfully for patient ${selectedPatientId}.`,
      });

      setUploadQueue([]);
      setSelectedPatientId('');
      refetchHistory(); // Refresh history after successful upload
      // Optionally refresh stats
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Network error or connection issue. Please check the backend.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return 'bg-medical-green text-white';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent re-scan':
        return 'bg-destructive text-destructive-foreground';
      case 'initial screening':
      case 'normal':
        return 'bg-medical-blue text-white';
      case 'follow-up':
        return 'bg-medical-orange text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return "N/A";
    }
  };

  const formattedUploadHistory = uploadHistory.map(upload => ({
    ...upload,
    uploadTime: new Date(upload.upload_time).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    processingTime: "N/A", // This is complex to calculate on frontend, keeping as placeholder
  }));

  const currentStats = statsData || { imagesUploadedToday: 0, totalUploads: 0, pendingProcessing: 0, averageUploadTime: 0 };


  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scanner Dashboard</h1>
          <p className="text-muted-foreground">Upload and manage fundus images</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="medical-gradient">
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Fundus Images</DialogTitle>
              <DialogDescription>
                Upload fundus images for ROP analysis. Supports JPG, PNG, and DICOM formats.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientSelect">Select Patient ID *</Label>
                <Input
                  id="patientSelect"
                  placeholder="Enter Neonate ID (e.g., N001)"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.dcm"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports JPG, PNG, DICOM files up to 10MB each
                    </p>
                  </label>
                </div>
              </div>

              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <Label>Upload Queue ({uploadQueue.length} files)</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {uploadQueue.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                        <div className="flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromQueue(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{Math.round(uploadProgress * uploadQueue.length / 100)} of {uploadQueue.length} complete</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={isUploading}>Cancel</Button>
              <Button
                className="medical-gradient"
                onClick={handleUpload}
                disabled={isUploading || uploadQueue.length === 0 || !selectedPatientId}
              >
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {isUploading ? 'Uploading...' : `Upload ${uploadQueue.length} Files`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Key Metrics */}
      {statsLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images Today</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{currentStats.imagesUploadedToday}</div>
              <p className="text-xs text-muted-foreground">Uploaded today</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
              <Upload className="h-4 w-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-blue">{currentStats.totalUploads}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{currentStats.pendingProcessing}</div>
              <p className="text-xs text-muted-foreground">In queue</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Upload Time</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{currentStats.averageUploadTime || 45}s</div>
              <p className="text-xs text-muted-foreground">Per image</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Quick Upload</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
          <TabsTrigger value="pending">Pending Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Kept as a standalone quick upload form, can be expanded later */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-medical-blue" />
                Quick Upload
              </CardTitle>
              <CardDescription>Fast upload interface for immediate scanning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quickPatientId">Patient ID</Label>
                  <Input id="quickPatientId" placeholder="Enter Patient ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quickImageType">Image Type</Label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>Standard Fundus</option>
                    <option>Wide-field Fundus</option>
                    <option>Fluorescein Angiography</option>
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.dcm"
                  className="hidden"
                  id="quick-upload"
                />
                <label htmlFor="quick-upload" className="cursor-pointer">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium">Drop images here or click to browse</p>
                  <p className="text-muted-foreground mt-2">
                    JPG, PNG, DICOM files • Max 10MB per file
                  </p>
                </label>
              </div>

              <div className="flex justify-end items-center">
                <Button className="medical-gradient">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-medical-green" />
                Upload History
              </CardTitle>
              <CardDescription>Recent image uploads and processing status</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {formattedUploadHistory.length > 0 ? formattedUploadHistory.map((upload) => (
                    <div key={upload._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{upload.patientName}</span>
                          <span className="text-sm text-muted-foreground">({upload.patientId})</span>
                          <Badge className={getStatusColor(upload.status)}>
                            {upload.status}
                          </Badge>
                          {upload.ai_result.status === 'processed' && (
                            <Badge className={`bg-primary text-primary-foreground`}>
                              AI: {upload.ai_result.prediction}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileImage className="h-4 w-4" />
                            {upload.filename} ({upload.file_size})
                          </div>
                          <div>{upload.uploadTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:5000/api/image/${upload.filename}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground">No recent uploads found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-medical-orange" />
                Pending Scans
              </CardTitle>
              <CardDescription>Patients scheduled for imaging today</CardDescription>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {pendingScans.length > 0 ? pendingScans.map((scan) => (
                    <div key={scan._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scan.patientName}</span>
                          <span className="text-sm text-muted-foreground">({scan.patientId})</span>
                          <Badge className={getPriorityColor(scan.type)}>
                            {scan.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Scheduled for {formatTime(scan.datetime)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" className="medical-gradient" onClick={() => setSelectedPatientId(scan.patientId)}>
                          <Camera className="w-4 h-4 mr-1" />
                          Start Scan
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground">No scans scheduled for today.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScannerDashboard;