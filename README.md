# Drawstud.io

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

# Up Next
* Add multi-color drawing
* Add different line widths
* Add shapes
* Start using Git branches!

#### Known Issues
* Rewrite server backend using [Async](https://www.npmjs.com/package/async)
  * Will remove those nasty for loops in the server code

# Version History

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