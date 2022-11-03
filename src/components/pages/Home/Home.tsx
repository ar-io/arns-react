import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';

function Home() {
  return (
    <div className="home">
      <SearchBar searchButtonAction={() => console.log('search')} />
    </div>
  );
}

export default Home;
