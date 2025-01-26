"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useContactForm } from '@/lib/hooks/useContactForm';

export default function ContactForm() {
  const { formData, isSubmitting, status, handleSubmit, handleChange } = useContactForm();

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

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-gray-900 input-with-subtle-focus"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-gray-900 input-with-subtle-focus"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-gray-900 input-with-subtle-focus"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                required
                disabled={isSubmitting}
                className="min-h-[150px] bg-white dark:bg-gray-900 input-with-subtle-focus"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="w-full sm:w-auto transition-all duration-200 hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}