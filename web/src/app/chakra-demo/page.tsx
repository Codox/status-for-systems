import { ChakraDemo } from '@/components/ChakraDemo';

export default function ChakraDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chakra UI Demo</h1>
        <ChakraDemo />
      </div>
    </div>
  );
}
