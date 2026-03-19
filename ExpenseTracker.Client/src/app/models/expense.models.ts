export interface ExpenseDto {
  id: string;
  title: string;
  amount: number;
  date: string; // yyyy-mm-dd
  categoryId: string;
  categoryName: string;
  notes?: string | null;
  createdAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  date: string; // yyyy-mm-dd
  categoryId: string;
  notes?: string | null;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {}

