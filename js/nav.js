"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}


//navsubmit story function will be needed to add stories to the page?
//nav fav stories
//nav my stories

//when thelogged in user clicks the submit nav button will display story dropdown
function navStoryClick(evt) {
  console.debug("navStoryClick", evt);
  evt.preventDefault();
  $submitForm.slideToggle();

}

// $nav.on("click", $navSubmitStory, navStoryClick);
$navSubmitStory.on("click", navStoryClick);

