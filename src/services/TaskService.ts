import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  deadline: Date;
  createdAt: Date;
  assignedToName?: string;
  notes?: string; // admin notes
  userNotes?: string; // user notes
}

export class TaskService {
  // Create new task (Admin only)
  static async createTask(taskData: Omit<TaskData, 'id' | 'createdAt' | 'assignedToName'>): Promise<string> {
    const task = {
      ...taskData,
      createdAt: Timestamp.now(),
      deadline: Timestamp.fromDate(taskData.deadline),
      notes: taskData.notes || '',
      userNotes: taskData.userNotes || '',
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), task);
    return docRef.id;
  }

  // Get all tasks (Admin only)
  static async getAllTasks(): Promise<TaskData[]> {
    const tasksSnapshot = await getDocs(
      query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    );
    
    return tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        deadline: data.deadline.toDate(),
        createdAt: data.createdAt.toDate(),
        notes: data.notes || '',
        userNotes: data.userNotes || '',
      } as TaskData;
    });
  }

  // Get tasks assigned to specific user
  static async getTasksForUser(userId: string): Promise<TaskData[]> {
    const tasksSnapshot = await getDocs(
      query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    
    return tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        deadline: data.deadline.toDate(),
        createdAt: data.createdAt.toDate(),
        notes: data.notes || '',
        userNotes: data.userNotes || '',
      } as TaskData;
    });
  }

  // Update task
  static async updateTask(taskId: string, updates: Partial<TaskData>): Promise<void> {
    const updateData: Record<string, unknown> = { ...updates };
    
    // Convert deadline to Timestamp if it's being updated
    if (updateData.deadline && updateData.deadline instanceof Date) {
      updateData.deadline = Timestamp.fromDate(updateData.deadline);
    }
    
    await updateDoc(doc(db, 'tasks', taskId), updateData);
  }

  // Delete task (Admin only)
  static async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));
  }

  // Update task status (User can update their own tasks)
  static async updateTaskStatus(taskId: string, status: TaskData['status']): Promise<void> {
    await updateDoc(doc(db, 'tasks', taskId), { status });
  }

  // Get task statistics
  static async getTaskStats(userId?: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    let tasksQuery = query(collection(db, 'tasks'));
    
    if (userId) {
      tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
    }
    
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status as TaskData['status'],
        assignedTo: data.assignedTo,
        deadline: data.deadline.toDate(),
        createdAt: data.createdAt.toDate(),
        notes: data.notes || '',
        userNotes: data.userNotes || '',
      };
    });
    
    const now = new Date();
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status !== 'completed' && t.deadline < now).length
    };
    
    return stats;
  }
}