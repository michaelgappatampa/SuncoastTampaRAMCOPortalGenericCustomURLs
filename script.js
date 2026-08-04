(function () {
    "use strict";

    var MOBILE_BREAKPOINT = 767;
    var HOME_EVENT_LIMIT = 4;

    var aspNetLoadRegistered = false;
    var globalNavigationEventsRegistered = false;

    function onDocumentReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, {
                once: true
            });
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

    function getDirectChildByTag(parent, tagName) {
        var children;
        var expectedTag;
        var index;

        if (!parent) {
            return null;
        }

        children = parent.children;
        expectedTag = tagName.toUpperCase();

        for (index = 0; index < children.length; index += 1) {
            if (children[index].tagName === expectedTag) {
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
        return getTopLevelItems(menu).filter(function (item) {
            return Boolean(getDirectChildByTag(item, "ul"));
        });
    }

    function isMobileNavigation() {
        if (window.matchMedia) {
            return window.matchMedia(
                "(max-width: " + MOBILE_BREAKPOINT + "px)"
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

        href = (link.getAttribute("href") || "").trim();

        return (
            !href ||
            href === "#" ||
            /^javascript:/i.test(href)
        );
    }

    function closePortalSubmenus(menu, exceptItem) {
        getSubmenuItems(menu).forEach(function (item) {
            var link;

            if (item === exceptItem) {
                return;
            }

            item.classList.remove("submenu-open");
            link = getDirectChildByTag(item, "a");

            if (link) {
                link.setAttribute("aria-expanded", "false");
            }
        });
    }

    function closePortalNavigation() {
        var navigation = document.getElementById("navigation");
        var menu = document.getElementById("TabMenu");
        var toggle;

        if (!navigation || !menu) {
            return;
        }

        toggle = navigation.querySelector(".portal-menu-toggle");

        navigation.classList.remove("mobile-menu-open");
        closePortalSubmenus(menu);

        menu.setAttribute(
            "aria-hidden",
            isMobileNavigation() ? "true" : "false"
        );

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
        }
    }

    function synchronizeNavigationState() {
        var navigation = document.getElementById("navigation");
        var menu = document.getElementById("TabMenu");
        var toggle;
        var mobile;
        var menuIsOpen;

        if (!navigation || !menu) {
            return;
        }

        toggle = navigation.querySelector(".portal-menu-toggle");
        mobile = isMobileNavigation();

        if (toggle) {
            if (mobile) {
                toggle.style.removeProperty("display");
                toggle.removeAttribute("aria-hidden");
            } else {
                toggle.style.setProperty("display", "none");
                toggle.setAttribute("aria-hidden", "true");
            }
        }

        if (!mobile) {
            navigation.classList.remove("mobile-menu-open");
            closePortalSubmenus(menu);
            menu.setAttribute("aria-hidden", "false");

            if (toggle) {
                toggle.setAttribute("aria-expanded", "false");
            }

            return;
        }

        menuIsOpen = navigation.classList.contains(
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

    function initializePortalNavigation() {
        var navigation = document.getElementById("navigation");
        var menu = document.getElementById("TabMenu");
        var toggle;
        var submenuItems;

        if (!navigation || !menu) {
            return;
        }

        navigation.classList.add("star-portal-navigation");

        toggle = navigation.querySelector(".portal-menu-toggle");

        if (!toggle) {
            toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "portal-menu-toggle";
            toggle.textContent = "Portal Navigation";
            toggle.setAttribute("aria-controls", "TabMenu");
            toggle.setAttribute("aria-expanded", "false");
            toggle.style.display = "none";
            navigation.insertBefore(toggle, menu);
        }

        submenuItems = getSubmenuItems(menu);

        submenuItems.forEach(function (item, index) {
            var link = getDirectChildByTag(item, "a");
            var submenu = getDirectChildByTag(item, "ul");
            var submenuId;

            if (!link || !submenu) {
                return;
            }

            item.classList.add("has-portal-submenu");
            submenuId = item.id
                ? item.id + "-submenu"
                : "portal-submenu-" + String(index + 1);

            submenu.id = submenuId;
            link.setAttribute("aria-controls", submenuId);
            link.setAttribute("aria-haspopup", "true");
            link.setAttribute(
                "aria-expanded",
                item.classList.contains("submenu-open")
                    ? "true"
                    : "false"
            );
        });

        if (
            navigation.getAttribute("data-star-navigation-bound") !==
            "true"
        ) {
            navigation.setAttribute(
                "data-star-navigation-bound",
                "true"
            );

            navigation.addEventListener("click", function (event) {
                var currentNavigation = event.currentTarget;
                var currentMenu = document.getElementById("TabMenu");
                var currentToggle = currentNavigation.querySelector(
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
                    menuIsOpen = currentNavigation.classList.toggle(
                        "mobile-menu-open"
                    );

                    currentToggle.setAttribute(
                        "aria-expanded",
                        String(menuIsOpen)
                    );
                    currentMenu.setAttribute(
                        "aria-hidden",
                        menuIsOpen ? "false" : "true"
                    );

                    if (!menuIsOpen) {
                        closePortalSubmenus(currentMenu);
                    }

                    return;
                }

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

                if (!item || item.parentNode !== currentMenu) {
                    return;
                }

                submenu = getDirectChildByTag(item, "ul");

                if (!submenu || !isMobileNavigation()) {
                    return;
                }

                isOpen = item.classList.contains("submenu-open");

                if (!isOpen || isPlaceholderLink(link)) {
                    event.preventDefault();
                }

                closePortalSubmenus(currentMenu, item);

                if (!isOpen) {
                    item.classList.add("submenu-open");
                    link.setAttribute("aria-expanded", "true");
                } else if (isPlaceholderLink(link)) {
                    item.classList.remove("submenu-open");
                    link.setAttribute("aria-expanded", "false");
                }
            });

            navigation.addEventListener("keydown", function (event) {
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

                currentToggle = navigation.querySelector(
                    ".portal-menu-toggle"
                );

                if (currentToggle) {
                    currentToggle.focus();
                }
            });
        }

        synchronizeNavigationState();
    }

    function registerGlobalNavigationEvents() {
        if (globalNavigationEventsRegistered) {
            return;
        }

        globalNavigationEventsRegistered = true;

        window.addEventListener(
            "resize",
            synchronizeNavigationState
        );

        document.addEventListener("click", function (event) {
            var navigation = document.getElementById("navigation");

            if (
                !navigation ||
                !isMobileNavigation() ||
                navigation.contains(event.target)
            ) {
                return;
            }

            closePortalNavigation();
        });
    }

    function createElement(tagName, className, text) {
        var element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (typeof text === "string") {
            element.textContent = text;
        }

        return element;
    }

    function findDirectCardBySelector(container, selector) {
        var cards;
        var index;

        if (!container) {
            return null;
        }

        cards = container.children;

        for (index = 0; index < cards.length; index += 1) {
            if (
                cards[index].classList.contains("large-notice") &&
                cards[index].querySelector(selector)
            ) {
                return cards[index];
            }
        }

        return null;
    }

    function getInitials(name) {
        var parts = (name || "")
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .filter(Boolean);

        if (!parts.length) {
            return "STAR";
        }

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }

    function addMembershipHeading(card) {
        var heading;
        var eyebrow;
        var title;

        if (
            !card ||
            card.querySelector(".star-home-card-heading")
        ) {
            return;
        }

        heading = createElement(
            "header",
            "star-home-card-heading"
        );
        eyebrow = createElement(
            "span",
            "star-home-eyebrow",
            "Membership"
        );
        title = createElement(
            "h2",
            "star-home-card-title",
            "Membership Overview"
        );

        heading.appendChild(eyebrow);
        heading.appendChild(title);
        card.insertBefore(heading, card.firstChild);
    }

    function buildQuickActions(profileCard) {
        var card = createElement(
            "section",
            "star-home-quick-actions"
        );
        var heading = createElement(
            "header",
            "star-home-card-heading"
        );
        var eyebrow = createElement(
            "span",
            "star-home-eyebrow",
            "Shortcuts"
        );
        var title = createElement(
            "h2",
            "star-home-card-title",
            "Quick Actions"
        );
        var links = createElement(
            "div",
            "star-home-quick-actions-grid"
        );
        var sources = [];
        var profileLink;
        var menuSelectors = [
            "#men7 > a",
            "#men4 > a",
            "#men8 > a",
            "#men2 > ul a[href*='enrollments']"
        ];

        if (profileCard) {
            profileLink = profileCard.querySelector(
                'a[href*="/Profile/Update/Form.aspx"]'
            );

            if (profileLink) {
                sources.push({
                    href: profileLink.getAttribute("href"),
                    text: "Update Profile"
                });
            }
        }

        menuSelectors.forEach(function (selector) {
            var source = document.querySelector(selector);
            var label;

            if (!source) {
                return;
            }

            label = (source.textContent || "")
                .replace(/\s+/g, " ")
                .trim();

            if (label === "My Orders") {
                label = "Orders and Balance";
            } else if (label === "Directory") {
                label = "Member Directory";
            } else if (label === "Subscriptions") {
                label = "Member Benefits";
            } else if (label === "My Classes") {
                label = "My Classes";
            }

            sources.push({
                href: source.getAttribute("href"),
                text: label
            });
        });

        heading.appendChild(eyebrow);
        heading.appendChild(title);
        card.appendChild(heading);

        sources.forEach(function (source) {
            var link;

            if (!source.href) {
                return;
            }

            link = createElement(
                "a",
                "star-home-quick-action",
                source.text
            );
            link.href = source.href;
            links.appendChild(link);
        });

        card.appendChild(links);
        return card;
    }

    function initializeEventToggle(eventsCard) {
        var list;
        var items;
        var button;
        var index;

        if (!eventsCard) {
            return;
        }

        list = eventsCard.querySelector(":scope > ul");

        if (!list) {
            return;
        }

        items = Array.prototype.filter.call(
            list.children,
            function (item) {
                return Boolean(item.querySelector("article.recent-blog"));
            }
        );

        for (index = 0; index < items.length; index += 1) {
            items[index].classList.toggle(
                "star-home-event-overflow",
                index >= HOME_EVENT_LIMIT
            );
        }

        button = eventsCard.querySelector(
            ".star-home-events-toggle"
        );

        if (items.length <= HOME_EVENT_LIMIT) {
            if (button) {
                button.remove();
            }
            return;
        }

        if (!button) {
            button = createElement(
                "button",
                "star-home-events-toggle",
                "View All Events"
            );
            button.type = "button";
            button.setAttribute("aria-expanded", "false");
            eventsCard.appendChild(button);

            button.addEventListener("click", function () {
                var expanded = eventsCard.classList.toggle(
                    "star-home-events-expanded"
                );

                button.setAttribute(
                    "aria-expanded",
                    String(expanded)
                );
                button.textContent = expanded
                    ? "Show Fewer Events"
                    : "View All Events";
            });
        }
    }

    function initializeHomeDashboard() {
        var layout = document.getElementById(
            "TwoColumnHomePageLayout"
        );
        var topRow;
        var leftColumn;
        var rightColumn;
        var profileCard;
        var balanceCard;
        var membershipCard;
        var eventsCard;
        var dashboard;
        var hero;
        var identity;
        var avatar;
        var profileName;
        var content;
        var main;
        var sidebar;
        var quickActions;
        var pageTitle;

        if (!layout) {
            document.documentElement.classList.remove(
                "star-home-preparing"
            );
            return;
        }

        if (
            layout.getAttribute("data-star-home-enhanced") ===
            "true"
        ) {
            initializeEventToggle(
                layout.querySelector(".star-home-events-card")
            );
            document.documentElement.classList.add(
                "star-home-ready"
            );
            document.documentElement.classList.remove(
                "star-home-preparing"
            );
            return;
        }

        topRow = document.getElementById("topRow");
        leftColumn = document.getElementById(
            "leftMiddleContent"
        );
        rightColumn = document.getElementById(
            "rightMiddleContent"
        );

        profileCard = findDirectCardBySelector(
            leftColumn,
            'a[href*="/Profile/Update/Form.aspx"]'
        );
        balanceCard = findDirectCardBySelector(
            leftColumn,
            'a[href*="/Sales/Orders.aspx"]'
        );
        membershipCard = findDirectCardBySelector(
            rightColumn,
            ".tile-content"
        );
        eventsCard = findDirectCardBySelector(
            rightColumn,
            "article.recent-blog"
        );

        if (!profileCard && !eventsCard && !membershipCard) {
            document.documentElement.classList.remove(
                "star-home-preparing"
            );
            return;
        }

        layout.setAttribute("data-star-home-enhanced", "true");
        layout.classList.add("star-home-layout-enhanced");

        pageTitle = document.getElementById("pageTitleDiv");
        if (pageTitle && pageTitle.textContent.trim() === "Home") {
            pageTitle.textContent = "Member Dashboard";
        }

        dashboard = createElement("div", "star-home-dashboard");
        hero = createElement("section", "star-home-hero");
        identity = createElement("div", "star-home-identity");
        content = createElement("div", "star-home-content");
        main = createElement("main", "star-home-main");
        sidebar = createElement("aside", "star-home-sidebar");

        if (topRow && topRow.querySelector("*")) {
            topRow.classList.add("star-home-announcements");
            dashboard.appendChild(topRow);
        }

        if (profileCard) {
            profileCard.classList.add("star-home-profile-card");
            profileName = profileCard.querySelector("h2");
            avatar = createElement(
                "div",
                "star-home-avatar",
                getInitials(
                    profileName ? profileName.textContent : ""
                )
            );
            avatar.setAttribute("aria-hidden", "true");
            identity.appendChild(avatar);
            identity.appendChild(profileCard);
            hero.appendChild(identity);
        }

        if (balanceCard) {
            balanceCard.classList.add("star-home-balance-card");
            hero.appendChild(balanceCard);
        }

        if (hero.children.length) {
            dashboard.appendChild(hero);
        }

        if (eventsCard) {
            eventsCard.classList.add("star-home-events-card");
            main.appendChild(eventsCard);
            initializeEventToggle(eventsCard);
        }

        if (membershipCard) {
            membershipCard.classList.add(
                "star-home-memberships-card"
            );
            addMembershipHeading(membershipCard);
            sidebar.appendChild(membershipCard);
        }

        quickActions = buildQuickActions(profileCard);
        sidebar.appendChild(quickActions);

        if (main.children.length) {
            content.appendChild(main);
        }

        if (sidebar.children.length) {
            content.appendChild(sidebar);
        }

        if (content.children.length) {
            dashboard.appendChild(content);
        }

        layout.appendChild(dashboard);

        document.documentElement.classList.add(
            "star-home-ready"
        );
        document.documentElement.classList.remove(
            "star-home-preparing"
        );
    }

    function initializeLoginPlaceholders() {
        var form = document.getElementById(
            "FormContentPlaceHolder_LoginEditForm"
        );
        var controls;

        if (!form) {
            return;
        }

        controls = form.querySelectorAll(
            ".input-control.text, .input-control.password"
        );

        Array.prototype.forEach.call(
            controls,
            function (control) {
                var input = control.querySelector(
                    'input[type="text"], input[type="password"]'
                );
                var placeholderElement = control.querySelector(
                    ".placeholder"
                );
                var placeholderText;

                if (!input || !placeholderElement) {
                    return;
                }

                placeholderText = (
                    placeholderElement.textContent || ""
                )
                    .replace(/\s+/g, " ")
                    .trim();

                if (
                    placeholderText &&
                    !input.getAttribute("placeholder")
                ) {
                    input.setAttribute(
                        "placeholder",
                        placeholderText
                    );
                }

                control.classList.add(
                    "star-native-placeholder"
                );
            }
        );
    }

    function loadSnapEngage() {
        var snapEngageScript;
        var target;

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

        snapEngageScript = document.createElement("script");
        snapEngageScript.type = "text/javascript";
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

        target.appendChild(snapEngageScript);
    }

    function initializePortal() {
        initializePortalNavigation();
        initializeHomeDashboard();
        initializeLoginPlaceholders();
        registerGlobalNavigationEvents();
    }

    function handleAspNetLoad() {
        initializePortalNavigation();
        initializeHomeDashboard();
        initializeLoginPlaceholders();
    }

    if (
        document.getElementById("TwoColumnHomePageLayout") ||
        /(?:^|\/)Default\.aspx$/i.test(window.location.pathname)
    ) {
        document.documentElement.classList.add(
            "star-home-preparing"
        );
    }

    onDocumentReady(function () {
        initializePortal();
        loadSnapEngage();
        registerAspNetLoad(handleAspNetLoad);
    });

    registerAspNetLoad(handleAspNetLoad);
})();
