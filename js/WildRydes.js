import Config from 'Config/Config';
import CognitoAuth from 'Cognito/cognito-auth';

const signinUrl = '/signin.html';
const appPrefix = 'app/';

export default class WildRydes {

    constructor() {
        this._config = this._retrieveConfig();
        this._auth = new CognitoAuth(this._config);
        this._auth._verifyAuth(this.handleAuthError);
    }

    getConfig() {
        return this._config;
    }

    getAuth() {
        return this._auth;
    }

    handleVerifyEmail(event, email, code) {

        event.preventDefault();
        this._auth.verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }

    handleAuthError(error) {
        if(window.location.pathname.startsWith(appPrefix)) {
            window.location.href = signinUrl;
        }
    }

    _getJsonConfig(file) {
        let result = null;

        $.ajax({
            url: "/build/config/" + file + ".json",
            dataType: 'json',
            async: false,
            success: function (data) {
                result = data;
            }
        });

        return result;
    }

    _retrieveConfig() {
        const authConfig = this._getJsonConfig("auth_config");
        const apiConfig = this._getJsonConfig("api_config");

        if (apiConfig && authConfig && apiConfig.Region === authConfig.Region) {
            return new Config(authConfig.userPoolId, authConfig.userPoolClientId, apiConfig.Region, apiConfig.ServiceEndpoint, apiConfig.IotEndpoint);
        } else {
            $('#noCognitoMessage').show();
            console.log(apiConfig);
            console.log(authConfig);
            console.error("Error retrieving config!");
            return null;
        }
    }
}
