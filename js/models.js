"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses protocol out of URL and returns the only the host name. */

  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }

  static async getArbitraryStoryByID(storyId) {
    await axios.get(
      `${BASE_URL}/stories`, {storyId});

  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?
    //storyList.getStories cant call b/c we are passing in the instance to the story list
    //should return an instance of our own class?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));
    //getStories commuicates with the API with the call method getStores() to return an object with ONLY a story list
    //we dont want to make an instance just to return this story object, this uses less memory
    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */


  async addStory(user, newStory) {

    const response = await axios.post(
      `${BASE_URL}/stories`,
      { token: user.loginToken, story: newStory }
    );
    let story = new Story(response.data.story);
    storyList.stories.unshift(story);
    return story;
  }
}

// async addStory(user, newStory) {

//   const response = await axios.post(`${BASE_URL}/stories`, {
//     token: user.loginToken,
//     story: newStory});

//   return new Story(response.data.story);
// }
//}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    //favorites and ownStories is an array that takes in value? { storyId, title, author, url, username, createdAt }
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token; //might need to change token to global var TOKEN?
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */


  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  /** Accepts a Story instance and makes a POST request to the server
   * which will add the Story instance to the favorites array for the user.
   */

  /* grab the currentUser to have access to the instance property username
  grab the storyId for the Story instance. pass these into the POST url with the
  login token for the user.
  */
  async addFavorite(story) {

    let username = this.username;
    let storyId = story.storyId;

    await axios.post(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      { token: this.loginToken }
    );

    this.favorites.push(story);

  }

  /**  grabs the currentUser favorite story id and uses their token to authorize
   *  removing their favorite story
    */
  async removeFavorite(story) {

    let username = this.username;
    let storyId = story.storyId;

    await axios.delete(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      { data: { token: this.loginToken } }

    );
    //remove index where storyID is stored.
    let storyIndex = this.favorites.indexOf(story);
    this.favorites.splice(storyIndex, 1);
  }
}
