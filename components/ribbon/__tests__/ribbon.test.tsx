import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Ribbon,
  RibbonGroup,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
} from '../index';

describe('Ribbon', () => {
  it('renders with default tab', () => {
    const { getByText } = render(
      <Ribbon defaultTab="home">
        <RibbonTabs>
          <RibbonTabList>
            <RibbonTab value="home">Home</RibbonTab>
            <RibbonTab value="insert">Insert</RibbonTab>
          </RibbonTabList>
          <RibbonTabPanel value="home">
            <div>Home Content</div>
          </RibbonTabPanel>
          <RibbonTabPanel value="insert">
            <div>Insert Content</div>
          </RibbonTabPanel>
        </RibbonTabs>
      </Ribbon>,
    );

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Insert')).toBeInTheDocument();
    expect(getByText('Home Content')).toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <Ribbon defaultTab="home">
        <RibbonTabs>
          <RibbonTabList>
            <RibbonTab value="home">Home</RibbonTab>
            <RibbonTab value="insert">Insert</RibbonTab>
          </RibbonTabList>
          <RibbonTabPanel value="home">
            <div>Home Content</div>
          </RibbonTabPanel>
          <RibbonTabPanel value="insert">
            <div>Insert Content</div>
          </RibbonTabPanel>
        </RibbonTabs>
      </Ribbon>,
    );

    await user.click(getByText('Insert'));
    expect(getByText('Insert Content')).toBeInTheDocument();
  });

  it('renders the ribbon container with correct data-slot', () => {
    const { container } = render(
      <Ribbon defaultTab="home">
        <RibbonTabs>
          <RibbonTabList>
            <RibbonTab value="home">Home</RibbonTab>
          </RibbonTabList>
          <RibbonTabPanel value="home">
            <div>Content</div>
          </RibbonTabPanel>
        </RibbonTabs>
      </Ribbon>,
    );

    expect(container.querySelector('[data-slot="ribbon"]')).toBeInTheDocument();
  });
});

describe('RibbonGroup', () => {
  it('renders label and children', () => {
    const { getByText } = render(
      <RibbonGroup label="Test Group">
        <div>Group Content</div>
      </RibbonGroup>,
    );

    expect(getByText('Test Group')).toBeInTheDocument();
    expect(getByText('Group Content')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    const { getByText, queryByText } = render(
      <RibbonGroup>
        <div>Group Content</div>
      </RibbonGroup>,
    );

    expect(getByText('Group Content')).toBeInTheDocument();
    expect(queryByText('Test Group')).not.toBeInTheDocument();
  });
});
