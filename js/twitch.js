$(document).ready(function() {

  const NO_USER_ICON_URL= "imgs/twitchDefaultIcon.png";

  /* List of users to query. */
  const USERNAMES = ["freecodecamp", "yoda", "magic", "channelfireball", "liveatthebike", "karltowns32", "celinalin", "nanonoko","wsopreplaystream","jonathanlittle", "esl_sc2", "ogamingsc2", "habathcx", "terakilobyte", "thomasballinger", "comster404", "brunofin" ];
  //const USERNAMES = ["brunofin", "comster404"];

  const CLIENT_ID = "skji05ppnsavrfz5ydkkttvbbzj2h29";
  const TWITCH_URL = "https://www.twitch.tv";
  let featuredUsernames = [];

  /* Creates click function for filtering out streams. */
  const createFilterActions = () => {
    $("#filter-none").click(function() {
      console.log("Click no filter");
      $(".channel-featured").removeClass("hidden");
      $(".channel-online").removeClass("hidden");
      $(".channel-offline").removeClass("hidden");
      $(".channel-closed").removeClass("hidden");
    });
    $("#filter-offline").click(function() {
      console.log("Click offline filter");
      $(".channel-online").addClass("hidden");
      $(".channel-featured").addClass("hidden");
      $(".channel-offline").removeClass("hidden");
      $(".channel-closed").removeClass("hidden");
    });
    $("#filter-online").click(function() {
      console.log("Click online filter");
      $(".channel-offline").addClass("hidden");
      $(".channel-closed").addClass("hidden");
      $(".channel-online").removeClass("hidden");
      $(".channel-featured").removeClass("hidden");
    });
  }


  /* Creates the image tag for the user. If they do not have an image a default will be used in place.*/
  const createUserImage = (src) => {
    let imageTag = $('<img>');
    imageTag.addClass('userIcon');

    if (src != null) {
      imageTag.attr('src', src);
    } else {
      imageTag.attr('src', NO_USER_ICON_URL);
    }
    return imageTag;
  }


  /* Creates the image tag for showing the preview of the stream. Only used when a stream is live, there are no previews on offline streams. */
  const createPreviewImage = (streamerName, src) => {
    let link = $('<a>');
    link.attr('href', `${TWITCH_URL}/${streamerName}`);
    link.attr('target', '_blank');
    let imageTag = $('<img>');
    imageTag.attr('src', src);
    link.html(imageTag);
    return link;
  }


  /* Creates the link for the streamer to go to their Twitch page. Will also display if its a featured stream or not.*/
  const createLink = (streamerName, isFeatured) => {
    let link = $('<a>');
    link.attr('href', `${TWITCH_URL}/${streamerName}`);
    link.attr('target', '_blank');
    if (isFeatured) {
      link.html("<strong>Featured:</strong> " + streamerName);
    } else {
      link.html(streamerName);
    }
    return link;
  }


/*document.onmousemove = function(e){
var x = e.pageX;
var y = e.pageY;
console.log("X is "+x+" and Y is "+y);
};*/

  /* Pulls information about a featured streamer. */
  const getFeaturedInfo = (name) => {
    $.getJSON(`https://api.twitch.tv/kraken/users/${name}?client_id=${CLIENT_ID}`, (userData) => {
      if (userData.bio != null && userData.bio != '') {
        console.log("Username: " + userData.name);
        featuredUsernames.push(userData.name);
        let span = $("<span>");
        span.attr('tooltip', userData.bio);
        span.attr("tooltip-position", "top");
        let img = $('<img>');
        img.attr('src', 'imgs/info.png');
        img.appendTo(span);
        span.appendTo($('#featured-stream'+name));
      }
    });
  }

  /* Makes an API call to get the top 5 featured streams on Twitch and render them on the page.
    TODO: can't limit the rate with the client_id, investigate
    https://api.twitch.tv/kraken/streams/featured?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29?limit=5&offset=0
  */
  const getFeaturedStreams = () => {
    $.getJSON(`https://api.twitch.tv/kraken/streams/featured?client_id=${CLIENT_ID}`, (featuredData) => {
      let stream;
      for (let i = 0; i < 5; i++) {
        stream = featuredData.featured[i].stream;

        let channelItem = $('<li>');
        channelItem.attr('class', 'flex-item');
        let iconColumn = $('<div>');
        iconColumn.attr('class', 'streamer-icon');
        $(createUserImage(stream.channel.logo)).appendTo(iconColumn);
        $(iconColumn).appendTo(channelItem);

        let nameColumn = $('<div>');
        nameColumn.attr('class', 'streamer-name');
        $(createLink(stream.channel.display_name, true)).appendTo(nameColumn);
        nameColumn.attr('id', 'featured-stream' + stream.channel.display_name);
        $(nameColumn).appendTo(channelItem);

        let statusColumn = $('<div>');
        statusColumn.attr('class', 'stream-status');
        channelItem.addClass('channel-featured');
        statusColumn.text(stream.channel.game + ": " + stream.channel.status);
        $(statusColumn).appendTo(channelItem);
        let streamPreview = $('<div>');
        $(createPreviewImage(stream.channel.display_name, stream.preview.large)).appendTo(streamPreview);
        streamPreview.addClass('stream-preview');
        $(streamPreview).appendTo(channelItem);
        let streamPreviewInfo = $('<div>');
        streamPreviewInfo.addClass('stream-preview-info');
        streamPreviewInfo.html("Viewers: " + stream.viewers);
        $(streamPreviewInfo).appendTo(channelItem);

        $(channelItem).appendTo("#channels");
        getFeaturedInfo(stream.channel.display_name);


      }
      //USERNAMES.map((user) => getUserInfo(user)); // So API call isn't made until featured streams finishes. This is done to prevent a duplicate channel from showing up (i.e. if one of the predefined channels ends up being featured at the time.)
      USERNAMES.map((user) => getUserInfo2(user)); // So API call isn't made until featured streams finishes. This is done to prevent a duplicate channel from showing up (i.e. if one of the predefined channels ends up being featured at the time.)
    });
  }


  const renderStreamData = (streamData, userData, channelItem) => {
    console.log("Stream data:");
    console.log(streamData);
    let statusColumn = $('<div>');
        statusColumn.attr('class', 'stream-status');

        if (streamData.stream === null) {
          channelItem.addClass('channel-offline');
          statusColumn.text('Offline');
          $(statusColumn).appendTo(channelItem);
        } else {
          channelItem.addClass('channel-online');
          statusColumn.text(streamData.stream.channel.game + ": " + streamData.stream.channel.status);
          $(statusColumn).appendTo(channelItem);
          let streamPreview = $('<div>');
          $(createPreviewImage(userData.name, streamData.stream.preview.large)).appendTo(streamPreview);
          streamPreview.addClass('stream-preview');
          $(streamPreview).appendTo(channelItem);
          let streamPreviewInfo = $('<div>');
          streamPreviewInfo.addClass('stream-preview-info');
          streamPreviewInfo.html("Viewers: " + streamData.stream.viewers);
          $(streamPreviewInfo).appendTo(channelItem);
        }

        $(channelItem).appendTo("#channels");

  }

  const renderUserData = (userName, userData) => {


      if (featuredUsernames.includes(userName)) {
        console.log("User already in featured users.");
        return;
      }

      let channelItem = $('<li>');
      channelItem.attr('class', 'flex-item');

      let iconColumn = $('<div>');
      iconColumn.attr('class', 'streamer-icon');
      $(createUserImage(userData.logo)).appendTo(iconColumn);
      $(iconColumn).appendTo(channelItem);

      let nameColumn = $('<div>');
      nameColumn.attr('class', 'streamer-name');
      //$(createLink(userData.display_name, false)).appendTo(nameColumn);
      $(createLink(userName, false)).appendTo(nameColumn);

      if (userData.bio && userData.bio !== '') {
        let span = $("<span>");
        span.attr('tooltip', userData.bio);
        span.attr("tooltip-position", "top");
        let img = $('<img>');
        img.attr('src', 'imgs/info.png');
        img.appendTo(span);
        span.appendTo(nameColumn);
      }

      $(nameColumn).appendTo(channelItem);

      if (userData.hasOwnProperty("status") && userData.status == 422) {
         console.log("Found an error: " + userData.error); 
          let statusColumn = $('<div>'); //repeated code in renderStreamData, should refactor
          statusColumn.attr('class', 'stream-status');

          channelItem.addClass('channel-closed');
          statusColumn.text('Account closed');
          $(statusColumn).appendTo(channelItem);
          $(channelItem).appendTo("#channels");
          return;
      }

    $.ajax({
      type: "GET",
      url: 'https://api.twitch.tv/kraken/streams/'+userData.name,
      headers: {
        'CLIENT-ID': 'skji05ppnsavrfz5ydkkttvbbzj2h29'
      },
      success: function(data, textStatus, jqXHR ){
         console.log("Success getting stream");
         console.log(data);
         console.log("Status: " + textStatus);
         console.log("jqXHR: " + jqXHR);
         renderStreamData(data, userData, channelItem);
      
      },
      error: function(jqXHR, textStatus, errorThrown ) {
         console.log("ErrorThrown getting stream:");
         console.log(errorThrown);
         console.log("Status: " + textStatus);
         console.log(jqXHR);
         console.log(jqXHR.responseJSON);
         console.log(jqXHR.responseJSON.status);
      }
    });

  }


  const getUserInfo2 = (user) => {
    console.log("Getting user info for " + user);
    let x = 'https://api.twitch.tv/kraken/users/' + user + '?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29';
    console.log(x);
    //{"error":"Not Found","status":404,"message":"User \"brunofin\" was not found"}
    $.ajax({
      type: "GET",
      url: 'https://api.twitch.tv/kraken/users/'+user,
      headers: {
        'CLIENT-ID': 'skji05ppnsavrfz5ydkkttvbbzj2h29'
      },
      success: function(data, textStatus, jqXHR ){
         console.log("Success");
         console.log(data);
         console.log("Status: " + textStatus);
         console.log("jqXHR: " + jqXHR);
         renderUserData(user, data);



      },
      error: function(jqXHR, textStatus, errorThrown ) {
         console.log("ErrorThrown:");
         console.log(errorThrown);
         console.log("Status: " + textStatus);
         console.log(jqXHR);
         console.log(jqXHR.responseJSON);
         console.log(jqXHR.responseJSON.status);
         //if (jqXHR.responseJSON.status == 422)
         renderUserData(user, jqXHR.responseJSON);
      }
    });

  }

  /* Makes an API call to get information on a specific Twitch user and renders it on the page. */
  const getUserInfo = (user) => {

    $.getJSON('https://api.twitch.tv/kraken/users/' + user + '?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29', function (userData) {
    //$.getJSON(`https://api.twitch.tv/kraken/streams/${user}?client_id=${CLIENT_ID}`, (userData) => {
      if (userData.status == 404) {
        console.log("404 " + userData.error + ": " + userData.message);
        return;
      }

      if (featuredUsernames.includes(userData.name)) {
        console.log("User already in featured users.");
        return;
      }

      let channelItem = $('<li>');
      channelItem.attr('class', 'flex-item');

      let iconColumn = $('<div>');
      iconColumn.attr('class', 'streamer-icon');
      $(createUserImage(userData.logo)).appendTo(iconColumn);
      $(iconColumn).appendTo(channelItem);

      let nameColumn = $('<div>');
      nameColumn.attr('class', 'streamer-name');
      $(createLink(userData.display_name, false)).appendTo(nameColumn);

      if (userData.bio && userData.bio !== '') {
        let span = $("<span>");
        span.attr('tooltip', userData.bio);
        span.attr("tooltip-position", "top");
        let img = $('<img>');
        img.attr('src', 'imgs/info.png');
        img.appendTo(span);
        span.appendTo(nameColumn);
      }

      $(nameColumn).appendTo(channelItem);

      $.getJSON(`https://api.twitch.tv/kraken/streams/${userData.name}?client_id=${CLIENT_ID}`, (streamData) => {
console.log("Streamdata:");
console.log(streamData);
        let statusColumn = $('<div>');
        statusColumn.attr('class', 'stream-status');

        if (streamData.status === 422) {
          channelItem.addClass('channel-closed');
          statusColumn.text('Account closed');
          $(statusColumn).appendTo(channelItem);
        }
        else if (streamData.stream === null) {
          channelItem.addClass('channel-offline');
          statusColumn.text('Offline');
          $(statusColumn).appendTo(channelItem);
        } else {
          channelItem.addClass('channel-online');
          statusColumn.text(streamData.stream.channel.game + ": " + streamData.stream.channel.status);
          $(statusColumn).appendTo(channelItem);
          let streamPreview = $('<div>');
          $(createPreviewImage(userData.name, streamData.stream.preview.large)).appendTo(streamPreview);
          streamPreview.addClass('stream-preview');
          $(streamPreview).appendTo(channelItem);
          let streamPreviewInfo = $('<div>');
          streamPreviewInfo.addClass('stream-preview-info');
          streamPreviewInfo.html("Viewers: " + streamData.stream.viewers);
          $(streamPreviewInfo).appendTo(channelItem);
        }

        $(channelItem).appendTo("#channels");
      });
    });
  }

  createFilterActions();
  getFeaturedStreams();

});
