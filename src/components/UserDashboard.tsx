import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskService, TaskData } from '../services/TaskService';
import { AuthService, UserData } from '../services/AuthService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, LogOut, RefreshCw } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AuthService.getCurrentUserData();
      if (userData) {
        setUser(userData);
        await loadTasks(userData.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (userId: string) => {
    try {
      const [userTasks, taskStats] = await Promise.all([
        TaskService.getTasksForUser(userId),
        TaskService.getTaskStats(userId)
      ]);
      setTasks(userTasks);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskData['status']) => {
    setUpdatingTask(taskId);
    try {
      await TaskService.updateTaskStatus(taskId, newStatus);
      if (user) {
        await loadTasks(user.id);
      }
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
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
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
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
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Welcome back, {user?.name}
                </h1>
                <p className="text-sm text-muted-foreground">User Dashboard</p>
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
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
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

        {/* Tasks List */}
        <Card className="task-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Tasks</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => user && loadTasks(user.id)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tasks assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-[var(--shadow-elevated)] transition-[var(--transition-smooth)]">
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
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {formatDate(task.deadline)}
                      </div>
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                            disabled={updatingTask === task.id}
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(task.id, 'completed')}
                            disabled={updatingTask === task.id}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                            disabled={updatingTask === task.id}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};