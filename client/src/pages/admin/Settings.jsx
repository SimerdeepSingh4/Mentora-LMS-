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
    <div className="pt-10 space-y-8 relative text-white">
      <h1 className="text-3xl font-black text-white">Admin Settings</h1>
      
      <Card className="bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] overflow-hidden">
        <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
          <CardTitle className="text-xl font-black">Notification Settings</CardTitle>
          <CardDescription className="text-[#888]">
            Configure how you receive notifications about platform activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.05]">
            <div>
              <Label htmlFor="new-applications" className="font-bold text-white text-base">New Instructor Applications</Label>
              <p className="text-sm text-[#888] mt-1">
                Receive notifications when new instructor applications are submitted
              </p>
            </div>
            <Switch id="new-applications" defaultChecked className="data-[state=checked]:bg-[#E8602E]" />
          </div>
          
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.05]">
            <div>
              <Label htmlFor="new-users" className="font-bold text-white text-base">New User Registrations</Label>
              <p className="text-sm text-[#888] mt-1">
                Receive notifications when new users register on the platform
              </p>
            </div>
            <Switch id="new-users" defaultChecked className="data-[state=checked]:bg-[#E8602E]" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-bold text-white text-base">Email Notifications</Label>
              <p className="text-sm text-[#888] mt-1">
                Receive notifications via email in addition to in-app notifications
              </p>
            </div>
            <Switch id="email-notifications" className="data-[state=checked]:bg-[#E8602E]" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] overflow-hidden">
        <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
          <CardTitle className="text-xl font-black">Application Review Settings</CardTitle>
          <CardDescription className="text-[#888]">
            Configure how instructor applications are processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.05]">
            <div>
              <Label htmlFor="auto-reject" className="font-bold text-white text-base">Auto-Reject Incomplete Applications</Label>
              <p className="text-sm text-[#888] mt-1">
                Automatically reject applications with missing information
              </p>
            </div>
            <Switch id="auto-reject" className="data-[state=checked]:bg-[#E8602E]" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-applicants" className="font-bold text-white text-base">Notify Applicants</Label>
              <p className="text-sm text-[#888] mt-1">
                Send email notifications to applicants when their status changes
              </p>
            </div>
            <Switch id="notify-applicants" defaultChecked className="data-[state=checked]:bg-[#E8602E]" />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-[#E8602E] text-white hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20 px-8 py-6 text-base font-bold">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
