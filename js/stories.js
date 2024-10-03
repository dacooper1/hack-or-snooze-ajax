"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  // calls function to get list of stories from database
  storyList = await StoryList.getStories();
  // once the value is returned, remove the "stories loading" message 
  $storiesLoadingMsg.remove();
  // calls function that will loop through stories, generate HTML and put them on the homepage
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteButton) {
  const hostName = story.getHostName();
  // will display star (representing favourites) if user is logged in
  let showStar;
  if (currentUser){
    showStar = true;
  } else {
    showStar = false;
  }
  // html markup for newly submitted story 
  return $(`
      <li id="${story.storyId}">
      ${showDeleteButton ? DeleteBtnHTML() : ""}
      ${showStar ? starHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// renders HTML for star (favourites) icon
function starHTML(story, user){
  let isFavourite = user.isFavorite(story)
  // if story is favourited by user, star will be solid else star will be outlined
  let star = isFavourite ? "fas" : "far";
  return ` <span class="star">
  <i class="${star} fa-star"></i>
  </span>`;
}

// renders HTML for trashcan (delete button)
function DeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

async function submitNewStory(e) {
  e.preventDefault();

  // grab all info from form
  const title = $("#create-title").val();
  const author = $("#create-author").val();
  const url = $("#create-url").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };

  // add new story inistance to database 
  const story = await storyList.addStory(currentUser, storyData);

  // calls function to generate story markup with values provided by user
  const $story = generateStoryMarkup(story);

  // add new story to the top of the homepage list 
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm[0].reset();
}

// event listener on submit form
$submitForm.on("submit", submitNewStory);

async function deleteStoryFromPage(e) {
  // deletes story associated with trashcan icon by selecting the closest li
  const $closestLi = $(e.target).closest("li");

  const storyId = $closestLi.attr("id");

  //removes deleted story from database 
  await storyList.removeStory(currentUser, storyId);

  // re-generates user story list
  await putUserStoriesOnPage();

  // re-generates homepage story list 
  updateStoriesOnPage();
}

// event listener to trash can icon, when clicked, will call deleteStoryFromPage to delete the story
$ownStories.on("click", ".trash-can", deleteStoryFromPage);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function updateStoriesOnPage() {
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

function putStoriesOnPage() {
  // clears all stories under $allStoriesList ol
  updateStoriesOnPage();

  // generates updated story list 
  $allStoriesList.show();

}

function updateFavoriteList() {
  $favoritedStories.empty();

  // checks ig currentUser has favourites
  if (currentUser.favorites.length != 0) {
    // loops through current user's favourite stories, calls function to generate HTML and appends story to $favoritedStories ol
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
    // if currrent user does not have any favourites, display the following message
  } else {
    $favoritedStories.append("<b><h5>No favorites added!</h5></b>");
  }
}

// HTML markup for favourited stories 
function displayFavoriteList() {
  // clears all stories under $favoritedStories ol
  updateFavoriteList();
  $favoritedStories.show();
}

// fucntion to toggle favourites (star icon) + add/remove from User's favourite list in database
async function toggleStoryFavorite(e) {
  const $t = $(e.target);
  const $closestLi = $t.closest("li");
  const storyId = $closestLi.attr("id");

  // loops though stories in database and select the story that has the same ID as the $closestLi to the target(star icon)
  const story = storyList.stories.find(story => story.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($t.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star to outtline
    await currentUser.removeFavorite(story);
    $t.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: add to user's fav lisr and change star to solid
    await currentUser.addFavorite(story);
    $t.closest("i").toggleClass("fas far");
  }
}

// event listener for the star icon on all stories li (homepage stories, favourites stories and user's stories), calls toggle fuction to favourite/unfavourite stories
$combinedStoryLists.on("click", ".star", toggleStoryFavorite);

/** Gets list of current user's stories from server, generates their HTML, and puts on page. */
function putUserStoriesOnPage(e) {
  // clears all stories under $ownStories ol
  $ownStories.empty();
  
  // checks to see if currentUser has stories
  if (currentUser.ownStories.length != 0) {
    // loops through current user's story and genertes HTML with star icon (since user is logged in)
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      // appends user story as li under ownStories' ol
      $ownStories.append($story);
    }
  // if the current user does not have any stories, display the following message
  } else {
    $ownStories.append("<b><h5> No stories added by user yet!</h5></b>");
  }
  $ownStories.show();
}


