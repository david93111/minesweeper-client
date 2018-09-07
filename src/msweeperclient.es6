'use strict';

let axios = require('axios');

class msweeperclient {
   
    // Build axios instance using defined host of MineSweeper API
    constructor(host){
      this.httpClient = axios.create({
        baseURL: host,
        timeout: 45000,
      });
    }
  
    // New Game creation, using default or specified parameters
    newGame(user, row=9, columns=9, mines=15) {
      let data = {
        user: user,
        rows: row,
        columns: columns,
        mines: mines
      };

      let resultPromise = this.httpClient.post('/minesweeper/game', data)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Get an existing game using the gameId
    getGame(gameId) {
      let params = {
        gameId: gameId
      };
      let resultPromise = this.httpClient.get('/minesweeper/game', {
        params: params
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Get the historic of operations on an existing game using the gameId
    getGameHistory(gameId) {
      let resultPromise = this.httpClient.get('/minesweeper/game/'+gameId+'/history')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Reveal an existing spot on the minefield of a specified game
    revealSpot(gameId, row, column) {
      let data = {
        row: row,
        col: column
      };
      let resultPromise = this.httpClient.put('/minesweeper/game/'+gameId+'/reveal', {
        data: data
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Mark an existing spot on the minefield of a specified game with a specified mark
    _sendMarkToSpot(gameId, row, column, mark) {
      let data = {
        row: row,
        col: column,
        mark: mark
      };
      let resultPromise = this.httpClient.put('/minesweeper/game/'+gameId+'/mark', {
        data: data
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Mark an existing spot on the minefield of a specified game with a question mark
    markSpotWithQuestion(gameId, row, column){
      return this._sendMarkToSpot(gameId, row, column, "QuestionMark");
    }

    // Mark an existing spot on the minefield of a specified game with a flag mark
    markSpotWithFlag(gameId, row, column){
      return this._sendMarkToSpot(gameId, row, column, "FlagMark");
    }

    // Mark an existing spot on the minefield as no marked; ironic, i know.
    removeMark(gameId, row, column){
      return this._sendMarkToSpot(gameId, row, column, "None");
    }

    // Pause an existing game with the specified gameId.
    pauseGame(gameId) {
      let resultPromise = this.httpClient.patch('/minesweeper/game/'+gameId+'/pause')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    // Resume an existing game with the specified gameId.
    resumeGame(gameId) {
      let resultPromise = this.httpClient.patch('/minesweeper/game/'+gameId+'/resume')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return this.validateError(error);
      });
      return resultPromise;
    }

    validateError(error){
      let errorResult = new msweeperclient.ServerError();
      if(error.response){
        errorResult.error.status = error.response.status;
        errorResult = this.validateErrorResponse(error.response, errorResult);
      }else if(error.request){
        errorResult.error.cause = "Server Timeout or Unreachable on URL: "+ error.request._currentUrl;
        errorResult.error.message = error.message;
      }else{
        console.log("Unexpected error " + error.message);
        errorResult.error.cause = 'Unexpected Client Error';
        errorResult.error.message = error.message;
      }
      return errorResult;
    }

    validateErrorResponse(errorResponse, errorResult){
      if(errorResponse.data && errorResponse.data.cause){
          errorResult.error.cause = errorResponse.data.cause;
          errorResult.error.message = errorResponse.data.message;
          errorResult.error.apiResponse = errorResponse.data;
      }else if(errorResponse.data){
        errorResult.error.apiResponse = errorResponse.data;
        errorResult = this.validateErrorStatus(errorResponse.status, errorResult);
      }else {
        errorResult = this.validateErrorStatus(errorResponse.status, errorResult);
      }

      return errorResult;
    }

    validateErrorStatus(status, errorResult){

      if(status === 400){
        errorResult.error.cause = 'Bad Request';
        errorResult.error.message = 'Invalid parameters or the client version yo are using is outdated for the specified API';
      }else if(status === 404){
        errorResult.error.cause = 'Resource Not Found';
        errorResult.error.message = 'Invalid resource requested, or the resource you are looking for does not exist';
      }else{
        errorResult.error.cause = 'Unexpected Server Error';
        errorResult.error.message = 'There was an unexpected error unmanaged by the API during the operation or the service is DOWN';
      }

      return errorResult;
    }
    
}

// ES6 class for manage errors on API operations 
msweeperclient.ServerError = class ServerError{
  constructor(){
    this.error = {
      cause: "Unexpected Error",
      apiResponse: {},
      message: '',
      status: null
    }
  }
};

module.exports = msweeperclient;