import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { SearchBarFooter, SearchBarHeader } from '../../../../layout';
import SearchBar from '../SearchBar';


const TEST_RECORDS = {
  "ardrive":{
    contractTxId:"I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw",
    endTimestamp:1711122739,
    tier:"SEC0-8cTfyDBRQo21KNIhUV5KreuEmIY05wX-VOeESE",
    type:"lease"
  },
  "xn--go8h6v":{
    contractTxId:"I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw",
    endTimestamp:1711122739,
    tier:"SEC0-8cTfyDBRQo21KNIhUV5KreuEmIY05wX-VOeESE",
    type:"lease"
  }
}

describe('SearchBar', () => {
  afterEach(cleanup);
  const onChange = jest.fn();
  const onSubmit = jest.fn();
  const onFailure = jest.fn();
  const onSuccess = jest.fn();
  // Other stubs as needed...
  const stub = jest.fn();

  test('handles a search with capitalized names correctly', async () => {


    const { getByTestId } = render(
      <Router>
            <SearchBar
              onSubmit={onSubmit}
              onChange={onChange}
              onFailure={onFailure}
              onSuccess={onSuccess}
              successPredicate={stub}
              validationPredicate={stub}
              value=""
              values={TEST_RECORDS}
              placeholderText={'Find a name'}
              headerElement={
                <SearchBarHeader defaultText="Find a name" reservedList={[]} />
              }
              footerElement={
                <SearchBarFooter isAuction={false} reservedList={[]} />
              }
            />
      </Router>,
    );
  
    const searchInput = getByTestId("searchbar-input-id");
    const searchButton = getByTestId('search-button'); // Assuming you used data-testid="search-button"
    const domain = "ARDRIVE"
  
    await userEvent.type(searchInput, domain);
    userEvent.click(searchButton);
  
    expect(onChange).toHaveBeenCalledWith(domain);
    expect(onSubmit).toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalled()
    // Additional assertions as needed...
  });


});





