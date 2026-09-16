import { Transaction } from '@/features/transactions/types';
import { WalletBalance } from '@/features/dashboard/types';

// Seed Merchant Balance
export const initialMerchantBalance: WalletBalance = {
  merchantId: 'MER-FBN-88392',
  merchantName: 'ALHERI SUPERMARKET & WHOLESALE',
  accountNumber: '3049281029',
  bankName: 'First Bank of Nigeria',
  kycTier: 'Tier 3 (BVN & NIN Verified)',
  currency: 'NGN',
  availableBalanceKobo: 384525000, // ₦3,845,250.00
  ledgerBalanceKobo: 392000000,    // ₦3,920,000.00
  todayInflowKobo: 84250000,       // ₦842,500.00
  todayOutflowKobo: 12500000,      // ₦125,000.00
  pendingSettlementKobo: 7475000,  // ₦74,750.00
  posTerminalCount: 4,
  activeTerminalId: 'FBN-POS-77492',
};

// In-memory mutable balance for interactive sessions
export const currentBalanceState: WalletBalance = { ...initialMerchantBalance };

const NIGERIAN_NAMES = [
  'Amina Garba', 'Emeka Okafor', 'Olufunke Adeleke', 'Chinedu Okonkwo',
  'Hauwa Mohammed', 'Taiwo Balogun', 'Nkechi Eze', 'Fatima Sanusi',
  'Abubakar Danjuma', 'Femi Olatunji', 'Zainab Bello', 'Ifeanyi Nnamdi',
  'Yetunde Bakare', 'Musa Ibrahim', 'Blessing Umeh', 'Kayode Adebayo',
  'Halima Shehu', 'Tochukwu Anozie', 'Simisola Jacobs', 'Usman Aliyu',
  'Kehinde Ogundipe', 'Amarachi Kalu', 'Yusuf Abdullahi', 'Folake Awosika',
  'Uchenna Nwosu', 'Hadiza Tanko', 'Oluwaseun Ajayi', 'Nafisat Gidado',
  'Kelechi Onyeka', 'Omotola Johnson', 'Sulaiman Farouk', 'Chiamaka Obi',
  'Adeola Adelegan', 'Bilyaminu Sani', 'Somtochukwu Ilodibe', 'Bukola Saraki',
];

const NIGERIAN_BANKS = [
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Access Bank', code: '044' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Kuda Microfinance Bank', code: '50211' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Sterling Bank', code: '232' },
];

const POS_TERMINALS = ['FBN-POS-77492', 'FBN-POS-77493', 'FBN-POS-88219', 'FBN-POS-90112'];

const NARRATIONS_CREDIT = [
  'POS Store Purchase - Checkout Lane 1',
  'NovaBiz QR Payment - Fresh Groceries',
  'USSD *894# Payment - Counter 2',
  'POS Terminal Collection - Bakery Section',
  'NovaBiz QR Settlement - Beverages',
  'Web Store Payment - Invoice #',
  'Customer Transfer via NIP Rails',
  'POS Card Payment - Provisions & Staples',
];

const NARRATIONS_DEBIT = [
  'Supplier Payment - Golden Penny Flour Mills',
  'Restock Inventory - Chi Farms Logistics',
  'Electricity Token - Ikeja Electric DisCo',
  'Staff Salary Advance - Store Supervisor',
  'Packaging Supplies - Balogun Market Vendor',
  'Diesel Generator Fuel - Mobil Filling Station',
  'Waste Management & Local Govt Levy',
  'Vendor Payout - Fresh Fruit Distribution',
];

/**
 * Deterministically generates 1,200+ realistic Nigerian merchant transactions
 */
