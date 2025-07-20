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
    <div className="pt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Instructor Applications</h1>

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
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
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
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>Applied On</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application._id}>
            <TableCell className="font-medium">{application.user.name}</TableCell>
            <TableCell>{application.user.email}</TableCell>
            <TableCell>{application.experience} years</TableCell>
            <TableCell>
              {format(new Date(application.createdAt), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <StatusBadge status={application.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(application)}
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {status === 'rejected' && onReset && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onReset(application._id)}
                    title="Reset to Pending"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
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
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader className="sticky top-0 z-10 pb-2 bg-white dark:bg-gray-950">
          <DialogTitle className="text-xl">Application Details</DialogTitle>
          <DialogDescription>
            Review the instructor application from {application.user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
          {/* Personal Information */}
          <div className="p-4 space-y-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="pb-1 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
              Personal Information
            </h3>
            <div className="grid gap-2">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <p className="text-sm">{application.user.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-sm break-all">{application.user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Phone:</span>
                <p className="text-sm">{application.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Aadhaar:</span>
                <p className="text-sm">{application.aadhaar}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="p-4 space-y-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="pb-1 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
              Professional Information
            </h3>
            <div className="grid gap-2">
              <div>
                <span className="text-sm font-medium">Experience:</span>
                <p className="text-sm">{application.experience} years</p>
              </div>
              <div>
                <span className="text-sm font-medium">Qualification:</span>
                <p className="text-sm">{application.qualification}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Expertise:</span>
                <p className="text-sm">{application.expertise}</p>
              </div>
            </div>
          </div>

          {/* Reason for Application */}
          <div className="col-span-1 space-y-3 md:col-span-2">
            <h3 className="pb-1 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
              Reason for Application
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[200px] overflow-y-auto">
              <p className="text-sm break-words whitespace-pre-wrap">{application.reason}</p>
            </div>
          </div>

          {/* Resume */}
          <div className="col-span-1 space-y-3 md:col-span-2">
            <h3 className="pb-1 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
              Resume
            </h3>

            {/* Check for resume URL */}
            {application.resumeUrl ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                    Click the button below to view the applicant's resume in a new tab
                  </p>
                  <Button className="w-full gap-2 sm:w-auto" asChild>
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
                  <span className="text-xs text-gray-500">
                    (PDF, DOC, or DOCX file)
                  </span>
                </div>

                {/* Embedded document viewer */}
                <div className="border rounded-lg overflow-hidden h-[400px] bg-gray-50 dark:bg-gray-900">
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
                        <div className="mb-4 text-gray-600">
                          <p>PDF viewer may not work directly due to security restrictions.</p>
                          <p className="mt-2 text-sm">Please use the button below to view the resume:</p>
                        </div>
                        <Button className="mt-2" asChild>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-400">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p className="mb-2 text-gray-600 dark:text-gray-300">
                        This document type cannot be previewed directly
                      </p>
                      <p className="mb-4 text-sm text-gray-500">
                        Please use the "Open Resume in New Tab" button to view this document
                      </p>
                      <Button variant="outline" className="gap-2" asChild>
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
              <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-gray-400">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <path d="M13 2v7h7"></path>
                  <circle cx="12" cy="15" r="1"></circle>
                  <path d="M12 12v.01"></path>
                </svg>
                <p className="mb-2 text-gray-600 dark:text-gray-300">No resume was uploaded</p>
                <p className="text-sm text-gray-500">The applicant did not provide a resume with their application.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 pt-2 bg-white dark:bg-gray-950">
          {status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isUpdating}
                className="gap-1"
              >
                <XCircle className="w-4 h-4" /> Reject
              </Button>
              <Button
                onClick={onApprove}
                disabled={isUpdating}
                className="gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={onClose}>Close</Button>
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
