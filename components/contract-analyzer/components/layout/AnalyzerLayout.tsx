interface AnalyzerLayoutProps {
  children: React.ReactNode;
}

export const AnalyzerLayout = ({ children }: AnalyzerLayoutProps) => {
  return (
    <section className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col w-full p-8 lg:p-12">
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
};