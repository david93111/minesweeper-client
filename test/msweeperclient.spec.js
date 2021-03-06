import chai from 'chai';

let path = require('path');
let MockAdapter = require('axios-mock-adapter');

let defaultGameJson = require(path.join(__dirname,"resources","DefaultGame.json"));
let customGame = require(path.join(__dirname,"resources","SmallGame.json"));
let revealedAndMarkedGame = require(path.join(__dirname,"resources","RevealedAndMarkedGame.json"));
let losedGame = require(path.join(__dirname,"resources","LosedGame.json"));
let gameHistory = require(path.join(__dirname,"resources","GameHistory.json"));
let pausedGame = require(path.join(__dirname,"resources","PausedGame.json"));

// Enable chai "should" assertions.
chai.should();

let MSweperClient = require(path.join(__dirname, '../src', 'msweeperclient.es6'));

describe('MSweeper Client Test', () => {

    let client = new MSweperClient("http://127.0.0.1:9090");

    let mock = new MockAdapter(client.httpClient);

    describe('Game creation should', () => {

        it('should create a new game using default parameters', (done) => {
       
            mock.onPost('/minesweeper/game', 
                { 
                    user: 'testUser',
                    rows: 9,
                    columns: 9,
                    mines: 15,
                } 
            ).reply(200, defaultGameJson); 
    
            let game = client.newGame("testUser");
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("99595f5a-a7ec-4da8-86b1-5e625993adce");
                result.minefield.rows.should.equal(9)
                result.minefield.columns.should.equal(9)
            })
            .finally(done());
        });
    
        it('should create a new game with specified parameters', (done) => {
           
            mock.onPost('/minesweeper/game', 
                { 
                    user: 'testUser',
                    rows: 2,
                    columns: 2,
                    mines: 1,
                } 
            ).reply(200, customGame); 
    
            let game = client.newGame("testUser", 2, 2, 1);
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("d9592246-385b-4e71-b886-88cabd24e5c9");
                result.minefield.rows.should.equal(2)
                result.minefield.columns.should.equal(2)
            })
            .finally(done());
        });
    
        it('should fail when try to create a game with invalid parameters', done => {
           
            mock.onPost('/minesweeper/game', 
                { 
                    user: 'testUser',
                    rows: 4,
                    columns: 4,
                    mines: 0,
                } 
            ).reply(400, {
                "cause": "Invalid Parameters",
                "message": "requirement failed: Mines to be placed must be greater than zero"
            }); 
    
            let game = client.newGame("testUser", 4, 4, 0);
            game.then(result => {
               result.error.cause.should.equal("Invalid Parameters");
               result.error.message.should.equal("requirement failed: Mines to be placed must be greater than zero");
            })
            .finally(done());
        });

    });

    describe('Get an existing game should', () => {

        it('should get an existing game by gameId', (done) => {
       
            mock.onGet('/minesweeper/game', { 
                params: { 
                    gameId: 'd9592246-385b-4e71-b886-88cabd24e5c9' 
                } 
            } 
            ).reply(200, customGame); 
    
            let game = client.getGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("d9592246-385b-4e71-b886-88cabd24e5c9");
            })
            .finally(done());
        });

        it('should fail when a game does not exist', (done) => {
       
            mock.onGet('/minesweeper/game', { 
                params: { 
                    gameId: '871116d2-86d9-4be7-ab9a-46c1236ae25b' 
                } 
            } 
            ).reply(404, {
                "message": "The requested game was not found on memory or does not exist, please create a new one",
                "gameId": "871116d2-86d9-4be7-ab9a-46c1236ae25b",
                "statusCode": 404,
                "cause": "GameOperationFailed"
            }); 
    
            let game = client.getGame("871116d2-86d9-4be7-ab9a-46c1236ae25b");
            game.then((result) => {
                result.error.cause.should.equal("GameOperationFailed");
            })
            .finally(done());
        });

        it('should fail when a gameId is invalid', (done) => {
       
            mock.onGet('/minesweeper/game', { 
                params: { 
                    gameId: ''
                } 
            } 
            ).reply(401, {
                "message": "The gameId must have a value",
                "cause": "Invalid Parameters"
            }); 
    
            let game = client.getGame("");
            game.then((result) => {
                result.error.cause.should.equal("Invalid Parameters");
                result.error.message.should.equal("The gameId must have a value");
            })
            .finally(done());
        });

    
    });

    describe('Get history of a specified game should', () => {

        it('should get historic of game if exist', (done) => {
       
            mock.onGet('/minesweeper/game/feed33f9-1a4e-43d0-bd34-08b65d198bc4/history').reply(200, gameHistory); 
    
            let game = client.getGameHistory("feed33f9-1a4e-43d0-bd34-08b65d198bc4");
            game.then((result) => {
                result.historic.length.should.equal(2);
                result.historic[0].gameId.should.equal("feed33f9-1a4e-43d0-bd34-08b65d198bc4");
                result.historic[1].gameId.should.equal("feed33f9-1a4e-43d0-bd34-08b65d198bc4");
            })
            .finally(done());
        });

        it('should fail if the game not exists', (done) => {
       
            mock.onGet('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/history')
            .reply(404,
                {
                    "message": "The requested game was not found on memory or does not exist, please create a new one",
                    "gameId": "871116d2-86d9-4be7-ab9a-46c1236ae25b",
                    "statusCode": 404,
                    "cause": "GameOperationFailed"
                });
    
            let game = client.getGameHistory("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("GameOperationFailed");
            })
            .finally(done());
        });


    });

    describe('Reveal a spot of the minefield should', () => {

        it('should reveal the spot with a specified gameId and game must remain Active', (done) => {
       
            mock.onPut('/minesweeper/game/8a6b4c5e-aad7-488f-9493-69cef0e2bfd2/reveal', { 
                data:{
                    row: 0,
                    col: 0
                }
            } 
            ).reply(200, revealedAndMarkedGame); 
    
            let game = client.revealSpot("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2",0,0);
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2");
                result.minefield.board[0][0].revealed.should.equal(true)
            })
            .finally(done());
        });

        it('should reveal the spot of a gameId and game must pass to Lose state', (done) => {
       
            mock.onPut('/minesweeper/game/8ad43a0f-1a57-405a-af4b-80990e02149c/reveal', { 
                data:{
                    row: 0,
                    col: 1
                }
            } 
            ).reply(200, losedGame); 
    
            let game = client.revealSpot("8ad43a0f-1a57-405a-af4b-80990e02149c",0,1);
            game.then((result) => {
                result.gameStatus.should.equal("Lose");
                result.gameId.should.equal("8ad43a0f-1a57-405a-af4b-80990e02149c");
                result.minefield.board[0][1].revealed.should.equal(true)
            })
            .finally(done());
        });

        it('should fail if the spots are invalid', (done) => {
       
            mock.onPut('/minesweeper/game/8ad43a0f-1a57-405a-af4b-80990e02149c/reveal', { 
                data:{
                    row: 0,
                    col: -1
                }
            } 
            ).reply(400, {
                "cause": "Invalid Parameters",
                "message": "requirement failed: The column must greater than zero"
            }); 
    
            let game = client.revealSpot("8ad43a0f-1a57-405a-af4b-80990e02149c",0,-1);

            game.then((result) => {
                result.error.cause.should.equal("Invalid Parameters");
                result.error.message.should.equal("requirement failed: The column must greater than zero")
            })
            .finally(done());
        });

    });

    describe('Mark a spot of the minefield should', () => {

        it('should mark the spot with a specified gameId and game must not be affected', (done) => {
       
            mock.onPut('/minesweeper/game/8a6b4c5e-aad7-488f-9493-69cef0e2bfd2/mark', {
                data:{
                    row: 1,
                    col: 0,
                    mark: "QuestionMark"
                }
            } 
            ).reply(200, revealedAndMarkedGame); 
    
            let game = client.markSpotWithQuestion("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2",1,0);
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2");
                result.minefield.board[1][0].mark.should.equal("QuestionMark")
            })
            .finally(done());
        });

        it('should mark the spot with a specified gameId and game must not be affected', (done) => {
       
            mock.onPut('/minesweeper/game/8a6b4c5e-aad7-488f-9493-69cef0e2bfd2/mark', {
                data:{
                    row: 0,
                    col: 1,
                    mark: "FlagMark"
                }
            } 
            ).reply(200, revealedAndMarkedGame); 
    
            let game = client.markSpotWithFlag("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2",0,1);
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2");
                result.minefield.board[0][1].mark.should.equal("FlagMark")
            })
            .finally(done());
        });

        it('should remove the mark on a spot with the specified gameId and game must not be affected', (done) => {
       
            mock.onPut('/minesweeper/game/8a6b4c5e-aad7-488f-9493-69cef0e2bfd2/mark', {
                data:{
                    row: 0,
                    col: 0,
                    mark: "None"
                }
            } 
            ).reply(200, revealedAndMarkedGame); 
    
            let game = client.removeMark("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2",0,0);
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2");
                result.minefield.board[0][0].mark.should.equal("None")
            })
            .finally(done());
        });

        it('should fail if someone try to send anything as mark using the private intended _mark function', (done) => {
       
            mock.onPut('/minesweeper/game/8a6b4c5e-aad7-488f-9493-69cef0e2bfd2/mark', {
                data:{
                    row: 0,
                    col: 0,
                    mark: "AnyString"
                }
            } 
            ).reply(400, {
                "cause": "Invalid Parameters",
                "message": "AnyString' is not a member of enum MarkType: DownField(mark)"
            }); 
    
            let game = client._sendMarkToSpot("8a6b4c5e-aad7-488f-9493-69cef0e2bfd2",0,0, "AnyString");
            game.then((result) => {
                result.error.cause.should.equal("Invalid Parameters");
                result.error.message.should.equal("AnyString' is not a member of enum MarkType: DownField(mark)")
            })
            .finally(done());
        });


    });

    describe('Pause a game should', () => {

        it('should pause the game if exists', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/pause').reply(200, pausedGame); 
    
            let game = client.pauseGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("d9592246-385b-4e71-b886-88cabd24e5c9");
                result.paused.should.equal(true);
            })
            .finally(done());
        });

        it('should fail if the game not exists', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/pause')
            .reply(404,
                {
                    "message": "The requested game was not found on memory or does not exist, please create a new one",
                    "gameId": "871116d2-86d9-4be7-ab9a-46c1236ae25b",
                    "statusCode": 404,
                    "cause": "GameOperationFailed"
                });
    
            let game = client.pauseGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("GameOperationFailed");
            })
            .finally(done());
        });


    });

    describe('Resume a game should', () => {

        it('should resume the game if exists', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume').reply(200, customGame); 
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.gameStatus.should.equal("Active");
                result.gameId.should.equal("d9592246-385b-4e71-b886-88cabd24e5c9");
                result.paused.should.equal(false);
            })
            .finally(done());
        });

        it('should fail if the game not exists', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume')
            .reply(404,
                {
                    "message": "The requested game was not found on memory or does not exist, please create a new one",
                    "gameId": "871116d2-86d9-4be7-ab9a-46c1236ae25b",
                    "statusCode": 404,
                    "cause": "GameOperationFailed"
                });
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("GameOperationFailed");
            })
            .finally(done());
        });


    });

    describe('Client Error Handling should', () => {

        it('Manage if API is request with a invalid client', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume')
            .reply(400,"Requested resurce does not receive method used, available GET");
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("Bad Request");
            })
            .finally(done());
        });

        it('Manage if API has an unexpected error', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume')
            .reply(500,"Unexpected Error");
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("Unexpected Server Error");
            })
            .finally(done());
        });

        it('Manage if API resource is not loger available', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume')
            .reply(404,"The resource does not exist");
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("Resource Not Found");
            })
            .finally(done());
        });

        it('Manage if API is down but server there is response', (done) => {
       
            mock.onPatch('/minesweeper/game/d9592246-385b-4e71-b886-88cabd24e5c9/resume')
            .reply(503);
    
            let game = client.resumeGame("d9592246-385b-4e71-b886-88cabd24e5c9");
            game.then((result) => {
                result.error.cause.should.equal("Unexpected Server Error");
            })
            .finally(done());
        });

    });

});