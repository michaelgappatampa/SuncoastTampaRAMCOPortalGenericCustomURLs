(function () {
    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    var REPOSITORY_NAME =
        "michaelgappatampa/" +
        "SuncoastTampaRAMCOPortalGenericCustomURLs";

    var CDN_ROOT =
        "https://cdn.jsdelivr.net/gh/" +
        REPOSITORY_NAME +
        "@";

    var STYLESHEET_ID = "star-portal-central-styles";
    var MOBILE_BREAKPOINT = 767;

    var aspNetLoadRegistered = false;
    var globalNavigationEventsRegistered = false;


    /* =====================================================
       STYLESHEET LOADER
       ===================================================== */

    function getLoadedScriptVersion() {
        var scripts = document.getElementsByTagName("script");
        var scriptElement = document.currentScript;

        var repositoryPattern =
            /SuncoastTampaRAMCOPortalGenericCustomURLs@([^/]+)\/script\.js(?:[?#].*)?$/i;

        var index;
        var match;

        if (!scriptElement || !scriptElement.src) {
            for (index = scripts.length - 1; index >= 0; index -= 1) {
                if (
                    repositoryPattern.test(
                        scripts[index].src || ""
                    )
                ) {
                    scriptElement = scripts[index];
                    break;
                }
            }
        }

        if (scriptElement && scriptElement.src) {
            match = scriptElement.src.match(repositoryPattern);

            if (match && match[1]) {
                return match[1];
            }
        }

        return "main";
    }

    var STYLESHEET_VERSION = getLoadedScriptVersion();

    var STYLESHEET_URL =
        CDN_ROOT +
        STYLESHEET_VERSION +
        "/styles.css";

    function ensurePortalStyles() {
        var stylesheet;

        if (!document.head) {
            return;
        }

        stylesheet = document.getElementById(
            STYLESHEET_ID
        );

        if (!stylesheet) {
            stylesheet = document.querySelector(
                'link[rel~="stylesheet"]' +
                '[href*="SuncoastTampaRAMCOPortalGenericCustomURLs"]' +
                '[href*="styles.css"]'
            );
        }

        if (!stylesheet) {
            stylesheet = document.createElement("link");
            stylesheet.id = STYLESHEET_ID;
            stylesheet.rel = "stylesheet";
            stylesheet.media = "all";

            document.head.appendChild(stylesheet);
        } else if (!stylesheet.id) {
            stylesheet.id = STYLESHEET_ID;
        }

        if (
            stylesheet.getAttribute("href") !==
            STYLESHEET_URL
        ) {
            stylesheet.setAttribute(
                "href",
                STYLESHEET_URL
            );
        }
    }


    /* =====================================================
       DOCUMENT AND ASP.NET LOAD HELPERS
       ===================================================== */

    function onDocumentReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                callback,
                { once: true }
            );
        } else {
            callback();
        }
    }

    function registerAspNetLoad(callback) {
        if (aspNetLoadRegistered) {
            return;
        }

        if (
            window.Sys &&
            Sys.Application &&
            typeof Sys.Application.add_load ===
                "function"
        ) {
            Sys.Application.add_load(callback);
            aspNetLoadRegistered = true;
        }
    }


    /* =====================================================
       ELEMENT HELPERS
       ===================================================== */

    function getDirectChildByTag(parent, tagName) {
        var children;
        var index;
        var expectedTag;

        if (!parent) {
            return null;
        }

        children = parent.children;
        expectedTag = tagName.toUpperCase();

        for (index = 0; index < children.length; index += 1) {
            if (
                children[index].tagName ===
                expectedTag
            ) {
                return children[index];
            }
        }

        return null;
    }

    function getTopLevelItems(menu) {
        var items = [];
        var children;
        var index;

        if (!menu) {
            return items;
        }

        children = menu.children;

        for (index = 0; index < children.length; index += 1) {
            if (children[index].tagName === "LI") {
                items.push(children[index]);
            }
        }

        return items;
    }

    function getSubmenuItems(menu) {
        return getTopLevelItems(menu).filter(
            function (item) {
                return Boolean(
                    getDirectChildByTag(item, "ul")
                );
            }
        );
    }

    function isMobileNavigation() {
        if (window.matchMedia) {
            return window.matchMedia(
                "(max-width: " +
                    MOBILE_BREAKPOINT +
                    "px)"
            ).matches;
        }

        return (
            document.documentElement.clientWidth <=
            MOBILE_BREAKPOINT
        );
    }

    function isPlaceholderLink(link) {
        var href;

        if (!link) {
            return true;
        }

        href = (
            link.getAttribute("href") || ""
        ).trim();

        return (
            !href ||
            href === "#" ||
            /^javascript:/i.test(href)
        );
    }


    /* =====================================================
       NAVIGATION STATE
       ===================================================== */

    function closePortalSubmenus(menu, exceptItem) {
        var submenuItems = getSubmenuItems(menu);

        submenuItems.forEach(function (item) {
            var link;

            if (item === exceptItem) {
                return;
            }

            item.classList.remove("submenu-open");

            link = getDirectChildByTag(item, "a");

            if (link) {
                link.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        });
    }

    function closePortalNavigation() {
        var navigation =
            document.getElementById("navigation");

        var menu =
            document.getElementById("TabMenu");

        var toggle;

        if (!navigation || !menu) {
            return;
        }

        toggle = navigation.querySelector(
            ".portal-menu-toggle"
        );

        navigation.classList.remove(
            "mobile-menu-open"
        );

        closePortalSubmenus(menu);

        menu.setAttribute("aria-hidden", "true");

        if (toggle) {
            toggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }

    function synchronizeNavigationState() {
        var navigation =
            document.getElementById("navigation");

        var menu =
            document.getElementById("TabMenu");

        var toggle;
        var mobile;
        var menuIsOpen;

        if (!navigation || !menu) {
            return;
        }

        toggle = navigation.querySelector(
            ".portal-menu-toggle"
        );

        mobile = isMobileNavigation();

        /*
         * This inline fallback prevents the plain browser
         * button from appearing on tablet or desktop even
         * when the CSS default hide rule is missing.
         */
        if (toggle) {
            if (mobile) {
                toggle.style.removeProperty("display");
                toggle.removeAttribute("aria-hidden");
            } else {
                toggle.style.setProperty(
                    "display",
                    "none"
                );

                toggle.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }
        }

        if (!mobile) {
            navigation.classList.remove(
                "mobile-menu-open"
            );

            closePortalSubmenus(menu);

            menu.setAttribute(
                "aria-hidden",
                "false"
            );

            if (toggle) {
                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

            return;
        }

        menuIsOpen =
            navigation.classList.contains(
                "mobile-menu-open"
            );

        menu.setAttribute(
            "aria-hidden",
            menuIsOpen ? "false" : "true"
        );

        if (toggle) {
            toggle.setAttribute(
                "aria-expanded",
                String(menuIsOpen)
            );
        }
    }


    /* =====================================================
       NAVIGATION INITIALIZATION
       ===================================================== */

    function initializePortalNavigation() {
        var navigation =
            document.getElementById("navigation");

        var menu =
            document.getElementById("TabMenu");

        var toggle;
        var submenuItems;

        if (!navigation || !menu) {
            return;
        }

        toggle = navigation.querySelector(
            ".portal-menu-toggle"
        );

        if (!toggle) {
            toggle = document.createElement(
                "button"
            );

            toggle.type = "button";
            toggle.className =
                "portal-menu-toggle";

            toggle.textContent =
                "Portal Navigation";

            toggle.setAttribute(
                "aria-controls",
                "TabMenu"
            );

            toggle.setAttribute(
                "aria-expanded",
                "false"
            );

            /*
             * Hide the new control until responsive state
             * is calculated. This prevents a desktop flash
             * of the browser's default button styling.
             */
            toggle.style.display = "none";

            navigation.insertBefore(
                toggle,
                menu
            );
        }

        submenuItems = getSubmenuItems(menu);

        submenuItems.forEach(
            function (item, index) {
                var link =
                    getDirectChildByTag(
                        item,
                        "a"
                    );

                var submenu =
                    getDirectChildByTag(
                        item,
                        "ul"
                    );

                var submenuId;

                if (!link || !submenu) {
                    return;
                }

                item.classList.add(
                    "has-portal-submenu"
                );

                submenuId = item.id
                    ? item.id + "-submenu"
                    : "portal-submenu-" +
                      String(index + 1);

                submenu.id = submenuId;

                link.setAttribute(
                    "aria-controls",
                    submenuId
                );

                link.setAttribute(
                    "aria-haspopup",
                    "true"
                );

                link.setAttribute(
                    "aria-expanded",
                    item.classList.contains(
                        "submenu-open"
                    )
                        ? "true"
                        : "false"
                );
            }
        );

        /*
         * Bind navigation events only once per rendered
         * navigation element. If ASP.NET replaces the nav,
         * the new element will initialize normally.
         */
        if (
            navigation.getAttribute(
                "data-star-navigation-bound"
            ) !== "true"
        ) {
            navigation.setAttribute(
                "data-star-navigation-bound",
                "true"
            );

            navigation.addEventListener(
                "click",
                function (event) {
                    var currentNavigation =
                        event.currentTarget;

                    var currentMenu =
                        document.getElementById(
                            "TabMenu"
                        );

                    var currentToggle =
                        currentNavigation.querySelector(
                            ".portal-menu-toggle"
                        );

                    var target = event.target;
                    var link;
                    var item;
                    var submenu;
                    var isOpen;
                    var menuIsOpen;

                    if (!currentMenu) {
                        return;
                    }

                    if (
                        currentToggle &&
                        (
                            target === currentToggle ||
                            currentToggle.contains(target)
                        )
                    ) {
                        event.preventDefault();

                        menuIsOpen =
                            currentNavigation.classList.toggle(
                                "mobile-menu-open"
                            );

                        currentToggle.setAttribute(
                            "aria-expanded",
                            String(menuIsOpen)
                        );

                        currentMenu.setAttribute(
                            "aria-hidden",
                            menuIsOpen
                                ? "false"
                                : "true"
                        );

                        if (!menuIsOpen) {
                            closePortalSubmenus(
                                currentMenu
                            );
                        }

                        return;
                    }

                    /*
                     * Find the clicked anchor without using
                     * Element.closest(), for compatibility
                     * with older portal browsers.
                     */
                    while (
                        target &&
                        target !== currentNavigation &&
                        target.tagName !== "A"
                    ) {
                        target = target.parentNode;
                    }

                    if (
                        !target ||
                        target === currentNavigation ||
                        target.tagName !== "A"
                    ) {
                        return;
                    }

                    link = target;
                    item = link.parentNode;

                    /*
                     * Only intercept direct top-level links.
                     * Links inside an opened submenu continue
                     * to work normally.
                     */
                    if (
                        !item ||
                        item.parentNode !== currentMenu
                    ) {
                        return;
                    }

                    submenu =
                        getDirectChildByTag(
                            item,
                            "ul"
                        );

                    if (
                        !submenu ||
                        !isMobileNavigation()
                    ) {
                        return;
                    }

                    isOpen =
                        item.classList.contains(
                            "submenu-open"
                        );

                    /*
                     * First tap opens the submenu.
                     *
                     * Events and Classes uses href="#", so
                     * it remains a toggle-only parent.
                     *
                     * Committees has a real URL. Its first
                     * tap opens the submenu; a second tap
                     * follows the parent URL.
                     */
                    if (
                        !isOpen ||
                        isPlaceholderLink(link)
                    ) {
                        event.preventDefault();
                    }

                    closePortalSubmenus(
                        currentMenu,
                        item
                    );

                    if (!isOpen) {
                        item.classList.add(
                            "submenu-open"
                        );

                        link.setAttribute(
                            "aria-expanded",
                            "true"
                        );
                    } else if (
                        isPlaceholderLink(link)
                    ) {
                        item.classList.remove(
                            "submenu-open"
                        );

                        link.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            );

            navigation.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key !== "Escape" &&
                        event.keyCode !== 27
                    ) {
                        return;
                    }

                    if (!isMobileNavigation()) {
                        return;
                    }

                    event.preventDefault();

                    closePortalNavigation();

                    var currentToggle =
                        navigation.querySelector(
                            ".portal-menu-toggle"
                        );

                    if (currentToggle) {
                        currentToggle.focus();
                    }
                }
            );
        }

        synchronizeNavigationState();
    }


    /* =====================================================
       GLOBAL NAVIGATION EVENTS
       ===================================================== */

    function registerGlobalNavigationEvents() {
        if (globalNavigationEventsRegistered) {
            return;
        }

        globalNavigationEventsRegistered = true;

        window.addEventListener(
            "resize",
            synchronizeNavigationState
        );

        document.addEventListener(
            "click",
            function (event) {
                var navigation =
                    document.getElementById(
                        "navigation"
                    );

                if (
                    !navigation ||
                    !isMobileNavigation() ||
                    navigation.contains(event.target)
                ) {
                    return;
                }

                closePortalNavigation();
            }
        );
    }


    /* =====================================================
       SNAPENGAGE
       ===================================================== */

    function loadSnapEngage() {
        var snapEngageScript;

        /*
         * Preserve the existing environment exclusion.
         */
        if (
            window.location.hostname ===
            "greatertampaisv.ramcoams.org"
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

        snapEngageScript =
            document.createElement("script");

        snapEngageScript.type =
            "text/javascript";

        snapEngageScript.async = true;

        snapEngageScript.setAttribute(
            "data-star-snapengage",
            "true"
        );

        snapEngageScript.src =
            "https://storage.googleapis.com/" +
            "code.snapengage.com/js/" +
            "1d363fa7-55f0-42fd-8d24-c20df812db52.js";

        (
            document.head ||
            document.body
        ).appendChild(snapEngageScript);
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initializePortal() {
        ensurePortalStyles();
        initializePortalNavigation();
        registerGlobalNavigationEvents();
    }

    function handleAspNetLoad() {
        ensurePortalStyles();
        initializePortalNavigation();
    }

    /*
     * Load the CSS as early as possible to reduce the
     * unstyled-page flash.
     */
    ensurePortalStyles();

    onDocumentReady(function () {
        initializePortal();
        loadSnapEngage();

        /*
         * Sys.Application may not exist until after the
         * initial page scripts finish loading.
         */
        registerAspNetLoad(
            handleAspNetLoad
        );
    });

    /*
     * Register immediately when ASP.NET AJAX is already
     * available at the time this file executes.
     */
    registerAspNetLoad(
        handleAspNetLoad
    );
})();
