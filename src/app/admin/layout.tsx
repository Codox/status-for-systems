export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mb-4">
              This section is under development. Coming soon!
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 