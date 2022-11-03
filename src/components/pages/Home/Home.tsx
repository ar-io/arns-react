import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import {useState} from 'react'


function Home() {

const [searchState, setSearchState] = useState("success")

  function searchAction(){
    if (searchState == "success"){
      setSearchState("error")
    }
    if (searchState == "error"){
      setSearchState("search")
    }
    if (searchState == "search"){
      setSearchState("success")
    }
  }

  return (
    <div className="home">
      <SearchBar 
      searchButtonAction={searchAction}
      placeholderText="Enter a name"
      searchState={searchState}
      />
    </div>
  );
}

export default Home;
