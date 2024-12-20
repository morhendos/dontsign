'use client';

import { Button } from "@/components/ui/button";
import { trackFileUpload, trackAnalysisComplete, trackError } from '@/lib/analytics-events';

export function AnalyticsTest() {
  const testEvents = () => {
    // Test file upload event
    trackFileUpload('pdf', 1024 * 1024);

    // Test analysis complete event
    trackAnalysisComplete('contract', 2.5);

    // Test error event
    trackError('test', 'This is a test error');
  };

  return (
    <div className="p-4">
      <Button 
        onClick={testEvents}
        className="bg-blue-500 hover:bg-blue-700"
      >
        Test Analytics Events
      </Button>
    </div>
  );
}