import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import { useState } from 'react';

function Home() {
  const [searchBarState, setSearchBarState] = useState('success');
  const [searchState, setSearchState] = useState('');

  function searchAction() {
    if (searchState == 'success') {
      setSearchBarState('error');
    }
    if (searchState == 'error') {
      setSearchBarState('search');
    }
    if (searchState == 'search') {
      setSearchBarState('success');
    }
  }

  return (
    <div className="home">
      <SearchBar
        buttonAction={searchAction}
        placeholderText="Enter a name"
        searchState={searchState}
        searchBarState={searchBarState}
        onChangeHandler={setSearchState}
        headerText={''}
        footerText={''}
      />
    </div>
  );
}

export default Home;
