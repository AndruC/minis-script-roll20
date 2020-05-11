/**
 * Andrew's messing around again.
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const StarWarsMinis = (() => {
  "use strict";

  const version = "0.2.0";

  const ACTIVATED_MARKER = "padlock";
  const TEAM_COLOURS = ["red", "blue", "green", "yellow"];

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

  const ch = function (c) {
    var entities = {
      "<": "lt",
      ">": "gt",
      "'": "#39",
      "@": "#64",
      "{": "#123",
      "|": "#124",
      "}": "#125",
      "[": "#91",
      "]": "#93",
      '"': "quot",
      "*": "ast",
      "/": "sol",
      " ": "nbsp",
    };

    if (_.has(entities, c)) {
      return "&" + entities[c] + ";";
    }
    return "";
  };

  const _h = {
    join: (...o) => o.join(" "),
    div: (...o) => `<div>${o.join(" ")}</div>`,
    header: (...o) =>
      `<div style="margin-top:1em; margin-bottom:0.5em;">${o
        .map((o) => o.toUpperCase())
        .join(" ")}</div>`,
    desc: (...o) =>
      `<div style="margin: 0.5em 0em 1em 1em;">${o.join(" ")}</div>`,
    code: (...o) => `<code>${o.join(" ")}</code>`,
    b: (...o) => `<strong>${o.join("")}</strong>`,
    opt: (...o) => `${ch("[")}${o.join(` ${ch("|")} `)}${ch("]")}`,
    arg: (...o) => `${ch("<")}${o.join(` ${ch("|")} `)}${ch(">")}`,
  };

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

  // rename to handleCommandLine ?
  function handleChatMessage(msg_orig) {
    let args, cmds, who;

    try {
      if (msg_orig.type !== "api") {
        return;
      }

      const content = msg_orig.content;
      const selected = msg_orig.selected;

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
                      TEAM_COLOURS.concat(ACTIVATED_MARKER)
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
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div style="margin-top: 1em;">` +
                    `<div><strong>ERROR: Unrecognized command:</strong></div>` +
                    `<div>See <code>!sw-minis --help</code></div>` +
                    `<code>${msg_orig.content}</code>``</div>`
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
