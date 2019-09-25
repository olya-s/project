import {store} from '../store';
import promiseActionsMaker from './promiseActionsMaker';

let getInformationThunk = promiseActionsMaker('INFORM',
	fetch('/getInformation')
	.then(res => res.json())
)

export default getInformationThunk;