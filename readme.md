# MinesweeperAPI JavaScript Client

a JavaScript ES6 Standard promise based Client for MineSweeper Scala API builded using Axios as HTTP Client built with NPM and WebPack.

## MinesweeperAPI

A Minsweeper game microservice desinged with Akka HTTP and Akka Actors using persistence and event sourcing.

This client is designed for interaction with the API directly in JavaScript with already the available services includes.

To see the API you can go to
[MinesweeperAPI](https://github.com/david93111/minesweeperAPI)

## How to use

This plugin is not published on the NPM Registry, so menwhile to be able to use it you will need to build it and add it directly to your JS, Angular, Ionic or Node projec<, but don't worry building it is really easy, so lets start.

1. Clone the repository to your local machine
2. go to root folder of the project
3. execute npm install
4. you can see the available commands inside the `package.json`,
   there are two build commands, one for dev, that does not minify the file, and the default build to minify the file and get it ready for production, choose what ever suites best for you
5. execute the build command as 
   ```
   npm run build 
   # or npm run builDev
   ```
   If command prompt ask to install WebPack, cli version of both current options is recommended
6. Once the build finishes successful you will have in the dist    folder of the root procjet the final webpacked .js files
   that can be used inside our JavaScript application to be connected with the minesweeper API

## Compatibility

This version (0.1.0) of the JS Client Library is compatible with the minesweeperAPI version 0.0.1, a compatible version with 1.0.0 will be released sooner. 

