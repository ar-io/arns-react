const Placeholder = ({ className }: { className?: string }) => {
  return (
    <div
      className={`h-3.5 w-[6.25rem] animate-pulse space-y-3 rounded bg-transparent-100-16 ${className}`}
    />
  );
};

export default Placeholder;
