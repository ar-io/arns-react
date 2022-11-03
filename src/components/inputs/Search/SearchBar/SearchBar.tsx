import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import {useState, useEffect} from 'react'
import './styles.css';
import { searchBar } from '../../../../types';

function SearchBar({ searchButtonAction, placeholderText, searchState }: searchBar) {

  const [borderState, setBorderState] = useState("")

  useEffect(()=>{
    switch(searchState){
      case "error": setBorderState("var(--error-red")
      break;
      case "success": setBorderState("var(--success-green)")
      break;
      case "search": setBorderState("")
      break;
      default: console.log(`${searchState} is not a valid state`)
    }
  },[searchState])

  return (
    <div className="searchBar" style={{borderColor:borderState}}>
      <input type="text" placeholder={placeholderText} />
      <button
        className="searchButton"
        onClick={() => {
          searchButtonAction();
        }}
      >
        <SearchIcon fill="black" stroke="white" width="18.51" />
      </button>
    </div>
  );
}

export default SearchBar;
