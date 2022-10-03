

type connectButton = {
    connected: Boolean,
    setConnected:any
}

function ConnectButton ({connected, setConnected}:connectButton) {

    return (
        <button className="connectButton" onClick={()=> setConnected(true)}>Connect</button>
    )
}

export default ConnectButton