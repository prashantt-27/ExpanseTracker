import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import {
  CategoryBreakdownDto,
  DashboardSummaryDto,
  MonthlyExpensesPointDto,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  template: `
    <!-- Top summary banner -->
    <div class="summary-banner">
      <div class="summary-banner__left">
        <span class="summary-banner__tag">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          Overview
        </span>
        <h1 class="summary-banner__heading">Total Expenses</h1>
        <div class="summary-banner__amount">
          <span class="rupee-sym">₹</span>{{ managedBalance() | number:'1.2-2' }}
          <span class="summary-banner__badge" *ngIf="managedDeltaPct() !== null">
            ▲ {{ managedDeltaPct()! | number:'1.1-1' }}%
          </span>
        </div>
        <p class="summary-banner__hint">Lifetime tracked spending across all categories</p>
      </div>
      <div class="summary-banner__actions">
        <a class="action-btn action-btn--primary" routerLink="/expenses/new">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Add Expense
        </a>
        <a class="action-btn action-btn--ghost" routerLink="/expenses">All Expenses</a>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <div class="stat-card stat-card--blue">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1Zm14 8H3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10Z"/></svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">Daily Average</div>
          <div class="stat-card__value"><span class="rupee-sym">₹</span>{{ dailyAverage() | number:'1.2-2' }}</div>
          <div class="stat-card__trend stat-card__trend--down" *ngIf="dailyDeltaPct() !== null">
            ▼ {{ dailyDeltaPct()! | number:'1.1-1' }}% vs last week
          </div>
        </div>
      </div>

      <div class="stat-card stat-card--green">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a1 1 0 0 1 1 1v1.06A8 8 0 1 1 5.06 11H4a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1 6 6 0 1 0 6-6 1 1 0 1 1 0-2Z"/><path d="M12 7a1 1 0 0 1 1 1v3.38l2.11 2.11a1 1 0 1 1-1.42 1.42l-2.4-2.4A1 1 0 0 1 11 12V8a1 1 0 0 1 1-1Z"/></svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">Projected Spend</div>
          <div class="stat-card__value"><span class="rupee-sym">₹</span>{{ projectedSpend() | number:'1.2-2' }}</div>
          <div class="stat-card__trend stat-card__trend--ok">Within target range</div>
        </div>
      </div>

      <div class="stat-card stat-card--orange">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4Z"/></svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">Savings Rate</div>
          <div class="stat-card__value">{{ savingsRate() | number:'1.1-1' }}%</div>
          <div class="stat-card__trend stat-card__trend--star">Top 10% performance</div>
        </div>
      </div>
    </div>

    <div *ngIf="error()" class="alert-error">{{ error() }}</div>

    <!-- Bottom panels -->
    <div class="panels-row">
      <!-- Category breakdown -->
      <div class="panel panel--categories">
        <div class="panel__header">
          <div>
            <div class="panel__title">Category Breakdown</div>
            <div class="panel__sub">Where your money goes</div>
          </div>
          <a class="panel__link" routerLink="/categories">Manage →</a>
        </div>

        <div class="cat-list" *ngIf="categoryRows().length; else emptyCats">
          <div class="cat-item" *ngFor="let r of categoryRows()">
            <div class="cat-item__dot" [style.background]="r.color"></div>
            <div class="cat-item__info">
              <div class="cat-item__top">
                <span class="cat-item__name">{{ r.categoryName }}</span>
                <span class="cat-item__pct">{{ r.pct | number:'1.0-0' }}%</span>
              </div>
              <div class="cat-bar">
                <div class="cat-bar__fill" [style.width.%]="r.pct" [style.background]="r.color"></div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyCats>
          <div class="empty-state">No category data yet.</div>
        </ng-template>
      </div>

      <!-- Chart -->
      <div class="panel panel--chart">
        <div class="panel__header">
          <div>
            <div class="panel__title">Monthly Spending Trend</div>
            <div class="panel__sub">Expense velocity over time</div>
          </div>
          <div class="range-tabs">
            <button class="range-tab" [class.range-tab--active]="range() === '30D'" (click)="setRange('30D')">30D</button>
            <button class="range-tab" [class.range-tab--active]="range() === '90D'" (click)="setRange('90D')">90D</button>
            <button class="range-tab" [class.range-tab--active]="range() === '1Y'" (click)="setRange('1Y')">1Y</button>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas baseChart [data]="lineDataFiltered()" [options]="lineOptions" [type]="'line'"></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Banner ── */
    .summary-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
      border-radius: 20px;
      padding: 32px 36px;
      margin-bottom: 24px;
      color: #fff;
      box-shadow: 0 8px 32px rgba(30,58,95,0.18);
    }

    .summary-banner__tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #93c5fd;
      margin-bottom: 8px;
    }
    .summary-banner__tag svg { width: 14px; height: 14px; fill: #93c5fd; }

    .summary-banner__heading {
      font-size: 15px;
      font-weight: 500;
      color: rgba(255,255,255,.7);
      margin: 0 0 6px;
    }

    .summary-banner__amount {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: -.03em;
      line-height: 1;
      display: flex;
      align-items: flex-end;
      gap: 14px;
    }

    .rupee-sym {
      font-family: 'Noto Sans', sans-serif;
      font-weight: 700;
    }

    .summary-banner__badge {
      font-size: 13px;
      font-weight: 700;
      background: rgba(16,185,129,.2);
      color: #6ee7b7;
      border: 1px solid rgba(16,185,129,.3);
      border-radius: 999px;
      padding: 4px 12px;
      margin-bottom: 6px;
    }

    .summary-banner__hint {
      font-size: 12px;
      color: rgba(255,255,255,.45);
      margin: 10px 0 0;
    }

    .summary-banner__actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 160px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      transition: opacity .15s;
    }
    .action-btn svg { width: 18px; height: 18px; fill: currentColor; }
    .action-btn--primary { background: #f97316; color: #fff; }
    .action-btn--primary:hover { opacity: .88; color: #fff; }
    .action-btn--ghost { background: rgba(255,255,255,.1); color: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.18); }
    .action-btn--ghost:hover { background: rgba(255,255,255,.18); color: #fff; }

    /* ── Stat cards ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: #fff;
      border: 1px solid rgba(0,0,0,.06);
      box-shadow: 0 4px 16px rgba(0,0,0,.06);
    }

    .stat-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .stat-card__icon svg { width: 24px; height: 24px; }

    .stat-card--blue .stat-card__icon { background: #eff6ff; }
    .stat-card--blue .stat-card__icon svg { fill: #3b82f6; }
    .stat-card--green .stat-card__icon { background: #f0fdf4; }
    .stat-card--green .stat-card__icon svg { fill: #22c55e; }
    .stat-card--orange .stat-card__icon { background: #fff7ed; }
    .stat-card--orange .stat-card__icon svg { fill: #f97316; }

    .stat-card__label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .stat-card__value {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -.02em;
      color: #0f172a;
    }

    .stat-card__trend {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .stat-card__trend--down { color: #ef4444; }
    .stat-card__trend--ok  { color: #16a34a; }
    .stat-card__trend--star { color: #d97706; }

    /* ── Panels ── */
    .panels-row {
      display: grid;
      grid-template-columns: 2fr 3fr;
      gap: 16px;
    }

    .panel {
      background: #fff;
      border: 1px solid rgba(0,0,0,.06);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,.06);
      padding: 20px;
    }

    .panel__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .panel__title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .panel__sub {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .panel__link {
      font-size: 12px;
      font-weight: 700;
      color: #3b82f6;
      text-decoration: none;
      white-space: nowrap;
    }
    .panel__link:hover { text-decoration: underline; }

    /* ── Category list ── */
    .cat-list { display: flex; flex-direction: column; gap: 14px; }

    .cat-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cat-item__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cat-item__info { flex: 1; }

    .cat-item__top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .cat-item__name {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .cat-item__pct {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
    }

    .cat-bar {
      height: 6px;
      border-radius: 999px;
      background: #f1f5f9;
      overflow: hidden;
    }

    .cat-bar__fill {
      height: 100%;
      border-radius: 999px;
      transition: width .4s ease;
    }

    /* ── Chart ── */
    .range-tabs {
      display: flex;
      gap: 4px;
      background: #f1f5f9;
      border-radius: 999px;
      padding: 3px;
    }

    .range-tab {
      border: none;
      background: transparent;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
    }

    .range-tab--active {
      background: #fff;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }

    .chart-wrap { margin-top: 8px; }

    .empty-state {
      color: #94a3b8;
      font-size: 13px;
      padding: 12px 0;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .stat-grid { grid-template-columns: 1fr 1fr; }
      .panels-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 600px) {
      .summary-banner { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
      .summary-banner__amount { font-size: 38px; }
      .stat-grid { grid-template-columns: 1fr; }
      .summary-banner__actions { width: 100%; flex-direction: row; }
    }
  `],
})
export class DashboardPage implements OnInit {
  readonly summary = signal<DashboardSummaryDto | null>(null);
  readonly categoryBreakdown = signal<CategoryBreakdownDto[]>([]);
  readonly monthly = signal<MonthlyExpensesPointDto[]>([]);
  readonly error = signal<string | null>(null);
  readonly range = signal<'30D' | '90D' | '1Y'>('30D');

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: {
          callback: (v) => '₹' + Number(v).toLocaleString('en-IN'),
        },
        grid: { color: 'rgba(0,0,0,.04)' },
      },
      x: { grid: { display: false } },
    },
  };

  constructor(private dashboard: DashboardService) {}

  ngOnInit() { this.reload(); }

  setRange(r: '30D' | '90D' | '1Y') { this.range.set(r); }

  readonly managedBalance = computed(() => this.summary()?.totalExpenses ?? 0);

  readonly managedDeltaPct = computed(() => {
    const s = this.summary();
    if (!s) return null;
    const baseline = Math.max(1, (s.totalExpenses ?? 0) / 12);
    return (((s.currentMonthExpenses ?? 0) - baseline) / baseline) * 100;
  });

  readonly dailyAverage = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return (s.currentMonthExpenses ?? 0) / Math.max(1, new Date().getDate());
  });

  readonly dailyDeltaPct = computed(() => {
    const s = this.summary();
    if (!s) return null;
    const avg = (s.currentMonthExpenses ?? 0) / Math.max(1, new Date().getDate());
    return ((avg - avg * 1.021) / (avg * 1.021)) * 100;
  });

  readonly projectedSpend = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const runRate = (s.currentMonthExpenses ?? 0) / Math.max(1, now.getDate());
    return runRate * daysInMonth;
  });

  readonly savingsRate = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    const total = Math.max(1, s.totalExpenses ?? 0);
    const month = Math.max(0, s.currentMonthExpenses ?? 0);
    return Math.max(0, Math.min(1, 1 - month / total)) * 100;
  });

  readonly categoryRows = computed(() => {
    const rows = this.categoryBreakdown() ?? [];
    const total = rows.reduce((acc, r) => acc + (r.totalAmount ?? 0), 0) || 1;
    const palette = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308', '#ef4444', '#06b6d4'];
    return [...rows]
      .sort((a, b) => (b.totalAmount ?? 0) - (a.totalAmount ?? 0))
      .slice(0, 6)
      .map((r, i) => ({ ...r, pct: ((r.totalAmount ?? 0) / total) * 100, color: palette[i % palette.length] }));
  });

  readonly lineDataFiltered = computed<ChartConfiguration<'line'>['data']>(() => {
    const all = this.monthly() ?? [];
    const maxPoints = this.range() === '30D' ? 3 : this.range() === '90D' ? 6 : 12;
    const sliced = all.slice(-maxPoints);
    return {
      labels: sliced.map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`),
      datasets: [{
        data: sliced.map((r) => r.totalAmount),
        label: 'Expenses',
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
      }],
    };
  });

  private reload() {
    this.error.set(null);
    this.dashboard.summary().subscribe({ next: (x) => this.summary.set(x), error: () => this.error.set('Failed to load summary.') });
    this.dashboard.categoryBreakdown().subscribe({ next: (rows) => this.categoryBreakdown.set(rows), error: () => this.error.set('Failed to load categories.') });
    this.dashboard.monthlyExpenses(12).subscribe({ next: (rows) => this.monthly.set(rows), error: () => this.error.set('Failed to load monthly data.') });
  }
}
