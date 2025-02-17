interface AnalyzerLayoutProps {
  children: React.ReactNode;
}

export const AnalyzerLayout = ({ children }: AnalyzerLayoutProps) => {
  return (
    <section className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
};