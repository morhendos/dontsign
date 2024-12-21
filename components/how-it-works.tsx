import { FileText, Brain, FileDown } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: "Upload Document",
    description: "Simply drag and drop your contract, NDA, or legal document. We support PDF, DOCX, and more, making uploads easy."
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI scans every line to highlight key terms, clauses, and potential risks, giving you instant, reliable insights."
  },
  {
    icon: FileDown,
    title: "Download Your Report",
    description: "Get a summary and flagged items in an easy-to-read report. Know what matters before you sign."
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">How it Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-8xl font-bold text-gray-100 dark:text-gray-700 absolute -top-10 -left-6">
                {index + 1}
              </div>
              <div className="relative">
                <step.icon className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
