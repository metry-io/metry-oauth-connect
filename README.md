# metry-oauth-connect
A javascript library for connecting to Metry user's consumption data via OAuth 2.0

## Demo
There is a demo available where you can test the button<a href="http://metry-oauth-connect-demo.s3-website-eu-west-1.amazonaws.com/">test the button</a>. Use your own Metry-account to approve access. If you don't have one you can register at https://metry.io

## Configuration
```
var metry = new MetryoAuthConnect({
    clientSecret : 'demopass',
    clientId     : 'demoapp',
    redirectUri  : location.origin + location.pathname,
    onSuccess    : function(token) {
        console.info('Got the Metry oAuth tokens!');
        console.info(token);
    }
});
```

Give any button/link a `data-metry="authenticate"` attribute and the oAuth authentication process will start. 

For now you can use the demoapp/demopass client id/secret while you're testing your implementation.
Contact Metry (http://support.metry.io) to get started with your own clientId and clientSecret

## Metry oAuth 2.0 endpoints
If you decide to roll your own implementation, keep in mind the oAuth endpoints for Metry:

| Description   | Url           |
| ------------- | ------------- |
| Host                 | https://app.metry.io/  |
| oAuth 2.0 Authorize  | https://app.metry.io/oauth/authorize  |
| oAuth 2.0 Token      | https://app.metry.io/oauth/token  |


## Making API requests
Got your access_token? Then it's time to make those API calls to Metry. See our detailed documentation on
[http://docs.metry.apiary.io](http://docs.metry.apiary.io/#)
