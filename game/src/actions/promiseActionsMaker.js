export default function promiseActionsMaker(name, promise){
  const actionPending     = () => ({ type: 'PROMISE', name, status: 'PENDING', payload: null, error: null })
  const actionResolved    = payload => ({ type: 'PROMISE', name, status: 'RESOLVED', payload, error: null })
  const actionRejected    = error => ({ type: 'PROMISE', name, status: 'REJECTED', payload: null, error })

  function actionPromiseThunk(){
      return async dispatch => {
          dispatch(actionPending())
        try {
            dispatch(actionResolved(await promise))
        }
        catch (e) {
            dispatch(actionRejected(e))
        }
      }
  }
  return actionPromiseThunk;
}