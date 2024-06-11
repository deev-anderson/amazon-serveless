const AmazonCognitoIdentity = require('amazon-cognito-identity-js');


export default class CognitoAuth {
    constructor(config) {
        this._userPool = this._getUserPool(config);
        this._cognitoUser = this._getCognitoUser(config, this._userPool);
        this._authToken = this._promiseAuthToken(this._cognitoUser);
    }

    getCurrentUser() {
        return this._cognitoUser;
    }

    signOut() {
        this._cognitoUser.signOut();
    };

    getAuthToken() {
        return this._authToken;
    }

    _register(username, email, password, onSuccess, onFailure) {

        const dataEmail = {
            Name: 'email',
            Value: email
        };

        const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        this._userPool.signUp(username, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    _signin(username, password, onSuccess, onFailure) {
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        const cognitoUser = this.createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    verify(username, code, onSuccess, onFailure) {
        this.createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    _verifyAuth(errorCallback) {
        this.getAuthToken().then(function setAuthToken(token) {
            if (!token) {
                errorCallback("No token found");
            }
        }).catch(function handleTokenError(error) {
            errorCallback(error);
        });
    }

    createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: this._userPool
        });
    }

    /*
     *  Event Handlers
     */

    handleSignin(event, username, password) {
        event.preventDefault();
        this._signin(username, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = '/app/ride.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    handleRegister(event, username, email, password, password2) {

        const onSuccess = function registerSuccess(result) {
            const cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            const confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };

        const onFailure = function registerFailure(err) {
            alert(err.message);
        };

        event.preventDefault();

        if (password === password2) {
            this._register(username, email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }



    _promiseAuthToken(cognitoUser) {
        return new Promise(function fetchCurrentAuthToken(resolve, reject) {

            if (cognitoUser) {

                cognitoUser.getSession(function sessionCallback(err, session) {
                    if (err) {
                        reject(err);
                    } else if (!session.isValid()) {
                        resolve(null);
                    } else {
                        resolve(session.getIdToken().getJwtToken());
                    }
                });
            } else {
                resolve(null);
            }

        });
    }

    _getUserPool(config) {
        const poolData = {
            UserPoolId: config.getUserPoolId(),
            ClientId: config.getUserPoolClientId()
        };
        return new AmazonCognitoIdentity.CognitoUserPool(poolData);
    }

    _getCognitoUser(config, userPool) {

        if (typeof AWSCognito !== 'undefined') {
            AWSCognito.config.region = config.getRegion();
        }

        return userPool.getCurrentUser();
    }
}