'use client';

import { Button } from "@/components/ui/button";
import { trackUploadStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';

export function AnalyticsTest() {
  const testEvents = () => {
    // Test upload event
    trackUploadStart('pdf');
    
    // Test analysis complete event
    trackAnalysisComplete('pdf', 5.2);
    
    // Test error event
    trackError('TEST_ERROR', 'This is a test error');
  };

  return (
    <div className="flex justify-center mt-4">
      <Button onClick={testEvents} variant="outline">
        Test Analytics Events
      </Button>
    </div>
  );
}