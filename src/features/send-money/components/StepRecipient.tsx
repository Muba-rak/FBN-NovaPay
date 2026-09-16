import React, { useEffect, useState } from "react";
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
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const popularBanks = banks.filter((b) => b.isPopular).slice(0, 6);

  const isValid =
    selectedBankCode.length > 0 &&
    accountNumber.length === 10 &&
    resolvedName.length > 0 &&
    !resolveMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Quick Beneficiaries */}
      {beneficiaries.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            <span>Recent Beneficiaries</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {beneficiaries.map((ben) => (
              <button
                key={ben.id}
                type="button"
                onClick={() => handleSelectBeneficiary(ben)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left text-xs transition-colors hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 shrink-0"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002D62] text-[10px] font-bold text-[#D4AF37]">
                  {ben.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px]">
                    {ben.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {ben.bankName.split(" ")[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bank Selector */}
      <div>
        <label
          htmlFor="bank-selector"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Destination Bank / Institution
        </label>

        {/* Popular Bank Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {popularBanks.map((bank) => (
            <button
              key={bank.code}
              type="button"
              onClick={() => {
                onSelectBank(bank);
                setIsBankPickerOpen(false);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedBankCode === bank.code
                  ? "bg-[#002D62] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {bank.name
                .replace(" of Nigeria", "")
                .replace(" (GTBank)", "")
                .replace(" Microfinance Bank", "")}
            </button>
          ))}
        </div>

        {/* Selected Bank Trigger / Search */}
        <div className="relative">
          <button
            type="button"
            id="bank-selector"
            onClick={() => setIsBankPickerOpen(!isBankPickerOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-slate-400" />
              {selectedBankName ||
                (isLoadingBanks
                  ? "Loading banks..."
                  : "Select or search bank...")}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Change
            </span>
          </button>

          {isBankPickerOpen && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-[#112240] max-h-56 overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-[#112240] pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search 20+ institutions..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-0.5">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => {
                      onSelectBank(bank);
                      setIsBankPickerOpen(false);
                      setBankSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      selectedBankCode === bank.code
                        ? "bg-amber-50 text-amber-900 font-semibold dark:bg-amber-950/40 dark:text-amber-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{bank.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      NIP {bank.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 10-Digit NUBAN Account Number Input */}
      <div>
        <label
          htmlFor="nuban-input"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          10-Digit NUBAN Account Number
        </label>
        <div className="relative">
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
            className="font-mono text-base tracking-widest pl-3.5 pr-10 h-11"
            aria-describedby="account-resolution-status"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {resolveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            ) : resolvedName ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Real-Time NIBSS Name Resolution Banner */}
      <div id="account-resolution-status" aria-live="polite">
        {resolveMutation.isPending && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            <span>Resolving account name via NIBSS NIP Switch...</span>
          </div>
        )}

        {resolvedName && !resolveMutation.isPending && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                  Verified Account Holder
                </div>
                <div className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  {resolvedName}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-400 text-emerald-700 dark:text-emerald-300 text-[10px]"
            >
              BVN Linked
            </Badge>
          </div>
        )}

        {resolveMutation.isError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/80 dark:border-red-900/40">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{resolveMutation.error.message}</span>
          </div>
        )}
      </div>

      {/* Next CTA */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="w-full h-11 bg-[#002D62] text-white hover:bg-[#00224b] hover:text-white dark:bg-[#D4AF37] dark:text-slate-900 font-semibold disabled:cursor-not-allowed"
        >
          Proceed to Amount
        </Button>
      </div>
    </div>
  );
}
