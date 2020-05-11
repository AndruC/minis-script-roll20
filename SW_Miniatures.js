/**
 * Andrew's messing around again.
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const StarWarsMinis = (() => {
  "use strict";

  const version = "0.1.1";

  const ACTIVATED_MARKER = "padlock";
  const TEAM_COLOURS = [
    "red",
    "blue",
    "green",
    "brown",
    "purple",
    "pink",
    "yellow",
  ];

  function whois(playerid) {
    return (getObj("player", playerid) || { get: () => "API" }).get(
      "_displayname"
    );
  }

  function applySetMarkerToToken(token, status) {
    let currentMarkers = token.get("statusmarkers").split(",");
    currentMarkers = _.union(currentMarkers, [].concat(status));
    token.set("statusmarkers", currentMarkers.join(","));
  }

  function isInBattle(token) {
    let statusmarkers = token.get("statusmarkers").split(",");
    return _.intersection(statusmarkers, TEAM_COLOURS).length > 0;
  }

  function getTeam(token) {
    if (!isInBattle(token)) return;

    const word = _.intersection(
      token.get("statusmarkers").split(","),
      TEAM_COLOURS
    ).pop();

    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  log(``);
  log(`-==================-`);
  log(`-=> SWMjs v${version} <=-`);
  log(`-==================-`);
  log(``);

  /**
   * this function gets called on any move so filter actions appropriately
   *
   * token:   Graphic - current state of the graphic moved
   * prev:    Attributes - previous attributes state before the graphic moved
   */
  function handleGraphicChange(token, prev) {
    log("SWM: Token changed");

    let validMove,
      gameInProgress = true;

    log({ tokenChanged: token.changed });

    ////////////////////////////

    if (!gameInProgress) return;

    validMove =
      (token.changed && token.changed.lastmove) ||
      token.changed.top ||
      token.changed.left;

    if (validMove) {
      let ctx;
      try {
        ctx = {
          changeSet: token.changed,
          team: getTeam(token),
        };
      } catch (e) {
        log("Failed to get context from valid move");
        log({ token, prev });
        log(e.stack);
        return;
      }

      if (ctx.team) {
        // activate it
        applySetMarkerToToken(token, ACTIVATED_MARKER);
        sendChat(
          "MinisMod",
          `<div>` +
            `${ctx.team ? ctx.team + " token" : "Token"} moved ` +
            `</div>`,
          null,
          { noarchive: true }
        );
      }
    }
  }

  function handleChatMessage(msg_orig) {
    let args, cmds, who;

    try {
      if (msg_orig.type !== "api") {
        return;
      }

      const content = msg_orig.content;

      args = content.split(/\s+--/);

      switch (args.shift()) {
        case "!sw-minis": {
          who = whois(msg_orig.playerid);

          while (args.length) {
            cmds = args
              .shift()
              .match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);

            log("SWM: Handling chat input");
            log({ who, cmds });

            switch (cmds.shift()) {
              case "help":
                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>Auto Activation:</strong></div>` +
                    `<div>SWMjs will activate any token that is marked with a colour when it moves</div>` +
                    `</div>`
                );
                break;
              case "test":
                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>Message Received:</strong></div>` +
                    `<div style="margin: 1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>` +
                    JSON.stringify({ msg: msg_orig, version: version }) +
                    `</div>`
                );
                break;
              case "join-team":
              case "new-round":
              default:
                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div>` +
                    `<div style="margin-top: 1em;"><strong>Unrecognized command:<strong></div>` +
                    `<div style="margin: 0.1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>` +
                    `</div>`
                );
                break;
            }
          }
        }
      }
    } catch (e) {
      who = whois(msg_orig.playerid);
      sendChat(
        "MinisMod" + version,
        `/w "${who}" ` +
          `<div>` +
          `<div>There was an error while trying to run your command:</div>` +
          `<div style="margin: .1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>` +
          JSON.stringify({ msg: msg_orig, version: version, stack: e.stack }) +
          `</div>`
      );
    }
  }

  const registerEventHandlers = function () {
    on("chat:message", handleChatMessage);
    on("change:graphic", handleGraphicChange);
    if (TokenMod) {
      TokenMod.ObserveTokenChange(handleGraphicChange);
    }
  };

  on("ready", function () {
    registerEventHandlers();
  });
})();
