const CLIENT_ID = "059e2de881a145c3be6a47f76c8d9cdc";
const CLIENT_SECRET = "d9b384efcaf849a39acd180cdfdc95a8";
const REDIRECT_URI = "http://127.0.0.1:5500/index.html";

// Define the authorization endpoint URL
const AUTHORIZATION_ENDPOINT = "https://accounts.spotify.com/authorize";

// Define the token endpoint URL
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Define the desired scope of access
const SCOPE =
  "user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify user-read-playback-position user-read-recently-played user-top-read playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative user-follow-read user-follow-modify";

// Define a state parameter (optional)
const STATE = generateState();

// Redirect the user to the Spotify authorization page
function authorize() {
  const url = `${AUTHORIZATION_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;
  window.location.href = url;
}

// Exchange the authorization code for an access token
function getAccessToken() {
  event.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  authorizationCode = urlParams.get("code");
  console.log(authorizationCode);
  const body = `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${REDIRECT_URI}`;
  const headers = {
    Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  return fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: headers,
    body: body,
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const expiresIn = data.expires_in;
      const value = "abc";
      // Send a message to the background script requesting to save data to storage
      chrome.runtime.sendMessage(
        { action: "saveData", key: "keyName", value: "valueToSave" },
        function (response) {
          console.log("Value is set to " + response);
        }
      );

      // Send a message to the background script requesting to retrieve data from storage
      chrome.runtime.sendMessage(
        { action: "getData", key: "keyName" },
        function (response) {
          console.log("Value currently is " + response);
        }
      );

      window.localStorage.setItem("refreshToken", refreshToken);
      window.localStorage.setItem("expiresAt", Date.now() + expiresIn * 1000);
      return accessToken;
    });
}

// Use the access token to make requests to the Spotify Web API
function getUserProfile() {
  const accessToken = getAccessTokenOrAuthorize();
  fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("User profile:", data);
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
    });
}

function generateState() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(16);
}
// const myButton = document.querySelector('#spotify-try');

// function handleClick() {
//   console.log('Button clicked');
// }

// myButton.addEventListener('click', handleClick);
