import React, { useState } from 'react';
import {
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useResetRejectedApplicationMutation
} from '@/features/api/adminApi';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const Applications = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetAllApplicationsQuery(selectedTab);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [resetRejectedApplication, { isLoading: isResetting }] = useResetRejectedApplicationMutation();
  const [resettingId, setResettingId] = useState(null);

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  const handleViewApplication = (application) => {
    // Log the application data to help debug resume issues
    console.log("Application data:", application);
    console.log("Resume URL properties:", {
      resumeUrl: application.resumeUrl,
      resume: application.resume
    });

    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateStatus({ applicationId, status }).unwrap();
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update application status');
    }
  };

  const handleResetApplication = async (applicationId) => {
    setResettingId(applicationId);
    try {
      const result = await resetRejectedApplication(applicationId).unwrap();
      toast.success(result.message || "Application reset to pending status");
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reset application');
    } finally {
      setResettingId(null);
    }
  };

  if (error) {
    console.error("Applications error:", error);

    // Extract more detailed error information
    const errorMessage = error.data?.message || error.error || error.message || "Unknown error";

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 pt-12">
        <div className="w-full max-w-md p-6 border border-red-200 rounded-lg bg-red-50">
          <h3 className="mb-2 text-lg font-semibold text-red-700">Error Loading Applications</h3>
          <p className="text-red-600">{errorMessage}</p>
          <div className="mt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 space-y-6 relative text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white">Instructor Applications</h1>

        {selectedTab === 'rejected' && (
          <div className="text-sm text-gray-500">
            Use the reset button <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg> next to each application to move it back to pending status
          </div>
        )}
      </div>

      <Tabs defaultValue="pending" value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/[0.05] p-1.5 rounded-2xl h-auto">
          <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card className="bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] overflow-hidden">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
              <CardTitle className="text-xl font-black">
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <ApplicationsTableSkeleton />
              ) : (
                <ApplicationsTable
                  applications={data?.applications || []}
                  onView={handleViewApplication}
                  status={selectedTab}
                  onReset={selectedTab === 'rejected' ? handleResetApplication : undefined}
                  resettingId={resettingId}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedApplication && (
        <ApplicationDetailsDialog
          application={selectedApplication}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onApprove={() => handleUpdateStatus(selectedApplication._id, 'approved')}
          onReject={() => handleUpdateStatus(selectedApplication._id, 'rejected')}
          isUpdating={isUpdating}
          status={selectedTab}
        />
      )}


    </div>
  );
};

