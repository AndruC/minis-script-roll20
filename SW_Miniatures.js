/**
 * Andrew's messing around again.
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const StarWarsMinis = (() => {
  "use strict";

  const version = "0.1.0";
  /**
   * Reserved for config
   */
  const config = {
    Logging: true,
    LogLevel: "debug", // options are 'log'|'debug'

    // TurnCounter = true
  };

  const GameState = {};

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
   * prev:          Graphic - previous state before the graphic moved
   */
  function handleGraphicChange(token, prev) {
    log("SWM: Token changed");

    const diff = _.difference(_.pairs(token.attributes), _.pairs(prev));
    log(Object.getOwnPropertyNames(token));
    log(Object.getOwnPropertyNames(prev));

    log(diff);
    /**
   * Graphic Model
   * see https://wiki.roll20.net/API:Objects#Graphic_.28Token.2FMap.2FCard.2FEtc..29
   * 

      _id: string;
      _pageid: string;

      _type: "graphic", 
      _subtype: SubtypeString,  // "token" | "card"
      _cardid: string,

      left: PixelNumber,
      top: PixelNumber,
      width: PixelNumber,
      height: PixelNumber,

      flipv: boolean,
      fliph: boolean,
      rotation: number,

      name: string;
      controlledby: string;
      layer: string;  // "gmlayer" | "objects" | "map" | "walls"

      isdrawing: boolean,
      imgsrc: string;

      bar1_value: string;
      bar1_max: string;
      bar1_link: string;
      bar2_value: string;
      bar2_max: string;
      bar2_link: string;
      bar3_value: string;
      bar3_max: string;
      bar3_link: string;

      statusmarkers: string,

      showname: boolean,
      showplayers_name: boolean,
      showplayers_bar1: boolean,
      showplayers_bar2: boolean,
      showplayers_bar3: boolean,
      showplayers_aura1: boolean,
      showplayers_aura2: boolean,

      playersedit_name: boolean,
      playersedit_bar1: boolean,
      playersedit_bar2: boolean,
      playersedit_bar3: boolean,
      playersedit_aura1: boolean,
      playersedit_aura2: boolean,

      lastmove: CoordinateString,  // "<PixelNumber>,<PixelNumber>"

     */

    if (false) {
      // Activate unit
      // token.set(`status_padlock`);
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
  };

  on("ready", function () {
    registerEventHandlers();
  });
})();
