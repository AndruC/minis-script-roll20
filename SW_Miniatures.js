/**
 * Andrew's messing around again.
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const StarWarsMinis = (() => {
  "use strict";

  const version = "0.1.0";

  function whois(playerid) {
    return (getObj("player", playerid) || { get: () => "API" }).get(
      "_displayname"
    );
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

    let gameInProgress = true;

    log({ tokenChanged: token.changed });

    ////////////////////////////

    if (!gameInProgress) return;

    }
  }

  function handleChatMessage(msg_orig) {
    try {
      if (msg_orig.type !== "api") {
        return;
      }

      let args, cmds, who;

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
                  `/w "${who}" ` + `<div>` + `<div>No help yet</div>` + `</div>`
                );
                break;
              case "test":
                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div>` +
                    `<div>Message Received:</div>` +
                    `<div style="margin: 1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>` +
                    JSON.stringify({ msg: msg_orig, version: version }) +
                    `</div>`
                );
                break;
              case "join-team":
                sendChat(
                  "MinisMod",
                  `/w "${who}" ` +
                    `<div>` +
                    `<div>A New Challenger Approaches</div>` +
                    `<div style="margin-top: 1em">Green Team</div>` +
                    `<div><ul><li>${who}</li></ul></div>` +
                    `</div>`
                );
                break;
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
