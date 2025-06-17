import { MUIDemo } from '@/components/MUIDemo';

export default function MUIDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Material UI Demo</h1>
        <MUIDemo />
      </div>
    </div>
  );
}