const ApplicationsTable = ({ applications, onView, status, onReset, resettingId }) => {
  if (applications.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No {status} applications found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-white/[0.02]">
        <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Name</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Email</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Experience</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Applied On</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Status</TableHead>
          <TableHead className="text-right font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application._id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
            <TableCell className="font-bold text-white text-sm">{application.user.name}</TableCell>
            <TableCell className="text-[#aaa] text-sm">{application.user.email}</TableCell>
            <TableCell className="text-[#aaa] text-sm">{application.experience} years</TableCell>
            <TableCell className="text-[#aaa] text-sm">
              {format(new Date(application.createdAt), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <StatusBadge status={application.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(application)}
                  title="View Details"
                  className="text-[#888] hover:text-[#E8602E] hover:bg-[#E8602E]/10"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {status === 'rejected' && onReset && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onReset(application._id)}
                    title="Reset to Pending"
                    className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                    disabled={resettingId === application._id}
                  >
                    {resettingId === application._id ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                      </svg>
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const StatusBadge = ({ status }) => {
  const variants = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <Badge className={`${variants[status]} border font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5`}>
      {status}
    </Badge>
  );
};

const ApplicationDetailsDialog = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isUpdating,
  status
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] bg-[#0a0a0a] border-white/[0.05] text-white">
        <DialogHeader className="sticky top-0 z-10 pb-4 bg-[#0a0a0a] border-b border-white/[0.05]">
          <DialogTitle className="text-2xl font-black">Application Details</DialogTitle>
          <DialogDescription className="text-[#888]">
            Review the instructor application from <span className="text-white font-bold">{application.user.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
          {/* Personal Information */}
          <div className="p-5 space-y-4 rounded-xl bg-[#050505] border border-white/[0.05]">
            <h3 className="pb-2 text-xs font-bold tracking-widest uppercase text-[#E8602E] border-b border-white/[0.05]">
              Personal Information
            </h3>
            <div className="grid gap-3">
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Name:</span>
                <p className="text-sm font-bold text-white">{application.user.name}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Email:</span>
                <p className="text-sm font-bold text-white break-all">{application.user.email}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Phone:</span>
                <p className="text-sm font-bold text-white">{application.phone}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Aadhaar:</span>
                <p className="text-sm font-bold text-white">{application.aadhaar}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="p-5 space-y-4 rounded-xl bg-[#050505] border border-white/[0.05]">
            <h3 className="pb-2 text-xs font-bold tracking-widest uppercase text-[#E8602E] border-b border-white/[0.05]">
              Professional Information
            </h3>
            <div className="grid gap-3">
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Experience:</span>
                <p className="text-sm font-bold text-white">{application.experience} years</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Qualification:</span>
                <p className="text-sm font-bold text-white">{application.qualification}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider block mb-1">Expertise:</span>
                <p className="text-sm font-bold text-white">{application.expertise}</p>
              </div>
            </div>
          </div>

          {/* Reason for Application */}
          <div className="col-span-1 space-y-4 md:col-span-2">
            <h3 className="pb-2 text-xs font-bold tracking-widest uppercase text-[#E8602E] border-b border-white/[0.05]">
              Reason for Application
            </h3>
            <div className="p-5 bg-[#050505] border border-white/[0.05] rounded-xl max-h-[200px] overflow-y-auto">
              <p className="text-sm text-[#aaa] leading-relaxed break-words whitespace-pre-wrap">{application.reason}</p>
            </div>
          </div>

          {/* Resume */}
          <div className="col-span-1 space-y-4 md:col-span-2">
            <h3 className="pb-2 text-xs font-bold tracking-widest uppercase text-[#E8602E] border-b border-white/[0.05]">
              Resume
            </h3>

            {/* Check for resume URL */}
            {application.resumeUrl ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 p-5 border border-[#E8602E]/20 rounded-xl bg-[#E8602E]/[0.02]">
                  <p className="text-sm text-center text-[#888]">
                    Click the button below to view the applicant's resume in a new tab
                  </p>
                  <Button className="w-full gap-2 sm:w-auto bg-[#E8602E] text-white hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20" asChild>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      View Resume
                    </a>
                  </Button>
                  <span className="text-xs text-[#555] font-bold uppercase tracking-widest">
                    (PDF, DOC, or DOCX file)
                  </span>
                </div>

                {/* Embedded document viewer */}
                <div className="border border-white/[0.05] rounded-xl overflow-hidden h-[400px] bg-[#050505]">
                  {(() => {
                    const resumeUrl = application.resumeUrl;

                    // Check if it's a PDF by URL pattern or extension
                    const isPdf = resumeUrl &&
                      typeof resumeUrl === 'string' &&
                      (resumeUrl.toLowerCase().endsWith('.pdf') ||
                       resumeUrl.toLowerCase().includes('/pdf/'));

                    // For debugging
                    console.log("Resume URL:", resumeUrl);
                    console.log("Is PDF:", isPdf);

                    // No need to clean Supabase URLs - they work directly
                    const cleanPdfUrl = resumeUrl;

                    return isPdf ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="mb-4 text-[#888]">
                          <p>PDF viewer may not work directly due to security restrictions.</p>
                          <p className="mt-2 text-sm text-center">Please use the button below to view the resume:</p>
                        </div>
                        <Button className="mt-2 bg-white/[0.05] hover:bg-white/[0.1] text-white" asChild>
                          <a
                            href={cleanPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            View Resume in New Tab
                          </a>
                        </Button>
                      </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-[#333]">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p className="mb-2 text-[#aaa]">
                        This document type cannot be previewed directly
                      </p>
                      <p className="mb-4 text-sm text-[#555]">
                        Please use the "Open Resume in New Tab" button to view this document
                      </p>
                      <Button variant="outline" className="gap-2 border-white/[0.1] text-white hover:bg-white/[0.05]" asChild>
                        <a href={cleanPdfUrl || resumeUrl} target="_blank" rel="noopener noreferrer">
                          Open Document
                        </a>
                      </Button>
                    </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#050505] border border-white/[0.05]">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-[#333]">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <path d="M13 2v7h7"></path>
                  <circle cx="12" cy="15" r="1"></circle>
                  <path d="M12 12v.01"></path>
                </svg>
                <p className="mb-2 text-[#aaa] font-bold">No resume was uploaded</p>
                <p className="text-sm text-[#555]">The applicant did not provide a resume with their application.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 pt-4 bg-[#0a0a0a] border-t border-white/[0.05]">
          {status === 'pending' && (
            <>
              <Button
                variant="ghost"
                onClick={onReject}
                disabled={isUpdating}
                className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4" /> Reject
              </Button>
              <Button
                onClick={onApprove}
                disabled={isUpdating}
                className="gap-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/[0.04] text-[#aaa]">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ApplicationsTableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-8" />
      </div>
      <div className="border rounded-md">
        <div className="grid grid-cols-6 gap-4 p-4 border-b">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b">
            {[...Array(6)].map((_, j) => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
