import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="pt-10 space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how you receive notifications about platform activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-applications">New Instructor Applications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications when new instructor applications are submitted
              </p>
            </div>
            <Switch id="new-applications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-users">New User Registrations</Label>
              <p className="text-sm text-gray-500">
                Receive notifications when new users register on the platform
              </p>
            </div>
            <Switch id="new-users" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email in addition to in-app notifications
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Review Settings</CardTitle>
          <CardDescription>
            Configure how instructor applications are processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-reject">Auto-Reject Incomplete Applications</Label>
              <p className="text-sm text-gray-500">
                Automatically reject applications with missing information
              </p>
            </div>
            <Switch id="auto-reject" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-applicants">Notify Applicants</Label>
              <p className="text-sm text-gray-500">
                Send email notifications to applicants when their status changes
              </p>
            </div>
            <Switch id="notify-applicants" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default Settings;
