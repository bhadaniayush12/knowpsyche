# AdSense Ad Placement Policies

## Scope

This file contains the supplied AdSense ad placement material.

These rules matter primarily once ads are implemented, but an agent should also inspect the site for layouts or components that could create future placement violations.

---

# 1. Avoiding accidental clicks

## Encouraging accidental clicks

Publishers must not encourage users to click Google ads in any way.

Ads must not be implemented so they can be mistaken for:

- Menu items
- Navigation
- Download links
- Other site content

Take care when placing site controls near ads, including:

- Links
- Play buttons
- Download buttons
- Previous/Next buttons
- Game windows
- Video players
- Drop-down menus
- Applications

Even an unintended layout that causes accidental clicks can create a policy problem.

## Unnatural attention to ads

Publishers must not bring unnecessary or unnatural attention to Google ads.

Examples in the supplied source include:

- Flashy animations drawing attention to ads
- Arrows or symbols pointing to ads

## Misleading headings above ads

Users must be able to distinguish Google Display ads from normal content.

The supplied source prohibits misleading headings such as:

- "Resources"
- "Helpful links"

The source states that Google ads may only be labeled with:

- "Advertisements"
- "Sponsored Links"

Do not use language asking or encouraging users to click ads.

Examples from the supplied source include messages such as:

- Asking users to click an ad
- Asking users to support the site by clicking
- Asking users to check sponsors in a way that encourages ad clicks

## Aligning images with ads

Publishers may not associate specific images with individual ads in a way that could confuse users into thinking the image is directly related to the advertiser's offering.

## Formatting content to mimic ads

Publishers must not disguise Google ads.

Do not make neighboring content look like the ads in a way that makes them difficult to distinguish.

On non-Google search-results pages, search results and ads must be clearly distinguishable.

## Offering compensation

Offering compensation or incentives for ad clicks is strictly prohibited.

## Distance between ads and Flash games

For Flash gaming sites, the supplied source strongly recommends at least 150 pixels between ads and the edge of a game.

The source notes that a greater distance may be appropriate depending on the game and how it is played.

---

# 2. Ensuring proper ad placement

## Auto-refreshing ads

Publishers must not refresh a page or page element without the user requesting a refresh.

This includes:

- Ads on pages/placements that auto-redirect
- Ads on pages/placements that auto-refresh
- Displaying an ad for a preset period before the user can access content such as a video, game, or download

## Ads in private communications

Google ads must not be placed on screens where private communication is the primary focus.

Examples:

- Direct messages
- Live chats
- Video chats
- Private chatrooms

## Ads on emails

Google ads must not be placed:

- Inside email messages
- Alongside email messages when email is the primary focus of the page

## Ads in software applications

Publishers may not distribute Google ads or AdSense for search boxes through software applications such as:

- Toolbars
- Browser extensions
- Desktop applications

The supplied source states that AdSense code may only be implemented on web-based pages and approved WebView technologies.

## Ads in a new window

Publishers must not:

- Open Google ads in a new window
- Alter the result of clicking an ad

The supplied source notes an exception for AdSense ads served via dynamic allocation through Google Ad Manager.

## Pop-up and pop-under windows

Publishers must not place ads in windows that are not initiated by an intentional user interaction.

Google ads must not be placed in browser windows lacking normal navigation controls such as:

- Back button
- Forward button
- Editable URL field

## Sites with pop-ups or pop-unders

The supplied source states:

- Do not place Google ads on sites with more than three pop-ups.
- If pop-ups exist, they must not interfere with navigation, change user preferences, initiate downloads, or distribute viruses.
- Do not place Google ads on sites that contain or trigger pop-unders.
- Do not allow software/ad networks/affiliates to use methods that trigger pop-ups, modify browser settings, redirect users to unwanted sites, or otherwise interfere with normal navigation.

## Content that Google cannot evaluate

Google may disable ad serving on content that cannot be evaluated.

Examples include:

- Content blocked from Google's crawling by `robots.txt`
- Password-protected content where Google has not been given credentials

## Same page/site as another publisher

The supplied source allows multiple publishers on the same site/page under conditions, including:

- The site complies with Program Policies
- The owner/company gives permission

Each publisher remains responsible for content on the site where its ad code is placed.

## Hosted sites

AdSense code may be placed on pages that comply with Program Policies, including hosted sites.

The source also says the publisher may need access to the site's HTML source code and must ensure AdSense use does not violate the host's terms.

---

## Pre-approval audit implication

If the site does not yet show ads, the agent should not invent ad-placement problems.

Instead, inspect the current UI/code for future risk such as:

- Controls positioned in a way that would make a future ad ambiguous
- Pop-ups/pop-unders or intrusive navigation
- Auto-refresh/auto-redirect behavior
- Login-gated pages that Google would be unable to evaluate
- Misleading labels or site components that could later resemble ads

Classify these as future placement risks rather than claiming an existing AdSense violation when ads are not yet implemented.
