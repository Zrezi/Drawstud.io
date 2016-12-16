# Drawstud.io v1.1

A Node.js collaborative drawing application.

## Running a Drawstud.io Server

#### Install Node

Make sure you have [Node](https://nodejs.org/en/) installed on your computer.

#### Running the Node server on Windows

Run the `run.bat` file in the main directory, or open a command prompt and run

```
node server.js
```

#### Running the Node server on Linux

Run `chmod +x run.sh` in a terminal and double click on `run.sh`, or alternatively, in terminal run

```
nodejs server.js
```

# Version History

* Version 1.1 -- Commit 34
  * Rewrite server in Async
    * Used [Async](https://www.npmjs.com/package/async) and [Async-Loop](https://www.npmjs.com/package/node-async-loop)
  * Multi-color drawing
* Version 1.0 -- Commit 27
  * User accounts
    * [BCrypt](https://www.npmjs.com/package/bcrypt-nodejs) encryption of passwords
    * Server verification for login
    * JSON storage with [JSONFile](https://www.npmjs.com/package/jsonfile)
  * Persistent user created rooms
    * Instanced drawing rooms
  * Touch-Enabled for mobile devices
  * Connections via [socket.io](http://socket.io/)
  * [Materialize CSS](http://materializecss.com/)