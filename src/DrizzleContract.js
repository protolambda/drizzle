import uuid4 from "uuid/v4";

class DrizzleContract {
  constructor(contractArtifact, web3, networkId, store, events = []) {
    this.contractArtifact = contractArtifact
    this.abi = contractArtifact.abi
    this.web3 = web3
    this.store = store

    this.initContractState();

    // Instantiate the contract.
    var web3Contract = new web3.eth.Contract(
      this.abi,
      this.contractArtifact.networks[networkId].address,
      {
        from: this.store.getState().accounts[0],
        data: this.contractArtifact.deployedBytecode
      }
    )


    // Merge web3 contract instance into DrizzleContract instance.
    Object.assign(this, web3Contract)

    for (var i = 0; i < this.abi.length; i++) {
      var item = this.abi[i]

      if (item.type == "function" && item.constant === true) {
        this.methods[item.name].cacheCall = this.cacheCallFunction(item.name, i)
      }

      if (item.type == "function" && item.constant === false) {
        this.methods[item.name].cacheSend = this.cacheSendFunction(item.name, i)
      }
    }


    // Register event listeners if any events.
    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        const eventName = events[i]

        store.dispatch({type: 'LISTEN_FOR_EVENT', contract: this, eventName})
      }
    }

    const name = contractArtifact.contractName
    const methods = this.methods
    const address = this._address

    store.dispatch({type: 'CONTRACT_INITIALIZED', name, methods, address})
  }

  initContractState() {
    // Initial contract details
    var contractName = this.contractArtifact.contractName

    // initialize contract state
    var initialState = {
      initialized: false,
      synced: false,
      state: {},
      networks: this.contractArtifact.networks
    }

    // Constant getters
    for (var i = 0; i < this.abi.length; i++) {
      var item = this.abi[i]

      if (item.type == "function" && item.constant === true) {
        initialState.state[item.name] = {}
      }
    }

    this.store.dispatch({ type: 'INIT_CONTRACT_STATE', contractName, initialState });
  }

  cacheCallFunction(fnName, fnIndex, fn) {
    var contract = this

    return function() {
      // Collect args and hash to use as key, 0x0 if no args
      var argsHash = '0x0'
      var args = arguments

      if (args.length > 0) {
        argsHash = contract.generateArgsHash(args)
      }
      const contractName = contract.contractArtifact.contractName
      const functionState = contract.store.getState().contracts[contractName].state[fnName]

      // If call result is in state return value instead of calling
      if (argsHash in functionState) {
        return functionState[argsHash].value;
      }

      // Otherwise, call function and update store
      contract.store.dispatch({type: 'CALL_CONTRACT_FN', contract, fnName, fnIndex, args, argsHash})

      // Return nothing because state is currently empty.
      return null;
    }
  }

  cacheSendFunction(fnName, fnIndex) {
    // NOTE: May not need fn index
    var contract = this

      return function (trackedInfo) {

          return function () {
              var args = arguments

              // Generate temporary ID
              var trackingId = uuid4()

              // Add ID to "transactionTracker" with trackingInfo
              contract.store.dispatch({type: 'ADD_TO_TRACKER', trackingId, trackedInfo})

              // Dispatch tx to saga
              // When txhash received, it is inserted into the 'transactions' state
              // (txhash as key, trackingId as additional property to find it)
              // Also, it is kept in "transactionTracker", it is up to the user to remove it
              contract.store.dispatch({
                  type: 'SEND_CONTRACT_TX',
                  contract, fnName, fnIndex, args, trackingId
              })

              // return tracking ID
              return trackingId
          }
      }
  }

  generateArgsHash(args) {
    var web3 = this.web3
    var hashString = ''

    for (var i = 0; i < args.length; i++)
    {
      if (typeof args[i] !== 'function')
      {
        var argToHash = args[i]

        // Stringify objects to allow hashing
        if (typeof argToHash === 'object') {
          argToHash = JSON.stringify(argToHash)
        }

        // Convert number to strong to allow hashing
        if (typeof argToHash === 'number') {
          argToHash = argToHash.toString()
        }

        // This check is in place for web3 v0.x
        if ('utils' in web3) {
          var hashPiece = web3.utils.sha3(argToHash)
        }
        else {
          var hashPiece = web3.sha3(argToHash)
        }

        hashString += hashPiece
      }
    }

    return web3.utils.sha3(hashString)
  }
}

export default DrizzleContract
