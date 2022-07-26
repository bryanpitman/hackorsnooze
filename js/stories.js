"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  // PSEUDOCODE:
  //
  // let favorites = currentUser.favorites.map(story => story.storyId);
  // for (let storyId of favorites) {
  //   let favorite = $("li").filter(function(){
  //     return $(this).attr('id') === storyId
  //  });
  //   $favoritesList.children("li").children("span").children("i").toggleClass("bi-heart bi-heartbreak");

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="heart">
          <i class="bi bi-heartbreak">
          </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }




  $allStoriesList.show();
}

/** Handles the submit story form. Grabs the author, title, and url and
 * calls the .addStory method on the storyList
 */
async function handleSubmitStory(evt) {
  console.log("handleSubmitStory", currentUser, storyList, evt);
  evt.preventDefault();

  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  const story = await storyList.addStory(currentUser, { author, title, url });
  const $story = generateStoryMarkup(story);
  $allStoriesList.append($story);

  $submitForm.trigger("reset");
}

$submitForm.on("submit", handleSubmitStory);

/** Handles clicking the favorite icons */
async function handleFavoriteClick(evt) {
  console.log(evt);
  const storyId = $(evt.target).closest("li").attr('id');
  // create external/new variable that pulls stories from API not from storyList
  const story = storyList.stories.find(story => story.storyId === storyId);
  console.log(currentUser.favorites.includes(story));

  //compare by id's instead use a different function
  //to compare? filter method. return an array of objects that match
  //our condition. if filter finds story id, and length is greater than zero
  // then remove //change icon, refresh UI on favorites

  const filterFav = currentUser.favorites.filter(story => story.storyId === storyId);
  if (filterFav.length > 0) {
    await currentUser.removeFavorite(story);
  } else {
    await currentUser.addFavorite(story);
  }

  toggleIcon(evt);
}

$allStoriesList.on("click", ".bi", handleFavoriteClick);
$favoritesList.on("click", ".bi", handleFavoriteClick);

/** will display current user favorites in the ordered list
 *  */
function loadFavoritesForUser() {
  $favoritesList.empty();
  console.log("loadFavoritesForUser");
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoritesList.append($story);

  }
  $favoritesList.children("li").children("span").children("i").toggleClass("bi-heart bi-heartbreak");
  //append favorites from currentUser.favorites
}

/**toggles the icon in favorites menu */
function toggleIcon(evt) {

  $(evt.target).toggleClass("bi-heart bi-heartbreak");

}



