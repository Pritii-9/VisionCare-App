import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, UserPlus, Clock, ListPlus, Baby, Phone, Stethoscope, History, Loader2, X, ClipboardCheck, Users, CornerDownRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useApi, usePost } from '@/hooks/useApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert for professional status messages

// --- Type Definitions (omitted for brevity, assume they are correct) ---
interface Patient {
  _id: string; // MongoDB ID
  neonate_id: string;
  name: string;
  birth_date: string; // ISO date string
  gestational_age: string;
  weight: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  status: string;
  created_at: string; // ISO date string
}

interface Appointment {
  _id: string;
  patientName: string;
  patientId: string;
  datetime: string; // ISO date string
  type: 'Initial Screening' | 'Follow-up' | 'Urgent Re-scan';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

interface Stats {
  totalPatients: number;
  appointmentsToday: number;
  pendingReview: number;
}
// --- Component Start ---

const ReceptionistDashboard = () => {
  const { toast } = useToast();
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  // --- API Data Fetching ---
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useApi<Stats>('/stats', { totalPatients: 0, appointmentsToday: 0, pendingReview: 0 });
  const { data: allPatients, isLoading: patientsLoading, refetch: refetchPatients } = useApi<Patient[]>('/patients', []);
  const { data: upcomingAppointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useApi<Appointment[]>('/appointments/today', []);

  const recentPatients = useMemo(() => allPatients.slice(0, 5), [allPatients]);

  // --- POST Hooks ---
  const { postData: postPatient, isPosting: isAddingPatient } = usePost();
  const { postData: postAppointment, isPosting: isScheduling } = usePost();

  // --- State for Forms ---
  const [patientForm, setPatientForm] = useState({
    name: '',
    neonate_id: '',
    birth_date: '',
    gestational_age: '',
    weight: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'Initial Screening' as 'Initial Screening' | 'Follow-up' | 'Urgent Re-scan',
  });
  
  // --- Form Handlers ---
  const handlePatientFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPatientForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  }, []);

