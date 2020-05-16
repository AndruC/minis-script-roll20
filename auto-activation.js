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

  // Feel free to expand this list as needed. Requires a corresponding badge.
  const TEAM_COLOURS = ["red", "blue", "green", "yellow"];

  // Similarly this can be changed to the name of any available badge
  const ACTIVATED_BADGE = "padlock";

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
    applyMarkersToToken(token, ACTIVATED_BADGE);

    sendChat("MinisAA", `${cap(team) + " token"} moved. `);
  };

  const handleCommandLine = (msg_orig) => {
    // rename to handleCommandLine ?
    let args, cmds, who;
    const { content } = msg_orig;

    try {
      if (msg_orig.type !== "api") {
        return;
      }

      const selected = msg_orig.selected;

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
                    `<div><strong>Join Team:</strong></div>` +
                    `<code>!sw-minis --join-team</code>` +
                    `<div style="margin-top: 1em;">` +
                    `Add the selected tokens to a team. A token can only ` +
                    `be added to one team at a time. Adding a token to a ` +
                    `team will reset its activation status if it has one.` +
                    `</div>` +
                    `<div style="margin-top: 1em;">` +
                    `<div>Valid teams are:</div>` +
                    `<ul>` +
                    TEAM_COLOURS.map((c) => `<li>${c}</li>`).join(" ") +
                    `</ul>` +
                    `</div>` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>Auto Activation:</strong></div>` +
                    `<div style="margin-top: 1em;">` +
                    `Once a token is on a team it will be activated ` +
                    `whenever that token is dropped in a new tile. The ` +
                    `activation status is indicated by the padlock badge ` +
                    `but this can be changed in script by modifying the ` +
                    `ACTIVATED_MARKER value.` +
                    `</div>` +
                    `</div>`
                );
                break;
              case "join-team":
                if (!selected) {
                  sendChat(
                    "MinisMod",
                    `/w "${who}" ` +
                      `<div style="margin-top: 1em;">` +
                      `<div><strong>ERROR: No tokens selected</strong></div>` +
                      `<div>See <code>!sw-minis --help join-team</code></div>` +
                      `</div>`
                  );
                  return;
                }

                if (cmds.length !== 1) {
                  sendChat(
                    "MinisMod",
                    `/w "${who}" ` +
                      `<div style="margin-top: 1em;">` +
                      `<div><strong>Pick your team:</strong></div>` +
                      `[Green](!sw-minis --join-team green)` +
                      `[Red](!sw-minis --join-team red)` +
                      `[Blue](!sw-minis --join-team blue)` +
                      `</div>`
                  );
                  return;
                }

                if (!_.contains(TEAM_COLOURS, cmds[0])) {
                  sendChat(
                    "MinisMod",
                    `/w "${who}" ` +
                      `<div style="margin-top: 1em;">` +
                      `<div><strong>ERROR: No valid team provided</strong></div>` +
                      `<div>See <code>!sw-minis --help join-team</code></div>` +
                      `</div>`
                  );
                  return;
                }

                selected
                  .map((sel) => getObj("graphic", sel._id))
                  .forEach((token) => {
                    let currentMarkers = token.get("statusmarkers").split(",");
                    // remove all team markers and deactivate
                    currentMarkers = _.difference(
                      currentMarkers,
                      TEAM_COLOURS.concat(ACTIVATED_BADGE)
                    );
                    // add new colour
                    currentMarkers = _.union(
                      currentMarkers,
                      [].concat(cmds[0])
                    );
                    // update token
                    token.set("statusmarkers", currentMarkers.join(","));
                  });

                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div>Added ${selected.length} to ${cmds[0]} team</div>`
                );
                break;
              case "new-round":
              default:
                sendChat(
                  "MinisAA",
                  `/w "${who}" ` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>ERROR: Unrecognized command:</strong></div>` +
                    `<code>${content}</code>` +
                    `<div>See <code>!sw-minis --help</code></div>` +
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
        "MinisAA" + version,
        `/w "${who}" ` +
          `<div>` +
          `<div>There was an error while trying to run your command:</div>` +
          `<div style="margin: 4px 12px 12px;"><code>${content}</code></div>` +
          `<div style="margin: 4px 12px 12px;">If you think this is a bug, ` +
          `please report the issue. A stacktrace has been logged to the ` +
          `console.</div>` +
          `</div>`
      );
      e.stack.split(/\\n/).forEach((m) => log(m));
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
