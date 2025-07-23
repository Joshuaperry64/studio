
import { BarChart } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View application analytics and usage data.',
};

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <BarChart className="mr-2" />
        Analytics
      </h1>
      <p className="mb-8">
        Firebase Analytics is enabled for this application. Usage data is being collected to help improve the user experience.
      </p>
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
        <p className="text-sm text-gray-500">
          Analytics data will be displayed here in a future update.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
