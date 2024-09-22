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

function generateStoryMarkup(story, showDeleteButton) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let showStar;
  if (currentUser){
    showStar = true;
  }
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

function starHTML(story, user){
  let isFavourite = user.isFavorite(story)
  let star = ''
  if (isFavourite) {
    star = "fas"
  } else {
    star = "far"
  };
  return ` <span class="star">
  <i class="${star} fa-star"></i>
  </span>`;
}

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

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  // hide the form and reset it
  $submitForm.slideUp("slow");
  console.log($submitForm[0])
  $submitForm[0].reset();
}

$submitForm.on("submit", submitNewStory);

async function deleteStoryFromPage(e) {

  const $closestLi = $(e.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStoryFromPage);

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

function displayFavoriteList() {

  $favoritedStories.empty();

  if (currentUser.favorites.length != 0) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  } else {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  }
  $favoritedStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $t = $(evt.target);
  const $closestLi = $t.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(story => story.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($t.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $t.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $t.closest("i").toggleClass("fas far");
  }
}

$combinedStoryLists.on("click", ".star", toggleStoryFavorite);

function putUserStoriesOnPage(e) {
  // console.debug("putUserStoriesOnPage",e);

  $ownStories.empty();

  if (currentUser.ownStories.length != 0) {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  } else {
    $ownStories.append("<b><h3> No stories added by user yet!</h3></b>");
  }
  $ownStories.show();
}


