interface CryptoTopupCompleteProps {
  onFinish: () => void;
}

function CryptoTopupComplete({ onFinish }: CryptoTopupCompleteProps) {
  return (
    <div className="flex size-full flex-col justify-center items-center gap-3">
      <div>
        <div className="font-bold mt-4 text-xl">Purchase Complete</div>
      </div>

      <div className="text-sm text-center">
        Payment has been sent. Your account will be credited shortly.
      </div>

      <div className="mt-2 flex w-full justify-end border-t border-dark-grey px-6 py-4">
        <div className="grow"></div>
        <button
          className="text-black border border-dark-grey bg-primary px-4 py-2 rounded"
          onClick={onFinish}
        >
          Finish
        </button>
      </div>
    </div>
  );
}

export default CryptoTopupComplete;
