import {FiExternalLink} from 'react-icons/fi'
type antCard = ({
    arnsName: String,
    gateway: String,
    expiry: any,
    preview: any
})

function AntCard ({arnsName,gateway,expiry,preview}:antCard) {

    const date = new Date(expiry * 1000) //unix timestamp
    const expiryDate = `${date.toDateString()}`

    return (
        <div className="antCard">
            <div className="antPreview">
                {preview}
            </div>
            <div className='cardFooter alignLeft'>
            <p className="cardText alignLeft">{arnsName}.{gateway} <a href={`http://${arnsName}.${gateway}`} target="_"><FiExternalLink color='#9E9E9E' size={'12px'}/></a></p>
            <p className="cardTextSmall alignLeft">Exp. {expiryDate}</p>
            </div>
        </div>
    )
}
export default AntCard