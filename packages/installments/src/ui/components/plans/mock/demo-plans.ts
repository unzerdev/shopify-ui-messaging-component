import type { GetInstallmentPlansResponse } from '../../../../application/dto';

function futureDate(monthsFromNow: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toISOString().split('T')[0];
}

export function generateDemoPlans(amount: number, currency: string): GetInstallmentPlansResponse {
  const rateOptions = [3, 4, 6, 9, 12];

  const plans = rateOptions.map(n => {
    const interestPct = n <= 3 ? 0 : n * 0.005;
    const totalAmount = amount * (1 + interestPct);
    const monthlyAmount = totalAmount / n;

    return {
      numberOfRates: n,
      totalAmount: totalAmount.toFixed(2),
      nominalInterestRate: interestPct,
      effectiveInterestRate: interestPct,
      interestAmount: (totalAmount - amount).toFixed(2),
      minimumInstallmentFee: '0.00',
      secciUrl: '',
      installmentRates: Array.from({ length: n }, (_, i) => ({
        date: futureDate(i + 1),
        rate: monthlyAmount.toFixed(2),
      })),
      monthlyAmount,
      isInterestFree: interestPct === 0,
    };
  });

  return {
    success: true,
    plans,
    totalPlans: plans.length,
    requestAmount: amount,
    requestCurrency: currency,
  };
}
