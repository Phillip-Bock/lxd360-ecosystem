import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bold, Italic, Underline } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { RibbonButton, RibbonToggleGroup } from '../index';

describe('RibbonButton', () => {
  it('renders with icon', () => {
    const { getByTestId } = render(<RibbonButton icon={<Bold data-testid="bold-icon" />} />);
    expect(getByTestId('bold-icon')).toBeInTheDocument();
  });

  it('renders with label when size is lg', () => {
    const { getByText } = render(<RibbonButton icon={<Bold />} label="Bold" size="lg" />);
    expect(getByText('Bold')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByRole } = render(<RibbonButton icon={<Bold />} onClick={handleClick} />);

    await user.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports active state styling', () => {
    const { getByRole } = render(<RibbonButton icon={<Bold />} active />);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-(--ribbon-active)');
  });

  it('supports disabled state', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByRole } = render(<RibbonButton icon={<Bold />} disabled onClick={handleClick} />);

    const button = getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders different sizes', () => {
    const { getByRole, rerender } = render(<RibbonButton icon={<Bold />} size="lg" />);
    expect(getByRole('button')).toHaveClass('h-14');

    rerender(<RibbonButton icon={<Bold />} size="sm" />);
    expect(getByRole('button')).toHaveClass('h-7');

    rerender(<RibbonButton icon={<Bold />} size="md" />);
    expect(getByRole('button')).toHaveClass('h-8');
  });

  it('renders different variants', () => {
    const { getByRole, rerender } = render(<RibbonButton icon={<Bold />} variant="default" />);
    expect(getByRole('button')).toHaveClass('hover:bg-(--ribbon-hover)');

    rerender(<RibbonButton icon={<Bold />} variant="accent" />);
    expect(getByRole('button')).toHaveClass('bg-(--ribbon-accent)');

    rerender(<RibbonButton icon={<Bold />} variant="ghost" />);
    expect(getByRole('button')).toHaveClass('hover:bg-transparent');
  });
});

describe('RibbonToggleGroup', () => {
  it('renders all toggle items', () => {
    const { getByLabelText } = render(
      <RibbonToggleGroup
        items={[
          { value: 'bold', icon: Bold, label: 'Bold' },
          { value: 'italic', icon: Italic, label: 'Italic' },
          { value: 'underline', icon: Underline, label: 'Underline' },
        ]}
        value={[]}
        onValueChange={vi.fn()}
        type="multiple"
      />,
    );

    expect(getByLabelText('Bold')).toBeInTheDocument();
    expect(getByLabelText('Italic')).toBeInTheDocument();
    expect(getByLabelText('Underline')).toBeInTheDocument();
  });

  it('renders with initial selected values', () => {
    const { getByLabelText } = render(
      <RibbonToggleGroup
        items={[
          { value: 'bold', icon: Bold, label: 'Bold' },
          { value: 'italic', icon: Italic, label: 'Italic' },
        ]}
        value={['bold']}
        onValueChange={vi.fn()}
        type="multiple"
      />,
    );

    // Verify both buttons are rendered
    expect(getByLabelText('Bold')).toBeInTheDocument();
    expect(getByLabelText('Italic')).toBeInTheDocument();
  });

  it('calls onValueChange when toggle is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <RibbonToggleGroup
        items={[
          { value: 'bold', icon: Bold, label: 'Bold' },
          { value: 'italic', icon: Italic, label: 'Italic' },
        ]}
        value={[]}
        onValueChange={handleChange}
        type="multiple"
      />,
    );

    await user.click(getByLabelText('Bold'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders in single selection mode', () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <RibbonToggleGroup
        items={[
          { value: 'left', icon: Bold, label: 'Left' },
          { value: 'center', icon: Italic, label: 'Center' },
        ]}
        value="left"
        onValueChange={handleChange}
        type="single"
      />,
    );

    // Verify both buttons are rendered in single selection mode
    expect(getByLabelText('Left')).toBeInTheDocument();
    expect(getByLabelText('Center')).toBeInTheDocument();
  });
});
