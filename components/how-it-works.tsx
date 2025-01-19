import { FileText, Brain, ClipboardCheck } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: "Upload Document",
    description: "Simply drag and drop your PDF document. Our secure upload makes getting started quick and easy."
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI scans every line using advanced language models to analyze your document and identify critical areas that need your attention."
  },
  {
    icon: ClipboardCheck,
    title: "Review Analysis",
    description: "Get an immediate breakdown with a clear summary, potential risks, and actionable recommendations for your contract."
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
