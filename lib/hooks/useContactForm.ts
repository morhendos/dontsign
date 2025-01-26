import { useState } from 'react';

type FormStatus = {
  type: "success" | "error" | null;
  message: string | null;
};

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>({ type: null, message: null });
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: null });

    try {
      const response = await fetch("/api/submit-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you as soon as possible.",
      });
      setFormData(initialFormData);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred while sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    isSubmitting,
    status,
    handleSubmit,
    handleChange,
  };
}

export type { FormStatus, FormData };