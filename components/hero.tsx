'use client'

import { useState, useRef } from 'react'
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'
import { trackFileUpload, trackAnalysisStart, trackAnalysisComplete, trackError, trackUserInteraction, trackPerformanceMetric } from '@/lib/analytics-events';