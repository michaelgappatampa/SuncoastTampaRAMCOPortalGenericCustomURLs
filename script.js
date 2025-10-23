(function () {
  // Only run if not on the specified hostname
  if (window.location.hostname !== 'greatertampaisv.ramcoams.org') {
    /*document.addEventListener('DOMContentLoaded', function () {
      // Create the div element
      var widgetDiv = document.createElement('div');
      widgetDiv.id = 'bf-revz-widget-3146340650';

      // Create the script element for Birdeye
      var script = document.createElement('script');
      script.defer = true;
      script.type = 'text/javascript';
      script.src = 'https://birdeye.com/embed/v6/126335/1/3146340650/e011d59fe64f8badee44eb0fc418975a6d3a68f83e09826a?emailRequired=1';

      // Append elements to <footer> if it exists, otherwise <body>
      var target = document.querySelector('footer') || document.body;
      target.appendChild(script);
      target.appendChild(widgetDiv);
    });*/
    // snapengage-loader.js
    document.addEventListener("DOMContentLoaded", function () {
      // Create the SnapEngage script element
      var se = document.createElement("script");
      se.type = "text/javascript";
      se.async = true;
      se.src = "https://storage.googleapis.com/code.snapengage.com/js/1d363fa7-55f0-42fd-8d24-c20df812db52.js";
    
      // Track load completion
      var done = false;
      se.onload = se.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
          done = true;
          // Place your SnapEngage JS API calls here if needed
          // Example: SnapEngage.allowChatSound(true);
        }
      };
    
      // Insert before the first existing script tag
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(se, s);
    });

  }
})();
