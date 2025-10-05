import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import admin from '@/lib/firebase/admin';
import { UpdateTaskSchema } from '@/types';

async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// PUT /api/tasks/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = await verifyToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = params.id;
  
  try {
    const json = await request.json();
    const parsedData = UpdateTaskSchema.parse(json);

    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists() || taskSnap.data().userId !== userId) {
      return NextResponse.json({ error: 'Task not found or not owned by user' }, { status: 404 });
    }

    const updateData: any = { ...parsedData };
    if (parsedData.dueDate) {
      updateData.dueDate = Timestamp.fromDate(new Date(parsedData.dueDate));
    }

    await updateDoc(taskRef, updateData);

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error(`Error updating task ${taskId}: `, error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await verifyToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = params.id;
  
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists() || taskSnap.data().userId !== userId) {
      return NextResponse.json({ error: 'Task not found or not owned by user' }, { status: 404 });
    }

    await deleteDoc(taskRef);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`Error deleting task ${taskId}: `, error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
