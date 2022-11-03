import SearchBarHome from '../../inputs/Search/SearchBarHome/SearchBarHome';
import './styles.css';

function Home() {
  return (
  <div className="home">
    <SearchBarHome searchButtonAction={()=>console.log("search")}/>
    </div>
    );
}

export default Home;
