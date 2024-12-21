interface AnalysisSectionProps {
  title: string;
  items: string[] | undefined;
  icon: React.ReactNode;
}

export function AnalysisSection({ title, items, icon }: AnalysisSectionProps) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="mb-6 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
        {icon}
        {title}
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
        ))}
      </ul>
    </div>
  );
}