/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2012, Ivan De Marino <http://ivandemarino.me>
Copyright (c) 2012, Alex Anderson <@alxndrsn>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var ghostdriver = ghostdriver || {};

ghostdriver.SessionReqHand = function(session) {
    // private:
    var
    _session = session,
    _protoParent = ghostdriver.SessionReqHand.prototype,
    _locator = new ghostdriver.WebElementLocator(session),
    _const = {
        URL             : "url",
        ELEMENT         : "element",
        ELEMENTS        : "elements",
        ELEMENT_DIR     : "/element/",
        ACTIVE          : "active",
        TITLE           : "title",
        WINDOW          : "window",
        CURRENT         : "current",
        SIZE            : "size",
        POSITION        : "position",
        MAXIMIZE        : "maximize",
        FORWARD         : "forward",
        BACK            : "back",
        REFRESH         : "refresh",
        EXECUTE         : "execute",
        EXECUTE_ASYNC   : "execute_async",
        SCREENSHOT      : "screenshot",
        TIMEOUTS        : "timeouts",
        TIMEOUTS_DIR    : "/timeouts/",
        ASYNC_SCRIPT    : "async_script",
        IMPLICIT_WAIT   : "implicit_wait",
        WINDOW_HANDLE   : "window_handle",
        WINDOW_HANDLES  : "window_handles",
        FRAME           : "frame",
        SOURCE          : "source",
        COOKIE          : "cookie",
        KEYS            : "keys",
        MOVE_TO         : "moveto",
        CLICK           : "click",
        BUTTON_DOWN     : "buttondown",
        BUTTON_UP       : "buttonup",
        DOUBLE_CLICK    : "doubleclick"
    },
    _errors = _protoParent.errors,

    _handle = function(req, res) {
        var element;

        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        // Handle "/url" GET and POST
        if (req.urlParsed.file === _const.URL) {                                         //< ".../url"
            if (req.method === "GET") {
                _getUrlCommand(req, res);
            } else if (req.method === "POST") {
                _postUrlCommand(req, res);
            }
            return;
        } else if (req.urlParsed.file === _const.SCREENSHOT && req.method === "GET") {
            _getScreenshotCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW) {                              //< ".../window"
            if (req.method === "DELETE") {
                _deleteWindowCommand(req, res);     //< close window
            } else if (req.method === "POST") {
                _postWindowCommand(req, res);       //< change focus to the given window
            }
            return;
        } else if (req.urlParsed.chunks[0] === _const.WINDOW) {
            _doWindowHandleCommands(req, res);
            return;
        } else if (req.urlParsed.file === _const.ELEMENT && req.method === "POST" && req.urlParsed.chunks.length === 1) {    //< ".../element"
            _locator.handleLocateCommand(req, res, _locator.locateElement);
            return;
        } else if (req.urlParsed.file === _const.ELEMENTS && req.method === "POST" && req.urlParsed.chunks.length === 1) {    //< ".../elements"
            _locator.handleLocateCommand(req, res, _locator.locateElements);
            return;
        } else if (req.urlParsed.chunks[0] === _const.ELEMENT && req.urlParsed.chunks[1] === _const.ACTIVE && req.method === "POST") {  //< ".../element/active"
            _locator.handleLocateCommand(req, res, _locator.locateActiveElement);
            return;
        } else if (req.urlParsed.chunks[0] === _const.ELEMENT) {            //< ".../element/:elementId/COMMAND"
            // Get the WebElementRH and, if found, re-route request to it
            element = new ghostdriver.WebElementReqHand(req.urlParsed.chunks[1], _session);
            if (element !== null) {
                _protoParent.reroute.call(element, req, res, _const.ELEMENT_DIR + req.urlParsed.chunks[1]);
            } else {
                throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
            }
            return;
        } else if (req.urlParsed.file === _const.TITLE && req.method === "GET") {       //< ".../title"
            // Get the current Page title
            _getTitleCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.KEYS && req.method === "POST") {
            _postKeysCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.FORWARD && req.method === "POST") {
            _forwardCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.BACK && req.method === "POST") {
            _backCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.REFRESH && req.method === "POST") {
            _refreshCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.EXECUTE && req.method === "POST") {
            _executeCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.EXECUTE_ASYNC && req.method === "POST") {
            _executeAsyncCommand(req, res);
            return;
        } else if ((req.urlParsed.file === _const.TIMEOUTS || req.urlParsed.directory === _const.TIMEOUTS_DIR) && req.method === "POST") {
            _postTimeout(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW_HANDLE && req.method === "GET") {
            _getWindowHandle(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW_HANDLES && req.method === "GET") {
            _getWindowHandles(req, res);
            return;
        } else if (req.urlParsed.file === _const.FRAME && req.method === "POST") {
            _postFrameCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SOURCE && req.method === "GET") {
            _getSourceCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.MOVE_TO && req.method === "POST") {
            _postMouseMoveToCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLICK && req.method === "POST") {
            _postMouseClickCommand(req, res, "click");
            return;
        } else if (req.urlParsed.file === _const.BUTTON_DOWN && req.method === "POST") {
            _postMouseClickCommand(req, res, "mousedown");
            return;
        } else if (req.urlParsed.file === _const.BUTTON_UP && req.method === "POST") {
            _postMouseClickCommand(req, res, "mouseup");
            return;
        } else if (req.urlParsed.file === _const.DOUBLE_CLICK && req.method === "POST") {
            _postMouseClickCommand(req, res, "doubleclick");
            return;
        } else if (req.urlParsed.chunks[0] === _const.COOKIE) {
            if (req.method === "POST") {
                _postCookieCommand(req, res);
            } else if (req.method === "GET") {
                _getCookieCommand(req, res);
            } else if(req.method === "DELETE") {
                _deleteCookieCommand(req, res);
            }
            return;
        }

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _createOnSuccessHandler = function(res) {
        return function (status) {
            res.success(_session.getId());
        };
    },

    _doWindowHandleCommands = function(req, res) {
        var windowHandle,
            command,
            targetWindow;

        // console.log("_doWindowHandleCommands");
        // console.log(JSON.stringify(req, null, "  "));

        // Ensure all the parameters are provided
        if (req.urlParsed.chunks.length === 3) {
            windowHandle = req.urlParsed.chunks[1];
            command = req.urlParsed.chunks[2];

            // Fetch the right window
            if (windowHandle === _const.CURRENT) {
                targetWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);
            } else {
                targetWindow = _protoParent.getSessionWindow.call(this, windowHandle, _session, req);
            }

            // Act on the window (page)
            if(command === _const.SIZE && req.method === "POST") {
                _postWindowSizeCommand(req, res, targetWindow);
                return;
            } else if(command === _const.SIZE && req.method === "GET") {
                _getWindowSizeCommand(req, res, targetWindow);
                return;
            } else if(command === _const.POSITION && req.method === "POST") {
                _postWindowPositionCommand(req, res, targetWindow);
                return;
            } else if(command === _const.POSITION && req.method === "GET") {
                _getWindowPositionCommand(req, res, targetWindow);
                return;
            } else if(command === _const.MAXIMIZE && req.method === "POST") {
                _postWindowMaximizeCommand(req, res, targetWindow);
                return;
            }

            // No command matched: error
            throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postWindowSizeCommand = function(req, res, targetWindow) {
        var params = JSON.parse(req.post),
            newWidth = params.width,
            newHeight = params.height;

        // If width/height are passed in string, force them to numbers
        if (typeof(params.width) === "string") {
            newWidth = parseInt(params.width, 10);
        }
        if (typeof(params.height) === "string") {
            newHeight = parseInt(params.height, 10);
        }

        // If a number was not found, the command is
        if (isNaN(newWidth) || isNaN(newHeight)) {
            throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        }

        targetWindow.viewportSize = {
            width : newWidth,
            height : newHeight
        };
        res.success(_session.getId());
    },

    _getWindowSizeCommand = function(req, res, targetWindow) {
        // Returns response in the format "{width: number, height: number}"
        res.success(_session.getId(), targetWindow.viewportSize);
    },

    _postWindowPositionCommand = function(req, res, targetWindow) {
        var params = JSON.parse(req.post),
            newX = params.x,
            newY = params.y;

        // If width/height are passed in string, force them to numbers
        if (typeof(params.x) === "string") {
            newX = parseInt(params.x, 10);
        }
        if (typeof(params.y) === "string") {
            newY = parseInt(params.y, 10);
        }

        // If a number was not found, the command is
        if (isNaN(newX) || isNaN(newY)) {
            throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        }

        // NOTE: Nothing to do! PhantomJS is headless. :)
        res.success(_session.getId());
    },

    _getWindowPositionCommand = function(req, res, targetWindow) {
        // Returns response in the format "{width: number, height: number}"
        res.success(_session.getId(), { x : 0, y : 0 });
    },

    _postWindowMaximizeCommand = function(req, res, targetWindow) {
        // NOTE: Nothing to do! PhantomJS is headless. :)
        res.success(_session.getId());
    },

    _postKeysCommand = function(req, res) {
        var activeEl = _locator.locateActiveElement();
        var elReqHand = new ghostdriver.WebElementReqHand(activeEl.value, _session);
        elReqHand.postValueCommand(req, res);
    },

    _refreshCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        currWindow.execFuncAndWaitForLoad(
            function() { currWindow.reload(); },
            successHand,
            successHand); //< We don't care if 'refresh' fails
    },

    _backCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        if (currWindow.canGoBack) {
            currWindow.execFuncAndWaitForLoad(
                function() { currWindow.goBack(); },
                successHand,
                successHand); //< We don't care if 'back' fails
        } else {
            // We can't go back, and that's ok
            successHand();
        }
    },

    _forwardCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        if (currWindow.canGoForward) {
            currWindow.execFuncAndWaitForLoad(
                function() { currWindow.goForward(); },
                successHand,
                successHand); //< We don't care if 'back' fails
        } else {
            // We can't go back, and that's ok
            successHand();
        }
    },

    _executeCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            result,
            timer,
            scriptTimeout = _session.getScriptTimeout(),
            timedOut = false;

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            // Execute script, but within a limited timeframe
            timer = setTimeout(function() {
                // The script didn't return within the expected timeframe
                timedOut = true;
                _errors.handleFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.TIMEOUT,
                    "Script didn't return within " + scriptTimeout + "ms",
                    req,
                    res,
                    _session,
                    "SessionReqHand");
            }, scriptTimeout);

            // Launch the actual script
            result = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                postObj.script,
                postObj.args,
                true);

            // If we are here, we don't need the timer anymore
            clearTimeout(timer);

            // Respond with result ONLY if this hasn't ALREADY timed-out
            if (!timedOut) {
                res.respondBasedOnResult(_session, req, result);
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _executeAsyncCommand = function(req, res) {
        var postObj = JSON.parse(req.post);

        // console.log("executeAsync - " + JSON.stringify(postObj));

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            _protoParent.getSessionCurrWindow.call(this, _session, req).setOneShotCallback("onCallback", function() {
                // console.log("onCallback - " + JSON.stringify(postObj));
                res.respondBasedOnResult(_session, req, arguments[0]);
            });

            _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
                "function(script, args, timeout) { " +
                    "return (" + require("./webdriver_atoms.js").get("execute_async_script") + ")" +
                        "(script, args, timeout, callPhantom, true); " +
                "}",
                postObj.script,
                postObj.args,
                _session.getAsyncScriptTimeout());
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getWindowHandle = function (req, res) {
        var handle;

        // Initialize the Current Window (we need at least that)
        _session.initCurrentWindowIfNull();

        // Get current window handle
        handle = _session.getCurrentWindowHandle();

        if (handle !== null) {
            res.success(_session.getId(), handle);
        } else {
            throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Current window handle invalid (closed?)",  //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
        }
    },

    _getWindowHandles = function(req, res) {
        // Initialize the Current Window (we need at least that)
        _session.initCurrentWindowIfNull();
        res.success(_session.getId(), _session.getWindowHandles());
    },

    _getScreenshotCommand = function(req, res) {
        var rendering = _protoParent.getSessionCurrWindow.call(this, _session, req).renderBase64("png");
        res.success(_session.getId(), rendering);
    },

    _getUrlCommand = function(req, res) {
        // Get the URL at which the Page currently is
        var result = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return location.toString()",
            []);

        res.respondBasedOnResult(_session, res, result);
    },

    _postUrlCommand = function(req, res) {
        // Load the given URL in the Page
        var postObj = JSON.parse(req.post),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        // console.log("Session '"+ _session.getId() +"' is about to load URL: " + postObj.url);

        if (typeof(postObj) === "object" && postObj.url) {
            // Switch to the main frame first
            currWindow.switchToMainFrame();
            // console.log("Session '"+ _session.getId() +"' has switched to the MainFrame");

            // Load URL and wait for load to finish (or timeout)
            currWindow.execFuncAndWaitForLoad(
                function() {
                    currWindow.open(postObj.url);
                },
                _createOnSuccessHandler(res),           //< success
                function() {                            //< failure/timeout
                    // Request timed out
                    _errors.handleFailedCommandEH(
                            _errors.FAILED_CMD_STATUS.TIMEOUT,
                            "URL '" + postObj.url + "' didn't load within " + _session.getPageLoadTimeout() + "ms",
                            req,
                            res,
                            _session,
                            "SessionReqHand");
                });
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postTimeout = function(req, res) {
        var postObj = JSON.parse(req.post);

        // Normalize the call: the "type" is read from the URL, not a POST parameter
        if (req.urlParsed.file === _const.IMPLICIT_WAIT) {
            postObj["type"] = _session.timeoutNames.IMPLICIT;
        } else if (req.urlParsed.file === _const.ASYNC_SCRIPT) {
            postObj["type"] = _session.timeoutNames.ASYNC_SCRIPT;
        }

        if (typeof(postObj["type"]) !== "undefined" && typeof(postObj["ms"]) !== "undefined") {
            // Set the right timeout on the Session
            switch(postObj["type"]) {
                case _session.timeoutNames.SCRIPT:
                    _session.setScriptTimeout(postObj["ms"]);
                    break;
                case _session.timeoutNames.ASYNC_SCRIPT:
                    _session.setAsyncScriptTimeout(postObj["ms"]);
                    break;
                case _session.timeoutNames.IMPLICIT:
                    _session.setImplicitTimeout(postObj["ms"]);
                    break;
                case _session.timeoutNames.PAGE_LOAD:
                    _session.setPageLoadTimeout(postObj["ms"]);
                    break;
            }

            res.success(_session.getId());
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postFrameCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            frameName,
            switched = false;

        if (typeof(postObj) === "object" && typeof(postObj.id) !== "undefined") {
            if(postObj.id === null) {
                // Reset focus on the topmost (main) Frame
                _protoParent.getSessionCurrWindow.call(this, _session, req).switchToMainFrame();
                switched = true;
            } else if (typeof(postObj.id) === "number") {
                // Switch frame by "index"
                switched = _protoParent.getSessionCurrWindow.call(this, _session, req).switchToFrame(postObj.id);
            } else if (typeof(postObj.id) === "string") {
                // Switch frame by "name" and, if not found, by "id"
                switched = _protoParent.getSessionCurrWindow.call(this, _session, req).switchToFrame(postObj.id);

                // If we haven't switched, let's try to find the frame "name" using it's "id"
                if (!switched) {
                    // fetch the frame "name" via "id"
                    frameName = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(function(frameId) {
                        var el = null;
                        el = document.querySelector('#'+frameId);
                        if (el !== null) {
                            return el.name;
                        }
                        return null;
                    }, postObj.id);

                    // Switch frame by "name"
                    switched = _protoParent.getSessionCurrWindow.call(this, _session, req).switchToFrame(frameName);
                }
            } else if (typeof(postObj.id) === "object" && typeof(postObj.id["ELEMENT"]) === "string") {
                // Will use the Element JSON to find the frame name
                frameName = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "return arguments[0].name;",
                    [postObj.id]);

                // If a name was found
                if (frameName && frameName.value) {
                    // Switch frame by "name"
                    switched = _protoParent.getSessionCurrWindow.call(this, _session, req).switchToFrame(frameName.value);
                } else {
                    // No name was found
                    switched = false;
                }
            } else {
                throw _errors.createInvalidReqInvalidCommandMethodEH(req);
            }

            // Send a positive response if the switch was successful
            if (switched) {
                res.success(_session.getId());
            } else {
                // ... otherwise, throw the appropriate exception
                throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_FRAME,    //< error name
                    "Unable to switch to frame",                //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getSourceCommand = function(req, res) {
        var source = _protoParent.getSessionCurrWindow.call(this, _session, req).frameContent;
        res.success(_session.getId(), source);
    },

    _postMouseMoveToCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            coords = { x: 0, y: 0 },
            elementLocation,
            elementSize,
            elementSpecified = false,
            offsetSpecified = false;

        if (typeof postObj === "object") {
            elementSpecified = postObj.element && postObj.element != null;
            offsetSpecified = typeof postObj.xoffset !== "undefined" && typeof postObj.yoffset !== "undefined";
        }
        // Check that either an Element ID or an X-Y Offset was provided
        if (elementSpecified || offsetSpecified) {
            // console.log("element: " + elementSpecified + ", offset: " + offsetSpecified);
            // If an Element was provided...
            if (elementSpecified) {
                // Get Element's Location and add it to the coordinates
                var requestHandler = new ghostdriver.WebElementReqHand(postObj.element, _session);
                elementLocation = requestHandler.getLocationInView();
                elementSize = requestHandler.getSize();
                // If the Element has a valid location
                if (elementLocation !== null) {
                    coords.x = elementLocation.x;
                    coords.y = elementLocation.y;
                }
                // console.log("element specified. initial coordinates (" + coords.x + "," + coords.y + ")");
            } else {
                coords = _session.inputs.getCurrentCoordinates();
                // console.log("no element specified. initial coordinates (" + coords.x + "," + coords.y + ")");
            }

            if (elementSpecified && !offsetSpecified && elementSize !== null) {
                coords.x += Math.floor(elementSize.width / 2);
                coords.y += Math.floor(elementSize.height / 2);
                // console.log("element specified and no offset. coordinates adjusted to (" + coords.x + "," + coords.y + ")");
            } else {
                // Add up the offset (if any)
                coords.x += postObj.xoffset || 0;
                coords.y += postObj.yoffset || 0;
                // console.log("offset specified. coordinates adjusted to (" + coords.x + "," + coords.y + ")");
            }

            // Send the Mouse Move as native event
            _session.inputs.mouseMove(_session, coords);
            res.success(_session.getId());
        } else {
            // Neither "element" nor "xoffset/yoffset" were provided
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postMouseClickCommand = function(req, res, clickType) {
        var postObj = {},
            mouseButton = "left";
        // normalize click
        clickType = clickType || "click";

        // The protocol allows language bindings to send an empty string
        if (req.post.length > 0) {
            postObj = JSON.parse(req.post);
        }

        // Check that either an Element ID or an X-Y Offset was provided
        if (typeof(postObj) === "object") {
            // Determine which button to click
            if (typeof(postObj.button) === "number") {
                // 0 is left, 1 is middle, 2 is right
                mouseButton = (postObj.button === 2) ? "right" : (postObj.button === 1) ? "middle" : "left";
            }
            // Send the Mouse Click as native event
            _session.inputs.mouseButtonClick(_session, clickType, mouseButton);
            res.success(_session.getId());
        } else {
            // Neither "element" nor "xoffset/yoffset" were provided
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postCookieCommand = function(req, res) {
        var postObj = JSON.parse(req.post || "{}");

        if (postObj.cookie) {
            // JavaScript deals with Timestamps in "milliseconds since epoch": normalize!
            if (postObj.cookie.expiry) {
                postObj.cookie.expiry *= 1000;
            }

            // If the cookie is expired OR if it was successfully added
            if ((postObj.cookie.expiry && postObj.cookie.expiry <= new Date().getTime()) ||
                _protoParent.getSessionCurrWindow.call(this, _session, req).addCookie(postObj.cookie)) {
                // Notify success
                res.success(_session.getId());
            } else {
                // Something went wrong while trying to set the cookie
                if (_protoParent.getSessionCurrWindow.call(this, _session, req).url.indexOf(postObj.cookie.domain) < 0) {
                    // Domain mismatch
                    _errors.handleFailedCommandEH(
                        _errors.FAILED_CMD_STATUS.INVALID_COOKIE_DOMAIN,
                        "Can only set Cookies for the current domain",
                        req,
                        res,
                        _session,
                        "SessionReqHand");
                } else {
                    // Something else went wrong
                    _errors.handleFailedCommandEH(
                        _errors.FAILED_CMD_STATUS.UNABLE_TO_SET_COOKIE,
                        "Unable to set Cookie",
                        req,
                        res,
                        _session,
                        "SessionReqHand");
                }
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getCookieCommand = function(req, res) {
        // Get all the cookies the session at current URL can see/access
        res.success(
            _session.getId(),
            _protoParent.getSessionCurrWindow.call(this, _session, req).cookies);
    },

    _deleteCookieCommand = function(req, res) {
        if (req.urlParsed.chunks.length === 2) {
            // delete only 1 cookie among the one visible to this page
            _protoParent.getSessionCurrWindow.call(this, _session, req).deleteCookie(req.urlParsed.chunks[1]);
        } else {
            // delete all the cookies visible to this page
            _protoParent.getSessionCurrWindow.call(this, _session, req).clearCookies();
        }
        res.success(_session.getId());
    },

    _deleteWindowCommand = function(req, res) {
        var params = JSON.parse(req.post || "{}"), //< in case nothing is posted at all
            closed = false;

        // Use the "name" parameter if it was provided
        if (typeof(params) === "object" && params.name) {
            closed = _session.closeWindow(params.name);
        } else {
            closed = _session.closeCurrentWindow();
        }

        // Report a success if we manage to close the window,
        // otherwise throw a Failed Command Error
        if (closed) {
            res.success(_session.getId());
        } else {
            throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Unable to close window (closed already?)", //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
        }
    },

    _postWindowCommand = function(req, res) {
        var params = JSON.parse(req.post);

        if (typeof(params) === "object" && params.name) {
            // Report a success if we manage to switch the current window,
            // otherwise throw a Failed Command Error
            if (_session.switchToWindow(params.name)) {
                res.success(_session.getId());
            } else {
                throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Unable to switch to window (closed?)",     //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getTitleCommand = function(req, res) {
        res.success(_session.getId(), _protoParent.getSessionCurrWindow.call(this, _session, req).title);
    };

    // public:
    return {
        handle : _handle,
        getSessionId : function() { return _session.getId(); }
    };
};
// prototype inheritance:
ghostdriver.SessionReqHand.prototype = new ghostdriver.RequestHandler();
