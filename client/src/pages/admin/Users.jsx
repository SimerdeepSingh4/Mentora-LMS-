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
    <div className="pt-10 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
          <TabsTrigger value="instructor">Instructors</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>
                  {selectedTab === 'all' ? 'All Users' :
                    `${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}s`}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="w-full pl-8 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
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
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-1"
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
    student: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    instructor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  return (
    <Badge className={variants[role]}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
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
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">User Role</label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || selectedRole === user.role}
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
