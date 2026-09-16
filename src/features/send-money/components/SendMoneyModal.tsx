import { useState, useEffect } from "react";
import { Bank, SendMoneyPayload, SendMoneyResponse } from "../types";
import { useSendMoney } from "../hooks/useSendMoney";
import { StepRecipient } from "./StepRecipient";
import { StepAmount } from "./StepAmount";
import { StepReview } from "./StepReview";
import { StepPin } from "./StepPin";
import { TransferSuccessModal } from "./TransferSuccessModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { NIP_TRANSFER_FEE_KOBO } from "@/lib/format-money";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = "recipient" | "amount" | "review" | "pin" | "success";

export function SendMoneyModal({ isOpen, onClose }: SendMoneyModalProps) {
  const { toast } = useToast();
  const sendMoneyMutation = useSendMoney();

  // Wizard State
  const [step, setStep] = useState<WizardStep>("recipient");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [amountKobo, setAmountKobo] = useState(0);
  const [narration, setNarration] = useState("");
  const [pin, setPin] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [successResponse, setSuccessResponse] =
    useState<SendMoneyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset or initialize state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep("recipient");
      setSelectedBank(null);
      setAccountNumber("");
      setResolvedName("");
      setAmountKobo(0);
      setNarration("");
      setPin("");
      setErrorMessage("");
      setSuccessResponse(null);
      setIdempotencyKey(generateIdempotencyKey());
    }
  }, [isOpen]);

  const handleReset = () => {
    setStep("recipient");
    setSelectedBank(null);
    setAccountNumber("");
    setResolvedName("");
    setAmountKobo(0);
    setNarration("");
    setPin("");
    setErrorMessage("");
    setSuccessResponse(null);
    setIdempotencyKey(generateIdempotencyKey());
  };

  const handleSubmitTransfer = () => {
    if (
      !selectedBank ||
      !accountNumber ||
      !resolvedName ||
      amountKobo <= 0 ||
      pin.length !== 4
    ) {
      return;
    }

    setErrorMessage("");

    const payload: SendMoneyPayload = {
      recipientBankCode: selectedBank.code,
      recipientBankName: selectedBank.name,
      recipientAccount: accountNumber,
      recipientName: resolvedName,
      amountKobo,
      feeKobo: NIP_TRANSFER_FEE_KOBO,
      narration: narration || "Transfer from NovaBiz",
      pin,
      idempotencyKey,
    };

    sendMoneyMutation.mutate(payload, {
      onSuccess: (data) => {
        setSuccessResponse(data);
        setStep("success");
        toast({
          type: "success",
          title: "Transfer Completed",
          description: `₦${(amountKobo / 100).toLocaleString("en-US")} sent to ${resolvedName}.`,
        });
      },
      onError: (err) => {
        setErrorMessage(
          err.message || "Transfer failed. Your balance was not debited.",
        );
        toast({
          type: "error",
          title: "Transfer Rejected",
          description:
            err.message ||
            "NIBSS network timeout. Balance was safely restored.",
        });
      },
    });
  };

  const getStepNumber = (): number => {
    switch (step) {
      case "recipient":
        return 1;
      case "amount":
        return 2;
      case "review":
        return 3;
      case "pin":
        return 4;
      case "success":
        return 4;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {step !== "success" && (
          <DialogHeader className="p-5 sm:p-6 pb-3.5 border-b border-slate-100/90 bg-white shrink-0 space-y-2">
            <div className="flex items-center justify-between pr-7">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#002D62] border border-blue-200/60">
                  <Send className="h-3.5 w-3.5" />
                </div>
                <span>Send Money</span>
              </DialogTitle>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200 shrink-0">
                Step {getStepNumber()} of 4
              </span>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Instant NIBSS NIP Interbank Settlement
            </DialogDescription>

            {/* Step Progress Bar */}
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    s <= getStepNumber() ? "bg-[#002D62]" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </DialogHeader>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-110px)]">
          {step === "recipient" && (
            <StepRecipient
              selectedBankCode={selectedBank?.code || ""}
              selectedBankName={selectedBank?.name || ""}
              accountNumber={accountNumber}
              resolvedName={resolvedName}
              onSelectBank={(bank) => setSelectedBank(bank)}
              onChangeAccount={(acc) => setAccountNumber(acc)}
              onResolveName={(name) => setResolvedName(name)}
              onNext={() => setStep("amount")}
            />
          )}

          {step === "amount" && selectedBank && (
            <StepAmount
              amountKobo={amountKobo}
              narration={narration}
              recipientName={resolvedName}
              recipientAccount={accountNumber}
              recipientBankName={selectedBank.name}
              onChangeAmountKobo={setAmountKobo}
              onChangeNarration={setNarration}
              onBack={() => setStep("recipient")}
              onNext={() => setStep("review")}
            />
          )}

          {step === "review" && selectedBank && (
            <StepReview
              recipientName={resolvedName}
              recipientAccount={accountNumber}
              recipientBankName={selectedBank.name}
              amountKobo={amountKobo}
              narration={narration}
              onBack={() => setStep("amount")}
              onNext={() => setStep("pin")}
            />
          )}

          {step === "pin" && (
            <StepPin
              pin={pin}
              amountKobo={amountKobo}
              recipientName={resolvedName}
              isSubmitting={sendMoneyMutation.isPending}
              errorMessage={errorMessage}
              onChangePin={setPin}
              onSubmit={handleSubmitTransfer}
              onBack={() => setStep("review")}
            />
          )}

          {step === "success" && successResponse && (
            <TransferSuccessModal
              response={successResponse}
              onClose={onClose}
              onNewTransfer={handleReset}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
