import React, { useState } from 'react';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserCog, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Users = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useGetAllUsersQuery(selectedTab !== 'all' ? selectedTab : '');
  const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await updateRole({ userId, role }).unwrap();
      toast.success(`User role updated to ${role} successfully`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update user role');
    }
  };

  const filteredUsers = data?.users?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="pt-10 space-y-6 relative text-white">
      <h1 className="text-3xl font-black text-white">User Management</h1>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/[0.05] p-1.5 rounded-2xl h-auto">
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">All Users</TabsTrigger>
          <TabsTrigger value="student" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Students</TabsTrigger>
          <TabsTrigger value="instructor" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Instructors</TabsTrigger>
          <TabsTrigger value="admin" className="rounded-xl data-[state=active]:bg-[#E8602E] data-[state=active]:text-white font-bold py-2.5">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card className="bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] overflow-hidden">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl font-black">
                  {selectedTab === 'all' ? 'All Users' :
                    `${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}s`}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#888]" />
                  <Input
                    placeholder="Search users..."
                    className="w-full pl-9 md:w-64 bg-[#050505] border-white/[0.05] text-white focus-visible:ring-[#E8602E]/40 focus-visible:border-[#E8602E]/40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <UsersTableSkeleton />
              ) : (
                <UsersTable
                  users={filteredUsers}
                  onEdit={handleEditUser}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onUpdateRole={handleUpdateRole}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};

const UsersTable = ({ users, onEdit }) => {
  if (users.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-white/[0.02]">
        <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">User</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Email</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Role</TableHead>
          <TableHead className="font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Joined On</TableHead>
          <TableHead className="text-right font-bold text-[#888] h-12 uppercase tracking-wider text-[10px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-white/[0.1]">
                  <AvatarImage
                    src={
                      user.photoUrl ||
                      (user.role === 'admin'
                        ? "https://github.com/shadcn.png"
                        : user.role === 'instructor'
                          ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                          : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                    }
                  />
                  <AvatarFallback className="bg-[#111] text-white">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-white text-sm">{user.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-[#aaa] text-sm">{user.email}</TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell className="text-[#aaa] text-sm">
              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-2 text-[#888] hover:text-[#E8602E] hover:bg-[#E8602E]/10"
              >
                <UserCog className="w-4 h-4" />
                Edit Role
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const RoleBadge = ({ role }) => {
  const variants = {
    student: "bg-green-500/10 text-green-400 border-green-500/20",
    instructor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    admin: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  };

  return (
    <Badge className={`${variants[role]} border font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5`}>
      {role}
    </Badge>
  );
};

const EditUserDialog = ({
  user,
  isOpen,
  onClose,
  onUpdateRole,
  isUpdating
}) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  const handleSubmit = () => {
    if (selectedRole !== user.role) {
      onUpdateRole(user._id, selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0a0a] border-white/[0.05] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Edit User Role</DialogTitle>
          <DialogDescription className="text-[#888]">
            Change the role for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={
                  user.photoUrl ||
                  (user.role === 'admin'
                    ? "https://github.com/shadcn.png"
                    : user.role === 'instructor'
                      ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                      : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                }
              />
              <AvatarFallback className="bg-[#111] text-white">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold">{user.name}</h3>
              <p className="text-sm text-[#888]">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#E8602E]">User Role</label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="bg-[#050505] border-white/[0.05] focus:ring-[#E8602E]/40 focus:border-[#E8602E]/40">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/[0.05] text-white">
                <SelectItem value="student" className="focus:bg-white/[0.04] focus:text-white">Student</SelectItem>
                <SelectItem value="instructor" className="focus:bg-white/[0.04] focus:text-white">Instructor</SelectItem>
                <SelectItem value="admin" className="focus:bg-white/[0.04] focus:text-white">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/[0.04] text-[#aaa]">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || selectedRole === user.role}
            className="bg-[#E8602E] text-white hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20"
          >
            {isUpdating ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UsersTableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <div className="grid grid-cols-5 gap-4 p-4 border-b">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-24 h-4" />
            </div>
            <Skeleton className="h-4" />
            <Skeleton className="w-20 h-6" />
            <Skeleton className="h-4" />
            <Skeleton className="w-20 h-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
