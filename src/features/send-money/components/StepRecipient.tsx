import { useEffect, useState } from "react";
import { Bank, Beneficiary } from "../types";
import {
  useBanks,
  useBeneficiaries,
  useResolveAccount,
} from "../hooks/useBanks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  Loader2,
  User,
  Users,
  AlertCircle,
  Search,
  ChevronDown,
  Hash,
} from "lucide-react";

interface StepRecipientProps {
  selectedBankCode: string;
  selectedBankName: string;
  accountNumber: string;
  resolvedName: string;
  onSelectBank: (bank: Bank) => void;
  onChangeAccount: (account: string) => void;
  onResolveName: (name: string) => void;
  onNext: () => void;
}

export function StepRecipient({
  selectedBankCode,
  selectedBankName,
  accountNumber,
  resolvedName,
  onSelectBank,
  onChangeAccount,
  onResolveName,
  onNext,
}: StepRecipientProps) {
  const { data: banks = [], isLoading: isLoadingBanks } = useBanks();
  const { data: beneficiaries = [] } = useBeneficiaries();
  const resolveMutation = useResolveAccount();

  const [bankSearch, setBankSearch] = useState("");
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);

  // Auto-resolve account name when bank is selected and account number reaches 10 digits
  useEffect(() => {
    if (selectedBankCode && accountNumber.length === 10) {
      resolveMutation.mutate(
        { accountNumber, bankCode: selectedBankCode },
        {
          onSuccess: (data) => {
            if (data.status === "valid" && data.accountName) {
              onResolveName(data.accountName);
            }
          },
          onError: () => {
            onResolveName("");
          },
        },
      );
    } else if (accountNumber.length < 10) {
      onResolveName("");
    }
  }, [accountNumber, selectedBankCode]);

  const handleSelectBeneficiary = (ben: Beneficiary) => {
    const bank = banks.find((b) => b.code === ben.bankCode) || {
      id: ben.bankCode,
      name: ben.bankName,
      code: ben.bankCode,
      slug: ben.bankCode,
    };
    onSelectBank(bank);
    onChangeAccount(ben.accountNumber);
    onResolveName(ben.name);
    setIsBankPickerOpen(false);
  };

  const filteredBanks = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.code.includes(bankSearch),
  );

  const popularBanks = banks.filter((b) => b.isPopular).slice(0, 6);

  const isValid =
    selectedBankCode.length > 0 &&
    accountNumber.length === 10 &&
    resolvedName.length > 0 &&
    !resolveMutation.isPending;

  return (
    <div className="space-y-4">
      {/* 1. Quick Beneficiaries */}
      {beneficiaries.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            <span>Recent Beneficiaries</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {beneficiaries.map((ben) => (
              <button
                key={ben.id}
                type="button"
                onClick={() => handleSelectBeneficiary(ben)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-left text-xs transition-all hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 shrink-0 shadow-2xs cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002D62] text-[10px] font-bold text-[#D4AF37]">
                  {ben.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-50 truncate max-w-24">
                    {ben.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-24">
                    {ben.bankName.split(" ")[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Destination Bank Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="bank-selector"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Destination Bank / Institution
          </label>
          {selectedBankName && !isBankPickerOpen && (
            <button
              type="button"
              onClick={() => setIsBankPickerOpen(true)}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
            >
              Browse all banks
            </button>
          )}
        </div>

        {/* Popular Quick Bank Chips */}
        {!isBankPickerOpen && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {popularBanks.map((bank) => {
              const isSelected = selectedBankCode === bank.code;
              return (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => {
                    onSelectBank(bank);
                    setIsBankPickerOpen(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-2xs font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-50"
                  }`}
                >
                  {bank.name
                    .replace(" of Nigeria", "")
                    .replace(" (GTBank)", "")
                    .replace(" Microfinance Bank", "")}
                </button>
              );
            })}
          </div>
        )}

        {/* Bank Picker Trigger / Selected Bank Display / Search Panel */}
        {isBankPickerOpen ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Select Destination Bank
              </span>
              <button
                type="button"
                onClick={() => setIsBankPickerOpen(false)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search 20+ institutions or NIP code..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="h-9 pl-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50"
                autoFocus
              />
            </div>

            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-1 divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingBanks ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  Loading banks...
                </div>
              ) : filteredBanks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No banks found matching "{bankSearch}"
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredBanks.map((bank) => {
                    const isSelected = selectedBankCode === bank.code;
                    return (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => {
                          onSelectBank(bank);
                          setIsBankPickerOpen(false);
                          setBankSearch("");
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-slate-50"
                        }`}
                      >
                        <span className="font-medium truncate mr-2">{bank.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          NIP {bank.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            id="bank-selector"
            onClick={() => setIsBankPickerOpen(true)}
            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
              selectedBankName
                ? "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 shadow-2xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                  selectedBankName
                    ? "bg-blue-50 dark:bg-blue-950/50 text-[#002D62] dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200/80 dark:border-slate-700"
                }`}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                {selectedBankName ? (
                  <>
                    <div className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate">
                      {selectedBankName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      NIBSS NIP Code: {selectedBankCode}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                    {isLoadingBanks
                      ? "Loading institutions..."
                      : "Select or search bank..."}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedBankName ? (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                  Change
                </span>
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </button>
        )}
      </div>

      {/* 3. 10-Digit NUBAN Account Number Input */}
      <div>
        <label
          htmlFor="nuban-input"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          10-Digit NUBAN Account Number
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Hash className="h-4 w-4" />
          </div>
          <Input
            id="nuban-input"
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="0123456789"
            value={accountNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              onChangeAccount(val);
            }}
            className="font-mono text-base tracking-wider pl-9 pr-10 h-11 bg-white dark:bg-slate-900"
            aria-describedby="account-resolution-status"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {resolveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            ) : resolvedName ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : null}
          </div>
        </div>
      </div>

      {/* 4. Real-Time NIBSS Name Resolution Banner */}
      <div id="account-resolution-status" aria-live="polite">
        {resolveMutation.isPending && (
          <div className="flex items-center gap-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/50 p-3 text-xs text-[#002D62] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
            <Loader2 className="h-4 w-4 animate-spin text-[#002D62] dark:text-blue-300 shrink-0" />
            <span>Resolving account name via NIBSS NIP Switch...</span>
          </div>
        )}

        {resolvedName && !resolveMutation.isPending && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 p-3 text-xs text-emerald-950 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Verified Account Holder
                </div>
                <div className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                  {resolvedName}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10px] bg-white dark:bg-slate-900 font-semibold"
            >
              BVN Linked
            </Badge>
          </div>
        )}

        {resolveMutation.isError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-800 dark:text-red-300 border border-red-200/80 dark:border-red-900/60">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{resolveMutation.error.message}</span>
          </div>
        )}
      </div>

      {/* 5. Next CTA Action */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="w-full h-11 bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 hover:bg-[#001D40] dark:hover:bg-[#c49f2e] font-semibold disabled:cursor-not-allowed shadow-xs"
        >
          Proceed to Amount
        </Button>
      </div>
    </div>
  );
}
