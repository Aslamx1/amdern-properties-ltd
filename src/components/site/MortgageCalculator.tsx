import { useState, useMemo } from "react";
import { Calculator, TrendingDown, Info } from "lucide-react";
import { CURRENCIES } from "@/lib/site";
import { useCurrency, formatWithCurrency } from "@/hooks/use-currency";

type MortgageResult = {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
};

function calculateMortgage(price: number, downPayment: number, rateAnnual: number, years: number): MortgageResult {
  const loanAmount = Math.max(0, price - downPayment);
  if (loanAmount <= 0 || years <= 0 || rateAnnual <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalPayment: 0, loanAmount };
  }
  const monthlyRate = rateAnnual / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    loanAmount,
  };
}

export function MortgageCalculator() {
  const { currency } = useCurrency();
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("20");
  const [result, setResult] = useState<MortgageResult | null>(null);

  const handleCalculate = () => {
    const p = Number(price);
    const dp = Number(downPayment);
    const r = Number(rate);
    const y = Number(years);
    if (!Number.isFinite(p) || !Number.isFinite(dp) || !Number.isFinite(r) || !Number.isFinite(y)) {
      return;
    }
    setResult(calculateMortgage(p, dp, r, y));
  };

  const priceNum = Number(price) || 0;
  const downNum = Number(downPayment) || 0;
  const depositPercent = priceNum > 0 ? Math.round((downNum / priceNum) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold">Mortgage Calculator</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Estimate your monthly repayments. Figures are indicative and may vary by lender.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Property price ({currency.code})
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 500000000"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Down payment ({currency.code})
            </span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="e.g. 100000000"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Interest rate (% per year)
            </span>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 12"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Loan term (years)
            </span>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 20"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
            />
          </label>
        </div>

        {depositPercent > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Deposit: {depositPercent}% of property price
          </p>
        )}

        <button
          type="button"
          onClick={handleCalculate}
          className="btn-base btn-primary mt-4 w-full sm:w-auto"
        >
          Calculate
        </button>

        {result && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Monthly payment</p>
              <p className="mt-1 text-xl font-extrabold text-primary">
                {formatWithCurrency(result.monthlyPayment, currency.code)}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total interest</p>
              <p className="mt-1 text-xl font-extrabold text-foreground-strong">
                {formatWithCurrency(result.totalInterest, currency.code)}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total payment</p>
              <p className="mt-1 text-xl font-extrabold text-foreground-strong">
                {formatWithCurrency(result.totalPayment, currency.code)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-md bg-accent-bg p-3 text-xs text-accent-foreground">
          <Info className="h-4 w-4 shrink-0" />
          <p>
            This calculator gives an estimate only. Actual rates depend on the lender, your credit profile,
            and prevailing market conditions in Uganda.
          </p>
        </div>
      </div>
    </div>
  );
}
