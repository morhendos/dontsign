interface AnalyzerLayoutProps {
  children: React.ReactNode;
}

export const AnalyzerLayout = ({ children }: AnalyzerLayoutProps) => {
  return (
    <section className="w-full">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
        <div className="max-w-5xl mx-auto py-20">
          {children}
        </div>
      </div>
    </section>
  );
};