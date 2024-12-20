      // Send for analysis
      const analysisStartTime = Date.now();
      const result = await analyzeContract(formData);
      const analysisTime = Date.now() - analysisStartTime;
      trackPerformanceMetric('api_analysis_time', analysisTime);
      
      if (result) {
        setAnalysis(result);
        const totalTime = Date.now() - startTime;
        trackAnalysisComplete(file.type, totalTime / 1000); // Convert to seconds
        trackPerformanceMetric('total_operation_time', totalTime);