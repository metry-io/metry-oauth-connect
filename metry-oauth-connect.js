// MetryoAuthConnect
// --------------
// Javascript class that makes it easy to connect with Metry's oAuth authentication
//

var MetryoAuthConnect = function MetryoAuthConnect(options) {

    this.BASE_URL = 'https://app.metry.io/';
    this.PATH_TOKEN = 'oauth/token';
    this.PATH_AUTHORIZE = 'oauth/authorize';

    this.authConfig = options;

    this.attachToButtons();
}


/**
 * Handle incoming Auth Codes
 * We should request an authorization_code now and set those in our localStorage
 *
 * @param code The code we got from the authentication window.
 */
MetryoAuthConnect.prototype.handleAuthCode = function handleAuthCode(code) {
    var that = this;
    var url = this.makeUrl([this.BASE_URL, this.PATH_TOKEN], {});
    var params = {
        grant_type: "authorization_code",
        code: code,
        client_id: this.authConfig.clientId,
        client_secret: this.authConfig.clientSecret,
        state: "",
        scope: this.authConfig.scope || 'basic',
        redirect_uri: this.authConfig.redirectUri
    };

    var jqxhr = $.post(url, params)
        .done(function(res) {

            // onSuccess callback
            if (typeof that.authConfig.onSuccess == 'function') {
                that.authConfig.onSuccess(res);
            }

            // Trigger Metry::GotToken
            $(document).trigger('Metry:GotToken', res);
        })
        .fail(function (err) {
            console.log(err);
        });
}

/**
 * Fetch a new access token from the Refresh Token
 *
 * @param refreshToken The refresh token
 * @returns {*} This returns a jQuery POST promise
 */
MetryoAuthConnect.prototype.fetchAccessToken = function fetchAccessToken(refreshToken) {
    return $.post(this.makeUrl([this.BASE_URL, this.PATH_TOKEN]), {
        client_id: this.authConfig.clientId,
        client_secret: this.authConfig.clientSecret,
        grant_type: 'refresh_token',
        scope: this.authConfig.scope || 'basic',
        refresh_token: refreshToken
    });
}

/**
 * Get the Authorization URL for Metry's oAuth authorize URL
 * @returns {string}
 */
MetryoAuthConnect.prototype.authorizeUrl = function authorizeUrl() {
    var params = {
        client_id: this.authConfig.clientId,
        redirect_uri: this.authConfig.redirectUri,
        grant_type: 'authorization_code',
        response_type: 'code',
        state: 'emAuth',
        scope: this.authConfig.scope || 'basic'
    };

    return this.makeUrl([this.BASE_URL, this.PATH_AUTHORIZE], params);
}

/**
 * UI Integration
 * -------------------------
 * Methods that enables UI integration.
 */

/**
 * Open Authentication PopUp
 *
 * This function will open a new window with the Metry oAuth Authentication window.
 * It will listen to a change in the window and will try to obtain the 'code' parameter with the
 * oAuth token that we can use in 'handleAuthCode'.
 */
MetryoAuthConnect.prototype.openAuthenticatePopup = function openAuthenticatePopup()
{
    var that = this;

    var authUrl = this.authorizeUrl();
    var features = this.getWindowFeatures(500, 700);
    var authWindow = window.open(authUrl, 'mryAuthWindow', features);

    var checkInterval = setInterval(function() {
        if (authWindow.closed) {
            return clearInterval(checkInterval);
        }

        try {
            var code = that.getParam('code', authWindow.document.URL);

            if (code && code != null) {
                clearInterval(checkInterval);
                authWindow.close();

                that.handleAuthCode(code);
            }
        } catch (e) {}
    }, 200);
};

/**
 * Attach to buttons
 *
 * This function will attach event listeners on buttons.
 * For example <a href="#" data-metry="authenticate">Connect</a>
 */
MetryoAuthConnect.prototype.attachToButtons = function attachToButtons()
{
    that = this;

    $(document)
        .on('click', '[data-metry^="authenticate"]', function (e) {
            var $btn = $(e.target);
            that.openAuthenticatePopup();
        });
}

/**
 * Utilities
 * -------------------------
 * Helper functions for this Metry oAuth Connect library
 */

/**
 * Build a link based on components and parameters
 * @param components
 * @param params
 * @returns {string} Returns a URL
 */
MetryoAuthConnect.prototype.makeUrl = function makeUrl(components, params) {
    var fullPath = [];

    for (var i = 0, len = components.length; i < len; i++) {
        var component = components[i];

        if (component == null) {
            break;
        }

        fullPath.push(component.replace(/^\/|\/$/, ''));
    }

    var path = fullPath.join('/') + '?';

    if (typeof params === 'object') {
        for (var key in params) {
            var value = params[key];

            path += key + '=' + encodeURIComponent(value) + '&';
        }
    }

    return path.slice(0, -1);
};

/**
 * Get URL based parameters
 *
 * @param name
 * @param url
 * @returns {null}
 */
MetryoAuthConnect.prototype.getParam = function getParam(name, url) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);

    return results == null ? null : results[1];
}

/**
 * Get the window sizes used for opening a new window
 *
 * @param width
 * @param height
 * @returns {string}
 */
MetryoAuthConnect.prototype.getWindowFeatures = function getWindowFeatures(width, height) {
    var top = (screen.height - height) / 2;
    var left = (screen.width - width) / 2;

    return 'width=' + width +
        ',height=' + height +
        ',top=' + top +
        ',left=' + left +
        ',status=0,menubar=0,toolbar=0,personalbar=0';
}
