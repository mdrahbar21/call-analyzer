export function CenteredWrapper({ children }) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden p-5">
          {children}
        </div>
      </div>
    );
  }
  