export function generateSeedTransactions(count = 1200): Transaction[] {
  const transactions: Transaction[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Distribute timestamps over last 45 days
    // More transactions concentrated in today and recent days
    let timeOffsetMs: number;
    if (i < 30) {
      // Today (within last 12 hours)
      timeOffsetMs = Math.floor(Math.random() * (12 * 60 * 60 * 1000));
    } else if (i < 120) {
      // Last 3 days
      timeOffsetMs = Math.floor(Math.random() * (3 * 24 * 60 * 60 * 1000));
    } else if (i < 400) {
      // Last 7 days
      timeOffsetMs = Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000));
    } else {
      // Last 45 days
      timeOffsetMs = Math.floor(Math.random() * (45 * 24 * 60 * 60 * 1000));
    }

    const txDate = new Date(now - timeOffsetMs);
    const isCredit = i % 4 !== 0; // ~75% credit inflows, ~25% debit payouts

    const customerName = NIGERIAN_NAMES[i % NIGERIAN_NAMES.length];
    const bank = NIGERIAN_BANKS[i % NIGERIAN_BANKS.length];
    const terminal = POS_TERMINALS[i % POS_TERMINALS.length];

    // Status: 94% successful, 4% pending, 2% failed
    let status: 'successful' | 'pending' | 'failed' = 'successful';
    if (i % 25 === 0) {
      status = 'pending';
    } else if (i % 47 === 0) {
      status = 'failed';
    }

    // Amounts in kobo integers
    let amountKobo: number;
    if (isCredit) {
      // Retail POS payments: ₦850.00 to ₦145,000.00
      const amountsKoboList = [
        85000, 150000, 240000, 350000, 500000, 750000, 1200000, 1850000,
        2500000, 3400000, 5200000, 8900000, 14500000, 22000000, 45000000,
      ];
      amountKobo = amountsKoboList[i % amountsKoboList.length] + ((i * 50) % 10000);
    } else {
      // Supplier payouts: ₦5,000.00 to ₦750,000.00
      const amountsKoboList = [
        500000, 1000000, 2500000, 5000000, 8500000, 15000000, 30000000,
        55000000, 75000000, 120000000,
      ];
      amountKobo = amountsKoboList[i % amountsKoboList.length];
    }

    // Channels
    let channel: Transaction['channel'] = 'pos_terminal';
    if (isCredit) {
      const channels: Transaction['channel'][] = [
        'pos_terminal',
        'qr_code',
        'pos_terminal',
        'ussd',
        'pos_terminal',
        'nip_transfer',
        'web_checkout',
      ];
      channel = channels[i % channels.length];
    } else {
      channel = 'nip_transfer';
    }

    const narration = isCredit
      ? `${NARRATIONS_CREDIT[i % NARRATIONS_CREDIT.length]}${channel === 'web_checkout' ? (1000 + i) : ''}`
      : `${NARRATIONS_DEBIT[i % NARRATIONS_DEBIT.length]}`;

    const accountNumber = `0${Math.floor(100000000 + Math.random() * 900000000)}`;

    transactions.push({
      id: `TX-FBN-${100000 + i}`,
      reference: `FBN-${txDate.getFullYear()}${(txDate.getMonth() + 1).toString().padStart(2, '0')}-${(i + 1).toString().padStart(6, '0')}`,
      type: isCredit ? 'credit' : 'debit',
      channel,
      amountKobo,
      feeKobo: isCredit ? 0 : 1075,
      status,
      senderName: isCredit ? customerName : initialMerchantBalance.merchantName,
      recipientName: isCredit ? initialMerchantBalance.merchantName : customerName,
      recipientAccount: isCredit ? undefined : accountNumber,
      recipientBankName: isCredit ? undefined : bank.name,
      senderBankName: isCredit ? bank.name : 'First Bank of Nigeria',
      narration,
      createdAt: txDate.toISOString(),
      nibssSessionId: `999011${txDate.getTime().toString().slice(-12)}${i.toString().padStart(4, '0')}`,
      terminalId: channel === 'pos_terminal' ? terminal : undefined,
      customerPhone: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
    });
  }

  // Sort newest first
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Global in-memory list for MSW
export const seedTransactions: Transaction[] = generateSeedTransactions(1200);

export function resetTransactionDatabase() {
  currentBalanceState.availableBalanceKobo = initialMerchantBalance.availableBalanceKobo;
  currentBalanceState.ledgerBalanceKobo = initialMerchantBalance.ledgerBalanceKobo;
  currentBalanceState.todayInflowKobo = initialMerchantBalance.todayInflowKobo;
  currentBalanceState.todayOutflowKobo = initialMerchantBalance.todayOutflowKobo;
  seedTransactions.length = 0;
  seedTransactions.push(...generateSeedTransactions(1200));
}
