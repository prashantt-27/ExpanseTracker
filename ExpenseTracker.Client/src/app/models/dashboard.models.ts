export interface DashboardSummaryDto {
  totalExpenses: number;
  currentMonthExpenses: number;
  totalCategories: number;
}

export interface CategoryBreakdownDto {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
}

export interface MonthlyExpensesPointDto {
  year: number;
  month: number;
  totalAmount: number;
}

