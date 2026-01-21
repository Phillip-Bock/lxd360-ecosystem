import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Ribbon,
  RibbonButton,
  RibbonGroup,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
  useRibbonShortcuts,
} from '../index';

const TestRibbon = () => (
  <Ribbon defaultTab="home">
    <RibbonTabs>
      <RibbonTabList>
        <RibbonTab value="home">Home</RibbonTab>
        <RibbonTab value="insert">Insert</RibbonTab>
      </RibbonTabList>
      <RibbonTabPanel value="home">
        <RibbonGroup label="Clipboard">
          <RibbonButton>Paste</RibbonButton>
          <RibbonButton>Copy</RibbonButton>
        </RibbonGroup>
      </RibbonTabPanel>
    </RibbonTabs>
  </Ribbon>
);

describe('Keyboard Navigation', () => {
  it('renders tabs that can receive focus', async () => {
    const user = userEvent.setup();
    const { getByText } = render(<TestRibbon />);

    const homeTab = getByText('Home');
    await user.click(homeTab);
    expect(homeTab).toHaveAttribute('data-state', 'active');
  });

  it('activates insert tab with click', async () => {
    const user = userEvent.setup();
    const { getByText } = render(<TestRibbon />);

    const insertTab = getByText('Insert');
    await user.click(insertTab);
    expect(insertTab).toHaveAttribute('data-state', 'active');
  });

  it('allows tab navigation between tabs using keyboard', async () => {
    const user = userEvent.setup();
    const { getByText } = render(<TestRibbon />);

    const homeTab = getByText('Home');
    homeTab.focus();

    // Press ArrowRight to move to next tab
    await user.keyboard('{ArrowRight}');

    // The insert tab should now be focused
    const insertTab = getByText('Insert');
    expect(insertTab).toHaveFocus();
  });
});

// Test the useRibbonShortcuts hook
function ShortcutTestComponent({ onBold, onItalic }: { onBold: () => void; onItalic: () => void }) {
  useRibbonShortcuts([
    { key: 'b', ctrl: true, action: onBold },
    { key: 'i', ctrl: true, action: onItalic },
  ]);
  return <div data-testid="shortcut-test">Shortcut Test Component</div>;
}

describe('useRibbonShortcuts', () => {
  it('calls action when shortcut is pressed', async () => {
    const user = userEvent.setup();
    const onBold = vi.fn();
    const onItalic = vi.fn();

    render(<ShortcutTestComponent onBold={onBold} onItalic={onItalic} />);

    // Simulate Ctrl+B
    await user.keyboard('{Control>}b{/Control}');
    expect(onBold).toHaveBeenCalledTimes(1);

    // Simulate Ctrl+I
    await user.keyboard('{Control>}i{/Control}');
    expect(onItalic).toHaveBeenCalledTimes(1);
  });

  it('does not call action when wrong modifier is pressed', async () => {
    const user = userEvent.setup();
    const onBold = vi.fn();
    const onItalic = vi.fn();

    render(<ShortcutTestComponent onBold={onBold} onItalic={onItalic} />);

    // Simulate just B without Ctrl
    await user.keyboard('b');
    expect(onBold).not.toHaveBeenCalled();

    // Simulate Alt+B instead of Ctrl+B
    await user.keyboard('{Alt>}b{/Alt}');
    expect(onBold).not.toHaveBeenCalled();
  });
});
