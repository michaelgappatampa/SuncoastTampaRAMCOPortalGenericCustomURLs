(function () {
    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    var MOBILE_BREAKPOINT = 767;

    var aspNetLoadRegistered = false;
    var globalNavigationEventsRegistered = false;


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
            typeof Sys.Application.add_load === "function"
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
        var expectedTag;
        var index;

        if (!parent) {
            return null;
        }

        children = parent.children;
        expectedTag = tagName.toUpperCase();

        for (
            index = 0;
            index < children.length;
            index += 1
        ) {
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

        for (
            index = 0;
            index < children.length;
            index += 1
        ) {
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

        if (isMobileNavigation()) {
            menu.setAttribute(
                "aria-hidden",
                "true"
            );
        } else {
            menu.setAttribute(
                "aria-hidden",
                "false"
            );
        }

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

        if (toggle) {
            if (mobile) {
                toggle.style.removeProperty(
                    "display"
                );

                toggle.removeAttribute(
                    "aria-hidden"
                );
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
             * Prevent the browser-default button from
             * appearing briefly on desktop.
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
         * Bind events only once to each rendered navigation.
         * If ASP.NET replaces the navigation, the replacement
         * element can be initialized separately.
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

                    /*
                     * Main mobile navigation toggle.
                     */
                    if (
                        currentToggle &&
                        (
                            target === currentToggle ||
                            currentToggle.contains(
                                target
                            )
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
                     * Find the selected anchor without using
                     * Element.closest() for compatibility with
                     * older portal browsers.
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
                     * Do not intercept links inside a submenu.
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
                     * Placeholder links remain toggle-only.
                     * Parent links with real URLs can be
                     * followed on the second tap.
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
                    var currentToggle;

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

                    currentToggle =
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
        var target;

        /*
         * Preserve the existing environment exclusion.
         */
        if (
            window.location.hostname ===
            "greatertampaisv.ramcoams.org"
        ) {
            return;
        }

        /*
         * Prevent duplicate SnapEngage scripts during
         * ASP.NET partial-page updates.
         */
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

        target =
            document.head ||
            document.body ||
            document.documentElement;

        target.appendChild(
            snapEngageScript
        );
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initializePortal() {
        initializePortalNavigation();
        registerGlobalNavigationEvents();
    }

    function handleAspNetLoad() {
        initializePortalNavigation();
    }

    onDocumentReady(function () {
        initializePortal();
        loadSnapEngage();

        /*
         * Register navigation initialization for RAMCO
         * ASP.NET partial-page updates.
         */
        registerAspNetLoad(
            handleAspNetLoad
        );
    });

    /*
     * Register immediately when ASP.NET AJAX is already
     * available.
     */
    registerAspNetLoad(
        handleAspNetLoad
    );
})();
