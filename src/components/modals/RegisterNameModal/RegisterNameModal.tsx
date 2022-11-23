import UpgradeTier from '../../layout/UpgradeTier/UpgradeTier'
import './styles.css'   

function RegisterNameModal (){

    return (
     <div className='registerNameModal center'>
        <div className='sectionHeader'>sam.arweave.dev is available!</div>

        <div className='sectionHeader'>Register Domain</div>

        <div className='registerInputs center'>

            <div className='inputGroup center column'>
                <select className="dataInput center" placeholder='I have an Arweave Name Token (ANT) I want to use'>
                    <option className="dataInput center">I have an Arweave Name Token (ANT) I want to use</option>
                    <option className="dataInput center">Create an Arweave Name Token (ANT) for me</option>
                </select>
                <input className="dataInput center" type="text" placeholder='Enter your ANT Contract ID'/>
            </div>

            <div className='inputGroup center row'>
                <input className="dataInput center" type="text" placeholder='Nickname*'/>
                <input className="dataInput center" type="text" placeholder='Ticker*'/>
                <input className="dataInput center" type="text" placeholder='Controller'/>
                <input className="dataInput center" type="text" placeholder='TTL'/>
            </div>
        </div>

        <UpgradeTier />

     </div>
    )
}

export default RegisterNameModal