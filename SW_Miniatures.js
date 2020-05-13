/**
 * Minatures Auto-Activation Script
 * Author: AndruC
 * GitHub: https://github.com/AndruC/minis-script-roll20
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const MinisAA = (() => {
  "use strict";

  const version = "0.2.0-dev";

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

  function applyMarkersToToken(token, ...status) {
    let currentMarkers = token.get("statusmarkers").split(",");
    currentMarkers = _.union(currentMarkers, [].concat(status));
    token.set("statusmarkers", currentMarkers.join(","));
  }

  function getTeam(token) {
    let statusmarkers = token.get("statusmarkers").split(",");
    let teams = _.intersection(statusmarkers, TEAM_COLOURS);
    return teams.length ? teams.pop() : null;
  }

  function cap(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  log(`->->-> MinisAA v${version} <-<-<-`);

  const handleGraphicChange = (token) => {
    let validMove;

    validMove =
      (token.changed && token.changed.lastmove) ||
      token.changed.top ||
      token.changed.left;

    if (!validMove) return;

    const team = getTeam(token);

    if (!team) return;

    // activate it
    applyMarkersToToken(token, ACTIVATED_MARKER);

    sendChat("MinisAA", `${cap(team) + " token"} moved. `);
  };

  const handleCommandLine = (msg_orig) => {
    let args, cmds, who;
    const { content } = msg_orig;

    try {
      if (msg_orig.type !== "api") return;

      args = content.split(/\s+--/);

      switch (args.shift()) {
        case "!minis": {
          who = whois(msg_orig.playerid);

          while (args.length) {
            cmds = args
              .shift()
              .match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);

            switch (cmds.shift()) {
              case "help":
                sendChat(
                  "MinisAA",
                  `/w "${who}" ` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>Auto Activation:</strong></div>` +
                    `<div>MinisAA will activate any token that is marked with a colour when it moves</div>` +
                    `</div>`
                );
                break;
              case "join-team":
              case "new-round":
              default:
                sendChat(
                  "MinisAA",
                  `/w "${who}" ` +
                    `<div>` +
                    `<div style="margin-top: 1em;"><strong>Unrecognized command:<strong></div>` +
                    `<div style="margin: 4px 12px 12px;"><code>${content}</code></div>` +
                    `<div>See <code>!minis --help</code></div>``</div>`
                );
                break;
            }
          }
        }
      }
    } catch (e) {
      who = whois(msg_orig.playerid);
      sendChat(
        "MinisAA" + version,
        `/w "${who}" ` +
          `<div>` +
          `<div>There was an error while trying to run your command:</div>` +
          `<div style="margin: 4px 12px 12px;"><code>${content}</code></div>` +
          JSON.stringify({ msg: msg_orig, version: version, stack: e.stack }) +
          `</div>`
      );
    }
  };

  const registerEventHandlers = function () {
    on("chat:message", handleCommandLine);
    on("change:graphic", handleGraphicChange);
  };

  on("ready", function () {
    registerEventHandlers();
  });
})();
