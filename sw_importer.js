/**
 * Minis Importer
 */

////////////////////////////////////////////////////////////////////////////////
// Code starts below
const MinisImporter = (() => {
  "use strict";

  const version = "0.1.0";
  const scriptKey = "!mini-import";
  const NAME = "MinisImporter";

  const IMPORT_DATA = {
    collection: [
      {
        _id: "cs03_darthvader",
        name: "Darth Vader",
        attributes: [
          { name: "cost", value: 55 },
          { name: "hp_max", value: 120 },
          { name: "attack", value: 11 },
          { name: "defense", value: 19 },
          { name: "damage", value: 20 },
        ],
        abilities: [],
      },
    ],
  };

  const IMG_MAP = {
    cs03_darthvader:
      "https://s3.amazonaws.com/files.d20.io/images/133005955/qrIBEGhM9e1VUaME5CyLgQ/thumb.png?15890709021589282453493",
  };

  const ABILITIES = {
    Attack: `**@{character_name} Attacks**: [[1d20+@{attack}]]`,
    Statblock: `&{template:default} {{name=@{character_name} (Cost @{cost})}}  {{Hit Points= @{selected|hp|max|} }} {{Attack= @{attack}}} {{Defense=@{defense}}} {{Damage=@{damage}}}`
  }

  // character entities
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

  function whois(playerid) {
    return (getObj("player", playerid) || { get: () => "API" }).get(
      "_displayname"
    );
  }

  const whisperTo = (who) => (msg) => sendChat(NAME, `/w "${who}" ${msg}`);

  log(`->-> Minis Importer v${version} <-<-`);

  // rename to handleCommandLine ?
  const handleCommandLine = ({ playerid, content }) => {
    const who = whois(playerid);
    const reply = whisperTo(who);

    try {
      let args = content.split(/\s+--/);

      switch (args.shift()) {
        case scriptKey: {
          let cmds;
          while (args.length) {
            cmds = args
              .shift()
              .match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);

            switch (cmds.shift()) {
              case "run":
                log(`${NAME}: Checking import data...`);
                try {
                  let collisions = 0;
                  let missingIMG = 0;
                  let success = 0;
                  const i = IMPORT_DATA.collection.length;
                  log(`${NAME}: ${i} items found.`);
                  if (i === 0) {
                    reply(`<div>No items to import</div>`);
                    return;
                  }

                  while (IMPORT_DATA.collection.length) {
                    let next = IMPORT_DATA.collection.shift();

                    let signature = {
                      _type: "character",
                      name: next.name,
                      avatar: IMG_MAP[next._id],
                    };

                    if (!signature.avatar) {
                      missingIMG = missingIMG + 1;
                      continue;
                    }

                    collisions = collisions + findObjs(signature).length;

                    if (collisions) continue;
                    let attributes = next.attributes;
                    let abilities = next.abilities;
                    let newCharacter = createObj("character", signature);

                    while (attributes.length) {
                      // construct attributes and bind to character
                      let next = attributes.shift();
                      let signature = { _characterid: newCharacter.id };
                      if (next.name.match(/_max/)) {
                        signature.name = next.name.split(/_max/).shift();
                        signature.max = next.value.toString();
                      } else {
                        signature.name = next.name;
                        signature.current = next.value.toString();
                      }
                      let attr = createObj("attribute", signature);
                      log(JSON.stringify(attr));
                    }

                    while (abilities.length) {
                      let next = abilities.shift();
                      
                      
                    }

                    success++;
                  }
                  reply(
                    `<div>Ran import with ${collisions} collisions.</div>` +
                      `<div>Imported ${success} characters.</div>`
                  );
                } catch (e) {
                  reply(
                    `<div>Error w/ import data. Terminating.</div>` +
                      `<div>${e.stack || e}</div>`
                  );
                  return;
                }

                break;
              case "dry-run":
                reply(
                  `<div style="margin-top: 1em;">` +
                    `<div><strong>Minis Importer</strong></div>` +
                    `<div>Performing dry run.</div>` +
                    `</div>`
                );
                break;
              default:
                reply(
                  `<div style="margin-top: 1em;">` +
                    `<div><strong>ERROR: Unrecognized command:</strong></div>` +
                    `<div>See <code>!minis-import --help</code></div>`
                );
                break;
            }
          }
        }
      }
    } catch (e) {
      reply(
        `<div style="margin-top: 1em;">` +
          `<div><strong>ERROR: Script error</strong></div>` +
          `<code>` +
          JSON.stringify({ msg: content, version: version, stack: e.stack }) +
          `</code>`
      );
      log(e.stack);
    }
  };

  const registerEventHandlers = function () {
    on("chat:message", (msg_orig) => {
      if (msg_orig.type !== "api") return;
      handleCommandLine(msg_orig);
    });
  };

  on("ready", function () {
    registerEventHandlers();
  });
})();
