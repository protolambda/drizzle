import { combineReducers } from 'redux'

import accountsReducer from './accounts/accountsReducer'
import accountBalancesReducer from './accountBalances/accountBalancesReducer'
import contractsReducer from './contracts/contractsReducer'
import drizzleStatusReducer from './drizzleStatus/drizzleStatusReducer'
import transactionsReducer from './transactions/transactionsReducer'
import transactionTrackerReducer from './transactions/transactionTrackerReducer'
import web3Reducer from './web3/web3Reducer'

const reducer = combineReducers({
  accounts: accountsReducer,
  accountBalances: accountBalancesReducer,
  contracts: contractsReducer,
  drizzleStatus: drizzleStatusReducer,
  transactions: transactionsReducer,
  transactionTracker: transactionTrackerReducer,
  web3: web3Reducer
})

export default reducer
