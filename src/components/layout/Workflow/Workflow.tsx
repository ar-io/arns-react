import {useState} from 'react'
import { Outlet } from 'react-router-dom'
import SearchBar from '../../inputs/Search/SearchBar/SearchBar'
import RegisterNameModal from '../../modals/RegisterNameModal/RegisterNameModal'



const initialStates =[
    name,
]

function Workflow ({comps}:{comps:{[x:number]:{component:any}}}){

const [currentStep, setCurrentStep] = useState(0)
const [newStates, setStates] = useState({
    name: "",
    ttlOptions:"",
    nickname:"",
    antId:"",
})

    return (
        <>
        
         {Object.entries(comps).map(([key,value],index)=> {
            if (value.component && index === currentStep){
                return <>{value.component}</>
            }
            })}
        </>
       
    )
}

export default Workflow