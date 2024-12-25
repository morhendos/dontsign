import { cn } from '@/lib/utils';

interface AnalysisSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
}

export function AnalysisSection({ title, items, icon }: AnalysisSectionProps) {
  if (!items?.length) return null;

  return (
    <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li 
            key={index}
            className={cn(
              'text-gray-700 dark:text-gray-300 leading-relaxed',
              'animate-in slide-in-from-right duration-300',
              'style-type-disc'
            )}
            style={{
              // Add slight delay for each item
              animationDelay: `${index * 100}ms`
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}