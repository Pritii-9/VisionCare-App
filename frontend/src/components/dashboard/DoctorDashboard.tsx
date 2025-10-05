import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  ListChecks,
  AlertTriangle,
  Clock,
  UserCheck,
  Eye,
  Activity,
  Calendar,
  Loader2,
  FileImage,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi'; // <--- NEW HOOK IMPORT

// --- Type Definitions for API Data ---
interface DoctorStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingReview: number;
  // This stat is from the backend and is relevant for the Doctor
  totalReviewed: number; 
}

interface ImageReview {
  _id: string;
  patientName: string;
  patientId: string;
  filename: string;
  upload_time: string; // ISO date string
  ai_result: {
    prediction: string;
    probability: number;
  };
  latest_review?: {
    diagnosis: string;
    stage: string;
  };
}

// --- Component Start ---

const DoctorDashboard = () => {

  // --- API Data Fetching ---
  const { data: statsData, isLoading: statsLoading } = useApi<DoctorStats>('/stats', {
    totalPatients: 0,
    appointmentsToday: 0,
    pendingReview: 0,
    totalReviewed: 120, // Mocked for doctor specific stat
  });

  const { data: reviewImages, isLoading: reviewLoading, refetch: refetchReviewImages } = useApi<ImageReview[]>('/images/review', []);

  // --- Handlers ---
  const getRiskColor = (prediction: string) => {
    const p = prediction.toLowerCase();
    if (p.includes('high-risk') || p.includes('stage 3')) return 'bg-destructive text-destructive-foreground';
    if (p.includes('stage 2')) return 'bg-medical-orange text-white';
    if (p.includes('stage 1')) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const currentStats = statsData || { totalPatients: 0, appointmentsToday: 0, pendingReview: 0, totalReviewed: 120 };


  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dr. Sarah Johnson's Dashboard</h1>
          <p className="text-muted-foreground">Review ROP scan results and manage patient care.</p>
        </div>
        <Button className="medical-gradient">
          <Activity className="w-4 h-4 mr-2" />
          Start Consultation
        </Button>
      </div>

      {/* Key Metrics */}
      {statsLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients in Care</CardTitle>
              <UserCheck className="h-4 w-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-blue">{currentStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Total records in system</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{currentStats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">High-risk AI findings</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
              <Calendar className="h-4 w-4 text-medical-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-orange">{currentStats.appointmentsToday}</div>
              <p className="text-xs text-muted-foreground">Scheduled for scan</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
              <ListChecks className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{currentStats.totalReviewed}</div>
              <p className="text-xs text-muted-foreground">Reports completed this month</p>
            </CardContent>
          </Card>
        </div>
      )}


      <Tabs defaultValue="review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="review" className="col-span-1">Urgent Review Queue ({currentStats.pendingReview})</TabsTrigger>
          <TabsTrigger value="reviewed" className="col-span-1">Reviewed Cases</TabsTrigger>
          <TabsTrigger value="patients" className="col-span-1">Patient Search</TabsTrigger>
          <TabsTrigger value="reports" className="col-span-1">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                AI High-Risk Findings Awaiting Confirmation
              </CardTitle>
              <CardDescription>Images processed with a high AI confidence for severe ROP stages.</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {reviewImages.length > 0 ? reviewImages.map((image) => (
                    <div key={image._id} className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{image.patientName}</span>
                          <span className="text-sm text-muted-foreground">({image.patientId})</span>
                          <Badge className={getRiskColor(image.ai_result.prediction)}>
                            AI: {image.ai_result.prediction}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileImage className="h-4 w-4" />
                            {image.filename}
                          </div>
                          <div>Upload Date: {formatDate(image.upload_time)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:5000/api/image/${image.filename}`, '_blank')}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Image
                        </Button>
                        <Button size="sm" className="medical-gradient">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          Start Review
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground">No high-risk images currently pending review.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <Card className="medical-card">
            <CardHeader><CardTitle>Reviewed Cases</CardTitle></CardHeader>
            <CardContent><p className='text-muted-foreground'>List of recently reviewed and completed reports (API integration required).</p></CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-4">
          <Card className="medical-card">
            <CardHeader><CardTitle>Patient Search</CardTitle></CardHeader>
            <CardContent><p className='text-muted-foreground'>Search interface for all patient records (API integration required).</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="medical-card">
            <CardHeader><CardTitle>Statistical Reports</CardTitle></CardHeader>
            <CardContent><p className='text-muted-foreground'>Area for viewing aggregate reports and analytics (API integration required).</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;