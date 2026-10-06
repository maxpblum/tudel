import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { FilterPlot } from './plots';

describe('FilterPlot', () => {
  afterEach(cleanup);
  it('single curve: one line, no legend (back-compat)', () => {
    render(<FilterPlot type="lowpass" curves={[{ cutoff: 800, q: 10 }]} />);
    expect(screen.getAllByTestId('plot-curve')).toHaveLength(1);
    expect(screen.queryByTestId('plot-legend')).toBeNull();
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('800 Hz, resonance 10');
  });
  it('family: distinct strokes and dashes, legend labels, one marker per distinct cutoff', () => {
    render(
      <FilterPlot type="lowpass" title="Same cutoff" curves={[{ cutoff: 800, q: 1, label: 'lpq 1' }, { cutoff: 800, q: 10, label: 'lpq 10' }, { cutoff: 2000, q: 1, label: 'lpf 2000' }]} />,
    );
    const curves = screen.getAllByTestId('plot-curve');
    expect(curves).toHaveLength(3);
    expect(new Set(curves.map((c) => c.getAttribute('class'))).size).toBe(3);
    expect(new Set(curves.map((c) => c.getAttribute('stroke-dasharray'))).size).toBe(3);
    expect(screen.getByTestId('plot-legend').textContent).toContain('lpq 10');
    expect(screen.getAllByTestId('plot-cutoff')).toHaveLength(2);
    const aria = screen.getByRole('img').getAttribute('aria-label')!;
    expect(aria).toContain('Same cutoff');
    expect(aria).toContain('3 curves');
    expect(aria).toContain('lpf 2000: 2000 Hz');
  });
});
