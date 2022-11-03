import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';

function Home() {
  return (
    <div className="home">
      <SearchBar
        buttonAction={() => {
          console.log('search');
        }}
        placeholderText="Enter a name"
        headerText={'Find a domain name'}
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
      />
    </div>
  );
}

export default Home;
