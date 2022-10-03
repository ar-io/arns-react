import winston from '../images/DarkMode/winston-logo.png'
import ConnectButton from './inputs/buttons/ConnectButton'
import {Link} from 'react-router-dom'
import { connect } from 'http2'


type navBar = {
    connected: Boolean,
    setConnected: any
}

function NavBar ({connected,setConnected}: navBar) {

    return (
        <div className="navBar">

            <div className="navBarItemContainer">
           <Link to="/Home"><img src={winston} width={90} height={90}/></Link>
            </div>

            <div className="navBarItemContainer">
                <Link to="/Home" className='navBarLink'><div>Home</div></Link>
                <Link to="/Register" className='navBarLink'><div>Register</div></Link>
                <Link to="/About"  className='navBarLink'><div>About</div></Link>
                <Link to="/FAQ"  className='navBarLink'><div>FAQs</div></Link>
                <Link to="/ManageNames"  className='navBarLink'><div>Manage Names</div></Link>
                <ConnectButton connected={connected} setConnected={setConnected}/>
                </div>

        </div>
    )

}

export default NavBar