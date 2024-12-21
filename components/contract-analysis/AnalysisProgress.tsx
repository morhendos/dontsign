export function AnalysisProgress() {
  return (
    <>
      <div className="w-full h-16 bg-red-500 my-4 flex items-center justify-center text-white">
        ABOVE PROGRESS BAR
      </div>
      
      <div className="w-full h-8 bg-blue-500 my-4">
        {/* This is where progress bar should be */}
      </div>
      
      <div className="w-full h-16 bg-green-500 my-4 flex items-center justify-center text-white">
        BELOW PROGRESS BAR
      </div>
    </>
  );
}