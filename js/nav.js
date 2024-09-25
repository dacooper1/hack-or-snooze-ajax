"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

// event listener for when user clicks on "Hack or Snooze logo"
$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

// event listener when user clicks on the "login" button
$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  // shows submit, favourite and my stories tab when user is logged in 
  $(".main-nav-links").show();
  // hides login button and shows logout button when user is logged in 
  $navLogin.hide();
  $navLogOut.show();
  // displays current user's username 
  $navUserProfile.text(`${currentUser.username}`).show();
  
}

/** function that displays story form and list of all stories  */
function submitStoryClick() {
  hidePageComponents();
  $submitForm.show();
  $allStoriesList.show();
}

// event listener for "submit button", calls submitStoryClick function
$navSubmit.on("click", submitStoryClick)

/** function that calles displayFavoriteList function, to put current user's favourites stories on the page  */
function navFavoritesClick() {
  hidePageComponents();
  displayFavoriteList();
}

// event listener for "favourites button", calls navFavoritesClick function
$body.on("click", "#nav-favorites", navFavoritesClick);

/** function that calles putUserStoriesOnPage function, to put current user's stories on the page  */
function navMyStoriesClick() {
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

// event listener for "my stories button", calls navMyStoriesClick function
$body.on("click", "#nav-my-stories", navMyStoriesClick)


