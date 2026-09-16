import { useEffect, useRef } from "react";
import { formatKoboToNaira, NIP_TRANSFER_FEE_KOBO } from "@/lib/format-money";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Delete, Lock, Loader2, ShieldAlert } from "lucide-react";

interface StepPinProps {
  pin: string;
  amountKobo: number;
  recipientName: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onChangePin: (pin: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function StepPin({
  pin,
  amountKobo,
  recipientName,
  isSubmitting,
  errorMessage,
  onChangePin,
  onSubmit,
  onBack,
}: StepPinProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalDebitKobo = amountKobo + NIP_TRANSFER_FEE_KOBO;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      onChangePin(nextPin);
      if (nextPin.length === 4) {
        // Ready to submit
      }
    }
  };

  const handleBackspace = () => {
    onChangePin(pin.slice(0, -1));
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="space-y-4">
      {/* Hidden input for physical keyboard entry */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
          onChangePin(val);
        }}
        className="sr-only"
        aria-label="Enter 4-digit transaction PIN"
        autoFocus
      />

      {/* Summary Glance */}
      <div className="text-center">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Authorizing debit of
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-slate-50 tabular-nums">
          {formatKoboToNaira(totalDebitKobo)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          to <strong className="text-slate-900 dark:text-slate-50">{recipientName}</strong>
        </div>
      </div>

      {/* 4-Digit Masked Indicators */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.focus()}
        className="flex justify-center items-center gap-3 py-2 cursor-pointer focus-visible:outline-none"
      >
        {[0, 1, 2, 3].map((index) => {
          const isFilled = index < pin.length;
          return (
            <div
              key={index}
              className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                isFilled
                  ? "border-[#002D62] dark:border-[#D4AF37] bg-blue-50 dark:bg-amber-950/40 text-[#002D62] dark:text-[#D4AF37] text-2xl font-black shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
              }`}
            >
              {isFilled ? "•" : ""}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-800 dark:text-red-300 border border-red-200/80 dark:border-red-900/60"
        >
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Demo PIN Helper Note */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
        Demo PIN:{" "}
        <strong className="font-mono text-[#002D62] dark:text-[#D4AF37]">
          1234
        </strong>{" "}
        or{" "}
        <strong className="font-mono text-[#002D62] dark:text-[#D4AF37]">
          0000
        </strong>
      </div>

      {/* Numeric Keypad for Mobile / Mouse accessibility */}
      <div className="grid grid-cols-3 gap-2 max-w-70 mx-auto pt-1">
        {keypad.map((k, i) => {
          if (k === "") {
            return <div key={i} />;
          }
          if (k === "del") {
            return (
              <button
                key={i}
                type="button"
                onClick={handleBackspace}
                disabled={pin.length === 0 || isSubmitting}
                className="flex h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Backspace"
              >
                <Delete className="h-5 w-5" />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKeyPress(k)}
              disabled={pin.length >= 4 || isSubmitting}
              className="flex h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-lg text-slate-900 dark:text-slate-50 transition-colors disabled:opacity-40 shadow-2xs active:scale-95 cursor-pointer"
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* Submit / Back Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-11 px-4 gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={pin.length !== 4 || isSubmitting}
          className="flex-1 h-11 bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 hover:bg-[#00224b] dark:hover:bg-[#c49f2e] font-semibold gap-2 disabled:cursor-not-allowed shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authorizing via NIP...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Authorize Transfer</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
