export interface LoanCalculation {
  loanAmount: number
  monthlyInterestRate: number
  repaymentMonths: number
  monthlyInterest: number
  totalPayable: number
  emiAmount: number
}

export function calculateLoan(
  loanAmount: number,
  monthlyInterestRatePercent: number,
  repaymentMonths: number
): LoanCalculation {
  const monthlyInterest = (loanAmount * monthlyInterestRatePercent) / 100
  const totalPayable = loanAmount + (monthlyInterest * repaymentMonths)
  const emiAmount = totalPayable / repaymentMonths

  return {
    loanAmount,
    monthlyInterestRate: monthlyInterestRatePercent,
    repaymentMonths,
    monthlyInterest: Math.round(monthlyInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    emiAmount: Math.round(emiAmount * 100) / 100,
  }
}
