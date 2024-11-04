import AntChangelog from '@src/components/cards/AntChangelog';
import { cleanup, render } from '@testing-library/react';
import { act } from 'react';

describe('HomeSearch', () => {
  let antChangelog: HTMLDivElement;

  beforeEach(async () => {
    const { getByTestId } = await act(
      async () => await render(<AntChangelog />),
    );
    // renderSearchBar = asFragment;
    antChangelog = getByTestId('ant-changelog-card') as HTMLDivElement;
  });

  afterEach(cleanup);

  test('should render ANT changelog', async () => {
    expect(antChangelog).toBeDefined();
  });
});
