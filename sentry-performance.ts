import * as Sentry from '@sentry/nextjs';

// Configure performance monitoring thresholds
export function configureSentryPerformance() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.addGlobalEventProcessor((event) => {
    // Only process transactions
    if (event.type !== 'transaction') return event;

    // Define performance thresholds based on operation type
    const thresholds: Record<string, number> = {
      'contract.analyze': 30000,  // 30s for contract analysis
      'ai.analyze': 10000,        // 10s for AI processing
      'analysis.merge': 5000,     // 5s for merging results
      'ui.analyze': 45000,        // 45s for total UI operation
      'pdf.extract': 15000,       // 15s for PDF text extraction
    };

    const threshold = thresholds[event.transaction_info?.source || ''] || 10000;

    // Add performance data
    if (event.start_timestamp && event.timestamp) {
      const duration = (event.timestamp - event.start_timestamp) * 1000;
      event.contexts = event.contexts || {};
      event.contexts.performance = {
        duration,
        threshold,
        isSlowTransaction: duration > threshold,
      };
    }

    return event;
  });

  // Add custom metrics for monitoring
  Sentry.metrics.gauge('contract_analysis.chunks', {
    unit: 'number',
    description: 'Number of chunks in contract analysis',
  });

  Sentry.metrics.gauge('contract_analysis.duration', {
    unit: 'millisecond',
    description: 'Duration of contract analysis',
  });

  Sentry.metrics.gauge('pdf_extraction.duration', {
    unit: 'millisecond',
    description: 'Duration of PDF text extraction',
  });
}
