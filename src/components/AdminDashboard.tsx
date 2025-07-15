import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskService, TaskData } from '../services/TaskService';
import { AuthService, UserData } from '../services/AuthService';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  RefreshCw, 
  LogOut, 
  Edit, 
  Trash2, 
  Shield,
  UserPlus
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  // 1. Add state for editing task and user
  const [editTaskDialog, setEditTaskDialog] = useState<{ open: boolean, task: TaskData | null }>({ open: false, task: null });
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean, user: UserData | null }>({ open: false, user: null });
  const [editTask, setEditTask] = useState({ title: '', description: '', assignedTo: '', deadline: '', status: 'pending' });
  const [editUser, setEditUser] = useState({ name: '', email: '', role: 'user' as 'admin' | 'user' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTasks, allUsers, taskStats] = await Promise.all([
        TaskService.getAllTasks(),
        AuthService.getAllUsers(),
        TaskService.getTaskStats()
      ]);
      
      // Add user names to tasks
      const tasksWithNames = allTasks.map(task => ({
        ...task,
        assignedToName: allUsers.find(user => user.id === task.assignedTo)?.name || 'Unknown'
      }));
      
      setTasks(tasksWithNames);
      setUsers(allUsers);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      await TaskService.createTask({
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo,
        deadline: new Date(newTask.deadline),
        status: 'pending'
      });
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      setNewTask({ title: '', description: '', assignedTo: '', deadline: '' });
      setShowTaskDialog(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      await AuthService.createUser(newUser.email, newUser.password, newUser.name, newUser.role);
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowUserDialog(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await AuthService.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      window.location.replace('/login'); // <-- redirect after sign out
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: TaskData['status']) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const isOverdue = (deadline: Date, status: TaskData['status']) => {
    return status !== 'completed' && deadline < new Date();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-card border-b shadow-[var(--shadow-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 admin-gradient rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Task Management System</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="task-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-admin-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-admin-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="task-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-status-pending">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-status-pending/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-status-pending" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="task-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-status-in-progress">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-status-in-progress/10 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-status-in-progress" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="task-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-status-completed">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-status-completed/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-status-completed" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="task-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-status-overdue">{stats.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-status-overdue/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-status-overdue" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button className="admin-gradient hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">Title</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter user email"
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter user password"
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'user'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks and Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks */}
          <Card className="task-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Tasks</span>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`status-badge ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        {isOverdue(task.deadline, task.status) && (
                          <Badge className="status-badge status-overdue">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-muted-foreground">
                        <p>Assigned to: {task.assignedToName}</p>
                        <p>Due: {formatDate(task.deadline)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditTaskDialog({ open: true, task });
                          setEditTask({
                            title: task.title,
                            description: task.description,
                            assignedTo: task.assignedTo,
                            deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0,16) : '',
                            status: task.status
                          });
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          <Card className="task-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Users</span>
                <Badge variant="outline">{users.length} users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge 
                          className={`status-badge ${user.role === 'admin' ? 'bg-admin-primary/10 text-admin-primary border-admin-primary/20' : 'bg-primary/10 text-primary border-primary/20'} mt-2`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditUserDialog({ open: true, user });
                          setEditUser({
                            name: user.name,
                            email: user.email,
                            role: user.role
                          });
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Edit Task Dialog */}
      <Dialog open={editTaskDialog.open} onOpenChange={open => setEditTaskDialog({ open, task: open ? editTaskDialog.task : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTaskTitle">Title</Label>
              <Input
                id="editTaskTitle"
                value={editTask.title}
                onChange={e => setEditTask({ ...editTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editTaskDescription">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={editTask.description}
                onChange={e => setEditTask({ ...editTask, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editAssignedTo">Assign To</Label>
              <Select value={editTask.assignedTo} onValueChange={value => setEditTask({ ...editTask, assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editDeadline">Deadline</Label>
              <Input
                id="editDeadline"
                type="datetime-local"
                value={editTask.deadline}
                onChange={e => setEditTask({ ...editTask, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editTask.status} onValueChange={value => setEditTask({ ...editTask, status: value as TaskData['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={async () => {
              if (!editTaskDialog.task) return;
              await TaskService.updateTask(editTaskDialog.task.id, {
                title: editTask.title,
                description: editTask.description,
                assignedTo: editTask.assignedTo,
                deadline: new Date(editTask.deadline),
                status: editTask.status as TaskData['status']
              });
              toast({ title: "Success", description: "Task updated successfully" });
              setEditTaskDialog({ open: false, task: null });
              loadData();
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Edit User Dialog */}
      <Dialog open={editUserDialog.open} onOpenChange={open => setEditUserDialog({ open, user: open ? editUserDialog.user : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editUserName">Name</Label>
              <Input
                id="editUserName"
                value={editUser.name}
                onChange={e => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editUserEmail">Email</Label>
              <Input
                id="editUserEmail"
                type="email"
                value={editUser.email}
                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editUserRole">Role</Label>
              <Select value={editUser.role} onValueChange={value => setEditUser({ ...editUser, role: value as 'admin' | 'user' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={async () => {
              if (!editUserDialog.user) return;
              await AuthService.updateUser(editUserDialog.user.id, {
                name: editUser.name,
                email: editUser.email,
                role: editUser.role
              });
              toast({ title: "Success", description: "User updated successfully" });
              setEditUserDialog({ open: false, user: null });
              loadData();
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};