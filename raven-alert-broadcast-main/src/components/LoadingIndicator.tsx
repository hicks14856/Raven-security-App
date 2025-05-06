
const LoadingIndicator = () => {
  return (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-muted-foreground">Getting your location...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
