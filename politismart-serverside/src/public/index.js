//Registering a new user: create a submit listener:
$('.user-login-form').submit( event => {
  event.preventDefault();
  let usernameInput = $('.username-field').val();
  let passwordInput = $('.password-field').val();
  getAndStoreJwt(usernameInput, passwordInput);
});

$('.staff-login-button').click( event => {
  window.location.href='/adminLogin.html';
})

//Getting this user's JWT and storing it locally for use in other pages:
function getAndStoreJwt(usernameInput, passwordInput) {
  var settings = {
    "url": "/api/auth/login",
    "error": function(error) {
      if (error.responseText == "Unauthorized") {
        alert(error.responseText + ": check username and password");  
      } else {
        alert(error.resonseText)
      }
    },
    "method": "POST",
    "headers": {
      "content-type": "application/json"
    },
    "data": `{"username": "${usernameInput}", 
              "password": "${passwordInput}"}`
  }
  $.ajax(settings).done(function (response) {
    window.localStorage.setItem('pediatrician-jwt', response.authToken);
    window.localStorage.setItem('pediatrician-username', usernameInput);
    window.location.href = '/results.html';
  })
}