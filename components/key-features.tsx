import { AlertTriangle, Highlighter, FileText } from 'lucide-react'

const features = [
  {
    icon: AlertTriangle,
    title: "Risk Detection",
    description: "Automatically flags high-risk clauses and unfavorable terms so you can make informed decisions."
  },
  {
    icon: Highlighter,
    title: "Key Term Highlights",
    description: "Identifies crucial details like renewal dates, penalties, and liabilities, so you don't miss a thing."
  },
  {
    icon: FileText,
    title: "Clear Summaries",
    description: "Summarizes complex documents into clear insights, giving you a snapshot of what's important."
  }
]

export default function KeyFeatures() {
  return (
    <section id="key-features" className="py-20 px-4 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
