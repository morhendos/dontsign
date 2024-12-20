      // Extract text based on file type
      const extractStartTime = Date.now();
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      const extractionTime = Date.now() - extractStartTime;
      trackPerformanceMetric('text_extraction_time', extractionTime);

      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Text extracted successfully',
        level: 'info',
        data: {
          textLength: text.length,
          extractionTime
        }
      });