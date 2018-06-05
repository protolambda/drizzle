const initialState = {}
  
const transactionTrackerReducer = (state = initialState, action) => {
    if (action.type === 'ADD_TO_TRACKER')
    {
        return {
            ...state,
            [action.trackingId]: {
                broadcasted: false,
                info: action.trackedInfo,
                hash: null
            }
        }
    }

    if (action.type === 'REMOVE_FROM_TRACKER')
    {
        const newState = {...state}

        delete newState[action.trackingId]

        return newState
    }

    if (action.type === 'TX_BROADCASTED')
    {

        return {
            ...state,
            [action.trackingId]: {
                ...state[action.trackingId],
                broadcasted: true,
                hash: action.txHash
            }
        }

    }

    return state
}

export default transactionTrackerReducer
