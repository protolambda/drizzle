const initialState = {}
  
const transactionTrackerReducer = (state = initialState, action) => {
    if (action.type === 'ADD_TO_TRACKER')
    {

        const newState = {...state}

        newState[action.trackingId] = {
            broadcasted: false,
            info: action.trackedInfo,
            hash: null
        }

        return newState
    }

    if (action.type === 'REMOVE_FROM_TRACKER')
    {
        const newState = {...state}

        delete newState[action.trackingId]

        return newState
    }

    if (action.type === 'TX_BROADCASTED')
    {
        const newState = {...state}

        newState[action.trackingId] = {
            broadcasted: true,
            info: newState.info,
            hash: action.txHash
        }

        return newState
    }

    return state
}

export default transactionTrackerReducer