  const handleAppointmentFormChange = useCallback((id: string, value: string) => {
    setAppointmentForm(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleAddPatient = async () => {
    if (!patientForm.name || !patientForm.neonate_id || !patientForm.birth_date || !patientForm.parent_name) {
      toast({ title: "Validation Error", description: "Please ensure all required fields (*) are filled.", variant: "destructive" });
      return;
    }

    const payload = {
      ...patientForm,
      weight: patientForm.weight ? parseFloat(patientForm.weight) : null,
      neonate_id: patientForm.neonate_id.toUpperCase(),
    };

    const result = await postPatient('/patients', payload);

    if (result.success) {
      setPatientForm({ name: '', neonate_id: '', birth_date: '', gestational_age: '', weight: '', parent_name: '', parent_phone: '', parent_email: '' });
      setIsPatientDialogOpen(false);
      refetchPatients();
      refetchStats();
    }
  };

  const handleScheduleAppointment = async () => {
    const { patientId, date, time, type } = appointmentForm;

    if (!patientId || !date || !time) {
      toast({ title: "Validation Error", description: "Patient ID, Date, and Time are required for scheduling.", variant: "destructive" });
      return;
    }
    
    // Combine date and time to ISO format (e.g., "YYYY-MM-DDTHH:MM:SS")
    const combinedDatetime = `${date}T${time}:00`; 

    const payload = {
      patientId: patientId.toUpperCase(),
      datetime: combinedDatetime,
      type,
    };

    const result = await postAppointment('/appointments', payload);

    if (result.success) {
      setAppointmentForm({ patientId: '', date: '', time: '', type: 'Initial Screening' });
      setIsAppointmentDialogOpen(false);
      refetchAppointments();
      refetchStats();
    }
  };

  // --- UI Helpers (kept the same) ---
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success text-success-foreground';
      case 'scheduled': return 'bg-medical-blue text-white';
      case 'completed': return 'bg-medical-green text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  const formatTime = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "N/A";
    }
  };

  const currentStats = statsData || { totalPatients: 0, appointmentsToday: 0, pendingReview: 0 };


  return (
    <div className="space-y-6 p-6">
      {/* Welcome & Action Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Receptionist Dashboard</h1>
          <p className="text-muted-foreground">Manage patient records and schedule ROP scans.</p>
        </div>
        <div className="flex gap-3">
          {/* Add Patient Dialog */}
          <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="medical-gradient shadow-md hover:shadow-lg transition-shadow">
                <UserPlus className="w-4 h-4 mr-2" />
                **NEW PATIENT REGISTRATION**
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-6"> {/* Larger, clearer dialog */}
              <DialogHeader>
                <DialogTitle className='text-3xl font-extrabold text-medical-blue border-b pb-2'>
                    <Users className='inline-block w-6 h-6 mr-2' />
                    Neonate Patient Registration Form
                </DialogTitle>
                <DialogDescription className='pt-2 text-md'>
                  Complete the fields below to create a new patient record. **Required fields are marked with a red asterisk (**<span className="text-red-500">*</span>**).**
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-8 py-4">
                
                {/* Neonate Details Fieldset */}
                <fieldset className='border border-medical-blue/50 p-6 rounded-xl space-y-5 bg-blue-50/30'>
                    <legend className='px-3 text-xl font-bold text-medical-blue'>Neonate Details</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name" className='font-semibold text-lg'>Baby's Name <span className="text-red-500">*</span></Label>
                            <Input id="name" placeholder="E.g., Baby Johnson" value={patientForm.name} onChange={handlePatientFormChange} className='h-10 text-base' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="neonate_id" className='font-semibold text-lg'>Neonate ID <span className="text-red-500">*</span></Label>
                            <Input id="neonate_id" placeholder="Unique ID (e.g., N001)" value={patientForm.neonate_id} onChange={handlePatientFormChange} className='h-10 text-base font-mono uppercase' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birth_date" className='font-semibold text-lg'>Date of Birth <span className="text-red-500">*</span></Label>
                            <Input id="birth_date" type="date" value={patientForm.birth_date} onChange={handlePatientFormChange} className='h-10 text-base' />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="gestational_age" className='font-semibold'>Gestational Age (weeks)</Label>
                            <Input id="gestational_age" type="number" placeholder="E.g., 32" value={patientForm.gestational_age} onChange={handlePatientFormChange} className='h-10' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight" className='font-semibold'>Birth Weight (kg)</Label>
                            <Input id="weight" type="number" step="0.1" placeholder="E.g., 1.8" value={patientForm.weight} onChange={handlePatientFormChange} className='h-10' />
                        </div>
                    </div>
                </fieldset>

                {/* Parent Details Fieldset */}
                <fieldset className='border border-medical-orange/50 p-6 rounded-xl space-y-5 bg-orange-50/30'>
                    <legend className='px-3 text-xl font-bold text-medical-orange'>Parent/Contact Details</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="parent_name" className='font-semibold'>Parent/Guardian Name <span className="text-red-500">*</span></Label>
                            <Input id="parent_name" placeholder="Full Name" value={patientForm.parent_name} onChange={handlePatientFormChange} className='h-10' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parent_phone" className='font-semibold'>Primary Phone</Label>
                            <Input id="parent_phone" type="tel" placeholder="(000) 000-0000" value={patientForm.parent_phone} onChange={handlePatientFormChange} className='h-10' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parent_email" className='font-semibold'>Email Address</Label>
                            <Input id="parent_email" type="email" placeholder="parent@hospital.com" value={patientForm.parent_email} onChange={handlePatientFormChange} className='h-10' />
                        </div>
                    </div>
                </fieldset>

              </div>
              <DialogFooter className='pt-4 border-t'>
                <Button variant="outline" onClick={() => setIsPatientDialogOpen(false)} disabled={isAddingPatient} className='text-muted-foreground hover:bg-red-50'>
                    <X className='w-4 h-4 mr-2' />
                    Cancel
                </Button>
                <Button onClick={handleAddPatient} disabled={isAddingPatient} className="medical-gradient shadow-lg">
                  {isAddingPatient ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ListPlus className="w-4 h-4 mr-2" />}
                  {isAddingPatient ? 'Processing...' : 'Create Patient Record'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Appointment Dialog */}
          <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className='shadow-md hover:shadow-lg'>
                <CalendarIcon className="w-4 h-4 mr-2 text-medical-orange" />
                **Schedule Scan Appointment**
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-6">
              <DialogHeader>
                <DialogTitle className='text-3xl font-extrabold text-medical-orange border-b pb-2'>
                    <ClipboardCheck className='inline-block w-6 h-6 mr-2' />
                    Schedule ROP Scan
                </DialogTitle>
                <DialogDescription className='pt-2 text-md'>
                  Select the patient, date, and type of ROP scan required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label htmlFor="patientId" className='font-semibold text-lg'>Patient ID <span className="text-red-500">*</span></Label>
                  <Input 
                    id="patientId" 
                    placeholder="Enter Neonate ID (e.g., N001)" 
                    value={appointmentForm.patientId} 
                    onChange={(e) => handleAppointmentFormChange('patientId', e.target.value)} 
                    className='h-10 text-base font-mono uppercase'
                  />
                  <p className='text-xs text-muted-foreground flex items-center'><CornerDownRight className='w-3 h-3 mr-1' /> Ensure ID is correct before scheduling.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50/50">
                    <div className="space-y-2">
                        <Label htmlFor="date" className='font-semibold'>Appointment Date <span className="text-red-500">*</span></Label>
                        <Input
                            id="date"
                            type="date"
                            value={appointmentForm.date}
                            onChange={(e) => handleAppointmentFormChange('date', e.target.value)}
                            className='h-10'
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time" className='font-semibold'>Appointment Time <span className="text-red-500">*</span></Label>
                        <Input
                            id="time"
                            type="time"
                            step="300" // 5-minute increments
                            value={appointmentForm.time}
                            onChange={(e) => handleAppointmentFormChange('time', e.target.value)}
                            className='h-10'
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className='font-semibold'>Appointment Type</Label>
                  <Select
                    value={appointmentForm.type}
                    onValueChange={(value: 'Initial Screening' | 'Follow-up' | 'Urgent Re-scan') => handleAppointmentFormChange('type', value)}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Scan Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Initial Screening">Initial Screening - Standard checkup.</SelectItem>
                      <SelectItem value="Follow-up">Follow-up - Re-scan post-treatment or weekly monitoring.</SelectItem>
                      <SelectItem value="Urgent Re-scan">Urgent Re-scan - Requires immediate attention.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className='pt-4 border-t'>
                <Button variant="outline" onClick={() => setIsAppointmentDialogOpen(false)} disabled={isScheduling} className='text-muted-foreground hover:bg-red-50'>
                    <X className='w-4 h-4 mr-2' />
                    Cancel
                </Button>
                <Button onClick={handleScheduleAppointment} disabled={isScheduling} className="medical-gradient shadow-lg">
                  {isScheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                  {isScheduling ? 'Scheduling...' : 'Confirm Appointment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics - (Layout remains professional and unchanged) */}
      {/* ... (Metrics section content) ... */}
      {statsLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /> Fetching Key Metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active Patients</CardTitle>
              <Baby className="h-4 w-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-blue">{currentStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Records in the system</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
              <CalendarIcon className="h-4 w-4 text-medical-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-orange">{currentStats.appointmentsToday}</div>
              <p className="text-xs text-muted-foreground">Scans scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Reviews</CardTitle>
              <Stethoscope className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{currentStats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">High-risk AI findings pending doctor review</p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Main Content Area - (Unchanged for this request) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table */}
        <Card className="lg:col-span-2 medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-medical-blue" /> Recent Patient Registrations</CardTitle>
            <CardDescription>The last 5 neonate records added to the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Search patients by ID or name..." className="mb-4" />
            {patientsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {recentPatients.length > 0 ? recentPatients.map((patient) => (
                  <div key={patient._id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="font-medium">{patient.name} <Badge className="ml-2 bg-muted text-muted-foreground">{patient.neonate_id}</Badge></div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Baby className="h-4 w-4" /> DOB: {formatDate(patient.birth_date)}</div>
                        <div className="flex items-center gap-1"><Phone className="h-4 w-4" /> {patient.parent_phone || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground">No recent patient records found. Start by adding one!</p>
                )}
              </div>
            )}
            <div className='pt-2 flex justify-end'>
              <Button variant="ghost" className="text-medical-blue" onClick={refetchPatients}>Refresh List</Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments List */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-medical-orange" /> Today's Scan Schedule</CardTitle>
            <CardDescription>Appointments for imaging team today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointmentsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-medical-blue" /></div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {upcomingAppointments.length > 0 ? upcomingAppointments.map((app) => (
                  <div key={app._id} className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{app.patientName} <Badge className='ml-2 bg-muted text-muted-foreground'>{app.patientId}</Badge></div>
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatTime(app.datetime)} - {app.type}</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground">🎉 No scans scheduled for today. Time for a coffee break! ☕</p>
                )}
              </div>
            )}
            <div className='pt-2 flex justify-end'>
              <Button variant="ghost" className="text-medical-orange" onClick={refetchAppointments}>Refresh Schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;