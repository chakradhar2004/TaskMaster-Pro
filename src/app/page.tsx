import Header from '@/components/header';
import TaskDashboard from '@/components/task-dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
        <TaskDashboard />
      </main>
    </div>
  );
}
