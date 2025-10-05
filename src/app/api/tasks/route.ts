import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import admin from '@/lib/firebase/admin';
import { CreateTaskSchema, Task } from '@/types';

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

// GET /api/tasks
export async function GET(request: Request) {
  const userId = await verifyToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : null,
        createdAt: (data.createdAt as Timestamp).toDate(),
      };
    });
    return NextResponse.json(tasks as Task[]);
  } catch (error) {
    console.error('Error fetching tasks: ', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  const userId = await verifyToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const json = await request.json();
    const parsedData = CreateTaskSchema.parse(json);

    const newTaskData = {
      ...parsedData,
      userId,
      createdAt: Timestamp.now(),
      dueDate: parsedData.dueDate ? Timestamp.fromDate(new Date(parsedData.dueDate)) : null,
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), newTaskData);
    
    return NextResponse.json({ id: docRef.id, ...newTaskData }, { status: 201 });
  } catch (error) {
    console.error('Error creating task: ', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
