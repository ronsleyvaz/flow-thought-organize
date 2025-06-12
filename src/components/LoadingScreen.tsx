
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Loading TranscriptFlow...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
