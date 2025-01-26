"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from 'lucide-react';

// ... (previous type definitions)

export default function ContactForm() {
  // ... (previous state and handlers)

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status.type && (
            <Alert 
              variant={status.type === "error" ? "destructive" : "default"}
              className={`animate-fadeIn border-2 ${status.type === "success" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <AlertTitle className={`text-lg ${status.type === "success" ? "text-green-800 dark:text-green-200" : ""}`}>
                {status.type === "success" ? "Success!" : "Error"}
              </AlertTitle>
              <AlertDescription className={status.type === "success" ? "text-green-700 dark:text-green-300" : ""}>
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          {/* ... rest of the form remains unchanged ... */}
        </form>
      </CardContent>
    </Card>
  );
}
