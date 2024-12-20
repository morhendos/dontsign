# Google Analytics 4 Implementation Guide

## Overview
This document outlines the GA4 event tracking implementation for the DontSign application.

## Event Categories

### Engagement Events
1. `file_selected`
   - Triggered when a user selects a valid file
   - Label: file type
   - Value: file size in KB

2. `analysis_started`
   - Triggered when analysis begins
   - Label: file type
   - Value: file size in KB

3. `analysis_completed`
   - Triggered when analysis completes successfully
   - Label: file type
   - Value: number of chunks analyzed

### Error Events
1. `file_error`
   - Label: `invalid_type_{filetype}`

2. `analysis_error`
   - PDF errors: `pdf_{error_code}`
   - Analysis errors: `analysis_{error_code}`
   - Unexpected: `unexpected_error`

## Integration Points
- File selection handling (`handleFileSelection`)
- Analysis process (`handleAnalyze`)
- Error handling in both functions

## Testing Events
To verify events in GA4 dashboard:
1. Go to Reports > Realtime
2. Filter by Event name
3. Check event parameters

## GA4 Dashboard Setup
Recommended custom reports:
1. File Upload Success Rate
   - Compare file_selected vs file_error events

2. Analysis Funnel
   - Track progression: selected → started → completed

3. Error Distribution
   - Breakdown of different error types

## Error Codes
PDF Processing Errors:
- empty_file
- corrupt_file
- no_text
- pdf_error

Analysis Errors:
- api_error
- invalid_input
- text_processing
- unknown
