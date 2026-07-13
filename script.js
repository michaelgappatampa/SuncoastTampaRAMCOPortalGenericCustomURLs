(function () {
    'use strict';

    /*
     * Central stylesheet loader
     *
     * The stylesheet automatically uses the same branch, tag, or commit
     * as this script. For example:
     *   @main/script.js   -> @main/styles.css
     *   @v1.1.0/script.js -> @v1.1.0/styles.css
     */
    var REPOSITORY_NAME =
        'michaelgappatampa/' +
        'SuncoastTampaRAMCOPortalGenericCustomURLs';
    var CDN_ROOT =
        'https://cdn.jsdelivr.net/gh/' + REPOSITORY_NAME + '@';
    var STYLESHEET_ID = 'star-portal-central-styles';

    function getLoadedScriptVersion() {
        var scripts = document.getElementsByTagName('script');
        var scriptElement = document.currentScript;
        var repositoryPattern =
            /SuncoastTampaRAMCOPortalGenericCustomURLs@([^/]+)\/script\.js(?:[?#].*)?$/i;

        if (!scriptElement || !scriptElement.src) {
            for (var index = scripts.length - 1; index >= 0; index -= 1) {
                if (repositoryPattern.test(scripts[index].src || '')) {
                    scriptElement = scripts[index];
                    break;
                }
            }
        }

        if (scriptElement && scriptElement.src) {
            var match = scriptElement.src.match(repositoryPattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return 'main';
    }

    var STYLESHEET_VERSION = getLoadedScriptVersion();
    var STYLESHEET_URL =
        CDN_ROOT + STYLESHEET_VERSION + '/styles.css';

    function ensurePortalStyles() {
        if (!document.head) {
            return;
        }

        var stylesheet = document.getElementById(STYLESHEET_ID);

        if (!stylesheet) {
            stylesheet = document.querySelector(
                'link[rel~="stylesheet"]' +
                '[href*="SuncoastTampaRAMCOPortalGenericCustomURLs"]' +
                '[href*="styles.css"]'
            );
        }

        if (!stylesheet) {
            stylesheet = document.createElement('link');
            stylesheet.id = STYLESHEET_ID;
            stylesheet.rel = 'stylesheet';
            stylesheet.media = 'all';
            document.head.appendChild(stylesheet);
        } else if (!stylesheet.id) {
            stylesheet.id = STYLESHEET_ID;
        }

        if (stylesheet.getAttribute('href') !== STYLESHEET_URL) {
            stylesheet.setAttribute('href', STYLESHEET_URL);
        }
    }

    function onDocumentReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, {
                once: true
            });
        } else {
            callback();
        }
    }

    function registerAspNetLoad(callback) {
        if (
            window.Sys &&
            Sys.Application &&
            typeof Sys.Application.add_load === 'function'
        ) {
            Sys.Application.add_load(callback);
        }
    }

    function loadSnapEngage() {
        /* Preserve the existing environment exclusion. */
        if (
            window.location.hostname ===
            'greatertampaisv.ramcoams.org'
        ) {
            return;
        }

        if (
            document.querySelector(
                'script[data-star-snapengage="true"]'
            )
        ) {
            return;
        }

        var snapEngageScript = document.createElement('script');
        snapEngageScript.type = 'text/javascript';
        snapEngageScript.async = true;
        snapEngageScript.dataset.starSnapengage = 'true';
        snapEngageScript.src =
            'https://storage.googleapis.com/code.snapengage.com/js/' +
            '1d363fa7-55f0-42fd-8d24-c20df812db52.js';

        (document.head || document.body).appendChild(
            snapEngageScript
        );
    }

    /* Load early to reduce unstyled-page flicker. */
    ensurePortalStyles();

    onDocumentReady(function () {
        ensurePortalStyles();
        loadSnapEngage();
    });

    /* RAMCO uses ASP.NET partial-page updates. */
    registerAspNetLoad(ensurePortalStyles);
})();
