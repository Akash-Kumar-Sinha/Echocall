const Loading = () => {
  return (
    <div className="h-24 w-24 relative flex justify-center items-center">
      <div className="absolute top-0 left-0 right-0 bottom-0 m-auto w-12 h-12 border-4 border-yellow-500 rounded-full animate-echospace"></div>
    </div>
  );
};

export default Loading;
