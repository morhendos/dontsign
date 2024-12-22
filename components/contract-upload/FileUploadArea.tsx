"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFProcessingError } from "@/lib/errors";
import { trackUploadStart } from "@/lib/analytics-events";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Upload, FileText } from "lucide-react";
import { AnimatedAppear } from "../ui/animated-appear";
import type { ErrorDisplay } from "@/types/analysis";

interface FileUploadAreaProps {
  file: File | null;
  error: ErrorDisplay | null;
  onFileSelect: (file: File | null) => void;
  isUploading: boolean;
  processingStatus?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadArea({
  file,
  error,
  onFileSelect,
  isUploading,
  processingStatus,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        throw new PDFProcessingError(
          "File too large. Please upload a file smaller than 10MB.",
          "FILE_TOO_LARGE"
        );
      }

      trackUploadStart(file.type);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <AnimatedAppear direction="up" duration={500}>
      <div className="relative w-full max-w-3xl mx-auto mt-8">
        {/* Scale container - only affects background/border */}
        <div
          className={`
            absolute inset-0 rounded-lg border-2 border-dashed
            transition-all duration-300 ease-in-out
            ${isDragging ? 'scale-102' : 'group-hover:scale-101'}
            ${isDragging
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
            }
            ${error
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : ""
            }
            ${file
              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : ""
            }
          `}
        />
        {/* Content container - not affected by scale */}
        <div
          {...getRootProps()}
          className="relative p-8 cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center h-full">
            <input {...getInputProps()} />

            {isUploading ? (
              <AnimatedAppear direction="up" duration={300}>
                <div className="flex flex-col items-center space-y-4">
                  <LoadingSpinner />
                  {processingStatus && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-fadeIn">
                      {processingStatus}
                    </p>
                  )}
                </div>
              </AnimatedAppear>
            ) : file ? (
              <AnimatedAppear direction="up" duration={300}>
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                    <FileText className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-lg font-medium">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                    Click or drop another file to replace
                  </p>
                </div>
              </AnimatedAppear>
            ) : (
              <AnimatedAppear direction="up" duration={300}>
                <div className="flex flex-col items-center space-y-2">
                  <Upload
                    className={`
                      w-12 h-12
                      transition-all duration-300
                      ${isDragging
                        ? "text-blue-500 dark:text-blue-400 scale-110"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110"
                      }
                    `}
                  />
                  <p
                    className={`
                      text-base font-medium
                      transition-colors duration-300
                      ${isDragging
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      }
                    `}
                  >
                    Drop your contract here or click to select
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Supports PDF and DOCX files up to 10MB
                  </p>
                </div>
              </AnimatedAppear>
            )}
          </div>
        </div>
      </div>
    </AnimatedAppear>
  );
}
