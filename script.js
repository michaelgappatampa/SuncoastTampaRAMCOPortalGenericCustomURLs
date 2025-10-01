(function () {
  // Check if current hostname is NOT "greatertampaisv.ramcoams.org"
  if (window.location.hostname !== 'greatertampaisv.ramcoams.org') {
    document.addEventListener('DOMContentLoaded', function () {
      var se = document.createElement('script');
      se.type = 'text/javascript';
      se.async = true;
      se.src = 'https://storage.googleapis.com/code.snapengage.com/js/1d363fa7-55f0-42fd-8d24-c20df812db52.js';

      var done = false;
      se.onload = se.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          done = true;
          // ✅ Optional SnapEngage API calls after script is loaded:
          // Example: SnapEngage.allowChatSound(true);
        }
      };

      // ✅ Append script to <footer> if it exists, otherwise to <body>
      var target = document.querySelector('footer') || document.body;
      target.appendChild(se);
    });
  }
})();
